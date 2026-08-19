// 1. 多语言敏感词库 (中文/英文/西语/葡语/法语/德语/日文/韩文/泰文)
const MULTI_LANG_SENSITIVE_WORDS = [
  // 中文
  '色情', '裸聊', '招嫖', '约炮', '包养', '兼职刷单', '杀猪盘', '洗钱', '枪支', '毒品', '大麻', '自杀', '加v', '微信', 'telegram', '飞机号', '投资理财',
  // 英文 (English)
  'porno', 'porn', 'nude', 'naked', 'escort', 'sexy', 'hookup', 'scam', 'crypto investment', 'whatsapp', 'telegram', 'weapons', 'drugs', 'suicide',
  // 西班牙语 / 葡萄牙语 (Spanish & Portuguese)
  'desnudo', 'desnuda', 'puta', 'prostituta', 'drogas', 'armas', 'suicidio', 'estafa', 'sexo', 'pelada', 'golpe',
  // 法语 (French)
  'porno', 'nue', 'sexe', 'escroquerie', 'drogue', 'suicide',
  // 德语 (German)
  'nackt', 'porno', 'waffen', 'drogen', 'betrug',
  // 日语 (Japanese)
  'エロ', '風俗', '援交', '裏アカ', '詐欺', '薬物', '自殺',
  // 韩语 (Korean)
  '야동', '성인', '조건만남', '사기', '마약', '자살',
  // 泰语 (Thai)
  'โป๊', 'ลามก', 'ยาเสพติด', 'อาวุธ', 'หลอกลวง', 'การพนัน'
];

export interface ModerationResult {
  passed: boolean;
  reason?: string;
}

// 多语言文本自动机审
export const checkTextModeration = (text: string): ModerationResult => {
  if (!text) return { passed: true };
  const normalized = text.toLowerCase().replace(/[\s\-_.,@]/g, '');
  
  for (const word of MULTI_LANG_SENSITIVE_WORDS) {
    if (normalized.includes(word.toLowerCase().replace(/[\s\-_.,@]/g, ''))) {
      return {
        passed: false,
        reason: '内容包含疑似违规、引流或跨文化不合规用语，请文明交流。'
      };
    }
  }
  return { passed: true };
};

// 全球五大洲多语言智能解析器 (自动识别母语输入并归类大洲)
export const parseGlobalContinent = (locationText: string): 'asia' | 'europe' | 'americas' | 'africa' | 'oceania' | 'other' => {
  if (!locationText) return 'other';
  const t = locationText.toLowerCase();

  // 1. 亚洲 (Asia)
  if (
    /asia|china|chinese|thai|thailand|japan|japanese|korea|korean|indonesia|bali|canggu|ubud|vietnam|singapore|malaysia|philippines|india|taiwan|hongkong/i.test(t) ||
    /中国|清迈|曼谷|普吉|泰国|印尼|巴厘|日本|东京|大阪|福冈|韩国|首尔|釜山|新加坡|马来西亚|吉隆坡|越南|菲律宾|台湾|香港|亚洲/i.test(t) ||
    /เชียงใหม่|กรุงเทพ|บาหลี|โตเกียว|ไทย/i.test(t) ||
    /東京|大阪|ソウル|中国|台湾/i.test(t)
  ) {
    return 'asia';
  }

  // 2. 欧洲 (Europe)
  if (
    /europe|portugal|lisbon|porto|spain|barcelona|madrid|france|paris|germany|berlin|italy|rome|milan|uk|london|netherlands|amsterdam|greece|poland|switzerland|austria/i.test(t) ||
    /葡萄牙|里斯本|波尔图|西班牙|巴塞罗那|马德里|法国|巴黎|德国|柏林|意大利|罗马|米兰|英国|伦敦|荷兰|阿姆斯特丹|希腊|瑞士|欧洲/i.test(t)
  ) {
    return 'europe';
  }

  // 3. 美洲 (Americas)
  if (
    /america|usa|united states|canada|mexico|colombia|medellin|bogota|brazil|rio|sao paulo|argentina|buenos aires|chile|peru/i.test(t) ||
    /美国|纽约|旧金山|洛杉矶|加拿大|温哥华|多伦多|墨西哥|哥伦比亚|麦德林|波哥大|巴西|里约|圣保罗|阿根廷|布宜诺斯艾利斯|智利|秘鲁|美洲/i.test(t)
  ) {
    return 'americas';
  }

  // 4. 大洋洲 (Oceania)
  if (
    /oceania|australia|sydney|melbourne|brisbane|new zealand|auckland/i.test(t) ||
    /澳大利亚|澳洲|悉尼|墨尔本|布里斯班|新西兰|奥克兰|大洋洲/i.test(t)
  ) {
    return 'oceania';
  }

  // 5. 非洲 (Africa)
  if (
    /africa|south africa|cape town|morocco|marrakech|egypt|cairo|kenya|nairobi/i.test(t) ||
    /南非|开普敦|摩洛哥|马拉喀什|埃及|开罗|肯尼亚|内罗毕|非洲/i.test(t)
  ) {
    return 'africa';
  }

  return 'other';
};

// 客户端图片色情/过度裸露自动检测
export const checkImageSafety = async (base64Img: string): Promise<ModerationResult> => {
  return new Promise((resolve) => {
    if (!base64Img || !base64Img.startsWith('data:image')) {
      return resolve({ passed: true });
    }

    const img = new Image();
    img.src = base64Img;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        if (!ctx) return resolve({ passed: true });

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        let skinPixels = 0;
        const totalPixels = sampleSize * sampleSize;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          if (r > 95 && g > 40 && b > 20 && (Math.max(r, g, b) - Math.min(r, g, b) > 15) && Math.abs(r - g) > 15 && r > g && r > b) {
            skinPixels++;
          }
        }

        const skinRatio = skinPixels / totalPixels;
        if (skinRatio > 0.68) {
          return resolve({
            passed: false,
            reason: '系统检测到图片疑似存在大面积过度裸露，请上传真实得体的生活或工作名片照。'
          });
        }

        resolve({ passed: true });
      } catch {
        resolve({ passed: true });
      }
    };
    img.onerror = () => resolve({ passed: true });
  });
};