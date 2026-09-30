import { ArrowUpRight, FlaskConical } from 'lucide-react';
import type { Language } from '../experiments/catalog';

/**
 * The next modules, straight from docs/ROADMAP.md. Present scope reads as
 * chosen rather than thin: these are named, ordered and bounded, not implied.
 * Nothing here claims a date or a result.
 */
const nextModules = [
  { id: 'BEE-010', title: { tr: 'Yeter sayı eşiği', en: 'Quorum' },
    body: { tr: 'Yuva yerine özel destek eşiği, taahhüt ölçütleri ve karar doğruluğu tanımları. Eşik site yereldir; merkezi bir karar değişkeni değildir.', en: 'Site-local support threshold, commitment criteria and decision-accuracy definitions. The threshold is site-local, not a central decision variable.' } },
  { id: 'BEE-009', title: { tr: 'Yeni ev seçimi', en: 'Choose a new home' },
    body: { tr: 'Yuva yeri ve rapor alanı ayrı bir alan olarak; arılar tekrar eden yerel incelemelerle kendi gözlemlerini bildirir.', en: 'A separate nest-site and report domain, where bees report through repeated local inspections of their own.' } },
  { id: 'BEE-008', title: { tr: 'Dinamik iş bölümü', en: 'Dynamic task allocation' },
    body: { tr: 'Alıcı kuyrukları ve yerel yanıt eşikleri. Global görev tahsisi olmadan; hiçbir arı koloni ölçümünü okuyamaz.', en: 'Receiver queues and local response thresholds, without global task allocation. No bee reads colony metrics.' } },
];
export function NextScope({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <section className="next-scope" aria-labelledby="next-scope-title">
    <h2 id="next-scope-title">{t('What comes next, and what it will not assume', 'Sırada ne var, ne varsaymayacak')}</h2>
    <p className="notes-lead">{t('The current slice covers foraging and recruitment. These three modules are named and bounded before any are built.', 'Mevcut dilim besin arama ve katılımı kapsar. Bu üç modül uygulanmadan önce adlandırılır ve sınırları çizilir.')}</p>
    <ul className="next-modules">{nextModules.map(item => <li key={item.id}>
      <span className="mono">{item.id}</span>
      <div><strong>{item.title[language]}</strong><p>{item.body[language]}</p></div>
    </li>)}</ul>
    <p className="control-note"><FlaskConical size={16} aria-hidden="true" /> {t('BEE-005 to BEE-007 reuse existing removal, noise and scout-ratio controls; their dedicated lessons and repeated-seed studies are pending. A sandbox that edits world geometry waits until the guided experiments stay interpretable, and thermoregulation needs its own field, sensors and energy assumptions rather than an animated overlay.', 'BEE-005 – BEE-007 mevcut kaynak kaldırma, gürültü ve keşifçi oranı kontrollerini yeniden kullanır; ayrı dersleri ve tekrarlanan seed çalışmaları bekliyor. Rehberli deneyler yorumlanabilir kaldıkça dünya geometrisini düzenleyen sandbox bekler; sıcaklık düzenleme ise animasyonlu bir katman yerine kendi alanı, sensörleri ve enerji varsayımları ister.')}</p>
  </section>;
}

/**
 * BEE and ANT are sibling laboratories over the same two-paper family with
 * different mechanisms. Stated symmetrically, and explicitly non-comparable
 * numerically: no comparative number is invented here.
 */
export function CompanionLab({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <section className="companion-lab" aria-labelledby="companion-title">
    <h2 id="companion-title">{t('BEE and ANT, side by side', 'BEE ve ANT, yan yana')}</h2>
    <table className="definitions companion-table">
      <thead><tr>
        <th scope="col">{t('Laboratory', 'Laboratuvar')}</th>
        <th scope="col">{t('Mechanism modelled', 'Modellenen mekanizma')}</th>
        <th scope="col">{t('Signal between individuals', 'Bireyler arası sinyal')}</th>
      </tr></thead>
      <tbody>
        <tr><th scope="row">BEE</th>
          <td>{t('Foraging and recruitment around a fixed nest. Apis mellifera inspired.', 'Sabit yuva çevresinde besin arama ve katılım. Apis mellifera esinli.')}</td>
          <td>{t('Waggle dance, observed by nearby bees, plus each bee’s private memory.', 'Yakındaki arılarca gözlenen sallanma dansı ve her arının bireysel hafızası.')}</td></tr>
        <tr><th scope="row"><a href={`https://ant.aserdargun.com/?lang=${language}`} target="_blank" rel="noreferrer">ANT<ArrowUpRight size={14} aria-hidden="true" /></a></th>
          <td>{t('Coordination through environmental traces, as a separate colony model.', 'Ayrı bir koloni modeli olarak çevresel izlerle koordinasyon.')}</td>
          <td>{t('Traces left in the environment and read back by others.', 'Çevreye bırakılan ve başkalarınca yeniden okunan izler.')}</td></tr>
      </tbody>
    </table>
    <p className="control-note">{t('Same two-paper family, different mechanism. Their numbers come from different models, units and rules, so they are not directly comparable; compare the mechanisms and assumptions, not the values. Opening ANT does not transfer a BEE run — export JSON to keep one.', 'Aynı iki makalelik aile, farklı mekanizma. Sayıları farklı modellerden, birimlerden ve kurallardan gelir; bu nedenle doğrudan karşılaştırılamaz. Değerleri değil, mekanizmaları ve varsayımları karşılaştırın. ANT’yi açmak BEE koşusunu aktarmaz — bir koşuyu saklamak için JSON dışa aktarın.')}</p>
  </section>;
}
