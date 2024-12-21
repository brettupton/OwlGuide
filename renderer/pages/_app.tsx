import { useEffect, useRef, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import '../styles/globals.css'
import Header from '../components/Header'

function App({ Component, pageProps }: AppProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState<boolean>(false)
  const [isChildWindow, setIsChildWindow] = useState<boolean>(false)
  const [isDev, setIsDev] = useState<boolean>(false)
  const [appVer, setAppVer] = useState<string>("")

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleHelpMenuToggle = () => {
    setIsHelpMenuOpen(!isHelpMenuOpen)
  }

  const HeaderMenuRef = useRef(null)

  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.send('initialize')
    }

    window.ipc.on('initialize-success', (reply: { isDev: boolean, appVer: string }) => {
      setIsDev(reply.isDev)
      setAppVer(reply.appVer)
    })

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault()
      const { x, y, target } = event
      let element = ""

      if (target instanceof HTMLElement) {
        element = target.tagName
      }
      window.ipc.send('context-menu', { x, y, element, query: window.getSelection().toString().trim() })
    }

    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (HeaderMenuRef.current && !HeaderMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
        setIsHelpMenuOpen(false)
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
    const handleCloseChild = () => {
      window.ipc.send('close-child')
    }

    setIsMenuOpen(false)
    setIsChildWindow(router.pathname.startsWith('/child'))

    router.events.on('routeChangeStart', handleCloseChild)

    return () => {
      router.events.off('routeChangeStart', handleCloseChild)
    }
  }, [router])

  return (
    <div className="flex flex-col h-screen">
      <Header
        isMenuOpen={isMenuOpen}
        handleMenuToggle={handleMenuToggle}
        isHelpMenuOpen={isHelpMenuOpen}
        handleHelpMenuToggle={handleHelpMenuToggle}
        isChildWindow={isChildWindow}
        appVer={appVer}
        HeaderMenuRef={HeaderMenuRef} />
      <Component {...pageProps}
        isDev={isDev} />
    </div>
  )
}

export default App
