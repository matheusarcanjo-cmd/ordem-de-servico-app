'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/** Sino com badge de OS pendentes. Atualiza a cada 30 s. */
export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = () =>
      fetch('/api/pendentes')
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) => setCount(d.count))
        .catch(() => {});
    fetchCount();
    const t = setInterval(fetchCount, 30_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Link
      href="/dashboard?status=pendente"
      className="relative rounded-full p-2 text-zinc-300 hover:bg-asfalto-claro hover:text-white"
      title={count > 0 ? `${count} requisição(ões) pendente(s)` : 'Sem pendências'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 01-3.4 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-faixa px-1 text-[11px] font-bold text-asfalto">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
