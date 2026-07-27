import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const EUROPE = [
  'France', 'Belgique', 'Suisse', 'Luxembourg', 'Monaco',
  'Allemagne', 'Autriche', 'Pays-Bas', 'Espagne', 'Italie',
  'Portugal', 'Royaume-Uni', 'Irlande', 'Danemark', 'Suède',
  'Norvège', 'Finlande', 'Pologne', 'Roumanie', 'Grèce',
  'Hongrie', 'Tchéquie', 'Slovaquie', 'Croatie', 'Bulgarie',
  'Slovénie', 'Estonie', 'Lettonie', 'Lituanie', 'Chypre', 'Malte',
]

const AFRICA = [
  'Sénégal', 'Côte d\'Ivoire', 'Mali', 'Burkina Faso', 'Niger',
  'Guinée', 'Bénin', 'Togo', 'Cameroun', 'Gabon',
  'Congo-Brazzaville', 'République Démocratique du Congo', 'Madagascar',
  'Maroc', 'Algérie', 'Tunisie', 'Égypte', 'Libye',
  'Mauritanie', 'Djibouti', 'Comores', 'Cap-Vert',
  'Nigeria', 'Ghana', 'Kenya', 'Éthiopie', 'Tanzanie',
  'Ouganda', 'Rwanda', 'Mozambique', 'Zambie', 'Zimbabwe',
  'Afrique du Sud', 'Angola', 'Namibie', 'Botswana',
]

const OTHER = ['Canada', 'États-Unis', 'Brésil', 'Autre']

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  })
  const [paymentMethod, setPaymentMethod] = useState('Carte bancaire')

  const shippingPrice = cartItems.some(i => !i.isDigital) && cartTotal < 50 ? 5.99 : 0
  const total = cartTotal + shippingPrice

  const steps = [t('checkout_step_shipping'), t('checkout_step_payment'), t('checkout_step_confirm')]

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const items = cartItems.map(i => ({
        product: i._id,
        name: i.name,
        image: i.image || '',
        price: i.price,
        quantity: i.qty,
        isDigital: i.isDigital || false,
        seller: i.seller?._id || i.seller
      }))
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: shipping,
        paymentMethod
      })
      await api.put(`/orders/${data._id}/pay`)
      clearCart()
      toast.success('Commande passée avec succès !')
      navigate('/commandes')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={styles.title}>{t('checkout_title')}</h1>

        <div style={styles.stepper}>
          {steps.map((s, i) => (
            <div key={s} style={styles.stepItem}>
              <div style={{ ...styles.stepCircle, ...(i <= step ? styles.stepActive : {}) }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ ...styles.stepLabel, ...(i === step ? { color: '#faeee0' } : {}) }}>{s}</span>
              {i < steps.length - 1 && <div style={{ ...styles.stepLine, ...(i < step ? styles.stepLineFull : {}) }} />}
            </div>
          ))}
        </div>

        <div className="grid-checkout">
          <div style={styles.formCol}>
            {step === 0 && (
              <div>
                <h2 style={styles.sectionTitle}>{t('checkout_shipping_title')}</h2>
                {cartItems.every(i => i.isDigital) && (
                  <div className="alert alert-success">{t('checkout_all_digital')}</div>
                )}
                <div className="form-group">
                  <label>{t('checkout_full_name')}</label>
                  <input value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{t('checkout_address')}</label>
                  <input value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} placeholder="123 rue de la Musique" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('checkout_city')}</label>
                    <input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} placeholder="Paris" />
                  </div>
                  <div className="form-group">
                    <label>{t('checkout_postal')}</label>
                    <input value={shipping.postalCode} onChange={e => setShipping({ ...shipping, postalCode: e.target.value })} placeholder="75000" />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('checkout_country')}</label>
                  <select value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })}>
                    <optgroup label="Europe">
                      {EUROPE.map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Afrique">
                      {AFRICA.map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Autres">
                      {OTHER.map(c => <option key={c}>{c}</option>)}
                    </optgroup>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => setStep(1)}>{t('checkout_continue')}</button>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={styles.sectionTitle}>{t('checkout_payment_title')}</h2>
                {['Carte bancaire', 'PayPal', 'Virement'].map(method => (
                  <label key={method} style={styles.payOption}>
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{ accentColor: '#ddba3c' }}
                    />
                    <span>{method === 'Carte bancaire' ? '💳' : method === 'PayPal' ? '🅿️' : '🏦'}</span>
                    <span>{method}</span>
                  </label>
                ))}
                <p style={{ color: '#c9a4ac', fontSize: '0.8rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
                  {t('checkout_sim_note')}
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(0)}>{t('checkout_back')}</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>{t('checkout_review_btn')}</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={styles.sectionTitle}>{t('checkout_review_title')}</h2>
                <div style={styles.reviewBlock}>
                  <h4 style={styles.reviewBlockTitle}>{t('checkout_step_shipping')}</h4>
                  <p style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>
                    {shipping.name}, {shipping.address}, {shipping.city} {shipping.postalCode}, {shipping.country}
                  </p>
                </div>
                <div style={styles.reviewBlock}>
                  <h4 style={styles.reviewBlockTitle}>{t('checkout_step_payment')}</h4>
                  <p style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>{paymentMethod}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>{t('checkout_back')}</button>
                  <button className="btn btn-accent btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? t('checkout_processing') : `${t('checkout_confirm_pay')} ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.summaryCol}>
            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>{t('checkout_your_order')}</h3>
              {cartItems.map(item => (
                <div key={item._id} style={styles.summaryItem}>
                  <span style={{ color: '#c9a4ac', fontSize: '0.8rem', flex: 1 }}>
                    {item.name} × {item.qty}
                  </span>
                  <span style={{ color: '#faeee0', fontSize: '0.8rem', fontWeight: 600 }}>
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div style={styles.summaryDivider} />
              <div style={styles.summaryRow}>
                <span style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>{t('cart_shipping')}</span>
                <span style={{ fontSize: '0.875rem' }}>
                  {shippingPrice === 0 ? <span style={{ color: '#10b981' }}>{t('cart_free')}</span> : formatPrice(shippingPrice)}
                </span>
              </div>
              <div style={{ ...styles.summaryRow, marginTop: '0.5rem' }}>
                <strong>{t('cart_total')}</strong>
                <strong style={{ color: '#faeee0', fontSize: '1.1rem' }}>{formatPrice(total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' },
  stepper: { display: 'flex', alignItems: 'center', marginBottom: '2.5rem', position: 'relative' },
  stepItem: { display: 'flex', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#3d2020',
    color: '#7d5560',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
    zIndex: 1,
  },
  stepActive: { background: '#ddba3c', color: 'white' },
  stepLabel: { marginLeft: '0.5rem', fontSize: '0.8rem', color: '#7d5560', whiteSpace: 'nowrap' },
  stepLine: { flex: 1, height: '2px', background: '#3d2020', margin: '0 0.5rem' },
  stepLineFull: { background: '#ddba3c' },
  formCol: { background: '#251414', border: '1px solid #3d2020', borderRadius: '16px', padding: '1.75rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' },
  payOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    background: '#1e1010',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#faeee0',
  },
  reviewBlock: { padding: '0.75rem 1rem', background: '#1e1010', borderRadius: '8px', marginBottom: '0.75rem' },
  reviewBlockTitle: { color: '#ddba3c', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase' },
  summaryCol: {},
  summary: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '14px',
    padding: '1.25rem',
    position: 'sticky',
    top: '90px',
  },
  summaryTitle: { fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' },
  summaryItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  summaryDivider: { height: '1px', background: '#3d2020', margin: '0.75rem 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' },
}
