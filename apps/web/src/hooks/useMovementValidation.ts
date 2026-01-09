import { useState, useCallback } from 'react';
import { movementService } from '@web/services/api.service';
import { notificationService } from '@web/services/notification.service';

/**
 * Hook para validaciones en tiempo real al crear movimientos
 * Verifica si un lote ya tiene movimiento activo, si un potrero está ocupado, etc.
 */
export function useMovementValidation() {
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<{
    herdHasActiveMovement?: boolean;
    paddockOccupied?: boolean;
    message?: string;
    isValid: boolean;
  }>({ isValid: true });

  /**
   * Validar si un lote tiene movimiento activo
   * @param herdId - ID del lote a validar
   */
  const validateHerdNotActive = useCallback(async (herdId: string) => {
    if (!herdId) {
      setValidation({ isValid: true });
      return true;
    }

    setLoading(true);
    try {
      const response = await movementService.list({
        herdId,
        status: 'ACTIVE',
        page: 1,
        limit: 1,
      });

      const hasActive = response.data?.data?.length > 0;

      setValidation({
        herdHasActiveMovement: hasActive,
        isValid: !hasActive,
        message: hasActive
          ? `⚠️ El lote seleccionado ya tiene un movimiento activo. Debe cerrarlo antes de crear uno nuevo.`
          : undefined,
      });

      return !hasActive;
    } catch (error: any) {
      console.error('Error validating herd:', error);
      // Si hay error, permitir continuar (el servidor validará)
      setValidation({ isValid: true });
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validar si un potrero está ocupado
   * @param paddockId - ID del potrero a validar
   */
  const validatePaddockNotOccupied = useCallback(async (paddockId: string) => {
    if (!paddockId) {
      setValidation(prev => ({ ...prev, paddockOccupied: false }));
      return true;
    }

    setLoading(true);
    try {
      const response = await movementService.list({
        paddockId,
        status: 'ACTIVE',
        page: 1,
        limit: 1,
      });

      const isOccupied = response.data?.data?.length > 0;
      const occupyingHerd = response.data?.data?.[0]?.herd?.name;

      setValidation(prev => ({
        ...prev,
        paddockOccupied: isOccupied,
        message: isOccupied
          ? `⚠️ El potrero seleccionado ya está ocupado por: ${occupyingHerd}`
          : undefined,
      }));

      return !isOccupied;
    } catch (error: any) {
      console.error('Error validating paddock:', error);
      setValidation(prev => ({ ...prev, paddockOccupied: false }));
      return true;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validar ambos (lote y potrero) en paralelo
   */
  const validateBoth = useCallback(
    async (herdId: string, paddockId: string) => {
      const [herdValid, paddockValid] = await Promise.all([
        validateHerdNotActive(herdId),
        validatePaddockNotOccupied(paddockId),
      ]);

      return herdValid && paddockValid;
    },
    [validateHerdNotActive, validatePaddockNotOccupied]
  );

  /**
   * Resetear validación
   */
  const reset = useCallback(() => {
    setValidation({ isValid: true });
  }, []);

  return {
    loading,
    validation,
    validateHerdNotActive,
    validatePaddockNotOccupied,
    validateBoth,
    reset,
  };
}
