'use client';

import { useState, useEffect } from 'react';
import { CreateForageSampleDto, CreateForageSampleDtoSchema } from '@ganaderia/shared';
import { forageService } from '@web/services/api.service';

interface ForageFormProps {
  paddockId: string;
  paddockName: string;
  paddockHectares: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Formulario guiado de aforo forrajero
 *
 * Flujo MVP (4 pasos):
 * 1. Área del marco de muestreo (m²)
 * 2. Peso fresco cortado (kg)
 * 3. % Materia Seca (MS)
 * 4. % Aprovechamiento esperado
 *
 * → Cálculo automático de kg MS/ha disponible
 */
export default function ForageForm({
  paddockId,
  paddockName,
  paddockHectares,
  onSuccess,
  onCancel,
}: ForageFormProps) {
  // Paso 1: Área del marco
  const [frameAreaM2, setFrameAreaM2] = useState('1'); // Default 1m² (marco cuadrado común)

  // Paso 2: Peso fresco
  const [freshWeightKg, setFreshWeightKg] = useState('');

  // Paso 3: % Materia Seca
  const [dryMatterPercent, setDryMatterPercent] = useState('20'); // Default 20% típico

  // Paso 4: % Aprovechamiento
  const [utilizationPercent, setUtilizationPercent] = useState('50'); // Default 50% conservador

  const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cálculo automático de kg MS/ha
  const [kgMSPerHa, setKgMSPerHa] = useState<number | null>(null);
  const [totalAvailableKgMS, setTotalAvailableKgMS] = useState<number | null>(null);

  useEffect(() => {
    if (frameAreaM2 && freshWeightKg && dryMatterPercent && utilizationPercent) {
      // 1. kg MS en la muestra
      const dryKg = parseFloat(freshWeightKg) * (parseFloat(dryMatterPercent) / 100);

      // 2. kg MS por m²
      const dryKgPerM2 = dryKg / parseFloat(frameAreaM2);

      // 3. kg MS por hectárea (10,000 m²)
      const kgMSPerHectare = dryKgPerM2 * 10000;

      // 4. Aplicar % aprovechamiento
      const kgMSAvailable = kgMSPerHectare * (parseFloat(utilizationPercent) / 100);

      setKgMSPerHa(Math.round(kgMSAvailable));
      setTotalAvailableKgMS(Math.round(kgMSAvailable * paddockHectares));
    } else {
      setKgMSPerHa(null);
      setTotalAvailableKgMS(null);
    }
  }, [frameAreaM2, freshWeightKg, dryMatterPercent, utilizationPercent, paddockHectares]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!kgMSPerHa) {
        throw new Error('Complete todos los campos para calcular kg MS/ha');
      }

      const dto: CreateForageSampleDto = {
        paddockId,
        kgPerHectare: kgMSPerHa,
        dryMatter: parseFloat(dryMatterPercent),
        sampleDate: new Date(sampleDate).toISOString(),
        notes: notes || undefined,
        frameAreaM2: parseFloat(frameAreaM2),
        freshWeightKg: parseFloat(freshWeightKg),
        dryMatterPercent: parseFloat(dryMatterPercent),
        utilizationPercent: parseFloat(utilizationPercent),
        kgMSPerHa,
      };

      // Validar con Zod
      CreateForageSampleDtoSchema.parse(dto);

      await forageService.create(dto);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Error al registrar aforo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-1">🌾 Aforo Forrajero Guiado</h3>
        <p className="text-sm text-green-700">
          Potrero: <span className="font-medium">{paddockName}</span> • {paddockHectares} ha
        </p>
      </div>

      {/* Instrucciones del método */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Método de Aforo</h4>
        <ol className="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
          <li>Coloca el marco de muestreo en un área representativa</li>
          <li>Corta todo el forraje dentro del marco al ras del suelo</li>
          <li>Pesa el forraje fresco inmediatamente</li>
          <li>Estima el % de Materia Seca (o usa valor típico 20%)</li>
          <li>Define el % de aprovechamiento esperado por los animales</li>
        </ol>
      </div>

      {/* PASO 1: Área del Marco */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1️⃣ Área del Marco de Muestreo (m²) *
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <button
            type="button"
            onClick={() => setFrameAreaM2('0.25')}
            className={`py-2 px-3 rounded-lg border-2 transition-all ${
              frameAreaM2 === '0.25'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">0.25 m²</div>
            <div className="text-xs text-gray-600">50×50 cm</div>
          </button>
          <button
            type="button"
            onClick={() => setFrameAreaM2('1')}
            className={`py-2 px-3 rounded-lg border-2 transition-all ${
              frameAreaM2 === '1'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">1 m²</div>
            <div className="text-xs text-gray-600">100×100 cm</div>
          </button>
          <button
            type="button"
            onClick={() => setFrameAreaM2('4')}
            className={`py-2 px-3 rounded-lg border-2 transition-all ${
              frameAreaM2 === '4'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-medium">4 m²</div>
            <div className="text-xs text-gray-600">200×200 cm</div>
          </button>
        </div>
        <input
          type="number"
          step="0.01"
          value={frameAreaM2}
          onChange={(e) => setFrameAreaM2(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="O ingresa un valor personalizado"
          required
          min="0.01"
        />
      </div>

      {/* PASO 2: Peso Fresco */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          2️⃣ Peso Fresco Cortado (kg) *
        </label>
        <input
          type="number"
          step="0.01"
          value={freshWeightKg}
          onChange={(e) => setFreshWeightKg(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ej: 3.5"
          required
          min="0.01"
        />
        <p className="text-xs text-gray-500 mt-1">
          Pesa el forraje inmediatamente después del corte
        </p>
      </div>

      {/* PASO 3: % Materia Seca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          3️⃣ Porcentaje de Materia Seca (%) *
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[15, 20, 25, 30].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setDryMatterPercent(value.toString())}
              className={`py-2 rounded-lg border-2 transition-all ${
                dryMatterPercent === value.toString()
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
        <input
          type="number"
          step="0.1"
          value={dryMatterPercent}
          onChange={(e) => setDryMatterPercent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ej: 22"
          required
          min="1"
          max="100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Valores típicos: 15-20% forraje joven | 25-30% forraje maduro
        </p>
      </div>

      {/* PASO 4: % Aprovechamiento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          4️⃣ Porcentaje de Aprovechamiento (%) *
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[40, 50, 60, 70].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setUtilizationPercent(value.toString())}
              className={`py-2 rounded-lg border-2 transition-all ${
                utilizationPercent === value.toString()
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
        <input
          type="number"
          step="1"
          value={utilizationPercent}
          onChange={(e) => setUtilizationPercent(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Ej: 55"
          required
          min="1"
          max="100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Valores típicos: 40-50% conservador | 60-70% intensivo
        </p>
      </div>

      {/* Resultado del Cálculo */}
      {kgMSPerHa && (
        <div className="bg-gradient-to-r from-green-100 to-green-50 border-2 border-green-400 rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-green-700 font-medium mb-1">Forraje Disponible</div>
              <div className="text-4xl font-bold text-green-900">
                {kgMSPerHa.toLocaleString()} kg MS/ha
              </div>
            </div>
            <div className="text-5xl">🎯</div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-300">
            <div>
              <div className="text-xs text-green-600 mb-1">Total en Potrero</div>
              <div className="text-xl font-semibold text-green-900">
                {totalAvailableKgMS?.toLocaleString()} kg MS
              </div>
            </div>
            <div>
              <div className="text-xs text-green-600 mb-1">Días para 30 UA</div>
              <div className="text-xl font-semibold text-green-900">
                {totalAvailableKgMS ? Math.floor(totalAvailableKgMS / (30 * 12)) : 0} días
              </div>
              <div className="text-xs text-gray-600 mt-1">(12 kg MS/UA/día)</div>
            </div>
          </div>
        </div>
      )}

      {/* Fecha de Muestreo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Muestreo</label>
        <input
          type="date"
          value={sampleDate}
          onChange={(e) => setSampleDate(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Condiciones del potrero, estado del pasto, clima..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || !kgMSPerHa}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Aforo'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
