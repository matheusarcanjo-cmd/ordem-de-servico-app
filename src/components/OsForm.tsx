'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { anexarArquivo, criarOS, editarOS } from '@/actions/os';
import {
  CAMERAS_LABEL,
  DATA_INICIAL_LABEL,
  TIPO_LABEL,
  TIPOS_SIMPLES,
  type Tipo,
} from '@/lib/types';

function SimNao({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex overflow-hidden rounded-md border border-zinc-300">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`flex-1 px-3 py-2 text-sm font-semibold ${
              value === v ? 'bg-asfalto text-white' : 'bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {v ? 'Sim' : 'Não'}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface OsInicial {
  tipo: Tipo;
  crs: string;
  extensao_aprox: string;
  data_inicial: string;
  prazo_final: string;
  detalhes: Record<string, unknown>;
}

export function OsForm({
  nomeSolicitante,
  autoAprova,
  osId,
  inicial,
}: {
  nomeSolicitante: string;
  autoAprova: boolean;
  osId?: string;
  inicial?: OsInicial;
}) {
  const editando = Boolean(osId && inicial);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const det = (inicial?.detalhes ?? {}) as Record<string, unknown>;
  const [tipo, setTipo] = useState<Tipo | ''>(inicial?.tipo ?? '');
  const [crs, setCrs] = useState(inicial?.crs ?? '');
  const [extensao, setExtensao] = useState(inicial?.extensao_aprox ?? '');
  const [dataInicial, setDataInicial] = useState(inicial?.data_inicial ?? 'imediatamente');
  const [prazoFinal, setPrazoFinal] = useState(inicial?.prazo_final ?? '');
  const [arquivos, setArquivos] = useState<File[]>([]);

  // Condicionais FWD
  const [espacamento, setEspacamento] = useState(String(det.espacamento ?? ''));
  // Condicionais VDR
  const [cameras, setCameras] = useState(String(det.cameras ?? 'todas'));
  const [gpsL1L2, setGpsL1L2] = useState(Boolean(det.gps_l1l2 ?? false));
  // Comuns a FWD e VDR
  const [todasFaixas, setTodasFaixas] = useState(Boolean(det.todas_faixas ?? true));
  const [faixasAdicionais, setFaixasAdicionais] = useState(Boolean(det.faixas_adicionais ?? false));
  const [marginais, setMarginais] = useState(Boolean(det.marginais ?? false));
  // Demais tipos
  const [detalhamento, setDetalhamento] = useState(String(det.detalhamento ?? ''));

  const tipoSimples = tipo !== '' && (TIPOS_SIMPLES as string[]).includes(tipo);

  function addArquivos(list: FileList | null) {
    if (!list) return;
    setArquivos((prev) => [...prev, ...Array.from(list)]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function submit() {
    setErro(null);
    if (!tipo) return setErro('Selecione o tipo de levantamento.');

    const comuns = { todas_faixas: todasFaixas, faixas_adicionais: faixasAdicionais, marginais };
    const detalhes =
      tipo === 'FWD'
        ? { espacamento, ...comuns }
        : tipo === 'VDR'
          ? { cameras, gps_l1l2: gpsL1L2, ...comuns }
          : { detalhamento };

    startTransition(async () => {
      const payload = {
        tipo,
        crs,
        extensao_aprox: extensao,
        data_inicial: dataInicial,
        prazo_final: prazoFinal,
        detalhes,
      };

      let alvoId: string;
      if (editando) {
        const res = await editarOS(osId!, payload);
        if (!res.ok) return setErro(res.erro);
        alvoId = osId!;
      } else {
        const res = await criarOS(payload);
        if (!res.ok) return setErro(res.erro);
        alvoId = res.osId;
      }

      // Envia os anexos selecionados (na abertura ou adicionados na edição)
      for (const f of arquivos) {
        const fd = new FormData();
        fd.set('arquivo', f);
        const up = await anexarArquivo(alvoId, fd);
        if (!up.ok) {
          setErro(`OS salva, mas o anexo "${f.name}" falhou: ${up.erro}`);
          router.push(`/os/${alvoId}`);
          return;
        }
      }
      router.push(`/os/${alvoId}`);
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <div>
        <span className="label">Solicitante</span>
        <input className="input bg-zinc-100" value={nomeSolicitante} disabled />
        {editando && (
          <p className="mt-1 text-xs text-zinc-500">
            Editando OS existente — as alterações ficam registradas no histórico.
          </p>
        )}
        {!editando && autoAprova && (
          <p className="mt-1 text-xs text-green-700">
            Você é Aprovador: esta OS será registrada já com status Aprovada.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="crs">CRS</label>
          <input id="crs" className="input" value={crs} onChange={(e) => setCrs(e.target.value)}
            placeholder="Código de identificação" />
        </div>
        <div>
          <label className="label" htmlFor="ext">Extensão aproximada</label>
          <input id="ext" className="input" value={extensao} onChange={(e) => setExtensao(e.target.value)}
            placeholder="Ex.: 42 km" />
        </div>
        <div>
          <label className="label" htmlFor="di">Data inicial desejada</label>
          <select id="di" className="input" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)}>
            {Object.entries(DATA_INICIAL_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pf">Prazo final</label>
          <input id="pf" type="date" className="input" value={prazoFinal}
            onChange={(e) => setPrazoFinal(e.target.value)}
            min={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tipo">Tipo de levantamento</label>
        <select id="tipo" className="input" value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo | '')}>
          <option value="">Selecione…</option>
          {(Object.keys(TIPO_LABEL) as Tipo[]).map((t) => (
            <option key={t} value={t}>{TIPO_LABEL[t]}</option>
          ))}
        </select>
      </div>

      {tipo === 'FWD' && (
        <fieldset className="space-y-4 rounded-md border-l-4 border-faixa bg-zinc-50 p-4">
          <legend className="px-1 font-display text-lg font-bold uppercase">Parâmetros FWD</legend>
          <div>
            <label className="label" htmlFor="esp">Espaçamento</label>
            <input id="esp" className="input" value={espacamento}
              onChange={(e) => setEspacamento(e.target.value)} placeholder="Ex.: 20 m" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SimNao label="Todas as faixas" value={todasFaixas} onChange={setTodasFaixas} />
            <SimNao label="Faixas adicionais" value={faixasAdicionais} onChange={setFaixasAdicionais} />
            <SimNao label="Marginais" value={marginais} onChange={setMarginais} />
          </div>
        </fieldset>
      )}

      {tipo === 'VDR' && (
        <fieldset className="space-y-4 rounded-md border-l-4 border-faixa bg-zinc-50 p-4">
          <legend className="px-1 font-display text-lg font-bold uppercase">Parâmetros VDR</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cam">Câmeras</label>
              <select id="cam" className="input" value={cameras} onChange={(e) => setCameras(e.target.value)}>
                {Object.entries(CAMERAS_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <SimNao label="GPS L1L2" value={gpsL1L2} onChange={setGpsL1L2} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SimNao label="Todas as faixas" value={todasFaixas} onChange={setTodasFaixas} />
            <SimNao label="Faixas adicionais" value={faixasAdicionais} onChange={setFaixasAdicionais} />
            <SimNao label="Marginais" value={marginais} onChange={setMarginais} />
          </div>
        </fieldset>
      )}

      {tipoSimples && (
        <fieldset className="space-y-2 rounded-md border-l-4 border-faixa bg-zinc-50 p-4">
          <legend className="px-1 font-display text-lg font-bold uppercase">
            {TIPO_LABEL[tipo as Tipo]}
          </legend>
          <label className="label" htmlFor="det">Detalhamento</label>
          <textarea id="det" className="input" rows={3} value={detalhamento}
            onChange={(e) => setDetalhamento(e.target.value)}
            placeholder="Descreva as especificações do ensaio, trecho, condições exigidas…" />
        </fieldset>
      )}

      <div className="rounded-md border border-dashed border-zinc-300 p-4">
        <span className="label">Anexos (KML, PDF, imagens do trecho)</span>
        <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
          Adicionar arquivos
        </button>
        <input ref={fileRef} type="file" multiple className="hidden"
          accept=".kml,.kmz,.pdf,image/*" onChange={(e) => addArquivos(e.target.files)} />
        {arquivos.length > 0 && (
          <ul className="mt-3 space-y-1">
            {arquivos.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-sm">
                <span className="truncate">{f.name}</span>
                <button type="button" className="ml-2 text-xs font-bold text-red-600 hover:underline"
                  onClick={() => setArquivos((prev) => prev.filter((_, j) => j !== i))}>
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <div className="flex justify-end gap-3">
        <button className="btn-ghost" type="button" onClick={() => router.back()}>Voltar</button>
        <button className="btn-primary" onClick={submit} disabled={pending}>
          {pending ? 'Enviando…' : editando ? 'Salvar alterações' : 'Abrir OS'}
        </button>
      </div>
    </div>
  );
}
