import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AnswerFactory } from "test/factories/make-answer";
import { AnswerCommentFactory } from "test/factories/make-answer-comment";
import { QuestionFactory } from "test/factories/make-question";
import { StudentFactory } from "test/factories/make-students";

describe('Fetch answer comments (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory;
    let questionFactory: QuestionFactory;
    let answerFactory: AnswerFactory;
    let answerCommentFactory: AnswerCommentFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory, QuestionFactory, AnswerFactory, AnswerCommentFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        jwt = moduleRef.get(JwtService);
        studentFactory = moduleRef.get(StudentFactory);
        questionFactory = moduleRef.get(QuestionFactory);
        answerFactory = moduleRef.get(AnswerFactory);
        answerCommentFactory = moduleRef.get(AnswerCommentFactory);

        await app.init();
    });

    test('[GET] /answers/:answerId/comments', async () => {
        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const question = await questionFactory.makePrismaQuestion({
            authorId: user.id
        });

        const answer = await answerFactory.makePrismaAnswer({
            authorId: user.id,
            questionId: question.id
        })

        for (let i = 1; i <= 2; i++) {
            await answerCommentFactory.makePrismaAnswer({
                authorId: user.id,
                answerId: answer.id,
                content: `Comment 0${i}`
            });
        }

        const response = await request(app.getHttpServer())
            .get(`/answers/${answer.id.toString()}/comments`)
            .set('Authorization', (`Bearer ${accessToken}`))
            .send();

        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            comments: expect.arrayContaining([
                expect.objectContaining({ content: 'Comment 01' }),
                expect.objectContaining({ content: 'Comment 02' }),
            ])
        })
    });
});