import { useToast } from 'heroui-native';
import { useCallback } from 'react';

export function useAvisar() {
  const { toast } = useToast();

  return useCallback(
    (mensaje: string) => {
      toast.show({ variant: 'danger', label: mensaje });
    },
    [toast]
  );
}
