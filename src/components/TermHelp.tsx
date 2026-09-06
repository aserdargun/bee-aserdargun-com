'use client';
import { memo, useId } from 'react';
import { Info, X } from 'lucide-react';
import type { Language } from '../experiments/catalog';
import { terms, type TermId } from '../education/terms';

export const TermHelp = memo(function TermHelp({ term, language }: { term: TermId; language: Language }) {
  const id = useId();
  const entry = terms[term];
  return <span className="term-help">
    <button type="button" className="term-help-trigger" popoverTarget={id}
      aria-label={language === 'tr' ? `${entry.title.tr} hakkında bilgi` : `About ${entry.title.en.toLowerCase()}`}>
      <Info size={15} aria-hidden="true" />
    </button>
    <span id={id} className="term-popover" popover="auto" role="note" aria-labelledby={`${id}-title`}>
      <span className="term-popover-heading">
        <strong id={`${id}-title`}>{entry.title[language]}</strong>
        <button type="button" popoverTarget={id} popoverTargetAction="hide" aria-label={language === 'tr' ? 'Bilgi kutusunu kapat' : 'Close explanation'}><X size={17} aria-hidden="true" /></button>
      </span>
      <span className="term-definition">{entry.definition[language]}</span>
      <span className="term-example"><strong>{language === 'tr' ? 'Nasıl okumalı?' : 'How to read it'}</strong>{entry.example[language]}</span>
      <span className="term-scope">{language === 'tr' ? 'BEE modelinin açıklamasıdır; saha ölçümü değildir.' : 'Describes the BEE model; not a field measurement.'}</span>
    </span>
  </span>;
});
