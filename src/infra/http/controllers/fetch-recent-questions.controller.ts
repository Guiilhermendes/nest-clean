import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/Auth/jwt-auth.guard";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import z from "zod";
import { FetchRecentQuestionsUseCase } from "@/domain/forum/application/use-cases/fetch-recent-questions";
import { QuestionPresenter } from "../presenters/question-presenter";

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(private fetchRecentQuestions: FetchRecentQuestionsUseCase) {}

    @Get()
    @HttpCode(200)
    async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
        const result = await this.fetchRecentQuestions.execute({ page });

        if (result.isLeft()) {
            throw new Error();
        }

        const { questions } = result.value;
        return { questions: questions.map(QuestionPresenter.toHttp) }
    }
}