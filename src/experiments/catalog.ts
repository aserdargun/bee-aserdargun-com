import { defaultConfig } from '../simulation/config';
export type Language = 'tr' | 'en';
export type Localized = { tr: string; en: string };
export interface Experiment {
  id: string; version: string; title: Localized; shortTitle: Localized; goal: Localized;
  question: Localized; predictions: Localized[]; explanation: Localized;
  controlledVariables: string[]; independentVariables: string[]; metrics: string[];
  evidence: string[];
}
export const experiments: Experiment[] = [
  {
    id: 'BEE-001', version: '0.1.0', title: { tr: 'Bir keşifle başlar.', en: 'It starts with a scout.' },
    shortTitle: { tr: 'İlk keşif', en: 'A scout finds food' },
    goal: { tr: 'Bir arının deneyimi, henüz koloninin bilgisi değildir.', en: 'One bee’s experience is not yet the colony’s knowledge.' },
    question: { tr: 'Dans olmadan diğer arılar kaynağı öğrenebilir mi?', en: 'Without a dance, will other bees learn about the source?' },
    predictions: [{ tr: 'Tüm arılar hemen öğrenir', en: 'Every bee knows immediately' }, { tr: 'Yalnızca kendisi keşfedenler öğrenir', en: 'Only independent discoverers know' }],
    explanation: { tr: 'Bu modelde dans kapalıyken deneyim bireysel kalır. Keşifçiler buldukları yere dönebilir; bekleyen işçiler otomatik bilgi almaz.', en: 'In this model, experience stays individual without dance. Scouts can revisit discoveries; waiting workers receive no automatic knowledge.' },
    controlledVariables: ['seed', 'population', 'patches'], independentVariables: ['recruitment'], metrics: ['firstDiscoveryTick', 'foodCollected'], evidence: ['seeley1991'],
  },
  {
    id: 'BEE-002', version: '0.1.0', title: { tr: 'Bir dans, yeni yollar.', en: 'One dance. New paths.' },
    shortTitle: { tr: 'Sallanma dansı', en: 'The waggle dance' },
    goal: { tr: 'Yerel bir iletişimin koloniye nasıl yayıldığını izleyin.', en: 'Follow a local message as it spreads through the colony.' },
    question: { tr: 'Dansı açmak toplanan besini nasıl değiştirir?', en: 'How will enabling dance change the food collected?' },
    predictions: [{ tr: 'Daha fazla besin toplanır', en: 'More food is collected' }, { tr: 'Belirgin bir fark oluşmaz', en: 'There is little difference' }],
    explanation: { tr: 'Bu modelde bir gözlemci, yakındaki dansı izler ve olasılıksal olarak katılır. Karşılaştırma aynı başlangıç koşullarındaki dans kapalı koloniyi gösterir.', en: 'In this model, an observer encounters a nearby dance and may follow it. Compare uses a colony with dance disabled and the same initial conditions.' },
    controlledVariables: ['seed', 'population', 'patches'], independentVariables: ['recruitment'], metrics: ['foodCollected', 'recruitments'], evidence: ['seeley1991', 'dance2023', 'context2019'],
  },
  {
    id: 'BEE-003', version: '0.1.0', title: { tr: 'Daha iyi besin kazanır mı?', en: 'Does better food win?' },
    shortTitle: { tr: 'Kaynaklar arasında', en: 'Between food sources' },
    goal: { tr: 'Bireysel keşiflerin ortak davranışa dönüşmesini izleyin.', en: 'Watch local discoveries become collective behavior.' },
    question: { tr: 'Uzaktaki daha zengin kaynak, daha çok arıyı çekebilir mi?', en: 'Will a farther, richer source attract more foragers?' },
    predictions: [{ tr: 'Yakındaki kaynak öne çıkar', en: 'The nearer source' }, { tr: 'Zengin kaynak öne çıkar', en: 'The richer source' }],
    explanation: { tr: 'Bu modelde besin kalitesi ve yol maliyeti dansı etkiler. Dağılım, bireysel ziyaretler ve yerel katılımlardan doğar. Hiçbir arı tüm peyzajı bilmez.', en: 'In this model, food quality and travel cost influence dancing. Allocation emerges from individual visits and local recruitment. No bee knows the whole landscape.' },
    controlledVariables: ['seed', 'population', 'patches'], independentVariables: ['recruitment', 'patch.quality'], metrics: ['allocation', 'deliveredByPatch', 'throughput'], evidence: ['seeley1991'],
  },
  {
    id: 'BEE-004', version: '0.1.0', title: { tr: 'Keşfetmek mi, izlemek mi?', en: 'Explore or follow?' },
    shortTitle: { tr: 'Keşif ve katılım', en: 'Exploration vs recruitment' },
    goal: { tr: 'Keşifçi oranını değiştirin; bulma ve toplama arasındaki dengeyi ölçün.', en: 'Change the scout proportion. Measure discovery against collection.' },
    question: { tr: 'Az sayıda keşifçiyle koloni değişime nasıl tepki verir?', en: 'With few scouts, how does the colony respond to change?' },
    predictions: [{ tr: 'Her koşulda daha verimli olur', en: 'It improves in every environment' }, { tr: 'Yeni keşifler gecikebilir', en: 'New discoveries may be slower' }],
    explanation: { tr: 'Keşifçi oranını değiştirmek aynı seed ile yeni bir koşu başlatır. B kaynağını kaldırıp eski bilginin nasıl geçersizleştiğini izleyin. Tek koşu genel bir sonuç vermez.', en: 'Changing scout proportion starts a new run with the same seed. Remove source B to watch stale information expire. One run does not establish a general result.' },
    controlledVariables: ['seed', 'population', 'patches'], independentVariables: ['scoutRatio'], metrics: ['firstDiscoveryTick', 'foodCollected', 'failedVisits'], evidence: ['seeley1991', 'context2019'],
  },
];
export function experimentConfig(id: string, seed = 518394) {
  const config = defaultConfig(seed); config.experimentId = id;
  if (id === 'BEE-001') { config.behavior.recruitment = false; config.patches[1].active = false; }
  if (id === 'BEE-002') config.patches[1].active = false;
  if (id === 'BEE-004') config.behavior.scoutRatio = 0.06;
  return config;
}
