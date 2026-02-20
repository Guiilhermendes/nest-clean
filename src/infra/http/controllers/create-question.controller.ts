import { Body, Controller, HttpCode, Post, UseGuards, UsePipes } from "@nestjs/common";
import { CurrentUser } from "@/infra/Auth/current-user-decorator";
import { JwtAuthGuard } from "@/infra/Auth/jwt-auth.guard";
import type { UserPayload } from "@/infra/Auth/jwt.strategy";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import z from "zod";
import { CreateQuestionUseCase } from "@/domain/forum/application/use-cases/create-question";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string()
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private createQuestion: CreateQuestionUseCase) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createQuestionBodySchema))
    async handle(
        @Body() body: CreateQuestionBodySchema,
        @CurrentUser() user: UserPayload
    ) {
        const { title, content } = body;
        const { sub: userId } = user;

        await this.createQuestion.execute({
            authorId: userId,
            title,
            content,
            attachmentsIds: []
        })
    }
}