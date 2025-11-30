import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import {store} from './app/store'
import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AppProvider } from './providers/AppProviders'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
    <AppProvider>

      <BrowserRouter>
        <App />
        <ToastContainer />

      </BrowserRouter>
          </AppProvider>

    </Provider>
  </React.StrictMode>,
)
