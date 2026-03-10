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

describe('Upload attachment (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory
    let jwt: JwtService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory]
        }).compile();

        app = moduleRef.createNestApplication();
        studentFactory = moduleRef.get(StudentFactory);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    it('[POST] /attachments', async () => {
        const user = await studentFactory.makePrismaStudent();
        const userId = user.id.toString();
        const accessToken = jwt.sign({ sub: userId });

        const response = await request(app.getHttpServer())
            .post('/attachments')
            .set('Authorization', (`Bearer ${accessToken}`))
            .attach('file', './test/e2e/sample-upload.png');

        expect(response.statusCode).toEqual(201);
    });
})