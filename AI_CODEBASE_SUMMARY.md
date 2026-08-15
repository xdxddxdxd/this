# TDK Projesi — Proje Mimarisi ve AI Geliştirici Kılavuzu

Bu belge, bu projenin kod yapısını inceleyecek başka bir AI veya geliştirici için tüm mimariyi, veri modellerini, servisleri ve temel özellikleri özetler.

---

## 📌 Proje Özeti
**TDK Projesi**, TYT Türkçe sınavına hazırlanan öğrencilerin denemelerde yaptığı yazım yanlışlarını takip eden, analiz eden, TDK Güncel Türkçe Sözlük kurallarıyla gerekçelendiren ve öğrencinin yaptığı hatalardan **sıfırdan yepyeni TYT deneme soruları türeten** bir akıllı web uygulamasıdır.

* **Frontend:** React 18, TypeScript, Vite, Lucide Icons, Canvas-Confetti
* **Backend & Veritabanı:** Supabase (PostgreSQL, Realtime, RPC)
* **Yapay Zekâ Katmanı:**
  1. **Tier 1 (Birincil):** Groq API — `llama-3.3-70b-versatile` (Hızlı 150ms TDK kural analizi)
  2. **Tier 2 (Yedek):** OpenRouter API — `meta-llama/llama-3.3-70b-instruct`
  3. **Tier 3 (Görsel OCR):** Google Gemini API — `gemini-2.5-flash` (Çok sütunlu soru fotoğraflarını tarama & okuma)
  4. **Tier 4 (Offline Fallback):** Yerel TDK Kural ve Sözlük Motoru

---

## 🏗️ Dizin Yapısı ve Dosya Görevleri

```
├── index.html                     # HTML ana şablon ve Google Fonts bağlantıları
├── package.json                   # Bağımlılıklar (React 18, Supabase-js, Generative-AI, Vite)
├── tsconfig.json                  # TypeScript derleyici yapılandırması
├── vite.config.ts                 # Vite sunucu yapılandırması (port: 3000)
├── public/
│   ├── favicon.svg                # Kalem ikonu favicon
│   └── _redirects                 # Netlify SPA yönlendirme kuralı (/* /index.html 200)
├── src/
│   ├── main.tsx                   # React kök giriş noktası
│   ├── App.tsx                    # Ana durum yönetimi, tema başlatıcı ve modal orkestrasyonu
│   ├── index.css                  # "Kırmızı Kalem" tasarım sistemi, CSS değişkenleri, Dark/Light tema ve A4 Print kuralları
│   ├── types/
│   │   └── index.ts               # Tüm TypeScript tipleri (User, UserError, AnalysisResult, QuestionOptions, TytRule)
│   ├── lib/
│   │   └── supabase.ts            # Supabase istemcisi ve yerel localStorage fallback sarmalayıcısı
│   ├── data/
│   │   ├── rulesData.ts           # 30+ Standart TYT Yazım Kuralı & Bekleme ekranı bilgi havuzu
│   │   └── tdkDictionaryData.ts   # Sık karıştırılan 30+ kelimelik TDK doğrulama sözlüğü
│   ├── services/
│   │   ├── authService.ts         # Kullanıcı oturum açma, kaydolma ve misafir/arkadaş yönetimi
│   │   ├── errorService.ts        # Supabase/LocalStorage soru CRUD işlemleri, favorileme ve sayaçlar
│   │   ├── geminiService.ts       # Çok sütunlu soru fotoğraflarından OCR ile metin çıkarma
│   │   ├── groqService.ts         # 3 Katmanlı LLM kural analiz motoru ve standart kural eşleme
│   │   ├── questionSplitter.ts    # Tek metinde yapıştırılan birden çok soruyu (1., 2., 3.) ayıklama
│   │   ├── quizGeneratorService.ts# Kullanıcının hatalarından dinamik TYT testleri türetme & soru havuzu
│   │   └── tdkService.ts          # Kelimelerin TDK Sözlük doğruluğunu kontrol eden servis
│   └── components/
│       ├── AddQuestionModal.tsx   # Metin veya kamera ile soru ekleme modalı (Canlı kural flashcard'ı ile bekleme deneyimi)
│       ├── AuthModal.tsx          # Arkadaş değiştirme / giriş modalı
│       ├── BottomNav.tsx          # Mobil uyumlu alt gezinme çubuğu (Dashboard, Hatalarım, Profil)
│       ├── CustomQuizModal.tsx    # Ayarlanabilir Kişisel Sınav Oluşturucu (Zorluk, Süre, Konu, Canlı Sayaç ve Rapor)
│       ├── Dashboard.tsx          # Ana pano (Sayaçlar, Günün kuralı, Son hatalar ve Hızlı Soru Ekle)
│       ├── HighlightedText.tsx    # Romen rakamlı şık ve metin içi kırmızı altı çizili kelimeleri render eden bileşen
│       ├── ErrorBoundary.tsx      # Beklenmedik hataları yakalayan kurtarma bileşeni
│       ├── MyErrors.tsx           # Hata havuzu listesi, arama, filtreleme, toplu silme, toplu favorileme ve sınav başlatıcı
│       ├── PdfExportModal.tsx     # "Sınav Öncesi Hata Kitapçığım" — A4 baskıya uygun PDF / Yazdırma modalı
│       ├── Profile.tsx            # Profil, Siyah/Beyaz tema seçici, İstatistikler ve PDF Kitapçık kartı
│       └── QuestionDetailModal.tsx# Soru detay sayfası (Kırmızı kalemle üstü çizili düzeltme, düzenleme, silme)
```

---

## 🔑 Temel Özellikler & İş Mantığı

### 1. "Kırmızı Kalem Düzeltmesi" Tasarımı (Visual Red-Pen Marking)
Hatalı kelimenin üstü kırmızı çizgiyle çizilir (`<del class="struck-word">yanlış</del>`), üzerine öğretmen düzeltmesi şeklinde doğru yazım eklenir (`<span class="correction-badge-inline">^ doğru</span>`).

### 2. Yapay Zekâ Destekli Dinamik Soru Üretici (`quizGeneratorService.ts`)
* Kullanıcının hata havuzundaki kelimeleri (örn. `Bu gün`, `ayak üstü`, `güney Afrika Cumhuriyeti`) alır.
* Seçilen zorluğa göre (Kolay, Orta, Zor) **yepyeni bir cümle kurarak hatayı sadece 1 şıkka yerleştirir**.
* **Diğer 4 şıkkı ise kusursuz, kuralına uygun zorlayıcı TYT çeldirici cümleleriyle tamamlar**.
* Şık dağılımı dengeli ve organik rastgelelikle oluşturulur.

### 3. Çok Sütunlu OCR ve Akıllı Bölücü (`questionSplitter.ts` & `geminiService.ts`)
Öğrenci bir test sayfasının fotoğrafını yüklediğinde sütun sırasına göre soruları tek tek algılar ve toplu kaydetme imkanı tanır.

### 4. Siyah / Beyaz Monokrom Tema ve Sistem Uyumu
Cihazın varsayılan temasına (`prefers-color-scheme`) otomatik uyum sağlar ve profil sekmesinden `[🌙 Siyah]` veya `[☀️ Beyaz]` olarak kalıcı değiştirilebilir.

### 5. Sınav Öncesi Hata Kitapçığı (`PdfExportModal.tsx`)
Öğrencinin tüm hatalarını A4 formatında, şıkları ve TDK gerekçeleriyle birlikte tek tıkla PDF olarak kaydetmesini veya yazdırmasını sağlar.

---

## ⚙️ Ortam Değişkenleri (.env.example)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GROQ_API_KEY=your-groq-api-key
VITE_OPENROUTER_API_KEY=your-openrouter-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## 🚀 Çalıştırma
```bash
npm install
npm run dev
```
