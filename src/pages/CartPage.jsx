import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()

  const shippingPrice = cartItems.some(i => !i.isDigital) && cartTotal < 50 ? 5.99 : 0
  const total = cartTotal + shippingPrice

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>{t('cart_empty_title')}</h3>
            <p>{t('cart_empty_sub')}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              {t('cart_explore')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div style={styles.header}>
          <h1 style={styles.title}>{t('cart_title')}</h1>
          <button className="btn btn-ghost btn-sm" onClick={clearCart}>{t('cart_clear')}</button>
        </div>

        <div className="grid-cart">
          <div style={styles.itemsCol}>
            {cartItems.map(item => (
              <div key={item._id} style={styles.item}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=80&fit=crop'}
                  alt={item.name}
                  style={styles.itemImage}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=80&fit=crop' }}
                />
                <div style={styles.itemInfo}>
                  <Link to={`/produit/${item._id}`} style={styles.itemName}>{item.name}</Link>
                  {item.isDigital && <span style={styles.digitalBadge}>📥 Digital</span>}
                  {item.subcategory && <span style={styles.itemSubcat}>{item.subcategory}</span>}
                </div>
                <div style={styles.itemControls}>
                  {item.isDigital ? (
                    <span style={styles.digitalQty}>x1</span>
                  ) : (
                    <div style={styles.qtyControl}>
                      <button style={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty - 1)}>−</button>
                      <span style={styles.qtyVal}>{item.qty}</span>
                      <button style={styles.qtyBtn} onClick={() => updateQty(item._id, item.qty + 1)}>+</button>
                    </div>
                  )}
                  <span style={styles.itemPrice}>{formatPrice(item.price * item.qty)}</span>
                  <button style={styles.removeBtn} onClick={() => removeFromCart(item._id)}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summaryCol}>
            <div style={styles.summary}>
              <h2 style={styles.summaryTitle}>{t('cart_summary')}</h2>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>{t('cart_subtotal')}</span>
                <span style={styles.summaryVal}>{formatPrice(cartTotal)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>{t('cart_shipping')}</span>
                <span style={styles.summaryVal}>
                  {shippingPrice === 0
                    ? <span style={{ color: '#10b981' }}>{t('cart_free')}</span>
                    : formatPrice(shippingPrice)}
                </span>
              </div>
              {shippingPrice > 0 && (
                <p style={styles.freeShippingHint}>
                  {t('cart_add')} {formatPrice(50 - cartTotal)} {t('cart_free_hint')}
                </p>
              )}
              <div style={styles.summaryDivider} />
              <div style={{ ...styles.summaryRow, marginBottom: '1.25rem' }}>
                <span style={{ ...styles.summaryLabel, fontWeight: 700, color: '#faeee0' }}>{t('cart_total')}</span>
                <span style={styles.totalVal}>{formatPrice(total)}</span>
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => user ? navigate('/paiement') : navigate('/connexion?redirect=/paiement')}
              >
                {user ? t('cart_checkout') : t('cart_login_checkout')}
              </button>
              <Link to="/" style={styles.continueShopping}>{t('cart_continue')}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: 700 },
  itemsCol: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  item: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '14px',
    padding: '1rem',
  },
  itemImage: { width: '80px', height: '65px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    color: '#faeee0',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  digitalBadge: {
    fontSize: '0.7rem',
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  itemSubcat: { fontSize: '0.75rem', color: '#7d5560', marginLeft: '0.35rem' },
  itemControls: { display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#1e1010',
    border: '1px solid #3d2020',
    color: '#faeee0',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: { fontWeight: 600, minWidth: '20px', textAlign: 'center', fontSize: '0.9rem' },
  digitalQty: { color: '#c9a4ac', fontSize: '0.875rem' },
  itemPrice: { fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", minWidth: '70px', textAlign: 'right' },
  removeBtn: { background: 'none', border: 'none', color: '#7d5560', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem' },
  summaryCol: {},
  summary: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
    padding: '1.5rem',
    position: 'sticky',
    top: '90px',
  },
  summaryTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' },
  summaryLabel: { color: '#c9a4ac', fontSize: '0.9rem' },
  summaryVal: { color: '#faeee0', fontWeight: 500, fontSize: '0.9rem' },
  freeShippingHint: { fontSize: '0.75rem', color: '#f59e0b', marginTop: '-0.25rem', marginBottom: '0.5rem' },
  summaryDivider: { height: '1px', background: '#3d2020', margin: '1rem 0' },
  totalVal: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#faeee0' },
  continueShopping: {
    display: 'block',
    textAlign: 'center',
    marginTop: '1rem',
    color: '#c9a4ac',
    fontSize: '0.8rem',
    textDecoration: 'none',
  },
}
