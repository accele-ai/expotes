/* eslint-disable @typescript-eslint/ban-ts-comment */
import { WriteStream } from 'fs';
// import fs, { WriteStream } from 'fs';
// import { resolve } from 'path';
import { Request, Response } from 'express';
// import { chalk } from 'zx-cjs';

// import { HTTP_REQUEST_TIME } from '@/constants/meta.constant';
// import { LOG_DIR } from '@core/constants/path.constant';
// import { REFLECTOR } from '@core/constants/system.constant';
// import { isDev, isTest } from '@core/global/env.global';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  // Inject,
  Logger,
} from '@nestjs/common';
import { getIp } from '@/shared/utils/ip.util';
// import { Reflector } from '@nestjs/core';

// import { getIp } from '@/shared/utils/ip.util';
// import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';

type myError = {
  readonly status: number;
  readonly statusCode?: number;

  readonly message?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private errorLogPipe: WriteStream;

  // constructor(@Inject(REFLECTOR) private reflector: Reflector) {}
  constructor() {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // @ts-expect-error
    if (request.method === 'OPTIONS') {
      // @ts-expect-error
      return response.status(HttpStatus.OK).send();
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception as myError)?.status ||
          (exception as myError)?.statusCode ||
          HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      (exception as any)?.response?.message ||
      (exception as myError)?.message ||
      '';

    // @ts-ignore
    // const url = request.raw.url!;
    // if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
    //   Logger.error(exception, undefined, 'Catch');
    //   console.error(exception);

    //   // if (!isDev) {
    //   // this.errorLogPipe =
    //   //   this.errorLogPipe ??
    //   //   fs.createWriteStream(resolve(LOG_DIR, 'error.log'), {
    //   //     flags: 'a+',
    //   //     encoding: 'utf-8',
    //   //   });

    //   //   this.errorLogPipe.write(
    //   //     `[${new Date().toISOString()}] ${decodeURI(url)}: ${
    //   //       (exception as any)?.response?.message ||
    //   //       (exception as myError)?.message
    //   //     }\n${(exception as Error).stack}\n`,
    //   //   );
    //   // }
    // } else {
    //   const ip = getIp(request);
    //   const logMessage = `IP: ${ip} Error Info: (${status}) ${message} Path: ${decodeURI(
    //     url,
    //   )}`;
    //   // if (isTest) console.log(logMessage);
    //   this.logger.warn(logMessage);
    // }
    const logMessage = `Error Info: (${status}) ${message}`;
    // if () console.log(logMessage);
    this.logger.warn(logMessage);
    // const prevRequestTs = this.reflector.get(HTTP_REQUEST_TIME, request as any);

    // if (prevRequestTs) {
    //   const content = `${request.method} -> ${request.url}`;
    //   Logger.debug(
    //     `--- ResponseError：${content}${chalk.yellow(
    //       ` +${+new Date() - prevRequestTs}ms`,
    //     )}`,
    //     LoggingInterceptor.name,
    //   );
    // }

    const res = (exception as any).response;
    response // @ts-expect-error
      .status(status)
      .type('application/json')
      .send({
        ok: 0,
        code: res?.code || status,
        chMessage: res?.chMessage,
        message:
          (exception as any)?.response?.message ||
          (exception as any)?.message ||
          'Unknown Error',
      });
  }
}
