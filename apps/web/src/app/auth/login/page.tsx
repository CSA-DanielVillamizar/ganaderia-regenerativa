'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginDtoSchema, LoginDto } from '@ganaderia/shared';
import { Input } from '@web/components/common/Input';
import { Button } from '@web/components/common/Button';
import { Alert } from '@web/components/common/Alert';
import { useLogin } from '@web/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState('');
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginDtoSchema),
    defaultValues: {
      email: 'admin@magrotec.com',
      password: 'Admin123!',
    },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setGlobalError('');
      await loginMutation.mutateAsync(data);
    } catch (error: any) {
      setGlobalError(error.response?.data?.message || 'Error en la autenticación');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-green-700">🐄 Magrotec</h1>
          <p className="text-gray-600 text-sm mt-2">Ganadería Regenerativa Inteligente</p>
        </div>

        {globalError && <Alert type="error" message={globalError} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            loading={loginMutation.isPending}
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">Demo:</p>
          <p>Email: admin@magrotec.com</p>
          <p>Pass: Admin123!</p>
        </div>
      </div>
    </div>
  );
}
