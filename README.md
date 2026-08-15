# TDK Projesi — TYT Türkçe Yazım Yanlışı Takip ve Öğrenme Sistemi

![TDK Projesi Banner](public/favicon.svg)

> TYT Türkçe denemelerinde ve soru çözümlerinde yapılan yazım yanlışlarını tespit eden, TDK sözlük kurallarıyla anlık doğrulayan, kişiselleştirilmiş koç notları sunan ve "Kırmızı Kalem Düzeltmesi" temalı modern web uygulaması.

---

## 🚀 Canlı Dağıtım
- **Netlify Yayını**: [https://thisdoukan.netlify.app](https://thisdoukan.netlify.app)
- **Supabase Projesi**: `this` (`lisonamppgsgoswkkjyl`)
- **GitHub Deposu**: [xdxddxdxd/this](https://github.com/xdxddxdxd/this)

---

## 🎨 Tasarım Dili ("Kırmızı Kalem Düzeltmesi")
- **Kağıt & Sınav Kağıdı Teması**: Sıcak kağıt beyazı zemin (`#FAFAF8`), koyu mürekkep lacivert (`#1C1C1E`), canlı öğretmen kırmızısı (`#D6303F`) ve onay yeşili (`#3F7D5C`).
- **Özel Tipografi**: Başlıklarda *Playfair Display / Lora*, gövdede *Inter*, düzeltmeler ve öğretmen notlarında el yazısı *Caveat / Patrick Hand*, sorularda ise daktilo hissi veren *Courier Prime*.
- **İmza Öğesi**: Hatalı kelimenin üstü kırmızı çizili ve üstünde `^ gelecekler` el yazısıyla doğru yazımı.
- **Kareli Defter Sayacı**: Sağ üstte toplam hata sayısını gösteren milimetrik defter kutusu.

---

## ⚡ Özellikler
- **Çoktan Seçmeli (A-E), Roma Rakamlı & Düz Metin Soruları**: Soru kökü ve tüm şıklar eksiksiz saklanır.
- **TDK Çapraz Doğrulama & Cache**: `tdk-sozluk` ve resmi TDK Güncel Türkçe Sözlük verisiyle senkron doğrulama. Önbelleğe alınan kelimeler anında getirilir.
- **120+ TYT Kural Havuzu & Bekleme Deneyimi**: Soru analiz edilirken ekranda rastgele öğretici TYT yazım kuralları gösterilir.
- **Kişiselleştirilmiş Öğrenme & Koçluk**: Tekrar eden zayıf noktaları fark eden akıllı koç notları ("Bu kuralı bu ay 3. kez karıştırdın...").
- **1-10 Zorluk / Yaygınlık Puanı**: Tamamen arka planda Supabase'de saklanır (kullanıcıya gösterilmez).
- **Çok Kullanıcılı Arkadaş Grubu Desteği**: Her kullanıcı sadece kendi hatalarını görür ve yönetir.

---

## 🛠️ Kurulum & Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim derlemesi al
npm run build
```
