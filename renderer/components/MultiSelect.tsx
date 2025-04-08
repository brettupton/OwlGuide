import { useRef, useState, useEffect } from "react"
import { Dropdown } from "./Dropdown"

interface MultiSelectProps {
    options: string[]
    selectedItems: string[]
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
    maxNumOptions: number
}

export default function MultiSelect({ options, selectedItems, setSelectedItems, maxNumOptions }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)

    useEffect(() => {
        const handleClickOutsideMenu = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutsideMenu)

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideMenu)
        }
    }, [])

    const toggleSelection = (item: string) => {
        setSelectedItems((prev) => {
            if (selectedItems.length <= (maxNumOptions - 1)) {
                return prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
            }
            return prev.includes(item) ? prev.filter((i) => i !== item) : [...prev]
        })
    }

    const removeSelection = (item: string) => {
        setSelectedItems((prev) => prev.filter((i) => i !== item))
    }

    return (
        <div className="flex w-full px-2">
            <div className="flex flex-col relative" ref={selectRef}>
                <Dropdown
                    icon="bars-2"
                    location="bottom-right"
                    data={
                        options.map((option, index) => {
                            return (
                                <div
                                    className={`text-sm py-1 px-3 hover:cursor-pointer rounded-lg ${selectedItems.includes(option) ? "bg-gray-400" : "hover:bg-gray-400"}`}
                                    onClick={() => toggleSelection(option)}
                                    key={index}>
                                    {option}
                                </div>
                            )
                        })
                    }
                />
            </div>
            <div className="grid grid-flow-col absolute grid-rows-2 gap-2 -top-4 left-16 ml-2">
                {selectedItems.map((item) => (
                    <span key={item} className="bg-gray-600 text-white text-sm px-3 py-1 rounded-full flex items-center shadow-md">
                        {item}
                        <button
                            className="ml-2 bg-white text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                            onClick={() => removeSelection(item)}
                        >
                            ✕
                        </button>
                    </span>
                ))}
            </div>
        </div>
    )
}
