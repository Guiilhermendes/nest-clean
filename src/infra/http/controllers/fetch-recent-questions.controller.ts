import { Controller, Get, HttpCode, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/Auth/jwt-auth.guard";
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe";
import { PrismaService } from "@/infra/prisma/prisma.service";
import z from "zod";

const pageQueryParamSchema = z.coerce.number().min(1).optional().default(1);
const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class FetchRecentQuestionsController {
    constructor(private prisma: PrismaService) {}

    @Get()
    @HttpCode(200)
    async handle(@Query('page', queryValidationPipe) page: PageQueryParamSchema) {
        const perPage = 20;

        const questions = await this.prisma.question.findMany({
            take: perPage,
            skip: (page - 1) * perPage,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return { questions }
    }
}