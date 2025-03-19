import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

async function start() {
  try {
    const PORT = process.env.PORT || 3001;
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
      .setTitle('Trash Talking Platform')
      .setDescription('Project')
      .setVersion('1.0.0')
      .addTag('NestJS, Postgress, Sequelize')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/', app, document);

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());

    class CustomSocketAdapter extends IoAdapter {
      createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, {
          cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Authorization', 'Content-Type'],
          },
        });
        return server;
      }
    }

    app.useWebSocketAdapter(new CustomSocketAdapter(app));

    await app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.log('❌ Server error:', error);
  }
}

start();
