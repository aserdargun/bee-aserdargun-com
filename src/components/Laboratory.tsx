'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Download, Eye, FlaskConical, Flower2, GitBranch, Hexagon, MessageCircle, Pause, Play, RotateCcw, StepForward, Upload } from 'lucide-react';
import { experiments, experimentConfig, type Language } from '../experiments/catalog';
import { defaultConfig } from '../simulation/config';
import { validateRun } from '../simulation/validation';
import type { ExperimentRun, SimulationConfig } from '../simulation/types';
import type { ViewMode } from '../rendering/canvas';
import { useLaboratory } from './useLaboratory';
import { WorldCanvas } from './WorldCanvas';
import { ExperimentControls } from './ExperimentControls';
import { ColonyInspector } from './ColonyInspector';
import { LabDialog } from './LabDialog';
import { FieldNotes } from './FieldNotes';
import { TermHelp } from './TermHelp';
import { LearningGuide } from './LearningGuide';

type Notice = 'exported' | 'replaying' | 'invalid' | 'tooLarge' | 'unreadable' | { tick: number } | null;
const formatTime = (tick: number) => `${String(Math.floor(tick / 600)).padStart(2, '0')}:${String(Math.floor(tick / 10) % 60).padStart(2, '0')}`;
export function Laboratory() {
  const lab = useLaboratory();
  const [language, setLanguage] = useState<Language>('tr'), [view, setView] = useState<ViewMode>('landscape');
  const [baseConfig, setBaseConfig] = useState<SimulationConfig>(defaultConfig);
  const [prediction, setPrediction] = useState<number | null>(null), [selected, setSelected] = useState<number | null>(null);
  const [follow, setFollow] = useState(false), [compare, setCompare] = useState(false), [debug, setDebug] = useState(false);
  const [dialog, setDialog] = useState<'experiments' | 'notes' | 'history' | null>(null);
  const [history, setHistory] = useState<ExperimentRun[]>([]), [notice, setNotice] = useState<Notice>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const world = lab.world, control = lab.control;
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  const noticeText = notice && (typeof notice === 'object'
    ? t(`Recomputed tick ${notice.tick}; run paused.`, `${notice.tick}. tick yeniden hesaplandı; koşu duraklatıldı.`)
    : {
      exported: t('Run exported as JSON.', 'Koşu JSON olarak dışa aktarıldı.'),
      replaying: t('Replaying the recorded run…', 'Kaydedilen koşu yeniden oynatılıyor…'),
      invalid: t('This file is invalid, too large or uses an unsupported model version.', 'Dosya geçersiz, çok büyük veya desteklenmeyen bir model sürümünde.'),
      tooLarge: t('Maximum file size is 2 MB.', 'En büyük dosya boyutu 2 MB.'),
      unreadable: t('Could not read a valid JSON run.', 'Geçerli bir JSON koşusu okunamadı.'),
    }[notice]);
  const experiment = experiments.find(e => e.id === baseConfig.experimentId) ?? experiments[2];
  useEffect(() => {
    if (!lab.imported) return;
    setBaseConfig(lab.imported.config); setSelected(null); setFollow(false); setPrediction(null);
  }, [lab.imported]);
  useEffect(() => { if (lab.imported) setNotice({ tick: lab.imported.tick }); }, [lab.imported]);
  useEffect(() => {
    try {
      const lang = localStorage.getItem('bee-language'); if (lang === 'tr' || lang === 'en') setLanguage(lang);
      const raw = localStorage.getItem('bee-history-v1');
      if (raw && raw.length < 2_000_000) {
        const saved: unknown = JSON.parse(raw);
        if (Array.isArray(saved)) setHistory(saved.slice(0, 8).filter(run => { try { validateRun(run); return true; } catch { return false; } }));
      }
    } catch { /* Storage may be unavailable. Live experiments still work. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = language; try { localStorage.setItem('bee-language', language); } catch { /* optional preference */ } }, [language]);
  useEffect(() => {
    if (!lab.exportedRun) return;
    const run = lab.exportedRun;
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `BEE-${run.seed}-tick-${run.tickCount}.json`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setHistory(current => {
      const next = [run, ...current].slice(0, 8); try { localStorage.setItem('bee-history-v1', JSON.stringify(next)); } catch { /* Download succeeds without storage. */ }
      return next;
    });
    setNotice('exported');
    lab.clearExport();
  }, [lab.exportedRun, lab.clearExport]);
  const reset = (config: SimulationConfig, run = false) => { setBaseConfig(structuredClone(config)); setSelected(null); setFollow(false); lab.reset(config, run); setNotice(null); };
  const importRun = (run: unknown) => {
    try { validateRun(run); lab.send({ type: 'import', run }); setDialog(null); setNotice('replaying'); }
    catch { setNotice('invalid'); }
  };
  const onFile = async (file?: File) => {
    if (fileRef.current) fileRef.current.value = '';
    if (!file) return;
    if (file.size > 2_000_000) { setNotice('tooLarge'); return; }
    try { importRun(JSON.parse(await file.text())); } catch { setNotice('unreadable'); }
    if (fileRef.current) fileRef.current.value = '';
  };
  const views = [{ id: 'landscape' as const, en: 'Landscape', tr: 'Peyzaj', icon: Flower2 }, { id: 'dance' as const, en: 'Dance floor', tr: 'Dans alanı', icon: Hexagon }, { id: 'communication' as const, en: 'Communication', tr: 'İletişim', icon: GitBranch }];
  return <>
    <a className="skip-link" href="#laboratory">{t('Skip to laboratory', 'Laboratuvara geç')}</a>
    <header className="site-header" inert={lab.importing}><a href="#laboratory" className="wordmark" aria-label="BEE">BEE</a><span className="brand-subtitle">{t('Collective intelligence laboratory', 'Kolektif zekâ laboratuvarı')}</span>
      <nav aria-label={t('Main navigation', 'Ana menü')}><button className="active" onClick={() => setDialog(null)}>{t('Laboratory', 'Laboratuvar')}</button><button onClick={() => setDialog('experiments')}>{t('Experiments', 'Deneyler')}</button><button onClick={() => setDialog('notes')}>{t('Field notes', 'Araştırma notları')}</button><a href="#learning-guide">{t('Learning guide', 'Öğrenme rehberi')}</a></nav>
      <div className="language-switch" aria-label={t('Language', 'Dil')}><button aria-pressed={language === 'tr'} onClick={() => setLanguage('tr')}>TR</button><span>/</span><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button></div>
    </header>
    <main id="laboratory" tabIndex={-1} inert={lab.importing} aria-busy={lab.importing}>
      <div className="title-band"><div><h1>{experiment.title[language]}</h1><p>{experiment.goal[language]}</p></div><div className="experiment-meta"><span>{experiment.id}</span><span className="control-caption"><i>Apis mellifera</i> · {t('Abstract model', 'Soyut model')}<TermHelp term="collective" language={language} /></span></div></div>
      {lab.error && <div className="notice error" role="alert">{t('The simulation could not complete this action. Reset the experiment to retry.', 'Simülasyon bu işlemi tamamlayamadı. Yeniden denemek için deneyi sıfırlayın.')} <small>{lab.error}</small><button onClick={() => reset(baseConfig)}>{t('Reset experiment', 'Deneyi sıfırla')}</button></div>}
      {!world || !control ? <div className="loading-world" role="status"><Hexagon size={40} strokeWidth={1} /><p>{t('Waking the colony…', 'Koloni hazırlanıyor…')}</p></div> : <>
        <div className={`laboratory-grid ${compare ? 'is-comparing' : ''}`}>
          <ExperimentControls language={language} experiment={experiment} config={baseConfig} world={world} prediction={prediction}
            onPredict={n => { setPrediction(n); reset(baseConfig); }} onReset={config => { setPrediction(null); reset(config); }} send={lab.send} />
          <section className="world-panel panel" aria-label={t('Live experiment', 'Canlı deney')}>
            <div className="view-tabs" role="group" aria-label={t('Visualization mode', 'Görselleştirme modu')}>
              {views.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} aria-pressed={view === item.id} onClick={() => { setView(item.id); setFollow(false); }}><item.icon size={15} /><span>{item[language]}</span></button>)}
            </div>
            <div className="world-reading-key"><span className="control-caption">{t('Read this view', 'Görünümü okuyun')}<TermHelp term={view === 'dance' ? 'danceFloor' : view} language={language} /></span><span className="control-caption">{t('Source quality', 'Kaynak kalitesi')}<TermHelp term="quality" language={language} /></span></div>
            {compare && <div className="compare-label"><span>{t('Experimental colony', 'Deney kolonisi')}</span><span>{t('Dance', 'Dans')} {world.config.behavior.recruitment ? t('ON', 'AÇIK') : t('OFF', 'KAPALI')}</span></div>}
            <WorldCanvas snapshot={world} language={language} view={view} playing={lab.playing} selected={selected} follow={follow} debug={debug} onSelect={id => setSelected(id)} compact={compare} />
            <div className="patch-legend" aria-label={t('Food sources', 'Besin kaynakları')}>{world.patches.map(p => <span key={p.id}><b>{p.id}</b><span>{p.id === 'A' ? t('Near meadow', 'Yakın çayır') : t('Rich meadow', 'Zengin çayır')}<small>{p.active ? `${t('Quality', 'Kalite')} ${p.quality.toFixed(2)}` : t('Source removed', 'Kaynak kaldırıldı')}</small></span></span>)}</div>
            {compare && <div className="control-world"><div className="compare-label"><span>{t('Control colony', 'Kontrol kolonisi')}</span><span>{t('Dance OFF · same seed & ticks', 'Dans KAPALI · aynı seed ve tick')}</span></div><WorldCanvas snapshot={control} language={language} view={view} playing={lab.playing} selected={null} follow={false} debug={debug} onSelect={() => {}} compact />
              <div className="compare-results"><div><span>{t('Collected food', 'Toplanan besin')}</span><strong>{world.metrics.foodCollected.toFixed(1)} <span>/</span> {control.metrics.foodCollected.toFixed(1)}</strong></div><div><span>{t('Difference in this model', 'Bu modeldeki fark')}</span><strong>{control.metrics.foodCollected > 0 ? `${((world.metrics.foodCollected / control.metrics.foodCollected - 1) * 100).toFixed(1)}%` : '—'}</strong></div><p>{t('Experimental / control. One paired run; not a biological effect estimate.', 'Deney / kontrol. Tek eşlenik koşu; biyolojik etki tahmini değildir.')}</p></div>
            </div>}
            <div className="playback-toolbar">
              <button className="play-button" disabled={world.tick >= 36000} onClick={() => lab.send({ type: 'play', playing: !lab.playing })}>{lab.playing ? <Pause size={16} /> : <Play size={16} />}{lab.playing ? t('Pause', 'Duraklat') : t('Run', 'Çalıştır')}</button>
              <div className="speed-controls" role="group" aria-label={t('Simulation speed', 'Simülasyon hızı')}>{([1, 5, 20] as const).map(s => <button key={s} aria-pressed={lab.speed === s} className={lab.speed === s ? 'active' : ''} onClick={() => lab.changeSpeed(s)}>{s}×</button>)}</div>
              <button className="step-button" disabled={world.tick >= 36000} onClick={() => lab.send({ type: 'step' })}><StepForward size={16} />{t('Step', 'Adım')}</button>
              <button className="reset-button" aria-label={t('Reset simulation', 'Simülasyonu sıfırla')} onClick={() => reset(baseConfig)}><RotateCcw size={16} /><span>{t('Reset', 'Sıfırla')}</span></button>
              <button className={`compare-button ${compare ? 'active' : ''}`} aria-pressed={compare} onClick={() => setCompare(!compare)}><BarChart3 size={16} />{t('Compare', 'Karşılaştır')}</button>
              <TermHelp term="comparison" language={language} />
              <div className="model-clock"><span className="control-caption">{t('Model time', 'Model zamanı')}<TermHelp term="time" language={language} /></span><strong data-testid="model-time">{formatTime(world.tick)}</strong><small data-testid="tick-count">{world.tick} tick</small></div>
            </div>
          </section>
          <ColonyInspector world={world} language={language} selected={selected} onSelect={id => { setSelected(id); if (id === null) setFollow(false); }} follow={follow} onFollow={() => setFollow(!follow)} />
        </div>
        {world.tick >= 36000 && <p className="notice" role="status">{t('Run complete: the 36,000-tick limit has been reached. Export your results or reset to start again.', 'Koşu tamamlandı: 36.000 tick sınırına ulaşıldı. Sonuçları dışa aktarın veya yeniden başlamak için sıfırlayın.')}</p>}
        <div className="learning-band"><div className="learning-steps"><span><Eye />{t('Observe', 'Gözle')}</span><ArrowRight /><span><MessageCircle />{t('Predict', 'Öngör')}</span><ArrowRight /><span><Play />{t('Run', 'Çalıştır')}</span><ArrowRight /><span><BarChart3 />{t('Measure', 'Ölç')}</span></div><div className="interpretation">{prediction !== null && <strong>{t('Your prediction: ', 'Tahmininiz: ')}{experiment.predictions[prediction][language]}</strong>}<p>{experiment.explanation[language]}</p></div></div>
        <div className="run-details"><span className="mono">Seed {world.config.seed} · {t('Model', 'Model')} 0.1.0</span><label htmlFor="population">{t('Population · new run', 'Arı sayısı · yeni koşu')}<select id="population" value={baseConfig.population} onChange={e => { setPrediction(null); reset({ ...baseConfig, population: Number(e.target.value) }); }}>{[100,160,500,1000,...(![100,160,500,1000].includes(baseConfig.population) ? [baseConfig.population] : [])].map(n => <option key={n} value={n}>{n}</option>)}</select></label><span className="control-caption"><label><input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} />{t('Inspect signals & performance', 'Sinyal ve performansı incele')}</label><TermHelp term="performance" language={language} /></span>{debug && <span className="mono" data-testid="worker-timing">{lab.workerTicks ? `${lab.workerMs.toFixed(2)} ms / ${lab.workerTicks} ${t(lab.workerTicks === 1 ? 'paired tick' : 'paired ticks', 'eşlenik tick')}` : t('Worker timing: awaiting step', 'İşlem süresi: adım bekleniyor')}</span>}</div>
      </>}
      <LearningGuide key={experiment.id} language={language} experiment={experiment} />
    </main>
    {noticeText && <p className="notice" role="status">{noticeText}</p>}
    <footer className="site-footer" inert={lab.importing}><span><strong>BEE</strong> v0.1 · {t('Model units, not field measurements', 'Model birimleri, saha ölçümleri değildir')}</span><div><TermHelp term="replay" language={language} /><button onClick={() => setDialog('history')}>{t('Local history', 'Yerel geçmiş')} ({history.length})</button><button onClick={() => fileRef.current?.click()}><Upload size={16} />{t('Import run', 'Koşu içe aktar')}</button><button disabled={!world} onClick={() => lab.send({ type: 'export' })}>{t('Export run', 'Koşuyu dışa aktar')}<Download size={17} /></button></div></footer>
    <input ref={fileRef} className="visually-hidden" type="file" accept=".json,application/json" aria-label={t('Import run file', 'Koşu dosyası içe aktar')} onChange={e => { void onFile(e.target.files?.[0]); }} />
    {dialog && <LabDialog title={dialog === 'experiments' ? t('Experiments', 'Deneyler') : dialog === 'notes' ? t('Field notes', 'Araştırma notları') : t('Local run history', 'Yerel koşu geçmişi')} onClose={() => setDialog(null)} closeLabel={t('Close dialog', 'Pencereyi kapat')}>
      {dialog === 'notes' && <FieldNotes language={language} />}
      {dialog === 'experiments' && <><p className="notes-lead">{t('Small rules. Observable collective behavior.', 'Küçük kurallar. Gözlenebilir ortak davranış.')}</p><div className="experiment-list">{experiments.map(e => <button key={e.id} className={e.id === experiment.id ? 'selected' : ''} onClick={() => { setPrediction(null); reset(experimentConfig(e.id, baseConfig.seed), !window.matchMedia('(prefers-reduced-motion: reduce)').matches); setDialog(null); }}><span className="mono">{e.id}</span><div><strong>{e.shortTitle[language]}</strong><p>{e.goal[language]}</p></div><ArrowRight size={18} /></button>)}</div><div className="roadmap-note"><FlaskConical size={22} /><p>{t('Next research steps: stale information, communication noise, scout diversity, dynamic labor, nest selection and quorum. These are research directions, not completed modules.', 'Sonraki araştırma adımları: eski bilgi, iletişim gürültüsü, keşifçi çeşitliliği, dinamik iş bölümü, yuva seçimi ve çoğunluk eşiği. Bunlar araştırma yönleri; tamamlanmış modüller değildir.')}</p></div></>}
      {dialog === 'history' && <><p>{t('The last eight exported runs are stored only in this browser. Replaying pauses at the recorded tick.', 'Dışa aktarılan son sekiz koşu yalnızca bu tarayıcıda saklanır. Yeniden oynatma kayıtlı tick’te duraklar.')}</p>{history.length === 0 ? <p className="empty-history">{t('No exported runs yet. Export an experiment to keep a replay here.', 'Henüz dışa aktarılmış koşu yok. Buraya kaydetmek için bir deneyi dışa aktarın.')}</p> : <div className="history-list">{history.map((run, i) => <button key={i} onClick={() => importRun(run)}><span>{run.parameters.experimentId} · Seed {run.seed}</span><span>{run.tickCount} tick</span><Play size={16} /></button>)}</div>}</>}
    </LabDialog>}
  </>;
}
