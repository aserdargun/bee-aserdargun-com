import type { Localized } from './catalog';
export const evidence: { id: string; title: string; year: number; url: string; note: Localized }[] = [
  { id: 'seeley1991', year: 1991, title: 'Collective decision-making in honey bees: how colonies choose among nectar sources',
    url: 'https://doi.org/10.1007/BF00175101', note: { tr: 'Kârlılığa bağlı katılım ve terk etme için biyolojik dayanak. Bu uygulama makaledeki modeli yeniden üretmez.', en: 'Biological motivation for profitability-dependent recruitment and abandonment. This app does not reproduce the paper’s model.' } },
  { id: 'dance2023', year: 2023, title: 'Honey bees infer source location from the dances of returning foragers',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10041085/', note: { tr: 'Dans yoluyla konum bilgisinin aktarımı. BEE’deki gürültülü vektör daha dar bir soyutlamadır.', en: 'Location information is transmitted through dance. BEE’s noisy vector is a narrower abstraction.' } },
  { id: 'context2019', year: 2019, title: 'Honeybees forage more successfully without the “dance language” in challenging environments',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6374110/', note: { tr: 'İletişimin faydası koşullara bağlıdır; simülasyon sonucunu evrensel biyolojik kanıt saymayın.', en: 'Communication benefits depend on conditions; simulation output is not universal biological evidence.' } },
];
