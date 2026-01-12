"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DecisionTodayResponse, DecisionTodayResponseSchema } from "@shared/index";

/**
 * Página "Decision Today": Orquesta acciones diarias a partir del dashboard.
 * - Consume SOLO GET /dashboard/:farmId/decision-today
 * - Renderiza confidenceLevel, explainability y actionChecklist
 * - Mapea CTAs con recommendedHerdId, recommendedPaddockId y activeMovementId
 * - Maneja toasts vía query params (?toast=...&status=...)
 * - Normalización defensiva para campos opcionales
 */
export default function DecisionTodayPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmId = params.id;

  // Estado UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Datos de dashboard
  const [dashboard, setDashboard] = useState<DecisionTodayResponse | null>(null);

  // Cargar dashboard
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/${farmId}/decision-today`,
          { headers }
        );
        if (!res.ok) throw new Error("No se pudo cargar el dashboard");
        const data = await res.json();
        
        // Validar y normalizar con Zod
        const parsed = DecisionTodayResponseSchema.safeParse(data);
        if (!parsed.success) {
          console.error("DecisionTodayResponse no cumple contrato", parsed.error.format());
          setError("La respuesta del servidor no cumple el contrato esperado");
          return;
        }
        setDashboard(parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error cargando dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [farmId]);

  // Toast por query params
  useEffect(() => {
    const toastMsg = searchParams.get("toast");
    const status = searchParams.get("status") as "success" | "error" | null;
    if (toastMsg) {
      setToast({ type: status === "error" ? "error" : "success", message: decodeURIComponent(toastMsg) });
      // Limpiar URL
      router.replace(`/farms/${farmId}/decision-today`);
    }
  }, [searchParams, router, farmId]);

  // Normalizar confianza a 0..100 usando confidenceScore o mapping del enum
  const confidencePercent = useMemo(() => {
    if (!dashboard) return 0;
    if (typeof dashboard.confidenceScore === "number") {
      return Math.round(Math.max(0, Math.min(100, dashboard.confidenceScore)));
    }
    if (dashboard.confidenceLevel === "HIGH") return 90;
    if (dashboard.confidenceLevel === "MEDIUM") return 60;
    if (dashboard.confidenceLevel === "LOW") return 30;
    return 0;
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando Decision Today...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">🧭 Decision Today</h1>

      {toast && (
        <div
          className={`rounded p-4 border ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Confianza + Explicabilidad */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Nivel de confianza</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div className="h-2 bg-blue-600 rounded" style={{ width: `${confidencePercent}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-800">{confidencePercent}%</span>
        </div>
        {dashboard?.confidenceLevel && (
          <p className="text-xs text-gray-500">Clasificación: {dashboard.confidenceLevel}</p>
        )}
        {dashboard?.explainability && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700">
            {dashboard.explainability}
          </div>
        )}
      </section>

      {/* Checklist de acciones */}
      {dashboard?.actionChecklist && dashboard.actionChecklist.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Lista de acciones</h2>
          <ul className="space-y-2">
            {dashboard.actionChecklist.map((item, idx) => (
              <li key={item.id ?? idx} className="flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex w-5 h-5 items-center justify-center rounded-full border ${item.done ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-300 text-gray-400"}`}
                  aria-label={item.done ? "Hecho" : "Pendiente"}
                >
                  {item.done ? "✓" : ""}
                </span>
                <span className={item.done ? "text-gray-500 line-through" : "text-gray-800"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CTAs */}
      <section className="space-y-6">
        {/* Aforo */}
        <div className="rounded border p-4 bg-white flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">🌱 Registrar Aforo</p>
            <p className="text-xs text-gray-500">Potrero sugerido: {dashboard?.recommendedPaddockId ?? "(no sugerido)"}</p>
          </div>
          <button
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            onClick={() => {
              const pid = dashboard?.recommendedPaddockId;
              if (pid) {
                router.push(`/farms/${farmId}/forage/new?paddockId=${pid}`);
              } else {
                router.push(`/farms/${farmId}/forage/new`);
              }
            }}
          >
            Abrir Formulario
          </button>
        </div>

        {/* Pesaje */}
        <div className="rounded border p-4 bg-white flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">⚖️ Registrar Pesaje</p>
            <p className="text-xs text-gray-500">Lote sugerido: {dashboard?.recommendedHerdId ?? "(no sugerido)"}</p>
          </div>
          <button
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
            onClick={() => {
              const hid = dashboard?.recommendedHerdId;
              if (hid) {
                router.push(`/farms/${farmId}/weighings/new?herdId=${hid}`);
              } else {
                router.push(`/farms/${farmId}/weighings/new`);
              }
            }}
          >
            Abrir Formulario
          </button>
        </div>

        {/* Movimiento (entrada) */}
        <div className="rounded border p-4 bg-white flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">🚚 Registrar Movimiento</p>
            <p className="text-xs text-gray-500">
              Lote: {dashboard?.recommendedHerdId ?? "(no)"} · Potrero: {dashboard?.recommendedPaddockId ?? "(no)"}
            </p>
          </div>
          <button
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            onClick={() => {
              const hid = dashboard?.recommendedHerdId;
              const pid = dashboard?.recommendedPaddockId;
              const qs = [hid ? `herdId=${hid}` : null, pid ? `paddockId=${pid}` : null].filter(Boolean).join("&");
              router.push(qs ? `/farms/${farmId}/movements/new?${qs}` : `/farms/${farmId}/movements/new`);
            }}
          >
            Abrir Formulario
          </button>
        </div>

        {/* Cierre de movimiento activo */}
        <div className="rounded border p-4 bg-white flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">✅ Cerrar Movimiento</p>
            <p className="text-xs text-gray-500">Movimiento activo: {dashboard?.activeMovementId ?? "(no activado)"}</p>
          </div>
          {dashboard?.activeMovementId ? (
            <button
              className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
              onClick={() => router.push(`/farms/${farmId}/movements/${dashboard.activeMovementId}/close`)}
            >
              Abrir Formulario
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sin movimiento activo</span>
              <button
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded border"
                onClick={() => router.push(`/farms/${farmId}/movements/new`)}
              >
                Registrar Movimiento
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
