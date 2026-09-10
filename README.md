# BEE — Honey Bee Collective Intelligence Laboratory

Bal arılarında yerel keşif, dansla bilgi aktarımı ve merkezi koordinasyon olmadan kaynak dağılımını inceleyen, Türkçe/İngilizce deney laboratuvarı. V0.1, **Apis mellifera** esinli, deterministik bir eğitim modelidir; biyolojik tahmin aracı değildir.

[BEE laboratuvarını aç](https://agreeable-forest-01a27f803.6.azurestaticapps.net) · [GitHub](https://github.com/aserdargun/bee-aserdargun-com)

## Yerelde çalıştırma

Node 22.12+ / 22.x ve npm 10 kullanın. macOS/Linux ortamında `lsof` gerekir.

```sh
npm ci
npx playwright install chromium
npm run dev:codex
```

Uygulama: **http://127.0.0.1:3017**. Codex environment içindeki **Setup / Run / Validate / Stop** eylemleri de aynı komut sözleşmesini kullanır.

```sh
npm run validate:codex
npm run stop:codex
```

Validate, bu checkout'ın geliştirme sunucusunu durdurur; tip kontrolünü, çekirdek ve environment testlerini, statik derlemeyi ve masaüstü/mobil tarayıcı senaryolarını çalıştırır. Stop başka bir checkout'a ait süreci kapatmaz. Tarayıcı testlerinin geçici 4017 sunucusu test sonunda kapanır.

Statik çıktıyı ayrıca incelemek için:

```sh
npm run build
npm run preview
```

Önizleme **http://127.0.0.1:4017** adresindedir. Durdurmak için `BEE_PORT=4017 npm run stop:codex` kullanın. Üretim dosyaları `out/` içindedir. GitHub `main` dalından Azure Static Web Apps Free yayını için [dağıtım sözleşmesi](docs/DEPLOYMENT.md) tanımlıdır; canlı sürüm `/release.json` üzerinden commit ile doğrulanır.

## V0.1 ile yapılabilenler

- BEE-001–004: bağımsız keşif, sallanma dansı, rakip besin kaynakları ve keşif/katılım dengesi.
- Tahmin seçimi, aynı seed ile sıfırlama, duraklatma, tek tick ilerletme, 1×/5×/20× hız.
- Peyzaj, dans alanı ve iletişim görünümleri; yakınlaştırma, kaydırma, bireysel arı seçimi ve takip.
- Bireysel hafıza ile koloni ölçümlerini ayrı inceleme; gerçek durumdan beslenen dağılım ve besin akışı.
- Aynı başlangıç koşullarında danssız kontrol kolonisiyle eşzamanlı karşılaştırma.
- Kaynak B'yi kaldırma/geri getirme ve iletişim gürültüsü müdahaleleri; tick damgalı JSON dışa aktarım ve sıfırdan yeniden hesaplanan içe aktarım.
- Son sekiz dışa aktarım için tarayıcıda yerel geçmiş; hesap, API anahtarı veya veritabanı gerekmez.

İlk açılışta canlı BEE-003 başlar. Bir tahmin seçmek koşuyu tick 0'a döndürüp duraklatır; **Çalıştır** ile deney başlatılır. Hareket azaltma tercihi varsa uygulama başlangıçta ve deney değiştirirken duraklar. Seed, arı sayısı ve keşifçi oranı yeni koşu başlatır; dans, gürültü ve kaynak müdahaleleri mevcut koşuya kaydedilir. Reset başlangıç parametrelerine döner.

## Kanıt ve belgeler

- [13 bölümlük mimari ve uygulama sözleşmesi](docs/FOUNDATION.md)
- [Davranış kuralları, formüller, birimler ve tekrar oynatma sınırları](docs/MODEL.md)
- [A–H doğrulama matrisi, regresyon kontrolleri ve eşleştirilmiş deney sonuçları](docs/VALIDATION.md)
- [Görsel referans ve uygulama karşılaştırması](docs/design/VERIFICATION.md)
- [Sonraki deneyler ve genişleme sınırları](docs/ROADMAP.md)
- [GitHub ve Azure yayın sözleşmesi](docs/DEPLOYMENT.md)

Headless deneyleri tekrar çalıştırmak için `npm run experiment:batch` kullanın. Sonuç `output/batch-results.json` dosyasına yazılır. Teslim sırasında ölçülen sürüm [docs/validation/batch-results.json](docs/validation/batch-results.json) içinde saklıdır. Ölçülen süreler makineye bağlıdır; seed'li simülasyon sonuçları aynı model ve çalışma ortamında tekrarlanır.

## English quick reference

BEE is an independent, static, bilingual collective intelligence laboratory. A pure TypeScript kernel runs paired colonies in a Web Worker; React and Canvas 2D only present snapshots. Bees use personal memories and nearby signals, never colony metrics or a global allocation policy. JSON exports retain model versions, initial parameters and ordered interventions; imports recompute from tick zero. The current slice covers foraging and recruitment. Quorum, nest decisions, dynamic task allocation and thermoregulation are future modules.

Run `npm run dev:codex`, validate with `npm run validate:codex`, stop with `npm run stop:codex`. The application is independently hostable; SWI integration consists of explicit concepts, versioned run data and navigation links, with no runtime dependency on SWI or ANT.

## Shared ILS contract

BEE consumes the unchanged ILS 0.1 core and UI archives in `vendor/`. The app-owned manifest maps its four real experiments and their existing bilingual three-step guides to the shared contract; the simulation, worker scheduling and replay semantics remain in BEE. Shared controls preserve the existing actions and accessible names. Applied settings and interventions remain user inputs, world state is simulated, and observer metrics are calculated from that state.

Authored `?experiment=bee-001` through `bee-004`, or `?lesson=bee-001-guide` through `bee-004-guide`, select existing configurations. Lessons take precedence when both are present. `?lang=en|tr` selects the language; invalid routes and unsupported `ils` context are ignored. Routing is initialized inside client effects so static export remains safe. Release metadata inventories every public asset by SHA-256, including the ILS manifest.
