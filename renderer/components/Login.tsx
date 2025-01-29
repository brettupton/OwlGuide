export default function Login({ isLoginMenuOpen, handleLoginMenuToggle, handleUserChange, handleDBUpdate, LoginMenuRef }) {
    return (
        <div className={`absolute inset-0 flex items-center justify-center ${isLoginMenuOpen ? 'block' : 'hidden'}`} ref={LoginMenuRef}>
            <div className="relative flex flex-col items-center justify-center mx-auto">
                <div className="w-full bg-gray-800 rounded-lg shadow border border-gray-700">
                    <button
                        onClick={handleLoginMenuToggle}
                        className="absolute top-1 right-1 text-white bg-gray-700 hover:bg-gray-600 rounded-full p-1 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <div>
                                <label htmlFor="userId" className="block mb-2 text-sm font-medium text-white">User ID</label>
                                <input type="text"
                                    name="userId"
                                    id="userId"
                                    placeholder="s912345678"
                                    onChange={handleUserChange}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 placeholder-gray-400" />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
                                <input type="password"
                                    name="password"
                                    id="password"
                                    placeholder="•••••••••••••••"
                                    onChange={handleUserChange}
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 placeholder-gray-400" />
                            </div>
                            <div className="flex justify-center">
                                <div className="w-1/2">
                                    <button
                                        className="bg-white hover:bg-gray-300 text-gray-800 font-semibold w-full py-1 px-3 mt-3 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
                                        onClick={handleDBUpdate}>
                                        Sign in
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}