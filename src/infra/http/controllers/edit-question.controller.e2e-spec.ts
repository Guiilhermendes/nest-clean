import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-students";

describe('Edit question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);
        questionFactory = moduleRef.get(QuestionFactory);

        await app.init();
    });

    test('[PUT] /questions/:id', async () => {
        const title = 'New title';

        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const question = await questionFactory.makePrismaStudent({
            authorId: user.id
        })

        const response = await request(app.getHttpServer())
            .put(`/questions/${question.id.toString()}`)
            .set('Authorization', (`Bearer ${accessToken}`))
            .send({
                title,
                content: 'New content'
            });

        expect(response.statusCode).toEqual(204)

        const questionOnDatabase = await prisma.question.findFirst({
            where: {
                title
            }
        });

        expect(questionOnDatabase).toBeTruthy();
    });
});