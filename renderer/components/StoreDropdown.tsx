interface StoreDropdownProps {
    isDropdownOpen: boolean
    toggleDropdown: () => void
    handleStoreChange: (value: number) => void
    dropdownRef: any
}

export default function StoreDropdown({ isDropdownOpen, toggleDropdown, handleStoreChange, dropdownRef }: StoreDropdownProps) {
    return (
        <div className="text-black rounded inline-block relative grid h-100 mt-20 place-items-center" ref={dropdownRef}>
            <button id="dropdown" onClick={toggleDropdown}
                className="bg-white hover:bg-gray-300 focus:outline-none font-medium rounded-lg text-md px-5 py-2.5 text-center inline-flex items-center" type="button">Store <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>
            {isDropdownOpen && (
                <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu"
                    className="absolute top-0 top-full mb-2 w-20 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1 text-center font-medium rounded" role="none">
                        <button className="block px-4 py-2 w-full hover:bg-gray-300 hover:text-gray-900 rounded" role="menuitem" onClick={() => handleStoreChange(620)}>620</button>
                        <button className="block px-4 py-2 w-full hover:bg-gray-300 hover:text-gray-900 rounded" role="menuitem" onClick={() => handleStoreChange(622)}>622</button>
                    </div>
                </div>
            )}
        </div>
    )
}
