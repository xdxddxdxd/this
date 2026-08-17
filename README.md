# TDK TYT Soru ve Kural Takip Sistemi

Türkiye YKS / TYT Türkçe sınavları ve TDK Yazım Kuralları için yapay zekâ destekli analiz ve deneme sınavı platformu.

## Özellikler
- **OCR Soru Tanıma:** Fotoğraf veya metin yükleyerek sorunun seçeneklerini otomatik ayrıştırma.
- **TDK Doğrulama Motoru:** Türk Dil Kurumu güncel yazım kılavuzu ve kuralları ile otomatik eşleştirme.
- **Yapay Zekâ Koç Notları:** Her soruya özel pedagojik hafıza taktikleri ve ÖSYM ipuçları.
- **Dinamik TYT Deneme Sınavı:** Kullanıcının geçmiş hatalarından ve TDK kurallarından 5 şıklı özgün soru üretimi.
- **30 Günlük Soru Soğuma (Cooldown):** Supabase `sentence_pool` üzerinden tekrarlayan soruları engelleme.
- **PDF Sınav Kitapçığı Dışa Aktarma:** Açıklamalı A4 çıktı formatı.
- **Supabase Auth & RLS Güvenliği:** Tam korumalı kullanıcı veri izolasyonu.
- **Gelişim Panosu:** Profil sekmesinde kategori bazlı hata dağılımı, son 14 günlük trend grafiği ve "en çok nerede hata yapıyorsun" içgörüsü (Recharts, lazy yüklenir).
- **Sentry Hata İzleme:** `VITE_SENTRY_DSN` tanımlanırsa üretim hataları otomatik raporlanır; boş bırakılırsa devre dışı kalır.
- **Performans:** Ağır modallar `React.lazy` ile, confetti ve grafikler dinamik `import()` ile yalnızca gerektiğinde yüklenir; fotoğraflar OCR'a gönderilmeden önce tarayıcıda sıkıştırılır.

## Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirici sunucusunu başlat
npm run dev

# Üretim derlemesi
npm run build
```
