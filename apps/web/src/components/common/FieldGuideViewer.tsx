'use client';

import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export interface FieldGuideViewerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal de Guía de Campo rápida (Semáforo Voisin + Glosario + Tips)
 */
export default function FieldGuideViewer({ open, onClose }: FieldGuideViewerProps): React.ReactNode {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wide">Guía de Campo</p>
            <h2 className="text-xl font-bold text-gray-900">Metodología Voisin</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Semáforo Voisin */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Semáforo Voisin (Descanso)
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Card color="red" title="Rojo (<30 días)">
                Descanso insuficiente. NO entres aunque veas pasto verde: romperás la llamarada de
                crecimiento.
              </Card>
              <Card color="yellow" title="Amarillo (30-44 días)">
                Aceptable mínimo. Entra solo si es urgente; ideal esperar al óptimo.
              </Card>
              <Card color="green" title="Verde (45-60 días)">
                Punto óptimo de cosecha. Máxima calidad y volumen: momento ideal para entrar.
              </Card>
              <Card color="orange" title="Naranja (>60 días)">
                Pasto envejeciendo. Considera entrada pronta o corte de limpieza.
              </Card>
            </div>
          </section>

          {/* Glosario */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Glosario Rápido
            </h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-800">
              <GlossaryItem term="UA (Unidad Animal)">
                Equivale a 450 kg PV. Permite comparar cargas de distintos lotes.
              </GlossaryItem>
              <GlossaryItem term="Aforo">
                Medición de kg de Materia Seca por hectárea (kg MS/ha) para estimar oferta.
              </GlossaryItem>
              <GlossaryItem term="GDP">
                Ganancia Diaria de Peso. Indicador clave de performance productiva.
              </GlossaryItem>
            </div>
          </section>

          {/* Tips */}
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Tips en Campo
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
              <li>
                Si el descanso está en rojo, NO entres aunque veas pasto verde: es la llamarada de
                crecimiento.
              </li>
              <li>
                Mantén ocupación corta (≤3 días) y alta densidad para mejorar distribución de
                estiércol y pisoteo controlado.
              </li>
              <li>
                Usa aforo reciente para ajustar carga: oferta vs demanda en kg MS.
              </li>
              <li>
                Revisa UA/ha: si supera 4 de forma sostenida, considera ampliar área o dividir lote.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: 'red' | 'yellow' | 'green' | 'orange';
}) {
  const styles: Record<typeof color, string> = {
    red: 'border-red-200 bg-red-50 text-red-800',
    yellow: 'border-amber-200 bg-amber-50 text-amber-800',
    green: 'border-green-200 bg-green-50 text-green-800',
    orange: 'border-orange-200 bg-orange-50 text-orange-800',
  };

  return (
    <div className={`border rounded-lg p-3 ${styles[color]}`}>
      <p className="font-semibold">{title}</p>
      <p className="text-sm mt-1 leading-5">{children}</p>
    </div>
  );
}

function GlossaryItem({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="font-semibold text-gray-900">{term}</p>
      <p className="text-sm mt-1 text-gray-700 leading-5">{children}</p>
    </div>
  );
}
