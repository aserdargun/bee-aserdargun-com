import type { Localized } from './catalog';
/**
 * The date the three primary sources below were last opened, and the boundary
 * that always travels with them. Kept here so the field-notes dialog, the
 * visible summary and the no-JS summary cannot drift apart. The date is a real
 * editorial check; it is never recomputed at runtime.
 */
export const sourcesChecked: Localized = {
  tr: 'Kaynaklar 21 Eylül 2026’da kontrol edildi.',
  en: 'Sources checked on 21 September 2026.',
};
export const evidenceScope: Localized = {
  tr: 'Bu üç çalışma mekanizmalara ve sınırlara dayanak sunar; kapsamlı literatür taraması veya BEE’nin kalibrasyonu değildir.',
  en: 'These three studies motivate mechanisms and limitations; they are not a complete literature review or a calibration of BEE.',
};
export const evidence: { id: string; title: string; year: number; url: string; note: Localized }[] = [
  { id: 'seeley1991', year: 1991, title: 'Collective decision-making in honey bees: how colonies choose among nectar sources',
    url: 'https://doi.org/10.1007/BF00175101', note: { tr: 'Kârlılığa bağlı katılım ve terk etme için biyolojik dayanak. Bu uygulama makaledeki modeli yeniden üretmez.', en: 'Biological motivation for profitability-dependent recruitment and abandonment. This app does not reproduce the paper’s model.' } },
  { id: 'dance2023', year: 2023, title: 'Honey bees infer source location from the dances of returning foragers',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10041085/', note: { tr: 'Radarla izlenen katılımcılar, kaynak konumunun danstan öğrenilmesini destekler. BEE gürültülü bir vektör kullanır; tanıdık işaretleri veya harita benzeri yön bulmayı modellemez.', en: 'Radar-tracked recruits support learning source locations from dances. BEE uses a noisy vector; it does not model familiar landmarks or map-like navigation.' } },
  { id: 'context2019', year: 2019, title: 'Honeybees forage more successfully without the “dance language” in challenging environments',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6374110/', note: { tr: 'Bu çalışma belirli bir çevrede dans yönelimini bozdu. BEE katılımı tamamen kapatır; kontrolü o müdahalenin tekrarı veya dansın evrensel üstünlüğünün kanıtı değildir.', en: 'This study disrupted dance orientation in a particular environment. BEE disables recruitment entirely; its control is not a replication of that treatment or evidence of a universal dance advantage.' } },
];
