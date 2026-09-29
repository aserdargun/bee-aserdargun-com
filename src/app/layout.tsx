import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-mono/400.css';
import './globals.css';
import './education.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://bee.aserdargun.com'),
  title: 'BEE - Honey Bee Collective Intelligence Laboratory',
  description: 'SWI araştırma ailesinde dört tekrarlanabilir bal arısı deneyi. Bilingual educational model of local discovery, dance recruitment and collective foraging; not a biological predictor. TR / EN.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'BEE - Honey Bee Collective Intelligence Laboratory',
    title: 'BEE - Honey Bee Collective Intelligence Laboratory',
    description: 'Four deterministic, bilingual experiments within SWI\u2019s research family: explore local discovery, private memory, dance recruitment and resource allocation with a same-seed dance-off control, guided lessons and JSON replay. An Apis mellifera-inspired educational model; results use model units, not field measurements or biological predictions.',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'BEE - Honey Bee Collective Intelligence Laboratory',
    description: 'Four deterministic, bilingual experiments within SWI\u2019s research family: explore local discovery, private memory, dance recruitment and resource allocation with a same-seed dance-off control, guided lessons and JSON replay. An Apis mellifera-inspired educational model; results use model units, not field measurements or biological predictions.',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <div style={{ maxWidth: '52rem', margin: '3rem auto', padding: '0 1rem', fontFamily: 'sans-serif', lineHeight: 1.6 }}>
            <h1>BEE - Honey Bee Collective Intelligence Laboratory</h1>
            <p>
              BEE is a bilingual educational model of honey-bee foraging and
              recruitment, with four deterministic experiments inside SWI&rsquo;s
              research family. The interactive laboratory needs JavaScript; the
              summary below does not.
            </p>
            <p lang="tr">
              BEE, SWI araştırma ailesinde yer alan, bal arısı besin arama ve
              dansla katılımını konu alan iki dilli bir eğitim modelidir. Etkileşimli
              laboratuvar JavaScript gerektirir; aşağıdaki özet gerektirmez.
            </p>
            <p>What this laboratory covers:</p>
            <ul>
              <li>Local discovery: how a single scout finds a source and what the colony notices.</li>
              <li>Private memory: what a forager keeps, and what stays unknown to it.</li>
              <li>Dance recruitment: a same-seed dance-off control comparing recruitment on and off.</li>
              <li>Resource allocation: computed observer metrics across a deterministic run.</li>
              <li>Guided lessons, a glossary of model units, and JSON replay of any run.</li>
            </ul>
            <p>
              This is an Apis mellifera-inspired educational model. Distance,
              time and food are model units, not field measurements: a
              same-seed dance-off is one paired model run, not a biological
              effect estimate. Results are not field evidence and do not predict
              real colony behaviour.
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
