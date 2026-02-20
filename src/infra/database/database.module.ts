import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaAnswerAttachmentsRepository } from "./prisma/repositories/prisma-answer-attachments-repository";
import { PrismaAnswerCommentsRepository } from "./prisma/repositories/prisma-answer-comments-repository";
import { PrismaAnswersRespository } from "./prisma/repositories/prisma-answers-repository";
import { PrismaQuestionAttachmentsRepository } from "./prisma/repositories/prisma-question-attachments-repository";
import { PrismaQuestionCommentsRepository } from "./prisma/repositories/prisma-question-comments-repository";
import { PrismaQuestionsRepository } from "./prisma/repositories/prisma-questions-repository";
import { QuestionsRepository } from "@/domain/forum/application/repositories/questions-repository";

@Module({
    providers: [
        PrismaAnswerAttachmentsRepository,
        PrismaAnswerCommentsRepository,
        PrismaAnswersRespository,
        PrismaQuestionAttachmentsRepository,
        PrismaQuestionCommentsRepository,
        {
            provide: QuestionsRepository,
            useClass: PrismaQuestionsRepository
        },
        PrismaService
    ],
    exports: [
        PrismaAnswerAttachmentsRepository,
        PrismaAnswerCommentsRepository,
        PrismaAnswersRespository,
        PrismaQuestionAttachmentsRepository,
        PrismaQuestionCommentsRepository,
        QuestionsRepository,
        PrismaService
    ]
})
export class DatabaseModule {}