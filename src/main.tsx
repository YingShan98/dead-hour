import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { I18nProvider } from './i18n/useI18n'
import { loadAllLocales } from './i18n/i18n-util.sync'

loadAllLocales()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider locale="zh">
        <App />
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
