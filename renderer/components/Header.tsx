import Image from 'next/image'
import Link from 'next/link'
import { MutableRefObject, useEffect } from 'react'
import { useStoreContext } from '../contexts/StoreContext'

interface HeaderProps {
    isMenuOpen: boolean
    isChildWindow: boolean
    handleMenuToggle: () => void
    HeaderMenuRef: MutableRefObject<any>
}

export default function Header({ isMenuOpen, isChildWindow, handleMenuToggle, HeaderMenuRef }: HeaderProps) {
    const { store, setStore } = useStoreContext()

    const handleResetStoreClick = () => {
        setStore(0)
        handleMenuToggle()
    }

    const handleMinimize = () => {
        window.ipc.send('minimize-app')
    }

    const handleClose = () => {
        window.ipc.send('close-app')
    }

    const handleHelp = () => {

    }

    return (
        !isChildWindow
            ?
            <header className="bg-gray-800 text-white p-1 flex items-center justify-between relative" ref={HeaderMenuRef}>
                <div className="flex items-center space-x-2 window-controls">
                    <Image
                        src="/images/owl.png"
                        alt="Owl logo"
                        width={30}
                        height={30}
                    />
                    {store > 0 &&
                        <button onClick={handleMenuToggle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    }
                </div>
                <div className="flex items-center space-x-2 window-controls">
                    <button onClick={handleHelp}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                        </svg>
                    </button>
                    <button onClick={handleMinimize}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                    </button>
                    <button onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div
                    className={`absolute text-black font-medium top-full left-10 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isMenuOpen ? 'block' : 'hidden'}`}
                    style={{ zIndex: 50 }} >
                    <Link href="/home">
                        <div className="p-2 cursor-pointer hover:bg-gray-100">Home</div>
                    </Link>
                    <Link href="/decision">
                        <div className="p-2 cursor-pointer hover:bg-gray-100">Decision</div>
                    </Link>
                    <Link href="adoption">
                        <div className="p-2 cursor-pointer hover:bg-gray-100">Adoptions</div>
                    </Link>
                    <Link href="enrollment">
                        <div className="p-2 cursor-pointer hover:bg-gray-100">Enrollment</div>
                    </Link>
                    <div className="border-t border-gray-300"></div>
                    <div className="p-1 text-sm text-center cursor-pointer hover:bg-gray-100" onClick={handleResetStoreClick}>Store: {store}</div>
                </div>
            </header>
            :
            <header className='bg-gray-800 text-white p-1 flex items-center justify-between relative h-11'>

            </header>
    )
}