import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@web/services/auth.service';

/**
 * Hook para login
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
  });
}

/**
 * Hook para obtener perfil del usuario actual
 */
export function useProfile() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    authService.logout();
    queryClient.clear();
    router.push('/auth/login');
  };
}
