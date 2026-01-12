'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateFarmDtoSchema } from '@ganaderia/shared';
import { farmService } from '@web/services/api.service';
import { Input } from '@web/components/common/Input';
import { Button } from '@web/components/common/Button';
import { Alert } from '@web/components/common/Alert';

export default function NewFarmPage() {
  const router = useRouter();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(CreateFarmDtoSchema) });

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      await farmService.create(data);
      router.push('/farms');
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo crear la finca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Finca</h1>
        <p className="text-gray-600">Registra una finca para comenzar a operar.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <Input
          label="Nombre"
          required
          error={errors.name?.message as string}
          {...register('name')}
        />
        <Input
          label="Ubicación"
          error={errors.location?.message as string}
          {...register('location')}
        />
        <Input
          label="Hectáreas"
          type="number"
          step="0.1"
          error={errors.hectares?.message as string}
          {...register('hectares', { valueAsNumber: true })}
        />

        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={loading}>
            Crear Finca
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
