import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { AuthenticateStudentUseCase } from "./authenticate-student";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { makeStudents } from "test/factories/make-students";

let studentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe('Authenticate Student', () => {
    beforeEach(() => {
        studentsRepository = new InMemoryStudentsRepository();
        fakeHasher = new FakeHasher();
        fakeEncrypter = new FakeEncrypter();
        sut = new AuthenticateStudentUseCase(studentsRepository, fakeHasher, fakeEncrypter);
    });

    it('should be able to authenticate a student', async () => {
        const email = 'johndoe@example.com';
        const password = '123456';

        const student = makeStudents({
            email,
            password: await fakeHasher.hash(password)
        });
        studentsRepository.items.push(student);

        const result = await sut.execute({
            email,
            password
        });

        expect(result.isRight()).toEqual(true);
        expect(result.value).toEqual({
            accessToken: expect.any(String)
        });
    });
});