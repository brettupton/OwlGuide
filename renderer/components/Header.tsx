import Image from 'next/image'
import Link from 'next/link'
import { Dropdown } from './Dropdown'

interface IHeader {
    isChildWindow: boolean
    routes: { route: string, plural: boolean }[]
    appVer: string
}

export default function Header({ isChildWindow, routes, appVer }: IHeader) {
    const handleMinimize = () => {
        window.ipc.send('minimize-app')
    }

    const handleClose = () => {
        window.ipc.send('close-app')
    }

    return (
        !isChildWindow
            ?
            <header className="bg-gray-800 relative">
                <div className="flex px-2 py-1 justify-between">
                    <div className="flex gap-2 window-controls">
                        <Image
                            src="/images/owl.png"
                            alt="Owl logo"
                            width={35}
                            height={35}
                            priority={true}
                        />
                        <Dropdown
                            icon="bars"
                            location="bottom-right"
                            data={[
                                <Link href="/home" className="px-2 py-1 cursor-pointer hover:bg-gray-400 rounded w-full">
                                    Home
                                </Link>,
                                ...routes.map((routeInfo, index) => {
                                    return (
                                        <Link
                                            href={`${routeInfo.route}`}
                                            key={index}
                                            className="px-2 py-1 cursor-pointer hover:bg-gray-400 rounded w-full"
                                        >
                                            {`${routeInfo.route[0].toUpperCase()}${routeInfo.route.slice(1)}${routeInfo.plural ? 's' : ''}`}
                                        </Link>
                                    )
                                }
                                )
                            ]}
                        />
                    </div >
                    <div className="flex">
                        <div className="flex window-controls gap-2">
                            <Dropdown
                                icon="question"
                                location="bottom-left"
                                data={[
                                    <div>Version <span className="text-indigo-600">{appVer}</span></div>,
                                    <div><span className="text-yellow-600">Canari</span> 2025</div>,
                                    <button onClick={() => window.ipc.send('open-github')} className="text-blue-600 underline" rel="noopener noreferrer">
                                        GitHub
                                    </button>
                                ]}
                            />
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
            </header>
            :
            <header className='bg-gray-800 text-white p-1 flex items-center justify-between relative h-11'>

            </header>
    )
}