import { ArrowUpRight } from 'lucide-react';
import type { Language } from '../experiments/catalog';
import { evidence, evidenceScope, sourcesChecked } from '../experiments/evidence';

/**
 * The three primary sources and their limitations, outside the field-notes
 * dialog. A visitor sees which literature motivates the model and what BEE
 * does not do, without opening a dialog. The limitation wording is the same
 * string the dialog renders, imported from src/experiments/evidence.
 */
export function EvidenceSummary({ language }: { language: Language }) {
  const t = (en: string, tr: string) => language === 'en' ? en : tr;
  return <section className="evidence-summary" aria-labelledby="evidence-summary-title">
    <h2 id="evidence-summary-title">{t('Sources, with their limits', 'Kaynaklar ve sınırları')}</h2>
    <ul className="evidence-summary-list">{evidence.map(paper => <li key={paper.id}>
      <a href={paper.url} target="_blank" rel="noreferrer"><span className="mono">{paper.year}</span>{paper.title}<ArrowUpRight size={14} aria-hidden="true" /></a>
      <p>{paper.note[language]}</p>
    </li>)}</ul>
    <p className="control-note">{sourcesChecked[language]} {evidenceScope[language]}</p>
  </section>;
}
