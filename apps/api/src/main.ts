import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./appModule";
import { loadEnv } from "./config/env";

const API_PREFIX = "api/v1";

async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({ origin: true, credentials: true });

  // 명세를 손으로 쓰고 코드와 어긋나게 두지 않는다. (03-tech-stack.md 4장)
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle("나 VS 나 API")
      .setDescription("07-api.md 참고")
      .setVersion("1.0")
      .build(),
  );
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document);

  await app.listen(env.PORT);
  console.log(`API  http://localhost:${env.PORT}/${API_PREFIX}`);
  console.log(`Docs http://localhost:${env.PORT}/${API_PREFIX}/docs`);
}

void bootstrap();
