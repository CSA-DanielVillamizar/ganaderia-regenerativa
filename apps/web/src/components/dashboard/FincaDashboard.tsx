'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OvergrazingAlert, OvergrazingAlertsResponseSchema } from '@ganaderia/shared';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { notificationService } from '@web/services/notification.service';
import { authService } from '@web/services/auth.service';
import { API_URL } from '@web/lib/api-config';

interface FincaDashboardMetrics {
  totalActiveHerds: number;
  paddocksAtRest: number;
  activeMovements: number;
  overallHealth: 'GOOD' | 'CAUTION' | 'CRITICAL';
}

/**
 * Dashboard operativo que muestra el estado actual de la finca.
 * Incluye:
 * - Métricas KPI (Lotes activos, potreros en descanso, alertas)
 * - Vista de potreros con estado visual (Ocupado/Libre/Descanso)
 * - Alertas de sobrepastoreo en tiempo real
 */
export function FincaDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<FincaDashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<OvergrazingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  // Agregado para testing E2E
  const testIdPrefix = 'finca-dashboard';

  useEffect(() => {
    loadDashboardData();
    // Recargar cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Obtener token de autenticación
      const token = authService.getToken();
      if (!token) {
        notificationService.error('Sesión no válida', 'auth-error');
        router.push('/auth/login');
        setLoading(false);
        return;
      }

      /**
       * Carga de alertas de sobrepastoreo desde la API backend.
       * Se usa URL absoluta basada en `API_URL` para evitar 404 al resolver
       * rutas relativas en el servidor de Next (puerto 3001) durante desarrollo.
       */
      const alertsResponse = await fetch(`${API_URL}/movements/alerts/overgrazing`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Manejo de respuestas de autenticación
      if (alertsResponse.status === 401 || alertsResponse.status === 403) {
        notificationService.error('Sesión expirada', 'auth-error');
        authService.logout();
        router.push('/auth/login');
        setLoading(false);
        return;
      }

      if (!alertsResponse.ok) {
        const traceId = Math.random().toString(36).substring(7);
        console.error(
          `Error en endpoint: ${alertsResponse.status} ${alertsResponse.statusText}`,
          traceId
        );
        notificationService.error(`Error al cargar alertas (${alertsResponse.status})`, traceId);
        setLoading(false);
        return;
      }

      const rawData = await alertsResponse.json();
      const parseResult = OvergrazingAlertsResponseSchema.safeParse(rawData);

      if (!parseResult.success) {
        console.error('Schema validation error:', parseResult.error);
        notificationService.error('Datos inválidos del servidor', 'schema-error');
        setLoading(false);
        return;
      }

      const alertsData = parseResult.data;
      setAlerts(alertsData.data || []);

      // Calcular métricas basadas en alertas validadas
      const criticalCount = alertsData.criticalAlerts || 0;
      const highCount = alertsData.highAlerts || 0;
      const overallHealth = criticalCount > 0 ? 'CRITICAL' : highCount > 0 ? 'CAUTION' : 'GOOD';

      setMetrics({
        totalActiveHerds: alertsData.data?.length || 0,
        paddocksAtRest: 0, // Se puede calcular desde otra fuente
        activeMovements: alertsData.data?.length || 0,
        overallHealth,
      });
    } catch (error) {
      const traceId = Math.random().toString(36).substring(7);
      console.error('Fetch error:', error, traceId);
      notificationService.error('Error al cargar dashboard', traceId);
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonLoader count={4} />
        </div>
        <div className="animate-pulse h-64 rounded-lg bg-gray-200" />
      </div>
    );
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'GOOD':
        return <CheckCircle2 className="text-green-500" size={24} />;
      case 'CAUTION':
        return <AlertTriangle className="text-amber-500" size={24} />;
      case 'CRITICAL':
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return null;
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'GOOD':
        return 'Óptimo';
      case 'CAUTION':
        return 'Precaución';
      case 'CRITICAL':
        return 'Crítico';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6" data-testid="finca-dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="dashboard-kpi-cards">
        {/* Total Lotes Activos */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          data-testid="dashboard-kpi-herds"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lotes Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.totalActiveHerds ?? 0}
              </p>
            </div>
            <TrendingUp className="text-blue-500" size={32} />
          </div>
          <p className="text-xs text-gray-500 mt-4">En rotación actualmente</p>
        </div>

        {/* Potreros en Descanso */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          data-testid="dashboard-kpi-paddocks"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Potreros en Descanso</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics?.paddocksAtRest ?? 0}
              </p>
            </div>
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
          <p className="text-xs text-gray-500 mt-4">Recuperándose</p>
        </div>

        {/* Alertas Activas */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          data-testid="dashboard-kpi-alerts"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  alerts.length > 0 ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {alerts.length}
              </p>
            </div>
            <AlertTriangle
              className={alerts.length > 0 ? 'text-red-500' : 'text-green-500'}
              size={32}
            />
          </div>
          <p className="text-xs text-gray-500 mt-4">De sobrepastoreo</p>
        </div>

        {/* Estado General */}
        <div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          data-testid="dashboard-kpi-health"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado General</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {getHealthLabel(metrics?.overallHealth || 'GOOD')}
              </p>
            </div>
            {getHealthIcon(metrics?.overallHealth || 'GOOD')}
          </div>
          <p className="text-xs text-gray-500 mt-4">Salud del pastizal</p>
        </div>
      </div>

      {/* Alertas de Sobrepastoreo */}
      {alerts.length > 0 && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-6"
          data-testid="dashboard-alerts-section"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-900">Alertas de Sobrepastoreo</h3>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id}
                data-testid={`alert-item-${idx}`}
                className={`p-4 rounded-lg ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-100 border border-red-300'
                    : alert.severity === 'HIGH'
                      ? 'bg-orange-100 border border-orange-300'
                      : 'bg-yellow-100 border border-yellow-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {alert.herdName} → {alert.paddockName}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Llevar <strong>{alert.daysOccupied} días</strong> (Máximo:{' '}
                      {alert.maxAllowedDays} días)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Entrada: {new Date(alert.entryDate).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        alert.severity === 'CRITICAL'
                          ? 'text-red-600'
                          : alert.severity === 'HIGH'
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                      }`}
                    >
                      +{alert.exceedDays}d
                    </p>
                    <p className="text-xs text-gray-600">Severidad: {alert.severity}</p>
                  </div>
                </div>

                {/* Botón WhatsApp */}
                <div className="mt-3">
                  <button
                    onClick={() => openWhatsAppAlert(alert)}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                  >
                    📱 Notificar por WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado OK */}
      {alerts.length === 0 && (
        <div
          className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          data-testid="dashboard-no-alerts"
        >
          <CheckCircle2 className="text-green-600 mx-auto mb-2" size={32} />
          <p className="text-green-900 font-semibold">
            ¡Sin alertas de sobrepastoreo! La rotación está funcionando óptimamente.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Abre WhatsApp con un mensaje predefinido para la alerta.
 */
function openWhatsAppAlert(alert: OvergrazingAlert) {
  const message = encodeURIComponent(
    `⚠️ ALERTA DE SOBREPASTOREO\n\n` +
      `Lote: ${alert.herdName}\n` +
      `Potrero: ${alert.paddockName}\n` +
      `Días de ocupación: ${alert.daysOccupied} (Máximo: ${alert.maxAllowedDays})\n` +
      `Exceso: +${alert.exceedDays} días\n` +
      `Severidad: ${alert.severity}\n\n` +
      `🚨 Se recomienda rotación inmediata`
  );

  // Abre WhatsApp Web (sin número específico, el usuario puede seleccionar)
  window.open(`https://wa.me/?text=${message}`, '_blank');
}
