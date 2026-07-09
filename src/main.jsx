import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // <--- Verifica que la A sea mayúscula
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)