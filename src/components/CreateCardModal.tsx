import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkTextModeration } from '../lib/moderation';
import { translations, SupportedLang } from '../lib/i18n';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCard: any) => void;
  lang?: SupportedLang;
}

const MAX_BIO_LENGTH = 80;

const ZODIAC_SIGNS = [
  '白羊座 / Aries', '金牛座 / Taurus', '双子座 / Gemini', '巨蟹座 / Cancer',
  '狮子座 / Leo', '处女座 / Virgo', '天秤座 / Libra', '天蝎座 / Scorpio',
  '射手座 / Sagittarius', '摩羯座 / Capricorn', '水瓶座 / Aquarius', '双鱼座 / Pisces',
];

export const CreateCardModal: React.FC<CreateCardModalProps> = ({ isOpen, onClose, onCreated, lang = 'zh' }) => {
  const t = translations[lang] || translations.en;

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [nativeCulture, setNativeCulture] = useState('');
  const [targetCulture, setTargetCulture] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [bio, setBio] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [photoData, setPhotoData] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setAge('');
    setNativeCulture('');
    setTargetCulture('');
    setZodiac('');
    setBio('');
    setTagInput('');
    setTags([]);
    setPreviewUrl('');
    setPhotoData('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const processFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please select a JPG, PNG or WebP image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;
      setPreviewUrl(result);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setPhotoData(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            setPhotoData(result);
          }
        } catch {
          setPhotoData(result);
        }
      };
      img.onerror = () => setPhotoData(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 6) {
      const textCheck = checkTextModeration(trimmed);
      if (!textCheck.passed) {
        setError(textCheck.reason || 'Tag contains restricted words');
        return;
      }
      setTags([...tags, trimmed]);
      setTagInput('');
      setError('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((item) => item !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const ageNum = Number(age);
    if (!name.trim()) return setError('Please enter your name');
    if (!ageNum || ageNum < 18 || ageNum > 100) return setError('Age must be between 18 and 100');
    if (!nativeCulture.trim()) return setError('Please enter your location');
    if (!targetCulture.trim()) return setError('Please enter your nomad tribe');
    if (!bio.trim()) return setError('Please enter a short bio');

    const combinedText = `${name} ${nativeCulture} ${targetCulture} ${bio} ${tags.join(' ')}`;
    const textCheck = checkTextModeration(combinedText);
    if (!textCheck.passed) {
      return setError(textCheck.reason || 'Content contains inappropriate text');
    }

    setSubmitting(true);
    try {
      // 关键词过滤只是第一层，再叫一次服务端的 AI 语义审核兜底（网络失败时会自动放行，不会卡死正常用户）。
      try {
        const aiCheck = await fetch('/api/moderate-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: combinedText }),
        }).then((r) => r.json());
        if (aiCheck && aiCheck.passed === false) {
          setSubmitting(false);
          return setError('内容疑似包含违规信息，请修改后重试 / Content flagged, please revise.');
        }
      } catch {
        // AI 审核接口本身出问题时不阻塞正常提交，交给下面的关键词过滤和人工审核兜底
      }

      const avatarUrl = photoData || previewUrl || '';

      // 新卡片一律先进 "pending"（待审核），只有管理员在后台通过之后才会出现在别人的卡池里。
      // 注意：不能再用 .select().single() 读回这一行——现在的 RLS 只允许读 status='approved' 的行，
      // 刚插入的 pending 行对提交者自己也是"读不到"的，硬要 select 会导致这里报错、误判成插入失败。
      const { error: insertError } = await supabase.from('profiles').insert({
        full_name: name.trim(),
        age: ageNum,
        native_culture: nativeCulture.trim(),
        target_culture: targetCulture.trim(),
        bio: bio.trim(),
        interests: tags.length > 0 ? tags : [targetCulture.trim()],
        avatar_url: avatarUrl || null,
        zodiac: zodiac || null,
        is_ai_agent: false,
        status: 'pending',
      });

      if (insertError) throw insertError;

      // 用本地表单里已有的数据直接乐观渲染，提交者自己这一场会话里能立刻看到、试用自己的卡片；
      // 其他人要等管理员在后台点"通过"之后才会看到（status 变成 approved）。
      onCreated({
        id: `cloud-pending-${Date.now()}`,
        name: name.trim(),
        age: ageNum,
        location: nativeCulture.trim(),
        zodiac: zodiac || '',
        bio: bio.trim(),
        tags: tags.length > 0 ? tags : [targetCulture.trim()],
        photo: avatarUrl,
        pending: true,
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error('建卡异常:', err);
      onCreated({
        id: `local-${Date.now()}`,
        name: name.trim(),
        age: ageNum,
        location: nativeCulture.trim(),
        zodiac: zodiac || '',
        bio: bio.trim(),
        tags: tags.length > 0 ? tags : [targetCulture.trim()],
        photo: photoData || previewUrl || '',
        pending: true,
      });
      resetForm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f9fafb',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          border: '1px solid #334155',
          padding: '20px',
          boxSizing: 'border-box',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#f8fafc' }}>{t.modalTitle}</span>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label
            htmlFor="nomad-avatar-file-input"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              width: '100%',
              height: '140px',
              borderRadius: '12px',
              backgroundColor: isDragging ? '#334155' : '#1e293b',
              border: isDragging ? '2px dashed #38bdf8' : '2px dashed #0ea5e9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div style={{ textAlign: 'center', padding: '8px', pointerEvents: 'none' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>📸</div>
                <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>{t.uploadHint}</div>
                <div style={{ color: '#64748b', fontSize: '10px', marginTop: '3px' }}>{t.uploadSubHint}</div>
              </div>
            )}
          </label>

          <input
            id="nomad-avatar-file-input"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handlePhotoChange}
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              style={{ ...inputStyle, flex: 2 }}
            />
            <input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder={t.agePlaceholder}
              inputMode="numeric"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>

          <input
            value={nativeCulture}
            onChange={(e) => setNativeCulture(e.target.value)}
            placeholder={t.locationPlaceholder}
            style={inputStyle}
          />

          <input
            value={targetCulture}
            onChange={(e) => setTargetCulture(e.target.value)}
            placeholder={t.tribePlaceholder}
            style={inputStyle}
          />

          <select
            value={zodiac}
            onChange={(e) => setZodiac(e.target.value)}
            style={{ ...inputStyle, color: zodiac ? '#f9fafb' : '#6b7280' }}
          >
            <option value="">{t.zodiacPlaceholder}</option>
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign} value={sign}>{sign}</option>
            ))}
          </select>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
            placeholder={t.bioPlaceholder}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
          <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', marginTop: '-8px' }}>
            {bio.length}/{MAX_BIO_LENGTH}
          </div>

          <div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={t.tagPlaceholder}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={addTag}
                style={{
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {t.addTagBtn}
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => removeTag(tag)}
                    style={{
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    #{tag} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', lineHeight: '1.4' }}>{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              color: '#020617',
              fontWeight: '900',
              fontSize: '13px',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              marginTop: '4px',
            }}
          >
            {submitting ? t.submittingBtn : t.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
};