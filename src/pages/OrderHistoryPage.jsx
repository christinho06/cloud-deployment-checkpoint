import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { Cross2Icon } from '@radix-ui/react-icons'

const statusColors = {
  pending: { color: '#f59e0b', label: 'En attente' },
  processing: { color: '#3b82f6', label: 'En traitement' },
  shipped: { color: '#8b5cf6', label: 'Expedie' },
  delivered: { color: '#10b981', label: 'Livre' },
  cancelled: { color: '#ef4444', label: 'Annule' }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    api.get('/orders/myorders')
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId) => {
    if (!window.confirm('Annuler cette commande ? Cette action est irreversible.')) return
    setCancelling(orderId)
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`)
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o))
      toast.success('Commande annulee avec succes')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="page">
      <div className="container">
        <h1 style={styles.title}>Mes commandes</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <h3>Aucune commande</h3>
            <p>Vous n'avez pas encore passe de commande</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Commencer les achats</Link>
          </div>
        ) : (
          <div style={styles.list}>
            {orders.map(order => {
              const st = statusColors[order.status] || statusColors.pending
              return (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <div>
                      <span style={styles.orderId}>Commande #{order._id.slice(-8).toUpperCase()}</span>
                      <span style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div style={styles.orderRight}>
                      <span style={{ ...styles.statusBadge, color: st.color, borderColor: st.color + '44', background: st.color + '15' }}>
                        {st.label}
                      </span>
                      <span style={styles.orderTotal}>{order.totalPrice.toFixed(2)} €</span>
                    </div>
                  </div>

                  <div style={styles.itemsList}>
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} style={styles.orderItem}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=50&fit=crop'}
                          alt={item.name}
                          style={styles.itemImage}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=50&fit=crop' }}
                        />
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemQty}>× {item.quantity}</span>
                        <span style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p style={{ color: '#7d5560', fontSize: '0.8rem' }}>+{order.items.length - 3} autre(s) article(s)</p>
                    )}
                  </div>

                  {['pending', 'processing'].includes(order.status) && (
                    <div style={styles.cancelRow}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                        style={styles.cancelBtn}
                      >
                        {cancelling === order._id
                          ? 'Annulation...'
                          : <><Cross2Icon width={13} height={13} /> Annuler la commande</>}
                      </button>
                      <span style={styles.cancelHint}>
                        Annulation possible uniquement avant expedition
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  orderCard: { background: '#251414', border: '1px solid #3d2020', borderRadius: '14px', padding: '1.25rem' },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  orderId: { display: 'block', fontWeight: 700, color: '#faeee0', marginBottom: '0.2rem', fontSize: '0.9rem', fontFamily: 'monospace' },
  orderDate: { color: '#7d5560', fontSize: '0.8rem' },
  orderRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' },
  statusBadge: {
    padding: '0.2rem 0.65rem',
    borderRadius: '100px',
    fontSize: '0.72rem',
    fontWeight: 700,
    border: '1px solid',
  },
  orderTotal: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.1rem' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    background: '#1e1010',
    borderRadius: '8px',
  },
  itemImage: { width: '44px', height: '36px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 },
  itemName: { flex: 1, color: '#faeee0', fontSize: '0.85rem', fontWeight: 500 },
  itemQty: { color: '#7d5560', fontSize: '0.8rem' },
  itemPrice: { color: '#c9a4ac', fontSize: '0.85rem', fontWeight: 600 },
  cancelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #2e1616',
    flexWrap: 'wrap',
  },
  cancelBtn: { flexShrink: 0 },
  cancelHint: { color: '#7d5560', fontSize: '0.75rem' },
}
