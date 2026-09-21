import { ArrowUpRight } from 'lucide-react';
import type { Language } from '../experiments/catalog';

export function PortfolioContext({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <section className="portfolio-context" aria-labelledby="portfolio-title">
    <h2 id="portfolio-title">{t('BEE in the learning system', 'Öğrenme sisteminde BEE')}</h2>
    <p>{t('Explore collective intelligence through four reproducible experiments. SWI supplies the research context; BEE explores private memory and local dance signals, while ANT explores environmental traces. Compare mechanisms and assumptions across the two labs, not their numerical scores.', 'Kolektif zekâyı dört tekrarlanabilir deneyle keşfedin. SWI araştırma bağlamını sunar; BEE bireysel hafıza ve yerel dans sinyallerini, ANT ise çevresel izleri inceler. İki laboratuvarın mekanizmalarını ve varsayımlarını karşılaştırın; sayısal puanlarını doğrudan karşılaştırmayın.')}</p>
    <nav className="ecosystem-links" aria-label={t('Continue learning', 'Öğrenmeye devam edin')}>
      <a href={`https://aserdargun.com/${language === 'tr' ? 'tr/' : ''}`}>aserdargun.com · {t('Learning system', 'Öğrenme sistemi')}<ArrowUpRight size={14} aria-hidden="true" /></a>
      <a href={`https://swi.aserdargun.com/${language}/`}>SWI · {t('Research', 'Araştırma')}<ArrowUpRight size={14} aria-hidden="true" /></a>
      <a href={`https://ant.aserdargun.com/?lang=${language}`}>ANT · {t('Environmental traces', 'Çevresel izler')}<ArrowUpRight size={14} aria-hidden="true" /></a>
    </nav>
    <p className="control-note">{t('These links connect learning resources. Runs stay in BEE; opening another app does not transfer your experiment. Export JSON to preserve a run.', 'Bu bağlantılar öğrenme kaynaklarını birleştirir. Koşular BEE’de kalır; başka uygulamayı açmak deneyinizi aktarmaz. Koşuyu saklamak için JSON dışa aktarın.')}</p>
  </section>;
}
