export interface TdkWordRecord {
  wrong: string;
  correct: string;
  category: string;
  explanation: string;
  meanings: string[];
}

export const TDK_DICTIONARY: Record<string, TdkWordRecord> = {
  "herzaman": {
    wrong: "herzaman",
    correct: "her zaman",
    category: "Ayrı Yazılan Kelimeler",
    explanation: "'Her' belgisiz sıfatı ile oluşturulan 'her zaman', 'her an', 'her gün' gibi tamlamalar ayrı yazılır.",
    meanings: ["Sürekli olarak, daima, her vakit"]
  },
  "herşey": {
    wrong: "herşey",
    correct: "her şey",
    category: "Ayrı Yazılan Kelimeler",
    explanation: "'Şey' sözcüğü Türkçede her zaman kendinden önceki kelimeden ayrı yazılır.",
    meanings: ["Bütün nesneler, maddeler veya durumlar"]
  },
  "bir çok": {
    wrong: "bir çok",
    correct: "birçok",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Belirsizlik bildiren 'birçok' sıfatı ve zamiri bitişik yazılır.",
    meanings: ["Oldukça çok, sayısı belirsiz miktarda"]
  },
  "bir kaç": {
    wrong: "bir kaç",
    correct: "birkaç",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Belirsizlik bildiren 'birkaç' kelimesi bitişik yazılır.",
    meanings: ["Az sayıda, iki üç kadar"]
  },
  "hiç bir": {
    wrong: "hiç bir",
    correct: "hiçbir",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Belirsizlik bildiren 'hiçbir' sözcüğü geleneksel olarak bitişik yazılır.",
    meanings: ["Bir tane bile olmayan, yok hükmünde"]
  },
  "yanlız": {
    wrong: "yanlız",
    correct: "yalnız",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    explanation: "Kelime 'yalın' kökünden türediği için doğru yazılışı 'yalnız'dır. 'Yanlız' yazımı yanlıştır.",
    meanings: ["Yanında başkası olmayan, tek başına, sadece"]
  },
  "yalnış": {
    wrong: "yalnış",
    correct: "yanlış",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    explanation: "Kelime 'yanıl-' kökünden türediği için doğru yazılışı 'yanlış'tır.",
    meanings: ["Bir kurala, gerçeğe uymayan, yanılgı içeren"]
  },
  "gelecek ler": {
    wrong: "gelecek ler",
    correct: "gelecekler",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Gelecek zaman kipi ve çoğul eki bir araya geldiğinde bitişik yazılır: 'gelecekler'. Ekler kelimeden ayrı yazılmaz.",
    meanings: ["Gelecek olan kişiler, üçüncü çoğul kişi gelecek zaman"]
  },
  "yapılcaktır": {
    wrong: "yapılcaktır",
    correct: "yapılacaktır",
    category: "Eklerin Yazımı",
    explanation: "Gelecek zaman eki '-ecek / -acak' yazı dilinde ses düşmesine uğramaz, 'yapılacaktır' şeklinde tam yazılmalıdır.",
    meanings: ["İleriki bir zamanda gerçekleşecek olan eylem"]
  },
  "ayrı": {
    wrong: "ayrı",
    correct: "ayrı",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Birleşen sözcüklerin anlamını koruduğu durumlarda ayrı yazım kuralı uygulanır.",
    meanings: ["Ayrılmış olan, müstakil, başka"]
  },
  "ardarda": {
    wrong: "ardarda",
    correct: "art arda",
    category: "İkilemelerin Yazımı",
    explanation: "İkilemeler ayrı yazılır. 'Art arda' sözünde birinci kelime 't' harfiyle biter.",
    meanings: ["Birbiri arkasından, peş peşe"]
  },
  "yanyana": {
    wrong: "yanyana",
    correct: "yan yana",
    category: "İkilemelerin Yazımı",
    explanation: "İkilemeler daima ayrı yazılır: 'yan yana'.",
    meanings: ["Birlikte, birbirinin yanında"]
  },
  "orjinal": {
    wrong: "orjinal",
    correct: "orijinal",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Fransızca kökenli 'original' sözcüğünün Türkçedeki doğru yazılışı 'orijinal'dir.",
    meanings: ["Özgün, taklit olmayan, ilk hali"]
  },
  "dinazor": {
    wrong: "dinazor",
    correct: "dinozor",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Kelimenin TDK doğru yazımı 'dinozor'dur. 'Dinazor' biçimi halk arasındaki yanlış kullanımdır.",
    meanings: ["Soyu tükenmiş dev sürüngen"]
  },
  "egsoz": {
    wrong: "egsoz",
    correct: "egzoz",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "İngilizce 'exhaust' kelimesinin TDK imlası 'egzoz'dur.",
    meanings: ["İçten yanmalı motorlarda yanmış gazların atıldığı boru"]
  },
  "eksoz": {
    wrong: "eksoz",
    correct: "egzoz",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "TDK'ye göre doğru yazım 'egzoz'dur.",
    meanings: ["Egzoz gazı tahliye sistemi"]
  },
  "ünvan": {
    wrong: "ünvan",
    correct: "unvan",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Arapça kökenli sözcük TDK sözlüğünde 'unvan' (u harfi ile) olarak yer alır.",
    meanings: ["Bir kimsenin meslek, makam veya durumuna göre aldığı san"]
  },
  "şöför": {
    wrong: "şöför",
    correct: "şoför",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Fransızca 'chauffeur' kelimesinin Türkçe doğru yazılışı 'şoför'dür.",
    meanings: ["Sürücü, mesleği taşıt kullanmak olan kimse"]
  },
  "silahşör": {
    wrong: "silahşör",
    correct: "silahşor",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Farsça '-şor' ekiyle oluşan kelime 'silahşor' şeklinde yazılır.",
    meanings: ["Silah kullanmada usta olan kimse"]
  },
  "kiprik": {
    wrong: "kiprik",
    correct: "kirpik",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    explanation: "Göz kapağının kenarındaki kılların doğru yazımı 'kirpik'tir.",
    meanings: ["Göz kapağının kenarındaki kıllar"]
  },
  "kirbit": {
    wrong: "kirbit",
    correct: "kibrit",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    explanation: "Doğru yazımı 'kibrit'tir.",
    meanings: ["Bir ucu kükürtlü tutuşturucu çöp"]
  },
  "kravat": {
    wrong: "kıravat",
    correct: "kravat",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Batı kökenli sözcüklerin başındaki çift ünsüz arasına ünlü harf girmez: 'kravat'.",
    meanings: ["Boyun bağı"]
  },
  "tıraş": {
    wrong: "traş",
    correct: "tıraş",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "Farsça kökenli 'tıraş' sözcüğünde 'ı' harfi bulunur.",
    meanings: ["Sakal, bıyık veya saçı kesme işi"]
  },
  "kılavuz": {
    wrong: "klavuz",
    correct: "kılavuz",
    category: "Yabancı Kökenli Kelimeler",
    explanation: "'Kılavuz' kelimesinde 'ı' harfi yer alır.",
    meanings: ["Yol gösteren, rehber"]
  },
  "haftaiçi": {
    wrong: "haftaiçi",
    correct: "hafta içi",
    category: "Ayrı Yazılan Kelimeler",
    explanation: "'İç, dış, sıra' sözleriyle oluşturulan birleşik kelimeler ayrı yazılır: 'hafta içi'.",
    meanings: ["Pazartesiden cumaya kadar olan günler"]
  },
  "yurtdışı": {
    wrong: "yurtdışı",
    correct: "yurt dışı",
    category: "Ayrı Yazılan Kelimeler",
    explanation: "'Dış' sözüyle kurulan terim ve sözcükler ayrı yazılır: 'yurt dışı'.",
    meanings: ["Ülke sınırları dışı, yabancı ülkeler"]
  },
  "yanısıra": {
    wrong: "yanısıra",
    correct: "yanı sıra",
    category: "Ayrı Yazılan Kelimeler",
    explanation: "'Sıra' sözüyle kurulan birleşikler ayrı yazılır: 'yanı sıra'.",
    meanings: ["Bununla birlikte, ayrıca"]
  },
  "farketti": {
    wrong: "farketti",
    correct: "fark etti",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Ses düşmesi veya türemesi olmayan yardımcı fiille kurulan birleşikler ayrı yazılır: 'fark etti'.",
    meanings: ["Gördü, anladı, ayrımsadı"]
  },
  "terketti": {
    wrong: "terketti",
    correct: "terk etti",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "Ses olayı olmadığı için 'terk etmek' ayrı yazılır.",
    meanings: ["Bıraktı, ayrıldı"]
  },
  "öğretmen evi": {
    wrong: "öğretmen evi",
    correct: "öğretmenevi",
    category: "Bitişik Yazılan Kelimeler",
    explanation: "'Ev' sözcüğü ile kurulan birleşik kelimeler daima bitişik yazılır: 'öğretmenevi'.",
    meanings: ["Öğretmenlerin konaklama ve dinlenme tesisi"]
  }
};
