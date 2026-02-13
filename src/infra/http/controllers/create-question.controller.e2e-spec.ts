import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import request from "supertest";

describe('Create question (E2E)', () => {
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

    test('[POST] /questions', async () => {
        const email = 'johndoe@example.com';
        const password = '123456';
        const title = 'New question';

        await prisma.user.create({
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

        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', (`Bearer ${body.access_token}`))
            .send({
                title,
                content: 'Question content'
            });

        expect(response.statusCode).toEqual(201)

        const questionOnDatabase = await prisma.question.findFirst({
            where: {
                title
            }
        });

        expect(questionOnDatabase).toBeTruthy();
    });
});