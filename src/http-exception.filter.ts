import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Dış dünyaya dönecek standart hata şablonumuz
    response
      .status(status)
      .json({
        basari: false,
        durumKodu: status,
        mesaj: exceptionResponse.message || exceptionResponse,
        yol: request.url,
        zaman: new Date().toISOString(),
      });
  }
}