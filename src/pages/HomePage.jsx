import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'
import PromoCarousel from '../components/PromoCarousel'

const CategoryCard = ({ to, emoji, title, desc, color }) => (
  <Link to={to} style={{ ...styles.catCard, borderColor: color + '44' }}>
    <div style={{ ...styles.catIcon, background: color + '22', color }}>{emoji}</div>
    <h3 style={styles.catTitle}>{title}</h3>
    <p style={styles.catDesc}>{desc}</p>
    <span style={{ ...styles.catArrow, color }}>Explorer →</span>
  </Link>
)

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products/featured'),
      api.get('/announcements'),
    ]).then(([pr, an]) => {
      setFeatured(pr.data)
      setAnnouncements(an.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div className="container grid-hero">
          <div style={styles.heroContent}>
            <span style={styles.heroBadge}>♪ GostMood Creative Lab</span>
            <h1 style={styles.heroTitle}>
              Achetez & vendez<br />
              <span style={styles.heroGradient}>la musique de demain</span>
            </h1>
            <p style={styles.heroSub}>
              Instrumentaux professionnels, materiel audio haut de gamme et instruments de musique.
              Rejoignez des milliers d'artistes et vendeurs.
            </p>
            <div style={styles.heroBtns}>
              <Link to="/instrumentaux" className="btn btn-primary btn-lg">Explorer les beats</Link>
              <Link to="/inscription?role=seller" className="btn btn-outline btn-lg">Devenir vendeur</Link>
            </div>
            <div style={styles.heroStats}>
              <div style={styles.stat}><strong>2 000+</strong><span>Produits</span></div>
              <div style={styles.statDiv} />
              <div style={styles.stat}><strong>500+</strong><span>Vendeurs</span></div>
              <div style={styles.statDiv} />
              <div style={styles.stat}><strong>10K+</strong><span>Clients</span></div>
            </div>
          </div>
          <div style={styles.heroVisual}>
            <div style={styles.visualGlow} />
            <div style={styles.visualCard}>
              <div style={styles.waveRow}>
                {[40, 70, 55, 90, 65, 80, 45, 75, 60, 85, 50, 70].map((h, i) => (
                  <div key={i} style={{ ...styles.bar, height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
              <p style={styles.visualLabel}>♪ Beat en cours...</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Explorez nos categories</h2>
          <p className="section-subtitle">Tout ce dont vous avez besoin pour votre musique</p>
          <div className="grid-categories">
            <CategoryCard
              to="/instrumentaux"
              emoji="🎵"
              title="Instrumentaux"
              desc="Beats Trap, Afro, R&B, Drill — achetez votre licence et enregistrez"
              color="#ddba3c"
            />
            <CategoryCard
              to="/materiel"
              emoji="🎙️"
              title="Materiel audio"
              desc="Cartes son, microphones, enceintes de monitoring et casques pro"
              color="#0891b2"
            />
            <CategoryCard
              to="/instruments"
              emoji="🎸"
              title="Instruments"
              desc="Guitares, claviers, batteries, controleurs MIDI et plus"
              color="#059669"
            />
          </div>
        </div>
      </section>

      {/* Carousel annonces vendeurs */}
      {announcements.length > 0 && (
        <div className="container" style={{ paddingTop: '1rem' }}>
          <PromoCarousel announcements={announcements} />
        </div>
      )}

      {/* Featured products */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={styles.sectionHead}>
            <div>
              <h2 className="section-title">Produits en vedette</h2>
              <p className="section-subtitle">Selectionnes par notre equipe</p>
            </div>
          </div>
          {loading ? <Spinner /> : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA Vendeur */}
      <section style={styles.cta}>
        <div className="container grid-cta">
          <div>
            <h2 style={styles.ctaTitle}>Vous etes artiste ou revendeur ?</h2>
            <p style={styles.ctaSub}>Creez votre boutique gratuitement et commencez a vendre vos beats, materiel et instruments a des milliers d'acheteurs.</p>
          </div>
          <Link to="/inscription?role=seller" className="btn btn-accent btn-lg" style={{ flexShrink: 0 }}>
            Ouvrir ma boutique →
          </Link>
        </div>
      </section>
    </div>
  )
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #150b0b 0%, #1e1010 50%, #150b0b 100%)',
    borderBottom: '1px solid #3d2020',
    overflow: 'hidden',
    position: 'relative',
  },
  heroInner: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    alignItems: 'center',
    padding: '5rem 1.5rem',
  },
  heroContent: { zIndex: 1 },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(124,58,237,0.15)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#e8ca55',
    padding: '0.35rem 1rem',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    marginBottom: '1.25rem',
    color: '#faeee0',
  },
  heroGradient: {
    background: 'linear-gradient(90deg, #ddba3c, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '1.05rem',
    color: '#c9a4ac',
    lineHeight: 1.7,
    marginBottom: '2rem',
    maxWidth: '480px',
  },
  heroBtns: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
    '& strong': { fontSize: '1.4rem', fontWeight: 700, color: '#faeee0' },
    '& span': { fontSize: '0.75rem', color: '#7d5560' },
  },
  statDiv: {
    width: '1px',
    height: '30px',
    background: '#3d2020',
  },
  heroVisual: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  visualGlow: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
  },
  visualCard: {
    background: 'rgba(19,19,42,0.8)',
    border: '1px solid #3d2020',
    borderRadius: '20px',
    padding: '2rem',
    width: '280px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
  },
  waveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    height: '80px',
    marginBottom: '1rem',
  },
  bar: {
    flex: 1,
    background: 'linear-gradient(to top, #ddba3c, #f59e0b)',
    borderRadius: '3px',
    animation: 'wave 1.5s ease-in-out infinite alternate',
  },
  visualLabel: {
    color: '#c9a4ac',
    fontSize: '0.85rem',
    textAlign: 'center',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  catCard: {
    display: 'block',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
    padding: '1.75rem',
    textDecoration: 'none',
    transition: 'all 0.25s',
    cursor: 'pointer',
  },
  catIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  catTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#faeee0',
    marginBottom: '0.5rem',
  },
  catDesc: {
    fontSize: '0.85rem',
    color: '#c9a4ac',
    lineHeight: 1.5,
    marginBottom: '1rem',
  },
  catArrow: {
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '2rem',
  },
  cta: {
    background: 'linear-gradient(135deg, #1e1010, #251414)',
    borderTop: '1px solid #3d2020',
    borderBottom: '1px solid #3d2020',
    padding: '3rem 0',
  },
  ctaInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  ctaTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#faeee0',
    marginBottom: '0.5rem',
  },
  ctaSub: {
    color: '#c9a4ac',
    maxWidth: '500px',
    lineHeight: 1.6,
  },
}
