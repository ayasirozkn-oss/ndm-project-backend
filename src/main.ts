import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception.filter'; // Yeni ekledik

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Merkezi Hata Yakalayıcıyı Devreye Sok
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS ayarlarımız (Frontend bağlantısı için hazır)
  app.enableCors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('NDM Project API')
    .setDescription('Görev Yöneticisi Görsel Test Ekranı')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();