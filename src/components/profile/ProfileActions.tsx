'use client';

import { useToast } from '@/components/providers/ToastProvider';

export default function ProfileActions({ userId }: { userId: string }) {
  const { showToast } = useToast();

  const handleShare = () => {
    const url = `${window.location.origin}/members/${userId}`;
    navigator.clipboard.writeText(url);
    showToast('Profile link copied to clipboard!', 'success');
  };

  return (
    <button 
      onClick={handleShare}
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s',
        backdropFilter: 'blur(10px)'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    >
      🔗 Share Profile
    </button>
  );
}
