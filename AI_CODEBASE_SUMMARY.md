# TDK TYT Projesi — Proje Mimarisi ve AI Geliştirici Kılavuzu

Bu belge, bu projenin kod yapısını inceleyecek başka bir AI veya geliştirici için tüm mimariyi, veri modellerini, servisleri ve temel özellikleri özetler.

---

## 📌 Proje Özeti
**TDK Projesi**, TYT/YKS Türkçe sınavına hazırlanan öğrencilerin denemelerde yaptığı yazım yanlışlarını kamera/metin ile analiz eden, TDK Güncel Türkçe Sözlük kurallarıyla gerekçelendiren ve öğrencinin yaptığı kişisel hatalardan **sıfırdan yepyeni TYT deneme sınavları türeten** akıllı bir eğitim web uygulamasıdır.

* **Frontend:** React 18, TypeScript, Vite, Lucide Icons, Canvas-Confetti
* **Backend & Veritabanı:** Supabase (PostgreSQL, Realtime, RLS Güvenliği)
* **Yapay Zekâ Katmanı:**
  1. **Tier 1 (Birincil):** Groq API — `llama-3.3-70b-versatile` (Hızlı paralel TYT kural analizi & soru üretimi)
  2. **Tier 2 (Yedek):** OpenRouter API — `meta-llama/llama-3.3-70b-instruct` (Failover resilience)
  3. **Tier 3 (Görsel OCR):** Google Gemini API — `gemini-2.5-flash` (Çok sütunlu soru fotoğraflarını tarama & okuma)
  4. **Tier 4 (Deterministik Motor):** `tdkService.ts` (TDK Beyaz Listesi & Doğrulama Kalkanı)
  5. **Tier 5 (Modüler Şık Sentezleyici):** `sentencePoolService.ts` (30 günlük rotasyon & Supabase cümle havuzu)

---

## 🏗️ Dizin Yapısı ve Dosya Görevleri

```
├── index.html                     # HTML ana şablon ve Google Fonts bağlantıları
├── package.json                   # Bağımlılıklar (React 18, Supabase-js, Generative-AI, Vite)
├── tsconfig.json                  # TypeScript derleyici yapılandırması
├── vite.config.ts                 # Vite sunucu yapılandırması (port: 3000)
├── .env.example                   # Ortam değişkenleri şablonu
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
│   │   ├── rulesData.ts           # 1600+ Satırlık Standart TYT Yazım Kuralı & Bekleme ekranı bilgi havuzu
│   │   └── tdkDictionaryData.ts   # Sık karıştırılan kelimelik TDK doğrulama sözlüğü
│   ├── services/
│   │   ├── authService.ts         # Kullanıcı oturum açma, kaydolma ve misafir/arkadaş yönetimi
│   │   ├── errorService.ts        # Supabase/LocalStorage soru CRUD işlemleri, favorileme ve sayaçlar
│   │   ├── geminiService.ts       # Çok sütunlu soru fotoğraflarından OCR ile metin çıkarma
│   │   ├── groqService.ts         # 3 Katmanlı LLM kural analiz motoru ve paralel soru üretim servisi
│   │   ├── questionSplitter.ts    # Tek metinde yapıştırılan birden çok soruyu (1., 2., 3.) ayıklama
│   │   ├── quizGeneratorService.ts# Kullanıcının hatalarından dinamik TYT testleri türetme & şık dengeleme
│   │   ├── sentencePoolService.ts # 30 Günlük tazelik kontrollü modüler şık sentezleme ve Supabase havuzu
│   │   └── tdkService.ts          # TDK doğruluk beyaz listesi, fonetik kural denetimi ve false-positive kalkanı
│   └── components/
│       ├── AddQuestionModal.tsx   # Metin veya kamera ile soru ekleme modalı (Canlı kural flashcard'ı ile bekleme deneyimi)
│       ├── AuthModal.tsx          # Popup giriş / kayıt modalı
│       ├── BottomNav.tsx          # Mobil uyumlu alt gezinme çubuğu (Dashboard, Hatalarım, Profil)
│       ├── CustomQuizModal.tsx    # Ayarlanabilir Kişisel Sınav Oluşturucu (Zorluk, Süre, Konu, Canlı Sayaç ve Rapor)
│       ├── Dashboard.tsx          # Ana pano (Sayaçlar, Günün kuralı, Son hatalar ve Hızlı Soru Ekle)
│       ├── FlashcardQuizModal.tsx # Hızlı pratik kartları ve ezber pekiştirme modalı
│       ├── HighlightedText.tsx    # Romen rakamlı şık ve metin içi kırmızı altı çizili kelimeleri render eden bileşen
│       ├── OnboardingView.tsx     # Giriş karşılama ekranı, Kayan Canlı Şerit (Ticker), Auth Popup ve 5 Şıklı Canlı Soru Önizleme
│       ├── MyErrors.tsx           # Hata havuzu listesi, arama, filtreleme, toplu silme, toplu favorileme ve sınav başlatıcı
│       ├── PdfExportModal.tsx     # "Sınav Öncesi Hata Kitapçığım" — A4 baskıya uygun PDF / Yazdırma modalı
│       ├── Profile.tsx            # Profil, Siyah/Beyaz tema seçici, İstatistikler ve PDF Kitapçık kartı
│       └── QuestionDetailModal.tsx# Soru detay sayfası (Kırmızı kalemle üstü çizili düzeltme, düzenleme, silme)
```

---

## 🔑 Temel Özellikler & İş Mantığı

### 1. "Kırmızı Kalem Düzeltmesi" Tasarımı (Visual Red-Pen Marking)
Hatalı kelimenin üstü kırmızı çizgiyle çizilir (`<del class="struck-word">yanlış</del>`), üzerine el yazısı fontuyla öğretmen düzeltmesi şeklinde doğru yazım eklenir (`<span class="correction-badge-inline">^ doğru</span>`).

### 2. Yapay Zekâ Destekli Soru Üretim Mimarisi (`quizGeneratorService.ts` & `groqService.ts`)
* **Öğrenci Odaklı Hedefleme:** Öğrencinin geçmişte hata yaptığı kelimeleri (`user_errors`) alır, TYT müfredatı kurallarıyla karıştırır (shuffle).
* **Paralel Mikro-Paketler:** 15 soruluk sınavlar 3'erli paralel paketler halinde çağrılır; 3 saniyede sıfır timeout ile üretilir.
* **Tek Hata & Temiz Çeldirici Kuralı:** Soruda sadece 1 hedef kelime hatalıdır; diğer 4 şık `%100` hatasız, edebi TYT cümlelerinden oluşur ve `cleanDistractorSentence` ile otomatik temizlenir.
* **Dengeli Cevap Dağıtımı:** Doğru cevap şıkları (A, B, C, D, E) eşit ve organik dağıtılır (`distributeOptionsFairly`).

### 3. Modüler Şık Sentezleme & 30 Günlük Tazelik Motoru (`sentencePoolService.ts`)
* 15 soruluk sınavlarda 3 soru havuzdaki temiz şıklardan modüler olarak birleştirilir.
* Öğrenciye gösterilen herhangi bir şık veya cümle **30 gün (1 ay) boyunca** aynı öğrenciye bir daha asla gösterilmez.
* 5 ve 10 soruluk sınavlarda ise soruların `%100'ü` yapay zekâ tarafından anında sıfırdan üretilir.

### 4. TDK Beyaz Listesi & False-Positive Kalkanı (`tdkService.ts`)
* `zehretti, sabretti, şükretti, azmetti, kayboldu` gibi ünlü düşmeli birleşik fiiller beyaz listede korunur; yapay zekânın halüsinasyon görüp bunları "yanlış" sayması engellenir.
* `FıSTıKÇı ŞaHaP` (f, s, t, k, ç, ş, h, p) sert ünsüz kuralları filtrelenerek Koç Notu açıklamalarında bilimsel doğruluk güvence altına alınır.

---

## ⚙️ Ortam Değişkenleri (.env)
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
