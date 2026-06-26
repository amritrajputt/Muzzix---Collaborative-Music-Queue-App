import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file.")
}

import { AxiosInterceptorProvider } from './components/AxiosInterceptorProvider'
import { ToastProvider } from './contexts/ToastContext'

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AxiosInterceptorProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AxiosInterceptorProvider>
      </ClerkProvider>
    </StrictMode>,
  )
}