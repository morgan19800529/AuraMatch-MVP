export type SupportedLang = 'zh' | 'en' | 'es' | 'ja';

export interface Translations {
  energy: string;
  fuel: string;
  infinite: string;
  claimReward: string;
  explore: string;
  plaza: string;
  profile: string;
  admin: string;
  global: string;
  asia: string;
  europe: string;
  americas: string;
  oceania: string;
  africa: string;
  pass: string;
  chat: string;
  like: string;
  createCardBtn: string;
  editCardBtn: string;
  securityNote: string;
  emptyContinentTitle: string;
  emptyContinentDesc: string;
  viewAllContinents: string;
  joinNow: string;
  icebreakerBtn: string;
  onlineChatting: string;
  chatSafetyNote: string;
  chatInputPlaceholder: string;
  send: string;
  myCardTitle: string;
  quotaLabel: string;
  editCard: string;
  deleteCard: string;
  noCardTitle: string;
  noCardDesc: string;
  createCardNow: string;
  energyModalTitle: string;
  energyModalDesc: string;
  energyModalBtn: string;
  energyShareBtn: string;
  shareModalTitle: string;
  shareModalDesc: string;
  shareClaimBtn: string;
  close: string;
  presetBadge: string;
  realBadge: string;
  verifiedBadge: string;
  inviteCodeLabel: string;
  redeemBtn: string;
  modalTitle: string;
  uploadHint: string;
  uploadSubHint: string;
  namePlaceholder: string;
  agePlaceholder: string;
  locationPlaceholder: string;
  tribePlaceholder: string;
  bioPlaceholder: string;
  tagPlaceholder: string;
  addTagBtn: string;
  submitBtn: string;
  submittingBtn: string;
}

export const translations: Record<SupportedLang, Translations> = {
  zh: {
    energy: '探索能量',
    fuel: '加油站',
    infinite: '无限 ∞',
    claimReward: '🎁 领能量',
    explore: '🔥 探索',
    plaza: '★ 广场',
    profile: '👤 我的',
    admin: '🛡️ 监控',
    global: '🌏 全球',
    asia: '🎋 亚洲',
    europe: '🇪🇺 欧洲',
    americas: '🌎 美洲',
    oceania: '🌊 大洋洲',
    africa: '🌍 非洲',
    pass: '👎 Pass (-1⚡)',
    chat: '💬 双语对练 (-3⚡畅聊)',
    like: '❤️ Like (-1⚡)',
    createCardBtn: '✨ 10秒上架名片 · 解锁每日50点额度',
    editCardBtn: '✏️ 编辑我的游民名片',
    securityNote: '🛡️ 平台已开启涉黄暴力 AI 机审与人工双重保障',
    emptyContinentTitle: '该大洲暂无更多游民档案',
    emptyContinentDesc: '成为该地区首位入驻的数字游民，获得全网首推！',
    viewAllContinents: '查看全球大洲',
    joinNow: '+ 立即入驻',
    icebreakerBtn: '🪄 一键生成 AI 双语破冰词 (免费)',
    onlineChatting: '🟢 在线对练中 · 畅聊免费',
    chatSafetyNote: '🛡️ 安全提示：跨文化交流请友好互敬，请勿泄露个人银行账户或转账付款。',
    chatInputPlaceholder: '输入消息，练习跨文化破冰...',
    send: '发送',
    myCardTitle: '🌟 我的游民名片（已上架）',
    quotaLabel: '⚡ 每日 50 点额度',
    editCard: '✏️ 编辑名片',
    deleteCard: '🗑️ 注销/下架名片',
    noCardTitle: '你还没有创建游民名片',
    noCardDesc: '上架真实名片，即可解锁每日 50 点探索特权与全球五大洲搭子合盘！',
    createCardNow: '✨ 立即创建我的名片',
    energyModalTitle: '今日探索额度已用完',
    energyModalDesc: '上架真实游民名片，即可永久解锁【每日 50 点探索额度】！',
    energyModalBtn: '✨ 立即上架名片 · 解锁每日50点',
    energyShareBtn: '🎟️ 填写邀请码 / 转发打卡领能量',
    shareModalTitle: '能量规则与全球打卡加油站',
    shareModalDesc: '选择平台分享打卡，附带 #AuraMatch 即可领取 +30 能量！',
    shareClaimBtn: '🎉 我已截图分享 · 领 +30 能量',
    close: '关闭',
    presetBadge: '认证搭子',
    realBadge: '真实名片',
    verifiedBadge: '✨ 认证游民',
    inviteCodeLabel: '🎟️ 我的专属邀请码（好友建卡双方各得 +20⚡）',
    redeemBtn: '兑换 (+20⚡)',
    modalTitle: '✨ 10秒生成我的游民名片',
    uploadHint: '点击选图 / 拖拽 / 粘贴(Ctrl+V)',
    uploadSubHint: '支持微信截图 · 电脑与手机即显',
    namePlaceholder: '昵称 / Name',
    agePlaceholder: '年龄',
    locationPlaceholder: '常驻地 (例: 🇨🇳 清迈 / 🇵🇹 里斯本)',
    tribePlaceholder: '游民物种 (例: 独立开发者 / 慢生活疗愈)',
    bioPlaceholder: '一句话自我介绍与搭子期待...',
    tagPlaceholder: '兴趣标签 (输入后点添加)',
    addTagBtn: '+ 添加',
    submitBtn: '🚀 立即上架名片 · 解锁每日50点',
    submittingBtn: '安全机审与上架中...'
  },
  en: {
    energy: 'Energy',
    fuel: 'Fuel',
    infinite: 'Unlimited ∞',
    claimReward: '🎁 Fuel Station',
    explore: '🔥 Explore',
    plaza: '★ Plaza',
    profile: '👤 Profile',
    admin: '🛡️ Admin',
    global: '🌏 Global',
    asia: '🎋 Asia',
    europe: '🇪🇺 Europe',
    americas: '🌎 Americas',
    oceania: '🌊 Oceania',
    africa: '🌍 Africa',
    pass: '👎 Pass (-1⚡)',
    chat: '💬 Connect & Chat (-3⚡)',
    like: '❤️ Like (-1⚡)',
    createCardBtn: '✨ Publish Card · Unlock 50 Daily Energy',
    editCardBtn: '✏️ Edit My Card',
    securityNote: '🛡️ Protected by AI content moderation & verified community',
    emptyContinentTitle: 'No more nomads in this region yet',
    emptyContinentDesc: 'Be the first digital nomad to join and get featured globally!',
    viewAllContinents: 'View Global',
    joinNow: '+ Join Now',
    icebreakerBtn: '🪄 Generate AI Icebreaker (Free)',
    onlineChatting: '🟢 Online · Free in Session',
    chatSafetyNote: '🛡️ Safety Reminder: Please be respectful. Never share banking or transfer money.',
    chatInputPlaceholder: 'Type a message to practice breaking the ice...',
    send: 'Send',
    myCardTitle: '🌟 My Nomad Card (Live)',
    quotaLabel: '⚡ 50 Daily Quota',
    editCard: '✏️ Edit Card',
    deleteCard: '🗑️ Deactivate / Delete',
    noCardTitle: 'No Nomad Card Created Yet',
    noCardDesc: 'Publish your nomad card to unlock 50 daily energy quota and connect globally!',
    createCardNow: '✨ Create My Nomad Card',
    energyModalTitle: 'Daily Energy Exhausted',
    energyModalDesc: 'Publish your nomad card to unlock 50 daily energy quota!',
    energyModalBtn: '✨ Publish Card · Unlock 50 Daily',
    energyShareBtn: '🎟️ Redeem Code / Share to Earn',
    shareModalTitle: 'Energy Rules & Global Fuel Station',
    shareModalDesc: 'Share your card to socials with #AuraMatch to claim +30 energy!',
    shareClaimBtn: '🎉 Claim +30 Share Energy',
    close: 'Close',
    presetBadge: 'Verified Peer',
    realBadge: 'Nomad Card',
    verifiedBadge: '✨ Verified Nomad',
    inviteCodeLabel: '🎟️ My Invite Code (Both get +20⚡ upon signup)',
    redeemBtn: 'Redeem (+20⚡)',
    modalTitle: '✨ Create Nomad Card in 10s',
    uploadHint: 'Click to upload / Drag / Paste (Ctrl+V)',
    uploadSubHint: 'Instant preview · JPG / PNG / WebP',
    namePlaceholder: 'Nickname / Name',
    agePlaceholder: 'Age',
    locationPlaceholder: 'Location (e.g. 🇹🇭 Chiang Mai / 🇵🇹 Lisbon)',
    tribePlaceholder: 'Nomad Tribe (e.g. Indie Hacker / Yoga)',
    bioPlaceholder: 'Short bio & vibe you are seeking...',
    tagPlaceholder: 'Interest tag (Press enter)',
    addTagBtn: '+ Add',
    submitBtn: '🚀 Publish Card · Unlock 50 Daily Energy',
    submittingBtn: 'Moderating & Publishing...'
  },
  es: {
    energy: 'Energía',
    fuel: 'Combustible',
    infinite: 'Ilimitado ∞',
    claimReward: '🎁 Estación',
    explore: '🔥 Explorar',
    plaza: '★ Plaza',
    profile: '👤 Perfil',
    admin: '🛡️ Admin',
    global: '🌏 Global',
    asia: '🎋 Asia',
    europe: '🇪🇺 Europa',
    americas: '🌎 América',
    oceania: '🌊 Oceanía',
    africa: '🌍 África',
    pass: '👎 Pasar (-1⚡)',
    chat: '💬 Conectar & Chat (-3⚡)',
    like: '❤️ Me gusta (-1⚡)',
    createCardBtn: '✨ Crear tarjeta · Desbloquear 50/día',
    editCardBtn: '✏️ Editar mi tarjeta',
    securityNote: '🛡️ Moderación con IA y comunidad verificada',
    emptyContinentTitle: 'No hay más nómadas en esta región',
    emptyContinentDesc: '¡Sé el primer nómada digital en unirte!',
    viewAllContinents: 'Ver Todo',
    joinNow: '+ Unirse Ahora',
    icebreakerBtn: '🪄 Rompehielos IA (Gratis)',
    onlineChatting: '🟢 En línea · Chat gratis en sesión',
    chatSafetyNote: '🛡️ Seguridad: Sea respetuoso. Nunca comparta datos bancarios.',
    chatInputPlaceholder: 'Escribe un mensaje para romper el hielo...',
    send: 'Enviar',
    myCardTitle: '🌟 Mi Tarjeta Nómada',
    quotaLabel: '⚡ Cupo diario: 50',
    editCard: '✏️ Editar Tarjeta',
    deleteCard: '🗑️ Desactivar / Eliminar',
    noCardTitle: 'No tienes tarjeta aún',
    noCardDesc: '¡Publica tu perfil nómada para desbloquear 50 de energía diaria!',
    createCardNow: '✨ Crear Mi Tarjeta',
    energyModalTitle: 'Energía diaria agotada',
    energyModalDesc: '¡Publica tu tarjeta para desbloquear 50 energías diarias!',
    energyModalBtn: '✨ Crear Tarjeta · 50 Diarios',
    energyShareBtn: '🎟️ Canjear Código / Compartir',
    shareModalTitle: 'Reglas de Energía & Estación',
    shareModalDesc: '¡Comparte en redes con #AuraMatch para ganar +30 energía!',
    shareClaimBtn: '🎉 Reclamar +30 Energía',
    close: 'Cerrar',
    presetBadge: 'Verificado',
    realBadge: 'Nómada',
    verifiedBadge: '✨ Nómada Verificado',
    inviteCodeLabel: '🎟️ Mi Código de Invitación (+20⚡)',
    redeemBtn: 'Canjear (+20⚡)',
    modalTitle: '✨ Crear Tarjeta Nómada en 10s',
    uploadHint: 'Haga clic / Arrastre / Pegar (Ctrl+V)',
    uploadSubHint: 'Vista previa instantánea · JPG / PNG',
    namePlaceholder: 'Nombre / Apodo',
    agePlaceholder: 'Edad',
    locationPlaceholder: 'Ubicación (ej: 🇨🇴 Medellín)',
    tribePlaceholder: 'Tribu nómada (ej: Desarrollador)',
    bioPlaceholder: 'Breve biografía...',
    tagPlaceholder: 'Etiqueta de interés',
    addTagBtn: '+ Añadir',
    submitBtn: '🚀 Publicar Tarjeta · 50 Diarios',
    submittingBtn: 'Publicando...'
  },
  ja: {
    energy: 'エネルギー',
    fuel: 'チャージ',
    infinite: '無制限 ∞',
    claimReward: '🎁 給油所',
    explore: '🔥 探す',
    plaza: '★ 広場',
    profile: '👤 プロフ',
    admin: '🛡️ 管理',
    global: '🌏 全世界',
    asia: '🎋 アジア',
    europe: '🇪🇺 ヨーロッパ',
    americas: '🌎 アメリカ',
    oceania: '🌊 オセアニア',
    africa: '🌍 アフリカ',
    pass: '👎 パス (-1⚡)',
    chat: '💬 チャット開始 (-3⚡)',
    like: '❤️ いいね (-1⚡)',
    createCardBtn: '✨ カード作成 · 毎日50枠解放',
    editCardBtn: '✏️ カードを編集',
    securityNote: '🛡️ AI安全審査とコミュニティ保護を実施中',
    emptyContinentTitle: 'このエリアのノマドはまだいません',
    emptyContinentDesc: '最初の登録者になって世界中にアピールしましょう！',
    viewAllContinents: '全エリアを表示',
    joinNow: '+ 今すぐ参加',
    icebreakerBtn: '🪄 AIアイスブレイク生成 (無料)',
    onlineChatting: '🟢 オンライン · 会話中無料',
    chatSafetyNote: '🛡️ 安全案内：口座情報や金銭のやり取りは行わないでください。',
    chatInputPlaceholder: 'メッセージを入力して会話を始めましょう...',
    send: '送信',
    myCardTitle: '🌟 マイノマドカード（公開中）',
    quotaLabel: '⚡ 毎日 50 エナジー枠',
    editCard: '✏️ 編集する',
    deleteCard: '🗑️ 削除・非公開',
    noCardTitle: 'カードがまだありません',
    noCardDesc: 'ノマドカードを作成して、毎日50エナジーで仲間を探そう！',
    createCardNow: '✨ カードを作成',
    energyModalTitle: '本日のエネルギーを使い切りました',
    energyModalDesc: 'カードを作成して毎日50枠を永久解放！',
    energyModalBtn: '✨ カード作成 · 毎日50枠',
    energyShareBtn: '🎟️ 招待コード入力 / シェアで獲得',
    shareModalTitle: 'エネルギー規則＆SNS給油所',
    shareModalDesc: 'SNSにスクショを投稿して +30 エネルギーを獲得！',
    shareClaimBtn: '🎉 シェア完了 · +30を受け取る',
    close: '閉じる',
    presetBadge: '公認ノマド',
    realBadge: 'メンバー',
    verifiedBadge: '✨ 認証ノマド',
    inviteCodeLabel: '🎟️ 私の招待コード（お互いに +20⚡ 獲得）',
    redeemBtn: '引換 (+20⚡)',
    modalTitle: '✨ 10秒でノマドカード作成',
    uploadHint: 'クリック / ドラッグ / 貼り付け(Ctrl+V)',
    uploadSubHint: '即時プレビュー · JPG / PNG / WebP',
    namePlaceholder: 'ニックネーム / 名前',
    agePlaceholder: '年齢',
    locationPlaceholder: '滞在地 (例: 🇹🇭 チェンマイ / 🇯🇵 京都)',
    tribePlaceholder: '職種・スタイル (例: 個人開発者 / ヨガ)',
    bioPlaceholder: '自己紹介と求める仲間について...',
    tagPlaceholder: '興味タグ (入力して追加)',
    addTagBtn: '+ 追加',
    submitBtn: '🚀 カードを公開 · 毎日50枠解放',
    submittingBtn: '審査＆公開中...'
  }
};

export const detectUserLang = (): SupportedLang => {
  const navLang = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase();
  if (navLang.startsWith('zh')) return 'zh';
  if (navLang.startsWith('es')) return 'es';
  if (navLang.startsWith('ja')) return 'ja';
  return 'en';
};