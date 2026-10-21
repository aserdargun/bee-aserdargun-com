import { ArrowUpRight } from 'lucide-react';
import type { Language } from '../experiments/catalog';
import { evidence, evidenceScope, sourcesChecked } from '../experiments/evidence';
import {
  communicationNote,
  educationalSimplification,
  modelRules,
  reproducibilityNote,
} from '../education/model-rules';
export function FieldNotes({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <div className="field-notes">
    <p className="notes-lead">{t('A model of communication, not a biological prediction.', 'İletişimi araştıran bir model; biyolojik tahmin aracı değildir.')}</p>
    <dl className="evidence-labels">
      <div><dt>{t('Observed biology', 'Gözlenen biyoloji')}</dt><dd>{t('Apis mellifera foragers can transfer food-location information through waggle dances. Recruitment and abandonment help shape allocation.', 'Apis mellifera toplayıcıları sallanma dansıyla besinin konum bilgisini aktarabilir. Katılım ve terk etme kaynak dağılımını etkiler.')}</dd></div>
      <div><dt>{t('Model abstraction', 'Model soyutlaması')}</dt><dd>{t('Private resource memories, expiring local dances and probabilistic followers. Scouts search independently; no bee can read colony metrics.', 'Bireysel kaynak hafızası, süreli yerel danslar ve olasılıksal katılım. Keşifçiler bağımsız arar; arılar koloni ölçümlerine erişemez.')}</dd></div>
      <div><dt>{t('Simulation assumption', 'Simülasyon varsayımı')}</dt><dd>{t('Constant flight speed, a fixed sensor radius, round patches, a configured scout trait and bounded angular/distance noise. Cargo is counted on arrival, followed by dancing or a fixed rest interval.', 'Sabit uçuş hızı ve algılama yarıçapı, dairesel kaynaklar, ayarlanmış keşifçi özelliği ve sınırlı açı/mesafe gürültüsü. Yük varışta sayılır; ardından dans veya sabit süreli dinlenme gelir.')}</dd></div>
      <div><dt>{t('Educational simplification', 'Eğitsel basitleştirme')}</dt><dd>{educationalSimplification[language]}</dd></div>
    </dl>
    <h3>{t('What the numbers mean', 'Sayılar ne anlama geliyor?')}</h3>
    <table className="definitions"><thead><tr><th>{t('Measure', 'Ölçüm')}</th><th>{t('Definition & limit', 'Tanım ve sınır')}</th></tr></thead><tbody>
      {modelRules.map(rule => <tr key={rule.id}><th>{rule.measure[language]}</th>
        <td>{rule.definition ? rule.definition[language] : <><code>{rule.formula}</code>{rule.note && <p>{rule.note[language]}</p>}</>}</td></tr>)}
    </tbody></table>
    <h3>{t('Evidence, with boundaries', 'Dayanaklar ve sınırları')}</h3>
    {evidence.map(paper => <article className="paper" key={paper.id}><span className="mono">{paper.year}</span><a href={paper.url} target="_blank" rel="noreferrer">{paper.title}<ArrowUpRight size={15} /></a><p>{paper.note[language]}</p></article>)}
    <p className="control-note">{sourcesChecked[language]} {evidenceScope[language]}</p>
    <h3>{t('Reproducibility', 'Tekrarlanabilirlik')}</h3>
    <p>{reproducibilityNote[language]}</p>
    <p>{communicationNote[language]}</p>
    <div className="ecosystem-links"><a href={`https://swi.aserdargun.com/${language}/`} target="_blank" rel="noreferrer">SWI · {t('Swarm intelligence', 'Sürü zekâsı')}<ArrowUpRight size={14} /></a><a href={`https://ant.aserdargun.com/?lang=${language}`} target="_blank" rel="noreferrer">ANT · {t('Environmental traces', 'Çevresel izler')}<ArrowUpRight size={14} /></a></div>
  </div>;
}
