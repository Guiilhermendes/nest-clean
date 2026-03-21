import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerAttachmentFactory } from "test/factories/make-answer-attachments";
import { AttachmentFactory } from "test/factories/make-attachment";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-students";

describe('Edit answer (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let attachmentFactory: AttachmentFactory;
    let answerAttachmentFactory: AnswerAttachmentFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AnswerFactory, AttachmentFactory, AnswerAttachmentFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        attachmentFactory = moduleRef.get(AttachmentFactory);
        answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory);

        await app.init();
    });

    test('[PUT] /answers/:id', async () => {
        const content = 'New answer';

        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id
        });

        const answer = await answerFactory.makePrismaAnswer({
            questionId: question.id,
            authorId: user.id
        });

        const answerId = answer.id.toString();

        const attachment1 = await attachmentFactory.makePrismaAttachment();
        const attachment2 = await attachmentFactory.makePrismaAttachment();

        await answerAttachmentFactory.makePrismaQuestionAttachment({
            answerId: answer.id,
            attachmentId: attachment1.id
        });

        await answerAttachmentFactory.makePrismaQuestionAttachment({
            answerId: answer.id,
            attachmentId: attachment2.id
        });

        const attachment3 = await attachmentFactory.makePrismaAttachment();

        const response = await request(app.getHttpServer())
            .put(`/answers/${answerId}`)
            .set('Authorization', (`Bearer ${accessToken}`))
            .send({
                content,
                attachments: [attachment1.id.toString(), attachment3.id.toString()]
            });

        expect(response.statusCode).toEqual(204)

        const answerOnDatabase = await prisma.answer.findFirst({
            where: {
                content
            }
        });

        expect(answerOnDatabase).toBeTruthy();

        const attachmentsOnDataBase = await prisma.attachment.findMany({
            where: {
                answerId: answerOnDatabase?.id
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