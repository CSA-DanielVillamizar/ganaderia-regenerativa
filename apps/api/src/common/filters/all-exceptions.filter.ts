import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * Generar UUID v4 sin dependencia externa
 * Para Jest compatibility
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Respuesta estandarizada para errores HTTP
 * Formato: { statusCode, message, error, path, timestamp, traceId }
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  path: string;
  timestamp: string;
  traceId: string;
  details?: Record<string, any>;
}

/**
 * Filtro global de excepciones.
 * Captura TODAS las excepciones (HTTP y no-HTTP) y devuelve un contrato consistente.
 *
 * Uso:
 *  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
 *
 * Ejemplo de respuesta:
 * {
 *   "statusCode": 400,
 *   "message": "Lote ya tiene movimiento activo en este potrero",
 *   "error": "ConflictException",
 *   "path": "/movements",
 *   "timestamp": "2025-01-10T15:30:45.123Z",
 *   "traceId": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
 *   "details": { "herdId": "abc123", "paddockId": "def456" }
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const traceId = generateUUID();
    const timestamp = new Date().toISOString();
    const path = request.url;

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errorType = 'InternalServerError';
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message =
          (exceptionResponse as any).message || 'Error en la solicitud';
        errorType = (exceptionResponse as any).error || 'HttpException';
        // Capturar detalles de validación (ValidationPipe)
        if ((exceptionResponse as any).message instanceof Array) {
          message = (exceptionResponse as any).message[0];
          details = { validationErrors: (exceptionResponse as any).message };
        }
      } else {
        message = exceptionResponse as string;
      }

      errorType = exception.constructor.name;
    } else if (exception instanceof Error) {
      // Error genérico no-HTTP
      message = exception.message || 'Error desconocido';
      errorType = exception.constructor.name;
      this.logger.error(
        `${errorType}: ${message}`,
        exception.stack,
        `TraceId: ${traceId}`,
      );
    } else {
      message = 'Error desconocido';
      errorType = 'UnknownException';
      this.logger.error(
        `Excepción desconocida: ${JSON.stringify(exception)}`,
        `TraceId: ${traceId}`,
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: httpStatus,
      message,
      error: errorType,
      path,
      timestamp,
      traceId,
      ...(details && { details }),
    };

    // Log para debugging
    if (httpStatus >= 500) {
      this.logger.error(`[${traceId}] ${errorResponse.error}: ${message}`);
    } else {
      this.logger.warn(`[${traceId}] ${errorResponse.error}: ${message}`);
    }

    httpAdapter.reply(response, errorResponse, httpStatus);
  }
}
