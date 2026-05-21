import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import TypesafeI18n from './i18n/i18n-react'
import { loadLocaleAsync } from './i18n/i18n-util.async'

loadLocaleAsync('zh').then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <TypesafeI18n locale="zh">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TypesafeI18n>
    </React.StrictMode>,
  )
})
