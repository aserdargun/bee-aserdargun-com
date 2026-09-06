import type { Localized } from '../experiments/catalog';

interface Term { title: Localized; definition: Localized; example: Localized }
const text = (tr: string, en: string): Localized => ({ tr, en });

// Definitions describe the implemented rules in docs/MODEL.md and src/simulation.
// They are educational copy, not inputs to bee decisions or empirical claims.
export const terms = {
  collective: {
    title: text('Kolektif zekâ', 'Collective intelligence'),
    definition: text('Bireylerin sınırlı bilgisi ve yerel etkileşimlerinden koloni ölçeğinde bir davranışın ortaya çıkmasıdır. Bu modelde arılara emir veren bir merkez yoktur.', 'Colony-scale behavior emerges from individuals with limited information and local interactions. There is no central controller directing bees in this model.'),
    example: text('Siz A ve B kaynaklarını aynı anda görebilirsiniz. Bir arı yalnızca kendi karşılaşmalarını, hafızasını ve yakındaki dansları kullanır.', 'You can see sources A and B at once. A bee uses only its own encounters, memories and nearby dances.'),
  },
  recruitment: {
    title: text('Dansla katılım', 'Dance recruitment'),
    definition: text('Başarılı bir dönüşten sonra arı dans edebilir. Yakındaki bir arı bu dansı izleyip belirli bir olasılıkla bildirilen kaynağa yönelir; bilgi tüm koloniye anında yayılmaz.', 'After a successful return, a bee may dance. A nearby bee can observe it and probabilistically follow the reported source; information does not reach the entire colony at once.'),
    example: text('Kapalıyken yeni danslar ve dans gözlemleri durur. Öğrenilmiş kaynaklar hafızada kalabilir; henüz bilgisi olmayan toplayıcılar bekler.', 'When disabled, new dances and dance encounters stop. Previously learned sources may remain in memory; uninformed foragers wait.'),
  },
  scouts: {
    title: text('Keşifçi oranı', 'Scout proportion'),
    definition: text('Bağımsız arama yapabilen arıların başlangıçtaki payıdır. Keşifçiler de besin toplar ve dans izleyebilir. Bu sürümde görevler koşu sırasında değişmez.', 'The initial share of bees able to search independently. Scouts also collect food and can follow dances. Roles do not change during a run in this version.'),
    example: text('160 arının %18’i yuvarlandığında 29 keşifçi olur. Oranı değiştirmek aynı seed ile sıfırdan yeni bir koşu başlatır.', '18% of 160 bees rounds to 29 scouts. Changing the proportion starts a fresh run with the same seed.'),
  },
  noise: {
    title: text('İletişim gürültüsü', 'Communication noise'),
    definition: text('Dans bilgisinden öğrenilen yön ve mesafeye eklenen sınırlı hatanın büyüklüğüdür. Dansın güven değeri üzerinden katılım olasılığını da etkiler.', 'The size of bounded errors added to the direction and distance learned from a dance. It also affects acceptance through the dance’s confidence value.'),
    example: text('%0, konum aktarımındaki ek hatayı kaldırır; katılımı kesinleştirmez. %100, mesajların %100’ünün kaybolduğu anlamına gelmez.', '0% removes added location error; it does not guarantee acceptance. 100% does not mean that 100% of messages are lost.'),
  },
  seed: {
    title: text('Seed · rastgelelik tohumu', 'Seed · random seed'),
    definition: text('Arıların rastgele seçim dizilerini başlatan tam sayıdır. Aynı seed, başlangıç ayarları ve aynı tick’lerdeki müdahaleler, aynı model sürümü ve çalışma ortamında aynı koşuyu yeniden üretir.', 'An integer that initializes the bees’ random choice sequences. The same seed, initial settings and interventions at the same ticks reproduce a run in the same model version and runtime.'),
    example: text('518394 ile koşuyu tekrarlayabilirsiniz. Farklı seed’ler denemek, sonucun tek bir rastgele başlangıca ne kadar bağlı olduğunu araştırır.', 'You can repeat a run with 518394. Trying other seeds explores how much the result depends on a single random starting point.'),
  },
  time: {
    title: text('Tick ve model zamanı', 'Tick and model time'),
    definition: text('Tick, simülasyonun bir hesaplama adımıdır. 1 tick = 0,1 model saniyesi; 600 tick = 1 model dakikasıdır. Ekrandaki saat modelin ilerleyişini gösterir.', 'A tick is one simulation step. 1 tick = 0.1 model seconds; 600 ticks = 1 model minute. The clock displays progress within the model.'),
    example: text('Adım düğmesi tam 1 tick ilerletir. 20× oynatma daha çok adım hesaplar; arıların kurallarını veya bir tick’in süresini değiştirmez.', 'Step advances exactly 1 tick. 20× playback computes more steps; it does not change bee rules or the duration of a tick.'),
  },
  food: {
    title: text('Toplanan besin', 'Food collected'),
    definition: text('Kovana teslim edilen yük × toplandığı andaki kalite değerlerinin koşu başından beri toplamıdır. Bu bir model ödül birimidir; gram veya gerçek bal miktarı değildir.', 'The cumulative sum of delivered cargo × quality at collection, counted since the start of the run. It is a model reward unit, not grams or actual honey yield.'),
    example: text('Kalitesi 0,95 olan kaynaktan 1 birim yük kovana ulaşırsa toplama 0,95 eklenir. Yoldaki yük henüz sayılmaz.', 'Delivering 1 unit of cargo from a source with quality 0.95 adds 0.95 to the total. Cargo still in flight has not been counted yet.'),
  },
  throughput: {
    title: text('Besin toplama hızı', 'Food intake rate'),
    definition: text('Son 60 model saniyesinde teslim edilen besinin model dakikası başına hızıdır. İlk 60 saniyede, yalnızca o ana kadar geçen süre kullanılır.', 'The delivery rate over the trailing 60 model seconds, expressed per model minute. During the first 60 seconds, the denominator uses only the elapsed time.'),
    example: text('Toplam besin artarken bu hız düşebilir: son dakikada daha az teslimat yapılmıştır. Grafik yaklaşık son 600 model saniyesini gösterir; her nokta yine 60 saniyelik pencereyi kullanır.', 'The total can rise while this rate falls: fewer deliveries arrived in the latest minute. The chart shows about 600 model seconds of history; each point still uses a 60-second window.'),
  },
  discovery: {
    title: text('İlk keşif', 'First discovery'),
    definition: text('Herhangi bir arının, yakın algılama alanında etkin ve besin içeren bir kaynağı ilk kez bulduğu model zamanıdır.', 'The model time when any bee first detects an active, stocked source within its local sensing range.'),
    example: text('“—” henüz keşif yapılmadığını gösterir. İlk bulunan kaynak, en kaliteli kaynak veya ilk teslim edilen besin olmak zorunda değildir.', '“—” means no discovery yet. The first source found need not be the richest source or the first food delivered.'),
  },
  activeScouts: {
    title: text('Uçuştaki keşifçiler', 'Scouts in flight'),
    definition: text('Keşifçi rolünde olup bekleme, dans etme veya dans izleme durumunda olmayan arıların sayısıdır.', 'The number of bees with the scout role that are not resting, dancing or observing a dance.'),
    example: text('Adında “uçuş” geçse de kaynağın üzerinde besin toplayan keşifçiler de sayılır. Bu, yalnızca yeni yer arayan arıların sayısı değildir.', 'Despite “flight” in the label, scouts collecting at a source also count. This is not just the number searching for new sources.'),
  },
  recruited: {
    title: text('Katılan toplayıcılar', 'Recruited foragers'),
    definition: text('Kovan etkinlikleri dışında olup son dansla katılım bilgisi hâlâ işaretli olan arıların anlık sayısıdır. Dans izleyen keşifçiler de bu sayıya girebilir.', 'The current number of bees outside hive activities whose last recruitment flag remains set. Scouts that followed a dance can also be included.'),
    example: text('Bu bir toplam katılım olayı sayacı değildir. Aynı arı koşu içinde birden fazla dansı kabul edebilir.', 'This is not a cumulative counter of recruitment events. The same bee may accept several dances during a run.'),
  },
  allocation: {
    title: text('Kaynak dağılımı', 'Resource allocation'),
    definition: text('A veya B hedefiyle kaynağa uçan, besin toplayan ya da kovana dönen arıların bu iki kaynak arasındaki payıdır. Arayanlar ve kovan etkinlikleri paydaya girmez.', 'The share assigned to A or B among bees flying to a source, collecting or returning with a source target. Searching and hive activities are excluded from the denominator.'),
    example: text('A’ya bağlı 3, B’ye bağlı 7 arı varsa B %70 görünür. Bu, tüm koloninin %70’inin B’de olduğu anlamına gelmez. Hiç hedefli sefer yoksa iki çubuk da %0’dır.', 'With 3 bees directed to A and 7 to B, B shows 70%. This does not mean 70% of the whole colony is at B. With no source-directed trips, both bars show 0%.'),
  },
  quality: {
    title: text('Kaynak kalitesi', 'Source quality'),
    definition: text('Toplanan yükün ödül değerini çarpan model katsayısıdır. Kaynaktaki kalan besin miktarından farklıdır; arılar kaliteyi yerel ziyaret veya dans bildirimiyle öğrenir.', 'A model coefficient multiplying the reward value of collected cargo. It differs from remaining food stock; bees learn quality through a local visit or a dance report.'),
    example: text('Varsayılan A kaynağı 0,46; B kaynağı 0,95 kalitededir. B’nin uzaklığı daha fazladır; yüksek kalite tek başına sonucu garanti etmez.', 'Default source A has quality 0.46; B has 0.95. B is farther away; higher quality alone does not guarantee the outcome.'),
  },
  memory: {
    title: text('Bireysel bilgi', 'Private knowledge'),
    definition: text('Bir arının kendi ziyareti veya kabul ettiği dansla öğrendiği kaynak konumu ve kalite tahminidir. Her kaydın bir son kullanma tick’i vardır.', 'A source location and quality estimate learned through a bee’s own visit or an accepted dance. Every record has an expiration tick.'),
    example: text('B kaynağını kaldırmak arıların hafızasını anında silmez. Arı başarısız bir ziyarette o kaydı silebilir veya kayıt süresi dolabilir; varsayılan ömür 140 model saniyesidir.', 'Removing source B does not instantly erase memories. A failed visit can invalidate a bee’s record, or it can expire; the default lifetime is 140 model seconds.'),
  },
  energy: {
    title: text('Enerji göstergesi', 'Energy proxy'),
    definition: text('Uçarken azalan, dinlenirken artan 0–100 arası soyut bir göstergedir. Bu sürümde uçuşu veya arının kararlarını sınırlamaz.', 'An abstract indicator from 0 to 100 that falls during flight and rises at rest. It does not constrain flight or decisions in this version.'),
    example: text('%20, ölçülmüş bir biyolojik enerji rezervi değildir. Bu değerle açlık, yaşam süresi veya metabolizma sonucu çıkarılamaz.', '20% is not a measured biological energy reserve. It cannot establish starvation, lifespan or metabolism.'),
  },
  direction: {
    title: text('Dansın yön bilgisi', 'Dance direction'),
    definition: text('Kovandan bildirilen kaynağa uzanan yön, doğudan başlayarak saat yönünde derece olarak gösterilir. Güneş pusulası bu modelde yer almaz.', 'The direction from the hive to the advertised source, shown in degrees clockwise from east. A sun compass is not modeled.'),
    example: text('0° sağa, 90° aşağıya karşılık gelir. İzleyen arının öğrendiği yöne iletişim gürültüsü eklenebilir.', '0° points right and 90° points down. Communication noise may be added to the direction learned by a follower.'),
  },
  distance: {
    title: text('Model mesafesi', 'Model distance'),
    definition: text('Kovan ile hatırlanan kaynak arasındaki düz çizgi mesafesidir. “u” soyut mesafe birimidir; metreye dönüştürülmüş değildir.', 'The straight-line distance between the hive and the remembered source. “u” is an abstract distance unit, not a conversion to meters.'),
    example: text('Aynı kalitedeki daha uzak bir kaynak, dansın fayda hesabında daha büyük yol indirimi alır.', 'At equal quality, a farther source receives a larger travel discount in the dance utility calculation.'),
  },
  duration: {
    title: text('Süre kodu', 'Duration code'),
    definition: text('Bildirilen mesafe ÷ 250 ile hesaplanan eğitsel zaman kodudur. Dansın ne kadar süre açık kalacağını göstermez.', 'An educational time code calculated as advertised distance ÷ 250. It is not the length of time the dance remains available.'),
    example: text('250 u mesafe, 1 model saniyelik kod verir. Bu dönüşüm gerçek sallanma danslarından kalibre edilmemiştir.', 'A distance of 250 u gives a 1-model-second code. This conversion is not calibrated from real waggle dances.'),
  },
  utility: {
    title: text('Fayda', 'Utility'),
    definition: text('Arının kendi ödülünün gidiş-dönüş mesafesine göre indirgenmiş değeridir: ödül ÷ (1 + 0,003 × mesafe). Dans etme olasılığını ve dansın ömrünü etkiler.', 'The bee’s own reward discounted by round-trip distance: reward ÷ (1 + 0.003 × distance). It affects the probability of dancing and the dance’s lifetime.'),
    example: text('Yüksek kalite faydayı yükseltirken uzun mesafe azaltır. Bu değer net enerji veya koloninin bildiği ortak bir kaynak puanı değildir.', 'High quality raises utility while longer distance lowers it. It is neither net energy nor a source score shared by the colony.'),
  },
  lifetime: {
    title: text('Sinyalin kalan süresi', 'Signal time remaining'),
    definition: text('Dans bildiriminin süresi dolana kadar kalan model zamanıdır. Süresi dolmuş bir dans yeni katılım sağlayamaz.', 'The model time left before a dance report expires. An expired dance cannot recruit new followers.'),
    example: text('Kaynak kaldırılsa bile eski dans bir süre görülebilir. Süre kodu mesafeyi, kalan süre ise bildirimin ne kadar daha kullanılabileceğini anlatır.', 'An old dance can remain briefly after a source is removed. Duration code encodes distance; time remaining describes how much longer the report is available.'),
  },
  comparison: {
    title: text('Kontrol kolonisi', 'Control colony'),
    definition: text('Aynı seed, başlangıç ortamı, arı sayısı ve tick sayısıyla hesaplanan; dansla katılımı kapalı bir karşılaştırma kolonisidir. Kaynak ve gürültü müdahaleleri iki koloniye de uygulanır.', 'A comparison colony with the same seed, initial environment, population and tick count, with dance recruitment disabled. Source and noise interventions apply to both colonies.'),
    example: text('Sonuç deney / kontrol sırasındadır. Davranış değişince rastgele seçimlerin kullanımı da farklılaşabilir; tek eşlenik koşu genel bir biyolojik etki tahmini vermez.', 'Results appear as experimental / control. Behavioral differences can change how random choices are consumed; one paired run does not estimate a general biological effect.'),
  },
  intervention: {
    title: text('Müdahale', 'Intervention'),
    definition: text('Devam eden koşuda dansı açıp kapatma, gürültüyü değiştirme veya B kaynağını kaldırıp geri getirme işlemidir. İşlem, tamamlanan tick sayısıyla kaydedilir.', 'A change during a run: toggling dance, changing noise or removing and restoring source B. It is recorded with the number of completed ticks.'),
    example: text('100. tick’teki müdahale, 101. adım hesaplanmadan önce uygulanır. Seed, keşifçi oranı ve arı sayısı değişikliği ise sıfırdan yeni koşu başlatır.', 'An intervention at tick 100 applies before step 101 is computed. Changing seed, scout proportion or population instead starts a fresh run.'),
  },
  replay: {
    title: text('Koşu ve yeniden oynatma', 'Run and replay'),
    definition: text('Koşu, belirli başlangıç ayarlarıyla yapılan bir deneydir. JSON dışa aktarımı ayarları, sürümleri, tick sayısını ve sıralı müdahaleleri saklar.', 'A run is an experiment with specific initial settings. A JSON export stores settings, versions, tick count and ordered interventions.'),
    example: text('İçe aktarma kayıtlı değerleri doğru kabul etmez: baştan hesaplar ve kayıtlı tick’te duraklar. Desteklenmeyen veya geçersiz dosyalar reddedilir.', 'Import does not trust saved metric values: it recomputes from the start and pauses at the recorded tick. Unsupported or invalid files are rejected.'),
  },
  landscape: {
    title: text('Peyzaj görünümü', 'Landscape view'),
    definition: text('Kovanı, kaynakları ve arıların model uzayındaki konumlarını gösteren gözlemci haritasıdır. Bu haritaya arıların karar mekanizması erişemez.', 'An observer map of the hive, sources and bee positions in model space. Bee decision rules cannot access this map.'),
    example: text('A ve B’yi baştan görmeniz, arıların onları bildiği anlamına gelmez. Bir arıyı seçerek gerçekte hangi kaydı taşıdığını inceleyin.', 'Seeing A and B from the start does not mean the bees know them. Select a bee to inspect which records it actually holds.'),
  },
  danceFloor: {
    title: text('Dans alanı', 'Dance floor'),
    definition: text('Kovandaki dansçı ve gözlemcilere odaklanan büyütülmüş görünümdür. Dans, yalnızca yakındaki arıların karşılaşabildiği süreli bir sinyaldir.', 'A magnified view focused on dancers and observers in the hive. Each dance is an expiring signal that only nearby bees can encounter.'),
    example: text('Dans eden bir arıyı inceleyin: yön, mesafe, süre kodu ve fayda onun kendi deneyiminden üretilir.', 'Inspect a dancing bee: direction, distance, duration code and utility are generated from its own experience.'),
  },
  communication: {
    title: text('İletişim görünümü', 'Communication view'),
    definition: text('Yakın geçmişte kabul edilmiş dans bildirimlerini arılar arasında bağlantılarla gösterir. Dış halkadaki arılar, kovan dışındakilerin şematik yerleşimidir.', 'Links show recently accepted dance reports between bees. Bees on the outer ring are a schematic projection of those outside the hive.'),
    example: text('Bağlantılar en fazla 300 tick (30 model saniyesi) geriye gider; yoğun koşularda kayıt sınırı bu aralığı kısaltabilir. Görünüm tüm iletişim tarihçesi değildir.', 'Links extend back at most 300 ticks (30 model seconds); the journal limit can shorten this in busy runs. This is not the complete communication history.'),
  },
  performance: {
    title: text('Sinyal ve performans', 'Signals and performance'),
    definition: text('Sinyal ayrıntılarını ve uygulamanın çalışma hızını gösteren gözlem katmanıdır. FPS saniyede çizilen kare sayısı; ms ise hesaplamanın gerçek süresidir.', 'An observer layer showing signal details and application performance. FPS is frames rendered per second; ms is real computation time.'),
    example: text('Eşlenik tick süresi hem deney hem kontrol kolonisinin hesaplamasını kapsar. FPS ve işlem süresi, model zamanı veya koloni başarısı ölçüsü değildir.', 'Paired tick timing includes both experimental and control calculations. FPS and computation time do not measure model time or colony success.'),
  },
} satisfies Record<string, Term>;

export type TermId = keyof typeof terms;

