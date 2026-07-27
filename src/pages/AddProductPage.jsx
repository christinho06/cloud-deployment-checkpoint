import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const categories = {
  instrumental: {
    subcategories: ['Trap', 'Afrobeats', 'R&B', 'Drill', 'Pop', 'Jazz', 'Dancehall', 'Autre']
  },
  equipment: {
    subcategories: ['Carte son', 'Microphone', 'Enceinte', 'Casque', 'Cable', 'Accessoire']
  },
  instrument: {
    subcategories: ['Guitare', 'Clavier', 'Batterie', 'Controleur MIDI', 'Basse', 'Cuivres', 'Autre']
  }
}

export default function AddProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'instrumental',
    subcategory: '',
    image: '',
    audioPreview: '',
    stock: 1,
    isDigital: true,
    genre: '',
    bpm: '',
    musicalKey: '',
    license: 'Basique',
    brand: '',
    isFeatured: false
  })

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(r => {
          const p = r.data
          setForm({
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            subcategory: p.subcategory || '',
            image: p.image || '',
            audioPreview: p.audioPreview || '',
            stock: p.stock,
            isDigital: p.isDigital,
            genre: p.genre || '',
            bpm: p.bpm || '',
            musicalKey: p.musicalKey || '',
            license: p.license || 'Basique',
            brand: p.brand || '',
            isFeatured: p.isFeatured || false
          })
        })
        .catch(() => navigate('/vendeur'))
    }
  }, [id])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const data = new FormData()
      data.append('image', file)
      const res = await api.post('/upload/image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set('image', res.data.url)
      toast.success('Image uploadee !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAudio(true)
    try {
      const data = new FormData()
      data.append('audio', file)
      const res = await api.post('/upload/audio', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      set('audioPreview', res.data.url)
      toast.success('Fichier audio uploade !')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload audio')
    } finally {
      setUploadingAudio(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: form.isDigital ? 9999 : Number(form.stock),
        bpm: form.bpm ? Number(form.bpm) : undefined
      }
      if (isEdit) {
        await api.put(`/products/${id}`, payload)
        toast.success('Produit mis a jour !')
      } else {
        await api.post('/products', payload)
        toast.success('Produit publie !')
      }
      navigate('/vendeur')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <h1 style={styles.title}>{isEdit ? 'Modifier le produit' : 'Ajouter un produit'}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Category selector */}
          <div style={styles.catSelector}>
            {Object.keys(categories).map(cat => (
              <button
                key={cat}
                type="button"
                style={{ ...styles.catBtn, ...(form.category === cat ? styles.catBtnActive : {}) }}
                onClick={() => { set('category', cat); set('subcategory', '') }}
              >
                {cat === 'instrumental' ? '🎵 Instrumental' : cat === 'equipment' ? '🎙️ Materiel' : '🎸 Instrument'}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label>Nom du produit *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: Dark Trap Beat 'Midnight'" required />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={4}
              placeholder="Decrivez votre produit en detail..."
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prix (€) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Sous-categorie</label>
              <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}>
                <option value="">Selectionner...</option>
                {categories[form.category].subcategories.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image upload */}
          <div style={styles.uploadSection}>
            <h3 style={styles.fieldsTitle}>🖼️ Image de couverture</h3>
            <div style={styles.uploadRow}>
              <label style={styles.uploadBtn}>
                {uploadingImage ? 'Upload...' : '📁 Choisir une image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingImage}
                />
              </label>
              <span style={styles.uploadHint}>jpg, png, webp — max 10 Mo</span>
            </div>
            {form.image && (
              <div style={styles.imagePreviewWrap}>
                <img
                  src={form.image.startsWith('/uploads') ? `http://localhost:5000${form.image}` : form.image}
                  alt="preview"
                  style={styles.imagePreview}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <button type="button" style={styles.clearBtn} onClick={() => set('image', '')}>✕ Retirer</button>
              </div>
            )}
            <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              <label style={{ fontSize: '0.8rem', color: '#7d5560' }}>Ou coller un lien URL</label>
              <input
                value={form.image.startsWith('/uploads') ? '' : form.image}
                onChange={e => set('image', e.target.value)}
                placeholder="https://..."
                disabled={form.image.startsWith('/uploads')}
              />
            </div>
          </div>

          {/* Audio upload — only for instrumentals */}
          {form.category === 'instrumental' && (
            <div style={styles.uploadSection}>
              <h3 style={styles.fieldsTitle}>🎵 Fichier audio (extrait ou beat complet)</h3>
              <div style={styles.uploadRow}>
                <label style={{ ...styles.uploadBtn, background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.4)', color: '#e8ca55' }}>
                  {uploadingAudio ? 'Upload en cours...' : '🎧 Choisir un fichier audio'}
                  <input
                    type="file"
                    accept=".mp3,.wav,.flac,.aiff,.ogg,.m4a,.aac"
                    onChange={handleAudioUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingAudio}
                  />
                </label>
                <span style={styles.uploadHint}>mp3, wav, flac — max 150 Mo</span>
              </div>
              {uploadingAudio && (
                <div style={styles.uploadProgress}>
                  <div style={styles.progressBar} />
                  <span style={{ color: '#e8ca55', fontSize: '0.8rem' }}>Upload en cours...</span>
                </div>
              )}
              {form.audioPreview && (
                <div style={styles.audioPreviewWrap}>
                  <span style={{ color: '#10b981', fontSize: '0.85rem' }}>✓ Fichier audio uploade</span>
                  <audio
                    controls
                    src={`http://localhost:5000${form.audioPreview}`}
                    style={styles.audioPlayer}
                  />
                  <button type="button" style={styles.clearBtn} onClick={() => set('audioPreview', '')}>✕ Retirer</button>
                </div>
              )}
            </div>
          )}

          {form.category === 'instrumental' && (
            <div style={styles.categoryFields}>
              <h3 style={styles.fieldsTitle}>Informations de l'instrumental</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Genre</label>
                  <input value={form.genre} onChange={e => set('genre', e.target.value)} placeholder="Trap, Afrobeats..." />
                </div>
                <div className="form-group">
                  <label>BPM</label>
                  <input type="number" value={form.bpm} onChange={e => set('bpm', e.target.value)} placeholder="140" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tonalite</label>
                  <input value={form.musicalKey} onChange={e => set('musicalKey', e.target.value)} placeholder="Dm, Am..." />
                </div>
                <div className="form-group">
                  <label>Type de licence</label>
                  <select value={form.license} onChange={e => set('license', e.target.value)}>
                    <option value="Basique">Basique - Partage possible</option>
                    <option value="Premium">Premium - Usage commercial</option>
                    <option value="Exclusif">Exclusif - Vente unique</option>
                  </select>
                </div>
              </div>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.isDigital}
                  onChange={e => set('isDigital', e.target.checked)}
                  style={{ accentColor: '#ddba3c' }}
                />
                Produit numerique (telechargement)
              </label>
            </div>
          )}

          {(form.category === 'equipment' || form.category === 'instrument') && (
            <div style={styles.categoryFields}>
              <h3 style={styles.fieldsTitle}>Details du produit</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Marque</label>
                  <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Fender, Sony, Focusrite..." />
                </div>
                <div className="form-group">
                  <label>Stock disponible</label>
                  <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {user?.role === 'admin' && (
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={e => set('isFeatured', e.target.checked)}
                style={{ accentColor: '#f59e0b' }}
              />
              Mettre en vedette sur la page d'accueil
            </label>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/vendeur')}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading || uploadingImage || uploadingAudio}>
              {loading ? 'Publication...' : isEdit ? 'Mettre a jour' : 'Publier le produit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  title: { fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' },
  form: { background: '#251414', border: '1px solid #3d2020', borderRadius: '16px', padding: '2rem' },
  catSelector: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  catBtn: {
    flex: 1,
    padding: '0.65rem',
    background: '#1e1010',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    color: '#c9a4ac',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  catBtnActive: { background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.4)', color: '#e8ca55', fontWeight: 600 },
  uploadSection: {
    background: '#1e1010',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  uploadRow: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.55rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #512828',
    borderRadius: '8px',
    color: '#c9a4ac',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  uploadHint: { color: '#7d5560', fontSize: '0.75rem' },
  uploadProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  progressBar: {
    flex: 1,
    height: '4px',
    background: 'linear-gradient(90deg, #ddba3c, #f59e0b)',
    borderRadius: '2px',
    animation: 'pulse 1s ease-in-out infinite',
  },
  imagePreviewWrap: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' },
  imagePreview: { width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px' },
  audioPreviewWrap: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  audioPlayer: { width: '100%', borderRadius: '8px', accentColor: '#ddba3c' },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
  },
  categoryFields: {
    background: '#1e1010',
    border: '1px solid #3d2020',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  fieldsTitle: { fontSize: '0.875rem', fontWeight: 700, color: '#ddba3c', marginBottom: '1rem', textTransform: 'uppercase' },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    color: '#c9a4ac',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
}
