import type { Localized } from '../experiments/catalog';

interface Lesson {
  steps: { title: Localized; body: Localized }[];
  question: Localized;
  options: Localized[];
  answer: number;
  explanation: Localized;
}
const text = (tr: string, en: string): Localized => ({ tr, en });

export const lessons: Record<string, Lesson> = {
  'BEE-001': {
    steps: [
      { title: text('Önce tahmin edin', 'Make a prediction'), body: text('Deney panelinde bir tahmin seçin; koşu 0. tick’te duraklar. Dans kapalı ve yalnızca A kaynağı etkin olduğunda bilgiyi kim edinebilir?', 'Select a prediction in the experiment panel; the run pauses at tick 0. With dance off and only source A active, who can acquire information?') },
      { title: text('Bir bireyin bilgisini izleyin', 'Follow individual knowledge'), body: text('Çalıştırın. İlk keşiften sonra duraklatıp Arıyı incele ile bir keşifçi seçin. Bireysel bilgi bölümünde “Kendi ziyareti” kaydını arayın; bir toplayıcının hafızasıyla karşılaştırın.', 'Run the model. After the first discovery, pause and use Inspect a bee to select a scout. Look for a “Personal visit” record under Private knowledge, then compare it with a forager’s memory.') },
      { title: text('Harita ile bilgiyi ayırın', 'Separate the map from knowledge'), body: text('A’yı ekranda baştan görmek ile arının A’yı öğrenmesi farklıdır. İlk keşif ve toplanan besin değerlerini kaydedin; aynı tick sayısında başka seed’ler deneyin.', 'Seeing A on the map from the start differs from a bee learning about A. Record first discovery and food collected, then try other seeds at the same tick count.') },
    ],
    question: text('Bir keşifçi A’yı buldu. Dans kapalıyken bilgisiz bir toplayıcı ne yapar?', 'A scout found A. With dance off, what does an uninformed forager do?'),
    options: [text('A’nın konumunu otomatik öğrenir.', 'It automatically learns A’s location.'), text('Bilgi edinene kadar kovanda bekler.', 'It waits in the hive until it acquires information.')],
    answer: 1,
    explanation: text('Bu modelde bilgisiz toplayıcılar bağımsız aramaya çıkmaz. Keşifçinin hafızası bireyseldir; koloniye otomatik kopyalanmaz. Bu, sabit görev varsayımının sonucudur.', 'Uninformed foragers do not search independently in this model. A scout’s memory is private and is not copied to the colony. This follows from the fixed-role assumption.'),
  },
  'BEE-002': {
    steps: [
      { title: text('Dansın etkisini öngörün', 'Predict the effect of dance'), body: text('Deney panelinde tahmininizi seçin. Seed ve arı sayısını sabit tutun; Karşılaştır ile aynı başlangıca sahip, dansı kapalı kontrol kolonisini açın.', 'Choose your prediction in the experiment panel. Keep seed and population fixed; open Compare to see the control colony with dance off and the same initial conditions.') },
      { title: text('Yerel mesajı takip edin', 'Follow a local message'), body: text('Çalıştırın, Dans alanı görünümüne geçin ve bir dans gördüğünüzde duraklatın. Arıyı incele ile dansçının yön ve mesafe bilgisini okuyun; İletişim görünümünde yakın geçmişteki katılımları izleyin.', 'Run, switch to Dance floor and pause when you see a dance. Use Inspect a bee to read the dancer’s direction and distance; examine recent accepted reports in Communication view.') },
      { title: text('Eşit sürede karşılaştırın', 'Compare at equal time'), body: text('Aynı tick’te deney ve kontrolün topladığı besini okuyun. Sonucu birkaç seed ile tekrarlayın. Dans kapalıyken bilgisiz toplayıcıların beklemesi, farkın bir bölümünü açıklayan model varsayımıdır.', 'Read the experimental and control food totals at the same tick. Repeat with several seeds. Uninformed foragers waiting when dance is off is a model assumption that explains part of the difference.') },
    ],
    question: text('Bir dans başladı. Hangi arılar bu bildirimi alabilir?', 'A dance has started. Which bees can receive its report?'),
    options: [text('Yalnızca yakında karşılaşıp gözlemleyenler.', 'Only those that encounter and observe it nearby.'), text('Kolonideki tüm arılar aynı anda.', 'Every bee in the colony at once.')],
    answer: 0,
    explanation: text('Dans, yerel ve süreli bir sinyaldir. Yakındaki gözlemci de mutlaka katılmaz; katılım olasılıksaldır. İletişim çizgileri kabul edilmiş bildirimleri gösterir.', 'A dance is a local, expiring signal. Even a nearby observer does not necessarily follow it; acceptance is probabilistic. Communication links represent accepted reports.'),
  },
  'BEE-003': {
    steps: [
      { title: text('Yakın mı, zengin mi?', 'Nearer or richer?'), body: text('Deney panelinde tahmininizi seçin. A daha yakın, B daha kalitelidir. Kalite ödülü artırırken uzun yol dansın fayda değerini azaltır; sonucu çalıştırmadan önce gerekçenizi düşünün.', 'Choose your prediction in the experiment panel. A is nearer and B has higher quality. Quality increases reward while distance discounts dance utility; consider your reasoning before running.') },
      { title: text('Birlikte değişen ölçümleri okuyun', 'Read the measures together'), body: text('Çalıştırıp belirlediğiniz bir tick’te duraklatın. Kaynak dağılımını, toplanan besini ve besin toplama hızını birlikte inceleyin. A/B yüzdelerinin yalnızca kaynağa yönelik seferleri kapsadığını hatırlayın.', 'Run and pause at a tick you choose. Inspect allocation, food collected and food intake rate together. Remember that A/B percentages include only source-directed trips.') },
      { title: text('Beklentinizi sınayın', 'Examine your expectation'), body: text('Tahmininizle gözleminizi karşılaştırın. Aynı ayarlarla farklı seed’leri aynı tick sayısına kadar çalıştırın. B’nin yüksek kalitesi her koşuda daha yüksek pay alacağını garanti etmez.', 'Compare your prediction with what you observed. Run other seeds with the same settings to the same tick count. B’s higher quality does not guarantee a larger share in every run.') },
    ],
    question: text('Kaynak dağılımında B %70. Bu ne demektir?', 'Resource allocation shows B at 70%. What does that mean?'),
    options: [text('Kolonideki bütün arıların %70’i B’dedir.', '70% of every bee in the colony is at B.'), text('Kaynağa yönelik seferlerin %70’i B’ye bağlıdır.', '70% of source-directed trips are assigned to B.')],
    answer: 1,
    explanation: text('Payda yalnızca A/B hedefiyle uçan, toplayan veya dönen arılardır. Arayanlar, bekleyenler, dansçılar ve dans gözlemcileri dahil değildir. Bu yüzden dağılım ile toplam arı sayısı farklı şeyler anlatır.', 'The denominator includes only bees flying, collecting or returning with an A/B target. Searchers, resting bees, dancers and dance observers are excluded. Allocation and population therefore describe different things.'),
  },
  'BEE-004': {
    steps: [
      { title: text('Bir değişken seçin', 'Choose one variable'), body: text('Tahmininizi seçin. Aynı seed ve arı sayısıyla düşük keşifçi oranını çalıştırın; ilk keşif zamanını ve seçtiğiniz tick’teki besin toplamını kaydedin.', 'Choose your prediction. Run a low scout proportion with the same seed and population; record first discovery and total food at a tick you choose.') },
      { title: text('Yeni koşuyla karşılaştırın', 'Compare a fresh run'), body: text('Keşifçi oranını değiştirin: bu işlem sıfırdan yeni koşu başlatır. Aynı tick sayısına kadar ilerleyip iki ölçümü karşılaştırın. Keşfin erken olması, toplamanın da yüksek olmasını garanti etmez.', 'Change the scout proportion: this starts a fresh run. Advance to the same tick and compare both measures. Earlier discovery does not guarantee more food collected.') },
      { title: text('Eski bilgiyi gözleyin', 'Observe stale information'), body: text('Ayrı bir denemede B bilindikten sonra duraklatıp B kaynağını kaldırın. Tick’i not edin, sonra adımlayın. Hafıza ve danslar anında silinmez; başarısız ziyaretleri ve zamanla değişen dağılımı inceleyin.', 'In a separate trial, pause after B is known and remove source B. Note the tick, then step forward. Memories and dances do not vanish instantly; inspect failed visits and changes in allocation over time.') },
    ],
    question: text('B kaynağı kaldırılınca arıların B hakkındaki bilgisi ne olur?', 'What happens to the bees’ knowledge of B when the source is removed?'),
    options: [text('Eski kayıtlar ziyaretle geçersizleşebilir veya süreleri dolar.', 'Old records can be invalidated by a visit or expire.'), text('Tüm hafıza ve danslar aynı anda silinir.', 'All memories and dances are erased at once.')],
    answer: 0,
    explanation: text('Dünya değişikliği arılara küresel bildirim göndermez. Eski bilgi bir süre davranışı yönlendirebilir. Kaynak kaldırılmadan önce toplanmış yük de kısa süre sonra kovana ulaşabilir.', 'A world change does not broadcast an update to every bee. Stale information can keep guiding behavior for a while. Cargo collected before removal can also arrive at the hive shortly afterward.'),
  },
};
