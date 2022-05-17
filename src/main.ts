import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from './validation.pipe';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Risk management trading tool based on incremental value at risk')
    .setDescription(
      'This api give you the ability to manage the risk of your trading systems by allowing adding new trades on your portfolio depending the value at risk threshold you are ok with',
    )
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./docs/swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('api', app, document);

  if (process.env.NODE_ENV !== 'gen_docs') await app.listen(3000);
}
bootstrap();
