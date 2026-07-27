import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'

const BACKEND = 'http://localhost:5000'

const resolveImage = (img) => {
  if (!img) return null
  if (img.startsWith('/uploads')) return `${BACKEND}${img}`
  return img
}

export default function PromoCarousel({ announcements }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const total = announcements.length

  const goTo = (idx) => {
    setCurrent((idx + total) % total)
    resetTimer()
  }

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total)
    }, 5000)
  }

  useEffect(() => {
    if (total < 2) return
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [total])

  if (total === 0) return null

  const ann = announcements[current]
  const imgSrc = resolveImage(ann.image)
  const storeName = ann.seller?.sellerInfo?.storeName || ann.seller?.name || 'Vendeur'

  return (
    <section style={styles.section}>
      <div className="container">
        <div style={styles.header}>
          <h2 className="section-title" style={{ margin: 0 }}>Annonces & Promotions</h2>
          <span style={styles.countBadge}>{total} offre{total > 1 ? 's' : ''}</span>
        </div>

        <div style={styles.carousel}>
          {/* Slide */}
          <div
            style={{
              ...styles.slide,
              backgroundImage: imgSrc
                ? `linear-gradient(135deg, rgba(8,8,15,0.82) 0%, rgba(8,8,15,0.5) 60%, rgba(8,8,15,0.1) 100%), url(${imgSrc})`
                : `linear-gradient(135deg, #1e1010 0%, #2e1a1a 50%, #1e1010 100%)`,
            }}
          >
            {/* Badge promo */}
            {ann.badge && (
              <span style={{ ...styles.badge, background: ann.badgeColor + '33', color: ann.badgeColor, borderColor: ann.badgeColor + '55' }}>
                {ann.badge}
              </span>
            )}

            {/* Contenu */}
            <div style={styles.content}>
              <p style={styles.seller}>🏪 {storeName}</p>
              <h3 style={styles.title}>{ann.title}</h3>
              {ann.subtitle && <p style={styles.subtitle}>{ann.subtitle}</p>}
              {ann.link && (
                <Link
                  to={ann.link.startsWith('http') ? ann.link : ann.link}
                  className="btn btn-primary"
                  style={styles.cta}
                  {...(ann.link.startsWith('http') ? { as: 'a', target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {ann.cta || "Voir l'offre"} →
                </Link>
              )}
            </div>

            {/* Décoration visuelle */}
            <div style={styles.glow} />
          </div>

          {/* Navigation prev/next */}
          {total > 1 && (
            <>
              <button style={{ ...styles.navBtn, left: '1rem' }} onClick={() => goTo(current - 1)}>
                <ChevronLeftIcon width={20} height={20} />
              </button>
              <button style={{ ...styles.navBtn, right: '1rem' }} onClick={() => goTo(current + 1)}>
                <ChevronRightIcon width={20} height={20} />
              </button>
            </>
          )}

          {/* Indicateurs */}
          {total > 1 && (
            <div style={styles.dots}>
              {announcements.map((_, i) => (
                <button
                  key={i}
                  style={{ ...styles.dot, ...(i === current ? styles.dotActive : {}) }}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Miniatures des autres slides */}
        {total > 1 && (
          <div style={styles.thumbRow}>
            {announcements.map((a, i) => {
              const thumb = resolveImage(a.image)
              return (
                <button
                  key={a._id}
                  style={{
                    ...styles.thumb,
                    ...(i === current ? styles.thumbActive : {}),
                    backgroundImage: thumb ? `url(${thumb})` : undefined,
                    background: thumb ? undefined : '#2e1a1a',
                  }}
                  onClick={() => goTo(i)}
                  title={a.title}
                >
                  {!thumb && <span style={{ fontSize: '1.2rem' }}>📢</span>}
                  <div style={styles.thumbOverlay}>
                    <p style={styles.thumbTitle}>{a.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

const styles = {
  section: {
    padding: '0 0 3rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  countBadge: {
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#e8ca55',
    borderRadius: '100px',
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.15rem 0.7rem',
    letterSpacing: '0.03em',
  },
  carousel: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid #3d2020',
    marginBottom: '0.85rem',
  },
  slide: {
    minHeight: '300px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '2.5rem',
    position: 'relative',
    transition: 'background-image 0.5s ease',
  },
  glow: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  badge: {
    position: 'absolute',
    top: '1.5rem',
    left: '1.5rem',
    border: '1px solid',
    borderRadius: '100px',
    fontSize: '0.72rem',
    fontWeight: 800,
    padding: '0.3rem 0.9rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    backdropFilter: 'blur(6px)',
  },
  content: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '580px',
  },
  seller: {
    color: '#e8ca55',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: 'clamp(1.3rem, 3vw, 2rem)',
    fontWeight: 800,
    color: '#faeee0',
    lineHeight: 1.2,
    marginBottom: '0.6rem',
    fontFamily: "'Space Grotesk', sans-serif",
  },
  subtitle: {
    color: '#c9a4ac',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    marginBottom: '1.25rem',
    maxWidth: '460px',
  },
  cta: {
    display: 'inline-flex',
  },
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(8,8,15,0.7)',
    border: '1px solid #3d2020',
    color: '#faeee0',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    fontSize: '1.4rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'background 0.2s',
    backdropFilter: 'blur(4px)',
  },
  dots: {
    position: 'absolute',
    bottom: '1rem',
    right: '1.5rem',
    display: 'flex',
    gap: '0.4rem',
    zIndex: 10,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s',
  },
  dotActive: {
    background: '#ddba3c',
    width: '22px',
    borderRadius: '4px',
  },
  thumbRow: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
  },
  thumb: {
    flexShrink: 0,
    width: '140px',
    height: '80px',
    borderRadius: '10px',
    border: '2px solid #3d2020',
    cursor: 'pointer',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'border-color 0.2s',
    padding: 0,
  },
  thumbActive: {
    borderColor: '#ddba3c',
    boxShadow: '0 0 0 2px rgba(124,58,237,0.3)',
  },
  thumbOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0.4rem 0.5rem',
  },
  thumbTitle: {
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 600,
    lineHeight: 1.2,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
}
