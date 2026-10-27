import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { Toaster } from 'sonner'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)