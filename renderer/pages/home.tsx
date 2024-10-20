import React, { useRef, useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useStoreContext } from '../contexts/StoreContext'
import StoreDropdown from '../components/StoreDropdown'

export default function HomePage() {
  const { store, setStore } = useStoreContext()
  const [isDev, setIsDev] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  const dropdownRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ipc) {
      window.ipc.send('init-check')

      window.ipc.on('init-reply', (data: { isDev: boolean, store: number }) => {
        setIsDev(data.isDev)
        setStore(data.store)
      })
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (store > 0) {
      window.ipc.send('store-change', { store: store })
    }
  }, [store])

  const handleStoreChange = (value: number) => {
    setStore(value)
    toggleDropdown()
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <React.Fragment>
      <Head>
        <title>OwlGuide</title>
      </Head>
      <div className="grid grid-col-1 mt-5 text-3xl text-center">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/owl.png"
            alt="Owl logo"
            width={110}
            height={110}
          />
        </div>
        <span className="courgette-regular">OwlGuide</span>
      </div>
      {store === 0 ?
        <StoreDropdown isDropdownOpen={isDropdownOpen} toggleDropdown={toggleDropdown} handleStoreChange={handleStoreChange} dropdownRef={dropdownRef} />
        :
        <div>
          <div className="mt-16 ml-auto mr-auto flex-col flex-wrap flex justify-center w-1/5 gap-2">
            <Link href="/decision" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75">
              Decisions
            </Link>
            <Link href="/adoption" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center">
              Adoptions
            </Link>
            <Link href="/enrollment" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center">
              Enrollment
            </Link>
            {isDev &&
              <Link href="/dev" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75">
                Dev
              </Link>
            }
          </div>
        </div>
      }
    </React.Fragment >
  )
}
