import { notFound } from 'next/navigation';
import { createClient, requireUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { StatusBadge } from '@/components/StatusBadge';
import { OsActions } from '@/components/OsActions';
import {
  CAMERAS_LABEL,
  DATA_INICIAL_LABEL,
  STATUS_LABEL,
  TIPO_CURTO,
  TIPO_LABEL,
  type OS,
  type Status,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

const fmtDT = (d: string) => new Date(d).toLocaleString('pt-BR');
const fmtD = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');
const simNao = (v: unknown) => (v ? 'Sim' : 'Não');

function Item({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{rotulo}</p>
      <p className="text-sm text-zinc-900">{valor}</p>
    </div>
  );
}

export default async function OsDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, profile } = await requireUser();
  const supabase = await createClient();

  // RLS garante: Solicitante só acessa OS próprias (retorna vazio caso contrário)
  const { data } = await supabase
    .from('ordens_servico')
    .select(
      `*,
       solicitante:profiles!ordens_servico_solicitante_id_fkey(nome),
       aprovador:profiles!ordens_servico_aprovado_por_fkey(nome)`
    )
    .eq('id', id)
    .maybeSingle();
  if (!data) notFound();
  const os = data as OS;

  const { data: historico } = await supabase
    .from('historico_status')
    .select('*, autor:profiles!historico_status_alterado_por_fkey(nome)')
    .eq('os_id', id)
    .order('alterado_em', { ascending: true });

  const { data: anexos } = await supabase
    .from('anexos')
    .select('*, autor:profiles!anexos_enviado_por_fkey(nome)')
    .eq('os_id', id)
    .order('enviado_em', { ascending: true });

  // Links temporários de download (bucket privado)
  const admin = createAdminClient();
  const anexosComLink = await Promise.all(
    (anexos ?? []).map(async (a) => {
      const { data: signed } = await admin.storage.from('anexos').createSignedUrl(a.caminho, 3600);
      return { ...a, url: signed?.signedUrl ?? '#' };
    })
  );

  const d = os.detalhes as Record<string, unknown>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold uppercase">
              OS-{String(os.numero_os).padStart(4, '0')}
            </h1>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-bold uppercase text-white"
              title={TIPO_LABEL[os.tipo]}>
              {TIPO_CURTO[os.tipo]}
            </span>
            <StatusBadge status={os.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Item rotulo="Solicitante" valor={os.solicitante?.nome} />
            <Item rotulo="CRS" valor={os.crs} />
            <Item rotulo="Extensão aprox." valor={os.extensao_aprox} />
            <Item rotulo="Início desejado" valor={DATA_INICIAL_LABEL[os.data_inicial]} />
            <Item rotulo="Prazo final" valor={fmtD(os.prazo_final)} />
            <Item rotulo="Criada em" valor={fmtDT(os.criado_em)} />
          </div>

          <div className="mt-5 rounded-md border-l-4 border-faixa bg-zinc-50 p-4">
            <h2 className="font-display text-lg font-bold uppercase">{TIPO_LABEL[os.tipo]}</h2>
            {os.tipo === 'FWD' || os.tipo === 'VDR' ? (
              <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {os.tipo === 'FWD' && <Item rotulo="Espaçamento" valor={String(d.espacamento ?? '—')} />}
                {os.tipo === 'VDR' && (
                  <>
                    <Item rotulo="Câmeras" valor={CAMERAS_LABEL[String(d.cameras)] ?? '—'} />
                    <Item rotulo="GPS L1L2" valor={simNao(d.gps_l1l2)} />
                  </>
                )}
                <Item rotulo="Todas as faixas" valor={simNao(d.todas_faixas)} />
                <Item rotulo="Faixas adicionais" valor={simNao(d.faixas_adicionais)} />
                <Item rotulo="Marginais" valor={simNao(d.marginais)} />
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">
                {String(d.detalhamento ?? '').trim() || 'Sem detalhamento informado.'}
              </p>
            )}
          </div>

          {os.aprovado_em && (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm ${
              os.status === 'rejeitada' || os.motivo_rejeicao
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}>
              {os.motivo_rejeicao ? 'Rejeitada' : 'Aprovada'} por <strong>{os.aprovador?.nome}</strong> em{' '}
              {fmtDT(os.aprovado_em)}
              {os.motivo_rejeicao && <> — motivo: {os.motivo_rejeicao}</>}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold uppercase">Histórico da OS</h2>
          <ol className="mt-3 space-y-0">
            {(historico ?? []).map((h, i, arr) => (
              <li key={h.id} className="relative pb-4 pl-6">
                {i < arr.length - 1 && (
                  <span className="absolute left-[7px] top-4 h-full w-0.5 bg-zinc-200" />
                )}
                <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-4 border-faixa bg-asfalto" />
                <p className="text-sm">
                  <strong>{STATUS_LABEL[h.status_novo as Status]}</strong>
                  {h.status_anterior && (
                    <span className="text-zinc-500"> (antes: {STATUS_LABEL[h.status_anterior as Status]})</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">
                  {h.autor?.nome} · {fmtDT(h.alterado_em)}
                  {h.observacao && <> · {h.observacao}</>}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="space-y-6">
        <OsActions
          osId={os.id}
          status={os.status}
          papel={profile.papel}
          souSolicitante={os.solicitante_id === userId}
          solicitanteId={os.solicitante_id}
          userId={userId}
        />

        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-bold uppercase">Anexos</h2>
          {anexosComLink.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">
              Nenhum arquivo foi anexado na abertura desta OS.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {anexosComLink.map((a) => (
                <li key={a.id} className="text-sm">
                  <a href={a.url} className="font-semibold text-blue-700 hover:underline"
                    target="_blank" rel="noreferrer">
                    {a.nome_arquivo}
                  </a>
                  <p className="text-xs text-zinc-500">{a.autor?.nome} · {fmtDT(a.enviado_em)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
