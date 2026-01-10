import { AllExceptionsFilter } from './all-exceptions.filter';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let replySpy: jest.Mock;
  let mockHttpAdapterHost: any;

  beforeEach(() => {
    replySpy = jest.fn();
    mockHttpAdapterHost = {
      httpAdapter: {
        reply: replySpy,
      },
    };
    filter = new AllExceptionsFilter(mockHttpAdapterHost);
  });

  describe('HttpException handling', () => {
    it('debe capturar ConflictException y devolver respuesta estandarizada', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({ url: '/movements' }),
        }),
      };

      const exception = new ConflictException(
        'El lote ya tiene un movimiento activo'
      );

      filter.catch(exception, mockArgumentsHost);

      expect(replySpy).toHaveBeenCalled();
      const [, body, statusCode] = replySpy.mock.calls[0];

      expect(statusCode).toBe(409);
      expect(body.statusCode).toBe(409);
      expect(body.message).toBe('El lote ya tiene un movimiento activo');
      expect(body.error).toBe('ConflictException');
      expect(body.path).toBe('/movements');
      expect(body.traceId).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('debe devolver 400 para BadRequestException', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({ url: '/movements' }),
        }),
      };

      const exception = new BadRequestException('Datos inválidos');

      filter.catch(exception, mockArgumentsHost);

      const [, body, statusCode] = replySpy.mock.calls[0];

      expect(statusCode).toBe(400);
      expect(body.statusCode).toBe(400);
      expect(body.error).toBe('BadRequestException');
    });

    it('debe incluir traceId único en cada respuesta', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({ url: '/movements' }),
        }),
      };

      const exception1 = new ConflictException('Error 1');
      const exception2 = new ConflictException('Error 2');

      filter.catch(exception1, mockArgumentsHost);
      const traceId1 = replySpy.mock.calls[0][1].traceId;

      replySpy.mockClear();

      filter.catch(exception2, mockArgumentsHost);
      const traceId2 = replySpy.mock.calls[0][1].traceId;

      expect(traceId1).not.toBe(traceId2);
    });

    it('debe incluir timestamp válido en ISO format', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({ url: '/movements' }),
        }),
      };

      const exception = new ConflictException('Test');

      filter.catch(exception, mockArgumentsHost);

      const timestamp = replySpy.mock.calls[0][1].timestamp;
      const timestampDate = new Date(timestamp);

      expect(timestampDate.getTime()).toBeLessThanOrEqual(Date.now());
      expect(timestampDate.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('Generic Error handling', () => {
    it('debe capturar Error genérico y devolver 500', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({ url: '/test' }),
        }),
      };

      const exception = new Error('Error interno inesperado');

      filter.catch(exception, mockArgumentsHost);

      const [, body, statusCode] = replySpy.mock.calls[0];

      expect(statusCode).toBe(500);
      expect(body.statusCode).toBe(500);
      expect(body.message).toBe('Error interno inesperado');
      expect(body.error).toBe('Error');
    });
  });

  describe('Path handling', () => {
    it('debe capturar el path correcto de la solicitud', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({
            url: '/movements/12345/close',
          }),
        }),
      };

      const exception = new BadRequestException('Test');
      filter.catch(exception, mockArgumentsHost);

      const [, body] = replySpy.mock.calls[0];
      expect(body.path).toBe('/movements/12345/close');
    });

    it('debe manejar URLs con query parameters', () => {
      const mockArgumentsHost: any = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue({}),
          getRequest: jest.fn().mockReturnValue({
            url: '/paddocks?farmId=farm-123&status=active',
          }),
        }),
      };

      const exception = new BadRequestException('Test');
      filter.catch(exception, mockArgumentsHost);

      const [, body] = replySpy.mock.calls[0];
      expect(body.path).toBe('/paddocks?farmId=farm-123&status=active');
    });
  });
});
