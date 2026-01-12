/**
 * Servicio para operaciones de Aforo
 */

export interface CreateForageRequest {
  farmId: string;
  paddockId: string;
  sampleDate: string; // YYYY-MM-DD
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number; // 0-100
}

export interface ForageResponse {
  id: string;
  farmId: string;
  paddockId: string;
  sampleDate: string;
  heightCm: number;
  sampleWeightKg: number;
  drymatterPercent: number;
  kgPerHectare: number;
  category: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE';
}

export async function createForage(
  request: CreateForageRequest
): Promise<ForageResponse> {
  // Transformar al DTO backend (CreateForageSampleDto)
  const isoSampleDate = `${request.sampleDate}T00:00:00.000Z`;
  const kgPerHectare = calculateKgPerHectare(
    request.sampleWeightKg,
    request.drymatterPercent
  );

  const payload = {
    paddockId: request.paddockId,
    kgPerHectare,
    dryMatter: request.drymatterPercent,
    sampleDate: isoSampleDate,
    // Campos opcionales soportados por backend si se requiere:
    // freshWeightKg: request.sampleWeightKg,
    // frameAreaM2: 1,
    // notes: undefined,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forage-samples`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error registrando aforo: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calcular kg/ha estimado basado en muestra
 */
export function calculateKgPerHectare(
  sampleWeightKg: number,
  drymatterPercent: number
): number {
  // Factor para marco cuadrado de 1m x 1m (10 es el factor de conversión)
  const sampleWeightGrams = sampleWeightKg * 1000;
  const dryWeight = (sampleWeightGrams / 100) * drymatterPercent;
  return (dryWeight / 100) * 10;
}

/**
 * Categorizar estado del potrero por kg/ha
 */
export function categorizeForage(
  kgPerHectare: number
): 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE' {
  if (kgPerHectare > 3500) return 'EXCELENTE';
  if (kgPerHectare > 2500) return 'BUENO';
  if (kgPerHectare > 1500) return 'REGULAR';
  return 'DEFICIENTE';
}
