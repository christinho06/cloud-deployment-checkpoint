import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import AudioPlayer from '../components/AudioPlayer'
import toast from 'react-hot-toast'
import { StarFilledIcon, StarIcon, ChatBubbleIcon } from '@radix-ui/react-icons'

const Stars = ({ rating, interactive, onRate }) => (
  <div style={{ display: 'flex', gap: '3px', cursor: interactive ? 'pointer' : 'default' }}>
    {[1, 2, 3, 4, 5].map(s => (
      s <= Math.round(rating)
        ? <StarFilledIcon key={s} width={interactive ? 22 : 14} height={interactive ? 22 : 14} style={{ color: '#f59e0b', transition: 'color 0.15s' }} onClick={() => interactive && onRate && onRate(s)} />
        : <StarIcon key={s} width={interactive ? 22 : 14} height={interactive ? 22 : 14} style={{ color: '#3d2020', transition: 'color 0.15s' }} onClick={() => interactive && onRate && onRate(s)} />
    ))}
  </div>
)

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    addToCart(product, qty)
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/connexion'); return }
    setSubmitting(true)
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment })
      toast.success('Avis publie !')
      const r = await api.get(`/products/${id}`)
      setProduct(r.data)
      setComment('')
      setRating(5)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />
  if (!product) return null

  const inStock = product.isDigital || product.stock > 0

  return (
    <div className="page">
      <div className="container">
        <div className="grid-detail">
          {/* Image */}
          <div style={styles.imageCol}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=450&fit=crop'}
              alt={product.name}
              style={styles.image}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=450&fit=crop' }}
            />
            {product.category === 'instrumental' && (
              <div style={styles.beatSpecs}>
                {product.genre && <span style={styles.spec}><strong>Genre:</strong> {product.genre}</span>}
                {product.bpm && <span style={styles.spec}><strong>BPM:</strong> {product.bpm}</span>}
                {product.musicalKey && <span style={styles.spec}><strong>Tonalite:</strong> {product.musicalKey}</span>}
                {product.license && <span style={styles.spec}><strong>Licence:</strong> {product.license}</span>}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={styles.detailCol}>
            <div style={styles.catRow}>
              <span style={styles.catTag}>{product.category}</span>
              {product.subcategory && <span style={styles.subcatTag}>{product.subcategory}</span>}
              {product.isDigital && <span style={styles.digitalTag}>📥 Telechargement</span>}
            </div>

            <h1 style={styles.name}>{product.name}</h1>

            {product.brand && <p style={styles.brand}>{product.brand}</p>}

            <div style={styles.ratingRow}>
              <Stars rating={product.rating} />
              <span style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>
                {product.rating > 0 ? `${product.rating.toFixed(1)} / 5` : ''} ({product.numReviews} avis)
              </span>
            </div>

            <p style={styles.price}>{product.price.toFixed(2)} €</p>

            {product.category === 'instrumental' && (
              product.audioPreview
                ? <AudioPlayer src={product.audioPreview} title={product.name} />
                : (
                  <div className="audio-placeholder">
                    <span className="audio-placeholder-icon">🎵</span>
                    <span>Aucun extrait audio disponible pour cet instrumental.</span>
                  </div>
                )
            )}

            <p style={styles.description}>{product.description}</p>

            {product.seller && (
              <div style={styles.sellerBox}>
                <span style={styles.sellerIcon}>🏪</span>
                <div>
                  <p style={styles.sellerLabel}>Vendu par</p>
                  <p style={styles.sellerName}>{product.seller.sellerInfo?.storeName || product.seller.name}</p>
                </div>
              </div>
            )}

            <div style={styles.stockRow}>
              {product.isDigital ? (
                <span style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Disponible immediatement</span>
              ) : (
                <span style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', fontSize: '0.875rem' }}>
                  {product.stock > 0 ? `✓ En stock (${product.stock})` : '✗ Rupture de stock'}
                </span>
              )}
            </div>

            {!product.isDigital && product.stock > 0 && (
              <div style={styles.qtyRow}>
                <label style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>Quantite</label>
                <div style={styles.qtyControl}>
                  <button style={styles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span style={styles.qtyVal}>{qty}</span>
                  <button style={styles.qtyBtn} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              {inStock ? '🛒 Ajouter au panier' : 'Rupture de stock'}
            </button>

            {product.seller && user && user._id !== product.seller._id && (
              <a
                href={`/messages?seller=${product.seller._id}&product=${product._id}`}
                className="btn btn-outline btn-lg"
                style={{ width: '100%', marginTop: '0.6rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ChatBubbleIcon width={16} height={16} /> Contacter le vendeur
              </a>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div style={styles.reviewsSection}>
          <h2 style={styles.reviewsTitle}>Avis clients ({product.numReviews})</h2>

          {product.reviews.length === 0 ? (
            <p style={{ color: '#c9a4ac' }}>Aucun avis pour le moment. Soyez le premier !</p>
          ) : (
            <div style={styles.reviewsList}>
              {product.reviews.map((r, i) => (
                <div key={i} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <span style={styles.reviewAvatar}>{r.name[0]}</span>
                    <div>
                      <strong style={{ color: '#faeee0', fontSize: '0.9rem' }}>{r.name}</strong>
                      <div style={styles.reviewMeta}>
                        <Stars rating={r.rating} />
                        <span style={{ color: '#7d5560', fontSize: '0.75rem' }}>
                          {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={styles.reviewText}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {user && (
            <form onSubmit={handleReview} style={styles.reviewForm}>
              <h3 style={{ color: '#faeee0', fontSize: '1rem', marginBottom: '1rem' }}>Laisser un avis</h3>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ color: '#c9a4ac', fontSize: '0.875rem', display: 'block', marginBottom: '0.4rem' }}>Note</label>
                <Stars rating={rating} interactive onRate={setRating} />
              </div>
              <div className="form-group">
                <label>Votre commentaire</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  placeholder="Partagez votre experience..."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Publication...' : 'Publier mon avis'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '3rem',
  },
  imageCol: {},
  image: {
    width: '100%',
    borderRadius: '16px',
    objectFit: 'cover',
    aspectRatio: '4/3',
    marginBottom: '1rem',
  },
  beatSpecs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(124,58,237,0.08)',
    borderRadius: '10px',
    border: '1px solid rgba(124,58,237,0.2)',
  },
  spec: {
    fontSize: '0.8rem',
    color: '#c9a4ac',
    padding: '0.25rem 0.6rem',
    background: '#251414',
    borderRadius: '6px',
  },
  detailCol: {},
  catRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
  catTag: {
    padding: '0.2rem 0.6rem',
    background: 'rgba(124,58,237,0.2)',
    color: '#e8ca55',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  subcatTag: {
    padding: '0.2rem 0.6rem',
    background: 'rgba(255,255,255,0.05)',
    color: '#c9a4ac',
    borderRadius: '6px',
    fontSize: '0.72rem',
  },
  digitalTag: {
    padding: '0.2rem 0.6rem',
    background: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  name: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 },
  brand: { color: '#ddba3c', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.5rem' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' },
  price: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '2rem',
    fontWeight: 800,
    color: '#faeee0',
    marginBottom: '1rem',
  },
  description: { color: '#c9a4ac', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.925rem' },
  sellerBox: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    background: '#1e1010',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    marginBottom: '1rem',
  },
  sellerIcon: { fontSize: '1.2rem' },
  sellerLabel: { color: '#7d5560', fontSize: '0.72rem' },
  sellerName: { color: '#faeee0', fontWeight: 600, fontSize: '0.875rem' },
  stockRow: { marginBottom: '1rem' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  qtyBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#251414',
    border: '1px solid #3d2020',
    color: '#faeee0',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: { fontWeight: 600, minWidth: '24px', textAlign: 'center' },
  reviewsSection: { borderTop: '1px solid #3d2020', paddingTop: '2rem' },
  reviewsTitle: { fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' },
  reviewCard: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '12px',
    padding: '1rem',
  },
  reviewHeader: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' },
  reviewAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: '#ddba3c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  reviewMeta: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' },
  reviewText: { color: '#c9a4ac', fontSize: '0.875rem', lineHeight: 1.6 },
  reviewForm: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
}
