import { ChangeEvent, useEffect, useRef, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'

import '../styles/globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Login from '../components/Login'

function App({ Component, pageProps }: AppProps) {
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState<boolean>(false)
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState<boolean>(false)
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState<boolean>(false)
  const [isChildWindow, setIsChildWindow] = useState<boolean>(false)
  const [appVer, setAppVer] = useState<string>("")
  const [dbUpdateTime, setDBUpdateTime] = useState<string>("")
  const [userInfo, setUserInfo] = useState({ userId: "", password: "" })

  const HeaderMenuRef = useRef(null)
  const LoginMenuRef = useRef(null)
  const router = useRouter()

  const handleMenuToggle = () => {
    setIsHeaderMenuOpen(!isHeaderMenuOpen)
  }

  const handleHelpMenuToggle = () => {
    setIsHelpMenuOpen(!isHelpMenuOpen)
  }

  const handleLoginMenuToggle = () => {
    setIsLoginMenuOpen(!isLoginMenuOpen)
  }

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.currentTarget

    const newUser = {
      ...userInfo,
      [id]: value
    }

    setUserInfo(newUser)
  }

  const handleDBUpdate = () => {
    window.ipc.send('main', { process: 'sql', method: 'update-db', data: { userInfo } })
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.send('main', { process: 'app', method: 'get-values' })
    }

    window.ipc.on('appData', ({ appVer, lastDBUpdate }: { appVer: string, lastDBUpdate: string }) => {
      setAppVer(appVer)
      setDBUpdateTime(lastDBUpdate)
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
        setIsHeaderMenuOpen(false)
        setIsHelpMenuOpen(false)
      }

      if (LoginMenuRef.current && !LoginMenuRef.current.contains(event.target)) {
        setIsLoginMenuOpen(false)
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

    setIsHeaderMenuOpen(false)
    setIsChildWindow(router.pathname.startsWith('/child'))

    router.events.on('routeChangeStart', handleCloseChild)

    return () => {
      router.events.off('routeChangeStart', handleCloseChild)
    }
  }, [router])

  return (
    <div className="flex flex-col h-screen">
      <Header
        isHeaderMenuOpen={isHeaderMenuOpen}
        handleMenuToggle={handleMenuToggle}
        isHelpMenuOpen={isHelpMenuOpen}
        handleHelpMenuToggle={handleHelpMenuToggle}
        isChildWindow={isChildWindow}
        appVer={appVer}
        HeaderMenuRef={HeaderMenuRef} />
      <Component {...pageProps} />
      <Login
        isLoginMenuOpen={isLoginMenuOpen}
        handleLoginMenuToggle={handleLoginMenuToggle}
        handleUserChange={handleUserChange}
        handleDBUpdate={handleDBUpdate}
        LoginMenuRef={LoginMenuRef} />
      <Footer
        syncDB={handleLoginMenuToggle}
        dbUpdateTime={dbUpdateTime}
      />
    </div>
  )
}

export default App
