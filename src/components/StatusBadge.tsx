import { STATUS_COLOR, STATUS_LABEL, type Status } from '@/lib/types';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
