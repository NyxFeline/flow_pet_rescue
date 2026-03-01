import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    // CORS
    app.enableCors({
        origin: true,
        credentials: true,
    })

    // Global prefix
    app.setGlobalPrefix('api')

    // Versioning
    app.enableVersioning()

    // Global Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    )

    // Global Exception Filter
    app.useGlobalFilters(new HttpExceptionFilter())

    await app.listen(3000)
}
bootstrap()