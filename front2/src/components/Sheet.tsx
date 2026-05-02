import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal genérico — overlay escuro + card centralizado.
 * Em mobile vira full-height bottom sheet via maxHeight 90%.
 * Versão simples; mais tarde podemos trocar por @gorhom/bottom-sheet
 * pra ganhar gestos de drag-to-dismiss.
 */
export function Sheet({ visible, onClose, children }: SheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/60 justify-end sm:justify-center px-4 py-6"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-bg-elev border border-border rounded-lg max-h-[90%] w-full self-center"
          style={{ maxWidth: 520 }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
