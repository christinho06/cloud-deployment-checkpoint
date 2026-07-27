import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import api from '../api/axios'
import {
  HamburgerMenuIcon, Cross2Icon, ChevronDownIcon,
  ChatBubbleIcon, PersonIcon, ExitIcon,
  GearIcon, DashboardIcon, PlusIcon
} from '@radix-ui/react-icons'
import { Tooltip } from './Tooltip'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const { lang, changeLang, t } = useLanguage()
  const { currency, changeCurrency } = useCurrency()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [unreadMsg, setUnreadMsg] = useState(0)

  useEffect(() => {
    if (!user) { setUnreadMsg(0); return }
    const fetch = () => api.get('/messages/unread').then(r => setUnreadMsg(r.data.count)).catch(() => {})
    fetch()
    const interval = setInterval(fetch, 15000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>♪</span>
          <span style={styles.logoText}>GostMood<span style={styles.logoAccent}> Creative Lab</span></span>
        </Link>

        <div className={`nav-links${menuOpen ? ' open' : ''}`} style={styles.links}>
          <Link to="/instrumentaux" style={{ ...styles.link, ...(isActive('/instrumentaux') ? styles.linkActive : {}) }} onClick={() => setMenuOpen(false)}>
            {t('nav_instrumentals')}
          </Link>
          <Link to="/materiel" style={{ ...styles.link, ...(isActive('/materiel') ? styles.linkActive : {}) }} onClick={() => setMenuOpen(false)}>
            {t('nav_equipment')}
          </Link>
          <Link to="/instruments" style={{ ...styles.link, ...(isActive('/instruments') ? styles.linkActive : {}) }} onClick={() => setMenuOpen(false)}>
            {t('nav_instruments')}
          </Link>

          {/* Toggles dans le menu mobile */}
          <div className="nav-mobile-toggles" style={styles.mobileToggles}>
            <div style={styles.toggleGroup}>
              {['fr', 'en'].map(l => (
                <button key={l} style={{ ...styles.toggleBtn, ...(lang === l ? styles.toggleActive : {}) }} onClick={() => changeLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={styles.toggleGroup}>
              {[{ code: 'EUR', label: '€' }, { code: 'USD', label: '$' }, { code: 'XOF', label: 'CFA' }].map(c => (
                <button key={c.code} style={{ ...styles.toggleBtn, ...(currency === c.code ? styles.toggleActive : {}) }} onClick={() => changeCurrency(c.code)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          {/* Language toggle — desktop uniquement */}
          <div className="nav-desktop-toggles" style={styles.toggleGroup}>
            {['fr', 'en'].map(l => (
              <button key={l} style={{ ...styles.toggleBtn, ...(lang === l ? styles.toggleActive : {}) }} onClick={() => changeLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Currency selector — desktop uniquement */}
          <div className="nav-desktop-toggles" style={styles.toggleGroup}>
            {[{ code: 'EUR', label: '€' }, { code: 'USD', label: '$' }, { code: 'XOF', label: 'CFA' }].map(c => (
              <button key={c.code} style={{ ...styles.toggleBtn, ...(currency === c.code ? styles.toggleActive : {}) }} onClick={() => changeCurrency(c.code)}>
                {c.label}
              </button>
            ))}
          </div>

          {user && (
            <Tooltip content={unreadMsg > 0 ? `${t('nav_messages')} (${unreadMsg})` : t('nav_messages')} side="bottom">
              <Link to="/messages" style={styles.iconBtn}>
                <ChatBubbleIcon width={18} height={18} />
                {unreadMsg > 0 && <span style={styles.cartBadge}>{unreadMsg}</span>}
              </Link>
            </Tooltip>
          )}

          <Tooltip content={cartCount > 0 ? `${t('nav_cart')} (${cartCount})` : t('nav_cart')} side="bottom">
            <Link to="/panier" style={styles.iconBtn}>
              🛒
              {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
            </Link>
          </Tooltip>

          {user ? (
            <div style={styles.userMenu}>
              <button style={styles.userBtn} onClick={() => setDropOpen(!dropOpen)}>
                <span style={styles.avatar}>{user.name[0].toUpperCase()}</span>
                <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                <ChevronDownIcon width={13} height={13} style={{ opacity: 0.7 }} />
              </button>

              {dropOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropHeader}>
                    <span style={styles.dropName}>{user.name}</span>
                    <span style={{
                      ...styles.roleBadge,
                      background: user.role === 'admin' ? 'rgba(239,68,68,0.15)' : user.role === 'seller' ? 'rgba(8,145,178,0.15)' : 'rgba(124,58,237,0.15)',
                      color: user.role === 'admin' ? '#f87171' : user.role === 'seller' ? '#38bdf8' : '#e8ca55'
                    }}>
                      {user.role === 'admin' ? '🛡️ Admin' : user.role === 'seller' ? t('nav_role_seller') : t('nav_role_buyer')}
                    </span>
                  </div>
                  <div style={styles.dropDivider} />

                  <Link to="/profil" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <PersonIcon width={14} height={14} /> {t('nav_profile')}
                  </Link>
                  <Link to="/commandes" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <DashboardIcon width={14} height={14} /> {t('nav_orders')}
                  </Link>
                  <Link to="/messages" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                    <ChatBubbleIcon width={14} height={14} /> {t('nav_messages')}
                    {unreadMsg > 0 && <span style={styles.dropBadge}>{unreadMsg}</span>}
                  </Link>

                  {(user.role === 'seller' || user.role === 'admin') && (
                    <>
                      <div style={styles.dropDivider} />
                      <Link to="/vendeur" style={{ ...styles.dropItem, color: '#38bdf8' }} onClick={() => setDropOpen(false)}>
                        <GearIcon width={14} height={14} /> {t('nav_seller_dash')}
                      </Link>
                      <Link to="/vendeur/ajouter" style={styles.dropItem} onClick={() => setDropOpen(false)}>
                        <PlusIcon width={14} height={14} /> {t('nav_add_product')}
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <div style={styles.dropDivider} />
                      <Link to="/admin" style={{ ...styles.dropItem, color: '#f87171' }} onClick={() => setDropOpen(false)}>
                        🛡️ {t('nav_admin_panel')}
                      </Link>
                    </>
                  )}

                  <div style={styles.dropDivider} />
                  <button style={{ ...styles.dropItem, ...styles.dropLogout }} onClick={handleLogout}>
                    <ExitIcon width={14} height={14} /> {t('nav_logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/connexion" className="btn btn-outline btn-sm">{t('nav_login')}</Link>
              <Link to="/inscription" className="btn btn-primary btn-sm">{t('nav_register')}</Link>
            </div>
          )}

          <button className="nav-toggle" style={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <Cross2Icon width={16} height={16} />
              : <HamburgerMenuIcon width={16} height={16} />}
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(8, 8, 15, 0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #3d2020',
    height: '70px',
  },
  inner: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: '100%', gap: '1rem',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 },
  logoIcon: { fontSize: '1.5rem', color: '#ddba3c' },
  logoText: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#faeee0' },
  logoAccent: { color: '#ddba3c' },
  links: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  link: {
    padding: '0.4rem 0.8rem', borderRadius: '8px', color: '#c9a4ac',
    fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s', textDecoration: 'none',
  },
  linkActive: { color: '#faeee0', background: 'rgba(221, 186, 60, 0.15)' },
  actions: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
  iconBtn: {
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid #3d2020',
    textDecoration: 'none', color: '#c9a4ac', transition: 'all 0.2s', fontSize: '1.1rem',
  },
  cartBadge: {
    position: 'absolute', top: '-6px', right: '-6px',
    background: '#ddba3c', color: 'white', borderRadius: '50%',
    width: '18px', height: '18px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700,
  },
  userMenu: { position: 'relative' },
  userBtn: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.35rem 0.7rem',
    background: 'rgba(221, 186, 60, 0.1)', border: '1px solid rgba(221, 186, 60, 0.3)',
    borderRadius: '10px', color: '#faeee0', cursor: 'pointer', transition: 'all 0.2s',
  },
  avatar: {
    width: '26px', height: '26px', borderRadius: '50%', background: '#ddba3c',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.8rem', fontWeight: 700, color: 'white',
  },
  userName: {
    fontSize: '0.85rem', fontWeight: 500,
    maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#251414', border: '1px solid #3d2020', borderRadius: '12px',
    minWidth: '200px', padding: '0.5rem',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200,
  },
  dropItem: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    width: '100%', padding: '0.55rem 0.8rem', borderRadius: '8px',
    color: '#c9a4ac', fontSize: '0.875rem', textDecoration: 'none',
    background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
  },
  dropDivider: { height: '1px', background: '#3d2020', margin: '0.4rem 0' },
  dropLogout: { color: '#ef4444' },
  dropHeader: { padding: '0.5rem 0.8rem 0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  dropName: { color: '#faeee0', fontSize: '0.875rem', fontWeight: 600 },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.55rem',
    borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, width: 'fit-content',
  },
  dropBadge: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: '#ddba3c', color: 'white', borderRadius: '100px',
    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.45rem', marginLeft: 'auto',
  },
  mobileToggles: {
    display: 'none',
  },
  toggleGroup: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.04)', border: '1px solid #3d2020',
    borderRadius: '8px', overflow: 'hidden',
  },
  toggleBtn: {
    padding: '0.3rem 0.55rem', background: 'none', border: 'none',
    color: '#7d5560', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
    transition: 'all 0.15s', letterSpacing: '0.03em',
  },
  toggleActive: { background: 'rgba(221,186,60,0.18)', color: '#ddba3c' },
  authBtns: { display: 'flex', gap: '0.5rem' },
  menuToggle: {
    display: 'none', background: 'none', border: '1px solid #3d2020',
    borderRadius: '8px', color: '#faeee0', cursor: 'pointer', padding: '0.4rem 0.6rem',
    alignItems: 'center', justifyContent: 'center',
  },
}
