import Image from 'next/image'
import Link from 'next/link'
import { MutableRefObject } from 'react'

interface HeaderProps {
    isMenuOpen: boolean
    handleMenuToggle: () => void
    isChildWindow: boolean
    isHelpMenuOpen: boolean
    handleHelpMenuToggle: () => void
    appVer: string
    HeaderMenuRef: MutableRefObject<any>
}

export default function Header({ isMenuOpen, handleMenuToggle, isChildWindow, isHelpMenuOpen, handleHelpMenuToggle, appVer, HeaderMenuRef }: HeaderProps) {
    const handleMinimize = () => {
        window.ipc.send('minimize-app')
    }

    const handleClose = () => {
        window.ipc.send('close-app')
    }

    const openGithubLink = () => {
        window.ipc.send('open-github')
    }

    return (
        !isChildWindow
            ?
            <header className="bg-gray-800 relative" ref={HeaderMenuRef}>
                <div className="flex px-2 py-1 justify-between">
                    <div className="flex gap-2 window-controls">
                        <Image
                            src="/images/owl.png"
                            alt="Owl logo"
                            width={35}
                            height={35}
                            priority={true}
                        />
                        <button onClick={handleMenuToggle}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex">
                        <div className="flex window-controls gap-2">
                            <button onClick={handleHelpMenuToggle}>
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
                    </div>
                </div>
                <div
                    className={`absolute text-black font-medium top-full left-10 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isMenuOpen ? 'block' : 'hidden'}`}
                    style={{ zIndex: 50 }} >
                    <Link href="/home">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Home</div>
                    </Link>
                    <Link href="/course">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Course</div>
                    </Link>
                    <Link href="/course">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Book</div>
                    </Link>
                    <Link href="/decision">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Decision</div>
                    </Link>
                    <Link href="enrollment">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Enrollment</div>
                    </Link>
                </div>
                <div
                    className={`flex flex-col absolute text-black text-sm top-full right-20 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isHelpMenuOpen ? 'block' : 'hidden'}`}
                    style={{ zIndex: 50 }}>
                    <div className="flex px-2">
                        Version {appVer}
                    </div>
                    <div className="flex px-2">
                        Canari 2024
                    </div>
                    <div className="flex px-2">
                        <button onClick={openGithubLink} className="text-blue-600 underline" rel="noopener noreferrer">
                            GitHub
                        </button>
                    </div>
                </div>
            </header>

            :
            <header className='bg-gray-800 text-white p-1 flex items-center justify-between relative h-11'>

            </header>
    )
}