import React from 'react';

const CONTACT_EMAIL = 'morgan19800529@gmail.com';

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100dvh', background: '#020617', color: '#e2e8f0', padding: '32px 18px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <a href="/" style={{ color: '#38bdf8', fontSize: 13, textDecoration: 'none' }}>← 返回 AuraMatch / Back to AuraMatch</a>

        <h1 style={{ fontSize: 22, marginTop: 20, marginBottom: 4 }}>隐私政策与服务条款</h1>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 28 }}>最近更新 / Last updated: 2026-08-19</p>

        <Section title="1. 我们收集哪些信息 / What we collect">
          <p>
            如果你选择创建游民名片，我们会收集你主动填写、上传的信息，包括：昵称、年龄、常驻地、目标文化/语言、一句话自我介绍、兴趣标签，以及你上传的头像照片。
            浏览网站本身（不建卡）不需要注册、不收集你的姓名或联系方式。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            If you create a nomad card, we collect what you voluntarily submit: nickname, age, home location, target culture/language, a short bio, interest tags, and your uploaded photo.
            Simply browsing the site without creating a card does not require registration or collect your name/contact info.
          </p>
        </Section>

        <Section title="2. 信息如何被使用 / How it's used">
          <p>
            你提交的名片信息会先进入人工审核队列，通过审核后才会展示给其他访客，用于跨文化交友/语言交换配对场景。
            我们不会把你的信息用于审核与展示之外的用途，也不会出售给第三方广告商。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            Submitted cards go through human review before becoming visible to other visitors, and are used solely for cross-cultural matching. We do not sell your data to third-party advertisers.
          </p>
        </Section>

        <Section title="3. AI 与第三方服务 / AI & third parties">
          <p>
            平台使用 Supabase 存储名片数据，使用 DeepSeek 提供"破冰词生成"与"双语对练聊天"两个 AI 功能——你在这两个功能里输入或收到的内容会被发送给 DeepSeek 的接口用于生成回复，不会被用来训练模型或分享给其他第三方。
            平台会对提交的文字与图片做自动初筛（关键词过滤 + AI 语义审核 + 图片风险检测），最终由人工复核决定是否公开展示。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            We use Supabase to store card data, and DeepSeek to power the icebreaker generator and practice chat features — text sent to those features is relayed to DeepSeek's API to generate a response, and is not used to train models or shared with other third parties.
            Submissions go through automated screening (keyword filter + AI classification + image risk check) followed by human review before going public.
          </p>
        </Section>

        <Section title="4. 你的控制权 / Your controls">
          <p>
            你可以随时在"我的"页面里点击"注销/下架名片"，从平台上永久删除你的名片记录。如需协助删除数据或有其他隐私相关问题，可发邮件到 {CONTACT_EMAIL}。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            You can permanently delete your card at any time via "Deactivate / Delete" in the Profile tab. For deletion help or privacy questions, email {CONTACT_EMAIL}.
          </p>
        </Section>

        <Section title="5. 年龄限制与内容规范 / Age limit & content rules">
          <p>
            本平台仅面向 18 周岁及以上用户。禁止发布色情、招嫖、诈骗、毒品/武器交易、自杀自残相关内容，以及任何诱导跨平台转账、投资的信息。违规内容会被驳回或下架，严重情况将被永久禁止建卡。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            This platform is for users 18 and older only. Sexual solicitation, scams, drug/weapon trade, self-harm content, and off-platform payment/investment pitches are prohibited and will be rejected or removed.
          </p>
        </Section>

        <Section title="6. 免责声明 / Disclaimer">
          <p>
            AuraMatch 目前处于早期 MVP 阶段，仅提供身份展示与破冰交流工具，不对用户之间的线下见面、金钱往来或人身安全负责。请始终对陌生联系人保持基本警惕，切勿透露银行账户或转账付款。
          </p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>
            AuraMatch is an early-stage MVP that provides profile display and icebreaker tools only. We are not responsible for offline meetings, money exchanged, or personal safety between users. Always use normal caution with strangers and never share banking details or send money.
          </p>
        </Section>

        <Section title="7. 联系我们 / Contact">
          <p>如对本政策有任何疑问，请联系 {CONTACT_EMAIL}。</p>
          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>Questions about this policy? Contact {CONTACT_EMAIL}.</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 15, color: '#f8fafc', marginBottom: 8 }}>{title}</h2>
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
