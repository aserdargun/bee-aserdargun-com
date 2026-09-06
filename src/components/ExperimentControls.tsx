'use client';
import { useEffect, useState } from 'react';
import { RotateCcw, Sprout } from 'lucide-react';
import type { Experiment, Language } from '../experiments/catalog';
import type { SimulationConfig, WorldSnapshot } from '../simulation/types';
import type { WorkerRequest } from '../simulation/protocol';
import { TermHelp } from './TermHelp';

interface Props { language: Language; experiment: Experiment; config: SimulationConfig; world: WorldSnapshot; prediction: number | null; onPredict: (n: number) => void; onReset: (c: SimulationConfig) => void; send: (m: WorkerRequest) => void }
export function ExperimentControls({ language, experiment, config, world, prediction, onPredict, onReset, send }: Props) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  const [seed, setSeed] = useState(String(config.seed)), [scouts, setScouts] = useState(config.behavior.scoutRatio);
  const [noise, setNoise] = useState(world.config.behavior.danceNoise), [seedError, setSeedError] = useState('');
  useEffect(() => { setSeed(String(config.seed)); setScouts(config.behavior.scoutRatio); }, [config]);
  useEffect(() => { setNoise(world.config.behavior.danceNoise); }, [world.config.behavior.danceNoise]);
  const applyScouts = () => { if (scouts !== config.behavior.scoutRatio) onReset({ ...config, behavior: { ...config.behavior, scoutRatio: scouts } }); };
  const applyNoise = () => { if (noise !== world.config.behavior.danceNoise) send({ type: 'intervene', command: { type: 'behavior', danceNoise: noise } }); };
  const b = world.patches.find(p => p.id === 'B')!;
  return <aside className="experiment-rail panel" aria-label={t('Experiment controls', 'Deney kontrolleri')}>
    <h2>{t('The experiment', 'Deney')}</h2>
    <p className="question">{experiment.question[language]}</p>
    <fieldset className="predictions"><legend>{t('Your prediction', 'Tahmininiz')}</legend>
      {experiment.predictions.map((item, i) => <label key={i}><input type="radio" name="prediction" checked={prediction === i} onChange={() => onPredict(i)} /><span>{item[language]}</span></label>)}
    </fieldset>
    <section className="controls-section"><h3>{t('Colony controls', 'Koloni kontrolleri')}</h3>
      <div className="toggle-row"><span className="control-caption"><label htmlFor="recruitment">{t('Dance recruitment', 'Dansla katılım')}</label><TermHelp term="recruitment" language={language} /></span><span className="switch"><input id="recruitment" aria-label={t('Dance recruitment', 'Dansla katılım')} type="checkbox" checked={world.config.behavior.recruitment} onChange={e => send({ type: 'intervene', command: { type: 'behavior', recruitment: e.target.checked } })} /><span className="switch-track" /></span></div>
      <div className="range-field"><div className="control-caption"><label htmlFor="scouts">{t('Scout proportion', 'Keşifçi oranı')}</label><TermHelp term="scouts" language={language} /><output htmlFor="scouts">{Math.round(scouts * 100)}%</output></div>
        <input id="scouts" type="range" min="0.01" max="0.5" step="0.01" value={scouts} onChange={e => setScouts(Number(e.target.value))} onPointerUp={applyScouts} onKeyUp={applyScouts} onBlur={applyScouts} />
        <div className="range-ends"><span>1%</span><span>50%</span></div>
      </div>
      <div className="range-field"><div className="control-caption"><label htmlFor="noise">{t('Communication noise', 'İletişim gürültüsü')}</label><TermHelp term="noise" language={language} /><output htmlFor="noise">{Math.round(noise * 100)}%</output></div>
        <input id="noise" type="range" min="0" max="1" step="0.01" value={noise} onChange={e => setNoise(Number(e.target.value))} onPointerUp={applyNoise} onKeyUp={applyNoise} onBlur={applyNoise} />
        <div className="range-ends"><span>0%</span><span>100%</span></div>
      </div>
      <form className="seed-field" onSubmit={e => { e.preventDefault(); const value = Number(seed);
        if (!/^\d+$/.test(seed) || !Number.isSafeInteger(value) || value < 0 || value > 4294967295) { setSeedError(t('Use an integer from 0 to 4294967295.', '0–4294967295 arasında bir tam sayı girin.')); return; }
        setSeedError(''); onReset({ ...config, seed: value }); }}>
        <div className="control-caption"><label htmlFor="seed">Seed</label><TermHelp term="seed" language={language} /></div><div><input id="seed" inputMode="numeric" value={seed} onChange={e => setSeed(e.target.value)} aria-describedby="seed-help" /><button type="submit">{t('Apply', 'Uygula')}</button></div>
        {seedError && <p className="error" role="alert">{seedError}</p>}
      </form>
      <p id="seed-help" className="control-note">{t('Seed or scout changes start a new run.', 'Seed ve keşifçi ayarı yeni koşu başlatır.')}</p>
    </section>
    <button className="text-button reset-experiment" onClick={() => onReset(config)}><RotateCcw size={16} />{t('Reset experiment', 'Deneyi sıfırla')}</button>
    <button className="source-button" onClick={() => send({ type: 'intervene', command: { type: 'patch', patchId: 'B', active: !b.active } })}><Sprout size={16} />{b.active ? t('Remove source B', 'B kaynağını kaldır') : t('Restore source B', 'B kaynağını geri getir')}</button>
    <div className="control-caption intervention-caption"><span>{t('Changes during a run', 'Koşu sırasında değişiklik')}</span><TermHelp term="intervention" language={language} /></div>
  </aside>;
}
