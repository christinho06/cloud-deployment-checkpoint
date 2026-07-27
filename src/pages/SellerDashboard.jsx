import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Pencil2Icon, TrashIcon, PlusIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import { Tooltip } from '../components/Tooltip'

const statusColors = {
  pending: '#f59e0b', processing: '#3b82f6',
  shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444'
}

const emptyAnn = { title: '', subtitle: '', image: '', link: '', badge: '', badgeColor: '#f59e0b', cta: "Voir l'offre" }

export default function SellerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')

  // Annonces
  const [announcements, setAnnouncements] = useState([])
  const [annForm, setAnnForm] = useState(emptyAnn)
  const [editingAnn, setEditingAnn] = useState(null)
  const [annSaving, setAnnSaving] = useState(false)
  const [showAnnForm, setShowAnnForm] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/products/seller/myproducts'),
      api.get('/orders/seller'),
      api.get('/announcements/my'),
    ]).then(([pr, or, an]) => {
      setProducts(pr.data)
      setOrders(or.data)
      setAnnouncements(an.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openNewAnn = () => {
    setEditingAnn(null)
    setAnnForm(emptyAnn)
    setShowAnnForm(true)
  }

  const openEditAnn = (a) => {
    setEditingAnn(a._id)
    setAnnForm({
      title: a.title, subtitle: a.subtitle || '', image: a.image || '',
      link: a.link || '', badge: a.badge || '',
      badgeColor: a.badgeColor || '#f59e0b', cta: a.cta || "Voir l'offre",
    })
    setShowAnnForm(true)
  }

  const saveAnn = async () => {
    if (!annForm.title.trim()) { toast.error('Le titre est requis'); return }
    setAnnSaving(true)
    try {
      if (editingAnn) {
        const { data } = await api.put(`/announcements/${editingAnn}`, annForm)
        setAnnouncements(prev => prev.map(a => a._id === editingAnn ? data : a))
        toast.success('Annonce modifiée — en attente d\'approbation')
      } else {
        const { data } = await api.post('/announcements', annForm)
        setAnnouncements(prev => [data, ...prev])
        toast.success('Annonce créée — en attente d\'approbation')
      }
      setShowAnnForm(false)
      setAnnForm(emptyAnn)
      setEditingAnn(null)
    } catch { toast.error('Erreur lors de l\'enregistrement') }
    finally { setAnnSaving(false) }
  }

  const deleteAnn = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return
    try {
      await api.delete(`/announcements/${id}`)
      setAnnouncements(prev => prev.filter(a => a._id !== id))
      toast.success('Annonce supprimée')
    } catch { toast.error('Erreur') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Produit supprime')
    } catch (err) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const totalRevenue = orders
    .filter(o => o.isPaid)
    .reduce((acc, o) => {
      return acc + o.items
        .filter(i => i.seller?.toString() === user._id || i.seller === user._id)
        .reduce((s, i) => s + i.price * i.quantity, 0)
    }, 0)

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Vendeur</h1>
            <p style={styles.storeName}>{user?.sellerInfo?.storeName || user?.name}</p>
          </div>
          <Link to="/vendeur/ajouter" className="btn btn-primary">+ Nouveau produit</Link>
        </div>

        {/* Stats */}
        <div className="grid-stats-4">
          {[
            { icon: '📦', label: 'Produits', value: products.length, color: '#ddba3c' },
            { icon: '🛒', label: 'Commandes', value: orders.length, color: '#0891b2' },
            { icon: '💰', label: 'Revenus', value: `${totalRevenue.toFixed(2)} €`, color: '#10b981' },
            { icon: '⭐', label: 'Avis', value: products.reduce((a, p) => a + p.numReviews, 0), color: '#f59e0b' }
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: stat.color + '22', color: stat.color }}>{stat.icon}</div>
              <div>
                <p style={styles.statVal}>{stat.value}</p>
                <p style={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'products', label: '📦 Mes produits' },
            { key: 'orders', label: '🛒 Mes commandes' },
            { key: 'annonces', label: '📢 Mes annonces' },
          ].map(t => (
            <button
              key={t.key}
              style={{ ...styles.tab, ...(tab === t.key ? styles.tabActive : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === 'annonces' && announcements.length > 0 && (
                <span style={styles.tabBadge}>{announcements.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <h3>Aucun produit</h3>
                <p>Ajoutez votre premier produit pour commencer a vendre</p>
                <Link to="/vendeur/ajouter" className="btn btn-primary" style={{ marginTop: '1rem' }}>Ajouter un produit</Link>
              </div>
            ) : (
              <div className="table-scroll">
                <div style={styles.table}>
                  <div style={styles.tableHeader}>
                    <span>Produit</span>
                    <span>Categorie</span>
                    <span>Prix</span>
                    <span>Stock</span>
                    <span>Note</span>
                    <span>Actions</span>
                  </div>
                  {products.map(p => (
                    <div key={p._id} style={styles.tableRow}>
                      <div style={styles.productCell}>
                        <img
                          src={p.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=50&fit=crop'}
                          alt={p.name}
                          style={styles.productThumb}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=50&fit=crop' }}
                        />
                        <span style={styles.productName}>{p.name}</span>
                      </div>
                      <span style={{ color: '#c9a4ac', fontSize: '0.8rem' }}>{p.category}</span>
                      <span style={{ fontWeight: 600 }}>{p.price.toFixed(2)} €</span>
                      <span style={{ color: p.stock > 0 || p.isDigital ? '#10b981' : '#ef4444', fontSize: '0.85rem' }}>
                        {p.isDigital ? '∞' : p.stock}
                      </span>
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem' }}>
                        {p.rating > 0 ? `★ ${p.rating.toFixed(1)}` : '-'}
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Tooltip content="Modifier le produit" side="top">
                          <Link to={`/vendeur/modifier/${p._id}`} className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }}>
                            <Pencil2Icon width={13} height={13} /> Modifier
                          </Link>
                        </Tooltip>
                        <Tooltip content="Supprimer le produit" side="top">
                          <button className="btn btn-danger btn-sm" style={{ gap: '0.35rem' }} onClick={() => handleDelete(p._id)}>
                            <TrashIcon width={13} height={13} /> Suppr.
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🛒</div>
                <h3>Aucune commande</h3>
              </div>
            ) : (
              <div className="table-scroll">
                <div style={styles.table}>
                  <div style={styles.tableHeader}>
                    <span>ID Commande</span>
                    <span>Acheteur</span>
                    <span>Date</span>
                    <span>Montant</span>
                    <span>Statut</span>
                  </div>
                  {orders.map(o => (
                    <div key={o._id} style={styles.tableRow}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c9a4ac' }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.875rem' }}>{o.buyer?.name || '-'}</span>
                      <span style={{ color: '#c9a4ac', fontSize: '0.8rem' }}>
                        {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span style={{ fontWeight: 600 }}>{o.totalPrice.toFixed(2)} €</span>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: (statusColors[o.status] || '#f59e0b') + '22',
                        color: statusColors[o.status] || '#f59e0b'
                      }}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'annonces' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#c9a4ac', fontSize: '0.875rem' }}>
                Créez des annonces/promos qui apparaissent en carousel sur la page d'accueil après approbation.
              </p>
              <button className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }} onClick={openNewAnn}>
                <PlusIcon width={14} height={14} /> Nouvelle annonce
              </button>
            </div>

            {/* Formulaire */}
            {showAnnForm && (
              <div style={styles.annForm}>
                <h3 style={{ color: '#faeee0', fontSize: '1rem', marginBottom: '1.25rem' }}>
                  {editingAnn ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
                </h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Titre *</label>
                    <input value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: -30% sur tous les beats ce weekend !" />
                  </div>
                  <div className="form-group">
                    <label>Badge (ex: PROMO, NEW, HOT)</label>
                    <input value={annForm.badge} onChange={e => setAnnForm(p => ({ ...p, badge: e.target.value }))} placeholder="PROMO" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sous-titre / Description courte</label>
                  <input value={annForm.subtitle} onChange={e => setAnnForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Ex: Beats Trap & Afro en promotion jusqu'au dimanche" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Image de fond (URL)</label>
                    <input value={annForm.image} onChange={e => setAnnForm(p => ({ ...p, image: e.target.value }))} placeholder="https://... ou /uploads/images/..." />
                  </div>
                  <div className="form-group">
                    <label>Lien du bouton (ex: /instrumentaux)</label>
                    <input value={annForm.link} onChange={e => setAnnForm(p => ({ ...p, link: e.target.value }))} placeholder="/instrumentaux ou /produit/ID" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Texte du bouton</label>
                    <input value={annForm.cta} onChange={e => setAnnForm(p => ({ ...p, cta: e.target.value }))} placeholder="Voir l'offre" />
                  </div>
                  <div className="form-group">
                    <label>Couleur du badge</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="color" value={annForm.badgeColor} onChange={e => setAnnForm(p => ({ ...p, badgeColor: e.target.value }))} style={{ width: '48px', height: '38px', padding: '2px', background: '#1e1010', border: '1px solid #3d2020', borderRadius: '8px', cursor: 'pointer' }} />
                      {['#f59e0b', '#ddba3c', '#10b981', '#ef4444', '#0891b2'].map(c => (
                        <button key={c} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: annForm.badgeColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} onClick={() => setAnnForm(p => ({ ...p, badgeColor: c }))} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAnnForm(false)}>Annuler</button>
                  <button className="btn btn-primary btn-sm" onClick={saveAnn} disabled={annSaving}>
                    {annSaving ? 'Enregistrement...' : (editingAnn ? 'Enregistrer' : 'Créer l\'annonce')}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des annonces */}
            {announcements.length === 0 && !showAnnForm ? (
              <div className="empty-state">
                <div className="icon">📢</div>
                <h3>Aucune annonce</h3>
                <p>Créez une promo pour la mettre en avant sur la page d'accueil</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openNewAnn}>Créer ma première annonce</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: showAnnForm ? '1.5rem' : 0 }}>
                {announcements.map(a => (
                  <div key={a._id} style={styles.annCard}>
                    {a.image && (
                      <div style={{ ...styles.annThumb, backgroundImage: `url(${a.image.startsWith('/uploads') ? 'http://localhost:5000' + a.image : a.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                        {a.badge && <span style={{ ...styles.annBadge, background: a.badgeColor + '22', color: a.badgeColor, borderColor: a.badgeColor + '55' }}>{a.badge}</span>}
                        <span style={{ ...styles.statusTag, ...(a.approved ? styles.statusApproved : styles.statusPending) }}>
                          {a.approved ? '✓ En ligne' : '⏳ En attente'}
                        </span>
                      </div>
                      <p style={{ color: '#faeee0', fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</p>
                      {a.subtitle && <p style={{ color: '#7d5560', fontSize: '0.8rem', marginTop: '0.2rem' }}>{a.subtitle}</p>}
                      {a.link && <p style={{ color: '#e8ca55', fontSize: '0.75rem', marginTop: '0.2rem' }}>→ {a.link}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <Tooltip content="Modifier l'annonce" side="top">
                        <button className="btn btn-outline btn-sm" onClick={() => openEditAnn(a)}>
                          <Pencil2Icon width={13} height={13} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Supprimer l'annonce" side="top">
                        <button className="btn btn-danger btn-sm" onClick={() => deleteAnn(a._id)}>
                          <TrashIcon width={13} height={13} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' },
  storeName: { color: '#ddba3c', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '14px',
    padding: '1.25rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
  statVal: { fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" },
  statLabel: { color: '#7d5560', fontSize: '0.75rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #3d2020', paddingBottom: '0.5rem' },
  tab: { background: 'none', border: 'none', color: '#c9a4ac', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px' },
  tabActive: { background: 'rgba(124,58,237,0.15)', color: '#e8ca55' },
  table: { background: '#251414', border: '1px solid #3d2020', borderRadius: '14px', overflow: 'hidden' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '0.75rem 1rem',
    background: '#1e1010',
    borderBottom: '1px solid #3d2020',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#7d5560',
    textTransform: 'uppercase',
    gap: '1rem',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #251414',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem',
    color: '#faeee0',
  },
  productCell: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  productThumb: { width: '44px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
  productName: { fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tabBadge: {
    background: '#ddba3c',
    color: 'white',
    borderRadius: '100px',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.1rem 0.45rem',
    marginLeft: '0.35rem',
  },
  annForm: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '14px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  annCard: {
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  annThumb: {
    width: '80px',
    height: '56px',
    borderRadius: '8px',
    flexShrink: 0,
    background: '#1e1010',
  },
  annBadge: {
    border: '1px solid',
    borderRadius: '100px',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.1rem 0.55rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  statusTag: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '0.15rem 0.55rem',
    borderRadius: '100px',
  },
  statusApproved: { background: 'rgba(16,185,129,0.15)', color: '#10b981' },
  statusPending: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
}
