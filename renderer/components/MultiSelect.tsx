import { useRef, useState, useEffect } from "react"
<<<<<<< HEAD
=======
import { Dropdown } from "./Dropdown"
>>>>>>> main

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
<<<<<<< HEAD
        <div className="flex">
            <div className="flex flex-col relative" ref={selectRef}>
                <div className="flex">
                    <button
                        className="border text-sm rounded-lg py-1.5 px-4 bg-gray-700 border-gray-600 text-white shadow-md hover:bg-gray-600 transition"
                        onClick={() => setIsOpen(!isOpen)}>{selectedItems.length > 0 ? "Edit" : "Select"}</button>
                </div>
                <div
                    className={`absolute top-10 bg-gray-800 border border-gray-600 shadow-lg rounded-md max-h-[250px] overflow-y-auto z-50 px-1.5 ${isOpen ? "block" : "hidden"}`}

                >
                    {options.map((option, index) => {
                        return (
                            <div
                                className={`text-sm py-1 px-3 hover:cursor-pointer rounded-lg ${selectedItems.includes(option) ? "bg-gray-400" : "hover:bg-gray-400"}`}
                                onClick={() => toggleSelection(option)}
                                key={index}>
                                {option}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="grid grid-flow-col grid-rows-2 gap-2 -mt-3 mx-3">
                {selectedItems.map((item) => (
                    <span key={item} className="bg-gray-700 text-white text-sm px-3 py-1 rounded-full flex items-center shadow-md">
=======
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
>>>>>>> main
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
