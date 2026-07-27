import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [msgLoading, setMsgLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [sellers, setSellers] = useState([])
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const inputRef = useRef(null)

  // Charger les conversations
  useEffect(() => {
    api.get('/messages')
      .then(r => setConversations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Démarrer depuis page produit (?seller=X&product=Y)
  useEffect(() => {
    const sellerId = searchParams.get('seller')
    const productId = searchParams.get('product')
    if (!sellerId) return
    api.post('/messages/start', { sellerId, productId })
      .then(r => {
        setConversations(prev => {
          const exists = prev.find(c => c._id === r.data._id)
          return exists ? prev : [r.data, ...prev]
        })
        setActiveId(r.data._id)
      })
      .catch(console.error)
  }, [searchParams])

  // Charger les messages de la conversation active
  useEffect(() => {
    if (!activeId) return
    setMsgLoading(true)
    setMessages([])
    api.get(`/messages/${activeId}`)
      .then(r => {
        setMessages(r.data)
        setConversations(prev => prev.map(c =>
          c._id === activeId ? { ...c, unreadBy: [] } : c
        ))
      })
      .catch(console.error)
      .finally(() => setMsgLoading(false))

    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      api.get(`/messages/${activeId}`)
        .then(r => setMessages(r.data))
        .catch(() => {})
    }, 5000)

    return () => clearInterval(pollRef.current)
  }, [activeId])

  // Scroll bas automatique
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input quand conversation ouverte
  useEffect(() => {
    if (activeId) setTimeout(() => inputRef.current?.focus(), 100)
  }, [activeId])

  const openNewPanel = () => {
    setShowNew(true)
    if (sellers.length === 0) {
      api.get('/messages/sellers').then(r => setSellers(r.data)).catch(console.error)
    }
  }

  const startWith = async (sellerId) => {
    setShowNew(false)
    try {
      const { data } = await api.post('/messages/start', { sellerId })
      setConversations(prev => {
        const exists = prev.find(c => c._id === data._id)
        return exists ? prev : [data, ...prev]
      })
      setActiveId(data._id)
    } catch {
      toast.error('Impossible de démarrer la conversation')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    setSending(true)
    const content = text.trim()
    setText('')
    try {
      const { data } = await api.post(`/messages/${activeId}`, { content })
      setMessages(prev => [...prev, data])
      setConversations(prev => prev.map(c =>
        c._id === activeId ? { ...c, lastMessage: content, lastMessageAt: new Date() } : c
      ))
    } catch {
      toast.error('Erreur envoi message')
      setText(content)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  const getOther = (conv) =>
    conv.participants?.find(p => p._id !== user._id) || {}

  const activeConv = conversations.find(c => c._id === activeId)

  if (loading) return <Spinner />

  return (
    <div className="page" style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={styles.title}>💬 Messagerie</h1>

        <div style={styles.layout}>

          {/* ── Sidebar ── */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <span style={styles.sidebarTitle}>Conversations</span>
              <button style={styles.newBtn} onClick={openNewPanel} title="Nouvelle conversation">
                +
              </button>
            </div>

            {/* Panel nouvelle conversation */}
            {showNew && (
              <div style={styles.newPanel}>
                <div style={styles.newPanelHeader}>
                  <span style={{ color: '#faeee0', fontSize: '0.85rem', fontWeight: 600 }}>Contacter...</span>
                  <button style={styles.closePanelBtn} onClick={() => setShowNew(false)}>✕</button>
                </div>

                {sellers.length === 0 ? (
                  <div style={{ padding: '1rem', color: '#7d5560', fontSize: '0.8rem' }}>Chargement...</div>
                ) : (
                  sellers.map(s => (
                    <button key={s._id} style={styles.sellerItem} onClick={() => startWith(s._id)}>
                      <div style={{ ...styles.convAvatar, background: s.role === 'admin' ? '#ef4444' : '#ddba3c' }}>
                        {s.name[0].toUpperCase()}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ color: '#faeee0', fontSize: '0.85rem', fontWeight: 600 }}>
                          {s.sellerInfo?.storeName || s.name}
                        </p>
                        <p style={{ color: '#7d5560', fontSize: '0.72rem' }}>
                          {s.role === 'admin' ? '🛡️ Service Client' : '🎵 Vendeur'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Liste conversations */}
            {conversations.length === 0 && !showNew ? (
              <div style={styles.emptyConv}>
                <p style={{ fontSize: '2rem' }}>💬</p>
                <p style={{ color: '#7d5560', fontSize: '0.8rem', textAlign: 'center', lineHeight: 1.5 }}>
                  Aucune conversation.<br />
                  Cliquez sur <strong style={{ color: '#e8ca55' }}>+</strong> pour contacter un vendeur.
                </p>
                <button className="btn btn-primary btn-sm" onClick={openNewPanel} style={{ marginTop: '0.75rem' }}>
                  + Nouvelle conversation
                </button>
              </div>
            ) : (
              conversations.map(conv => {
                const other = getOther(conv)
                const isUnread = conv.unreadBy?.some(id => id === user._id || id?._id === user._id)
                const isActive = conv._id === activeId
                return (
                  <button
                    key={conv._id}
                    style={{ ...styles.convItem, ...(isActive ? styles.convItemActive : {}) }}
                    onClick={() => { setActiveId(conv._id); setShowNew(false) }}
                  >
                    <div style={styles.convAvatar}>{other.name?.[0]?.toUpperCase() || '?'}</div>
                    <div style={styles.convInfo}>
                      <div style={styles.convTop}>
                        <span style={{ ...styles.convName, ...(isUnread ? { color: '#faeee0', fontWeight: 700 } : {}) }}>
                          {other.sellerInfo?.storeName || other.name || 'Utilisateur'}
                        </span>
                        {isUnread && <span style={styles.unreadDot} />}
                      </div>
                      {conv.product && (
                        <span style={styles.convProduct}>📦 {conv.product.name}</span>
                      )}
                      <span style={styles.convLast}>{conv.lastMessage || 'Nouvelle conversation'}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* ── Panel chat ── */}
          <div style={styles.chatPanel}>
            {!activeId ? (
              <div style={styles.noChatSelected}>
                <p style={{ fontSize: '3rem' }}>💬</p>
                <p style={{ color: '#c9a4ac', marginTop: '1rem', fontSize: '0.9rem' }}>
                  Selectionnez une conversation ou cliquez sur <strong style={{ color: '#e8ca55' }}>+</strong> pour en démarrer une.
                </p>
                <button className="btn btn-primary" onClick={openNewPanel} style={{ marginTop: '1.5rem' }}>
                  + Nouvelle conversation
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={styles.chatHeader}>
                  {activeConv && (() => {
                    const other = getOther(activeConv)
                    return (
                      <div style={styles.chatHeaderInfo}>
                        <div style={styles.chatAvatar}>{other.name?.[0]?.toUpperCase() || '?'}</div>
                        <div>
                          <p style={styles.chatName}>{other.sellerInfo?.storeName || other.name}</p>
                          {activeConv.product ? (
                            <Link to={`/produit/${activeConv.product._id}`} style={styles.chatProduct}>
                              📦 {activeConv.product.name}
                            </Link>
                          ) : (
                            <span style={{ color: '#7d5560', fontSize: '0.75rem' }}>
                              {other.role === 'admin' ? '🛡️ Service Client' : '🎵 Vendeur'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Messages */}
                <div style={styles.messagesArea}>
                  {msgLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                      <Spinner />
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={styles.noMessages}>
                      <p style={{ fontSize: '1.5rem' }}>👋</p>
                      <p style={{ color: '#7d5560', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Commencez la conversation !
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMine = msg.sender._id === user._id
                      return (
                        <div key={msg._id} style={{ ...styles.msgRow, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                          {!isMine && (
                            <div style={styles.msgAvatar}>{msg.sender.name?.[0]?.toUpperCase()}</div>
                          )}
                          <div style={{ maxWidth: '65%' }}>
                            <div style={{ ...styles.bubble, ...(isMine ? styles.bubbleMine : styles.bubbleOther) }}>
                              {msg.content}
                            </div>
                            <p style={{ ...styles.msgTime, textAlign: isMine ? 'right' : 'left' }}>
                              {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {isMine && <span style={{ marginLeft: '0.35rem', color: msg.read ? '#ddba3c' : '#7d5560' }}>{msg.read ? '✓✓' : '✓'}</span>}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Zone de saisie */}
                <form onSubmit={handleSend} style={styles.inputArea}>
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrivez votre message... (Entrée pour envoyer)"
                    style={styles.msgInput}
                    rows={1}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !text.trim()}
                    style={styles.sendBtn}
                  >
                    ➤
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    height: 'calc(100vh - 210px)',
    minHeight: '520px',
    background: '#251414',
    border: '1px solid #3d2020',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '1px solid #3d2020',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    position: 'relative',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.85rem 1rem',
    borderBottom: '1px solid #3d2020',
    background: '#1e1010',
    flexShrink: 0,
  },
  sidebarTitle: { fontWeight: 700, fontSize: '0.875rem', color: '#faeee0' },
  newBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: '#ddba3c',
    border: 'none',
    color: 'white',
    fontSize: '1.3rem',
    lineHeight: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  newPanel: {
    background: '#1e1010',
    borderBottom: '1px solid #3d2020',
    flexShrink: 0,
  },
  newPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 1rem',
    borderBottom: '1px solid #251414',
  },
  closePanelBtn: {
    background: 'none',
    border: 'none',
    color: '#7d5560',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  sellerItem: {
    display: 'flex',
    gap: '0.65rem',
    alignItems: 'center',
    width: '100%',
    padding: '0.7rem 1rem',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #251414',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  emptyConv: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    gap: '0.5rem',
  },
  convItem: {
    display: 'flex',
    gap: '0.7rem',
    padding: '0.8rem 1rem',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #251414',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.15s',
  },
  convItemActive: { background: 'rgba(124,58,237,0.14)' },
  convAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: '#ddba3c', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
  },
  convInfo: { flex: 1, minWidth: 0 },
  convTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.1rem' },
  convName: { color: '#c9a4ac', fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unreadDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#ddba3c', flexShrink: 0 },
  convProduct: { display: 'block', color: '#ddba3c', fontSize: '0.7rem', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  convLast: { display: 'block', color: '#7d5560', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chatPanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noChatSelected: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', color: '#7d5560',
  },
  chatHeader: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #3d2020',
    background: '#1e1010',
    flexShrink: 0,
  },
  chatHeaderInfo: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  chatAvatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: '#ddba3c', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
  },
  chatName: { color: '#faeee0', fontWeight: 600, fontSize: '0.875rem' },
  chatProduct: { color: '#ddba3c', fontSize: '0.72rem', textDecoration: 'none' },
  messagesArea: {
    flex: 1, overflowY: 'auto',
    padding: '1.25rem',
    display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  noMessages: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  msgRow: { display: 'flex', gap: '0.5rem', alignItems: 'flex-end' },
  msgAvatar: {
    width: '26px', height: '26px', borderRadius: '50%',
    background: '#3d2020', color: '#c9a4ac',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
  },
  bubble: {
    padding: '0.6rem 0.9rem', borderRadius: '14px',
    fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word',
  },
  bubbleMine: { background: '#ddba3c', color: 'white', borderBottomRightRadius: '4px' },
  bubbleOther: { background: '#2e1616', color: '#faeee0', borderBottomLeftRadius: '4px' },
  msgTime: { color: '#7d5560', fontSize: '0.65rem', marginTop: '0.2rem' },
  inputArea: {
    display: 'flex', gap: '0.75rem',
    padding: '0.85rem 1.25rem',
    borderTop: '1px solid #3d2020',
    background: '#1e1010',
    flexShrink: 0, alignItems: 'flex-end',
  },
  msgInput: {
    flex: 1,
    background: '#251414',
    border: '1px solid #512828',
    borderRadius: '12px',
    color: '#faeee0',
    padding: '0.7rem 1rem',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    minHeight: '42px',
    maxHeight: '120px',
    fontFamily: 'Inter, sans-serif',
  },
  sendBtn: { flexShrink: 0, fontSize: '1.1rem', padding: '0.65rem 1.1rem', alignSelf: 'flex-end' },
}
