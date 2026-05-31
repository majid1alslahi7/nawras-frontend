import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { toast } from 'sonner';

export function useGetQuery(key, url, options = {}) {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async () => { const { data } = await api.get(url); return data; },
    ...options,
  });
}

export function useMutate(method, url, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables) => { const { data } = await api[method](url, variables); return data; },
    onSuccess: (data) => {
      if (options.successMessage) toast.success(options.successMessage);
      if (options.invalidate) {
        (Array.isArray(options.invalidate) ? options.invalidate : [options.invalidate])
          .forEach(q => queryClient.invalidateQueries({ queryKey: [q] }));
      }
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => { toast.error(error.response?.data?.message || 'حدث خطأ'); if (options.onError) options.onError(error); },
  });
}
