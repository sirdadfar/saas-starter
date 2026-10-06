import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
async function bootstrap(){const app=await NestFactory.create(AppModule);app.use(cookieParser());app.use(helmet());app.enableCors({origin:(process.env.CORS_ORIGINS??'http://localhost:3000').split(',').map(x=>x.trim()),credentials:true});app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));app.useGlobalFilters(new AppExceptionFilter());const doc=new DocumentBuilder().setTitle('SaaS Starter API').setVersion('1.0').addCookieAuth('access_token').addBearerAuth().build();SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,doc));await app.listen(Number(process.env.API_PORT??4000));}
bootstrap();