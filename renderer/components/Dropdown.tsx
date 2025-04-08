import { useRouter } from "next/router"
import { ReactElement, useEffect, useRef, useState } from "react"

interface IDropdown {
    icon: "bars-2" | "bars-3" | "question"
    location: "bottom-left" | "bottom-right"
    data: ReactElement[]
}

export const Dropdown = ({ icon, location, data }: IDropdown) => {
    const dropdownRef = useRef(null)
    const router = useRouter()

    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
    const dropdownIcons = {
        "bars-2":
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            </svg>,
        "bars-3":
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>,
        "question":
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
    }
    const dropdownLocations = {
        "bottom-left": "top-8 right-1",
        "bottom-right": "top-8 left-1"
    }

    useEffect(() => {
        const handleClickOutsideMenu = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutsideMenu)

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideMenu)
        }
    }, [])

    useEffect(() => {
        setIsDropdownOpen(false)
    }, [router])

    return (
        <div className={`flex flex-col mt-1 relative z-50`} ref={dropdownRef}>
            <div className="flex">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="active:scale-90 transition-transform duration-100">
                    {dropdownIcons[icon]}
                </button>
            </div>
            <div className={`absolute flex flex-col ${dropdownLocations[location]} bg-gray-300 rounded text-sm text-black font-[540] w-max min-w-[4rem] max-w-[25rem] ${isDropdownOpen ? "block" : "hidden"}`}>
                <div className="flex flex-col mx-2 my-1">
                    {data.map((element, index) => {
                        return (
                            <div className="flex" key={index}>{element}</div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}