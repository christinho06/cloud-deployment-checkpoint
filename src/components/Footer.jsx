import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="grid-footer">
          <div>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>♪</span>
              <span style={styles.logoText}>GostMood<span style={styles.logoAccent}> Creative Lab</span></span>
            </div>
            <p style={styles.desc}>{t('footer_desc')}</p>
          </div>
          <div>
            <h4 style={styles.colTitle}>{t('footer_catalog')}</h4>
            <nav style={styles.nav}>
              <Link to="/instrumentaux" style={styles.navLink}>{t('footer_instrumentals')}</Link>
              <Link to="/materiel" style={styles.navLink}>{t('footer_equipment')}</Link>
              <Link to="/instruments" style={styles.navLink}>{t('footer_instruments')}</Link>
            </nav>
          </div>
          <div>
            <h4 style={styles.colTitle}>{t('footer_sellers')}</h4>
            <nav style={styles.nav}>
              <Link to="/inscription?role=seller" style={styles.navLink}>{t('footer_become_seller')}</Link>
              <Link to="/vendeur" style={styles.navLink}>{t('footer_seller_dash')}</Link>
            </nav>
          </div>
          <div>
            <h4 style={styles.colTitle}>{t('footer_account')}</h4>
            <nav style={styles.nav}>
              <Link to="/connexion" style={styles.navLink}>{t('footer_login')}</Link>
              <Link to="/inscription" style={styles.navLink}>{t('footer_register')}</Link>
              <Link to="/commandes" style={styles.navLink}>{t('footer_orders')}</Link>
            </nav>
          </div>
        </div>
        <div style={styles.bottom}>
          <p style={styles.copy}>© 2025 GostMood Creative Lab. {t('footer_rights')}</p>
          <p style={styles.copy}>{t('footer_made_with')}</p>
        </div>
      </div>
    </footer>
  )
}

const styles = {
  footer: {
    background: '#120909',
    borderTop: '1px solid #3d2020',
    padding: '3rem 0 1.5rem',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  logoIcon: { fontSize: '1.4rem', color: '#ddba3c' },
  logoText: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '1.1rem',
    color: '#faeee0',
  },
  logoAccent: { color: '#ddba3c' },
  desc: {
    color: '#7d5560',
    fontSize: '0.85rem',
    lineHeight: 1.6,
    maxWidth: '260px',
  },
  colTitle: {
    color: '#faeee0',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navLink: {
    color: '#7d5560',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #3d2020',
  },
  copy: {
    color: '#7d5560',
    fontSize: '0.8rem',
  },
}
