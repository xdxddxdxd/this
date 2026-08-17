import { CanonicalCategory, CANONICAL_TYT_CATEGORIES, normalizeCategory } from './groqService';

export interface VerifiedSpellingRule {
  wrongRegex: RegExp;
  wrongDisplay: string;
  correctDisplay: string;
  category: CanonicalCategory;
  explanation: string;
  coachNote: string;
}

// 1. WORDS THAT ARE 100% CORRECT IN TDK BUT COMMONLY HALLUCINATED AS ERRORS BY AI MODELS
export const TDK_CORRECT_WHITELIST: Set<string> = new Set([
  // Ünlü Düşmesiyle Bitişik Yazılan Birleşik Fiiller
  'zehretmek', 'zehretti', 'zehroldu', 'zehrolur', 'zehreder',
  'şükretmek', 'şükretti', 'şükreder', 'şükroldu',
  'sabretmek', 'sabretti', 'sabreder', 'sabredelim',
  'azmetmek', 'azmetti', 'azmeder', 'azmederek',
  'emretmek', 'emretti', 'emreder', 'emretmiş',
  'devretmek', 'devretti', 'devreder', 'devroldu',
  'kaybolmak', 'kayboldu', 'kaybolur', 'kaybolmuş',
  'kaybetmek', 'kaybetti', 'kaybeder', 'kaybedilmiş',
  'hapsetmek', 'hapsetti', 'hapsolur', 'hapsoldu',
  'kahretmek', 'kahretti', 'kahreder', 'kahroldu',
  'keşfetmek', 'keşfetti', 'keşfeder', 'keşfedilmiş',
  'lütfetmek', 'lütfetti', 'lütfeder', 'lütfeylemek',
  'nakletmek', 'nakletti', 'nakleder', 'naklolundu',
  'hükmetmek', 'hükmetti', 'hükmeder', 'hükmetmiş',
  'gasbetmek', 'gasbetti', 'gasbeder',
  'defnetmek', 'defnetti', 'defnedildi',
  'methetmek', 'methetti', 'metheder',
  'cem etmek', 'menetmek', 'menolunmak',

  // Ünsüz Türemesiyle Bitişik Yazılan Birleşik Fiiller
  'zannetmek', 'zannetti', 'zanneder', 'zannımca',
  'hissetmek', 'hissetti', 'hisseder', 'hissedilir',
  'reddetmek', 'reddetti', 'reddeder', 'reddedildi',
  'affetmek', 'affetti', 'affeder', 'affedersiniz',
  'halletmek', 'halletti', 'halleder', 'halledildi',
  'hakketmek', 'hakketti', 'hakkeder', // madene kazımak anlamında

  // Somut Yer Bildirmeyen Alt, Üst, Üzeri (Bitişik)
  'akşamüzeri', 'akşamüstü', 'ayaküstü', 'suçüstü', 'öğleüstü', 'öğleüzeri',
  'olağanüstü', 'bilinçaltı', 'bilinçdışı', 'şuurüstü', 'yüzüstü',

  // Kalıplaşmış Birleşik İsimler ve Bitki/Hayvan Adları (Bitişik)
  'kuşkonmaz', 'hanımeli', 'aslanağzı', 'karafatma', 'dereotu', 'zeytinyağı',
  'zeytinyağlı', 'karabiber', 'sivribiber', 'karnabahar', 'yeşilsoğan',

  // -sever Eki (Bitişik)
  'vatansever', 'sanatsever', 'kitapsever', 'hayvansever', 'yurtsever', 'müziksever', 'doğasever',

  // -evi / -hane / -name (Bitişik)
  'öğretmenevi', 'polisevi', 'huzurevi', 'aşevi', 'yayınevi', 'basımevi', 'kitabevi',
  'dershane', 'eczane', 'hastane', 'postane', 'pastane', 'seyahatname',

  // Belgisiz Sözcükler (Bitişik)
  'birkaç', 'birkaçı', 'birkaçını', 'birçok', 'birçoğu', 'birçoğunu',
  'hiçbir', 'hiçbiri', 'hiçbirini', 'biraz', 'birazı', 'birbiri', 'birbirine',
  'birtakım', // belgisiz anlamda

  // Özel Ad + Tür Adı Kullanımları
  'antolojiye', 'voleybolcular', 'yönetmenliğini', 'antrenör', 'zürafa',
  'anadolu', 'doğu', 'batı'
]);

// 2. EXHAUSTIVE TARGET SPELLING ERROR PATTERNS (TYT STANDARD)
export const VERIFIED_RULES_DB: VerifiedSpellingRule[] = [
  // 1. Yardımcı Fiillerde Ses Olayı Olmayanlar (AYRI YAZILIR)
  {
    wrongRegex: /\b(ayırtet\w*|ayırted\w*)\b/i,
    wrongDisplay: 'ayırtetmemizi',
    correctDisplay: 'ayırt etmemizi',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'etmek, olmak' ile kurulan birleşik fiillerde ses düşmesi veya türemesi yoksa fiil daima ayrı yazılır.",
    coachNote: "'ayırt etmek', 'fark etmek', 'terk etmek' fiillerinde ses olayı olmadığı için daima AYRI yazılır!"
  },
  {
    wrongRegex: /\b(farketti|farkettim|farkettik|farketmek|farkeden|farkedenler)\b/i,
    wrongDisplay: 'farketti',
    correctDisplay: 'fark etti',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'fark etmek' fiilinde herhangi bir ses olayı (düşme/türeme) bulunmadığı için ayrı yazılır.",
    coachNote: "'fark etmek' ses olayı barındırmaz, daima AYRI yazılır."
  },
  {
    wrongRegex: /\b(terketti|terkettim|terkettiler|terketmek|terkeden)\b/i,
    wrongDisplay: 'terketti',
    correctDisplay: 'terk etti',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'terk etmek' birleşik fiili ses olayı olmadığı için ayrı yazılır.",
    coachNote: "'terk etmek' ayrı yazılır, bitişik yazılamaz."
  },
  {
    wrongRegex: /\b(arzetti|arzederim|arzetmek)\b/i,
    wrongDisplay: 'arzetti',
    correctDisplay: 'arz etti',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'arz etmek' birleşik fiilinde ses olayı olmadığı için ayrı yazılır.",
    coachNote: "'arz etmek' resmi yazışmalarda da daima AYRI yazılır."
  },
  {
    wrongRegex: /\b(haketti|haketmek|haketmiş)\b/i,
    wrongDisplay: 'haketti',
    correctDisplay: 'hak etti',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'hak etmek' birleşik fiili ayrı yazılır.",
    coachNote: "'hak etmek' ses olayı olmadığı için AYRI yazılır."
  },
  {
    wrongRegex: /\b(sağol|sağolun)\b/i,
    wrongDisplay: 'sağol',
    correctDisplay: 'sağ ol',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "TDK kuralına göre 'sağ ol' kalıbı daima ayrı yazılır.",
    coachNote: "'sağ ol' ve 'sağ olun' her zaman ayrı yazılır."
  },

  // 2. Ünsüz Benzeşmesi (Sertleşmesi) & Fıstıkçı Şahap Kuralı
  {
    wrongRegex: /\b(değişgen\w*)\b/i,
    wrongDisplay: 'değişgenlik',
    correctDisplay: 'değişkenlik',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "TDK kuralına göre sert ünsüzle (f, s, t, k, ç, ş, h, p) biten 'değiş-' kökünden sonra gelen ek ünsüz sertleşmesine uğrayarak '-ken' (değişkenlik) olur.",
    coachNote: "FıSTıKÇı ŞaHaP kuralı: 'ş' sert ünsüzdür! Bu yüzden 'değiş-' köküne gelen '-gen' eki sertleşerek '-ken' (değişkenlik) olur."
  },
  {
    wrongRegex: /\b(çiçekci\w*)\b/i,
    wrongDisplay: 'çiçekcinin',
    correctDisplay: 'çiçekçinin',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "Sert ünsüz 'k' harfinden sonra gelen '-ci' eki sertleşerek '-çi' (çiçekçi) şeklinde yazılmalıdır.",
    coachNote: "'çiçek' sözcüğü sert ünsüz 'k' ile bittiği için ek 'çiçekçi' olur."
  },
  {
    wrongRegex: /\b(bitgi\w*)\b/i,
    wrongDisplay: 'bitgidir',
    correctDisplay: 'bitkidir',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "Sert ünsüz 't' harfinden sonra gelen ek sertleşerek '-ki' (bitki) olur.",
    coachNote: "'bit-' fiilinden türeyen 'bitki' sözcüğünde ünsüz benzeşmesi zorunludur."
  },
  {
    wrongRegex: /\b(1923\'de|1923 de|1975\'de|1975 de)\b/i,
    wrongDisplay: "1923'de",
    correctDisplay: "1923'te",
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "Sert ünsüzle (3=üç, 5=beş) biten sayılara gelen bulunma eki sertleşerek 'te/ta' olmalıdır.",
    coachNote: "Sayının okunuşunun son harfine bak: 'üç' (ç ile biter) -> 1923'te olmalıdır."
  },

  // 3. Gereksiz Ünlü Daralması
  {
    wrongRegex: /\b(kanıtlıya\w*|kanıtlıyamadı)\b/i,
    wrongDisplay: 'kanıtlıyamadı',
    correctDisplay: 'kanıtlayamadı',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "TDK kuralına göre '-yor' şimdiki zaman eki dışındaki eklerde (-a/-e ile biten fiillerde) daralma yapılmaz. 'kanıtlayamadı' şeklinde yazılır.",
    coachNote: "Yalnızca '-yor' eki daralma yapar. '-ama/-eme' eklerinde daralma yapılmaz: 'kanıtlayamadı' doğrudur."
  },
  {
    wrongRegex: /\b(oyalıya\w*|oyalıyacak)\b/i,
    wrongDisplay: 'oyalıyacak',
    correctDisplay: 'oyalayacak',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "Gereksiz ünlü daralması yazım yanlışıdır. Gelecek zaman ekinden önce daralma olmaz: 'oyalayacak' doğrudur.",
    coachNote: "Gelecek zaman ekinde daralma olmaz: 'oyalayacak', 'başlayacak', 'anlayacak'."
  },
  {
    wrongRegex: /\b(başlıya\w*|başlıyacak)\b/i,
    wrongDisplay: 'başlıyacak',
    correctDisplay: 'başlayacak',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "TDK kuralına göre 'başlamak' fiili gelecek zamanda daralmaz: 'başlayacak' doğrudur.",
    coachNote: "Yazıda daralma sadece '-yor' ekinde ve 'de-, ye-' fiillerinde (diye, yiyecek) olur."
  },

  // 4. Batılı / Yabancı Sözcüklerde İki Ünsüz Arası
  {
    wrongRegex: /\b(antırenör\w*)\b/i,
    wrongDisplay: 'antırenör',
    correctDisplay: 'antrenör',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "Batı kökenli sözcüklerde başta veya ortada çift ünsüz arasına sesli harf girmez.",
    coachNote: "Batı kökenli kelimelerde çift ünsüz arasına ünlü girmez: 'antrenör', 'stüdyo', 'kral', 'tren'."
  },
  {
    wrongRegex: /\b(sitüdyo\w*)\b/i,
    wrongDisplay: 'sitüdyo',
    correctDisplay: 'stüdyo',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "Batı kökenli sözcüklerin başında çift ünsüz arasına sesli girmez: 'stüdyo' doğrudur.",
    coachNote: "Doğrusu 'stüdyo' şeklindedir."
  },
  {
    wrongRegex: /\b(kıral\w*)\b/i,
    wrongDisplay: 'kıral',
    correctDisplay: 'kral',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "'kral' sözcüğünde 'k' ve 'r' harfleri arasına 'ı' harfi girmez.",
    coachNote: "'kral' kelimesi 'ı' olmadan yazılır."
  },
  {
    wrongRegex: /\b(pırogram\w*)\b/i,
    wrongDisplay: 'pırogram',
    correctDisplay: 'program',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "'program' sözcüğünde 'p' ve 'r' arasına ünlü harf girmez.",
    coachNote: "'program' kelimesi 'ı' olmadan yazılır."
  },

  // 5. İkilemeler (AYRI YAZILIR)
  {
    wrongRegex: /\b(artarda)\b/i,
    wrongDisplay: 'artarda',
    correctDisplay: 'art arda',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "İkilemeler her zaman ayrı yazılır: 'art arda' doğrudur.",
    coachNote: "'art arda' ikilemedir, daima ayrı yazılır."
  },
  {
    wrongRegex: /\b(yanyana)\b/i,
    wrongDisplay: 'yanyana',
    correctDisplay: 'yan yana',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "İkilemeler her zaman ayrı yazılır: 'yan yana' doğrudur.",
    coachNote: "'yan yana' daima ayrı yazılır."
  },
  {
    wrongRegex: /\b(başabaş)\b/i,
    wrongDisplay: 'başabaş',
    correctDisplay: 'başa baş',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "'başa baş' ikilemesi ayrı yazılır.",
    coachNote: "Hâl ekiyle kurulan ikilemeler ayrı yazılır: 'başa baş', 'göz göze', 'el ele'."
  },
  {
    wrongRegex: /\b(içlidışlı)\b/i,
    wrongDisplay: 'içlidışlı',
    correctDisplay: 'içli dışlı',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "'içli dışlı' ikilemesi ayrı yazılır.",
    coachNote: "İkilemeler daima ayrı yazılır."
  },

  // 6. Bağlaç Olan Da / De
  {
    wrongRegex: /\b(yarında)\b/i,
    wrongDisplay: 'yarında',
    correctDisplay: 'yarın da',
    category: "Bağlaç Olan Da / De'nin Yazımı",
    explanation: "Cümleden çıkarıldığında anlamı bozulmayan 'da/de' bağlaçtır ve her zaman ayrı yazılır.",
    coachNote: "Cümleden 'da'yı çıkarınca anlam bozulmuyorsa bağlaçtır: 'yarın da' ayrı yazılır."
  },
  {
    wrongRegex: /\b(sende\s+(gel|biliyorsun|yapma|anladın))\b/i,
    wrongDisplay: 'sende',
    correctDisplay: 'sen de',
    category: "Bağlaç Olan Da / De'nin Yazımı",
    explanation: "Bağlaç olan 'de' daima ayrı yazılır.",
    coachNote: "'Sen de' kalıbında 'de' bağlaçtır, ayrı yazılır."
  },

  // 7. Sık Karıştırılan Kelimeler
  {
    wrongRegex: /\b(herşey\w*)\b/i,
    wrongDisplay: 'herşey',
    correctDisplay: 'her şey',
    category: 'Ayrı Yazılan Kelimeler',
    explanation: "'Şey' sözcüğü Türkçede her zaman kendinden önceki sözcükten ayrı yazılır.",
    coachNote: "'Şey' her zaman AYRI yazılır: 'her şey', 'bir şey', 'çok şey'."
  },
  {
    wrongRegex: /\b(bir\s+çok|bir\s+çoğu)\b/i,
    wrongDisplay: 'bir çok',
    correctDisplay: 'birçok',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "Belgisiz 'birçok' ve 'birçoğu' sözcükleri kalıplaşmış olarak bitişik yazılır.",
    coachNote: "'birçok' ve 'birkaç' her zaman BİTİŞİK yazılır."
  },
  {
    wrongRegex: /\b(bir\s+kaç|bir\s+kaçı)\b/i,
    wrongDisplay: 'bir kaç',
    correctDisplay: 'birkaç',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "'birkaç' belgisiz sıfatı bitişik yazılır.",
    coachNote: "'birkaç' her zaman BİTİŞİK yazılır."
  },
  {
    wrongRegex: /\b(hiç\s+bir|hiç\s+biri)\b/i,
    wrongDisplay: 'hiç bir',
    correctDisplay: 'hiçbir',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "'hiçbir' sözcüğü geleneksel olarak bitişik yazılır.",
    coachNote: "'hiçbir' her zaman BİTİŞİK yazılır."
  },
  {
    wrongRegex: /\b(orjinal\w*)\b/i,
    wrongDisplay: 'orjinal',
    correctDisplay: 'orijinal',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "Fransızca kökenli 'orijinal' sözcüğünün ilk hecesinde 'i' harfi bulunur.",
    coachNote: "Doğru yazılışı 'orijinal' şeklindedir (iki 'i' vardır)."
  },
  {
    wrongRegex: /\b(unvan\w*)\b/i,
    wrongDisplay: 'unvan',
    correctDisplay: 'ünvan',
    category: 'Ses Olayları ve Yardımcı Fiiller',
    explanation: "TDK Güncel Türkçe Sözlüğü'nde madde başı 'ünvan' biçimindedir; 'unvan' yazımı yanlıştır.",
    coachNote: "Akılda tut: 'ünvan' ünlüsüyle yazılır ('ün' + 'van'), 'unvan' biçimi sınavlarda klasik tuzaktır."
  },
  {
    wrongRegex: /\b(dinazor\w*)\b/i,
    wrongDisplay: 'dinazor',
    correctDisplay: 'dinozor',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "TDK'ye göre 'dinozor' sözcüğü 'o' harfi ile yazılır.",
    coachNote: "Doğrusu 'dinozor' şeklindedir."
  },
  {
    wrongRegex: /\b(şöför\w*)\b/i,
    wrongDisplay: 'şöför',
    correctDisplay: 'şoför',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "Doğru yazılışı ilk harfi 'o', ikincisi 'ö' olan 'şoför' şeklindedir.",
    coachNote: "'şoför' kelimesi 'o' ve 'ö' sıralamasıyla yazılır."
  },
  // 8. 'Baş' Sözcüğüyle Kurulan Birleşikler (BİTİŞİK YAZILIR)
  {
    wrongRegex: /\b(baş\s+rol\w*)\b/i,
    wrongDisplay: 'baş rol',
    correctDisplay: 'başrol',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "TDK kuralına göre 'baş' sözcüğüyle oluşturulan sıfat tamlaması yapısındaki birleşik sözcükler bitişik yazılır.",
    coachNote: "Taktik: 'Baş' başta ise yapıştır! (Başrol, başyazar, başöğretmen, başbakan, başhekim, başkahraman... Hepsi bitişiktir!)."
  },
  {
    wrongRegex: /\b(gelişi\s+güzel)\b/i,
    wrongDisplay: 'gelişi güzel',
    correctDisplay: 'gelişigüzel',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "TDK kuralına göre anlam kaymasına uğrayarak kalıplaşan ve tarz bildiren birleşik zarflar bitişik yazılır.",
    coachNote: "Taktik: 'Rastgele' ve 'gelişigüzel' kelimeleri kalıplaşmış tarz zarflarıdır; asla ayrı yazılmaz!"
  },
  {
    wrongRegex: /\b(baş\s+öğretmen\w*)\b/i,
    wrongDisplay: 'baş öğretmen',
    correctDisplay: 'başöğretmen',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "TDK kuralına göre 'baş' sözcüğüyle kurulan unvan ve sıfatlar bitişik yazılır.",
    coachNote: "Taktik: 'Baş' ile başlayan tüm unvanlar (başöğretmen, başhekim, başçavuş) bitişik yazılır."
  },
  {
    wrongRegex: /\b(rast\s+gele)\b/i,
    wrongDisplay: 'rast gele',
    correctDisplay: 'rastgele',
    category: 'Bitişik Yazılan Birleşik Kelimeler',
    explanation: "TDK kuralına göre 'rastgele' kalıplaşmış zarfı bitişik yazılır.",
    coachNote: "Taktik: 'Rastgele' birleşik zarftır, her zaman bitişik yazılır."
  }
];

export const tdkService = {
  getRulesSummary(): string {
    return 'TDK Güncel Yazım Kılavuzu & ÖSYM Müfredatı Doğrulama Motoru';
  },

  /**
   * Checks if a word/candidate is a known correct form that should NOT be marked as wrong
   */
  isKnownCorrectWord(word: string): boolean {
    if (!word) return false;
    const clean = word.toLocaleLowerCase('tr-TR').replace(/^[\.,:;"'“”‘’\(\)]+|[\.,:;"'“”‘’\(\)]+$/g, '').trim();
    return TDK_CORRECT_WHITELIST.has(clean);
  },

  /**
   * Scans a single sentence/option for a deterministic spelling error
   */
  findErrorInSentence(sentence: string): { wrongDisplay: string; correctDisplay: string; category: CanonicalCategory; explanation: string; coachNote: string } | null {
    if (!sentence) return null;

    for (const rule of VERIFIED_RULES_DB) {
      const match = sentence.match(rule.wrongRegex);
      if (match) {
        return {
          wrongDisplay: match[0],
          correctDisplay: rule.correctDisplay,
          category: rule.category,
          explanation: rule.explanation,
          coachNote: rule.coachNote
        };
      }
    }
    return null;
  },

  /**
   * Scans all 5 options (A, B, C, D, E) deterministically
   */
  findErrorInOptions(options?: Record<string, string | undefined> | null): { wrongOption: string; wrongWord: string; correctWord: string; category: CanonicalCategory; explanation: string; coachNote: string } | null {
    if (!options || typeof options !== 'object') return null;

    for (const key of ['A', 'B', 'C', 'D', 'E']) {
      const optText = options[key];
      if (!optText || typeof optText !== 'string') continue;

      const found = this.findErrorInSentence(optText);
      if (found) {
        return {
          wrongOption: key,
          wrongWord: found.wrongDisplay,
          correctWord: found.correctDisplay,
          category: found.category,
          explanation: found.explanation,
          coachNote: found.coachNote
        };
      }
    }
    return null;
  },

  /**
   * Corrects phonetics or linguistic inaccuracies in coach notes (e.g. Fıstıkçı Şahap)
   */
  sanitizeCoachNote(rawNote: string | undefined, wrongWord: string, correctWord: string, category: string): string {
    if (!rawNote) {
      return `'${correctWord}' doğru yazılışıdır, '${wrongWord}' yazımı yanlıştır.`;
    }

    let clean = rawNote.trim();

    // Fix Fıstıkçı Şahap linguistic hallucination
    if (clean.includes("sert ünsüzle ('ş') bitmediği") || clean.includes("sert ünsüzle bitmediği") || clean.includes("sert ünsüz değildir")) {
      clean = `FıSTıKÇı ŞaHaP kuralı: 'ş' sert bir ünsüzdür. Bu nedenle 'değiş-' kökünden sonra gelen '-gen' eki sertleşerek '-ken' (değişkenlik) biçiminde yazılır.`;
    }

    return clean;
  }
};
