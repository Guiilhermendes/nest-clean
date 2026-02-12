import { Body, Controller, HttpCode, Post, UseGuards, UsePipes } from "@nestjs/common";
import { CurrentUser } from "src/Auth/current-user-decorator";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";
import type { UserPayload } from "src/Auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import z from "zod";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string()
});

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(private prisma: PrismaService) {}

    @Post()
    @HttpCode(201)
    @UsePipes(new ZodValidationPipe(createQuestionBodySchema))
    async handle(
        @Body() body: CreateQuestionBodySchema,
        @CurrentUser() user: UserPayload
    ) {
        const { title, content } = body;
        const { sub: userId } = user;
        const slug = this.convertToSlug(title);

        await this.prisma.question.create({
            data: {
                authorId: userId,
                title,
                content,
                slug
            }
        });
    }

    private convertToSlug(title: string): string {
        return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    }
}