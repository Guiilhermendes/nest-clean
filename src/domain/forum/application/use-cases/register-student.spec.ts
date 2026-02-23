import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";
import { RegisterStudentUseCase } from "./register-student";
import { FakeHasher } from "test/cryptography/fake-hasher";

let studentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let sut: RegisterStudentUseCase;

describe('Register Student', () => {
    beforeEach(() => {
        studentsRepository = new InMemoryStudentsRepository();
        fakeHasher = new FakeHasher();
        sut = new RegisterStudentUseCase(studentsRepository, fakeHasher);
    });

    it('should be able to register a new student', async () => {
        const result = await sut.execute({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: '123456'
        });

        expect(result.isRight()).toEqual(true);
        expect(result.value).toEqual({
            student: studentsRepository.items[0]
        })
    });

    it('should hash student pasword upon registration', async () => {
        const password = '123456';
        const result = await sut.execute({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password
        });

        const hashedPassword = await fakeHasher.hash(password);

        expect(result.isRight()).toEqual(true);
        expect(studentsRepository.items[0].password).toEqual(hashedPassword)
    })
})