/**
 * Esquemas JSON para RxDB
 * Define la estructura de las colecciones locales en IndexedDB
 */

import { RxJsonSchema } from 'rxdb';

/**
 * Esquema para muestras de aforo (pasto disponible)
 */
export const forageSchema: RxJsonSchema<{
  localId: string;
  paddockId: string;
  farmId: string;
  sampleDate: string;
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number;
  kgPerHectare: number;
  category: string;
  status: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}> = {
  title: 'Forage Sample',
  version: 0,
  primaryKey: 'localId',
  type: 'object',
  properties: {
    localId: {
      type: 'string',
      description: 'ID único local generado en cliente',
    },
    paddockId: {
      type: 'string',
      description: 'ID del potrero',
    },
    farmId: {
      type: 'string',
      description: 'ID de la finca',
    },
    sampleDate: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de la muestra',
    },
    heightCm: {
      type: 'number',
      description: 'Altura del pasto en cm',
    },
    sampleWeightKg: {
      type: 'number',
      description: 'Peso de la muestra en kg',
    },
    drymatterPercent: {
      type: 'number',
      description: 'Porcentaje de materia seca',
    },
    kgPerHectare: {
      type: 'number',
      description: 'Kg estimados por hectárea',
    },
    category: {
      type: 'string',
      enum: ['EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE'],
      description: 'Categoría del aforo',
    },
    status: {
      type: 'string',
      enum: ['pending', 'synced', 'failed'],
      description: 'Estado de sincronización',
    },
    remoteId: {
      type: 'string',
      description: 'ID remoto asignado por el servidor',
    },
    lastError: {
      type: 'string',
      description: 'Último error de sincronización',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: [
    'localId',
    'paddockId',
    'farmId',
    'sampleDate',
    'heightCm',
    'sampleWeightKg',
    'drymatterPercent',
    'kgPerHectare',
    'category',
    'status',
    'createdAt',
    'updatedAt',
  ],
};

/**
 * Esquema para movimientos de lotes (entrada a potrero)
 */
export const movementSchema: RxJsonSchema<{
  localId: string;
  herdId: string;
  paddockId: string;
  farmId: string;
  entryDate: string;
  estimatedExitDate: string;
  actualExitDate?: string;
  status: 'ACTIVE' | 'CLOSED';
  syncStatus: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}> = {
  title: 'Movement',
  version: 0,
  primaryKey: 'localId',
  type: 'object',
  properties: {
    localId: {
      type: 'string',
      description: 'ID único local generado en cliente',
    },
    herdId: {
      type: 'string',
      description: 'ID del lote',
    },
    paddockId: {
      type: 'string',
      description: 'ID del potrero',
    },
    farmId: {
      type: 'string',
      description: 'ID de la finca',
    },
    entryDate: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de entrada al potrero',
    },
    estimatedExitDate: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha estimada de salida',
    },
    actualExitDate: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha real de salida (si está cerrado)',
    },
    status: {
      type: 'string',
      enum: ['ACTIVE', 'CLOSED'],
      description: 'Estado del movimiento',
    },
    syncStatus: {
      type: 'string',
      enum: ['pending', 'synced', 'failed'],
      description: 'Estado de sincronización',
    },
    remoteId: {
      type: 'string',
      description: 'ID remoto asignado por el servidor',
    },
    lastError: {
      type: 'string',
      description: 'Último error de sincronización',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: [
    'localId',
    'herdId',
    'paddockId',
    'farmId',
    'entryDate',
    'estimatedExitDate',
    'status',
    'syncStatus',
    'createdAt',
    'updatedAt',
  ],
};

/**
 * Esquema para pesajes de lotes
 */
export const weighingSchema: RxJsonSchema<{
  localId: string;
  herdId: string;
  farmId: string;
  weighDate: string;
  numberOfAnimals: number;
  totalWeightKg: number;
  averageWeightKg: number;
  status: 'pending' | 'synced' | 'failed';
  remoteId?: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}> = {
  title: 'Weighing',
  version: 0,
  primaryKey: 'localId',
  type: 'object',
  properties: {
    localId: {
      type: 'string',
      description: 'ID único local generado en cliente',
    },
    herdId: {
      type: 'string',
      description: 'ID del lote',
    },
    farmId: {
      type: 'string',
      description: 'ID de la finca',
    },
    weighDate: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha del pesaje',
    },
    numberOfAnimals: {
      type: 'number',
      description: 'Cantidad de animales pesados',
    },
    totalWeightKg: {
      type: 'number',
      description: 'Peso total en kg',
    },
    averageWeightKg: {
      type: 'number',
      description: 'Peso promedio por animal',
    },
    status: {
      type: 'string',
      enum: ['pending', 'synced', 'failed'],
      description: 'Estado de sincronización',
    },
    remoteId: {
      type: 'string',
      description: 'ID remoto asignado por el servidor',
    },
    lastError: {
      type: 'string',
      description: 'Último error de sincronización',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: [
    'localId',
    'herdId',
    'farmId',
    'weighDate',
    'numberOfAnimals',
    'totalWeightKg',
    'averageWeightKg',
    'status',
    'createdAt',
    'updatedAt',
  ],
};

/**
 * Esquema para la cola de sincronización
 * Registra todas las operaciones pendientes de subir al servidor
 */
export const syncQueueSchema: RxJsonSchema<{
  id: string;
  entity: 'forage' | 'movement' | 'weighing';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  localId: string;
  remoteId?: string;
  payload: Record<string, any>;
  status: 'pending' | 'synced' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}> = {
  title: 'Sync Queue',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description: 'ID único de la tarea de sync',
    },
    entity: {
      type: 'string',
      enum: ['forage', 'movement', 'weighing'],
      description: 'Tipo de entidad',
    },
    operation: {
      type: 'string',
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      description: 'Tipo de operación',
    },
    localId: {
      type: 'string',
      description: 'ID local de la entidad',
    },
    remoteId: {
      type: 'string',
      description: 'ID remoto de la entidad (si ya fue sincronizada)',
    },
    payload: {
      type: 'object',
      description: 'Datos a enviar al servidor',
    },
    status: {
      type: 'string',
      enum: ['pending', 'synced', 'failed'],
      description: 'Estado de sincronización',
    },
    attempts: {
      type: 'number',
      description: 'Número de intentos de sincronización',
    },
    maxAttempts: {
      type: 'number',
      description: 'Número máximo de intentos permitidos',
    },
    lastError: {
      type: 'string',
      description: 'Último error ocurrido',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: [
    'id',
    'entity',
    'operation',
    'localId',
    'payload',
    'status',
    'attempts',
    'maxAttempts',
    'createdAt',
    'updatedAt',
  ],
};
