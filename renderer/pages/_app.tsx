import React, { useEffect, useRef, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { StoreContextProvider } from '../contexts/StoreContext'

import '../styles/globals.css'
import Header from '../components/Header'

function App({ Component, pageProps }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isChildWindow, setIsChildWindow] = useState<boolean>(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const HeaderMenuRef = useRef(null)

  const router = useRouter()

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      const text = window.getSelection().toString().trim()
      window.ipc.send('context-menu', { x: event.x, y: event.y, query: text })
    }

    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (HeaderMenuRef.current && !HeaderMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutsideMenu)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideMenu)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  useEffect(() => {
    const handleCloseBars = () => {
      window.ipc.send('close-bars')
    }

    setIsMenuOpen(false)
    setIsChildWindow(router.pathname.startsWith('/child'))

    router.events.on('routeChangeStart', handleCloseBars)

    return () => {
      router.events.off('routeChangeStart', handleCloseBars)
    }
  }, [router])

  return (
    <StoreContextProvider>
      <Header isMenuOpen={isMenuOpen} isChildWindow={isChildWindow} handleMenuToggle={handleMenuToggle} HeaderMenuRef={HeaderMenuRef} />
      <Component {...pageProps} />
    </StoreContextProvider>
  )
}

export default App
