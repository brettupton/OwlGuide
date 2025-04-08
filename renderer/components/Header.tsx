import Image from 'next/image'
import Link from 'next/link'
import { Dropdown } from './Dropdown'

<<<<<<< HEAD
interface HeaderProps {
    isHeaderMenuOpen: boolean
    handleMenuToggle: () => void
    isChildWindow: boolean
    isHelpMenuOpen: boolean
    handleHelpMenuToggle: () => void
=======
interface IHeader {
    isChildWindow: boolean
>>>>>>> main
    routes: { route: string, plural: boolean }[]
    appVer: string
}

<<<<<<< HEAD
<<<<<<< HEAD
export default function Header({ isHeaderMenuOpen, handleMenuToggle, isChildWindow, isHelpMenuOpen, handleHelpMenuToggle, appVer, HeaderMenuRef }: HeaderProps) {
<<<<<<< HEAD
=======
    const routes = ["home", "course", "book", "decision", "enrollment", "report"]
    const plurals = ["course", "decision", "book", "report"]

>>>>>>> main
=======
export default function Header({ isHeaderMenuOpen, handleMenuToggle, isChildWindow, isHelpMenuOpen, handleHelpMenuToggle, routes, appVer, HeaderMenuRef }: HeaderProps) {
>>>>>>> main
=======
export default function Header({ isChildWindow, routes, appVer }: IHeader) {
>>>>>>> main
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
                            icon="bars-3"
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                <div
                    className={`absolute text-black font-medium top-full left-10 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isHeaderMenuOpen ? 'block' : 'hidden'}`}
=======
                <ul
                    className={`absolute flex flex-col text-black font-medium top-full left-10 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isHeaderMenuOpen ? 'block' : 'hidden'}`}
>>>>>>> main
                    style={{ zIndex: 50 }} >
                    <Link href="/home" className="px-2 py-1 cursor-pointer hover:bg-gray-100">
                        Home
                    </Link>
<<<<<<< HEAD
                    <Link href="/course">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Courses</div>
                    </Link>
                    <Link href="/book">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Books</div>
                    </Link>
                    <Link href="/decision">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Decisions</div>
                    </Link>
                    <Link href="enrollment">
                        <div className="px-2 py-1 cursor-pointer hover:bg-gray-100">Enrollment</div>
                    </Link>
                </div>
=======
                <ul
                    className={`absolute flex flex-col text-black font-medium top-full left-10 mt-2 bg-white border border-gray-300 shadow-lg rounded-md ${isHeaderMenuOpen ? 'block' : 'hidden'}`}
                    style={{ zIndex: 50 }} >
                    {routes.map((route, index) => (
                        <Link
                            href={`${route}`}
                            key={index}
                            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                        >
                            {`${route[0].toUpperCase()}${route.slice(1)}${plurals.includes(route) ? 's' : ''}`}
                        </Link>
                    ))}
                </ul>
>>>>>>> main
=======
                    {routes.map((routeInfo, index) => (
                        <Link
                            href={`${routeInfo.route}`}
                            key={index}
                            className="px-2 py-1 cursor-pointer hover:bg-gray-100"
                        >
                            {`${routeInfo.route[0].toUpperCase()}${routeInfo.route.slice(1)}${routeInfo.plural ? 's' : ''}`}
                        </Link>
                    ))}
                </ul>
>>>>>>> main
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
=======
>>>>>>> main
            </header>
            :
            <header className='bg-gray-800 text-white p-1 flex items-center justify-between relative h-11'>

            </header>
    )
}