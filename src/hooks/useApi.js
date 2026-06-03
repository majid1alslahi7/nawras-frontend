import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { actionToast } from '../lib/actionToast';

export function useGetQuery(key, url, options = {}) {
  const { enabled = true, ...queryOptions } = options;
  const queryKey = Array.isArray(key) ? key : [key ?? 'disabled-query'];

  return useQuery({
    queryKey,
    queryFn: async () => { const { data } = await api.get(url); return data; },
    enabled: Boolean(key && url && enabled),
    ...queryOptions,
  });
}

export function useMutate(method, url, options = {}) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (variables) => {
      const targetUrl = variables?.url || url;
      const payload = variables?.url ? variables.data : variables;
      if (!targetUrl) throw new Error('لم يتم تحديد مسار الطلب');

      if (method === 'delete') {
        const { data } = await api.delete(targetUrl, { data: payload });
        return data;
      }

      const { data } = await api[method](targetUrl, payload);
      return data;
    },
    onSuccess: (data) => {
      const successMessage = options.successMessage || data?.message;
      if (successMessage) actionToast.success(successMessage, options.successTitle ? { title: options.successTitle } : undefined);
      if (options.invalidate) {
        (Array.isArray(options.invalidate) ? options.invalidate : [options.invalidate])
          .forEach(q => queryClient.invalidateQueries({ queryKey: [q] }));
      }
      if (options.onSuccess) options.onSuccess(data);
    },
    onError: (error) => {
      actionToast.error(error);
      if (options.onError) options.onError(error);
    },
  });

  return { ...mutation, isLoading: mutation.isPending };
}
