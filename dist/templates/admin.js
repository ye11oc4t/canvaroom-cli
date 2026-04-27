export const ADMIN_TSX = `'use client';

import { useState, useCallback } from 'react';
import { PresentationData, defaultData, Chapter, Link as PLink } from '@/lib/types';
import { buildViewUrl, uid, toCanvaEmbed } from '@/lib/utils';

const s = {
  // layout
  page: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#fff' } as React.CSSProperties,
  sidebar: {
    width: 200, flexShrink: 0, borderRight: '0.5px solid #e8e8e8',
    display: 'flex', flexDirection: 'column', background: '#fafafa',
  } as React.CSSProperties,
  main: { flex: 1, overflow: 'auto', padding: '32px 40px' } as React.CSSProperties,

  // sidebar nav
  navHeader: { padding: '16px 16px 8px', fontSize: 13, fontWeight: 600, color: '#111', letterSpacing: '-0.3px' } as React.CSSProperties,
  navItem: (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
    fontSize: 13, fontWeight: active ? 500 : 400,
    color: active ? '#4285f4' : '#555',
    background: active ? '#eef3ff' : 'transparent',
    border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
    borderLeft: active ? '2px solid #4285f4' : '2px solid transparent',
  }),

  // sections
  section: { marginBottom: 40 } as React.CSSProperties,
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 } as React.CSSProperties,
  sectionDesc: { fontSize: 12, color: '#aaa', marginBottom: 20 } as React.CSSProperties,

  // form
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 } as React.CSSProperties,
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 12, fontWeight: 500, color: '#777' } as React.CSSProperties,
  hint: { fontSize: 11, color: '#bbb', marginTop: 2 } as React.CSSProperties,

  // buttons
  btn: (color = '#4285f4'): React.CSSProperties => ({
    padding: '8px 18px', background: color, color: '#fff',
    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 500,
    cursor: 'pointer',
  }),
  btnGhost: { padding: '7px 14px', background: '#fff', color: '#555', border: '0.5px solid #ddd', borderRadius: 7, fontSize: 12, fontWeight: 500 } as React.CSSProperties,
  btnDanger: { padding: '5px 10px', background: 'none', color: '#ccc', border: 'none', fontSize: 13, cursor: 'pointer' } as React.CSSProperties,

  // cards
  card: { background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 10, padding: '14px 16px', marginBottom: 8 } as React.CSSProperties,

  // topbar
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 32, paddingBottom: 24, borderBottom: '0.5px solid #f0f0f0',
  } as React.CSSProperties,

  // share box
  shareBox: {
    background: '#f0f6ff', border: '0.5px solid #c5d8f8', borderRadius: 10,
    padding: '16px 20px', marginTop: 8,
  } as React.CSSProperties,
};

const NAV_ITEMS = [
  { id: 'slides', label: '슬라이드', icon: '⬜' },
  { id: 'presenter', label: '발표자 정보', icon: '👤' },
  { id: 'chapters', label: '목차', icon: '📋' },
  { id: 'links', label: '관련 링크', icon: '🔗' },
  { id: 'share', label: '공유', icon: '🚀' },
];

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('slides');
  const [data, setData] = useState<PresentationData>(defaultData);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // chapter inputs
  const [chTitle, setChTitle] = useState('');
  const [chSub, setChSub] = useState('');
  const [chCount, setChCount] = useState('');

  // link inputs
  const [lLabel, setLLabel] = useState('');
  const [lUrl, setLUrl] = useState('');

  const update = useCallback((patch: Partial<PresentationData>) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const updatePresenter = useCallback((patch: Partial<PresentationData['presenter']>) => {
    setData(prev => ({ ...prev, presenter: { ...prev.presenter, ...patch } }));
  }, []);

  const addChapter = () => {
    if (!chTitle.trim()) return;
    const ch: Chapter = { id: uid(), title: chTitle.trim(), subtitle: chSub.trim() };
    update({ chapters: [...data.chapters, ch] });
    setChTitle(''); setChSub('');
  };

  const autoGenChapters = () => {
    const n = parseInt(chCount);
    if (!n || n < 1 || n > 50) return;
    const chs: Chapter[] = Array.from({ length: n }, (_, i) => ({
      id: uid(), title: \`슬라이드 \${i + 1}\`, subtitle: '',
    }));
    update({ chapters: chs });
    setChCount('');
  };

  const removeChapter = (id: string) => {
    update({ chapters: data.chapters.filter(c => c.id !== id) });
  };

  const updateChapter = (id: string, patch: Partial<Chapter>) => {
    update({ chapters: data.chapters.map(c => c.id === id ? { ...c, ...patch } : c) });
  };

  const addLink = () => {
    if (!lUrl.trim()) return;
    const link: PLink = { id: uid(), label: lLabel.trim() || lUrl.trim(), url: lUrl.trim() };
    update({ links: [...data.links, link] });
    setLLabel(''); setLUrl('');
  };

  const removeLink = (id: string) => {
    update({ links: data.links.filter(l => l.id !== id) });
  };

  const generateShareUrl = () => {
    const url = buildViewUrl(data);
    setShareUrl(url);
    setActiveSection('share');
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presenter = data.presenter;

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <nav style={s.sidebar}>
        <div style={s.navHeader}>CanvaHub <span style={{ color: '#4285f4' }}>Admin</span></div>
        <div style={{ marginTop: 8 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} style={s.navItem(activeSection === item.id)} onClick={() => setActiveSection(item.id)}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: 16 }}>
          <button style={s.btn('#4285f4')} onClick={generateShareUrl} >
            공유 링크 생성 →
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.4px' }}>
              {data.title || '발표 제목 없음'}
            </h1>
            <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>Admin Console</p>
          </div>
          <button style={s.btn('#34a853')} onClick={generateShareUrl}>
            공유 링크 생성
          </button>
        </div>

        {/* SLIDES */}
        {activeSection === 'slides' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>슬라이드 설정</div>
            <div style={s.sectionDesc}>발표 제목과 캔바 임베드 URL, Slido 링크를 입력하세요.</div>
            <div style={s.field}>
              <label style={s.label}>발표 제목</label>
              <input value={data.title} onChange={e => update({ title: e.target.value })} placeholder="예: Baby Beavers 중간발표" />
            </div>
            <div style={s.field}>
              <label style={s.label}>캔바 임베드 URL</label>
              <input
                value={data.canvaUrl}
                onChange={e => update({ canvaUrl: toCanvaEmbed(e.target.value) })}
                placeholder="https://www.canva.com/design/XXXXX/YYYYY/view?embed"
              />
              <span style={s.hint}>일반 공유 링크 붙여넣으면 ?embed 자동 변환됩니다 (캔바 → 공유 → 삽입 → src URL 권장)</span>
            </div>
            <div style={s.field}>
              <label style={s.label}>Slido 링크 <span style={{ color: '#ccc', fontWeight: 400 }}>(선택)</span></label>
              <input value={data.slidoUrl} onChange={e => update({ slidoUrl: e.target.value })} placeholder="https://app.sli.do/event/..." />
            </div>

            {/* Preview */}
            {data.canvaUrl && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>미리보기</div>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 10, overflow: 'hidden', border: '0.5px solid #e8e8e8' }}>
                  <iframe
                    src={data.canvaUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRESENTER */}
        {activeSection === 'presenter' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>발표자 정보</div>
            <div style={s.sectionDesc}>청취자 화면에 표시될 발표자 정보를 입력하세요.</div>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>이름</label>
                <input value={presenter.name} onChange={e => updatePresenter({ name: e.target.value, avatarInitials: e.target.value.slice(0, 2) })} placeholder="김서연" />
              </div>
              <div style={s.field}>
                <label style={s.label}>직함 / 소속</label>
                <input value={presenter.title} onChange={e => updatePresenter({ title: e.target.value })} placeholder="Baby Beavers CERT · 클라우드 보안" />
              </div>
            </div>
            <div style={s.field}>
              <label style={s.label}>바이오 <span style={{ color: '#ccc', fontWeight: 400 }}>(자유 입력)</span></label>
              <textarea
                value={presenter.bio}
                onChange={e => updatePresenter({ bio: e.target.value })}
                placeholder="간단한 자기소개를 입력하세요..."
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#777', marginBottom: 12, marginTop: 8 }}>SNS 링크</div>
            <div style={s.grid2}>
              <div style={s.field}>
                <label style={s.label}>LinkedIn URL</label>
                <input value={presenter.linkedin} onChange={e => updatePresenter({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
              </div>
              <div style={s.field}>
                <label style={s.label}>GitHub URL</label>
                <input value={presenter.github} onChange={e => updatePresenter({ github: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <div style={s.field}>
                <label style={s.label}>Twitter / X URL</label>
                <input value={presenter.twitter} onChange={e => updatePresenter({ twitter: e.target.value })} placeholder="https://x.com/..." />
              </div>
              <div style={s.field}>
                <label style={s.label}>개인 웹사이트</label>
                <input value={presenter.website} onChange={e => updatePresenter({ website: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            {/* Presenter Card Preview */}
            {presenter.name && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: 8 }}>청취자에게 보이는 카드</div>
                <PresenterCard presenter={presenter} />
              </div>
            )}
          </div>
        )}

        {/* CHAPTERS */}
        {activeSection === 'chapters' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>목차 설정</div>
            <div style={s.sectionDesc}>슬라이드 수를 입력해 자동 생성하거나, 직접 챕터를 추가하세요.</div>

            {/* Auto generate */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'flex-end' }}>
              <div style={{ ...s.field, marginBottom: 0, flex: 1 }}>
                <label style={s.label}>슬라이드 수로 자동 생성</label>
                <input
                  type="number" min={1} max={50} value={chCount}
                  onChange={e => setChCount(e.target.value)}
                  placeholder="예: 10"
                />
              </div>
              <button style={s.btn('#fbbc04')} onClick={autoGenChapters}>
                자동 생성
              </button>
            </div>

            {/* Chapter list */}
            {data.chapters.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {data.chapters.map((ch, i) => (
                  <div key={ch.id} style={s.card}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: 6, background: '#e8f0fe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 600, color: '#4285f4', flexShrink: 0, marginTop: 2
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <input
                          value={ch.title}
                          onChange={e => updateChapter(ch.id, { title: e.target.value })}
                          placeholder={\`슬라이드 \${i + 1}\`}
                          style={{ fontSize: 13, fontWeight: 500 }}
                        />
                        <input
                          value={ch.subtitle}
                          onChange={e => updateChapter(ch.id, { subtitle: e.target.value })}
                          placeholder="부제목 (선택)"
                          style={{ fontSize: 12, color: '#888' }}
                        />
                      </div>
                      <button style={s.btnDanger} onClick={() => removeChapter(ch.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual add */}
            <div style={{ ...s.card, background: '#fafafa' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#777', marginBottom: 10 }}>챕터 직접 추가</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={chTitle} onChange={e => setChTitle(e.target.value)} placeholder="챕터 제목" onKeyDown={e => e.key === 'Enter' && addChapter()} />
                <input value={chSub} onChange={e => setChSub(e.target.value)} placeholder="부제목 (선택)" onKeyDown={e => e.key === 'Enter' && addChapter()} />
                <button style={s.btn('#4285f4')} onClick={addChapter}>+ 추가</button>
              </div>
            </div>
          </div>
        )}

        {/* LINKS */}
        {activeSection === 'links' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>관련 링크</div>
            <div style={s.sectionDesc}>청취자에게 보여줄 참고 링크를 추가하세요.</div>

            {data.links.map(link => (
              <div key={link.id} style={s.card}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 6, background: '#e8f0fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600, color: '#4285f4', flexShrink: 0
                  }}>
                    {link.label.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{link.label}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{link.url}</div>
                  </div>
                  <button style={s.btnDanger} onClick={() => removeLink(link.id)}>✕</button>
                </div>
              </div>
            ))}

            <div style={{ ...s.card, background: '#fafafa', marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#777', marginBottom: 10 }}>링크 추가</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={lLabel} onChange={e => setLLabel(e.target.value)} placeholder="링크 이름 (예: GitHub 레포)" />
                <input value={lUrl} onChange={e => setLUrl(e.target.value)} placeholder="https://..." onKeyDown={e => e.key === 'Enter' && addLink()} />
                <button style={s.btn('#34a853')} onClick={addLink}>+ 링크 추가</button>
              </div>
            </div>
          </div>
        )}

        {/* SHARE */}
        {activeSection === 'share' && (
          <div style={s.section}>
            <div style={s.sectionTitle}>공유</div>
            <div style={s.sectionDesc}>아래 버튼을 눌러 청취자용 링크를 생성하세요. 모든 설정이 URL에 인코딩됩니다.</div>

            <button style={{ ...s.btn('#4285f4'), marginBottom: 20, fontSize: 14, padding: '10px 24px' }} onClick={generateShareUrl}>
              청취자 링크 생성
            </button>

            {shareUrl && (
              <div style={s.shareBox}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#4285f4', marginBottom: 8 }}>청취자 링크</div>
                <div style={{
                  background: '#fff', border: '0.5px solid #c5d8f8', borderRadius: 7,
                  padding: '10px 12px', fontSize: 12, color: '#555',
                  wordBreak: 'break-all', marginBottom: 12, fontFamily: 'monospace'
                }}>
                  {shareUrl}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btn('#4285f4')} onClick={copyUrl}>
                    {copied ? '복사됨 ✓' : '링크 복사'}
                  </button>
                  <a href={shareUrl} target="_blank" rel="noreferrer" style={{
                    ...s.btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
                  }}>
                    미리보기 →
                  </a>
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: '#88a', lineHeight: 1.5 }}>
                  💡 이 링크를 Vercel 배포 후 청취자에게 공유하면 됩니다. 데이터는 URL에 인코딩되어 있어 별도 서버가 필요 없어요.
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PresenterCard({ presenter }: { presenter: PresentationData['presenter'] }) {
  const sns = [
    { key: 'linkedin', label: 'LinkedIn', color: '#0077b5' },
    { key: 'github', label: 'GitHub', color: '#333' },
    { key: 'twitter', label: 'X', color: '#000' },
    { key: 'website', label: '웹사이트', color: '#4285f4' },
  ] as const;

  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e8e8e8', borderRadius: 12,
      padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start',
      maxWidth: 480
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', background: '#e8f0fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 600, color: '#4285f4', flexShrink: 0
      }}>
        {presenter.avatarInitials || presenter.name.slice(0, 2)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{presenter.name}</div>
        {presenter.title && <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{presenter.title}</div>}
        {presenter.bio && <div style={{ fontSize: 12, color: '#555', marginTop: 8, lineHeight: 1.6 }}>{presenter.bio}</div>}
        {sns.some(s => presenter[s.key]) && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {sns.map(s => presenter[s.key] ? (
              <a key={s.key} href={presenter[s.key]} target="_blank" rel="noreferrer" style={{
                fontSize: 11, fontWeight: 500, color: s.color,
                padding: '3px 8px', border: \`0.5px solid \${s.color}40\`,
                borderRadius: 5, textDecoration: 'none', background: \`\${s.color}08\`
              }}>
                {s.label}
              </a>
            ) : null)}
          </div>
        )}
      </div>
    </div>
  );
}
`;
