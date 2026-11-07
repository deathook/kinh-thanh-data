// Multilingual Bible Book Names for all 66 canonical books across 12 languages
export const MULTILINGUAL_BOOK_NAMES: Record<number, Record<string, string>> = {
  1: { es: 'Génesis', pt: 'Gênesis', fr: 'Genèse', de: '1. Mose', ru: 'Бытие', ja: '創世記', zh: '创世记', ko: '창세기', th: 'ปฐมกาล', tl: 'Genesis', vi: 'Sáng thế Ký', en: 'Genesis' },
  2: { es: 'Éxodo', pt: 'Êxodo', fr: 'Exode', de: '2. Mose', ru: 'Исход', ja: '出エジプト記', zh: '出埃及记', ko: '출애굽기', th: 'อพยพ', tl: 'Exodo', vi: 'Xuất Ê-díp-tô Ký', en: 'Exodus' },
  3: { es: 'Levítico', pt: 'Levítico', fr: 'Lévitique', de: '3. Mose', ru: 'Левит', ja: 'レビ記', zh: '利未记', ko: '레위기', th: 'เลวีนิติ', tl: 'Levitico', vi: 'Lê-vi Ký', en: 'Leviticus' },
  4: { es: 'Números', pt: 'Números', fr: 'Nombres', de: '4. Mose', ru: 'Числа', ja: '民数記', zh: '民数记', ko: '민수기', th: 'กันดารวิถี', tl: 'Mga Bilang', vi: 'Dân số Ký', en: 'Numbers' },
  5: { es: 'Deuteronomio', pt: 'Deuteronômio', fr: 'Deutéronome', de: '5. Mose', ru: 'Второзаконие', ja: '申命記', zh: '申命记', ko: '신명기', th: 'เฉลยธรรมบัญญัติ', tl: 'Deuteronomio', vi: 'Phục truyền Luật lệ Ký', en: 'Deuteronomy' },
  6: { es: 'Josué', pt: 'Josué', fr: 'Josué', de: 'Josua', ru: 'Иисус Навин', ja: 'ヨシュア記', zh: '约书亚记', ko: '여호수아', th: 'โยชูวา', tl: 'Josue', vi: 'Giô-suê', en: 'Joshua' },
  7: { es: 'Jueces', pt: 'Juízes', fr: 'Juges', de: 'Richter', ru: 'Судьи', ja: '士師記', zh: '士师记', ko: '사사기', th: 'ผู้วินิจฉัย', tl: 'Mga Hukom', vi: 'Các Quan Xét', en: 'Judges' },
  8: { es: 'Rut', pt: 'Rute', fr: 'Ruth', de: 'Rut', ru: 'Руфь', ja: 'ルツ記', zh: '路得记', ko: '룻기', th: 'นางรูธ', tl: 'Ruth', vi: 'Ru-tơ', en: 'Ruth' },
  9: { es: '1 Samuel', pt: '1 Samuel', fr: '1 Samuel', de: '1. Samuel', ru: '1 Царств', ja: 'サムエル記上', zh: '撒母耳记上', ko: '사무엘상', th: '1 ซามูเอล', tl: '1 Samuel', vi: '1 Sa-mu-ên', en: '1 Samuel' },
  10: { es: '2 Samuel', pt: '2 Samuel', fr: '2 Samuel', de: '2. Samuel', ru: '2 Царств', ja: 'サムエル記下', zh: '撒母耳记下', ko: '사무엘하', th: '2 ซามูเอล', tl: '2 Samuel', vi: '2 Sa-mu-ên', en: '2 Samuel' },
  11: { es: '1 Reyes', pt: '1 Reis', fr: '1 Rois', de: '1. Könige', ru: '3 Царств', ja: '列王記上', zh: '列王纪上', ko: '열왕기상', th: '1 พงศ์กษัตริย์', tl: '1 Mga Hari', vi: '1 Các Vua', en: '1 Kings' },
  12: { es: '2 Reyes', pt: '2 Reis', fr: '2 Rois', de: '2. Könige', ru: '4 Царств', ja: '列王記下', zh: '列王纪下', ko: '열왕기하', th: '2 พงศ์กษัตริย์', tl: '2 Mga Hari', vi: '2 Các Vua', en: '2 Kings' },
  13: { es: '1 Crónicas', pt: '1 Crônicas', fr: '1 Chroniques', de: '1. Chronik', ru: '1 Паралипоменон', ja: '歴代志上', zh: '历代志上', ko: '역대상', th: '1 พงศาวดาร', tl: '1 Mga Cronica', vi: '1 Sử ký', en: '1 Chronicles' },
  14: { es: '2 Crónicas', pt: '2 Crônicas', fr: '2 Chroniques', de: '2. Chronik', ru: '2 Паралипоменон', ja: '歴代志下', zh: '历代志下', ko: '역대하', th: '2 พงศาวดาร', tl: '2 Mga Cronica', vi: '2 Sử ký', en: '2 Chronicles' },
  15: { es: 'Esdras', pt: 'Esdras', fr: 'Esdras', de: 'Esra', ru: 'Ездра', ja: 'エズラ記', zh: '以斯拉记', ko: '에스라', th: 'เอสรา', tl: 'Ezra', vi: 'E-xơ-ra', en: 'Ezra' },
  16: { es: 'Nehemías', pt: 'Neemias', fr: 'Néhémie', de: 'Nehemia', ru: 'Неемия', ja: 'ネヘミヤ記', zh: '尼希米记', ko: '느헤미야', th: 'เนหะมีย์', tl: 'Nehemias', vi: 'Nê-hê-mi', en: 'Nehemiah' },
  17: { es: 'Ester', pt: 'Ester', fr: 'Esther', de: 'Ester', ru: 'Есфирь', ja: 'エステル記', zh: '以斯帖记', ko: '에스더', th: 'เอสเธอร์', tl: 'Ester', vi: 'Ê-xơ-tê', en: 'Esther' },
  18: { es: 'Job', pt: 'Jó', fr: 'Job', de: 'Hiob', ru: 'Иов', ja: 'ヨブ記', zh: '约伯记', ko: '욥기', th: 'โยบ', tl: 'Job', vi: 'Gióp', en: 'Job' },
  19: { es: 'Salmos', pt: 'Salmos', fr: 'Psaumes', de: 'Psalmen', ru: 'Псалтирь', ja: '詩篇', zh: '诗篇', ko: '시편', th: 'สดุดี', tl: 'Mga Awit', vi: 'Thi Thiên', en: 'Psalms' },
  20: { es: 'Proverbios', pt: 'Provérbios', fr: 'Proverbes', de: 'Sprüche', ru: 'Притчи', ja: '箴言', zh: '箴言', ko: '잠언', th: 'สุภาษิต', tl: 'Mga Kawikaan', vi: 'Châm Ngôn', en: 'Proverbs' },
  21: { es: 'Eclesiastés', pt: 'Eclesiastes', fr: 'Ecclésiaste', de: 'Prediger', ru: 'Екклесиаст', ja: '伝道の書', zh: '传道书', ko: '전도서', th: 'ปัญญาจารย์', tl: 'Eclesiastes', vi: 'Truyền Đạo', en: 'Ecclesiastes' },
  22: { es: 'Cantares', pt: 'Cantares', fr: 'Cantique des Cantiques', de: 'Hohelied', ru: 'Песнь Песней', ja: '雅歌', zh: '雅歌', ko: '아가', th: 'เพลงซาโลมอน', tl: 'Awit ni Solomon', vi: 'Nhã Ca', en: 'Song of Solomon' },
  23: { es: 'Isaías', pt: 'Isaías', fr: 'Ésaïe', de: 'Jesaja', ru: 'Исаия', ja: 'イザヤ書', zh: '以赛亚书', ko: '이사야', th: 'อิสยาห์', tl: 'Isaias', vi: 'Ê-sai', en: 'Isaiah' },
  24: { es: 'Jeremías', pt: 'Jeremias', fr: 'Jérémie', de: 'Jeremia', ru: 'Иеремия', ja: 'エレミヤ書', zh: '耶利米书', ko: '예레미야', th: 'เยเรมีย์', tl: 'Jeremias', vi: 'Giê-rê-mi', en: 'Jeremiah' },
  25: { es: 'Lamentaciones', pt: 'Lamentações', fr: 'Lamentations', de: 'Klagelieder', ru: 'Плач Иеремии', ja: '哀歌', zh: '耶利米哀歌', ko: '예레미야애가', th: 'เพลงคร่ำครวญ', tl: 'Mga Panaghoy', vi: 'Ca Thương', en: 'Lamentations' },
  26: { es: 'Ezequiel', pt: 'Ezequiel', fr: 'Ézéchiel', de: 'Hesekiel', ru: 'Иезекииль', ja: 'エゼキエル書', zh: '以西结书', ko: '에스겔', th: 'เอเสเคียล', tl: 'Ezekiel', vi: 'Ê-xê-chi-ên', en: 'Ezekiel' },
  27: { es: 'Daniel', pt: 'Daniel', fr: 'Daniel', de: 'Daniel', ru: 'Даниил', ja: 'ダニエル書', zh: '但以理书', ko: '다니엘', th: 'ดาเนียล', tl: 'Daniel', vi: 'Đa-ni-ên', en: 'Daniel' },
  28: { es: 'Oseas', pt: 'Oséias', fr: 'Osée', de: 'Hosea', ru: 'Осия', ja: 'ホセア書', zh: '何西阿书', ko: '호세아', th: 'โฮเชยา', tl: 'Oseas', vi: 'Ô-sê', en: 'Hosea' },
  29: { es: 'Joel', pt: 'Joel', fr: 'Joël', de: 'Joel', ru: 'Иоиль', ja: 'ヨエル書', zh: '约珥书', ko: '요엘', th: 'โยเอล', tl: 'Joel', vi: 'Giô-ên', en: 'Joel' },
  30: { es: 'Amós', pt: 'Amós', fr: 'Amos', de: 'Amos', ru: 'Амос', ja: 'アモス書', zh: '阿摩司书', ko: '아모스', th: 'อาโมส', tl: 'Amos', vi: 'A-mốt', en: 'Amos' },
  31: { es: 'Abdías', pt: 'Obadias', fr: 'Abdias', de: 'Obadja', ru: 'Авдий', ja: 'オバデヤ書', zh: '俄巴底亚书', ko: '오바댜', th: 'โอบาดีห์', tl: 'Obadias', vi: 'Áp-đia', en: 'Obadiah' },
  32: { es: 'Jonás', pt: 'Jonas', fr: 'Jonas', de: 'Jona', ru: 'Иона', ja: 'ヨナ書', zh: '约拿书', ko: '요나', th: 'โยนาห์', tl: 'Jonas', vi: 'Giô-na', en: 'Jonah' },
  33: { es: 'Miqueas', pt: 'Miquéias', fr: 'Michée', de: 'Micha', ru: 'Михей', ja: 'ミカ書', zh: '弥迦书', ko: '미가', th: 'มีคาห์', tl: 'Mikas', vi: 'Mi-chê', en: 'Micah' },
  34: { es: 'Nahúm', pt: 'Naum', fr: 'Nahum', de: 'Nahum', ru: 'Наум', ja: 'ナホム書', zh: '那鸿书', ko: '나훔', th: 'นาฮูม', tl: 'Nahum', vi: 'Na-hum', en: 'Nahum' },
  35: { es: 'Habacuc', pt: 'Habacuque', fr: 'Habacuc', de: 'Habakuk', ru: 'Аввакум', ja: 'ハバクク書', zh: '哈巴谷书', ko: '하박국', th: 'ฮาบากุก', tl: 'Habakkuk', vi: 'Ha-ba-cúc', en: 'Habakkuk' },
  36: { es: 'Sofonías', pt: 'Sofonias', fr: 'Sophonie', de: 'Zefanja', ru: 'Софония', ja: 'ゼパニヤ書', zh: '西番雅书', ko: '스바냐', th: 'เศฟันยาห์', tl: 'Zefanias', vi: 'Sô-phô-ni', en: 'Zephaniah' },
  37: { es: 'Hageo', pt: 'Ageu', fr: 'Aggée', de: 'Haggai', ru: 'Аггей', ja: 'ハガイ書', zh: '哈该书', ko: '학개', th: 'ฮักกัย', tl: 'Hagai', vi: 'A-ghê', en: 'Haggai' },
  38: { es: 'Zacarías', pt: 'Zacarias', fr: 'Zacharie', de: 'Sacharja', ru: 'Захария', ja: 'ゼカリヤ書', zh: '撒迦利亚书', ko: '스가랴', th: 'เศคาริยาห์', tl: 'Zacarias', vi: 'Xa-cha-ri', en: 'Zechariah' },
  39: { es: 'Malaquías', pt: 'Malaquias', fr: 'Malachie', de: 'Maleachi', ru: 'Малахия', ja: 'マラキ書', zh: '玛拉基书', ko: '말라기', th: 'มาลาคี', tl: 'Malakias', vi: 'Ma-la-chi', en: 'Malachi' },
  40: { es: 'Mateo', pt: 'Mateus', fr: 'Matthieu', de: 'Matthäus', ru: 'От Матфея', ja: 'マタイの福音書', zh: '马太福音', ko: '마태복음', th: 'มัทธิว', tl: 'Mateo', vi: 'Ma-thi-ơ', en: 'Matthew' },
  41: { es: 'Marcos', pt: 'Marcos', fr: 'Marc', de: 'Markus', ru: 'От Марка', ja: 'マルコの福音書', zh: '马可福音', ko: '마가복음', th: 'มาระโก', tl: 'Marcos', vi: 'Mác', en: 'Mark' },
  42: { es: 'Lucas', pt: 'Lucas', fr: 'Luc', de: 'Lukas', ru: 'От Луки', ja: 'ルカの福音書', zh: '路加福音', ko: '누가복음', th: 'ลูกา', tl: 'Lucas', vi: 'Lu-ca', en: 'Luke' },
  43: { es: 'Juan', pt: 'João', fr: 'Jean', de: 'Johannes', ru: 'От Иоанна', ja: 'ヨハネの福音書', zh: '约翰福音', ko: '요한복음', th: 'ยอห์น', tl: 'Juan', vi: 'Giăng', en: 'John' },
  44: { es: 'Hechos', pt: 'Atos', fr: 'Actes', de: 'Apostelgeschichte', ru: 'Деяния', ja: '使徒の働き', zh: '使徒行传', ko: '사도행전', th: 'กิจการ', tl: 'Mga Gawa', vi: 'Công vụ', en: 'Acts' },
  45: { es: 'Romanos', pt: 'Romanos', fr: 'Romains', de: 'Römer', ru: 'Римлянам', ja: 'ローマ人への手紙', zh: '罗马书', ko: '로마서', th: 'โรม', tl: 'Mga Taga-Roma', vi: 'Rô-ma', en: 'Romans' },
  46: { es: '1 Corintios', pt: '1 Coríntios', fr: '1 Corinthiens', de: '1. Korinther', ru: '1 Коринфянам', ja: 'コリント人への手紙第一', zh: '哥林多前书', ko: '고린도전서', th: '1 โครินธ์', tl: '1 Mga Taga-Corinto', vi: '1 Cô-rinh-tô', en: '1 Corinthians' },
  47: { es: '2 Corintios', pt: '2 Coríntios', fr: '2 Corinthiens', de: '2. Korinther', ru: '2 Коринфянам', ja: 'コリント人への手紙第二', zh: '哥林多后书', ko: '고린도후서', th: '2 โครินธ์', tl: '2 Mga Taga-Corinto', vi: '2 Cô-rinh-tô', en: '2 Corinthians' },
  48: { es: 'Gálatas', pt: 'Gálatas', fr: 'Galates', de: 'Galater', ru: 'Галатам', ja: 'ガラテヤ人への手紙', zh: '加拉太书', ko: '갈라디아서', th: 'กาลาเทีย', tl: 'Mga Taga-Galacia', vi: 'Ga-la-ti', en: 'Galatians' },
  49: { es: 'Efesios', pt: 'Efésios', fr: 'Éphésiens', de: 'Epheser', ru: 'Ефесянам', ja: 'エペソ人への手紙', zh: '以弗所书', ko: '에베소서', th: 'เอเฟซัส', tl: 'Mga Taga-Efeso', vi: 'Ê-phê-sô', en: 'Ephesians' },
  50: { es: 'Filipenses', pt: 'Filipenses', fr: 'Philippiens', de: 'Philipper', ru: 'Филиппийцам', ja: 'ピリピ人への手紙', zh: '腓立比书', ko: '빌립보서', th: 'ฟีลิปปี', tl: 'Mga Taga-Filipos', vi: 'Phi-líp', en: 'Philippians' },
  51: { es: 'Colosenses', pt: 'Colossenses', fr: 'Colossiens', de: 'Kolosser', ru: 'Колоссянам', ja: 'コロサイ人への手紙', zh: '歌罗西书', ko: '골로새서', th: 'โคโลสี', tl: 'Mga Taga-Colosas', vi: 'Cô-lô-se', en: 'Colossians' },
  52: { es: '1 Tesalonicenses', pt: '1 Tessalonicenses', fr: '1 Thessaloniciens', de: '1. Thessalonicher', ru: '1 Фессалоникийцам', ja: 'テサロニケ人への手紙第一', zh: '帖撒罗尼迦前书', ko: '데살로니가전서', th: '1 เธสะโลนิกา', tl: '1 Mga Taga-Tesalonica', vi: '1 Tê-sa-lô-ni-ca', en: '1 Thessalonians' },
  53: { es: '2 Tesalonicenses', pt: '2 Tessalonicenses', fr: '2 Thessaloniciens', de: '2. Thessalonicher', ru: '2 Фессалоникийцам', ja: 'テサロニケ人への手紙第二', zh: '帖撒罗尼迦后书', ko: '데살로니가후서', th: '2 เธสะโลนิกา', tl: '2 Mga Taga-Tesalonica', vi: '2 Tê-sa-lô-ni-ca', en: '2 Thessalonians' },
  54: { es: '1 Timoteo', pt: '1 Timóteo', fr: '1 Timothée', de: '1. Timotheus', ru: '1 Тимофею', ja: 'テモテへの手紙第一', zh: '提摩太前书', ko: '디모데전서', th: '1 ทิโมธี', tl: '1 Timoteo', vi: '1 Ti-mô-thê', en: '1 Timothy' },
  55: { es: '2 Timoteo', pt: '2 Timóteo', fr: '2 Timothée', de: '2. Timotheus', ru: '2 Тимофею', ja: 'テモテへの手紙第二', zh: '提摩太后书', ko: '디모데후서', th: '2 ทิโมธี', tl: '2 Timoteo', vi: '2 Ti-mô-thê', en: '2 Timothy' },
  56: { es: 'Tito', pt: 'Tito', fr: 'Tite', de: 'Titus', ru: 'Титу', ja: 'テトスへの手紙', zh: '提多书', ko: '디도서', th: 'ทิตัส', tl: 'Tito', vi: 'Tít', en: 'Titus' },
  57: { es: 'Filemón', pt: 'Filemom', fr: 'Philémon', de: 'Philemon', ru: 'Филимону', ja: 'ピレモンへの手紙', zh: '腓利门书', ko: '빌레몬서', th: 'ฟีเลโมน', tl: 'Filemon', vi: 'Phi-lê-môn', en: 'Philemon' },
  58: { es: 'Hebreos', pt: 'Hebreus', fr: 'Hébreux', de: 'Hebräer', ru: 'Евреям', ja: 'ヘブル人への手紙', zh: '希伯来书', ko: '히브리서', th: 'ฮีบรู', tl: 'Mga Hebreo', vi: 'Hê-bơ-rơ', en: 'Hebrews' },
  59: { es: 'Santiago', pt: 'Tiago', fr: 'Jacques', de: 'Jakobus', ru: 'Иакова', ja: 'ヤコブの手紙', zh: '雅各书', ko: '야고보서', th: 'ยากอบ', tl: 'Santiago', vi: 'Gia-cơ', en: 'James' },
  60: { es: '1 Pedro', pt: '1 Pedro', fr: '1 Pierre', de: '1. Petrus', ru: '1 Петра', ja: 'ペテロの手紙第一', zh: '彼得前书', ko: '베드로전서', th: '1 เปโตร', tl: '1 Pedro', vi: '1 Phi-e-rơ', en: '1 Peter' },
  61: { es: '2 Pedro', pt: '2 Pedro', fr: '2 Pierre', de: '2. Petrus', ru: '2 Петра', ja: 'ペテロの手紙第二', zh: '彼得后书', ko: '베드로후서', th: '2 เปโตร', tl: '2 Pedro', vi: '2 Phi-e-rơ', en: '2 Peter' },
  62: { es: '1 Juan', pt: '1 João', fr: '1 Jean', de: '1. Johannes', ru: '1 Иоанна', ja: 'ヨハネの手紙第一', zh: '约翰一书', ko: '요한일서', th: '1 ยอห์น', tl: '1 Juan', vi: '1 Giăng', en: '1 John' },
  63: { es: '2 Juan', pt: '2 João', fr: '2 Jean', de: '2. Johannes', ru: '2 Иоанна', ja: 'ヨハネの手紙第二', zh: '约翰二书', ko: '요한이서', th: '2 ยอห์น', tl: '2 Juan', vi: '2 Giăng', en: '2 John' },
  64: { es: '3 Juan', pt: '3 João', fr: '3 Jean', de: '3. Johannes', ru: '3 Иоанна', ja: 'ヨハネの手紙第三', zh: '约翰三书', ko: '요한삼서', th: '3 ยอห์น', tl: '3 Juan', vi: '3 Giăng', en: '3 John' },
  65: { es: 'Judas', pt: 'Judas', fr: 'Jude', de: 'Judas', ru: 'Иуды', ja: 'ユダの手紙', zh: '犹大书', ko: '유다서', th: 'ยูดา', tl: 'Judas', vi: 'Giu-đe', en: 'Jude' },
  66: { es: 'Apocalipsis', pt: 'Apocalipse', fr: 'Apocalypse', de: 'Offenbarung', ru: 'Откровение', ja: 'ヨハネの黙示録', zh: '启示录', ko: '요한계시록', th: 'วิวรณ์', tl: 'Pahayag', vi: 'Khải Huyền', en: 'Revelation' },
};

/**
 * Returns localized name for a book by its canonical ID (1-66) and language code.
 */
export function getLocalizedBookName(bookId: number, lang: string, fallbackName?: string): string {
  const map = MULTILINGUAL_BOOK_NAMES[bookId];
  if (map && map[lang]) {
    return map[lang];
  }
  if (fallbackName) return fallbackName;
  if (map && map.en) return map.en;
  return `Book ${bookId}`;
}

/**
 * Formats book name with chapter number according to target language grammatical rules.
 * Examples:
 * - ja: レビ記 第4章
 * - zh: 利未记 第4章
 * - ko: 레위기 4장
 * - de: 3. Mose Kapitel 4
 * - fr: Lévitique Chapitre 4
 * - es: Levítico Capítulo 4
 * - pt: Levítico Capítulo 4
 * - ru: Левит Глава 4
 * - vi: Lê-vi Ký Chương 4
 * - en: Leviticus Chapter 4
 * - th: เลวีนิติ บทที่ 4
 * - tl: Levitico Kabanata 4
 */
export function formatChapter(bookName: string, chapterNum: number, lang: string): string {
  switch (lang) {
    case 'ja':
      return `${bookName} 第${chapterNum}章`;
    case 'zh':
      return `${bookName} 第${chapterNum}章`;
    case 'ko':
      return `${bookName} ${chapterNum}장`;
    case 'vi':
      return `${bookName} Chương ${chapterNum}`;
    case 'es':
    case 'pt':
      return `${bookName} Capítulo ${chapterNum}`;
    case 'fr':
      return `${bookName} Chapitre ${chapterNum}`;
    case 'de':
      return `${bookName} Kapitel ${chapterNum}`;
    case 'ru':
      return `${bookName} Глава ${chapterNum}`;
    case 'tl':
      return `${bookName} Kabanata ${chapterNum}`;
    case 'th':
      return `${bookName} บทที่ ${chapterNum}`;
    case 'en':
    default:
      return `${bookName} Chapter ${chapterNum}`;
  }
}

/**
 * Formats chapter label without book name (e.g. for dropdowns or verse headers)
 */
export function formatChapterOnly(chapterNum: number, lang: string): string {
  switch (lang) {
    case 'ja':
      return `第${chapterNum}章`;
    case 'zh':
      return `第${chapterNum}章`;
    case 'ko':
      return `${chapterNum}장`;
    case 'vi':
      return `Chương ${chapterNum}`;
    case 'es':
    case 'pt':
      return `Capítulo ${chapterNum}`;
    case 'fr':
      return `Chapitre ${chapterNum}`;
    case 'de':
      return `Kapitel ${chapterNum}`;
    case 'ru':
      return `Глава ${chapterNum}`;
    case 'tl':
      return `Kabanata ${chapterNum}`;
    case 'th':
      return `บทที่ ${chapterNum}`;
    case 'en':
    default:
      return `Chapter ${chapterNum}`;
  }
}
