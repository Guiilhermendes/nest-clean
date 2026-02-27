import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-students";

describe('Fetch recent questions (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);

        await app.init();
    });

    test('[GET] /questions', async () => {
        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        for (let i = 1; i <= 2; i++) {
            await questionFactory.makePrismaStudent({
                authorId: user.id,
                title: `Question 0${i}`
            })
        }

        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', (`Bearer ${accessToken}`))
            .send();

        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            questions: [
                expect.objectContaining({ title: 'Question 02' }),
                expect.objectContaining({ title: 'Question 01' }),
            ]
        })
    });
});