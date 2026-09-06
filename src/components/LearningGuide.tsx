'use client';
import { memo, useState } from 'react';
import { ArrowUp, BookOpen, ChevronDown, Search } from 'lucide-react';
import type { Experiment, Language } from '../experiments/catalog';
import { terms } from '../education/terms';
import { lessons } from '../education/lessons';

const glossary = Object.entries(terms);

function Glossary({ language }: { language: Language }) {
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase(language);
  const matches = glossary.filter(([id, entry]) => [id, entry.title.tr, entry.title.en, entry.definition[language], entry.example[language]]
    .some(value => value.toLocaleLowerCase(language).includes(normalized)));
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <details className="learning-disclosure glossary">
    <summary><span><span className="lesson-kicker">{t('KEEP AT HAND', 'ELİNİZİN ALTINDA')}</span><strong>{t('Term glossary', 'Terim sözlüğü')}</strong><span className="disclosure-description">{t('Plain definitions, model units and reading examples.', 'Sade tanımlar, model birimleri ve okuma örnekleri.')}</span></span><ChevronDown size={20} aria-hidden="true" /></summary>
    <div className="disclosure-body">
      <label className="glossary-search" htmlFor="term-search"><Search size={18} aria-hidden="true" /><span className="visually-hidden">{t('Search terms', 'Terim ara')}</span><input id="term-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Try seed, memory or food…', 'Seed, hafıza veya besin arayın…')} /></label>
      <p className="glossary-count" role="status">{t(`${matches.length} of ${glossary.length} terms`, `${glossary.length} terimden ${matches.length} tanesi`)}</p>
      {matches.length ? <dl className="glossary-grid">{matches.map(([id, entry]) => <div key={id}><dt>{entry.title[language]}</dt><dd><p>{entry.definition[language]}</p><p className="glossary-example">{entry.example[language]}</p></dd></div>)}</dl>
        : <div className="glossary-empty"><p>{t('No matching terms. Try a shorter word or clear the search.', 'Eşleşen terim yok. Daha kısa bir sözcük deneyin veya aramayı temizleyin.')}</p><button type="button" onClick={() => setQuery('')}>{t('Clear search', 'Aramayı temizle')}</button></div>}
    </div>
  </details>;
}

export const LearningGuide = memo(function LearningGuide({ language, experiment }: { language: Language; experiment: Experiment }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  const [answer, setAnswer] = useState<number | null>(null);
  const lesson = lessons[experiment.id];
  return <section id="learning-guide" className="learning-guide" aria-labelledby="learning-title" tabIndex={-1}>
    <div className="learning-heading"><div><span className="lesson-kicker"><BookOpen size={16} aria-hidden="true" />{t('LEARNING GUIDE', 'ÖĞRENME REHBERİ')}</span><h2 id="learning-title">{t('From one bee to a colony.', 'Bir arıdan koloniye.')}</h2><p>{t('Understand the terms, try an experiment and explain what you observe.', 'Terimleri anlayın, bir deney yapın ve gözlediğinizi açıklayın.')}</p></div><a href="#laboratory"><ArrowUp size={15} aria-hidden="true" />{t('Back to the laboratory', 'Laboratuvara dön')}</a></div>
    <ol className="mechanism-cards" aria-label={t('How collective behavior emerges', 'Ortak davranış nasıl oluşur')}>
      <li><span className="mechanism-number">01</span><h3>{t('An individual discovers.', 'Birey keşfeder.')}</h3><p>{t('A scout encounters a source nearby and stores its location and quality in private memory.', 'Keşifçi, yakındaki bir kaynağı bulur; konumu ve kaliteyi kendi hafızasına kaydeder.')}</p></li>
      <li><span className="mechanism-number">02</span><h3>{t('A local message travels.', 'Yerel bilgi aktarılır.')}</h3><p>{t('A successful return can lead to a dance. A nearby observer may follow an estimate of the source.', 'Başarılı dönüş bir dansa yol açabilir. Yakındaki gözlemci kaynağın tahmini konumunu izleyebilir.')}</p></li>
      <li><span className="mechanism-number">03</span><h3>{t('A pattern emerges.', 'Ortak davranış oluşur.')}</h3><p>{t('Repeated visits and local recruitment shape allocation. Colony metrics are readouts for you; bees cannot use them.', 'Tekrarlanan ziyaretler ve yerel katılım dağılımı şekillendirir. Koloni ölçümleri sizin içindir; arılar bunları kullanamaz.')}</p></li>
    </ol>
    <p className="learning-assumption"><strong>{t('Model boundary', 'Modelin sınırı')}</strong>{t('These steps explain BEE’s rules. Distances, food and time are model units; the results are not field measurements. Use Field notes for biological sources and assumptions.', 'Bu adımlar BEE’nin kurallarını açıklar. Mesafe, besin ve zaman model birimleridir; sonuçlar saha ölçümü değildir. Biyolojik kaynaklar ve varsayımlar için Araştırma notları bölümünü kullanın.')}</p>
    {lesson && <div className="lesson-layout">
      <section className="experiment-lesson" aria-labelledby="experiment-lesson-title"><span className="lesson-kicker">{experiment.id} · {t('TRY IT', 'UYGULAYIN')}</span><h3 id="experiment-lesson-title">{experiment.shortTitle[language]}</h3><ol className="experiment-instructions">{lesson.steps.map((step, index) => <li key={index}><span className="instruction-number">{index + 1}</span><div><h4>{step.title[language]}</h4><p>{step.body[language]}</p></div></li>)}</ol></section>
      <section className="knowledge-check" aria-labelledby="check-title"><span className="lesson-kicker">{t('PAUSE & THINK', 'DURUN VE DÜŞÜNÜN')}</span><h3 id="check-title">{t('Check your understanding', 'Kendinizi sınayın')}</h3><fieldset><legend>{lesson.question[language]}</legend>{lesson.options.map((option, index) => <label key={index}><input type="radio" name={`knowledge-check-${experiment.id}`} checked={answer === index} onChange={() => setAnswer(index)} /><span>{option[language]}</span></label>)}</fieldset>
        {answer !== null && <div className={`check-feedback ${answer === lesson.answer ? 'is-correct' : ''}`} role="status"><strong>{answer === lesson.answer ? t('That’s right. Here’s why.', 'Doğru. Nedeni şu:') : t('Revisit the model’s rule.', 'Modelin kuralını yeniden düşünün.')}</strong><p>{lesson.explanation[language]}</p></div>}
        <p className="check-note">{t('This question checks the model’s rules. Your experimental prediction is separate; compare it with the run you observe.', 'Bu soru modelin kurallarını sınar. Deney tahmininiz ayrıdır; onu gözlediğiniz koşuyla karşılaştırın.')}</p>
      </section>
    </div>}
    <Glossary language={language} />
  </section>;
});
