/**
 * Servicio para operaciones de Movimiento
 */

export interface CreateMovementRequest {
  farmId: string;
  herdId: string;
  paddockId: string;
  entryDate: string; // YYYY-MM-DD
  estimatedExitDate: string; // YYYY-MM-DD
}

export interface MovementResponse {
  id: string;
  farmId: string;
  herdId: string;
  paddockId: string;
  entryDate: string;
  estimatedExitDate: string;
  actualExitDate?: string;
  status: 'ACTIVE' | 'CLOSED';
  occupancyDays?: number;
  restDays?: number;
}

export interface CloseMovementRequest {
  exitDate: string;
  notes?: string;
}

export async function createMovement(
  request: CreateMovementRequest
): Promise<MovementResponse> {
  // Transformar al DTO backend (CreateMovementDto)
  const payload = {
    herdId: request.herdId,
    paddockId: request.paddockId,
    type: 'ENTRY' as const,
    entryDate: `${request.entryDate}T00:00:00.000Z`,
    exitDate: `${request.estimatedExitDate}T00:00:00.000Z`,
    // notes: undefined,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/movements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Error registrando movimiento: ${response.statusText}`
    );
  }

  return response.json();
}

export async function closeMovement(
  movementId: string,
  request: CloseMovementRequest
): Promise<MovementResponse> {
  // Backend solo acepta { exitDate }
  const payload = {
    exitDate: `${request.exitDate}T00:00:00.000Z`,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/movements/${movementId}/close`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || `Error cerrando movimiento: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Calcular días de ocupación
 */
export function calculateOccupancyDays(
  entryDate: string,
  exitDate: string
): number {
  const entry = new Date(entryDate);
  const exit = new Date(exitDate);
  const diffMs = exit.getTime() - entry.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calcular fecha de salida estimada
 */
export function calculateEstimatedExit(
  entryDate: string,
  minimumRestDays: number
): string {
  const entry = new Date(entryDate);
  const exit = new Date(entry);
  exit.setDate(exit.getDate() + minimumRestDays);
  return exit.toISOString().split('T')[0];
}

/**
 * Formatear fecha para display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
