'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { update } = useSession();
  const [profile, setProfile] = useState({ avatar: '', bio: '', minecraftName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        setProfile({
          avatar: data.avatar || '',
          bio: data.bio || '',
          minecraftName: data.minecraftName || ''
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        await update(); // Refresca las cookies de NextAuth automágicamente
        alert('Perfil actualizado con éxito');
        router.refresh();
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (err) {
      alert('Fallo en la comunicación con el servidor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px' }}>Cargando perfil...</div>;

  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Ajustes de Perfil</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Personaliza cómo los demás miembros ven tu tarjeta de jugador.
      </p>

      <form onSubmit={handleSubmit} className="card">
        
        {/* Avatar Section */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-muted)' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)',
            overflow: 'hidden', border: '2px solid var(--border-muted)', flexShrink: 0
          }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-muted)' }}>?</div>
            )}
          </div>
          <div style={{ flexGrow: 1 }}>
            <label className="form-label">URL del Avatar / Foto de Perfil</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://i.imgur.com/tu-foto.png" 
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
            />
            <p className="form-hint" style={{ marginTop: '0.5rem' }}>Pega el enlace directo a una imagen (acepta Gifs de imgur/discord).</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="form-group">
          <label className="form-label">Biografía (Sobre ti)</label>
          <textarea 
            className="form-textarea" 
            placeholder="¡Hola! Soy un jugador dedicado a la economía..."
            rows={4}
            maxLength={250}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
          <p className="form-hint" style={{ marginTop: '0.5rem', textAlign: 'right' }}>{profile.bio.length} / 250</p>
        </div>

        {/* Minecraft Detail */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label">Nombre de Usuario Técnico (Minecraft Java)</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Steve" 
            value={profile.minecraftName}
            maxLength={16}
            onChange={(e) => setProfile({ ...profile, minecraftName: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando Cambios...' : 'Guardar Perfil'}
        </button>

      </form>
    </div>
  );
}
