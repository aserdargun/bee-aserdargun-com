import type { Localized } from '../experiments/catalog';

/**
 * The model rules the field notes publish, kept as data so the numbers in
 * them can be checked against the implementation.
 *
 * These used to be JSX literals: the implementation held one copy of each
 * constant and the prose held another, and nothing compared them. A retune of
 * the model would leave the published rules describing a model that no longer
 * exists. The values are now asserted against `MODEL` in
 * `model-rules.test.ts`.
 */
export interface ModelRule {
  id: string;
  measure: Localized;
  /** The rule in prose, when it is published as prose. */
  definition?: Localized;
  /** The rule as a formula, when it is published as one. */
  formula?: string;
  /** The limit that qualifies the formula. */
  note?: Localized;
}

export const modelRules: ModelRule[] = [
  {
    id: 'food',
    measure: { tr: 'Toplanan besin', en: 'Food collected' },
    definition: {
      tr: 'Kovana getirilen yük × örneklenen kalite toplamı. Gram değil, model ödül birimi.',
      en: 'Sum of cargo × sampled quality delivered to the hive. Model reward units, not grams.',
    },
  },
  {
    id: 'throughput',
    measure: { tr: 'Besin akışı', en: 'Throughput' },
    definition: {
      tr: 'Son 600 tick içinde getirilen ödül ÷ geçen model dakikası (en fazla 1 dk). Başlangıçta mevcut süre kullanılır.',
      en: 'Delivered reward during the last 600 ticks ÷ elapsed model minutes (up to 1 min). Startup uses the available elapsed window.',
    },
  },
  {
    id: 'allocation',
    measure: { tr: 'Dağılım', en: 'Allocation' },
    definition: {
      tr: 'Bilinen kaynağa uçan, orada toplayan veya kaynaktan dönen arılar ÷ bu durumdaki tüm arılar. Arama ve kovan içi etkinlik hariç; tüm koloninin oranı değildir.',
      en: 'Bees flying to, foraging at, or returning from a known patch ÷ all such bees. Excludes searching and hive activity; not a share of the whole colony.',
    },
  },
  {
    id: 'recruited',
    measure: { tr: 'Katılan toplayıcılar', en: 'Recruited foragers' },
    definition: {
      tr: 'Sosyal katılım sonrası dışarıda olan arılar; keşifçileri de içerebilir. Sonraki bağımsız keşif seferi bu işareti temizler.',
      en: 'Bees currently outside after social recruitment; may include scouts. A later independent scouting trip clears this flag.',
    },
  },
  {
    id: 'utility',
    measure: { tr: 'Fayda', en: 'Utility' },
    formula: 'reward / (1 + 0.0015 × 2 × distance)',
    note: {
      tr: 'Arının kendi ziyaretinden hesaplanan model varsayımı.',
      en: 'A model assumption computed from that bee’s own visit.',
    },
  },
  {
    id: 'recruitment-probability',
    measure: { tr: 'Katılım olasılığı', en: 'Recruitment probability' },
    formula: 'min(0.95, strength × utility × confidence)',
    note: {
      tr: 'Tamamlanan her yerel dans gözlemi için. Ampirik olasılık değildir.',
      en: 'Per completed local dance observation. It is not an empirical probability.',
    },
  },
];

/** The reproducibility paragraph, which states the run and import limits. */
export const reproducibilityNote: Localized = {
  tr: 'JSON dışa aktarımları seed, model sürümleri, başlangıç parametreleri ve sıralı, tick damgalı müdahaleleri içerir. İçe aktarım durumu sıfırdan hesaplar ve duraklatır. Sınırlar: 36.000 tick; içe aktarımda 2 MB, 200 müdahale ve 36 milyon arı-tick. Aynı çalışma ortamında eşitlik testlidir; gelecekteki motorlarda bit düzeyinde eşitlik garanti edilmez.',
  en: 'JSON exports include seed, all model versions, initial parameters and ordered tick-stamped interventions. Import recomputes the state from tick zero and pauses. Tick limits: 36,000; imports: 2 MB, 200 interventions and 36 million agent-ticks. Floating-point identity is tested within the same runtime; future engines are not guaranteed bitwise identical.',
};

/** The communication-view paragraph, which states the journal and sensor margins. */
export const communicationNote: Localized = {
  tr: 'İletişim görünümü 250 olayla sınırlı günlükten en fazla 30 model saniyelik son katılımları gösterir. Dış halkadaki noktalar artık kovan dışında olan katılımcılardır. Eş yükselti çizgileri ve çiçekler görsel bağlamdır; kaynak dairelerinin çevresinde 28 birimlik algılama payı vardır.',
  en: 'The communication view shows up to 30 model seconds of recent recruitment from a journal limited to 250 events. Dots on the outer ring represent participants now outside the hive. Contour lines and flower illustrations are visual context; patch circles define the resource extent, with a 28-unit sensor margin.',
};

/** The simplification note, which states the tick length. */
export const educationalSimplification: Localized = {
  tr: 'Bir tick, 0,1 model saniyesidir. Mesafe, nektar ve enerji soyut birimlerdir. Güneş pusulası, koku, yavru, metabolizma ve sıcaklık düzenleme yoktur.',
  en: 'One tick is 0.1 model seconds. Distance, nectar and energy are abstract units. There is no sun compass, odor, brood, metabolism or temperature regulation.',
};
