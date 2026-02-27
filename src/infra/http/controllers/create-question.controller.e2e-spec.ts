import { AppModule } from "@/infra/app.module";
import { DatabaseModule } from "@/infra/database/database.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { StudentFactory } from "test/factories/make-students";

describe('Create question (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let studentFactory: StudentFactory;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        prisma = moduleRef.get(PrismaService);
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[POST] /questions', async () => {
        const title = 'New question';

        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const response = await request(app.getHttpServer())
            .post('/questions')
            .set('Authorization', (`Bearer ${accessToken}`))
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