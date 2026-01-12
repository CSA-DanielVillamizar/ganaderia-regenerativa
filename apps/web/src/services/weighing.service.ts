/**
 * Servicio para operaciones de Pesaje
 */

export interface CreateWeighingRequest {
  farmId: string;
  herdId: string;
  weighDate: string; // YYYY-MM-DD
  numberOfAnimals: number;
  totalWeightKg: number;
}

export interface WeighingResponse {
  id: string;
  farmId: string;
  herdId: string;
  weighDate: string;
  numberOfAnimals: number;
  totalWeightKg: number;
  averageWeightKg: number;
  gainSinceLastWeighing?: number;
  gainPerDay?: number;
  newHerdUA: number;
}

export async function createWeighing(
  request: CreateWeighingRequest
): Promise<WeighingResponse> {
  // Transformar al DTO backend (CreateWeighingDto)
  const payload = {
    herdId: request.herdId,
    weight: request.totalWeightKg,
    animalCount: request.numberOfAnimals,
    // Opcionales soportados por backend si se requiere
    // notes: undefined,
    // method: 'SCALE',
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weighings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error registrando pesaje: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calcular peso promedio
 */
export function calculateAverageWeight(
  totalWeightKg: number,
  numberOfAnimals: number
): number {
  if (numberOfAnimals <= 0) return 0;
  return totalWeightKg / numberOfAnimals;
}

/**
 * Calcular UA a partir de peso
 */
export function calculateUA(weightKg: number, refWeight: number = 450): number {
  return weightKg / refWeight;
}
