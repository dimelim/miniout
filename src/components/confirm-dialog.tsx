import { Button, Dialog } from 'heroui-native';
import { View } from 'react-native';

type ConfirmDialogProps = {
  visible: boolean;
  titulo: string;
  mensaje: string;
  confirmar: string;
  cancelar?: string;
  tono?: 'peligro' | 'normal';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  titulo,
  mensaje,
  confirmar,
  cancelar = 'Cancelar',
  tono = 'peligro',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={visible}
      onOpenChange={(abierto) => {
        if (!abierto) onCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="gap-0">
          <Dialog.Title>{titulo}</Dialog.Title>
          <Dialog.Description>{mensaje}</Dialog.Description>

          <View className="mt-6 gap-2">
            <Button
              size="lg"
              variant={tono === 'peligro' ? 'danger' : 'primary'}
              onPress={onConfirm}
            >
              <Button.Label>{confirmar}</Button.Label>
            </Button>

            <Button size="lg" variant="ghost" onPress={onCancel}>
              <Button.Label>{cancelar}</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
