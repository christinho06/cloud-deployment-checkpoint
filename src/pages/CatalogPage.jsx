import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import ProductCard from '../components/ProductCard'
import Spinner from '../components/Spinner'

const categoryConfig = {
  instrumental: {
    title: 'Instrumentaux',
    desc: 'Beats professionnels — Trap, Afro, R&B, Drill, Pop et plus',
    emoji: '🎵',
    subcategories: ['Trap', 'Afrobeats', 'R&B', 'Drill', 'Pop', 'Jazz', 'Dancehall'],
    color: '#ddba3c',
  },
  equipment: {
    title: 'Materiel audio',
    desc: 'Cartes son, microphones, enceintes et casques de studio',
    emoji: '🎙️',
    subcategories: ['Carte son', 'Microphone', 'Enceinte', 'Casque', 'Cable', 'Accessoire'],
    color: '#0891b2',
  },
  instrument: {
    title: 'Instruments de musique',
    desc: 'Guitares, claviers, batteries, controleurs MIDI et plus',
    emoji: '🎸',
    subcategories: ['Guitare', 'Clavier', 'Batterie', 'Controleur MIDI', 'Basse', 'Cuivres'],
    color: '#059669',
  },
}

export default function CatalogPage({ category }) {
  const config = categoryConfig[category]
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  const search = searchParams.get('search') || ''
  const subcategory = searchParams.get('sub') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page')) || 1

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val)
    else p.delete(key)
    if (key !== 'page') p.delete('page')
    setSearchParams(p)
  }

  useEffect(() => {
    setLoading(true)
    const params = { category, page, sort }
    if (search) params.search = search
    if (subcategory) params.subcategory = subcategory
    api.get('/products', { params })
      .then(r => {
        setProducts(r.data.products)
        setTotal(r.data.total)
        setPages(r.data.pages)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category, search, subcategory, sort, page])

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={styles.header}>
          <div style={{ ...styles.headerIcon, background: config.color + '22', color: config.color }}>
            {config.emoji}
          </div>
          <div>
            <h1 style={styles.title}>{config.title}</h1>
            <p style={styles.sub}>{config.desc}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <div style={styles.searchWrap}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.searchInput}
              placeholder={`Rechercher ${config.title.toLowerCase()}...`}
              defaultValue={search}
              onKeyDown={e => e.key === 'Enter' && updateParam('search', e.target.value)}
              onChange={e => !e.target.value && updateParam('search', '')}
            />
          </div>

          <div style={styles.filterRow}>
            <div style={styles.subcatList}>
              <button
                style={{ ...styles.subcatBtn, ...(subcategory === '' ? styles.subcatActive : {}) }}
                onClick={() => updateParam('sub', '')}
              >
                Tous
              </button>
              {config.subcategories.map(s => (
                <button
                  key={s}
                  style={{ ...styles.subcatBtn, ...(subcategory === s ? styles.subcatActive : {}) }}
                  onClick={() => updateParam('sub', s === subcategory ? '' : s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <select
              style={styles.sortSelect}
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
            >
              <option value="newest">Plus recents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix decroissant</option>
              <option value="rating">Mieux notes</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div style={styles.resultsBar}>
          <span style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>
            {total} produit{total !== 1 ? 's' : ''} trouve{total !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{config.emoji}</div>
            <h3>Aucun produit trouve</h3>
            <p>Essayez d'autres filtres ou termes de recherche</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
                onClick={() => updateParam('page', String(p))}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
  },
  headerIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    flexShrink: 0,
  },
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.3rem' },
  sub: { color: '#c9a4ac', fontSize: '0.9rem' },
  filters: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  searchWrap: {
    position: 'relative',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.85rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.65rem 1rem 0.65rem 2.5rem',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    color: '#faeee0',
    fontSize: '0.875rem',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  subcatList: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  subcatBtn: {
    padding: '0.3rem 0.75rem',
    borderRadius: '100px',
    background: 'transparent',
    border: '1px solid #3d2020',
    color: '#c9a4ac',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  subcatActive: {
    background: 'rgba(124,58,237,0.2)',
    borderColor: 'rgba(124,58,237,0.5)',
    color: '#e8ca55',
  },
  sortSelect: {
    padding: '0.4rem 0.75rem',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '8px',
    color: '#c9a4ac',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  resultsBar: { marginBottom: '1rem' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '2.5rem',
  },
  pageBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid #3d2020',
    color: '#c9a4ac',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  pageBtnActive: {
    background: '#ddba3c',
    borderColor: '#ddba3c',
    color: 'white',
  },
}
