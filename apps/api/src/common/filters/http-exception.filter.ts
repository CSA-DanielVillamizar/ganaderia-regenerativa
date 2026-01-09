import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const incomingTraceId = request.headers['x-trace-id'];
    const traceId = Array.isArray(incomingTraceId)
      ? incomingTraceId[0] || randomUUID()
      : incomingTraceId || randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let error: string = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Extraer mensaje legible desde HttpException
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object' &&
        'message' in (exceptionResponse as Record<string, any>)
      ) {
        const msg = (exceptionResponse as Record<string, any>).message;
        message = Array.isArray(msg) ? msg.join(', ') : msg ?? exception.message;
        error = typeof msg === 'string' ? msg : message;
      } else {
        message = exception.message;
        error = message;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.getPrismaErrorMessage(exception.code);
      error = message;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
      error = message;
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      traceId,
    };

    if (status >= 500) {
      this.logger.error(`[${traceId}] ${message}`, exception instanceof Error ? exception.stack : '');
    }

    response.setHeader('x-trace-id', traceId);
    response.status(status).json(errorResponse);
  }

  private getPrismaErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      P2000: 'El valor es muy largo',
      P2001: 'Registro no encontrado',
      P2002: 'Violación de restricción única',
      P2003: 'Error en relación foránea',
      P2004: 'Error en relación',
      P2005: 'Valor inválido',
      P2006: 'Valor proporcionado inválido',
      P2007: 'Faltan datos requeridos',
      P2008: 'Error en parsing',
      P2009: 'Valor no encontrado',
      P2010: 'Fallo al procesar',
      P2011: 'Violación de restricción NOT NULL',
      P2012: 'Faltan valores requeridos',
      P2013: 'Argumento faltante',
      P2014: 'El cambio causaría error',
      P2015: 'Registro relacionado no encontrado',
      P2016: 'Interpretación de filtro fallida',
      P2017: 'Registros relacionados no encontrados',
      P2018: 'Consulta en tiempo de conexión falló',
      P2019: 'Error en el campo',
      P2020: 'Valor fuera de rango',
      P2021: 'Tabla no existe',
      P2022: 'Columna no existe',
      P2023: 'Valor inconsistente',
      P2024: 'Clave foránea fallida',
      P2025: 'Registro requerido no encontrado',
    };

    return messages[code] || 'Error en la base de datos';
  }
}
