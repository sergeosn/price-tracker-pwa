import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export function confirmDelete({
  title,
  message,
  onConfirm,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
}): void {
  modals.openConfirmModal({
    title,
    children: <Text size="sm">{message}</Text>,
    labels: { confirm: "Delete", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm,
  });
}
