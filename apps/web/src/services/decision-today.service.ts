/**
 * Servicio para Decision Today API
 * Consume GET /dashboard/:farmId/decision-today
 */

import apiClient, { ApiError } from '@web/lib/api-client';
import { DecisionTodayResponse } from '@shared/index';

export async function getDecisionToday(farmId: string): Promise<DecisionTodayResponse> {
  try {
    const response = await apiClient.get<DecisionTodayResponse>(
      `/dashboard/${farmId}/decision-today`
    );
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}
