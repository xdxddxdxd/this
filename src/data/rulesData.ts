import { TytRule } from '../types';

export const TYT_RULES: TytRule[] = [
  {
    id: 1,
    title: "Bitişik Yazılan Birleşik Kelimeler",
    category: "Bitişik Yazılan Kelimeler",
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
    title: "Ayrı Yazılan Birleşik Kelimeler",
    category: "Ayrı Yazılan Kelimeler",
    description: "Birleşme sırasında kelimelerden hiçbiri veya ikinci kelimesi anlam değişikliğine uğramayan birleşik kelimeler ayrı yazılır.",
    examples: [
      { wrong: "köpekbalığı", correct: "köpek balığı" },
      { wrong: "çörekotu", correct: "çörek otu" },
      { wrong: "ateşböceği", correct: "ateş böceği" }
    ],
    tip: "İkinci kelime türünü koruyorsa (balık, ot, böcek vb.) ayrı yazılır."
  },
  {
    id: 3,
    title: "de / da Bağlacının Yazımı",
    category: "de / da Bağlacı",
    description: "Bağlaç olan 'da / de' ayrı yazılır ve kendisinden önceki kelimenin son ünlüsüne bağlı olarak büyük ünlü uyumuna uyar. Cümleden çıkarıldığında cümlenin anlamı bozulmaz (sadece daralabilir). Asla 'te / ta' şeklinde yazılmaz.",
    examples: [
      { wrong: "Gelsede görsek", correct: "Gelse de görsek" },
      { wrong: "Sen de mi brütüs", correct: "Sen de mi Brutus" },
      { wrong: "Kitapta kaldı", correct: "Kitapta kaldı (bulunma hali)" }
    ],
    tip: "Cümleden çıkarınca anlam tamamen bozuluyorsa bitişik (-de hali), bozulmuyorsa ayrıdır (bağlaç)."
  },
  {
    id: 4,
    title: "ki Bağlacının Yazımı",
    category: "ki Bağlacı",
    description: "Bağlaç olan 'ki' ayrı yazılır. Ancak kalıplaşmış olan 'SOMBAHÇEMİ' (Sanki, Oysaki, Mademki, Belki, Halbuki, Çünkü, Meğerki, İllaki) kelimelerinde bitişik yazılır.",
    examples: [
      { wrong: "öyleki", correct: "öyle ki" },
      { wrong: "demekki", correct: "demek ki" },
      { wrong: "oysa ki", correct: "oysaki" }
    ],
    tip: "'ki'den sonra '-ler' eki getirdiğinde anlamlı oluyorsa bitişik (sıfat veya zamir ki'si), anlamsız oluyorsa ayrıdır."
  },
  {
    id: 5,
    title: "Soru Eki mı / mi / mu / mü'nün Yazımı",
    category: "mi Soru Eki",
    description: "Bu ek geleneksel olarak ayrı yazılır ve kendisinden önceki kelimenin son ünlüsüne bağlı olarak ünlü uyumlarına uyar. Soru ekinden sonra gelen ekler bu eke bitişik yazılır.",
    examples: [
      { wrong: "Geliyormusun", correct: "Geliyor musun" },
      { wrong: "Okudunmu?", correct: "Okudun mu?" },
      { wrong: "Güzelmi güzel", correct: "Güzel mi güzel" }
    ],
    tip: "Pekiştirme veya zaman anlamı katsa bile 'mi' daima ayrı yazılır."
  },
  {
    id: 6,
    title: "Her Zaman, Her Şey, Her Biri",
    category: "Ayrı Yazılan Kelimeler",
    description: "'Şey' sözcüğü her zaman ayrı yazılır. 'Her zaman', 'her biri', 'her an' ayrı yazılırken; 'herkes', 'herhangi', 'herhalde' bitişik yazılır.",
    examples: [
      { wrong: "herşey", correct: "her şey" },
      { wrong: "herzaman", correct: "her zaman" },
      { wrong: "bir çok şey", correct: "birçok şey" }
    ],
    tip: "'Şey' daima ayrı, 'herhangi bir' ifadesinde 'herhangi' bitişik 'bir' ayrı yazılır."
  },
  {
    id: 7,
    title: "Birçok, Birkaç, Hiçbir, Birtakım",
    category: "Bitişik Yazılan Kelimeler",
    description: "Belirsizlik bildiren 'birçok, birkaç, hiçbir, birtakım (belirsizlik anlamında), biraz, birbiri' sözcükleri bitişik yazılır.",
    examples: [
      { wrong: "bir çok", correct: "birçok" },
      { wrong: "bir kaç", correct: "birkaç" },
      { wrong: "hiç bir", correct: "hiçbir" }
    ],
    tip: "'Birtakım elbise' derken sayı anlamında ayrı, 'birtakım sorunlar' derken belirsizlik anlamında bitişiktir."
  },
  {
    id: 8,
    title: "Pekiştirmeli Sözlerin Yazımı",
    category: "Pekiştirmelerin Yazımı",
    description: "Sıfat veya zarf görevindeki pekiştirmeli sözler (m, p, r, s harfleriyle yapılanlar) daima bitişik yazılır.",
    examples: [
      { wrong: "sap sarı", correct: "sapsarı" },
      { wrong: "düm düz", correct: "dümdüz" },
      { wrong: "çep çevre", correct: "çepçevre" },
      { wrong: "güpe gündüz", correct: "güpegündüz" }
    ],
    tip: "Pekiştirilmiş kelimeler arasına asla boşluk veya kesme işareti konulmaz."
  },
  {
    id: 9,
    title: "İkilemelerin Yazımı",
    category: "İkilemelerin Yazımı",
    description: "İkilemeler ayrı yazılır ve aralarına hiçbir noktalama işareti (özellikle kısa çizgi veya virgül) konulmaz.",
    examples: [
      { wrong: "el-ele", correct: "el ele" },
      { wrong: "gözgöze", correct: "göz göze" },
      { wrong: "art arda / ardarda", correct: "art arda" },
      { wrong: "yan yana / yanyana", correct: "yan yana" }
    ],
    tip: "'Gitgide' ve 'birdenbire' ikileme değil kalıplaşmış zarftır ve bitişik yazılır!"
  },
  {
    id: 10,
    title: "Büyük Harflerin Kullanımı - Kurum ve Kuruluş Adları",
    category: "Büyük Harflerin Yazımı",
    description: "Kurum, kuruluş ve kurul adlarının her kelimesi büyük harfle başlar. Bu adlara gelen ekler kesme işaretiyle ayrılmaz!",
    examples: [
      { wrong: "Türk Dil Kurumu'na", correct: "Türk Dil Kurumuna" },
      { wrong: "Milli Eğitim Bakanlığı'ndan", correct: "Millî Eğitim Bakanlığından" },
      { wrong: "Ankara Üniversitesi'nde", correct: "Ankara Üniversitesinde" }
    ],
    tip: "Kurum, kuruluş ve kurul adlarına gelen hiçbir çekim eki kesmeyle ayrılmaz."
  },
  {
    id: 11,
    title: "Unvan, Saygı ve Lakapların Yazımı",
    category: "Büyük Harflerin Yazımı",
    description: "Kişi adlarından önce ve sonra gelen unvanlar, saygı sözleri, rütbe adları ve lakaplar büyük harfle başlar. Ancak akrabalık bildiren sözler küçük harfle başlar.",
    examples: [
      { wrong: "avukat Kemal bey", correct: "Avukat Kemal Bey" },
      { wrong: "Zeynep Teyzem", correct: "Zeynep teyzem" },
      { wrong: "Genç Osman", correct: "Genç Osman" }
    ],
    tip: "Akrabalık adı lakap/unvan olmuşsa büyük yazılır (Nene Hatun, Dayı Kemal)."
  },
  {
    id: 12,
    title: "Sayıların ve Sıra Sayılarının Yazımı",
    category: "Sayıların Yazımı",
    description: "Sayılar metin içerisinde genellikle yazıyla yazılır ve basamakları ayrı yazılır (çek ve senetler hariç). Sıra sayıları ekle gösterildiğinde rakamdan sonra sadece kesme ve ek yazılır, ayrıca nokta konmaz.",
    examples: [
      { wrong: "onsekiz", correct: "on sekiz" },
      { wrong: "binikiyüz", correct: "bin iki yüz" },
      { wrong: "2.'inci", correct: "2'nci veya 2." },
      { wrong: "8.'inci", correct: "8'inci veya 8." }
    ],
    tip: "Sayının okunuşunun son harfine dikkat: 2 (iki) -> 2'nci (2'inci yanlış!), 6 (altı) -> 6'ncı."
  },
  {
    id: 13,
    title: "Üleştirme Sayılarının Yazımı",
    category: "Sayıların Yazımı",
    description: "Üleştirme sayıları rakamla değil, yalnızca yazıyla yazılır!",
    examples: [
      { wrong: "2'şer", correct: "ikişer" },
      { wrong: "5'er", correct: "beşer" },
      { wrong: "100'er", correct: "yüzer" }
    ],
    tip: "TYT'de en çok sorulan tuzaklardan biridir: '2'şer' yazımı kesinlikle yanlıştır."
  },
  {
    id: 14,
    title: "Yardımcı Eylemle Kurulan Birleşik Fiiller",
    category: "Bitişik Yazılan Kelimeler",
    description: "Etmek, eylemek, olmak, kılmak yardımcı fiilleriyle kurulan birleşik fiillerde ses düşmesi veya ses türemesi varsa bitişik, yoksa ayrı yazılır.",
    examples: [
      { wrong: "farketti", correct: "fark etti" },
      { wrong: "terketti", correct: "terk etti" },
      { wrong: "his etti", correct: "hissetti" },
      { wrong: "kayıp oldu", correct: "kayboldu" }
    ],
    tip: "Ses olayı (düşme/türeme) yoksa 'terk etmek', 'fark etmek', 'arz etmek' ayrıdır."
  },
  {
    id: 15,
    title: "Kurallı Birleşik Fiiller",
    category: "Bitişik Yazılan Kelimeler",
    description: "Yeterlik (yapabilmek), Tezlik (gelivermek), Süreklilik (bakakalmak, edegelmek), Yaklaşma (öleyazmak) fiilleri her zaman bitişik yazılır.",
    examples: [
      { wrong: "yapa bildi", correct: "yapabildi" },
      { wrong: "geli verdi", correct: "geliverdi" },
      { wrong: "baka kaldı", correct: "bakakaldı" }
    ],
    tip: "Kurallı birleşik fiillerin arasına boşluk giremez."
  },
  {
    id: 16,
    title: "Yer Adlarında Büyük Harf ve Kesme İşareti",
    category: "Büyük Harflerin Yazımı",
    description: "Kıta, bölge, il, ilçe, köy, semt adları büyük harfle başlar. Ancak özel ada dahil olmayan 'il, ilçe, köy, belde' sözcükleri küçük harfle başlar.",
    examples: [
      { wrong: "Ankara İli", correct: "Ankara ili" },
      { wrong: "Kadıköy İlçesi", correct: "Kadıköy ilçesi" },
      { wrong: "Uzungöl Beldesi", correct: "Uzungöl beldesi" }
    ],
    tip: "'Konya ili' derken i küçük, ama 'Van Gölü' derken G büyüktür çünkü göl ada dahildir."
  },
  {
    id: 17,
    title: "Coğrafi Terimler: Deniz, Nehir, Dağ, Boğaz, Göl",
    category: "Büyük Harflerin Yazımı",
    description: "Yer adlarında ilk isimden sonra gelen ve deniz, nehir, göl, dağ, boğaz vb. tür bildiren ikinci isimler büyük harfle başlar.",
    examples: [
      { wrong: "Ağrı dağı", correct: "Ağrı Dağı" },
      { wrong: "Çanakkale boğazı", correct: "Çanakkale Boğazı" },
      { wrong: "Dicle nehri", correct: "Dicle Nehri" },
      { wrong: "Tuz gölü", correct: "Tuz Gölü" }
    ],
    tip: "Ağrı Dağı'na gelen ek kesmeyle ayrılır: Ağrı Dağı'nın."
  },
  {
    id: 18,
    title: "Tarihlerin ve Gün/Ay Adlarının Yazımı",
    category: "Tarih ve Zamanların Yazımı",
    description: "Belirli bir tarih bildiren ay ve gün adları büyük harfle başlar. Belirli bir tarih bildirmeyen ay ve gün adları küçük harfle başlar.",
    examples: [
      { wrong: "14 mayıs 2025", correct: "14 Mayıs 2025" },
      { wrong: "Gelecek Mayıs ayında", correct: "Gelecek mayıs ayında" },
      { wrong: "29 ekim Cumhuriyet Bayramı", correct: "29 Ekim Cumhuriyet Bayramı" }
    ],
    tip: "Yanında gün veya yıl sayısı varsa Ay ve Gün adı büyüktür, yoksa küçüktür."
  },
  {
    id: 19,
    title: "Kısaltmaların Yazımı ve Ek Getirilmesi",
    category: "Kısaltmaların Yazımı",
    description: "Büyük harflerle yapılan kısaltmalara getirilen eklerde kısaltmanın son harfinin okunuşu esas alınır. Küçük harflerle yapılan kısaltmalarda kelimenin okunuşu esas alınır.",
    examples: [
      { wrong: "TDK'ya (ka diye okunmaz)", correct: "TDK'ye (Türkçede 'ka' sesi yoktur, 'ke'dir)" },
      { wrong: "THY'na", correct: "THY'ye" },
      { wrong: "kg'ye", correct: "kg'a (kilograma)" },
      { wrong: "cm'ye", correct: "cm'ye (santimetreye)" }
    ],
    tip: "TDK'ye, MEB'e, TBMM'ye! Türk alfabesinde 'K' harfi 'ke' diye okunur."
  },
  {
    id: 20,
    title: "Yön Adlarının Yazımı (Kuzey, Güney, Doğu, Batı)",
    category: "Büyük Harflerin Yazımı",
    description: "Yön adları bir özel ismin önünde yer alırsa büyük, sonrasında yer alırsa veya tek başına kullanılırsa küçük yazılır. Düşünce/yaşam tarzı anlamında 'Doğu' veya 'Batı' büyük harfle başlar.",
    examples: [
      { wrong: "kuzey Anadolu", correct: "Kuzey Anadolu" },
      { wrong: "Anadolu'nun Kuzeyi", correct: "Anadolu'nun kuzeyi" },
      { wrong: "batı medeniyeti", correct: "Batı medeniyeti" }
    ],
    tip: "Özel addan önce gelirse BÜYÜK (Kuzey Kıbrıs), sonra gelirse KÜÇÜK (Kıbrıs'ın kuzeyi)."
  },
  {
    id: 21,
    title: "Alt, Üst, Üzeri Sözleriyle Kurulan Birleşikler",
    category: "Bitişik Yazılan Kelimeler",
    description: "Somut olarak yer bildirmeyen 'alt, üst ve üzeri' sözlerinin sona getirilmesiyle kurulan birleşik kelimeler bitişik yazılır.",
    examples: [
      { wrong: "bilinç altı", correct: "bilinçaltı" },
      { wrong: "ayak üstü", correct: "ayaküstü" },
      { wrong: "akşam üzeri", correct: "akşamüzeri" },
      { wrong: "su altı", correct: "su altı (somut yer bildirdiği için ayrı)" }
    ],
    tip: "Somut bir yer (mekan) belirtiyorsa AYRI, soyut durum/zaman belirtiyorsa BİTİŞİK."
  },
  {
    id: 22,
    title: "Ev, Hane, Name, Zade Sözcükleri",
    category: "Bitişik Yazılan Kelimeler",
    description: "'Ev' kelimesiyle kurulan birleşik kelimeler ile 'hane, name, zade' ile kurulanlar bitişik yazılır.",
    examples: [
      { wrong: "öğretmen evi", correct: "öğretmenevi" },
      { wrong: "doğum evi", correct: "doğumevi" },
      { wrong: "ders hane", correct: "dershane" },
      { wrong: "seyahat name", correct: "seyahatname" }
    ],
    tip: "Huzurevi, yayınevi, konukevi, polisevi, aşevi... Hepsi bitişiktir."
  },
  {
    id: 23,
    title: "Art Arda, Yan Yana, Peş Peşe",
    category: "İkilemelerin Yazımı",
    description: "İkilemeler her zaman ayrı yazılır. 'Art arda' kelimesinde birinci kelime 't' ile, ikincisi 'd' iledir.",
    examples: [
      { wrong: "ard arda / ardarda", correct: "art arda" },
      { wrong: "yanyana", correct: "yan yana" },
      { wrong: "peşpeşe", correct: "peş peşe" },
      { wrong: "basa basa", correct: "basa basa" }
    ],
    tip: "'Art arda' yazarken ilk kelimede sert 't', ikincisinde yumuşak 'd' bulunur."
  },
  {
    id: 24,
    title: "Orijinal, Dinazor Değil Dinozor, Egzoz",
    category: "Yabancı Kökenli Kelimeler",
    description: "Yabancı kökenli ve günlük hayatta sıkça yanlış yazılan sözcüklerin TDK doğru yazımları.",
    examples: [
      { wrong: "dinazor", correct: "dinozor" },
      { wrong: "orjinal", correct: "orijinal" },
      { wrong: "egsoz / eksoz", correct: "egzoz" },
      { wrong: "kıravat", correct: "kravat" },
      { wrong: "traş", correct: "tıraş" }
    ],
    tip: "'Tıraş' ve 'kılavuz'da 'ı' vardır; 'kravat', 'tren', 'kral'da ünlü yoktur."
  },
  {
    id: 25,
    title: "Yalnız, Yanlış, Kirpik, Kibrit",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    description: "Harf karışıklığına (metatez) uğrayan kelimelerin kök mantığıyla doğru yazımı.",
    examples: [
      { wrong: "yanlız", correct: "yalnız (yalın'dan gelir)" },
      { wrong: "yalnış", correct: "yanlış (yanıl'maktan gelir)" },
      { wrong: "kiprik", correct: "kirpik" },
      { wrong: "kirbit", correct: "kibrit" }
    ],
    tip: "Yalın -> Yalnız, Yanılmak -> Yanlış."
  },
  {
    id: 26,
    title: "Unvan, Şoför, Silahşor, Komiser",
    category: "Yabancı Kökenli Kelimeler",
    description: "Türkçeye yerleşmiş yabancı kökenli unvan ve meslek adları.",
    examples: [
      { wrong: "ünvan", correct: "unvan" },
      { wrong: "şöför", correct: "şoför" },
      { wrong: "silahşör", correct: "silahşor" },
      { wrong: "komser", correct: "komiser" }
    ],
    tip: "'Unvan' u ile başlar, 'silahşor' o iledir."
  },
  {
    id: 27,
    title: "Meyve ve Bitki Adları: Karnabahar, Sarımsak",
    category: "Yabancı Kökenli Kelimeler",
    description: "Halk ağzında farklı söylenen ama TDK'de standart olan sebze-meyve adları.",
    examples: [
      { wrong: "karnıbahar", correct: "karnabahar" },
      { wrong: "sarmısak", correct: "sarımsak" },
      { wrong: "muzdarip", correct: "muzddarip -> muzdarip" },
      { wrong: "enginar", correct: "enginar" }
    ],
    tip: "'Karnıbahar' değil 'karnabahar'; 'sarmısak' değil 'sarımsak'."
  },
  {
    id: 28,
    title: "İç, Dış, Sıra Sözleriyle Oluşturulan Tamlamalar",
    category: "Ayrı Yazılan Kelimeler",
    description: "'İç, dış, sıra' sözleriyle oluşturulan birleşik kelime ve terimler ayrı yazılır.",
    examples: [
      { wrong: "haftaiçi", correct: "hafta içi" },
      { wrong: "yurtdışı", correct: "yurt dışı" },
      { wrong: "yanısıra", correct: "yanı sıra" },
      { wrong: "ardı sıra", correct: "ardı sıra" },
      { wrong: "olağandışı", correct: "olağan dışı" }
    ],
    tip: "'Hafta içi', 'yurt dışı', 'yanı sıra', 'akıl dışı' daima ayrı yazılır."
  },
  {
    id: 29,
    title: "Hukuk, Tabiat, Saat Gibi Kelimelerde Yumuşama Olmaz",
    category: "Ses Olaylarına Bağlı Yazım Kuralları",
    description: "Yabancı kökenli bazı kelimeler ünlüyle başlayan ek aldıklarında sonlarındaki p, ç, t, k sesleri yumuşamaz.",
    examples: [
      { wrong: "hukuğa", correct: "hukuka" },
      { wrong: "tabiatı (tabiyata)", correct: "tabiata" },
      { wrong: "saate (saade)", correct: "saate" },
      { wrong: "sanatın (sanadın)", correct: "sanatın" }
    ],
    tip: "Hukuka aykırı (hukuğa yanlış!), evrakı (evrağı yanlış!)."
  },
  {
    id: 30,
    title: "Arapça ve Farsça Kökenli Sözlerde Düzeltme İşareti (^)",
    category: "Düzeltme İşaretinin Kullanımı",
    description: "Yazılışları bir, anlamları ve okunuşları ayrı olan kelimeleri ayırt etmek için okunuşları uzun olan ünlülerin üzerine konur.",
    examples: [
      { wrong: "hala (babanın kız kardeşi) vs hala", correct: "hâlâ (henüz) / hala (akraba)" },
      { wrong: "kar vs kar", correct: "kâr (kazanç) / kar (yağış)" },
      { wrong: "resmi yazı", correct: "resmî yazı (nispet i'si)" }
    ],
    tip: "TDK düzeltme işaretini kaldırmamıştır! Hâlâ, kâr, resmî gibi kelimelerde zorunludur."
  }
];

export const GET_RANDOM_RULE = (): TytRule => {
  const index = Math.floor(Math.random() * TYT_RULES.length);
  return TYT_RULES[index];
};
