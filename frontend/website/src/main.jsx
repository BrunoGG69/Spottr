// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router-dom"
import {AuthProvider} from "./context/AuthContext.jsx"
import './index.css'
import App from './App.jsx'

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <App />
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>
)