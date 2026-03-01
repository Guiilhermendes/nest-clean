import { CurrentUser } from "@/infra/Auth/current-user-decorator";
import type { UserPayload } from "@/infra/Auth/jwt.strategy";
import { BadRequestException, Body, Controller, HttpCode, Param, Put } from "@nestjs/common";
import z from "zod";
import { ZodValidationPipe } from "../pipes/zod-validation-pipe";
import { EditAnswerUseCase } from "@/domain/forum/application/use-cases/edit-answer";

const editAnswerBodySchema = z.object({
    content: z.string()
});

const bodyValidationPipe = new ZodValidationPipe(editAnswerBodySchema);

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('/answers/:id')
export class EditAnswerController {
    constructor(private editAnswer: EditAnswerUseCase) {}

    @Put()
    @HttpCode(204)
    async handle(
        @Body(bodyValidationPipe) body: EditAnswerBodySchema,
        @CurrentUser() user: UserPayload,
        @Param('id') answerId: string
    ) {
        const { content } = body;
        const userId = user.sub

        const result = await this.editAnswer.execute({
            content,
            authorId: userId,
            attachmentsIds: [],
            answerId
        });

        if (result.isLeft()) throw new BadRequestException()
    }
}