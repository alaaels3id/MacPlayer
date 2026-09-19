import React from 'react'
import { Clock } from 'lucide-react'

interface SyncToastProps {
  message: string | null
}

export const SyncToast: React.FC<SyncToastProps> = ({ message }) => {
  if (!message) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(20, 22, 28, 0.88)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-md)',
        color: '#ffffff',
        padding: '8px 18px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '13px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <Clock size={16} color="var(--accent)" />
      <span>{message}</span>
    </div>
  )
}
