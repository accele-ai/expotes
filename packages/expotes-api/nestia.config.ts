import { INestiaConfig } from '@nestia/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import cookieParser from 'cookie-parser';

const NESTIA_CONFIG: INestiaConfig = {
  input: async () => {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.use(cookieParser());

    app.setGlobalPrefix('api');

    return app;
  },
  output: '../expotes-sdk/src',
  clone: true,
  distribute: 'sdk',
};
export default NESTIA_CONFIG;
