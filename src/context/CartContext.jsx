import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id)
      if (exists) {
        const updated = prev.map(i =>
          i._id === product._id
            ? { ...i, qty: Math.min(i.qty + quantity, product.stock || 9999) }
            : i
        )
        toast.success('Quantite mise a jour !')
        return updated
      }
      toast.success(`${product.name} ajoute au panier !`)
      return [...prev, { ...product, qty: quantity }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(i => i._id !== id))
    toast.success('Article retire du panier')
  }

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id)
    setCartItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0)
  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
