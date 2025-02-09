export default function Footer({ syncDB, dbUpdateTime, isDBUpdating, isChildWindow }) {
    return (
        !isChildWindow ?
            <footer className="flex bg-gray-800 sticky top-[100vh]">
                <div className="flex px-2 py-1 gap-1">
                    <div className="flex">
                        <button onClick={syncDB}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`size-5 ${isDBUpdating ? 'animate-spin' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex self-center text-xs">
                        Last Update: {dbUpdateTime}
                    </div>
                </div>
            </footer>
            :
            <footer>

            </footer>
    )
}