"use client";

import { Modal } from "./modal";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm">
      <p className="text-sm text-muted leading-[1.55] mb-6">{message}</p>
      <div className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          loading={loading}
          className={destructive ? "!bg-danger !text-white !border-transparent" : ""}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
