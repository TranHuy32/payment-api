import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const PORT = process.env.PORT ? process.env.PORT : 3001
  await app.listen(PORT);
  console.log("listening on port: " + PORT);

}
bootstrap();
