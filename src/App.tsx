import React, { useState, useEffect, useMemo } from 'react';
import { CreateCardModal } from './components/CreateCardModal';
import { supabase } from './lib/supabase';
import { checkTextModeration, parseGlobalContinent } from './lib/moderation';
import { detectUserLang, translations, SupportedLang } from './lib/i18n';

interface NomadProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  continent: 'asia' | 'europe' | 'americas' | 'africa' | 'oceania' | 'other';
  zodiac: string;
  tribe: string;
  bio: string;
  tags: string[];
  photo: string;
  isPreset?: boolean;
  icebreakerEn?: string;
  icebreakerZh?: string;
}

const PRESET_NOMADS: NomadProfile[] = [
  {
    id: 'preset-1',
    name: 'Maya Lin',
    age: 26,
    location: '🇮🇩 印尼·巴厘岛 (Canggu)',
    continent: 'asia',
    zodiac: '双鱼座 / Pisces',
    tribe: 'Mindfulness & Yoga Coach',
    bio: 'Living in Canggu for 2 years. Sunset surfer, specialty coffee enthusiast, helping remote nomads find mindful balance.',
    tags: ['Surfing', 'Yoga', 'Mindfulness', 'Bali'],
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    isPreset: true,
    icebreakerEn: "Hey Maya! What's the best quiet sunset spot in Canggu away from the crowds?",
    icebreakerZh: "嗨 Maya！苍古除了人挤人的海滩，你最推荐哪个能安静看日落的私藏地点？"
  },
  {
    id: 'preset-2',
    name: 'Sofia Rossi',
    age: 28,
    location: '🇵🇹 葡萄牙·里斯本 (LX Factory)',
    continent: 'europe',
    zodiac: '射手座 / Sagittarius',
    tribe: 'Remote UI/UX Designer',
    bio: 'Moved from Milan to Lisbon. Exploring visual inspiration between the Atlantic ocean and decentralized creative aesthetics.',
    tags: ['UI/UX', 'Figma', 'Surfing', 'Lisbon'],
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    isPreset: true,
    icebreakerEn: "Ciao Sofia! How is Lisbon's nomad community comparing to Milan for creatives?",
    icebreakerZh: "嗨 Sofia！在里斯本做远程设计和在米兰相比，最大的灵感差异是什么？"
  },
  {
    id: 'preset-3',
    name: 'Mateo Silva',
    age: 30,
    location: '🇨🇴 哥伦比亚·麦德林 (El Poblado)',
    continent: 'americas',
    zodiac: '天蝎座 / Scorpio',
    tribe: 'Full-Stack Nomad Engineer',
    bio: 'Based in Medellin. Passionate about Latin American specialty coffee, Salsa dancing, and asynchronous remote collaboration.',
    tags: ['React', 'Node.js', 'South America', 'Salsa'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    isPreset: true,
    icebreakerEn: "Hola Mateo! How is the digital nomad community and co-working scene in Medellin?",
    icebreakerZh: "嗨 Mateo！麦德林的远程办公氛围与游民社群体验怎么样？"
  },
  {
    id: 'preset-4',
    name: 'Liam Walker',
    age: 29,
    location: '🇦🇺 澳大利亚·悉尼 (Bondi Beach)',
    continent: 'oceania',
    zodiac: '白羊座 / Aries',
    tribe: 'Content Creator & Surf Instructor',
    bio: 'Morning surf at Bondi Beach, afternoon podcasting in local cafes. Connecting global remote creators across oceans.',
    tags: ['Podcasting', 'Video', 'Surfing', 'Sydney'],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    isPreset: true,
    icebreakerEn: "G'day Liam! What's your daily routine balancing morning surf with remote work?",
    icebreakerZh: "你好 Liam！你是怎么平衡海边冲浪与高强度远程内容创作的？"
  }
];

const localizeContent = (text: string, currentLang: SupportedLang, type: 'location' | 'tribe' | 'bio') => {
  if (!text || currentLang === 'zh') return text;

  if (type === 'location') {
    if (/爱尔兰|都柏林|dublin|ireland/i.test(text)) {
      return currentLang === 'ja' ? '🇮🇪 ダブリン、アイルランド' : (currentLang === 'es' ? '🇮🇪 Dublín, Irlanda' : '🇮🇪 Dublin, Ireland');
    }
    if (/普吉|phuket/i.test(text)) {
      return currentLang === 'ja' ? '🇹🇭 プーケット、タイ' : (currentLang === 'es' ? '🇹🇭 Phuket, Tailandia' : '🇹🇭 Phuket, Thailand');
    }
    if (/德国.*柏林|berlin/i.test(text)) {
      return currentLang === 'ja' ? '🇩🇪 ベルリン、ドイツ' : (currentLang === 'es' ? '🇩🇪 Berlín, Alemania' : '🇩🇪 Berlin, Germany');
    }
    if (/日本.*京都|kyoto/i.test(text)) {
      return currentLang === 'ja' ? '🇯🇵 京都、日本' : (currentLang === 'es' ? '🇯🇵 Kioto, Japón' : '🇯🇵 Kyoto, Japan');
    }
    if (/日本.*东京|tokyo/i.test(text)) {
      return currentLang === 'ja' ? '🇯🇵 東京、日本' : (currentLang === 'es' ? '🇯🇵 Tokio, Japón' : '🇯🇵 Tokyo, Japan');
    }
    if (/日本.*福冈|fukuoka/i.test(text)) {
      return currentLang === 'ja' ? '🇯🇵 福岡、日本' : (currentLang === 'es' ? '🇯🇵 Fukuoka, Japón' : '🇯🇵 Fukuoka, Japan');
    }
    if (/清迈|chiang mai/i.test(text)) {
      return currentLang === 'ja' ? '🇹🇭 チェンマイ、タイ' : (currentLang === 'es' ? '🇹🇭 Chiang Mai, Tailandia' : '🇹🇭 Chiang Mai, Thailand');
    }
    if (/曼谷|bangkok/i.test(text)) {
      return currentLang === 'ja' ? '🇹🇭 バンコク、タイ' : (currentLang === 'es' ? '🇹🇭 Bangkok, Tailandia' : '🇹🇭 Bangkok, Thailand');
    }
    if (/巴厘|canggu|bali/i.test(text)) {
      return currentLang === 'ja' ? '🇮🇩 バリ島（チャングー）、インドネシア' : '🇮🇩 Bali (Canggu), Indonesia';
    }
    if (/葡萄牙.*里斯本|lisbon/i.test(text)) {
      return currentLang === 'ja' ? '🇵🇹 リスボン、ポルトガル' : (currentLang === 'es' ? '🇵🇹 Lisboa, Portugal' : '🇵🇹 Lisbon, Portugal');
    }
    if (/哥伦比亚.*麦德林|medellin/i.test(text)) {
      return currentLang === 'ja' ? '🇨🇴 メデジン、コロンビア' : (currentLang === 'es' ? '🇨🇴 Medellín, Colombia' : '🇨🇴 Medellin, Colombia');
    }
    if (/澳大利亚.*悉尼|sydney/i.test(text)) {
      return currentLang === 'ja' ? '🇦🇺 シドニー、オーストラリア' : '🇦🇺 Sydney, Australia';
    }
    return text.replace(/[·，,]/g, ', ');
  }

  if (type === 'tribe') {
    if (/泰国.*泰语|thai/i.test(text)) {
      return currentLang === 'ja' ? '🇹🇭 タイ文化＆旅' : (currentLang === 'es' ? '🇹🇭 Cultura y Viajes en Tailandia' : '🇹🇭 Thai Culture & Travel');
    }
    if (/独立开发|全栈|developer|engineer/i.test(text)) {
      return currentLang === 'ja' ? '💻 個人開発者・エンジニア' : (currentLang === 'es' ? '💻 Desarrollador Indie & Hacker' : '💻 Indie Developer & Hacker');
    }
    if (/美妆|fashion|beauty/i.test(text)) {
      return currentLang === 'ja' ? '💄 ファッション＆ビューティー' : (currentLang === 'es' ? '💄 Creadora de Moda y Belleza' : '💄 Beauty & Lifestyle Creator');
    }
    if (/电音|音乐|music/i.test(text)) {
      return currentLang === 'ja' ? '🎧 音楽プロデューサー' : (currentLang === 'es' ? '🎧 Productor de Música Electrónica' : '🎧 Electronic Music Producer');
    }
    if (/瑜伽|正念|mindful/i.test(text)) {
      return currentLang === 'ja' ? '🧘 ヨガ＆マインドフルネス' : (currentLang === 'es' ? '🧘 Coach de Mindfulness y Yoga' : '🧘 Mindful & Yoga Coach');
    }
    return text;
  }

  if (type === 'bio') {
    if (/泰拳.*普吉|练拳|结交本地朋友/i.test(text)) {
      if (currentLang === 'ja') return 'プーケットでムエタイ修行中のノマド。現地の仲間やビーチ好きと繋がりたいです。';
      if (currentLang === 'es') return 'Entusiasta del Muay Thai entrenando en Phuket. Busco conectar con nómadas locales y amantes de la playa.';
      return 'Muay Thai enthusiast training in Phuket. Looking to connect with local nomads and explore beaches.';
    }
    if (/中年数字游民|独立开发者|咖啡爱好/i.test(text)) {
      if (currentLang === 'ja') return 'チェンマイ在住の個人開発者＆ノマド。スペシャリティコーヒーが好きです。';
      if (currentLang === 'es') return 'Nómada digital, desarrollador indie y amante del buen café en Chiang Mai.';
      return 'Digital nomad, indie developer, specialty coffee lover based in Chiang Mai.';
    }
    if (/电音制作人.*曼谷/i.test(text)) {
      if (currentLang === 'ja') return 'バンコクのインディー音楽シーンを探求中のエレクトロニック・プロデューサー。';
      if (currentLang === 'es') return 'Productor de música electrónica explorando la escena musical independiente en Bangkok.';
      return 'Electronic music producer, planning to head to Bangkok to explore the local underground indie music scene.';
    }
    if (/泰式料理.*清迈/i.test(text)) {
      if (currentLang === 'ja') return 'タイ料理と寺院撮影が大好き。来月チェンマイでノマドライフを始めます。';
      if (currentLang === 'es') return 'Apasionada por la comida tailandesa y la fotografía de templos. Mudándome a Chiang Mai el próximo mes.';
      return 'Passionate about Thai cuisine and ancient temple photography. Moving to Chiang Mai next month for nomad life.';
    }
    return text;
  }

  return text;
};

export default function App() {
  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('auramatch_user_lang') as SupportedLang;
    if (saved && ['zh', 'en', 'es', 'ja'].includes(saved)) return saved;
    return detectUserLang();
  });

  const t = translations[lang] || translations.en;

  const [profiles, setProfiles] = useState<NomadProfile[]>(PRESET_NOMADS);
  const [activeNomadId, setActiveNomadId] = useState<string>(PRESET_NOMADS[0].id);
  const [activeTab, setActiveTab] = useState<'explore' | 'plaza' | 'profile'>('explore');
  const [filterContinent, setFilterContinent] = useState<string>('all');

  const [myProfile, setMyProfile] = useState<NomadProfile | null>(() => {
    const saved = localStorage.getItem('auramatch_my_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const maxDailyEnergy = myProfile ? 50 : 10;

  const [energy, setEnergy] = useState<number>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('auramatch_energy_date');
    const isOwner = localStorage.getItem('auramatch_my_profile') !== null;
    const defaultMax = isOwner ? 50 : 10;

    if (lastDate !== todayStr) {
      localStorage.setItem('auramatch_energy_date', todayStr);
      localStorage.setItem('auramatch_daily_energy', String(defaultMax));
      return defaultMax;
    }

    const saved = localStorage.getItem('auramatch_daily_energy');
    return saved !== null ? Number(saved) : defaultMax;
  });

  const [myInviteCode] = useState<string>(() => {
    let code = localStorage.getItem('auramatch_my_invite_code');
    if (!code) {
      code = 'AURA' + Math.floor(1000 + Math.random() * 9000);
      localStorage.setItem('auramatch_my_invite_code', code);
    }
    return code;
  });

  const [inputInviteCode, setInputInviteCode] = useState('');
  const [hasRedeemedCode, setHasRedeemedCode] = useState<boolean>(() => {
    return localStorage.getItem('auramatch_redeemed_code') === 'true';
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean>(() => {
    return localStorage.getItem('auramatch_last_shared_date') === new Date().toISOString().slice(0, 10);
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showIcebreakerModal, setShowIcebreakerModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'nomad'; text: string; time: string }>>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [chatWarning, setChatWarning] = useState('');
  const [aiIcebreaker, setAiIcebreaker] = useState<{ en: string; zh: string } | null>(null);
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [chatReplyLoading, setChatReplyLoading] = useState(false);

  const switchLanguage = (newLang: SupportedLang) => {
    setLang(newLang);
    localStorage.setItem('auramatch_user_lang', newLang);
  };

  const showToast = (text: string, duration = 2500) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), duration);
  };

  // 真正调 DeepSeek 生成破冰词；接口挂了就退回卡片自带的静态模板文案，不会让按钮卡死或报错给用户看。
  const handleOpenIcebreaker = async (nomad: NomadProfile) => {
    setShowIcebreakerModal(true);
    setAiIcebreaker(null);
    setIcebreakerLoading(true);
    try {
      const resp = await fetch('/api/icebreaker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nomad.name,
          nativeCulture: nomad.location,
          targetCulture: nomad.tribe,
          bio: nomad.bio,
        }),
      });
      const data = await resp.json();
      if (resp.ok && data.en) {
        setAiIcebreaker({ en: data.en, zh: data.zh || data.en });
      } else {
        setAiIcebreaker(null);
      }
    } catch {
      setAiIcebreaker(null);
    } finally {
      setIcebreakerLoading(false);
    }
  };

  useEffect(() => {
    async function loadCloudProfiles() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const realProfiles: NomadProfile[] = data.map((item: any) => {
            const loc = item.native_culture || 'Global Nomad';
            return {
              id: `cloud-${item.id}`,
              name: item.full_name || 'Nomad peer',
              age: item.age || 25,
              location: loc,
              continent: parseGlobalContinent(loc),
              zodiac: item.zodiac || 'Verified Nomad',
              tribe: item.target_culture || 'Remote Explorer',
              bio: item.bio || 'Exploring the world...',
              tags: Array.isArray(item.interests) ? item.interests : [item.target_culture || 'Nomad'],
              photo: item.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80',
              isPreset: false,
              icebreakerEn: `Hey ${item.full_name || 'there'}! Great connecting with another nomad from ${loc}!`,
              icebreakerZh: `嗨 ${item.full_name || '搭子'}！很高兴在 AuraMatch 刷到你，你在 ${loc} 体验如何？`
            };
          });

          if (realProfiles.length >= 10) {
            setProfiles(realProfiles);
          } else {
            setProfiles([...realProfiles, ...PRESET_NOMADS]);
          }
        }
      } catch (err) {
        console.warn('云端同步略过:', err);
      }
    }
    loadCloudProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    if (filterContinent === 'all') return profiles;
    return profiles.filter(p => p.continent === filterContinent);
  }, [profiles, filterContinent]);

  const currentNomad = useMemo(() => {
    const found = filteredProfiles.find(p => p.id === activeNomadId);
    return found || filteredProfiles[0] || null;
  }, [filteredProfiles, activeNomadId]);

  const consumeCardEnergy = (): boolean => {
    if (energy <= 0) {
      setShowEnergyModal(true);
      return false;
    }
    const nextE = energy - 1;
    setEnergy(nextE);
    localStorage.setItem('auramatch_daily_energy', String(nextE));
    if (nextE === 0) {
      setShowEnergyModal(true);
    }
    return true;
  };

  const handleNextCard = () => {
    if (filteredProfiles.length <= 1) return;
    const currIdx = filteredProfiles.findIndex(p => p.id === currentNomad?.id);
    const nextIdx = (currIdx + 1) % filteredProfiles.length;
    setActiveNomadId(filteredProfiles[nextIdx].id);
  };

  const handleLike = () => {
    if (!consumeCardEnergy()) return;
    showToast(`❤️ ${currentNomad?.name || 'Nomad'}`);
    handleNextCard();
  };

  const handlePass = () => {
    if (!consumeCardEnergy()) return;
    handleNextCard();
  };

  const handleCardCreated = (newCard: any) => {
    const loc = newCard.location || '';
    const formatted: NomadProfile = {
      id: newCard.id,
      name: newCard.name,
      age: newCard.age,
      location: newCard.location,
      continent: parseGlobalContinent(loc),
      zodiac: newCard.zodiac || 'My Card',
      tribe: newCard.tags[0] || 'Nomad',
      bio: newCard.bio,
      tags: newCard.tags,
      photo: newCard.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80',
      isPreset: false,
      icebreakerEn: `Hey ${newCard.name}! Excited to connect!`,
      icebreakerZh: `嗨 ${newCard.name}！看到你的名片了，很高兴认识你！`
    };

    setMyProfile(formatted);
    localStorage.setItem('auramatch_my_profile', JSON.stringify(formatted));
    setProfiles(prev => [formatted, ...prev.filter(p => p.id !== formatted.id)]);
    setActiveNomadId(formatted.id);

    setEnergy(50);
    localStorage.setItem('auramatch_daily_energy', '50');
    setActiveTab('explore');
    // 卡片现在会先进入人工审核队列，通过前只有提交者自己这一场会话能看到。
    showToast(
      newCard.pending
        ? (lang === 'zh' ? '🎉 名片已提交！正在审核中，通过后将对所有人可见。已解锁每日 50 点探索额度！' : '🎉 Submitted! Your card is under review and will go public once approved. 50 daily energy unlocked!')
        : (lang === 'zh' ? '🎉 名片已上架！已解锁每日 50 点探索额度！' : '🎉 Card published! Unlocked 50 daily energy!'),
      4000
    );
  };

  const handleDeleteMyCard = async () => {
    if (!myProfile) return;
    if (!window.confirm(lang === 'zh' ? '确定要注销并下架你的游民名片吗？下架后将恢复为访客每日 10 点额度。' : 'Are you sure to deactivate? Daily quota will revert to 10.')) return;

    try {
      if (myProfile.id.startsWith('cloud-')) {
        const rawDbId = myProfile.id.replace('cloud-', '');
        await supabase.from('profiles').delete().eq('id', rawDbId);
      }
    } catch (err) {
      console.warn('云端注销略过:', err);
    }

    setProfiles(prev => prev.filter(p => p.id !== myProfile.id && p.name !== myProfile.name));
    localStorage.removeItem('auramatch_my_profile');
    setMyProfile(null);

    setEnergy(10);
    localStorage.setItem('auramatch_daily_energy', '10');
    setActiveNomadId(PRESET_NOMADS[0].id);
    setActiveTab('explore');
    showToast(lang === 'zh' ? '🗑️ 你的名片已下架，已恢复为基础 10 点体验额度' : '🗑️ Card deactivated. Reverted to 10 basic energy.');
  };

  const handleRedeemInviteCode = () => {
    if (!inputInviteCode.trim()) {
      showToast(lang === 'zh' ? '请输入邀请码' : 'Please enter an invite code');
      return;
    }
    if (inputInviteCode.trim().toUpperCase() === myInviteCode) {
      showToast(lang === 'zh' ? '不能兑换自己的邀请码' : 'Cannot redeem your own code');
      return;
    }
    if (hasRedeemedCode) {
      showToast(lang === 'zh' ? '你已经兑换过好友邀请码了' : 'You have already redeemed a code');
      return;
    }

    const nextE = energy + 20;
    setEnergy(nextE);
    localStorage.setItem('auramatch_daily_energy', String(nextE));
    setHasRedeemedCode(true);
    localStorage.setItem('auramatch_redeemed_code', 'true');
    setInputInviteCode('');
    setShowShareModal(false);
    showToast(lang === 'zh' ? '🎁 邀请码兑换成功！已到账 +20 能量！' : '🎁 Code redeemed! +20 Energy added!', 3000);
  };

  const handleStartChat = () => {
    if (!currentNomad) return;
    if (energy < 3) {
      setShowEnergyModal(true);
      return;
    }

    const nextE = energy - 3;
    setEnergy(nextE);
    localStorage.setItem('auramatch_daily_energy', String(nextE));

    const initialText = lang === 'zh'
      ? (aiIcebreaker?.zh || currentNomad.icebreakerZh || `嗨！我是 ${currentNomad.name}，很高兴认识你！`)
      : (aiIcebreaker?.en || currentNomad.icebreakerEn || `Hey! I'm ${currentNomad.name}, great connecting with you!`);

    setChatMessages([
      {
        sender: 'nomad',
        text: initialText,
        time: 'Just now'
      }
    ]);
    setChatWarning('');
    setShowChatModal(true);
    showToast(lang === 'zh' ? '⚡ 开启对练消耗 3 能量，本场对话免费畅聊' : '⚡ 3 Energy used. Chat freely in this session!');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !currentNomad || chatReplyLoading) return;
    const userText = inputMsg.trim();

    const check = checkTextModeration(userText);
    if (!check.passed) {
      setChatWarning(lang === 'zh' ? '⚠️ 提醒：请勿发送违规、涉黄或高风险联系方式。' : '⚠️ Warning: Please avoid inappropriate or promotional messages.');
      setTimeout(() => setChatWarning(''), 3500);
      return;
    }

    const newMsg = { sender: 'user' as const, text: userText, time: 'Just now' };
    const historyForApi = [...chatMessages, newMsg];
    setChatMessages(historyForApi);
    setInputMsg('');
    setChatWarning('');
    setChatReplyLoading(true);

    const fallbackReply = lang === 'zh'
      ? `"${userText}" 很有意思！你目前在哪个城市旅居办公呢？☕`
      : (lang === 'es' ? `¡Qué interesante "${userText}"! ¿En qué ciudad estás trabajando ahora? ☕` : `Awesome! "${userText}" sounds fascinating. Where are you currently nomading? ☕`);

    try {
      const resp = await fetch('/api/chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentNomad.name,
          nativeCulture: currentNomad.location,
          targetCulture: currentNomad.tribe,
          bio: currentNomad.bio,
          lang,
          history: historyForApi,
        }),
      });
      const data = await resp.json();
      setChatMessages(prev => [
        ...prev,
        { sender: 'nomad', text: (resp.ok && data.reply) ? data.reply : fallbackReply, time: 'Just now' }
      ]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'nomad', text: fallbackReply, time: 'Just now' }]);
    } finally {
      setChatReplyLoading(false);
    }
  };

  const handlePlatformShare = (platformName: string) => {
    if (hasClaimedToday) {
      showToast(lang === 'zh' ? '今日打卡奖励已领，明天再来哦！' : 'Already claimed today! Come back tomorrow.');
      return;
    }

    const shareCaption = lang === 'zh'
      ? `【AuraMatch】连接全球数字游民与多语言搭子！输入我的邀请码【${myInviteCode}】立领 +20 探索能量：${window.location.origin} #${platformName} #数字游民 #AuraMatch`
      : `Connecting with global digital nomads & polyglots on AuraMatch! Use my code [${myInviteCode}] for +20 energy: ${window.location.origin} #${platformName} #DigitalNomad #AuraMatch #BuildInPublic`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareCaption).catch(() => {});
    }

    const nextE = energy + 30;
    setEnergy(nextE);
    localStorage.setItem('auramatch_daily_energy', String(nextE));
    localStorage.setItem('auramatch_last_shared_date', todayStr);
    setHasClaimedToday(true);
    setShowShareModal(false);

    showToast(lang === 'zh' ? `🎉 +30 能量已到账！【${platformName}】打卡文案已复制！` : `🎉 +30 Energy added! [${platformName}] caption copied!`, 4000);
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', backgroundColor: '#020617', color: '#f8fafc', display: 'flex', justifyContent: 'center', overflow: 'hidden', margin: 0, padding: 0, boxSizing: 'border-box' }}>
      
      {/* 流体主视口容器 */}
      <div style={{ width: '100%', maxWidth: '460px', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '10px 14px 14px 14px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>

        {/* 1. 顶部纯净导航（已完全剥离管理员入口，前台与后台绝对物理隔离） */}
        <header style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', marginBottom: '8px', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span 
              style={{ fontSize: '17px', fontWeight: '900', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              AuraMatch.
            </span>
            
            <select
              value={lang}
              onChange={e => switchLanguage(e.target.value as SupportedLang)}
              style={{ backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '8px', fontSize: '10px', padding: '1px 3px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="en">🇺🇸 EN</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="es">🇪🇸 ES</option>
              <option value="ja">🇯🇵 日本語</option>
            </select>

            <div 
              onClick={() => setShowShareModal(true)}
              style={{ backgroundColor: energy > 0 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.2)', border: energy > 0 ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)', color: energy > 0 ? '#facc15' : '#ef4444', fontSize: '10px', fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              title="Energy & Fuel Station"
            >
              ⚡ {energy}/{maxDailyEnergy}
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.4)', color: '#f472b6', fontSize: '10px', fontWeight: '900', padding: '2px 5px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🎁 {t.fuel}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <button
              onClick={() => setActiveTab('explore')}
              style={{ backgroundColor: activeTab === 'explore' ? '#38bdf8' : 'rgba(30, 41, 59, 0.8)', color: activeTab === 'explore' ? '#020617' : '#94a3b8', border: 'none', padding: '5px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {t.explore}
            </button>
            <button
              onClick={() => setActiveTab('plaza')}
              style={{ backgroundColor: activeTab === 'plaza' ? '#6366f1' : 'rgba(30, 41, 59, 0.8)', color: activeTab === 'plaza' ? '#ffffff' : '#94a3b8', border: 'none', padding: '5px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {t.plaza}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={{ backgroundColor: activeTab === 'profile' ? '#10b981' : 'rgba(30, 41, 59, 0.8)', color: activeTab === 'profile' ? '#020617' : '#94a3b8', border: 'none', padding: '5px 7px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {t.profile}
            </button>
          </div>
        </header>

        {/* 2. 全球五大洲分类栏 */}
        {activeTab !== 'profile' && (
          <div style={{ flexShrink: 0, display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: `${t.global} (${profiles.length})` },
              { id: 'asia', label: t.asia },
              { id: 'europe', label: t.europe },
              { id: 'americas', label: t.americas },
              { id: 'oceania', label: t.oceania },
              { id: 'africa', label: t.africa }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterContinent(f.id)}
                style={{
                  flexShrink: 0,
                  backgroundColor: filterContinent === f.id ? '#1e293b' : 'transparent',
                  color: filterContinent === f.id ? '#38bdf8' : '#64748b',
                  border: filterContinent === f.id ? '1px solid #38bdf8' : '1px solid #334155',
                  padding: '3px 9px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* 3. 探索视图 */}
        {activeTab === 'explore' && (
          filteredProfiles.length > 0 && currentNomad ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, justifyContent: 'space-between' }}>
              
              {/* 卡片主体 */}
              <div style={{
                flex: 1,
                width: '100%',
                borderRadius: '24px',
                backgroundColor: '#0f172a',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                
                {/* 照片展示区 */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    inset: -10,
                    backgroundImage: `url(${currentNomad.photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(24px) brightness(0.55)',
                    transform: 'scale(1.15)',
                    zIndex: 0
                  }} />

                  <img
                    src={currentNomad.photo}
                    alt={currentNomad.name}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                    }}
                  />

                  <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px' }}>🛡️</span>
                    <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{currentNomad.isPreset ? t.presetBadge : t.realBadge}</span>
                  </div>

                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(244, 114, 182, 0.4)', padding: '3px 8px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#f472b6', fontWeight: 'bold' }}>{t.verifiedBadge}</span>
                  </div>
                </div>

                {/* 独立信息区域（位置与星座精准展示） */}
                <div style={{ flexShrink: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#0f172a', borderTop: '1px solid rgba(51, 65, 85, 0.5)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '19px', fontWeight: '900', color: '#ffffff' }}>{currentNomad.name}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 'bold' }}>{currentNomad.age}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>
                      📍 {localizeContent(currentNomad.location, lang, 'location')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', backgroundColor: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                      💼 {localizeContent(currentNomad.tribe, lang, 'tribe')}
                    </div>
                    {/* 星座标签完美展示 */}
                    {currentNomad.zodiac && (
                      <div style={{ display: 'inline-flex', backgroundColor: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#facc15', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                        ✨ {currentNomad.zodiac}
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', lineHeight: '1.4', color: '#cbd5e1', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {localizeContent(currentNomad.bio, lang, 'bio')}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {currentNomad.tags.map(tagItem => (
                      <span key={tagItem} style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', color: '#94a3b8', fontSize: '9px', padding: '2px 6px', borderRadius: '6px' }}>
                        #{tagItem}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI 破冰语 */}
              <div style={{ flexShrink: 0, marginTop: '8px' }}>
                <button
                  onClick={() => currentNomad && handleOpenIcebreaker(currentNomad)}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.5)',
                    color: '#c7d2fe',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <span>🪄 {t.icebreakerBtn}</span>
                </button>
              </div>

              {/* 操作栏（纯净前台，无任何删除按钮） */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={handlePass}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                >
                  {t.pass}
                </button>

                <button
                  onClick={handleStartChat}
                  style={{ flex: 2, padding: '10px', borderRadius: '12px', backgroundColor: '#0284c7', border: 'none', color: '#ffffff', fontWeight: '900', fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)' }}
                >
                  {t.chat}
                </button>

                <button
                  onClick={handleLike}
                  style={{ flex: 1.5, padding: '10px', borderRadius: '12px', backgroundColor: '#e11d48', border: 'none', color: '#ffffff', fontWeight: '900', fontSize: '11px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)' }}
                >
                  {t.like}
                </button>
              </div>

              {/* 居中建名片入口 */}
              <div style={{ flexShrink: 0, marginTop: '8px' }}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{ width: '100%', padding: '11px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', color: '#020617', fontWeight: '900', fontSize: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)' }}
                >
                  <span>{myProfile ? t.editCardBtn : t.createCardBtn}</span>
                </button>
              </div>

              <div style={{ flexShrink: 0, textAlign: 'center', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                {t.securityNote}
                {' · '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b', textDecoration: 'underline' }}>
                  {lang === 'zh' ? '隐私政策' : 'Privacy Policy'}
                </a>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '24px', border: '1px dashed #334155', padding: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🌏</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{t.emptyContinentTitle}</div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '6px 0 16px 0' }}>{t.emptyContinentDesc}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setFilterContinent('all')} style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #38bdf8', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {t.viewAllContinents}
                </button>
                <button onClick={() => setShowCreateModal(true)} style={{ padding: '8px 16px', borderRadius: '12px', backgroundColor: '#10b981', color: '#020617', fontSize: '12px', fontWeight: '900', border: 'none', cursor: 'pointer' }}>
                  {t.joinNow}
                </button>
              </div>
            </div>
          )
        )}

        {/* 4. 广场视图 */}
        {activeTab === 'plaza' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingBottom: '10px' }}>
            {filteredProfiles.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setActiveNomadId(p.id);
                  setActiveTab('explore');
                }}
                style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                <div style={{ width: '100%', height: '130px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${p.photo})`, backgroundSize: 'cover', filter: 'blur(16px) brightness(0.5)' }} />
                  <img src={p.photo} alt={p.name} style={{ position: 'relative', zIndex: 1, maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '8px', backgroundColor: '#0f172a', zIndex: 2 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#f8fafc' }}>{p.name}, {p.age}</div>
                  <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '2px' }}>{localizeContent(p.location, lang, 'location').split(',')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. 个人中心 */}
        {activeTab === 'profile' && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '14px' }}>
            {myProfile ? (
              <div style={{ backgroundColor: '#0f172a', border: '2px solid #10b981', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>{t.myCardTitle}</span>
                  <span style={{ fontSize: '10px', backgroundColor: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {t.quotaLabel}
                  </span>
                </div>

                <div style={{ width: '100%', height: '220px', borderRadius: '14px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${myProfile.photo})`, backgroundSize: 'cover', filter: 'blur(20px) brightness(0.5)' }} />
                  <img src={myProfile.photo} alt={myProfile.name} style={{ position: 'relative', zIndex: 1, maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>

                <div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>{myProfile.name}, {myProfile.age}</div>
                  <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>📍 {localizeContent(myProfile.location, lang, 'location')}</div>
                  <div style={{ fontSize: '12px', color: '#a5b4fc', marginTop: '2px' }}>💼 {localizeContent(myProfile.tribe, lang, 'tribe')}</div>
                  {myProfile.zodiac && <div style={{ fontSize: '12px', color: '#facc15', marginTop: '2px' }}>✨ {myProfile.zodiac}</div>}
                </div>

                <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px' }}>
                  {localizeContent(myProfile.bio, lang, 'bio')}
                </div>

                {/* 专属邀请码卡片 */}
                <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 'bold' }}>
                    {t.inviteCodeLabel}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8', letterSpacing: '2px', marginTop: '4px' }}>{myInviteCode}</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    style={{ flex: 1, padding: '11px', borderRadius: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {t.editCard}
                  </button>
                  <button
                    onClick={handleDeleteMyCard}
                    style={{ flex: 1, padding: '11px', borderRadius: '12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {t.deleteCard}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 10px', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px dashed #334155' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📇</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{t.noCardTitle}</div>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 16px 0', maxWidth: '260px' }}>
                  {t.noCardDesc}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  style={{ padding: '12px 24px', borderRadius: '14px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#020617', fontWeight: '900', fontSize: '13px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                >
                  {t.createCardNow}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10b981', color: '#020617', padding: '8px 18px', borderRadius: '24px', fontWeight: '900', fontSize: '12px', zIndex: 3000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          {toastMsg}
        </div>
      )}

      {/* 能量耗尽拦截弹窗 */}
      {showEnergyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px', boxSizing: 'border-box' }} onClick={() => setShowEnergyModal(false)}>
          <div style={{ width: '100%', maxWidth: '340px', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #e11d48', padding: '20px', textAlign: 'center', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{t.energyModalTitle}</div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0 16px 0', lineHeight: '1.5' }}>
              {t.energyModalDesc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!myProfile ? (
                <button
                  onClick={() => {
                    setShowEnergyModal(false);
                    setShowCreateModal(true);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#020617', fontWeight: '900', fontSize: '13px', border: 'none', cursor: 'pointer' }}
                >
                  {t.energyModalBtn}
                </button>
              ) : null}
              <button
                onClick={() => {
                  setShowEnergyModal(false);
                  setShowShareModal(true);
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #f472b6', color: '#f472b6', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                {t.energyShareBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 能量规则与加油站弹窗 */}
      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2500, padding: '16px', boxSizing: 'border-box' }} onClick={() => setShowShareModal(false)}>
          <div style={{ width: '100%', maxWidth: '370px', maxHeight: '88vh', overflowY: 'auto', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #ec4899', padding: '18px', textAlign: 'center', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>⚡</div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#f472b6' }}>
              {t.shareModalTitle}
            </div>

            {/* 规则卡片 */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '10px 12px', margin: '10px 0', textAlign: 'left', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px' }}>📌 {lang === 'zh' ? '消耗与获取明细：' : (lang === 'ja' ? 'エネルギー利用規則：' : (lang === 'es' ? 'Desglose de Energía:' : 'Energy Breakdown:'))}</div>
              <div>• <strong>Pass / Like</strong>: -1 ⚡</div>
              <div>• <strong>{lang === 'zh' ? '双语对练' : (lang === 'ja' ? 'チャット開始' : (lang === 'es' ? 'Conectar y Chat' : 'Chat'))}</strong>: -3 ⚡ ({lang === 'zh' ? '进入后本场免费畅聊' : (lang === 'ja' ? '会話中無制限' : (lang === 'es' ? 'Chat ilimitado en sesión' : 'Free in session'))})</div>
              <div>• <strong>AI {lang === 'zh' ? '星座破冰词' : 'Icebreakers'}</strong>: 0 ⚡ ({lang === 'zh' ? '完全免费' : (lang === 'ja' ? '完全無料' : (lang === 'es' ? 'Totalmente gratis' : 'Free'))})</div>
              <div>• <strong>{t.createCardNow}</strong>: {lang === 'zh' ? '升级为每日 50 ⚡ 额度' : (lang === 'ja' ? '毎日50枠解放' : (lang === 'es' ? 'Cupo diario de 50 ⚡' : '50 daily ⚡'))}</div>
            </div>

            {/* 我的邀请码 */}
            <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.inviteCodeLabel}</div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8', letterSpacing: '2px', marginTop: '4px' }}>{myInviteCode}</div>
            </div>

            {/* 兑换好友邀请码 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <input
                value={inputInviteCode}
                onChange={e => setInputInviteCode(e.target.value.toUpperCase())}
                placeholder={lang === 'zh' ? '输入好友邀请码 (如 AURA88)' : (lang === 'ja' ? '招待コードを入力' : (lang === 'es' ? 'Ingresa código de amigo' : 'Enter invite code'))}
                style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none' }}
              />
              <button
                onClick={handleRedeemInviteCode}
                style={{ backgroundColor: '#ec4899', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '10px', padding: '0 12px', fontSize: '12px', cursor: 'pointer' }}
              >
                {t.redeemBtn}
              </button>
            </div>

            {/* 全球多平台打卡领能量 */}
            <div style={{ textAlign: 'left', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 'bold', marginBottom: '6px' }}>
                📸 {t.shareModalDesc}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { name: 'X (Twitter)', icon: '𝕏', border: '#334155' },
                  { name: 'Reddit', icon: '🔴', border: '#ff4500' },
                  { name: 'Instagram', icon: '📸', border: '#e1306c' },
                  { name: 'Threads', icon: '🧵', border: '#334155' },
                  { name: '即刻 (Jike)', icon: '🟡', border: '#ffe411' },
                  { name: '小红书 (RED)', icon: '📕', border: '#ff2442' }
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => handlePlatformShare(item.name)}
                    disabled={hasClaimedToday}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      backgroundColor: '#1e293b',
                      border: `1px solid ${item.border}`,
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: hasClaimedToday ? 'not-allowed' : 'pointer',
                      opacity: hasClaimedToday ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ fontSize: '10px' }}>{item.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {hasClaimedToday && (
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>
                  ✅ {lang === 'zh' ? '今日打卡奖励已领 (明日 0 点刷新)' : (lang === 'ja' ? '本日の獲得完了（明日リセット）' : (lang === 'es' ? 'Reclamado hoy (Se reinicia mañana)' : 'Claimed today (Refreshes tomorrow)'))}
                </div>
              )}
              <button
                onClick={() => setShowShareModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', padding: '4px' }}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 破冰词弹窗 */}
      {showIcebreakerModal && currentNomad && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', boxSizing: 'border-box' }} onClick={() => setShowIcebreakerModal(false)}>
          <div style={{ width: '100%', maxWidth: '350px', backgroundColor: '#0f172a', borderRadius: '18px', border: '1px solid #334155', padding: '18px', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc' }}>🪄 AI Zodiac Icebreaker</span>
              <button onClick={() => setShowIcebreakerModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
            {icebreakerLoading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                {lang === 'zh' ? '🤖 AI 正在生成专属破冰词…' : '🤖 AI is writing your icebreaker…'}
              </div>
            ) : (
              <>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>🇬🇧 English Version:</div>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.4' }}>"{aiIcebreaker?.en || currentNomad.icebreakerEn}"</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: '10px', borderRadius: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#f472b6', fontWeight: 'bold', marginBottom: '4px' }}>🇨🇳 Context / Translation:</div>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: '1.4' }}>"{aiIcebreaker?.zh || currentNomad.icebreakerZh}"</div>
                </div>
                {!aiIcebreaker && (
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '-8px', marginBottom: '12px' }}>
                    {lang === 'zh' ? '（AI 暂时不可用，已显示默认文案）' : '(AI unavailable right now, showing default text)'}
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => {
                setShowIcebreakerModal(false);
                handleStartChat();
              }}
              style={{ width: '100%', padding: '11px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #38bdf8)', color: '#ffffff', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer' }}
            >
              🚀 {t.chat}
            </button>
          </div>
        </div>
      )}

      {/* 实时对练弹窗 */}
      {showChatModal && currentNomad && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '14px', boxSizing: 'border-box' }} onClick={() => setShowChatModal(false)}>
          <div style={{ width: '100%', maxWidth: '370px', height: '80vh', backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={currentNomad.photo} alt={currentNomad.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'contain', backgroundColor: '#000' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff' }}>{currentNomad.name}</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>{t.onlineChatting}</div>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)', padding: '5px 12px', fontSize: '10px', color: '#facc15', textAlign: 'center', flexShrink: 0 }}>
              {t.chatSafetyNote}
            </div>

            <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{ backgroundColor: msg.sender === 'user' ? '#0284c7' : '#1e293b', color: '#ffffff', padding: '8px 12px', borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '12px', lineHeight: '1.4' }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              ))}
              {chatReplyLoading && (
                <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <div style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '8px 12px', borderRadius: '14px 14px 14px 4px', fontSize: '12px' }}>
                    {lang === 'zh' ? '对方正在输入…' : 'typing…'}
                  </div>
                </div>
              )}
            </div>

            {chatWarning && (
              <div style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', padding: '4px 10px', textAlign: 'center' }}>
                {chatWarning}
              </div>
            )}

            <form onSubmit={handleSendMessage} style={{ padding: '8px 10px', borderTop: '1px solid #1e293b', display: 'flex', gap: '6px', backgroundColor: '#0f172a' }}>
              <input
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder={t.chatInputPlaceholder}
                style={{ flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
              />
              <button type="submit" disabled={chatReplyLoading} style={{ backgroundColor: '#10b981', color: '#020617', fontWeight: '900', border: 'none', borderRadius: '10px', padding: '0 14px', fontSize: '12px', cursor: chatReplyLoading ? 'not-allowed' : 'pointer', opacity: chatReplyLoading ? 0.6 : 1 }}>
                {t.send}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 建名片弹窗 */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCardCreated}
        lang={lang}
      />

    </div>
  );
}