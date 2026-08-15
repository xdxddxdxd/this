import { TytRule } from '../types';

export const TYT_RULES: TytRule[] = [
  // 1-15: Bitişik Yazılan Birleşik Kelimeler
  {
    id: 1,
    title: "Anlam Kaymasına Uğrayan Birleşik Kelimeler",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Kelimelerden her ikisi veya ikincisi, birleşme sırasında anlam değişmesine uğradığında bu tür birleşik kelimeler bitişik yazılır.",
    examples: [
      { wrong: "kuş burnu", correct: "kuşburnu" },
      { wrong: "aslan ağzı", correct: "aslanağzı" },
      { wrong: "karafatma", correct: "karafatma" }
    ],
    tip: "İkinci kelime gerçek anlamını yitirmişse daima bitişik yazılır."
  },
  {
    id: 2,
    title: "Somut Yer Bildirmeyen Alt, Üst, Üzeri Sözleri",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Somut olarak yer bildirmeyen alt, üst ve üzeri sözlerinin sona getirilmesiyle kurulan birleşik kelimeler bitişik yazılır.",
    examples: [
      { wrong: "ayak üstü", correct: "ayaküstü" },
      { wrong: "akşam üzeri", correct: "akşamüzeri" },
      { wrong: "bilinç altı", correct: "bilinçaltı" }
    ],
    tip: "Somut yer (mekân) bildiriyorsa ayrı (su altı), soyut/zaman bildiriyorsa bitişiktir (akşamüstü)."
  },
  {
    id: 3,
    title: "-sever Ekiyle Kurulan Birleşikler",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "-sever sıfat-fiil ekiyle kurulan tüm birleşik kelimeler geleneksel olarak daima bitişik yazılır.",
    examples: [
      { wrong: "doğa sever", correct: "doğasever" },
      { wrong: "vatan sever", correct: "vatansever" },
      { wrong: "kitap sever", correct: "kitapsever" }
    ],
    tip: "Sanatsever, hayvansever, müziksever... Hepsi bitişik yazılır."
  },
  {
    id: 4,
    title: "Ev, Hane, Name, Zade Sözleriyle Kurulanlar",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Ev, hane, name, zade' sözcükleriyle kurulan birleşik kelimeler bitişik yazılır.",
    examples: [
      { wrong: "öğretmen evi", correct: "öğretmenevi" },
      { wrong: "ders hane", correct: "dershane" },
      { wrong: "seyahat name", correct: "seyahatname" }
    ],
    tip: "Huzurevi, polisevi, aşevi, eczane, beyanname... Hepsi bitişiktir."
  },
  {
    id: 5,
    title: "Altüst Sözcüğünün Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Altüst etmek' veya 'altüst olmak' deyimleşmiş birleşik kelimeleri bitişik yazılır.",
    examples: [
      { wrong: "alt üst oldu", correct: "altüst oldu" },
      { wrong: "alt üst etti", correct: "altüst etti" }
    ],
    tip: "Altüst kalıplaşmış bir durum zarfı olduğu için bitişiktir."
  },
  {
    id: 6,
    title: "Belirsizlik Bildiren Kalıplaşmış Sözcükler",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Belirsizlik anlamı taşıyan 'birkaç, birçok, hiçbir, biraz, birbiri, birtakım (belgisiz)' sözcükleri bitişik yazılır.",
    examples: [
      { wrong: "bir çok", correct: "birçok" },
      { wrong: "bir kaç", correct: "birkaç" },
      { wrong: "hiç bir", correct: "hiçbir" }
    ],
    tip: "Sayı bildiren 'bir takım elbise' ayrı; belgisiz 'birtakım insanlar' bitişiktir."
  },
  {
    id: 7,
    title: "Böcek ve Yiyecek Adlarında Kalıplaşma",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Kalıplaşmış olarak bitişik yazılan böcek ve yiyecek adlarına dikkat edilmelidir.",
    examples: [
      { wrong: "ateş böceği", correct: "ateşböceği" },
      { wrong: "uğur böceği", correct: "uğurböceği" },
      { wrong: "sivri biber", correct: "sivribiber" }
    ],
    tip: "Zeytinyağı, dereotu, karabiber bitişik; yeşil zeytin, kuru fasulye ayrıdır."
  },
  {
    id: 8,
    title: "Kurallı Birleşik Fiiller",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Yeterlik (-ebilmek), Tezlik (-ivermek), Süreklilik (-edurmak, -ekalmak), Yaklaşma (-eyazmak) fiilleri daima bitişik yazılır.",
    examples: [
      { wrong: "yapa bildi", correct: "yapabildi" },
      { wrong: "geli verdi", correct: "geliverdi" },
      { wrong: "baka kaldı", correct: "bakakaldı" }
    ],
    tip: "Kurallı birleşik fiillerin arasına hiçbir sözcük veya boşluk giremez."
  },
  {
    id: 9,
    title: "Ses Düşmesi Olan Birleşik Fiiller",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Etmek, olmak yardımcı fiilleriyle kurulup ilk kelimesinde ses düşmesi veya türemesi olanlar bitişik yazılır.",
    examples: [
      { wrong: "devir etti", correct: "devretti" },
      { wrong: "hüküm etti", correct: "hükmetti" },
      { wrong: "his etti", correct: "hissetti" }
    ],
    tip: "Ses olayı (düşme/türeme) varsa bitişik, yoksa ayrıdır (terk etti, arz etti)."
  },
  {
    id: 10,
    title: "Bugün Sözcüğünün Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'İçinde bulunduğumuz gün veya günümüz' anlamındaki 'bugün' bitişik yazılır.",
    examples: [
      { wrong: "Bu gün hava çok güzel", correct: "Bugün hava çok güzel" },
      { wrong: "Bu günün gençleri", correct: "Bugünün gençleri" }
    ],
    tip: "Yalnızca 'Bu günlerde değil, o günlerde' gibi işaret sıfatı olduğunda ayrı yazılır."
  },
  {
    id: 11,
    title: "Başı Sözüyle Kurulan Birleşikler",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Başı' sözcüğüyle oluşturulan unvan ve topluluk adları bitişik yazılır.",
    examples: [
      { wrong: "aşçı başı", correct: "aşçıbaşı" },
      { wrong: "usta başı", correct: "ustabaşı" },
      { wrong: "ele başı", correct: "elebaşı" }
    ],
    tip: "Mehterbaşı, binbaşı, yüzbaşı daima bitişiktir."
  },
  {
    id: 12,
    title: "Baş Sözcüğüyle Başlayan Sıfat Tamlamaları",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Baş sözcüğüyle başlayan ve önderlik/öncelik bildiren sıfat tamlamaları bitişik yazılır.",
    examples: [
      { wrong: "baş yazar", correct: "başyazar" },
      { wrong: "baş kahraman", correct: "başkahraman" },
      { wrong: "baş hekim", correct: "başhekim" }
    ],
    tip: "Başbakan, başrol, başöğretmen, başköşe daima bitişiktir."
  },
  {
    id: 13,
    title: "Oğlu ve Kızı Sözcükleri",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Akrabalık dışı türetilen 'oğlu' ve 'kızı' kelimeleri bitişik yazılır.",
    examples: [
      { wrong: "eloğlu", correct: "eloğlu" },
      { wrong: "çapanoğlu", correct: "çapanoğlu" },
      { wrong: "elkızı", correct: "elkızı" }
    ],
    tip: "Mecazi tür adlarında bitişik yazılır."
  },
  {
    id: 14,
    title: "Farsça ve Arapça Kurala Göre Birleşikler",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Dilimize geçmiş kalıplaşmış tamlamalar bitişik yazılır.",
    examples: [
      { wrong: "gayri menkul", correct: "gayrimenkul" },
      { wrong: "gayri resmi", correct: "gayriresmî" },
      { wrong: "hüsnü niyet", correct: "hüsnüniyet" }
    ],
    tip: "Kuvayımilliye, gayrimeşru, servetifünun bitişik yazılır."
  },
  {
    id: 15,
    title: "Pekiştirmeli Sözcüklerin Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "m, p, r, s harfleriyle yapılan pekiştirmeler daima bitişik yazılır.",
    examples: [
      { wrong: "sap sarı", correct: "sapsarı" },
      { wrong: "çep çevre", correct: "çepçevre" },
      { wrong: "düm düz", correct: "dümdüz" }
    ],
    tip: "Güpegündüz, güpeçevre, sırılsıklam, çırılçıplak bitişiktir."
  },

  // 16-30: Ayrı Yazılan Kelimeler & İkilemeler
  {
    id: 16,
    title: "İkilemelerin Yazımı",
    category: "Ayrı Yazılan Kelimeler",
    description: "İkilemeler her zaman ayrı yazılır ve aralarına virgül, kısa çizgi konmaz.",
    examples: [
      { wrong: "artarda / ardarda", correct: "art arda" },
      { wrong: "yanyana", correct: "yan yana" },
      { wrong: "başabaş", correct: "başa baş" }
    ],
    tip: "'Gitgide' ve 'birdenbire' ikileme değil kalıplaşmış zarftır ve bitişiktir!"
  },
  {
    id: 17,
    title: "Şey Sözcüğünün Yazımı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Şey' belgisiz zamiri her zaman kendinden önceki sözcükten ayrı yazılır.",
    examples: [
      { wrong: "herşey", correct: "her şey" },
      { wrong: "birşey", correct: "bir şey" },
      { wrong: "çokşey", correct: "çok şey" }
    ],
    tip: "'Şey' Türkçede hiçbir sözcüğe yapışmaz!"
  },
  {
    id: 18,
    title: "İç, Dış, Sıra Sözleriyle Oluşturulan Tamlamalar",
    category: "Ayrı Yazılan Kelimeler",
    description: "'İç, dış, sıra' sözleriyle oluşturulan birleşik kelime ve terimler ayrı yazılır.",
    examples: [
      { wrong: "haftaiçi", correct: "hafta içi" },
      { wrong: "yurtdışı", correct: "yurt dışı" },
      { wrong: "yanısıra", correct: "yanı sıra" }
    ],
    tip: "Çağ dışı, olağan dışı, ahlak dışı, peşi sıra daima ayrıdır."
  },
  {
    id: 19,
    title: "Ses Olayı Olmayan Yardımcı Fiiller",
    category: "Ayrı Yazılan Kelimeler",
    description: "Etmek, eylemek, olmak fiillerinde düşme veya türeme yoksa ayrı yazılır.",
    examples: [
      { wrong: "farketti", correct: "fark etti" },
      { wrong: "terketti", correct: "terk etti" },
      { wrong: "arzetti", correct: "arz etti" }
    ],
    tip: "Ayırt etmek, hak etmek, yok olmak, kabul etmek ayrıdır."
  },
  {
    id: 20,
    title: "Pek Çok, Pek Az, Hiç Kimse",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Pek çok', 'pek az', 'hiç kimse', 'her biri', 'her gün' tamlamaları ayrı yazılır.",
    examples: [
      { wrong: "pekçok", correct: "pek çok" },
      { wrong: "hiçkimse", correct: "hiç kimse" },
      { wrong: "hergün", correct: "her gün" }
    ],
    tip: "'Birçok' bitişik ama 'pek çok' ayrıdır!"
  },
  {
    id: 21,
    title: "Her An, Her Zaman, Her Biri",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Her' sözcüğü 'herkes, herhangi, herhalde' hariç genelde ayrı yazılır.",
    examples: [
      { wrong: "herzaman", correct: "her zaman" },
      { wrong: "heran", correct: "her an" },
      { wrong: "herbiri", correct: "her biri" }
    ],
    tip: "'Herhangi bir' öbeğinde 'herhangi' bitişik, 'bir' ayrı yazılır."
  },
  {
    id: 22,
    title: "Anlamını Koruyan İkinci Kelimeler (Hayvan, Bitki, Nesne)",
    category: "Ayrı Yazılan Kelimeler",
    description: "Birleşen sözcüklerden ikincisi tür anlamını koruyorsa ayrı yazılır.",
    examples: [
      { wrong: "köpekbalığı", correct: "köpek balığı" },
      { wrong: "kılıçbalığı", correct: "kılıç balığı" },
      { wrong: "çörekotu", correct: "çörek otu" }
    ],
    tip: "Balık, ot, böcek türünü koruyorsa ayrıdır."
  },
  {
    id: 23,
    title: "Yol ve Ulaşım İle İlgili Birleşikler",
    category: "Ayrı Yazılan Kelimeler",
    description: "Yol ve ulaşımla ilgili oluşturulan birleşik kelimeler ayrı yazılır.",
    examples: [
      { wrong: "karayolu", correct: "kara yolu" },
      { wrong: "havayolu", correct: "hava yolu" },
      { wrong: "demiryolu", correct: "demir yolu" }
    ],
    tip: "Deniz yolu, çevre yolu, kara yolu ayrı yazılır."
  },
  {
    id: 24,
    title: "Gök Cisimleri ve Yıldız Adları",
    category: "Ayrı Yazılan Kelimeler",
    description: "Tür bildiren gök cisimleri ayrı yazılır.",
    examples: [
      { wrong: "kutupyıldızı", correct: "Kutup Yıldızı" },
      { wrong: "çobanyıldızı", correct: "Çoban Yıldızı" },
      { wrong: "kuyrukluyıldız", correct: "kuyruklu yıldız" }
    ],
    tip: "Gök taşı, kuyruklu yıldız ayrı yazılır."
  },
  {
    id: 25,
    title: "Organ ve Organ Parçalarıyla Kurulanlar",
    category: "Ayrı Yazılan Kelimeler",
    description: "Organ adlarıyla kurulan nitelemeler ayrı yazılır.",
    examples: [
      { wrong: "serçeparmağı", correct: "serçe parmağı" },
      { wrong: "azıdişi", correct: "azı dişi" },
      { wrong: "omurilik", correct: "omurilik (istisna)" }
    ],
    tip: "Karga burnu (alet) bitişik; karga burnu (organ) ayrıdır."
  },
  {
    id: 26,
    title: "Zaman ve Vakit Bildiren Sözler",
    category: "Ayrı Yazılan Kelimeler",
    description: "Zaman bildiren tamlamalar ayrı yazılır.",
    examples: [
      { wrong: "geceyarı", correct: "gece yarısı" },
      { wrong: "günortası", correct: "gün ortası" },
      { wrong: "öğleüzeri", correct: "öğle üzeri (öğleüstü bitişik)" }
    ],
    tip: "Hafta sonu, bağ bozumu, gece yarısı ayrıdır."
  },
  {
    id: 27,
    title: "Birebir / Bire Bir Farkı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Yüz yüze, doğrudan' anlamında ayrı; 'etkili/ilaç gibi' anlamında bitişiktir.",
    examples: [
      { wrong: "birebir ders aldık", correct: "bire bir ders aldık (yüz yüze)" },
      { wrong: "bu ilaç bire bir geldi", correct: "bu ilaç birebir geldi (etkili)" }
    ],
    tip: "Bire bir görüşme (ayrı), bu çay gribe birebir (bitişik)."
  },
  {
    id: 28,
    title: "Somut Yer Bildiren Alt ve Üst Sözcükleri",
    category: "Ayrı Yazılan Kelimeler",
    description: "Somut olarak gerçek bir mekân/tabaka bildiren alt ve üst kelimeleri ayrı yazılır.",
    examples: [
      { wrong: "sualtı fotoğrafı", correct: "su altı fotoğrafı" },
      { wrong: "toprakaltı canlıları", correct: "toprak altı canlıları" },
      { wrong: "derialtı enjeksiyon", correct: "deri altı enjeksiyon" }
    ],
    tip: "Fiziksel yer varsa ayrı; soyut kavramsa bitişiktir (bilinçaltı)."
  },
  {
    id: 29,
    title: "Art Arda Yazımı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Art arda' ikilemesinde ilk sözcük 't', ikinci sözcük 'd' ile yazılır.",
    examples: [
      { wrong: "ard arda", correct: "art arda" },
      { wrong: "ardarda", correct: "art arda" },
      { wrong: "artarda", correct: "art arda" }
    ],
    tip: "İlk harf 'art' (arka), ikinci ek almış 'arda'dır."
  },
  {
    id: 30,
    title: "Bir Gün, Bir Şey, Bir Ara",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Bir' sözcüğü belgisiz veya sayı sıfatı olarak isimlerin önüne geldiğinde ayrı yazılır.",
    examples: [
      { wrong: "birgün elbet", correct: "bir gün elbet" },
      { wrong: "birara buluşalım", correct: "bir ara buluşalım" }
    ],
    tip: "Bir gün, bir ara, bir an daima ayrıdır."
  },

  // 31-45: Büyük Harflerin Yazımı
  {
    id: 31,
    title: "Unvanlar ve Saygı Sözleri",
    category: "Büyük Harflerin Yazımı",
    description: "Kişi adlarından önce ve sonra gelen unvanlar, meslek adları ve saygı sözleri büyük harfle başlar.",
    examples: [
      { wrong: "avukat Mehmet Bey", correct: "Avukat Mehmet Bey" },
      { wrong: "doktor Zeynep Hanım", correct: "Doktor Zeynep Hanım" },
      { wrong: "kaymakam Erol Bey", correct: "Kaymakam Erol Bey" }
    ],
    tip: "Akrabalık bildiren kelimeler lakap değilse küçüktür (Ayşe teyzem)."
  },
  {
    id: 32,
    title: "Kurum ve Kuruluş Adlarına Gelen Ekler",
    category: "Büyük Harflerin Yazımı",
    description: "Kurum, kuruluş, kurul ve bakanlık adlarına gelen hiçbir ek kesmeyle ayrılmaz!",
    examples: [
      { wrong: "Türk Dil Kurumu'na", correct: "Türk Dil Kurumuna" },
      { wrong: "Milli Eğitim Bakanlığı'ndan", correct: "Millî Eğitim Bakanlığından" },
      { wrong: "İstanbul Üniversitesi'nde", correct: "İstanbul Üniversitesinde" }
    ],
    tip: "TYT'nin en klasik tuzağıdır. Kurum/kuruluş adlarına kesme işareti konmaz!"
  },
  {
    id: 33,
    title: "Gezegen ve Yıldız Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Dünya, Güneş, Ay kelimeleri astronomi/coğrafya terimi olduğunda büyük, mecazda küçüktür.",
    examples: [
      { wrong: "dünya güneş etrafında döner", correct: "Dünya, Güneş etrafında döner" },
      { wrong: "sen benim dünyamsın", correct: "Sen benim dünyamsın (küçük)" }
    ],
    tip: "Terim anlamı varsa büyük ve kesmeyle ayrılır: Dünya'nın uydusu."
  },
  {
    id: 34,
    title: "Özel Ada Dahil Olmayan İl, İlçe, Köy Sözcükleri",
    category: "Büyük Harflerin Yazımı",
    description: "Özel ada dahil olmayan il, ilçe, köy, belde sözcükleri küçük harfle başlar.",
    examples: [
      { wrong: "Ankara İli", correct: "Ankara ili" },
      { wrong: "Çukurca Köyü", correct: "Çukurca köyü" },
      { wrong: "Kadıköy İlçesi", correct: "Kadıköy ilçesi" }
    ],
    tip: "İl, ilçe, köy sözcüklerinin ilk harfi küçüktür."
  },
  {
    id: 35,
    title: "Özel Ada Dahil Olmayan Tür ve Ürün İsimleri",
    category: "Büyük Harflerin Yazımı",
    description: "Özel ada dahil olmayan tür isimleri küçük harfle başlar.",
    examples: [
      { wrong: "Van Kedisi", correct: "Van kedisi" },
      { wrong: "Antep Fıstığı", correct: "Antep fıstığı" },
      { wrong: "Maraş Dondurması", correct: "Maraş dondurması" }
    ],
    tip: "Hindistan cevizi, Amasya elması, Brüksel lahanası daima küçük başlar."
  },
  {
    id: 36,
    title: "Yön Adlarının Yazımı",
    category: "Büyük Harflerin Yazımı",
    description: "Yön adları özel isimden önce gelirse büyük, sonra gelirse küçük yazılır.",
    examples: [
      { wrong: "kuzey Anadolu", correct: "Kuzey Anadolu" },
      { wrong: "Anadolu'nun Kuzeyi", correct: "Anadolu'nun kuzeyi" },
      { wrong: "batı medeniyeti", correct: "Batı medeniyeti (düşünce tarzı olarak büyük)" }
    ],
    tip: "Önce gelirse BÜYÜK (Kuzey Kıbrıs), sonra gelirse KÜÇÜK (Kıbrıs'ın kuzeyi)."
  },
  {
    id: 37,
    title: "Mahalle, Meydan, Bulvar, Cadde, Sokak Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Mahalle, meydan, bulvar, cadde, sokak adlarında geçen bu sözcükler büyük harfle başlar.",
    examples: [
      { wrong: "Atatürk bulvarı", correct: "Atatürk Bulvarı" },
      { wrong: "Yıldız mahallesi", correct: "Yıldız Mahallesi" },
      { wrong: "Gül sokak", correct: "Gül Sokak" }
    ],
    tip: "Gelen çekim eki kesmeyle ayrılır: Atatürk Bulvarı'nda."
  },
  {
    id: 38,
    title: "Saray, Köşk, Han, Kale, Köprü, Anıt Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Saray, köşk, han, kale, köprü, kule, anıt vb. yapı adlarının bütün kelimeleri büyük harfle başlar.",
    examples: [
      { wrong: "Topkapı sarayı", correct: "Topkapı Sarayı" },
      { wrong: "Boğaziçi köprüsü", correct: "Boğaziçi Köprüsü" },
      { wrong: "Galata kulesi", correct: "Galata Kulesi" }
    ],
    tip: "Çankaya Köşkü'ne, Bilge Kağan Anıtı'nda."
  },
  {
    id: 39,
    title: "Kitap, Dergi, Gazete ve Sanat Eseri Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Eser adlarının her kelimesi büyük başlar. Ancak özel ada dahil olmayan 'gazetesi, tablosu' küçük yazılır.",
    examples: [
      { wrong: "Hürriyet Gazetesi", correct: "Hürriyet gazetesi" },
      { wrong: "Resmî Gazete", correct: "Resmî Gazete (özel ada dahil olduğu için istisna)" },
      { wrong: "Mona Lisa Tablosu", correct: "Mona Lisa tablosu" }
    ],
    tip: "Resmî Gazete hariç diğer gazetelerde 'gazetesi' küçüktür (Milliyet gazetesi)."
  },
  {
    id: 40,
    title: "Başlıklarda ve Eser Adlarında Bağlaçların Yazımı",
    category: "Büyük Harflerin Yazımı",
    description: "Başlıkta kelimelerin sadece ilk harfi büyükse bağlaçlar küçük; tümü büyükse bağlaçlar da büyük yazılır.",
    examples: [
      { wrong: "Leyla İle Mecnun", correct: "Leyla ile Mecnun" },
      { wrong: "Su Ve Ceza", correct: "Suç ve Ceza" },
      { wrong: "LEYLA İLE MECNUN", correct: "LEYLA İLE MECNUN" }
    ],
    tip: "Sadece ilk harfler büyükse: 'Vatan yahut Silistre'."
  },
  {
    id: 41,
    title: "Tarihî Olay, Çağ ve Dönem Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Tarihî olay, çağ ve dönem adları büyük harfle başlar.",
    examples: [
      { wrong: "ilk çağ", correct: "İlk Çağ" },
      { wrong: "milli mücadele", correct: "Millî Mücadele" },
      { wrong: "tanzimat dönemi", correct: "Tanzimat Dönemi" }
    ],
    tip: "Orta Çağ, Yükselme Dönemi, Cilalı Taş Devri büyük yazılır."
  },
  {
    id: 42,
    title: "Milli ve Dini Bayramlar, Anma Günleri",
    category: "Büyük Harflerin Yazımı",
    description: "Ulusal, resmî ve dinî bayramlar ile anma ve kutlama günlerinin adları büyük harfle başlar.",
    examples: [
      { wrong: "cumhuriyet bayramı", correct: "Cumhuriyet Bayramı" },
      { wrong: "ramazan bayramı", correct: "Ramazan Bayramı" },
      { wrong: "öğretmenler günü", correct: "Öğretmenler Günü" }
    ],
    tip: "Anneler Günü'nde, 19 Mayıs Atatürk'ü Anma Gençlik ve Spor Bayramı."
  },
  {
    id: 43,
    title: "Kanun, Tüzük, Yönetmelik Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Kanun, tüzük, yönetmelik, yönerge, genelge adlarının her kelimesi büyük harfle başlar.",
    examples: [
      { wrong: "medenî kanun", correct: "Medenî Kanun" },
      { wrong: "borçlar kanunu", correct: "Borçlar Kanunu" },
      { wrong: "telif hakkı yönetmeliği", correct: "Telif Hakkı Yönetmeliği" }
    ],
    tip: "Belirli bir kanun kastedildiğinde 'bu Kanun'un ilk harfi de büyüktür."
  },
  {
    id: 44,
    title: "Devlet ve Ülke Adlarını Oluşturan Sözcükler",
    category: "Büyük Harflerin Yazımı",
    description: "Devlet ve ülke adlarını oluşturan tüm kelimeler büyük harfle başlar.",
    examples: [
      { wrong: "güney Afrika Cumhuriyeti", correct: "Güney Afrika Cumhuriyeti" },
      { wrong: "türkiye Cumhuriyeti", correct: "Türkiye Cumhuriyeti" },
      { wrong: "amerika birleşik devletleri", correct: "Amerika Birleşik Devletleri" }
    ],
    tip: "Devlet adlarının tüm unsurları büyüktür."
  },
  {
    id: 45,
    title: "Din, Mezhep ve Mitoloji Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Din ve mezhep adları ile bunların mensuplarını bildiren sözler büyük harfle başlar.",
    examples: [
      { wrong: "müslümanlık", correct: "Müslümanlık" },
      { wrong: "hristiyan", correct: "Hristiyan" },
      { wrong: "hanefilik", correct: "Hanefilik" }
    ],
    tip: "İslamiyet, Budizm, Katoliklik büyük yazılır."
  },

  // 46-60: Bağlaç Olan Da / De & Ki & Mı / Mi
  {
    id: 46,
    title: "Bağlaç Olan Da / De'nin Yazımı",
    category: "Bağlaç Olan Da / De'nin Yazımı",
    description: "Bağlaç olan 'da / de' her zaman ayrı yazılır. Cümleden çıkarıldığında anlam bozulmaz.",
    examples: [
      { wrong: "dosyanıda al", correct: "dosyanı da al" },
      { wrong: "bende geleceğim", correct: "ben de geleceğim" },
      { wrong: "gitsede kurtulsak", correct: "gitse de kurtulsak" }
    ],
    tip: "Bağlaç olan 'da/de' ASLA 'te/ta' şeklinde sertleşmez ve kesmeyle ayrılmaz!"
  },
  {
    id: 47,
    title: "Bulunma Durum Eki (-de / -da / -te / -ta)",
    category: "Bağlaç Olan Da / De'nin Yazımı",
    description: "Bulunma durum eki bitişik yazılır ve ses uyumuna göre -te/-ta olabilir.",
    examples: [
      { wrong: "ev de kaldım", correct: "evde kaldım" },
      { wrong: "kitap da yazıyor", correct: "kitapta yazıyor" },
      { wrong: "saat 5 de", correct: "saat 5'te" }
    ],
    tip: "Nerede? Kimde? sorularına cevap veriyorsa bitişiktir."
  },
  {
    id: 48,
    title: "Ayrı Yazılan Ki Bağlacı",
    category: "Bağlaç Olan Ki'nin Yazımı",
    description: "Cümleleri birbirine bağlayan 'ki' bağlacı her zaman ayrı yazılır.",
    examples: [
      { wrong: "öyleki", correct: "öyle ki" },
      { wrong: "demekki", correct: "demek ki" },
      { wrong: "bilmemki", correct: "bilmem ki" }
    ],
    tip: "Cümleden çıkarınca anlam bozulmuyorsa ayrıdır (anladım ki)."
  },
  {
    id: 49,
    title: "Kalıplaşmış Bitişik Ki'ler (SOMBAHÇEMİ)",
    category: "Bağlaç Olan Ki'nin Yazımı",
    description: "Sanki, Oysaki, Mademki, Belki, Halbuki, Çünkü, Meğerki, İllaki kelimelerinde 'ki' bitişik yazılır.",
    examples: [
      { wrong: "oysa ki", correct: "oysaki" },
      { wrong: "madem ki", correct: "mademki" },
      { wrong: "halbu ki", correct: "halbuki" }
    ],
    tip: "Şifre: SOMBAHÇEMİ (A ve E harfleri dolgudur)."
  },
  {
    id: 50,
    title: "Sıfat Yapan ve Zamir Olan -ki Eki",
    category: "Bağlaç Olan Ki'nin Yazımı",
    description: "Yer/zaman bildiren sıfat yapan -ki ve ismin yerini tutan ilgi zamiri -ki bitişik yazılır.",
    examples: [
      { wrong: "evde ki hesap", correct: "evdeki hesap" },
      { wrong: "seninki geldi", correct: "seninki geldi" },
      { wrong: "akşam ki maç", correct: "akşamki maç" }
    ],
    tip: "'-ler' eki getirdiğinde anlamlı oluyorsa bitişiktir: evdekiler, seninkiler."
  },
  {
    id: 51,
    title: "Soru Eki Mı / Mi / Mu / Mü'nün Yazımı",
    category: "Soru Eki Mı / Mi'nin Yazımı",
    description: "Soru eki 'mı/mi' her zaman ayrı yazılır. Kendisinden sonra gelen ekler ise 'mi'ye bitişir.",
    examples: [
      { wrong: "geliyormusun", correct: "geliyor musun" },
      { wrong: "okudunmu", correct: "okudun mu" },
      { wrong: "güzelmi güzel", correct: "güzel mi güzel (pekiştirme)" }
    ],
    tip: "Soru anlamı olmasa bile (pekiştirme/zaman) 'mi' daima ayrı yazılır."
  },
  {
    id: 52,
    title: "Soru Ekinden Sonra Gelen Şahıs Ekleri",
    category: "Soru Eki Mı / Mi'nin Yazımı",
    description: "Soru ekinden sonra gelen ekler bu eke bitişik yazılır.",
    examples: [
      { wrong: "gidecek mi siniz", correct: "gidecek misiniz" },
      { wrong: "yapar mı yım", correct: "yapar mıyım" }
    ],
    tip: "Gelecek misin, okur musunuz, bakar mısın?"
  },
  {
    id: 53,
    title: "Fiil Köküyle Karıştırılan -mı / -mi",
    category: "Soru Eki Mı / Mi'nin Yazımı",
    description: "Olumsuzluk eki -ma/-me daraldığında (-mıyor) soru eki sanılmamalıdır.",
    examples: [
      { wrong: "bizi dinle mi yor", correct: "bizi dinlemiyor" },
      { wrong: "neden bak mıyor", correct: "neden bakmıyor" }
    ],
    tip: "Olumsuzluk eki kelimeye bitişiktir; soru eki ayrıdır."
  },
  {
    id: 54,
    title: "Da / De Bağlacı Kesmeyle Ayrılmaz",
    category: "Bağlaç Olan Da / De'nin Yazımı",
    description: "Özel isimlerden sonra gelen bağlaç 'da / de' kesme işaretiyle ayrılmaz, doğrudan ayrı yazılır.",
    examples: [
      { wrong: "Ahmet'te geldi", correct: "Ahmet de geldi" },
      { wrong: "Ankara'da gidecek", correct: "Ankara da gidecek" }
    ],
    tip: "Özel isimden sonra kesme koyup 'de' yazmak yanlıştır; boşluk bırakıp 'de' yazılır."
  },
  {
    id: 55,
    title: "Hem ... Hem Bağlacı",
    category: "Ayrı Yazılan Kelimeler",
    description: "Tekrarlı bağlaçlar ayrı yazılır ve aralarına virgül konmaz.",
    examples: [
      { wrong: "hem, hem", correct: "hem ... hem" },
      { wrong: "ne, ne de", correct: "ne ... ne" }
    ],
    tip: "Ya ... ya, gerek ... gerek, ister ... ister bağlaçlarının arasına virgül konmaz."
  },

  // 56-75: Kısaltmalar, Tarih ve Sayıların Yazımı
  {
    id: 56,
    title: "Büyük Harfli Kısaltmalara Ek Getirilmesi",
    category: "Kısaltmaların Yazımı",
    description: "Büyük harfle yapılan kısaltmalara getirilen eklerde kısaltmanın son harfinin okunuşu esas alınır.",
    examples: [
      { wrong: "TDK'ya", correct: "TDK'ye (Türkçede 'ka' yoktur, 'ke'dir)" },
      { wrong: "THY'na", correct: "THY'ye" },
      { wrong: "MEB'na", correct: "MEB'e" }
    ],
    tip: "TDK'ye, TBMM'ye, TRT'de, SGK'ye!"
  },
  {
    id: 57,
    title: "Küçük Harfli Kısaltmalara Ek Getirilmesi",
    category: "Kısaltmaların Yazımı",
    description: "Küçük harflerle yapılan kısaltmalara getirilen eklerde kelimenin okunuşu esas alınır.",
    examples: [
      { wrong: "kg'ye", correct: "kg'a (kilograma)" },
      { wrong: "cm'ye", correct: "cm'ye (santimetreye)" },
      { wrong: "mm'den", correct: "mm'den (milimetreden)" }
    ],
    tip: "Ölçü birimleri kelime gibi okunarak ek alır: kg'a, km'ye."
  },
  {
    id: 58,
    title: "Sonunda Nokta Olan Kısaltmalara Ek Getirilmesi",
    category: "Kısaltmaların Yazımı",
    description: "Sonunda nokta bulunan kısaltmalara getirilen ekler kesme işaretiyle ayrılmaz!",
    examples: [
      { wrong: "vb.'leri", correct: "vb.leri" },
      { wrong: "Prof.'a", correct: "Prof.a" },
      { wrong: "Alm.'dan", correct: "Alm.dan" }
    ],
    tip: "Nokta zaten kesme görevi görür, ikinci bir kesme konmaz."
  },
  {
    id: 59,
    title: "Sayıların Metin İçinde Yazımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Metin içindeki sayılar yazıyla yazıldığında her basamağı ayrı yazılır (çek/senet hariç).",
    examples: [
      { wrong: "onsekiz", correct: "on sekiz" },
      { wrong: "binikiyüz", correct: "bin iki yüz" },
      { wrong: "üçyüzelli", correct: "üç yüz elli" }
    ],
    tip: "Yalnızca çek, senet ve oyun adlarında (beştaş, ellibir) sayılar bitişiktir."
  },
  {
    id: 60,
    title: "Üleştirme Sayılarının Yazımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Üleştirme sayıları rakamla değil, YALNIZCA yazıyla yazılır!",
    examples: [
      { wrong: "2'şer", correct: "ikişer" },
      { wrong: "5'er", correct: "beşer" },
      { wrong: "100'er", correct: "yüzer" }
    ],
    tip: "TYT'de kesinlikle sorulan kuraldır: '5'er' yanlış, 'beşer' doğrudur!"
  },
  {
    id: 61,
    title: "Sıra Sayılarına Ek Getirilmesi",
    category: "Tarih ve Sayıların Yazımı",
    description: "Sıra sayıları ekle gösterildiğinde rakamdan sonra sadece kesme ve ek yazılır, ayrıca nokta konmaz.",
    examples: [
      { wrong: "2.'nci", correct: "2'nci veya 2." },
      { wrong: "8.'inci", correct: "8'inci veya 8." },
      { wrong: "6'ıncı", correct: "6'ncı (altı - ı zaten var)" }
    ],
    tip: "Okunuşa dikkat: 2 (iki) ➔ 2'nci (2'inci yanlış!), 6 (altı) ➔ 6'ncı."
  },
  {
    id: 62,
    title: "Belirli Tarih Bildiren Ay ve Gün Adları",
    category: "Tarih ve Sayıların Yazımı",
    description: "Belirli bir tarih (gün veya yıl sayısı) bildiren ay ve gün adları büyük harfle başlar.",
    examples: [
      { wrong: "3 haziran 2024", correct: "3 Haziran 2024" },
      { wrong: "29 ekim pazartesi", correct: "29 Ekim Pazartesi" },
      { wrong: "Gelecek mayıs ayında", correct: "Gelecek mayıs ayında (tarih sayısı yok)" }
    ],
    tip: "Yanında rakam varsa BÜYÜK (15 Mayıs), rakam yoksa KÜÇÜK (mayıs ayı)."
  },
  {
    id: 63,
    title: "Tarihlerin Nokta ve Eğik Çizgiyle Yazımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Tarihlerde gün, ay ve yılı gösteren sayıları ayırmak için sadece nokta (.) veya eğik çizgi (/) kullanılır.",
    examples: [
      { wrong: "14/05.2025", correct: "14.05.2025 veya 14/05/2025" },
      { wrong: "14-05-2025", correct: "14.05.2025" }
    ],
    tip: "Ay adı yazıyla yazıldığında araya nokta veya çizgi konmaz: 14 Mayıs 2025."
  },
  {
    id: 64,
    title: "Saat ve Dakika Arasına Tek Nokta Konur",
    category: "Tarih ve Sayıların Yazımı",
    description: "Dijital saatlerin aksine Türkçede saat ve dakika arasına İKİ NOKTA DEĞİL, TEK NOKTA konur.",
    examples: [
      { wrong: "09:30'da", correct: "09.30'da" },
      { wrong: "14:00'da", correct: "14.00'te" }
    ],
    tip: "Tam saatlerde ek son sıfırlara göre değil, saate göre gelir: 14.00'te (sıfırda değil)."
  },
  {
    id: 65,
    title: "Romen Rakamlarının Kullanımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Yüzyıllarda, hükümdar adlarında, tarihlerde ayların yazılışında, kitap ciltlerinde Romen rakamı kullanılır.",
    examples: [
      { wrong: "20. Yüzyıl", correct: "XX. yüzyıl" },
      { wrong: "2. Abdülhamit", correct: "II. Abdülhamit" },
      { wrong: "14.V.2024", correct: "14.V.2024" }
    ],
    tip: "Sıra sayılarında Romen rakamından sonra da ek kesmeyle ayrılır: XX'nci."
  },

  // 66-85: Ses Olayları, Yardımcı Fiiller & Yazımı Karıştırılanlar
  {
    id: 66,
    title: "Yalnız ve Yanlış Sözcüklerinin Kök Mantığı",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yalnız 'yalın'dan (tek), yanlış ise 'yanıl-'maktan gelir.",
    examples: [
      { wrong: "yanlız", correct: "yalnız" },
      { wrong: "yalnış", correct: "yanlış" }
    ],
    tip: "Yalın ➔ Yalnız, Yanılmak ➔ Yanlış."
  },
  {
    id: 67,
    title: "Kirpik ve Kibrit Sözcükleri",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Harf karışması (metatez) olan sözcüklerin standart yazımı.",
    examples: [
      { wrong: "kiprik", correct: "kirpik" },
      { wrong: "kirbit", correct: "kibrit" }
    ],
    tip: "Göz kapağı kenarındaki kıl: kirpik."
  },
  {
    id: 68,
    title: "Orijinal, Dinozor, Egzoz",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yabancı kökenli kelimelerin TDK standart yazımları.",
    examples: [
      { wrong: "orjinal", correct: "orijinal" },
      { wrong: "dinazor", correct: "dinozor" },
      { wrong: "egsoz / eksoz", correct: "egzoz" }
    ],
    tip: "'Orijinal'de 2 tane 'i', 'dinozor'da 'o' vardır."
  },
  {
    id: 69,
    title: "Tıraş ve Kılavuz Sözcüklerinde 'ı' Harfi",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Farsça tıraş ve Türkçe kılavuz sözcüklerinde 'ı' harfi bulunur.",
    examples: [
      { wrong: "traş", correct: "tıraş" },
      { wrong: "klavuz", correct: "kılavuz" }
    ],
    tip: "Kravat, tren, spor sözcüklerinde ise araya ünlü girmez!"
  },
  {
    id: 70,
    title: "Unvan, Şoför, Silahşor",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Unvan 'u' ile başlar, silahşor '-şor' ile biter.",
    examples: [
      { wrong: "ünvan", correct: "unvan" },
      { wrong: "şöför", correct: "şoför" },
      { wrong: "silahşör", correct: "silahşor" }
    ],
    tip: "Unvan, şoför, silahşor, komiser standarttır."
  },
  {
    id: 71,
    title: "Karnabahar, Sarımsak, Laboratuvar",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Halk ağzında yanlış söylenen ama TDK'de kesin olan kelimeler.",
    examples: [
      { wrong: "karnıbahar", correct: "karnabahar" },
      { wrong: "sarmısak", correct: "sarımsak" },
      { wrong: "labaratuar", correct: "laboratuvar" }
    ],
    tip: "Karnabahar, sarımsak, laboratuvar, vejetaryen."
  },
  {
    id: 72,
    title: "Hukuk, Tabiat, Sanat Sözcüklerinde Yumuşama Olmaz",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yabancı kökenli tek heceli veya bazı çok heceli sözcüklerde p, ç, t, k yumuşamaz.",
    examples: [
      { wrong: "hukuğa aykırı", correct: "hukuka aykırı" },
      { wrong: "evrağı teslim et", correct: "evrakı teslim et" },
      { wrong: "sanadı beğendim", correct: "sanatı beğendim" }
    ],
    tip: "Hukuka, ahlaka, cumhuriyete, millete, devlete yumuşamaz."
  },
  {
    id: 73,
    title: "Ünlü Daralması Tuzağı",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yor eki dışındaki durumlarda daralma sadece 'de-' ve 'ye-' fiillerinde görülür.",
    examples: [
      { wrong: "anlamıyan", correct: "anlamayan" },
      { wrong: "başlıyacak", correct: "başlayacak" },
      { wrong: "diyen / yiyen", correct: "diyen / yiyen (doğru)" }
    ],
    tip: "Gelecek zaman ve sıfat-fiilde gereksiz daralma yapmak yazım yanlışıdır (başlayacak)."
  },
  {
    id: 74,
    title: "Ünsüz Benzeşmesi (Sertleşmesi) Kuralı",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Fıstıkçı Şahap sert ünsüzleriyle biten kelimelere gelen c, d, g ekleri ç, t, k'ye dönüşür.",
    examples: [
      { wrong: "kitapcı", correct: "kitapçı" },
      { wrong: "1923 de", correct: "1923'te" },
      { wrong: "yavaşca", correct: "yavaşça" }
    ],
    tip: "Sertleşme kuralına uymamak yazım yanlışı sayılır (1923'te)."
  },
  {
    id: 75,
    title: "Fark Etmek, Terk Etmek, Arz Etmek",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "İlk kelimesinde düşme veya türeme olmayan birleşik fiiller ayrı yazılır.",
    examples: [
      { wrong: "farketti", correct: "fark etti" },
      { wrong: "terketti", correct: "terk etti" },
      { wrong: "ayırtetmek", correct: "ayırt etmek" }
    ],
    tip: "Hak etti, vaat etti, ayırt etti daima ayrıdır."
  },

  // 76-90: Düzeltme İşareti (Şapka ^)
  {
    id: 76,
    title: "Düzeltme İşareti (Şapka ^) Kaldırılmamıştır!",
    category: "Düzeltme İşareti (Şapka ^)",
    description: "Anlam karışıklığını önlemek ve ince ünlüleri belirtmek için düzeltme işareti zorunludur.",
    examples: [
      { wrong: "hala (henüz)", correct: "hâlâ (henüz) / hala (babanın kız kardeşi)" },
      { wrong: "kar (kazanç)", correct: "kâr (kazanç) / kar (yağış)" },
      { wrong: "ama (kör)", correct: "âmâ (görme engelli) / ama (bağlaç)" }
    ],
    tip: "TDK şapkayı kaldırmamıştır; anlam ayırt etmede zorunludur."
  },
  {
    id: 77,
    title: "Tezgâh, Dükkân, Kâğıt, Rüzgâr",
    category: "Düzeltme İşareti (Şapka ^)",
    description: "g, k seslerinden sonra gelen a ve u ünlüleri üzerine inceltme işareti konur.",
    examples: [
      { wrong: "tezgah", correct: "tezgâh" },
      { wrong: "dukkan", correct: "dükkân" },
      { wrong: "kagit", correct: "kâğıt" }
    ],
    tip: "Rüzgâr, mahkûm, sükût, hikâye şapkalı yazılır."
  },
  {
    id: 78,
    title: "Nispet İ'si (Resmî, Dinî, Millî)",
    category: "Düzeltme İşareti (Şapka ^)",
    description: "Arapça ve Farsçadan geçen ve sıfat türeten nispet i'sinin üzerine şapka konur.",
    examples: [
      { wrong: "resmi gazete", correct: "Resmî Gazete" },
      { wrong: "milli eğitim", correct: "millî eğitim" },
      { wrong: "dini tören", correct: "dinî tören" }
    ],
    tip: "Belirtme durumu ile sıfatı ayırır: Türk askeri (belirtme) vs askerî okul (nispet)."
  },
  {
    id: 79,
    title: "Ahlakî, İlmî, Tarihî",
    category: "Düzeltme İşareti (Şapka ^)",
    description: "Nispet i'si alan sözcükler diğer eklerle birleştiğinde de şapkayı korur.",
    examples: [
      { wrong: "tarihi yapılar", correct: "tarihî yapılar" },
      { wrong: "ilmi araştırmalar", correct: "ilmî araştırmalar" }
    ],
    tip: "Tarihî roman, ahlakî değerler."
  },
  {
    id: 80,
    title: "Kâtip, Kâfir, Mekân",
    category: "Düzeltme İşareti (Şapka ^)",
    description: "k sesinin ince okunmasını sağlayan a ünlüsü şapka alır.",
    examples: [
      { wrong: "katip", correct: "kâtip" },
      { wrong: "mekan", correct: "mekân" },
      { wrong: "imkan", correct: "imkân" }
    ],
    tip: "İmkân, mekân, kâtip, kâinat şapkalıdır."
  },

  // 81-125: Ek ÖSYM & TDK Tuzak Kuralları
  {
    id: 81,
    title: "Gitgide ve Birdenbire Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Gitgide' ve 'birdenbire' kalıplaşmış zarf olduğu için daima bitişik yazılır.",
    examples: [
      { wrong: "git gide", correct: "gitgide" },
      { wrong: "birden bire", correct: "birdenbire" }
    ],
    tip: "İkileme gibi görünseler de kalıplaşmış zarftırlar."
  },
  {
    id: 82,
    title: "Gelgelelim, Ne Gezer",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Gelgelelim' bağlacı bitişik yazılır.",
    examples: [
      { wrong: "gel gelelim", correct: "gelgelelim" }
    ],
    tip: "Cümle başı bağlacı olarak bitişiktir."
  },
  {
    id: 83,
    title: "Var Yemez, Değer Bilmez",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "-mez/-maz ekiyle kurulan sıfatlar kalıplaştığında bitişik yazılır.",
    examples: [
      { wrong: "var yemez", correct: "varyemez" },
      { wrong: "hacıyatmaz", correct: "hacıyatmaz" }
    ],
    tip: "Karakter veya nesne adı olduğunda bitişiktir."
  },
  {
    id: 84,
    title: "Cankurtaran, Gökdelen",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "-an/-en sıfat-fiiliyle kurulan nesne ve meslek adları bitişik yazılır.",
    examples: [
      { wrong: "can kurtaran", correct: "cankurtaran" },
      { wrong: "gök delen", correct: "gökdelen" }
    ],
    tip: "Dalgakıran, barışsever, gökdelen bitişiktir."
  },
  {
    id: 85,
    title: "Gelişigüzel, Rastgele",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Kalıplaşmış durum zarfları bitişik yazılır.",
    examples: [
      { wrong: "gelişi güzel", correct: "gelişigüzel" },
      { wrong: "rast gele", correct: "rastgele" }
    ],
    tip: "Rastgele, gelişigüzel daima bitişiktir."
  },
  {
    id: 86,
    title: "Oldubitti, Kaptıkaçtı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "İki fiilin birleşmesiyle oluşan isimler bitişik yazılır.",
    examples: [
      { wrong: "oldu bittiye getirdi", correct: "oldubittiye getirdi" },
      { wrong: "dedi kodu", correct: "dedikodu" }
    ],
    tip: "Biçerdöver, uyurgezer, dedikodu bitişiktir."
  },
  {
    id: 87,
    title: "Yüzyıl (Asır) vs Yüz Yıl (Süre)",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Asır/çağ anlamındaki 'yüzyıl' bitişik; 100 senelik süre bildiren 'yüz yıl' ayrı yazılır.",
    examples: [
      { wrong: "21. yüz yıl", correct: "21. yüzyıl (asır)" },
      { wrong: "yüzyıl yaşadı", correct: "yüz yıl yaşadı (100 sene)" }
    ],
    tip: "Asır kastediliyorsa bitişik, matematiksel süre ise ayrıdır."
  },
  {
    id: 88,
    title: "Madde Başı ve Madde İçi",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Madde başı', 'satır başı' terimleri ayrı yazılır.",
    examples: [
      { wrong: "maddebaşı", correct: "madde başı" },
      { wrong: "satırbaşı", correct: "satır başı" }
    ],
    tip: "Satır başı, konu başı ayrı yazılır."
  },
  {
    id: 89,
    title: "Her Hâlde vs Herhalde",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Belki/ihtimal' anlamında 'herhalde' bitişik; 'kesinlikle/her durumda' anlamında 'her hâlde' ayrıdır.",
    examples: [
      { wrong: "herhalde gelir (ihtimal)", correct: "herhalde gelir (bitişik)" },
      { wrong: "herhalde seni korurum (kesin)", correct: "her hâlde seni korurum (ayrı)" }
    ],
    tip: "İhtimal bildiren tek kelime, kesin durum bildiren iki kelimedir."
  },
  {
    id: 90,
    title: "Göz Önünde, Göz Ardı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Göz önü' ve 'göz ardı' deyimleri ayrı yazılır.",
    examples: [
      { wrong: "gözardı etmek", correct: "göz ardı etmek" },
      { wrong: "gözönünde tutmak", correct: "göz önünde tutmak" }
    ],
    tip: "Göz ardı etmek daima ayrı yazılır."
  },
  {
    id: 91,
    title: "Sağduyu, Önsezi, Varsayım",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Kalıplaşmış soyut isimler bitişik yazılır.",
    examples: [
      { wrong: "sağ duyu", correct: "sağduyu" },
      { wrong: "ön sezi", correct: "önsezi" },
      { wrong: "var sayım", correct: "varsayım" }
    ],
    tip: "Sağduyu, önsezi, öngörü, varsayım bitişiktir."
  },
  {
    id: 92,
    title: "Ön Söz, Ön Yargı, Ön Lisans",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Ön' sözcüğüyle kurulan tamlamalar genelde ayrı yazılır (önsezi/öngörü hariç).",
    examples: [
      { wrong: "önsöz", correct: "ön söz" },
      { wrong: "önyargı", correct: "ön yargı" },
      { wrong: "önlisans", correct: "ön lisans" }
    ],
    tip: "Ön söz, ön yargı, ön lisans, ön büro ayrıdır!"
  },
  {
    id: 93,
    title: "Başbaşa, El Ele, Diz Dize",
    category: "Ayrı Yazılan Kelimeler",
    description: "Yönelme ekiyle kurulan ikilemeler ayrı yazılır.",
    examples: [
      { wrong: "başbaşa", correct: "baş başa" },
      { wrong: "dizdize", correct: "diz dize" },
      { wrong: "elele", correct: "el ele" }
    ],
    tip: "Göz göze, el ele, diz dize ayrıdır."
  },
  {
    id: 94,
    title: "Suçüstü, Suç Ortaklığı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Mecazi suçüstü bitişik; suç ortağı ayrı yazılır.",
    examples: [
      { wrong: "suç üstü yakalandı", correct: "suçüstü yakalandı" },
      { wrong: "suçortağı", correct: "suç ortağı" }
    ],
    tip: "Suçüstü (bitişik), suç ortağı (ayrı)."
  },
  {
    id: 95,
    title: "Ayak Yolu, Hava Yolu, Deniz Yolu",
    category: "Ayrı Yazılan Kelimeler",
    description: "Yol bildiren birleşik isimler ayrı yazılır.",
    examples: [
      { wrong: "denizyolu", correct: "deniz yolu" },
      { wrong: "havayolu şirketi", correct: "hava yolu şirketi" }
    ],
    tip: "Kara yolu, hava yolu, deniz yolu ayrıdır."
  },
  {
    id: 96,
    title: "Zeytinyağlı, Sıvı Yağ",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Zeytinyağı ve zeytinyağlı bitişik; sıvı yağ ayrı yazılır.",
    examples: [
      { wrong: "zeytin yağlı dolma", correct: "zeytinyağlı dolma" },
      { wrong: "sıvıyağ", correct: "sıvı yağ" }
    ],
    tip: "Zeytinyağı kalıplaşmış olduğu için bitişiktir."
  },
  {
    id: 97,
    title: "Yüzükoyun, Sırtüstü",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Vücut duruşu bildiren zarflar bitişik yazılır.",
    examples: [
      { wrong: "yüzü koyun", correct: "yüzükoyun" },
      { wrong: "sırt üstü", correct: "sırtüstü" }
    ],
    tip: "Yüzüstü bırakmak da bitişiktir."
  },
  {
    id: 98,
    title: "Akşamüzeri, Öğleüzeri",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Zaman bildiren 'üzeri' ekli sözcükler bitişik yazılır.",
    examples: [
      { wrong: "akşam üzeri", correct: "akşamüzeri" },
      { wrong: "öğle üzeri", correct: "öğleüzeri" }
    ],
    tip: "Soyut zaman kavramı taşıdığı için bitişiktir."
  },
  {
    id: 99,
    title: "Birkaçı, Birçoğu, Hiçbiri",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Belgisiz zamirler ek aldığında da bitişik yazılmaya devam eder.",
    examples: [
      { wrong: "bir çoğu", correct: "birçoğu" },
      { wrong: "hiç biri", correct: "hiçbiri" }
    ],
    tip: "Birkaçı, birçoğu, hiçbiri bitişiktir."
  },
  {
    id: 100,
    title: "Hakketmek (Oymak) vs Hak Etmek (Kazanmak)",
    category: "Ayrı Yazılan Kelimeler",
    description: "Maden üzerine kazımak/oymak 'hakketmek' (bitişik); layık olmak 'hak etmek' (ayrı) yazılır.",
    examples: [
      { wrong: "başarıyı hakketti", correct: "başarıyı hak etti (layık oldu)" },
      { wrong: "mermere hak etti", correct: "mermere hakketti (kazıdı)" }
    ],
    tip: "TYT'de en çok sorulan kelime çiftlerinden biridir!"
  },
  {
    id: 101,
    title: "Açgözlü, Tokgözlü",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Karakter ve huy bildiren sıfat tamlamaları bitişik yazılır.",
    examples: [
      { wrong: "aç gözlü", correct: "açgözlü" },
      { wrong: "tok gözlü", correct: "tokgözlü" }
    ],
    tip: "Açgözlü, tokgözlü, alçakgönüllü bitişiktir."
  },
  {
    id: 102,
    title: "Başpıtrak Sözcüğünün Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "'Başpıtrak' bitkisi ve kalıplaşmış tür adları bitişik yazılır.",
    examples: [
      { wrong: "baş pıtrak", correct: "başpıtrak" }
    ],
    tip: "Kalıplaşmış bitki türüdür."
  },
  {
    id: 103,
    title: "Yurt İçi, Yurt Dışı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'İç' ve 'dış' sözleriyle kurulan terimler ayrı yazılır.",
    examples: [
      { wrong: "yurtiçi kargo", correct: "yurt içi kargo" },
      { wrong: "yurtdışı seyahat", correct: "yurt dışı seyahat" }
    ],
    tip: "Yurt içi, yurt dışı, ülke içi ayrıdır."
  },
  {
    id: 104,
    title: "Sıradışı, Akıldışı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Dışı' sözcüğüyle oluşturulan tüm tamlamalar ayrı yazılır.",
    examples: [
      { wrong: "sıradışı olay", correct: "sıra dışı olay" },
      { wrong: "akıldışı iddia", correct: "akıl dışı iddia" }
    ],
    tip: "Sıra dışı, çağ dışı, akıl dışı ayrıdır."
  },
  {
    id: 105,
    title: "Her Gün, Her Yıl, Her Hafta",
    category: "Ayrı Yazılan Kelimeler",
    description: "Zaman bildiren 'her' tamlamaları ayrı yazılır.",
    examples: [
      { wrong: "hergün spor yaparım", correct: "her gün spor yaparım" },
      { wrong: "heryıl görüşürüz", correct: "her yıl görüşürüz" }
    ],
    tip: "Her gün, her an, her hafta ayrıdır."
  },
  {
    id: 106,
    title: "Türkçenin, İngilizcenin (Kesme Konmaz)",
    category: "Büyük Harflerin Yazımı",
    description: "Yapım eki almış özel isimlere gelen çekim ekleri kesme işaretiyle ayrılmaz!",
    examples: [
      { wrong: "Türkçe'nin kuralları", correct: "Türkçenin kuralları" },
      { wrong: "Ankaralı'lar", correct: "Ankaralılar" },
      { wrong: "İngilizce'yi", correct: "İngilizceyi" }
    ],
    tip: "Özel isim yapım eki aldıysa (-lı, -ce, -siz) sonra gelen çekim eki KESMEYLE AYRILMAZ!"
  },
  {
    id: 107,
    title: "Ahmetler, Aliler (Çoğul Eki Kesmeyle Ayrılmaz)",
    category: "Büyük Harflerin Yazımı",
    description: "Özel isimlere gelen çoğul eki (-ler / -lar) kesmeyle ayrılmaz, sonrasında gelen ek de ayrılmaz.",
    examples: [
      { wrong: "Mustafa Kemal'ler", correct: "Mustafa Kemaller" },
      { wrong: "Ahmet'lergil", correct: "Ahmetlergil" },
      { wrong: "Türklere", correct: "Türklere" }
    ],
    tip: "Aile ve benzerlik bildiren -ler eki kesmeyle ayrılmaz."
  },
  {
    id: 108,
    title: "Batı Trakyalı, Doğu Karadenizli",
    category: "Büyük Harflerin Yazımı",
    description: "Bölge adı niteliğindeki yön tamlamaları büyük harfle başlar.",
    examples: [
      { wrong: "batı Trakyalılar", correct: "Batı Trakyalılar" },
      { wrong: "doğu Karadeniz", correct: "Doğu Karadeniz" }
    ],
    tip: "Coğrafi bölge adlarında yön sözü büyüktür."
  },
  {
    id: 109,
    title: "Yüzde ve Binde İşaretlerinin Yazımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Yüzde ve binde işaretleri sayılardan önce boşluk bırakılmadan yazılır.",
    examples: [
      { wrong: "% 50", correct: "%50" },
      { wrong: "yüzde 25'i", correct: "%25'i" }
    ],
    tip: "İşaret ile sayı arasına boşluk konmaz."
  },
  {
    id: 110,
    title: "MÖ ve MS Kısaltmalarında Nokta Yoktur",
    category: "Kısaltmaların Yazımı",
    description: "Büyük harfle yapılan kısaltmalarda sadece 'T.C.' ve 'T.' (Türkçe) kısaltmalarında nokta vardır.",
    examples: [
      { wrong: "M.Ö. 500", correct: "MÖ 500" },
      { wrong: "T.B.M.M.", correct: "TBMM" },
      { wrong: "T.C.", correct: "T.C. (istisna nokta vardır)" }
    ],
    tip: "T.C. ve T. dışındaki büyük harf kısaltmalarına nokta konmaz!"
  },
  {
    id: 111,
    title: "Fasulye, Sarımsak, Kravat",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yazımı karıştırılan yaygın sözcüklerin TDK doğrusu.",
    examples: [
      { wrong: "fasülye", correct: "fasulye" },
      { wrong: "sarmısak", correct: "sarımsak" },
      { wrong: "kıravat", correct: "kravat" }
    ],
    tip: "Fasulye (u ile), kravat (ı yok)."
  },
  {
    id: 112,
    title: "Şalter, Şofben, Şalter",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Teknik ve ev aletleri adlarının standart imlası.",
    examples: [
      { wrong: "şofben", correct: "şofben" },
      { wrong: "şohben", correct: "şofben" },
      { wrong: "vantilatör", correct: "vantilatör" }
    ],
    tip: "Şofben, vantilatör, floresan."
  },
  {
    id: 113,
    title: "Karnabahar, Muşmula",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Sebze ve meyve adlarının yazımı.",
    examples: [
      { wrong: "karnıbahar", correct: "karnabahar" },
      { wrong: "muşmula", correct: "muşmula" }
    ],
    tip: "Karnabahar 'a' harfiyledir."
  },
  {
    id: 114,
    title: "Egzoz, Arazöz",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Sıkça sorulan araç parçaları.",
    examples: [
      { wrong: "eksoz / egsoz", correct: "egzoz" },
      { wrong: "arazöz", correct: "arazöz" }
    ],
    tip: "Egzoz (g ve z ile)."
  },
  {
    id: 115,
    title: "Kılavuz, Kulüp, Blok",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Çift ünsüzlü yabancı kelimelerin Türkçe söyleniş ve yazılışları.",
    examples: [
      { wrong: "klavuz", correct: "kılavuz" },
      { wrong: "klüp", correct: "kulüp" },
      { wrong: "bılok", correct: "blok" }
    ],
    tip: "Kılavuz ve kulüpte ünlü var; blok ve planda yoktur."
  },
  {
    id: 116,
    title: "Metrekareye, Santimetreye",
    category: "Kısaltmaların Yazımı",
    description: "Üs işaretli kısaltmalara ek getirilirken kesme işareti kullanılmaz.",
    examples: [
      { wrong: "m²'ye", correct: "m²ye" },
      { wrong: "cm³'e", correct: "cm³e" }
    ],
    tip: "Üs işareti zaten kesme görevi gördüğünden ikinci bir kesme konmaz."
  },
  {
    id: 117,
    title: "1980'ler, 1990'lar",
    category: "Tarih ve Sayıların Yazımı",
    description: "Yıllara gelen çokluk eki kesmeyle ayrılır.",
    examples: [
      { wrong: "1980ler", correct: "1980'ler" },
      { wrong: "90'lar", correct: "90'lar" }
    ],
    tip: "1980'lerde, 2000'lerin başında."
  },
  {
    id: 118,
    title: "Mademki, Meğerki",
    category: "Bağlaç Olan Ki'nin Yazımı",
    description: "Kalıplaşmış olan ki bağlaçları bitişik yazılır.",
    examples: [
      { wrong: "madem ki", correct: "mademki" },
      { wrong: "meğer ki", correct: "meğerki" }
    ],
    tip: "SOMBAHÇEMİ formülünü hatırla."
  },
  {
    id: 119,
    title: "Yurt İçi Uçuşlar, Şehirler Arası",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Arası' sözcüğüyle kurulan ikilemeli terimler ayrı yazılır.",
    examples: [
      { wrong: "şehirlerarası", correct: "şehirler arası" },
      { wrong: "uluslararası", correct: "uluslararası (istisna bitişik)" }
    ],
    tip: "Şehirler arası, milletler arası ayrı; uluslararası istisna olarak bitişiktir."
  },
  {
    id: 120,
    title: "Başbaşa Vermek, El Ele Tutuşmak",
    category: "Ayrı Yazılan Kelimeler",
    description: "Eylem bildiren ikilemeler daima ayrı yazılır.",
    examples: [
      { wrong: "başbaşa verdiler", correct: "baş başa verdiler" },
      { wrong: "elele tutuştular", correct: "el ele tutuştular" }
    ],
    tip: "İkilemeler ayrıdır."
  },
  {
    id: 121,
    title: "Rastlantı, Rastgele",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Rastlantı ve rastgele sözcükleri 't' harfini korur ve bitişik yazılır.",
    examples: [
      { wrong: "raslantı", correct: "rastlantı" },
      { wrong: "rasgele", correct: "rastgele" }
    ],
    tip: "Farsça 'rast' kökünden gelir."
  },
  {
    id: 122,
    title: "İnisiyatif, Entelektüel",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Batı kökenli sözcüklerin yazımı.",
    examples: [
      { wrong: "inisiyatif / insiyatif", correct: "inisiyatif" },
      { wrong: "entellektüel", correct: "entelektüel (tek l ile)" }
    ],
    tip: "Entelektüelde tek 'l', inisiyatifte 3 tane 'i' vardır."
  },
  {
    id: 123,
    title: "Hapşırmak, Aksırmak",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Yansıma fiillerin standart TDK yazımı.",
    examples: [
      { wrong: "hapşurmak", correct: "hapşırmak" },
      { wrong: "aksu", correct: "aksırık" }
    ],
    tip: "Hapşırmak 'ı' harfiyledir."
  },
  {
    id: 124,
    title: "Koleksiyon, Kompozisyon",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Çift ünsüzlü yabancı kelimeler.",
    examples: [
      { wrong: "koleksiyon", correct: "koleksiyon (tek l)" },
      { wrong: "kolleksiyon", correct: "koleksiyon" }
    ],
    tip: "Koleksiyon tek 'l' ile yazılır."
  },
  {
    id: 125,
    title: "Şefkat, Mahvolmak",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Arapça kökenli birleşikler.",
    examples: [
      { wrong: "şevkat", correct: "şefkat" },
      { wrong: "mahv olmak", correct: "mahvolmak" }
    ],
    tip: "Şefkat 'f' ile, mahvolmak bitişik yazılır."
  },
  {
    id: 126,
    title: "Kalıplaşmış Bitişik Ki'ler (SOMBAHÇEMİ)",
    category: "Bağlaç Olan Ki'nin Yazımı",
    description: "Bağlaç olduğu halde kalıplaşarak bitişik yazılan sözcükler 'SOMBAHÇEMİ' kodlamasıyla ezberlenir.",
    examples: [
      { wrong: "oysa ki", correct: "oysaki" },
      { wrong: "madem ki", correct: "mademki" },
      { wrong: "bel ki", correct: "belki" }
    ],
    tip: "Sanki, Oysaki, Mademki, Belki, A (boş), Halbuki, Çünkü, Meğerki, İllaki... Bu sözcüklerdeki 'ki'ler daima bitişiktir!"
  },
  {
    id: 127,
    title: "'Şey' Sözcüğünün Yazımı",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Şey' bir belgisiz zamirdir ve kendisinden önceki veya sonraki tüm sözcüklerden daima ayrı yazılır.",
    examples: [
      { wrong: "herşey", correct: "her şey" },
      { wrong: "hiçbirşey", correct: "hiçbir şey" },
      { wrong: "birşey", correct: "bir şey" }
    ],
    tip: "Altın kural: Şey her zaman 'şey'tan gibi tek başına, daima ayrı yazılır!"
  },
  {
    id: 128,
    title: "Art Arda İkilemesi",
    category: "Ayrı Yazılan Kelimeler",
    description: "Birbiri ardınca anlamına gelen bu söz öbeğinde ilk kelime 't' ile, ikincisi 'd' ile ayrı yazılır.",
    examples: [
      { wrong: "ard arda", correct: "art arda" },
      { wrong: "artarda", correct: "art arda" }
    ],
    tip: "İlk harf 't' (art), ikinci harf 'd' (arda) ve kesinlikle ayrı yazılır."
  },
  {
    id: 129,
    title: "'Gitgide' Zarfının Yazımı",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Zamanla, giderek anlamı taşıyan 'gitgide' sözcüğü kalıplaşmış bir durum zarfı olduğu için bitişik yazılır.",
    examples: [
      { wrong: "git gide", correct: "gitgide" }
    ],
    tip: "Gitgide tek kelimedir, ayrı yazılması ÖSYM'nin en sevdiği çeldiricilerdendir."
  },
  {
    id: 130,
    title: "Hak Etmek vs. Hakketmek",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Layık olmak anlamındaki 'hak etmek' ayrı; maden, ahşap üzerine oyma yapmak anlamındaki 'hakketmek' bitişik yazılır.",
    examples: [
      { wrong: "Bunu hakkettin.", correct: "Bunu hak ettin." },
      { wrong: "İsmini yüzüğe hak etti.", correct: "İsmini yüzüğe hakketti." }
    ],
    tip: "Ödülü hak ettin (ayrı), taşa hakketti (oydu/bitişik)."
  },
  {
    id: 131,
    title: "'Baş' Sözüyle Kurulan Sıfat Tamlamaları",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Baş sözüyle oluşturulan sıfat tamlamaları ve unvanlar bitişik yazılır.",
    examples: [
      { wrong: "baş hekim", correct: "başhekim" },
      { wrong: "baş öğretmen", correct: "başöğretmen" },
      { wrong: "baş rol", correct: "başrol" }
    ],
    tip: "Başyazar, başkomiser, başsavcı, başkahraman... Hepsi bitişiktir."
  },
  {
    id: 132,
    title: "Sonu 'Başı' ile Biten Topluluk / Unvan Adları",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Bir topluluğun yöneticisi veya ustası anlamındaki 'başı' sözüyle kurulanlar bitişik yazılır.",
    examples: [
      { wrong: "aşçı başı", correct: "aşçıbaşı" },
      { wrong: "ele başı", correct: "elebaşı" },
      { wrong: "usta başı", correct: "ustabaşı" }
    ],
    tip: "Çeribaşı, mehterbaşı, elebaşı, ustabaşı daima bitişik yazılır."
  },
  {
    id: 133,
    title: "Üleştirme Sayılarının Yazımı",
    category: "Tarih ve Sayıların Yazımı",
    description: "Üleştirme sayıları rakamla değil, YALNIZCA YAZIYLA yazılır.",
    examples: [
      { wrong: "2'şer", correct: "ikişer" },
      { wrong: "5'er", correct: "beşer" },
      { wrong: "100'er", correct: "yüzer" }
    ],
    tip: "2'şer veya 5'er yazımı kesinlikle bir yazım yanlışıdır!"
  },
  {
    id: 134,
    title: "'Ön' Sözcüğüyle Kurulan Ayrık Tamlamalar",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Ön' sözcüğü ile kurulan birçok isim ve sıfat tamlaması ayrı yazılır.",
    examples: [
      { wrong: "önsöz", correct: "ön söz" },
      { wrong: "önyargı", correct: "ön yargı" },
      { wrong: "önlisans", correct: "ön lisans" }
    ],
    tip: "Ön söz, ön yargı, ön sezi (istisna: önsezi ve öngörü bitişiktir, ön söz ve ön yargı ayrıdır!)."
  },
  {
    id: 135,
    title: "'İç, Dış, Sıra' Sözleriyle Kurulanlar",
    category: "Ayrı Yazılan Kelimeler",
    description: "İç, dış, sıra sözleriyle kurulan tamlama ve birleşikler ayrı yazılır.",
    examples: [
      { wrong: "haftaiçi", correct: "hafta içi" },
      { wrong: "yurtdışı", correct: "yurt dışı" },
      { wrong: "peşisıra", correct: "peşi sıra" }
    ],
    tip: "Hafta sonu, çağ dışı, sıra dışı, yanı sıra, ardı sıra hepsi ayrı yazılır."
  },
  {
    id: 136,
    title: "Yumuşamaya Uğramayan Arapça / Farsça Sözcükler",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Bazı yabancı kökenli tek heceli veya kalıplaşmış sözcüklerde 'k' harfi 'ğ'ye dönüşmez.",
    examples: [
      { wrong: "hukuğun üstünlüğü", correct: "hukukun üstünlüğü" },
      { wrong: "evrağın aslı", correct: "evrakın aslı" },
      { wrong: "ittifağın gücü", correct: "ittifakın gücü" }
    ],
    tip: "Hukuk, evrak, ahlak, cumhuriyet, tabiat gibi kelimelerde ünsüz yumuşaması olmaz."
  },
  {
    id: 137,
    title: "Sıkça Karıştırılan Yabancı Sözcükler",
    category: "Ayrı Yazılan Kelimeler",
    description: "Günlük hayatta harf sırası en çok karıştırılan kelimelerin TDK yazılışları.",
    examples: [
      { wrong: "laboratuar", correct: "laboratuvar" },
      { wrong: "karnıbahar", correct: "karnabahar" },
      { wrong: "orjinal", correct: "orijinal" }
    ],
    tip: "Laboratuvarda 'v' harfi vardır; karnabahar 'a' iledir; orijinalde iki 'i' vardır."
  },
  {
    id: 138,
    title: "Dinozor, Egzoz, Şoför",
    category: "Ses Olayları ve Yardımcı Fiiller",
    description: "Telaffuzu ile yazılışı sıkça karıştırılan batı kökenli kelimeler.",
    examples: [
      { wrong: "dinazor", correct: "dinozor" },
      { wrong: "egzos / eksoz", correct: "egzoz" },
      { wrong: "şöför", correct: "şoför" }
    ],
    tip: "Dinozor 'o' harfiyledir; egzoz 'g' ve iki 'z' iledir; şoför ilk 'o' son 'ö' iledir."
  },
  {
    id: 139,
    title: "Bitişik Yazılan 'Boyunbağı, Ayakkabı'",
    category: "Bitişik Yazılan Birleşik Kelimeler",
    description: "Kalıplaşmış eşya ve giyim isimleri bitişik yazılır.",
    examples: [
      { wrong: "boyun bağı", correct: "boyunbağı" },
      { wrong: "ayak kabı", correct: "ayakkabı" }
    ],
    tip: "Boyunbağı (kravat) TDK'de daima bitişiktir (2022 TYT sorusu)."
  },
  {
    id: 140,
    title: "İkilemelerin Yazımı ve Noktalama Yasağı",
    category: "Ayrı Yazılan Kelimeler",
    description: "İkilemeler daima ayrı yazılır ve ikilemeyi oluşturan kelimelerin arasına ASLA hiçbir noktalama işareti konmaz.",
    examples: [
      { wrong: "adım-adım", correct: "adım adım" },
      { wrong: "yan yana,", correct: "yan yana" },
      { wrong: "el, ele", correct: "el ele" }
    ],
    tip: "İkilemelerin arasına virgül veya kısa çizgi koymak büyük bir noktalama hatasıdır."
  }
];

export const GET_RANDOM_RULE = (): TytRule => {
  const index = Math.floor(Math.random() * TYT_RULES.length);
  return TYT_RULES[index];
};
