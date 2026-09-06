import type { MetricPoint } from '../simulation/types';
import type { Language } from '../experiments/catalog';
export function ThroughputChart({ history, language }: { history: MetricPoint[]; language: Language }) {
  const max = Math.max(10, ...history.map(p => p.throughput)), first = history[0]?.tick ?? 0, last = history.at(-1)?.tick ?? 0;
  const points = history.map(p => `${30 + (p.tick - first) / Math.max(1, last - first) * 195},${108 - p.throughput / max * 88}`).join(' ');
  return <svg className="throughput-chart" viewBox="0 0 240 145" role="img" aria-label={language === 'tr' ? 'Son 600 model saniyesindeki toplam besin akışı' : 'Total food throughput over the last 600 model seconds'}>
    {[0, 0.5, 1].map(f => <g key={f}><line x1="30" y1={108 - f * 88} x2="225" y2={108 - f * 88} stroke="#d8d8cc" strokeDasharray="2 3" /><text x="23" y={112 - f * 88} textAnchor="end">{Math.round(f * max)}</text></g>)}
    <polyline points={points} fill="none" stroke="#6e8874" strokeWidth="2" strokeLinejoin="round" />
    <text x="30" y="125">{(first / 10).toFixed(0)}s</text><text x="225" y="125" textAnchor="end">{(last / 10).toFixed(0)}s</text>
    <text x="128" y="141" textAnchor="middle">{language === 'tr' ? 'Model zamanı' : 'Model time'}</text>
  </svg>;
}
