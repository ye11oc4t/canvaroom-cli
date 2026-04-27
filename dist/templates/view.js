export const VIEW_TSX = `'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { PresentationData, defaultData } from '@/lib/types';
import { decodeData, getLinkIcon } from '@/lib/utils';

export default function ViewPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ViewerInner />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#aaa', fontSize: 13 }}>
      불러오는 중...
    </div>
  );
}

function ViewerInner() {
  const params = useSearchParams();
  const [data, setData] = useState<PresentationData | null>(null);
  const [activeChapter, setActiveChapter] = useState(-1);
  const [activeTab, setActiveTab] = useState<'chapters' | 'links' | 'presenter'>('chapters');
  const [slidoVisible, setSlidoVisible] = useState(true);
  const [slidoInput, setSlidoInput] = useState('');

  useEffect(() => {
    const d = params.get('d');
    if (d) {
      const decoded = decodeData(d);
      setData(decoded);
    } else {
      setData(defaultData);
    }
  }, [params]);

  if (!data) return <LoadingScreen />;

  const presenter = data.presenter;
  const hasSns = presenter.linkedin || presenter.github || presenter.twitter || presenter.website;

  const snsList = [
    { key: 'linkedin' as const, label: 'LinkedIn', color: '#0077b5' },
    { key: 'github' as const, label: 'GitHub', color: '#333' },
    { key: 'twitter' as const, label: 'X', color: '#000' },
    { key: 'website' as const, label: '웹사이트', color: '#4285f4' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#fff', flexDirection: 'column' }}>
      {/* Topbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        height: 46, borderBottom: '0.5px solid #e8e8e8', flexShrink: 0, background: '#fff'
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111', flex: 1 }}>
          {data.title || 'CanvaHub'}
        </span>
        {data.slidoUrl && (
          <button onClick={() => setSlidoVisible(v => !v)} style={{
            fontSize: 12, padding: '4px 10px', border: '0.5px solid #ddd',
            borderRadius: 6, background: '#fff', color: '#555', cursor: 'pointer'
          }}>
            Slido {slidoVisible ? '숨기기' : '보이기'}
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{
          width: 232, flexShrink: 0, borderRight: '0.5px solid #e8e8e8',
          display: 'flex', flexDirection: 'column', background: '#fff'
        }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', borderBottom: '0.5px solid #e8e8e8', flexShrink: 0 }}>
            {[
              { id: 'chapters' as const, label: '목차' },
              { id: 'links' as const, label: '링크' },
              { id: 'presenter' as const, label: '발표자' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 500,
                border: 'none', background: 'transparent', cursor: 'pointer',
                color: activeTab === tab.id ? '#4285f4' : '#aaa',
                borderBottom: activeTab === tab.id ? '2px solid #4285f4' : '2px solid transparent',
                marginBottom: -0.5,
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chapters */}
          {activeTab === 'chapters' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              {data.chapters.length === 0
                ? <EmptyMsg>목차가 없어요</EmptyMsg>
                : data.chapters.map((ch, i) => (
                  <div key={ch.id} onClick={() => setActiveChapter(i)} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8, padding: '7px 8px',
                    borderRadius: 7, cursor: 'pointer', marginBottom: 2,
                    background: activeChapter === i ? '#eef3ff' : 'transparent',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      background: activeChapter === i ? '#4285f4' : '#e8f0fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 600,
                      color: activeChapter === i ? '#fff' : '#4285f4',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ch.title}
                      </div>
                      {ch.subtitle && (
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{ch.subtitle}</div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Links */}
          {activeTab === 'links' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              {data.links.length === 0
                ? <EmptyMsg>링크가 없어요</EmptyMsg>
                : data.links.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px',
                    borderRadius: 7, marginBottom: 2, textDecoration: 'none',
                    border: '0.5px solid transparent',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f7ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 26, height: 26, borderRadius: 5, background: '#e8f0fe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, color: '#4285f4', flexShrink: 0
                    }}>
                      {getLinkIcon(link.url)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {link.url.replace(/^https?:\\/\\//, '')}
                      </div>
                    </div>
                  </a>
                ))
              }
            </div>
          )}

          {/* Presenter */}
          {activeTab === 'presenter' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              {!presenter.name
                ? <EmptyMsg>발표자 정보가 없어요</EmptyMsg>
                : (
                  <>
                    {/* Avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: '#e8f0fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 600, color: '#4285f4', flexShrink: 0
                      }}>
                        {presenter.avatarInitials || presenter.name.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{presenter.name}</div>
                        {presenter.title && (
                          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{presenter.title}</div>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {presenter.bio && (
                      <div style={{
                        fontSize: 12, color: '#555', lineHeight: 1.65,
                        padding: '10px 12px', background: '#f7f7f7', borderRadius: 8, marginBottom: 12
                      }}>
                        {presenter.bio}
                      </div>
                    )}

                    {/* SNS */}
                    {hasSns && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {snsList.map(s => presenter[s.key] ? (
                          <a key={s.key} href={presenter[s.key]} target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                            border: \`0.5px solid \${s.color}30\`, borderRadius: 7,
                            textDecoration: 'none', background: \`\${s.color}06\`,
                          }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: s.color, width: 60 }}>{s.label}</span>
                            <span style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {presenter[s.key].replace(/^https?:\\/\\//, '')}
                            </span>
                          </a>
                        ) : null)}
                      </div>
                    )}
                  </>
                )}
            </div>
          )}
        </div>

        {/* Slides */}
        <div style={{ flex: 1, position: 'relative', background: '#f7f7f7' }}>
          {data.canvaUrl ? (
            <iframe
              src={data.canvaUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10, color: '#ccc', fontSize: 13
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              슬라이드가 없어요
            </div>
          )}
        </div>

        {/* Slido panel */}
        {(data.slidoUrl || !data.slidoUrl) && slidoVisible && (
          <div style={{
            width: 310, flexShrink: 0, borderLeft: '0.5px solid #e8e8e8',
            display: 'flex', flexDirection: 'column', background: '#fff'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderBottom: '0.5px solid #f0f0f0', flexShrink: 0
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>Slido Q&amp;A</span>
              <button onClick={() => setSlidoVisible(false)} style={{
                fontSize: 11, padding: '3px 8px', border: '0.5px solid #ddd',
                borderRadius: 5, background: '#fff', color: '#888', cursor: 'pointer'
              }}>
                숨기기
              </button>
            </div>

            {data.slidoUrl ? (
              <iframe src={data.slidoUrl} style={{ flex: 1, border: 'none', width: '100%' }} allowFullScreen />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 1.5 }}>
                  Slido 링크를 입력하면<br />Q&amp;A 창이 열려요
                </p>
                <input
                  value={slidoInput}
                  onChange={e => setSlidoInput(e.target.value)}
                  placeholder="https://app.sli.do/event/..."
                  style={{ fontSize: 12 }}
                />
                <button
                  onClick={() => { if (slidoInput && data) setData({ ...data, slidoUrl: slidoInput }); }}
                  style={{
                    width: '100%', padding: '7px', background: '#34a853', color: '#fff',
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  Slido 열기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Slido toggle when hidden */}
        {!slidoVisible && (
          <button onClick={() => setSlidoVisible(true)} style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            width: 22, height: 48, background: '#fff', border: '0.5px solid #e0e0e0',
            borderRight: 'none', borderRadius: '6px 0 0 6px', cursor: 'pointer',
            fontSize: 11, color: '#aaa', zIndex: 10
          }}>
            Q
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
      {children}
    </div>
  );
}
`;
