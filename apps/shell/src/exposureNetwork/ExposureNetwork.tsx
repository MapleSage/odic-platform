import React, { useMemo, useState } from 'react';
import {
  GRADE_COLOR,
  GRADE_LABEL,
  CONFIDENCE_LEGEND,
  CARD_W,
  CARD_H,
  ROW_Y,
  ENTITY_REGISTRY,
  SPV_DEFS,
  LEFT_DEFS,
  RIGHT_DEFS,
  LEFT_EXTRAS,
  RIGHT_EXTRAS,
  INTERLOCKS,
  PLATFORM_MODAL,
  PROMOTER_NETWORK,
  type Grade,
  type FlankDef,
} from './data';

type InspectorContent = { title: string; subtitle: string; rows: { label: string; value: string }[] };
type ModalChild = { id?: string; name: string; role: string; onClick: () => void };
type ModalContent = {
  title: string;
  subtitle: string;
  sections: { heading: string; rows: { label: string; value: string }[] }[];
  childList?: ModalChild[];
  openChartClick?: () => void;
};

const DEFAULT_INSPECTOR: InspectorContent = {
  title: 'Click any box or connecting line',
  subtitle: 'Every element carries its own sourced record -- nothing here is decorative.',
  rows: [],
};

export function ExposureNetwork({ fullScreen, onOpenFullScreen, onCloseFullScreen }: {
  fullScreen: boolean;
  onOpenFullScreen: () => void;
  onCloseFullScreen: () => void;
}) {
  const [selected, setSelected] = useState<InspectorContent>(DEFAULT_INSPECTOR);
  const [modal, setModal] = useState<ModalContent | null>(null);
  const [drillStack, setDrillStack] = useState<ModalContent[]>([]);
  const [chartView, setChartView] = useState<string | null>(null);

  const spvCards = useMemo(
    () =>
      SPV_DEFS.map((s) => {
        const y = ROW_Y[s.row];
        return { ...s, x: 640, y, midY: y + CARD_H / 2 };
      }),
    [],
  );
  const byId = useMemo(() => Object.fromEntries(spvCards.map((s) => [s.id, s])), [spvCards]);

  const openModal = (content: ModalContent) => {
    setModal(content);
    setDrillStack([content]);
  };
  const closeModal = () => {
    setModal(null);
    setDrillStack([]);
  };
  const pushDrill = (content: ModalContent) => {
    setDrillStack((prev) => [...prev, content]);
    setModal(content);
  };
  const popDrillTo = (i: number) => {
    setDrillStack((prev) => {
      const stack = prev.slice(0, i + 1);
      setModal(stack[stack.length - 1]);
      return stack;
    });
  };
  const openChart = (id: string) => {
    setChartView(id);
    setModal(null);
    setDrillStack([]);
  };
  const closeChart = () => setChartView(null);

  const openEntity = (id: string) => {
    const e = ENTITY_REGISTRY[id];
    if (!e) return;
    const childList: ModalChild[] = e.children.map((c) => ({ ...c, onClick: () => openEntity(c.id) }));
    pushDrill({ ...e, childList, openChartClick: () => openChart(id) });
  };

  function makeFlankCard(def: FlankDef, index: number, x: number, side: 'left' | 'right') {
    const y = ROW_Y[index];
    const midY = y + CARD_H / 2;
    const targetLabel = def.target === 'ALL' ? 'All 6 project SPVs' : byId[def.target]?.project ?? def.target;
    return {
      ...def,
      x,
      y,
      midY,
      color: GRADE_COLOR[def.grade],
      onClick: () => {
        if (def.id && ENTITY_REGISTRY[def.id]) {
          openEntity(def.id);
          return;
        }
        openModal({
          title: def.name,
          subtitle: def.role,
          sections: [
            {
              heading: 'RELATIONSHIP',
              rows: [
                { label: 'CONNECTED SPV / PROJECT', value: targetLabel },
                { label: 'RELATIONSHIP TYPE', value: def.edgeLabel },
                { label: 'SIDE', value: side === 'left' ? 'Left flank -- supplier / vendor / licensee' : 'Right flank -- capital / institution / buyer' },
              ],
            },
            {
              heading: 'EVIDENCE',
              rows: [
                { label: 'GRADE', value: `[${def.grade}] ${GRADE_LABEL[def.grade]}` },
                { label: 'NOTE', value: def.note },
                { label: 'SOURCE ID', value: def.src },
              ],
            },
          ],
        });
      },
    };
  }

  const leftCards = useMemo(() => LEFT_DEFS.map((d, i) => makeFlankCard(d, i, 70, 'left')), [byId]);
  const rightCards = useMemo(() => RIGHT_DEFS.map((d, i) => makeFlankCard(d, i, 1085, 'right')), [byId]);

  const fanLines = useMemo(() => {
    type Line = { x1: number; y1: number; x2: number; y2: number; color: string; width: number; dash: string; opacity: number; onClick: () => void };
    const lines: Line[] = [];
    function pushEdges(card: ReturnType<typeof makeFlankCard>, isLeft: boolean) {
      const targets = card.target === 'ALL' ? spvCards : [byId[card.target]];
      targets.forEach((s) => {
        if (!s) return;
        const coords = isLeft
          ? { x1: card.x + CARD_W, y1: card.midY, x2: 640, y2: s.midY }
          : { x1: 960, y1: s.midY, x2: card.x, y2: card.midY };
        lines.push({
          ...coords,
          color: card.grade === 'D' ? '#9B6FD1' : isLeft ? '#B0424F' : '#3E8A5A',
          width: card.target === 'ALL' ? 1 : 1.6,
          dash: card.grade === 'D' ? '4,3' : 'none',
          opacity: card.target === 'ALL' ? 0.35 : 0.8,
          onClick: () =>
            setSelected({
              title: `${card.name} → ${s.project}`,
              subtitle: card.edgeLabel,
              rows: [
                { label: 'GRADE', value: `[${card.grade}] ${GRADE_LABEL[card.grade]}` },
                { label: 'EVIDENCE', value: card.note },
                { label: 'SOURCE ID', value: card.src },
              ],
            }),
        });
      });
    }
    leftCards.forEach((c) => pushEdges(c, true));
    rightCards.forEach((c) => pushEdges(c, false));
    return lines;
  }, [leftCards, rightCards, spvCards, byId]);

  const spvCardsWithClick = useMemo(
    () =>
      spvCards.map((s) => ({
        ...s,
        onClick: () =>
          openModal({
            title: s.project,
            subtitle: `Executing SPV: ${s.spv}`,
            sections: [
              {
                heading: 'CORPORATE RECORD',
                rows: [
                  { label: 'CIN', value: s.cin },
                  { label: 'RERA REGISTRATION', value: s.rera },
                  { label: 'REGISTERED ADDRESS', value: s.address },
                  { label: 'STATUS', value: s.status },
                ],
              },
              {
                heading: 'GOVERNANCE',
                rows: [
                  { label: 'DIRECTORS', value: s.directors },
                  { label: 'COMMON / INTERLOCKING DIRECTORS', value: s.commonDirectors },
                ],
              },
              ...(s.additionalRegistrations
                ? [
                    {
                      heading: `ADDITIONAL REGISTRATIONS -- ${s.additionalRegistrations.length} MORE`,
                      rows: s.additionalRegistrations.map((r) => ({ label: r.rera, value: r.status })),
                    },
                  ]
                : []),
              {
                heading: 'DILIGENCE NOTE',
                rows: [
                  { label: 'EVIDENCE', value: s.notes },
                  { label: 'GRADE', value: '[A] Primary source -- Haryana RERA project filing' },
                ],
              },
              ...(s.deepDiligence ?? []),
            ],
          }),
      })),
    [spvCards],
  );

  const extraClickHandler = (e: { name: string; role: string; grade: Grade; note: string }) => () =>
    setSelected({ title: e.name, subtitle: e.role, rows: [{ label: 'GRADE', value: `[${e.grade}] ${GRADE_LABEL[e.grade]}` }, { label: 'EVIDENCE', value: e.note }] });

  const breadcrumbsVisible = drillStack.length > 1;
  const chartEntity = chartView ? ENTITY_REGISTRY[chartView] : null;

  const containerStyle: React.CSSProperties = fullScreen
    ? { position: 'fixed', inset: 0, zIndex: 30, overflowY: 'auto', background: '#050810' }
    : { minHeight: '100%', background: '#050810', borderRadius: 18, overflow: 'hidden' };

  return (
    <div style={{ ...containerStyle, color: 'oklch(94% 0.01 240)', fontFamily: "'IBM Plex Mono', monospace" }}>
      <div style={{ background: '#0A0F1A', borderBottom: '1px solid #1E2E40', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {fullScreen ? (
            <button onClick={onCloseFullScreen} style={{ background: 'none', border: 0, font: 'inherit', fontSize: 11, color: '#7FA8BD', cursor: 'pointer' }}>
              &larr; BACK TO WORKSPACE
            </button>
          ) : null}
          <div style={{ fontSize: 17, fontWeight: 700, color: '#F7761F' }}>
            SWD IN <span style={{ color: '#7FA8BD', fontWeight: 400, fontSize: 14 }}>Equity</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'oklch(96% 0.005 240)' }}>360&deg; Counterparty Exposure -- click any box or line for evidence</div>
          {!fullScreen ? (
            <button onClick={onOpenFullScreen} style={{ background: 'none', border: '1px solid #3D9CA2', borderRadius: 5, color: '#3D9CA2', font: 'inherit', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>
              OPEN FULL SCREEN &rarr;
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ background: '#0D1420', borderBottom: '1px solid #1E2E40', padding: '10px 24px', display: 'flex', gap: 36, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: '#3D9CA2' }}>
          Viewing: <span style={{ color: 'oklch(94% 0.01 240)' }}>Smartworld Developers Pvt. Ltd.</span>
        </div>
        <div style={{ fontSize: 12, color: '#7FA8BD' }}>Every line = one sourced relationship. Every box = one entity with its own record.</div>
        <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
          {CONFIDENCE_LEGEND.map((cl) => (
            <div key={cl.grade} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: '#7FA8BD' }}>
              <span style={{ color: cl.color, fontWeight: 700 }}>[{cl.grade}]</span>
              {cl.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: '20px 0 10px' }}>
        <div style={{ position: 'relative', width: 1600, minHeight: 900, margin: '0 auto' }}>
          <svg width={1600} height={900} style={{ position: 'absolute', top: 0, left: 0 }}>
            {fanLines.map((ln, i) => (
              <React.Fragment key={i}>
                <line onClick={ln.onClick} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke="transparent" strokeWidth={12} style={{ cursor: 'pointer' }} />
                <line x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke={ln.color} strokeWidth={ln.width} strokeDasharray={ln.dash} opacity={ln.opacity} style={{ pointerEvents: 'none' }} />
              </React.Fragment>
            ))}
          </svg>

          {[...leftCards, ...rightCards].map((c) => (
            <div
              key={c.name}
              onClick={c.onClick}
              style={{
                position: 'absolute', left: c.x, top: c.y, width: 445, height: 88,
                background: '#0E1826', border: '1px solid #22364a', borderLeft: `5px solid ${c.color}`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px', boxSizing: 'border-box', zIndex: 2, cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'oklch(96% 0.005 240)' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>[{c.grade}]</div>
              </div>
              <div style={{ fontSize: 11, color: '#7FA8BD', marginTop: 4 }}>{c.role}</div>
            </div>
          ))}

          <div
            onClick={() => openModal(PLATFORM_MODAL)}
            style={{ position: 'absolute', left: 640, top: 56, width: 320, height: 64, background: '#1a1408', border: '2px solid #F7761F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#F7761F' }}>SMARTWORLD DEVELOPERS</div>
            <div style={{ fontSize: 10.5, color: '#c99a6b', marginTop: 3 }}>Corporate Platform Node</div>
          </div>

          {spvCardsWithClick.map((s) => (
            <div
              key={s.id}
              onClick={s.onClick}
              style={{ position: 'absolute', left: 640, top: s.y, width: 320, height: 88, background: '#0A1A22', border: '1.5px solid #3DD6E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, cursor: 'pointer' }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#3DD6E8' }}>{s.project}</div>
              <div style={{ fontSize: 11, color: '#7FA8BD', marginTop: 4 }}>{s.spv}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 28px 20px' }}>
        <div style={{ background: '#0E1826', border: '1.5px solid #3D9CA2', borderRadius: 8, padding: '16px 20px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#3D9CA2', marginBottom: 8 }}>EVIDENCE INSPECTOR</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'oklch(96% 0.005 240)' }}>{selected.title}</div>
          <div style={{ fontSize: 12, color: '#7FA8BD', marginTop: 2, fontFamily: "'IBM Plex Sans', sans-serif" }}>{selected.subtitle}</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
            {selected.rows.map((r) => (
              <div key={r.label}>
                <div style={{ fontSize: 9.5, color: '#7FA8BD', letterSpacing: 0.4 }}>{r.label}</div>
                <div style={{ fontSize: 12.5, color: 'oklch(94% 0.01 240)', fontFamily: "'IBM Plex Sans', sans-serif" }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal ? (
        <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#0A121C', border: '1.5px solid #3DD6E8', borderRadius: 10, width: '100%', maxWidth: 760, maxHeight: '85vh', overflowY: 'auto', padding: 24 }}>
            {breadcrumbsVisible ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {drillStack.map((d, i) => (
                  <button key={i} onClick={() => popDrillTo(i)} style={{ background: 'none', border: 0, font: 'inherit', fontSize: 11, color: '#3DD6E8', cursor: 'pointer' }}>
                    {d.title}
                    {i < drillStack.length - 1 ? ' /' : ''}
                  </button>
                ))}
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: 'oklch(97% 0.005 240)', fontFamily: "'IBM Plex Sans', sans-serif" }}>{modal.title}</div>
                <div style={{ fontSize: 12.5, color: '#7FA8BD', marginTop: 3, fontFamily: "'IBM Plex Sans', sans-serif" }}>{modal.subtitle}</div>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 20, color: '#7FA8BD', lineHeight: 1 }}>&times;</button>
            </div>

            {modal.sections.map((sec) => (
              <div key={sec.heading} style={{ marginTop: 18 }}>
                <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#3DD6E8', marginBottom: 8 }}>{sec.heading}</div>
                {sec.rows.map((r) => (
                  <div key={r.label} style={{ display: 'flex', gap: 14, padding: '7px 0', borderTop: '1px solid #1E2E40' }}>
                    <div style={{ fontSize: 10.5, color: '#7FA8BD', minWidth: 150, flexShrink: 0 }}>{r.label}</div>
                    <div style={{ fontSize: 12.5, color: 'oklch(94% 0.01 240)', fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1.5 }}>{r.value}</div>
                  </div>
                ))}
              </div>
            ))}

            {modal.childList && modal.childList.length > 0 ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#F7761F' }}>SUB-ENTITIES -- {modal.childList.length} GROUP COMPANIES</div>
                  <button onClick={modal.openChartClick} style={{ background: 'none', font: 'inherit', fontSize: 11, color: '#F7761F', border: '1px solid #F7761F', padding: '5px 10px', borderRadius: 5, cursor: 'pointer' }}>
                    Open as Full Chart &rarr;
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {modal.childList.map((ch) => (
                    <div key={ch.name} onClick={ch.onClick} style={{ background: '#0E1826', border: '1px solid #22364a', borderRadius: 6, padding: '9px 12px', cursor: 'pointer' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>{ch.name}</div>
                      <div style={{ fontSize: 10.5, color: '#7FA8BD', fontFamily: "'IBM Plex Sans', sans-serif", marginTop: 2 }}>{ch.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {chartEntity ? (
        <div style={{ position: 'fixed', inset: 0, background: '#050810', zIndex: 20, overflowY: 'auto' }}>
          <div style={{ background: '#0A0F1A', borderBottom: '1px solid #1E2E40', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={closeChart} style={{ background: 'none', border: 0, font: 'inherit', fontSize: 11, color: '#7FA8BD', cursor: 'pointer' }}>&larr; BACK TO EXPOSURE NETWORK</button>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#F7761F', fontFamily: "'IBM Plex Sans', sans-serif" }}>{chartEntity.title}</div>
          </div>
          <div style={{ padding: '40px 60px' }}>
            <div style={{ maxWidth: 420, margin: '0 auto 40px', background: '#1a1408', border: '2px solid #F7761F', borderRadius: 8, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#F7761F', fontFamily: "'IBM Plex Sans', sans-serif" }}>{chartEntity.title}</div>
              <div style={{ fontSize: 11.5, color: '#c99a6b', marginTop: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>{chartEntity.subtitle}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 1200, margin: '0 auto' }}>
              {chartEntity.children.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => {
                    setChartView(null);
                    openEntity(ch.id);
                  }}
                  style={{ background: '#0E1826', border: '1.5px solid #3DD6E8', borderRadius: 8, padding: 14, cursor: 'pointer' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#3DD6E8', fontFamily: "'IBM Plex Sans', sans-serif" }}>{ch.name}</div>
                  <div style={{ fontSize: 11, color: '#7FA8BD', marginTop: 5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{ch.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: 1500, margin: '0 auto', padding: '0 28px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#3D9CA2', marginBottom: 10 }}>SUPPLEMENTARY LEFT FLANK -- EPC, DESIGN &amp; REGULATORY</div>
            {LEFT_EXTRAS.map((le) => (
              <div key={le.name} onClick={extraClickHandler(le)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0E1826', border: '1px solid #22364a', borderRadius: 6, padding: '9px 10px', marginBottom: 6, cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: GRADE_COLOR[le.grade], color: '#050810', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{le.grade}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>{le.name}</div>
                  <div style={{ fontSize: 10.5, color: '#7FA8BD', fontFamily: "'IBM Plex Sans', sans-serif" }}>{le.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#5FA86B', marginBottom: 10 }}>SUPPLEMENTARY RIGHT FLANK -- CAPITAL &amp; BUYER POOLS</div>
            {RIGHT_EXTRAS.map((re) => (
              <div key={re.name} onClick={extraClickHandler(re)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0E1826', border: '1px solid #22364a', borderRadius: 6, padding: '9px 10px', marginBottom: 6, cursor: 'pointer' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" }}>{re.name}</div>
                  <div style={{ fontSize: 10.5, color: '#7FA8BD', fontFamily: "'IBM Plex Sans', sans-serif" }}>{re.role}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: GRADE_COLOR[re.grade], color: '#050810', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{re.grade}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, background: '#1a1408', border: '1px dashed #D4A017', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#D4A017', marginBottom: 4 }}>PROMOTER &amp; FAMILY OFFICE NETWORK -- PENDING VERIFICATION</div>
          <div style={{ fontSize: 11, color: '#c9a86b', marginBottom: 10, fontFamily: "'IBM Plex Sans', sans-serif" }}>
            Every entry below is a lead pending underlying governance/filing retrieval, not a confirmed fact. Family relationships are never inferred from surname overlap alone.
          </div>
          {PROMOTER_NETWORK.map((p) => (
            <button
              key={p.name}
              onClick={() => setSelected({ title: p.name, subtitle: p.role, rows: [{ label: 'STATUS', value: 'Pending verification' }, { label: 'NOTE', value: p.note }] })}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, borderTop: '1px solid #3a2f12', padding: '8px 0', fontSize: 12, lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif", cursor: 'pointer', color: 'inherit' }}
            >
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ color: '#c9a86b' }}> -- {p.role}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, background: '#0E1826', border: '1px solid #22364a', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: '#F7761F', marginBottom: 10 }}>INTERLOCKING DIRECTORATE &amp; COMMON CONTROL</div>
          {INTERLOCKS.map((il) => (
            <div key={il.name} style={{ padding: '8px 0', borderTop: '1px solid #22364a', fontSize: 12, lineHeight: 1.5, fontFamily: "'IBM Plex Sans', sans-serif" }}>
              <span style={{ fontWeight: 600 }}>{il.name}</span>
              <span style={{ color: '#7FA8BD' }}> -- {il.bridges}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
