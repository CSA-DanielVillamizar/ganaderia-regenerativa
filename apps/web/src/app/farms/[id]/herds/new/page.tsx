'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateHerdDtoSchema } from '@shared/index';
import { herdService } from '@web/services/api.service';
import { Input } from '@web/components/common/Input';
import { Button } from '@web/components/common/Button';
import { Alert } from '@web/components/common/Alert';

export default function NewHerdPage() {
  const router = useRouter();
  const params = useParams();
  const farmId = params.id as string;
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateHerdDtoSchema),
    defaultValues: { farmId },
  });

  const onSubmit = async (data: any) => {
    try {
      setError('');
      setLoading(true);
      await herdService.create({
        farmId,
        ...data,
      });
      router.push(`/farms/${farmId}`);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo crear el lote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Lote</h1>
        <p className="text-gray-600">Registra un lote para gestionar pesajes y rotación.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <Input label="Nombre" required error={errors.name?.message as string} {...register('name')} />
        <Input label="Descripción" {...register('description')} />
        <Input
          label="Animales"
          type="number"
          error={errors.animalCount?.message as string}
          {...register('animalCount', { valueAsNumber: true })}
        />
        <Input
          label="Peso inicial (kg)"
          type="number"
          step="0.1"
          error={errors.initialWeight?.message as string}
          {...register('initialWeight', { valueAsNumber: true })}
        />

        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={loading}>
            Crear Lote
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
