import { BadRequestException, Controller, Get, HttpCode, Param, Query } from "@nestjs/common";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import z from "zod";
import { FetchQuestionCommentsUseCase } from "@/domain/forum/application/use-cases/fetch-question-comments";
import { CommentWithAuthorPresenter } from "../presenters/comment-with-author-presenter";

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions/:questionId/comments')
export class FetchQuestionCommentsController {
    constructor(private fetchQuestionComments: FetchQuestionCommentsUseCase) {}

    @Get()
    @HttpCode(200)
    async handle(
        @Query('page', queryValidationPipe) page: PageQueryParamSchema,
        @Param('questionId') questionId: string
    ) {
        const result = await this.fetchQuestionComments.execute({ page, questionId });
        if (result.isLeft()) throw new BadRequestException();

        const { comments } = result.value;
        return { comments: comments.map(CommentWithAuthorPresenter.toHttp) }
    }
}