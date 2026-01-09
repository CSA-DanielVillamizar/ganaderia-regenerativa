/**
 * EJEMPLO DE INTEGRACIÓN: Usar validaciones en tiempo real en formulario de movimientos
 * 
 * Este archivo muestra cómo integrar useMovementValidation en un formulario de movimientos
 * para validar en tiempo real antes de permitir la sumisión.
 * 
 * NOTAS:
 * - Este es un EJEMPLO / PLANTILLA
 * - Copiar esta lógica al componente real del formulario de movimientos
 * - Adaptar según la estructura actual del formulario
 */

'use client';

import { useState } from 'react';
import { useMovementValidation } from '@web/hooks';
import { notificationService } from '@web/services/notification.service';
import { movementService } from '@web/services/api.service';

interface MovementFormExampleProps {
  farmId: string;
  onSuccess?: () => void;
}

export function MovementFormExample({ farmId, onSuccess }: MovementFormExampleProps) {
  const [formData, setFormData] = useState({
    herdId: '',
    paddockId: '',
    entryDate: new Date().toISOString().split('T')[0],
    initialWeight: '',
  });

  const {
    loading: validating,
    validation,
    validateBoth,
    validateHerdNotActive,
    validatePaddockNotOccupied,
    reset: resetValidation,
  } = useMovementValidation();

  const [submitting, setSubmitting] = useState(false);

  /**
   * Validar cuando el usuario cambia de lote
   */
  const handleHerdChange = async (herdId: string) => {
    setFormData(prev => ({ ...prev, herdId }));

    if (herdId && formData.paddockId) {
      const isValid = await validateBoth(herdId, formData.paddockId);
      if (!isValid) {
        // La notificación ya fue mostrada por validateBoth
        console.warn('Validación fallida:', validation.message);
      }
    } else if (herdId) {
      const isValid = await validateHerdNotActive(herdId);
      if (!isValid && validation.message) {
        notificationService.warning(validation.message);
      }
    }
  };

  /**
   * Validar cuando el usuario cambia de potrero
   */
  const handlePaddockChange = async (paddockId: string) => {
    setFormData(prev => ({ ...prev, paddockId }));

    if (paddockId && formData.herdId) {
      const isValid = await validateBoth(formData.herdId, paddockId);
      if (!isValid) {
        // La notificación ya fue mostrada por validateBoth
        console.warn('Validación fallida:', validation.message);
      }
    } else if (paddockId) {
      const isValid = await validatePaddockNotOccupied(paddockId);
      if (!isValid && validation.message) {
        notificationService.warning(validation.message);
      }
    }
  };

  /**
   * Enviar formulario con validaciones finales
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación final antes de enviar
    if (!validation.isValid) {
      notificationService.error(
        validation.message || 'Por favor, resuelve los conflictos de validación',
        'Validación fallida'
      );
      return;
    }

    setSubmitting(true);
    try {
      // Aquí iría la lógica para crear el movimiento
      // await movementService.create({ ...formData });
      
      notificationService.success(
        'Movimiento creado exitosamente',
        'Éxito'
      );
      
      // Resetear formulario
      setFormData({
        herdId: '',
        paddockId: '',
        entryDate: new Date().toISOString().split('T')[0],
        initialWeight: '',
      });
      resetValidation();
      
      onSuccess?.();
    } catch (error: any) {
      // El interceptor HTTP ya mostró la notificación
      console.error('Error creating movement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      {/* Campo de Lote */}
      <div>
        <label htmlFor="herd" className="block text-sm font-medium text-gray-700">
          Lote *
        </label>
        <select
          id="herd"
          name="herd"
          value={formData.herdId}
          onChange={(e) => handleHerdChange(e.target.value)}
          disabled={validating}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:opacity-50"
        >
          <option value="">Selecciona un lote</option>
          {/* Agregar opciones de lotes aquí */}
        </select>
        {validating && <p className="mt-2 text-sm text-gray-500">Validando...</p>}
      </div>

      {/* Campo de Potrero */}
      <div>
        <label htmlFor="paddock" className="block text-sm font-medium text-gray-700">
          Potrero *
        </label>
        <select
          id="paddock"
          name="paddock"
          value={formData.paddockId}
          onChange={(e) => handlePaddockChange(e.target.value)}
          disabled={validating}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:opacity-50"
        >
          <option value="">Selecciona un potrero</option>
          {/* Agregar opciones de potreros aquí */}
        </select>
        {validating && <p className="mt-2 text-sm text-gray-500">Validando...</p>}
      </div>

      {/* Campo de Fecha */}
      <div>
        <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">
          Fecha de entrada *
        </label>
        <input
          type="date"
          id="entryDate"
          name="entryDate"
          value={formData.entryDate}
          onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Campo de Peso Inicial */}
      <div>
        <label htmlFor="initialWeight" className="block text-sm font-medium text-gray-700">
          Peso inicial (kg)
        </label>
        <input
          type="number"
          id="initialWeight"
          name="initialWeight"
          value={formData.initialWeight}
          onChange={(e) => setFormData(prev => ({ ...prev, initialWeight: e.target.value }))}
          step="0.1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {/* Indicador de estado de validación */}
      {!validation.isValid && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800 font-medium">⚠️ {validation.message}</p>
        </div>
      )}

      {/* Botón de submit */}
      <button
        type="submit"
        disabled={!validation.isValid || submitting || validating}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-blue-700 transition-colors"
      >
        {submitting ? 'Creando...' : 'Crear movimiento'}
      </button>

      {/* Info: El NotificationContainer mostrará errores automáticamente */}
      <p className="text-xs text-gray-500 text-center">
        Las validaciones se ejecutan automáticamente al cambiar campos.
        Los errores aparecerán en la esquina superior derecha.
      </p>
    </form>
  );
}

/**
 * INTEGRACIÓN EN EL LAYOUT
 * 
 * En el componente root o layout principal:
 * 
 * import { NotificationContainer } from '@web/components';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <NotificationContainer />  {/* ← Agregar esto */}
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */

/**
 * FLUJO DE VALIDACIÓN
 * 
 * 1. Usuario selecciona un lote
 *    → handleHerdChange() llama validateHerdNotActive()
 *    → API consulta si hay movimientos ACTIVE para ese lote
 *    → Si hay, validation.isValid = false y se muestra warning
 * 
 * 2. Usuario selecciona un potrero
 *    → handlePaddockChange() llama validatePaddockNotOccupied()
 *    → API consulta si hay movimientos ACTIVE para ese potrero
 *    → Si hay, validation.isValid = false y se muestra warning
 * 
 * 3. Usuario intenta enviar el formulario
 *    → Se verifica validation.isValid
 *    → Si es false, se muestra error y se evita el envío
 *    → Si es true, se envía la creación del movimiento
 * 
 * 4. El notificationService muestra errores automáticamente
 *    → Los errores 400/409/500 son capturados por el interceptor
 *    → Se muestran como notificaciones con traceId
 */

/**
 * MAPEO DE APIS
 * 
 * - useMovementValidation() → Ejecuta movementService.list()
 * - movementService.list() → GET /movements?herdId=x&status=ACTIVE
 * - API response → {data: Movement[], pagination: {...}}
 * - Error response → {statusCode, message, error, traceId, ...}
 * 
 * TODO: Implementar en componente real del formulario
 * TODO: Adaptar selectores de lote y potrero según estructura actual
 * TODO: Agregar validación adicional si es necesario
 */
