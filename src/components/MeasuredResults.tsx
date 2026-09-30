import type { Language } from '../experiments/catalog';
import { measuredPairs, measuredRuntime, measuredNote, measuredSeedPinned, measuredMachineNote, measuredVersions } from '../experiments/measurements';

/**
 * Surfaces the recorded headless batch from docs/validation/batch-results.json.
 * Labelled as seed-pinned, machine-dependent simulation output, so produced
 * evidence is visible without implying a field measurement.
 */
export function MeasuredResults({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  const versionList = Object.entries(measuredVersions).map(([key, value]) => `${key} ${value}`).join(' · ');
  return <section className="measured-results" aria-labelledby="measured-title">
    <h2 id="measured-title">{t('What has been measured', 'Neler ölçüldü')}</h2>
    <p className="notes-lead">{t('Five seeds, dance on and off, 6,000 ticks each. Recorded headless output, not a field survey.', 'Beş seed, dans açık ve kapalı, her biri 6.000 tick. Kaydedilmiş başsız çıktı; saha araştırması değil.')}</p>
    <p className="control-note">{measuredNote[language]}</p>
    <p className="control-note"><span className="mono">{measuredSeedPinned[language]}</span> · {measuredMachineNote[language]} <span className="mono">· {measuredRuntime}</span></p>
    <div className="measured-table-scroll" role="region" tabIndex={0} aria-label={t('Measured results, scrollable table', 'Ölçülen sonuçlar, kaydırılabilir tablo')}>
      <table className="definitions measured-table">
        <caption>{t('Food, allocation and recruitment per seed. Model units, not grams or field counts.', 'Seed başına besin, dağılım ve katılım. Model birimleri; gram veya saha sayımı değil.')}</caption>
        <thead><tr>
          <th scope="col">{t('Seed', 'Seed')}</th>
          <th scope="col">{t('Dance', 'Dans')}</th>
          <th scope="col">{t('Food', 'Besin')}</th>
          <th scope="col">{t('Allocation A / B', 'Dağılım A / B')}</th>
          <th scope="col">{t('Recruitments', 'Katılımlar')}</th>
          <th scope="col">{t('First discovery (tick)', 'İlk keşif (tick)')}</th>
          <th scope="col">{t('Elapsed (this machine)', 'Süre (bu makine)')}</th>
        </tr></thead>
        <tbody>{measuredPairs.map(pair => [pair.dance, pair.control].filter(row => row !== undefined).map(row => <tr key={`${pair.seed}-${String(row.recruitment)}`}>
          <th scope="row" className="mono">{pair.seed}</th>
          <td>{row.recruitment ? t('On', 'Açık') : t('Off', 'Kapalı')}</td>
          <td>{row.food.toFixed(1)}</td>
          <td>{row.allocation.A} / {row.allocation.B}</td>
          <td>{row.recruitments}</td>
          <td>{row.firstDiscoveryTick}</td>
          <td>{row.elapsedMs.toFixed(1)} ms</td>
        </tr>))}</tbody>
      </table>
    </div>
    <p className="control-note">{t('Model versions', 'Model sürümleri')}: <span className="mono">{versionList}</span></p>
  </section>;
}
