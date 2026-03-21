import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionFactory } from "test/factories/make-question";
import { QuestionAttachmentFactory } from "test/factories/make-question-attachments";
import { StudentFactory } from "test/factories/make-students";

describe('Edit question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let attachmentFactory: AttachmentFactory;
    let questionAttachmentFactory: QuestionAttachmentFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AttachmentFactory, QuestionAttachmentFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);
        questionFactory = moduleRef.get(QuestionFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory);

        await app.init();
    });

    test('[PUT] /questions/:id', async () => {
        const title = 'New title';

        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const attachment1 = await attachmentFactory.makePrismaAttachment();
        const attachment2 = await attachmentFactory.makePrismaAttachment();

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment1.id,
            questionId: question.id
        });

        await questionAttachmentFactory.makePrismaQuestionAttachment({
            attachmentId: attachment2.id,
            questionId: question.id
        });

        const attachment3 = await attachmentFactory.makePrismaAttachment();

        const response = await request(app.getHttpServer())
            .put(`/questions/${question.id.toString()}`)
            .set('Authorization', (`Bearer ${accessToken}`))
            .send({
                title,
                content: 'New content',
                attachments: [attachment1.id.toString(), attachment3.id.toString()]
            });

        expect(response.statusCode).toEqual(204)

        const questionOnDatabase = await prisma.question.findFirst({
            where: {
                title
            }
        });

        expect(questionOnDatabase).toBeTruthy();

        const attachmentsOnDataBase = await prisma.attachment.findMany({
            where: {
                questionId: questionOnDatabase?.id
            }
        });

        expect(attachmentsOnDataBase).toHaveLength(2);
        expect(attachmentsOnDataBase).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: attachment1.id.toString(),
                }),
                expect.objectContaining({
                    id: attachment3.id.toString(),
                })
            ])
        );
    });
});