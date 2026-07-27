import { useState, useEffect } from 'react'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { TrashIcon, CheckIcon, Cross2Icon, EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons'
import { Tooltip } from '../components/Tooltip'

const tabs = ['users', 'products', 'orders', 'annonces']

export default function AdminDashboard() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/users'),
      api.get('/products/admin/all'),
      api.get('/orders/admin/all'),
      api.get('/announcements/admin/all'),
    ]).then(([u, p, o, an]) => {
      setUsers(u.data)
      setProducts(p.data)
      setOrders(o.data)
      setAnnouncements(an.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleAnnouncement = async (annId, currentApproved) => {
    try {
      const { data } = await api.put(`/announcements/admin/${annId}/approve`, { approved: !currentApproved })
      setAnnouncements(prev => prev.map(a => a._id === annId ? { ...a, approved: data.approved } : a))
      toast.success(data.approved ? 'Annonce publiée' : 'Annonce dépubliée')
    } catch { toast.error('Erreur') }
  }

  const adminDeleteAnn = async (annId) => {
    if (!window.confirm('Supprimer cette annonce ?')) return
    try {
      await api.delete(`/announcements/admin/${annId}`)
      setAnnouncements(prev => prev.filter(a => a._id !== annId))
      toast.success('Annonce supprimée')
    } catch { toast.error('Erreur') }
  }

  const toggleApproval = async (productId) => {
    try {
      const { data } = await api.patch(`/products/${productId}/approve`)
      setProducts(prev => prev.map(p => p._id === productId ? { ...p, isApproved: data.isApproved } : p))
      toast.success('Statut mis a jour')
    } catch { toast.error('Erreur') }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o))
      toast.success('Statut mis a jour')
    } catch { toast.error('Erreur') }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success('Utilisateur supprime')
    } catch { toast.error('Erreur') }
  }

  if (loading) return <Spinner />

  const revenue = orders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0)

  return (
    <div className="page">
      <div className="container">
        <h1 style={styles.title}>Panneau d'administration</h1>

        {/* Stats */}
        <div className="grid-stats-4">
          {[
            { icon: '👥', label: 'Utilisateurs', value: users.length, color: '#ddba3c' },
            { icon: '📦', label: 'Produits', value: products.length, color: '#0891b2' },
            { icon: '🛒', label: 'Commandes', value: orders.length, color: '#f59e0b' },
            { icon: '💰', label: 'CA Total', value: `${revenue.toFixed(0)} €`, color: '#10b981' }
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
          {tabs.map(t => {
            const pending = t === 'annonces' ? announcements.filter(a => !a.approved).length : 0
            return (
              <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
                {t === 'users' ? '👥 Utilisateurs' : t === 'products' ? '📦 Produits' : t === 'orders' ? '🛒 Commandes' : '📢 Annonces'}
                {pending > 0 && <span style={styles.pendingBadge}>{pending}</span>}
              </button>
            )
          })}
        </div>

        {/* Users tab */}
        {tab === 'users' && (
          <div className="table-scroll">
            <div style={styles.table}>
              <div style={{ ...styles.tableHeader, gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                <span>Nom</span><span>Email</span><span>Role</span><span>Inscrit</span><span>Actions</span>
              </div>
              {users.map(u => (
                <div key={u._id} style={{ ...styles.tableRow, gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <span style={styles.avatar}>{u.name[0]}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{u.name}</span>
                  </div>
                  <span style={{ color: '#c9a4ac', fontSize: '0.8rem' }}>{u.email}</span>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: u.role === 'admin' ? '#ddba3c22' : u.role === 'seller' ? '#0891b222' : '#3d202022',
                    color: u.role === 'admin' ? '#e8ca55' : u.role === 'seller' ? '#38bdf8' : '#c9a4ac'
                  }}>{u.role}</span>
                  <span style={{ color: '#7d5560', fontSize: '0.75rem' }}>
                    {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                  <Tooltip content="Supprimer l'utilisateur" side="left">
                    <button className="btn btn-danger btn-sm" style={{ gap: '0.35rem' }} onClick={() => deleteUser(u._id)}>
                      <TrashIcon width={13} height={13} /> Suppr.
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div className="table-scroll">
            <div style={styles.table}>
              <div style={{ ...styles.tableHeader, gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr' }}>
                <span>Produit</span><span>Vendeur</span><span>Cat.</span><span>Prix</span><span>Statut</span><span>Action</span>
              </div>
              {products.map(p => (
                <div key={p._id} style={{ ...styles.tableRow, gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ color: '#c9a4ac', fontSize: '0.8rem' }}>{p.seller?.name}</span>
                  <span style={{ color: '#c9a4ac', fontSize: '0.8rem' }}>{p.category}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.price.toFixed(2)} €</span>
                  <span style={{ color: p.isApproved ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                    {p.isApproved ? '✓ Publie' : '✗ Cache'}
                  </span>
                  <Tooltip content={p.isApproved ? 'Masquer le produit' : 'Publier le produit'} side="left">
                    <button className="btn btn-outline btn-sm" style={{ gap: '0.35rem' }} onClick={() => toggleApproval(p._id)}>
                      {p.isApproved
                        ? <><EyeNoneIcon width={13} height={13} /> Cacher</>
                        : <><EyeOpenIcon width={13} height={13} /> Publier</>}
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Annonces tab */}
        {tab === 'annonces' && (
          <div>
            <p style={{ color: '#c9a4ac', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Approuvez ou refusez les annonces des vendeurs. Seules les annonces approuvées apparaissent sur la page d'accueil.
            </p>
            {announcements.length === 0 ? (
              <div className="empty-state"><div className="icon">📢</div><h3>Aucune annonce soumise</h3></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {announcements.map(a => (
                  <div key={a._id} style={styles.annCard}>
                    {a.image && (
                      <div style={{ width: '90px', height: '60px', borderRadius: '8px', flexShrink: 0, backgroundImage: `url(${a.image.startsWith('/uploads') ? 'http://localhost:5000' + a.image : a.image})`, backgroundSize: 'cover', backgroundPosition: 'center', background: '#1e1010' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.3rem' }}>
                        {a.badge && (
                          <span style={{ background: a.badgeColor + '22', color: a.badgeColor, border: `1px solid ${a.badgeColor}55`, borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem', textTransform: 'uppercase' }}>
                            {a.badge}
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem', borderRadius: '100px', ...(a.approved ? { background: 'rgba(16,185,129,0.15)', color: '#10b981' } : { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }) }}>
                          {a.approved ? '✓ En ligne' : '⏳ En attente'}
                        </span>
                        <span style={{ color: '#7d5560', fontSize: '0.75rem' }}>par {a.seller?.sellerInfo?.storeName || a.seller?.name}</span>
                      </div>
                      <p style={{ color: '#faeee0', fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</p>
                      {a.subtitle && <p style={{ color: '#7d5560', fontSize: '0.8rem' }}>{a.subtitle}</p>}
                      {a.link && <p style={{ color: '#e8ca55', fontSize: '0.75rem', marginTop: '0.2rem' }}>→ {a.link}</p>}
                      <p style={{ color: '#7d5560', fontSize: '0.7rem', marginTop: '0.2rem' }}>
                        Soumise le {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <Tooltip content={a.approved ? "Dépublier l'annonce" : "Approuver l'annonce"} side="left">
                        <button
                          className={`btn btn-sm ${a.approved ? 'btn-outline' : 'btn-primary'}`}
                          style={{ gap: '0.35rem' }}
                          onClick={() => toggleAnnouncement(a._id, a.approved)}
                        >
                          {a.approved
                            ? <><EyeNoneIcon width={13} height={13} /> Dépublier</>
                            : <><CheckIcon width={13} height={13} /> Approuver</>}
                        </button>
                      </Tooltip>
                      <Tooltip content="Supprimer l'annonce" side="left">
                        <button className="btn btn-danger btn-sm" style={{ gap: '0.35rem' }} onClick={() => adminDeleteAnn(a._id)}>
                          <TrashIcon width={13} height={13} /> Suppr.
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="table-scroll">
            <div style={styles.table}>
              <div style={{ ...styles.tableHeader, gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1fr' }}>
                <span>ID</span><span>Acheteur</span><span>Total</span><span>Paye</span><span>Statut</span><span>Changer</span>
              </div>
              {orders.map(o => (
                <div key={o._id} style={{ ...styles.tableRow, gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr 1fr' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#c9a4ac' }}>#{o._id.slice(-8).toUpperCase()}</span>
                  <span style={{ fontSize: '0.85rem' }}>{o.buyer?.name}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.totalPrice.toFixed(2)} €</span>
                  <span style={{ color: o.isPaid ? '#10b981' : '#ef4444', fontSize: '0.8rem' }}>{o.isPaid ? '✓' : '✗'}</span>
                  <span style={{ fontSize: '0.8rem', color: '#c9a4ac' }}>{o.status}</span>
                  <select
                    style={{ background: '#1e1010', border: '1px solid #3d2020', borderRadius: '6px', color: '#faeee0', fontSize: '0.75rem', padding: '0.25rem' }}
                    value={o.status}
                    onChange={e => updateOrderStatus(o._id, e.target.value)}
                  >
                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
  statCard: {
    background: '#251414', border: '1px solid #3d2020', borderRadius: '14px',
    padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center',
  },
  statIcon: { width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
  statVal: { fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" },
  statLabel: { color: '#7d5560', fontSize: '0.75rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #3d2020', paddingBottom: '0.5rem' },
  tab: { background: 'none', border: 'none', color: '#c9a4ac', fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px' },
  tabActive: { background: 'rgba(124,58,237,0.15)', color: '#e8ca55' },
  table: { background: '#251414', border: '1px solid #3d2020', borderRadius: '14px', overflow: 'hidden' },
  tableHeader: {
    display: 'grid', padding: '0.75rem 1rem', background: '#1e1010',
    borderBottom: '1px solid #3d2020', fontSize: '0.72rem', fontWeight: 700,
    color: '#7d5560', textTransform: 'uppercase', gap: '1rem',
  },
  tableRow: {
    display: 'grid', padding: '0.85rem 1rem', borderBottom: '1px solid #251414',
    alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#faeee0',
  },
  avatar: {
    width: '28px', height: '28px', borderRadius: '50%', background: '#ddba3c',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
    fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
  },
  pendingBadge: {
    background: '#ef4444',
    color: 'white',
    borderRadius: '100px',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.1rem 0.45rem',
    marginLeft: '0.35rem',
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
}
