import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    storeName: user?.sellerInfo?.storeName || '',
    storeDesc: user?.sellerInfo?.description || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      if (user.role === 'seller') {
        payload.sellerInfo = { storeName: form.storeName, description: form.storeDesc }
      }
      const { data } = await api.put('/auth/profile', payload)
      updateUser(data)
      toast.success('Profil mis a jour !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const roleLabel = { buyer: '🛒 Acheteur', seller: '🎵 Vendeur', admin: '🛡️ Administrateur' }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={styles.header}>
          <div style={styles.avatar}>{user?.name[0]?.toUpperCase()}</div>
          <div>
            <h1 style={styles.name}>{user?.name}</h1>
            <span style={styles.role}>{roleLabel[user?.role]}</span>
            <p style={styles.since}>Membre depuis {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.sectionTitle}>Modifier mon profil</h2>

          <div className="form-group">
            <label>Nom</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          {user?.role === 'seller' && (
            <>
              <div style={styles.divider} />
              <h2 style={styles.sectionTitle}>Informations boutique</h2>
              <div className="form-group">
                <label>Nom de la boutique</label>
                <input value={form.storeName} onChange={e => setForm({ ...form, storeName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.storeDesc}
                  onChange={e => setForm({ ...form, storeDesc: e.target.value })}
                  rows={3}
                  placeholder="Decrivez votre boutique..."
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ddba3c, #c4a032)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'white',
    flexShrink: 0,
  },
  name: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.2rem' },
  role: {
    display: 'inline-block',
    padding: '0.15rem 0.6rem',
    background: 'rgba(124,58,237,0.15)',
    borderRadius: '6px',
    fontSize: '0.78rem',
    color: '#e8ca55',
    fontWeight: 600,
    marginBottom: '0.3rem',
  },
  since: { color: '#7d5560', fontSize: '0.78rem', marginTop: '0.2rem' },
  form: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
    padding: '1.75rem',
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#faeee0' },
  divider: { height: '1px', background: '#3d2020', margin: '1.5rem 0' },
}
