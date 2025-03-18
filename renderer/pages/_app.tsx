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
  const [isPassShow, setIsPassShow] = useState<boolean>(false)
  const [isDBUpdating, setIsDBUpdating] = useState<boolean>(false)
<<<<<<< HEAD

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
    setIsPassShow(false)
    setUserInfo({
      userId: "",
      password: ""
    })
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
    if (Object.values(userInfo).every((ele) => ele !== "")) {
      setIsDBUpdating(true)
      window.ipc.send('main', { process: 'sql', method: 'update-db', data: { userInfo } })
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.send('main', { process: 'app', method: 'get-values' })
=======

  const routes = [
    { route: "adoption", plural: true },
    { route: "course", plural: true },
    { route: "book", plural: true },
    { route: "decision", plural: true },
    { route: "enrollment", plural: false },
    { route: "order", plural: true },
    { route: "report", plural: true }
  ]

  const HeaderMenuRef = useRef(null)
  const LoginMenuRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      if (!appVer || !dbUpdateTime) {
        window.ipc.send('main', { process: 'app', method: 'get-values' })
      }
>>>>>>> main
    }

    window.ipc.on('appData', ({ appVer, dbUpdateTime }: { appVer: string, dbUpdateTime: string }) => {
      setAppVer(appVer)
      setDBUpdateTime(dbUpdateTime)
    })

    window.ipc.on('update-success', () => {
      router.reload()
    })

    window.ipc.on('update-fail', () => {
      setIsDBUpdating(false)
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
      window.ipc.send('close-child', { childId: router.pathname.split('\\').pop().split('/').pop(), promptClose: false })
    }

    setIsHeaderMenuOpen(false)
<<<<<<< HEAD
<<<<<<< HEAD
=======
    setIsLoginMenuOpen(false)
>>>>>>> main
=======
    setIsLoginMenuOpen(false)
>>>>>>> main
    setIsChildWindow(router.pathname.startsWith('/child'))

    router.events.on('routeChangeStart', handleCloseChild)

    return () => {
      router.events.off('routeChangeStart', handleCloseChild)
    }
  }, [router])

  const handleLoginMenuToggle = () => {
    setIsLoginMenuOpen(!isLoginMenuOpen)
    setIsPassShow(false)
    setUserInfo({
      userId: "",
      password: ""
    })
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
    if (Object.values(userInfo).every((ele) => ele !== "")) {
      setIsDBUpdating(true)
      window.ipc.send('main', { process: 'sql', method: 'update-db', data: { userInfo } })
    }
  }

  return (
    <div className="flex flex-col h-screen">
<<<<<<< HEAD
<<<<<<< HEAD
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
        userInfo={userInfo}
        isPassShow={isPassShow}
        handlePassToggle={() => setIsPassShow(!isPassShow)}
        handleDBUpdate={handleDBUpdate}
        isDBUpdating={isDBUpdating}
        LoginMenuRef={LoginMenuRef} />
      <Footer
        syncDB={handleLoginMenuToggle}
        dbUpdateTime={dbUpdateTime}
        isDBUpdating={isDBUpdating}
        isChildWindow={isChildWindow}
=======
      {!isChildWindow &&
        <Header
          isHeaderMenuOpen={isHeaderMenuOpen}
          handleMenuToggle={handleMenuToggle}
          isHelpMenuOpen={isHelpMenuOpen}
          handleHelpMenuToggle={handleHelpMenuToggle}
          isChildWindow={isChildWindow}
          appVer={appVer}
          HeaderMenuRef={HeaderMenuRef} />
      }
      <Component {...pageProps} />
      <Login
        isLoginMenuOpen={isLoginMenuOpen}
        handleLoginMenuToggle={handleLoginMenuToggle}
        handleUserChange={handleUserChange}
        userInfo={userInfo}
        isPassShow={isPassShow}
        handlePassToggle={() => setIsPassShow(!isPassShow)}
        handleDBUpdate={handleDBUpdate}
        isDBUpdating={isDBUpdating}
        LoginMenuRef={LoginMenuRef} />
      <Footer
        syncDB={handleLoginMenuToggle}
        dbUpdateTime={dbUpdateTime}
        isDBUpdating={isDBUpdating}
        isChildWindow={isChildWindow}
>>>>>>> main
=======
      {!isChildWindow &&
        <Header
          isHeaderMenuOpen={isHeaderMenuOpen}
          handleMenuToggle={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
          isHelpMenuOpen={isHelpMenuOpen}
          handleHelpMenuToggle={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
          routes={routes}
          isChildWindow={isChildWindow}
          appVer={appVer}
          HeaderMenuRef={HeaderMenuRef} />
      }
      <Component {...pageProps} routes={routes} />
      <Login
        isLoginMenuOpen={isLoginMenuOpen}
        handleLoginMenuToggle={handleLoginMenuToggle}
        handleUserChange={handleUserChange}
        userInfo={userInfo}
        isPassShow={isPassShow}
        handlePassToggle={() => setIsPassShow(!isPassShow)}
        handleDBUpdate={handleDBUpdate}
        isDBUpdating={isDBUpdating}
        LoginMenuRef={LoginMenuRef} />
      <Footer
        syncDB={handleLoginMenuToggle}
        dbUpdateTime={dbUpdateTime}
        isDBUpdating={isDBUpdating}
        isChildWindow={isChildWindow}
>>>>>>> main
      />
    </div>
  )
}

export default App
