import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import { useCurrency } from '../context/CurrencyContext'
import AudioPlayer from './AudioPlayer'
import { PlayIcon, StopIcon, DownloadIcon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons'
import { Tooltip } from './Tooltip'

const Stars = ({ rating }) => (
  <div className="stars" style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      s <= Math.round(rating)
        ? <StarFilledIcon key={s} width={13} height={13} style={{ color: '#f59e0b' }} />
        : <StarIcon key={s} width={13} height={13} style={{ color: '#3d2020' }} />
    ))}
  </div>
)

const categoryLabel = {
  instrumental: { label: 'Instrumental', color: '#ddba3c' },
  equipment: { label: 'Materiel', color: '#0891b2' },
  instrument: { label: 'Instrument', color: '#059669' }
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const cat = categoryLabel[product.category] || categoryLabel.instrument
  const [showPlayer, setShowPlayer] = useState(false)
  const hasAudio = Boolean(product.audioPreview)
  const isInstrumental = product.category === 'instrumental'

  const handlePlayClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasAudio) setShowPlayer(v => !v)
  }

  return (
    <div style={styles.card}>
      {/* Image avec overlay play pour les instrumentaux */}
      <div className="card-img-wrap">
        <Link to={`/produit/${product._id}`}>
          <img
            src={product.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'}
            alt={product.name}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop' }}
          />
        </Link>

        {isInstrumental && (
          <div className="play-overlay">
            <Tooltip
              content={hasAudio
                ? (showPlayer ? t('card_close_player') : t('card_listen'))
                : t('card_no_preview')}
              side="top"
            >
              <button
                className={`play-circle ${hasAudio ? 'has-audio' : 'no-audio'}`}
                onClick={handlePlayClick}
              >
                {showPlayer
                  ? <StopIcon width={18} height={18} style={{ color: 'white' }} />
                  : <PlayIcon width={18} height={18} style={{ color: 'white', marginLeft: '2px' }} />}
              </button>
            </Tooltip>
            {hasAudio
              ? <span className="play-label">{showPlayer ? t('card_close_player') : t('card_listen')}</span>
              : <span className="no-audio-label">{t('card_no_preview')}</span>
            }
          </div>
        )}

        {product.isDigital && (
          <span style={styles.digitalBadge}>
            <DownloadIcon width={11} height={11} /> Digital
          </span>
        )}
        {product.isFeatured && <span style={styles.featuredBadge}>⭐ Vedette</span>}
      </div>

      {/* Lecteur audio inline */}
      {showPlayer && hasAudio && (
        <div style={{ padding: '0.5rem 0.5rem 0.25rem' }}>
          <AudioPlayer src={product.audioPreview} title={product.name} compact />
        </div>
      )}

      {/* Infos produit */}
      <div style={styles.body}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <span style={{ ...styles.catBadge, background: cat.color + '22', color: cat.color }}>
            {cat.label}
          </span>
          {product.subcategory && <span style={styles.subcat}>{product.subcategory}</span>}
        </div>

        <Link to={`/produit/${product._id}`} style={{ textDecoration: 'none' }}>
          <h3 style={styles.name}>{product.name}</h3>
        </Link>

        {isInstrumental && (product.bpm || product.genre) && (
          <div style={styles.beatInfo}>
            {product.genre && <span>{product.genre}</span>}
            {product.genre && product.bpm && <span>•</span>}
            {product.bpm && <span>{product.bpm} BPM</span>}
            {product.musicalKey && <><span>•</span><span>{product.musicalKey}</span></>}
          </div>
        )}

        {product.brand && <p style={styles.brand}>{product.brand}</p>}

        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Stars rating={product.rating} />
            <span style={styles.reviewCount}>({product.numReviews})</span>
          </div>
        )}

        <div style={styles.footer}>
          <div>
            <span style={styles.price}>{formatPrice(product.price)}</span>
            {isInstrumental && product.license && (
              <span style={styles.licenseTag}>{product.license}</span>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(product)}
            disabled={!product.isDigital && product.stock === 0}
          >
            {product.stock === 0 && !product.isDigital ? t('card_out_of_stock') : t('card_add_cart')}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  digitalBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    background: 'rgba(8,8,15,0.85)',
    color: '#10b981',
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontWeight: 600,
    zIndex: 2,
  },
  featuredBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(245,158,11,0.9)',
    color: '#111',
    fontSize: '0.65rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontWeight: 700,
    zIndex: 2,
  },
  body: {
    padding: '0.85rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  catBadge: {
    fontSize: '0.65rem', fontWeight: 700,
    padding: '0.15rem 0.5rem', borderRadius: '100px',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  subcat: { fontSize: '0.7rem', color: '#7d5560' },
  name: {
    fontSize: '0.9rem', fontWeight: 600, color: '#faeee0', lineHeight: 1.3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  beatInfo: { display: 'flex', gap: '0.4rem', fontSize: '0.72rem', color: '#7d5560', flexWrap: 'wrap' },
  brand: { fontSize: '0.75rem', color: '#ddba3c', fontWeight: 500 },
  reviewCount: { fontSize: '0.72rem', color: '#7d5560' },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #2e1616',
  },
  price: {
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
    fontSize: '1.05rem', color: '#faeee0', display: 'block',
  },
  licenseTag: { fontSize: '0.65rem', color: '#c9a4ac', display: 'block' },
}
