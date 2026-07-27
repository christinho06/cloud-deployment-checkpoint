import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { TooltipProvider } from './components/Tooltip'
import { LanguageProvider } from './context/LanguageContext'
import { CurrencyProvider } from './context/CurrencyContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import SellerDashboard from './pages/SellerDashboard'
import AddProductPage from './pages/AddProductPage'
import AdminDashboard from './pages/AdminDashboard'
import MessagesPage from './pages/MessagesPage'

export default function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/instrumentaux" element={<CatalogPage category="instrumental" />} />
              <Route path="/materiel" element={<CatalogPage category="equipment" />} />
              <Route path="/instruments" element={<CatalogPage category="instrument" />} />
              <Route path="/produit/:id" element={<ProductDetailPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/connexion" replace />} />
              <Route path="/inscription" element={<RegisterPage />} />
              <Route path="/register" element={<Navigate to="/inscription" replace />} />

              {/* Routes protegees */}
              <Route path="/paiement" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="/profil" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/commandes" element={
                <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute><MessagesPage /></ProtectedRoute>
              } />

              {/* Routes vendeur */}
              <Route path="/vendeur" element={
                <ProtectedRoute role="seller"><SellerDashboard /></ProtectedRoute>
              } />
              <Route path="/vendeur/ajouter" element={
                <ProtectedRoute role="seller"><AddProductPage /></ProtectedRoute>
              } />
              <Route path="/vendeur/modifier/:id" element={
                <ProtectedRoute role="seller"><AddProductPage /></ProtectedRoute>
              } />

              {/* Route admin */}
              <Route path="/admin" element={
                <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="page" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                  <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#ddba3c' }}>404</h1>
                  <p style={{ color: '#c9a4ac', marginBottom: '2rem' }}>Page introuvable</p>
                  <a href="/" className="btn btn-primary">Retour a l'accueil</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  )
}
