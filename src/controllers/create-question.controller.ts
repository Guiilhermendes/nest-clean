import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/Auth/jwt-auth.guard";

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor() {}

    @Post()
    async handle() {
        return "Ok"
    }
}