import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const userData = await login(form.email, form.password)
      if (redirect !== '/') {
        navigate(redirect)
      } else if (userData.role === 'admin') {
        navigate('/admin')
      } else if (userData.role === 'seller') {
        navigate('/vendeur')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="page" style={styles.page}>
      <div style={styles.box}>
        <div style={styles.header}>
          <span style={styles.icon}>♪</span>
          <h1 style={styles.title}>{t('login_title')}</h1>
          <p style={styles.sub}>{t('login_sub')}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label>{t('login_password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? t('login_loading') : t('login_submit')}
          </button>
        </form>

        <p style={styles.link}>
          {t('login_no_account')}{' '}
          <Link to="/inscription" style={{ color: '#ddba3c' }}>{t('login_register_link')}</Link>
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
    minHeight: 'calc(100vh - 70px)',
  },
  box: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  icon: {
    fontSize: '2rem',
    color: '#ddba3c',
    display: 'block',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  sub: {
    color: '#c9a4ac',
    fontSize: '0.9rem',
  },
  link: {
    textAlign: 'center',
    color: '#c9a4ac',
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
}
