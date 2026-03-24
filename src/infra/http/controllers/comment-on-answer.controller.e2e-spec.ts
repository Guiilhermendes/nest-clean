import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-students'

describe('Comment on answer (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    jwt = moduleRef.get(JwtService)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)

    await app.init()
  })

  test('[POST] /answers/:answesId/comments', async () => {
    const content = 'New comment'

    const user = await studentFactory.makePrismaStudent()
    const userId = user.id.toString()
    const accessToken = jwt.sign({ sub: userId })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: question.id,
    })
    const answesId = answer.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/answers/${answesId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content,
      })

    expect(response.statusCode).toEqual(201)

    const answerOnDatabase = await prisma.comment.findFirst({
      where: {
        content,
      },
    })

    expect(answerOnDatabase).toBeTruthy()
  })
})
