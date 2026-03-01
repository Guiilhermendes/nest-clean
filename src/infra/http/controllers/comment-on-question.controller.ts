import { BadRequestException, Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { CurrentUser } from "@/infra/Auth/current-user-decorator";
import type { UserPayload } from "@/infra/Auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import z from "zod";
import { CommentOnQuestionUseCase } from "@/domain/forum/application/use-cases/comment-on-question";

const commentOnQuestionBodySchema = z.object({
    content: z.string()
});

const bodyValidationPipe = new ZodValidationPipe(commentOnQuestionBodySchema);

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
    constructor(private commentOnQuestionUseCase: CommentOnQuestionUseCase) {}

    @Post()
    @HttpCode(201)
    async handle(
        @Body(bodyValidationPipe) body: CommentOnQuestionBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('questionId') questionId: string
    ) {
        const { content } = body;
        const { sub: userId } = user;

        const result = await this.commentOnQuestionUseCase.execute({
            authorId: userId,
            questionId,
            content
        });

        if (result.isLeft()) throw new BadRequestException();
    }
}