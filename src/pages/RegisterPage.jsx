import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const defaultRole = new URLSearchParams(location.search).get('role') || 'buyer'

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: defaultRole, storeName: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(f => ({ ...f, role: defaultRole }))
  }, [defaultRole])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(t('register_err_passwords'))
      return
    }
    if (form.password.length < 6) {
      setError(t('register_err_length'))
      return
    }
    try {
      const user = await register(form.name, form.email, form.password, form.role, form.storeName)
      navigate(user.role === 'seller' ? '/vendeur' : '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la creation')
    }
  }

  return (
    <div className="page" style={styles.page}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.icon}>♪</span>
          <h1 style={styles.title}>{t('register_title')}</h1>
          <p style={styles.sub}>{t('register_sub')}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={styles.roleTabs}>
          <button
            style={{ ...styles.roleTab, ...(form.role === 'buyer' ? styles.roleTabActive : {}) }}
            onClick={() => setForm({ ...form, role: 'buyer' })}
            type="button"
          >
            {t('register_buyer')}
          </button>
          <button
            style={{ ...styles.roleTab, ...(form.role === 'seller' ? styles.roleTabActive : {}) }}
            onClick={() => setForm({ ...form, role: 'seller' })}
            type="button"
          >
            {t('register_seller')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('register_full_name')}</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t('register_name_placeholder')}
              required
            />
          </div>

          {form.role === 'seller' && (
            <div className="form-group">
              <label>{t('register_store_name')}</label>
              <input
                value={form.storeName}
                onChange={e => setForm({ ...form, storeName: e.target.value })}
                placeholder={t('register_store_placeholder')}
                required={form.role === 'seller'}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('login_email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="votre@email.com"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('register_password')}</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('register_confirm')}</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {form.role === 'seller' && (
            <div style={styles.sellerNote}>
              {t('register_seller_note')}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('register_loading') : t('register_submit')}
          </button>
        </form>

        <p style={styles.link}>
          {t('register_has_account')}{' '}
          <Link to="/connexion" style={{ color: '#ddba3c' }}>{t('register_login_link')}</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  },
  box: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '460px',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  icon: { fontSize: '2rem', color: '#ddba3c', display: 'block', marginBottom: '0.75rem' },
  title: { fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.25rem' },
  sub: { color: '#c9a4ac', fontSize: '0.9rem' },
  roleTabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: '#1e1010',
    padding: '0.3rem',
    borderRadius: '10px',
  },
  roleTab: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: '#c9a4ac',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  roleTabActive: {
    background: '#251414',
    color: '#faeee0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  sellerNote: {
    padding: '0.75rem 1rem',
    background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#c9a4ac',
    marginBottom: '1rem',
  },
  link: { textAlign: 'center', color: '#c9a4ac', fontSize: '0.875rem', marginTop: '1.25rem' },
}
