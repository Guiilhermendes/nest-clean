import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@/infra/app.module";
import request from "supertest";
import { StudentFactory } from "test/factories/make-students";
import { JwtService } from "@nestjs/jwt";
import { DatabaseModule } from "@/infra/database/database.module";
import { Uploader } from "@/domain/forum/application/storage/uploader";
import { FakeUploader } from "test/storage/fake-uploader";

describe('Upload attachment (E2E)', () => {
    let app: INestApplication;
    let studentFactory: StudentFactory
    let jwt: JwtService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule, DatabaseModule],
            providers: [StudentFactory]
        })
        .overrideProvider(Uploader)
        .useClass(FakeUploader)
        .compile();

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
        expect(response.body).toEqual({
            attachmentId: expect.any(String)
        })
    });
})