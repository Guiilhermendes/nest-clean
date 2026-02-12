import { AppModule } from "@/app.module";
import { PrismaService } from "@/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe('Fetch recent questions (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);

        await app.init();
    });

    test('[GET] /questions', async () => {
        const email = 'johndoe@example.com';
        const password = '123456';

        const user = await prisma.user.create({
            data: {
                name: 'John Doe',
                email,
                password: await hash(password, 8)
            }
        });

        const { body } = await request(app.getHttpServer()).post('/sessions').send({
            email,
            password: '123456'
        });

        await prisma.question.createMany({
            data: [
                {
                    title: 'Question 01',
                    slug: 'Question-01',
                    content: 'Question content',
                    authorId: user.id
                },
                {
                    title: 'Question 02',
                    slug: 'Question-02',
                    content: 'Question content',
                    authorId: user.id
                }
            ]
        })

        const response = await request(app.getHttpServer())
            .get('/questions')
            .set('Authorization', (`Bearer ${body.access_token}`))
            .send();

        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            questions: [
                expect.objectContaining({ title: 'Question 01' }),
                expect.objectContaining({ title: 'Question 02' }),
            ]
        })
    });
});