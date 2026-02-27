import { INestApplication } from "@nestjs/common";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/infra/app.module";
import request from "supertest";
import { StudentFactory } from "test/factories/make-students";
import { QuestionFactory } from "test/factories/make-question";
import { JwtService } from "@nestjs/jwt";
import { Slug } from "@/domain/forum/enterprise/entities/value-objects/slug";
import { DatabaseModule } from "@/infra/database/database.module";

describe('Get question by slug (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory
    let questionFactory: QuestionFactory;
    let jwt: JwtService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    it('[GET] /question/:slug', async () => {
        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        await questionFactory.makePrismaStudent({
            authorId: user.id,
            title: 'Question 01',
            slug: Slug.create('question-01')
        });

        const response = await request(app.getHttpServer())
            .get('/questions/question-01')
            .set('Authorization', (`Bearer ${accessToken}`))
            .send();

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            question: expect.objectContaining({ title: 'Question 01' }),
        })
    });
})