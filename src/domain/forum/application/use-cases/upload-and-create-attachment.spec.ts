import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-respository";
import { UploadAndCreateAttachmentUseCase } from "./upload-and-create-attachment";
import { FakeUploader } from "test/storage/fake-uploader";
import { InvalidAttachmentTypeError } from "./errors/invalid-attachment-type";

let attachmentsRepository: InMemoryAttachmentsRepository;
let fakeUploader: FakeUploader;
let sut: UploadAndCreateAttachmentUseCase;

describe('Upload and create attachment', () => {
    beforeEach(() => {
        attachmentsRepository = new InMemoryAttachmentsRepository();
        fakeUploader = new FakeUploader();
        sut = new UploadAndCreateAttachmentUseCase(attachmentsRepository, fakeUploader);
    });

    it('should be able to upload and create an attachment', async () => {
        const fileName = 'profile.png';

        const result = await sut.execute({
            fileName,
            fileType: 'image/png',
            body: Buffer.from('')
        });

        expect(result.isRight()).toEqual(true);
        expect(result.value).toEqual({
            attachment: attachmentsRepository.items[0]
        });
        expect(fakeUploader.uploads).toHaveLength(1);
        expect(fakeUploader.uploads[0]).toEqual(
            expect.objectContaining({
                fileName
            })
        );
    });

    it('should not be able to upload an attachment with invalid file type', async () => {
        const fileName = 'profile.mp3';

        const result = await sut.execute({
            fileName,
            fileType: 'audio/mpeg',
            body: Buffer.from('')
        });

        expect(result.isLeft()).toEqual(true);
        expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
    })
})