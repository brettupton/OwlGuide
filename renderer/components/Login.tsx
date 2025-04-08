import { ChangeEvent, MutableRefObject } from "react"
import { Button } from "./Button"

interface ILoginProps {
    isLoginMenuOpen: boolean
    handleLoginMenuToggle: () => void
    handleUserChange: (e: ChangeEvent<HTMLInputElement>) => void
    userInfo: { userId: string, password: string }
    isPassShow: boolean
    handlePassToggle: () => void
    handleDBUpdate: () => void
    isDBUpdating: boolean
    LoginMenuRef: MutableRefObject<any>
}

export default function Login({ isLoginMenuOpen, handleLoginMenuToggle, handleUserChange, userInfo, isPassShow, handlePassToggle, handleDBUpdate, isDBUpdating, LoginMenuRef }: ILoginProps) {
    return (
        <div className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 w-auto p-4 z-50 
            ${isLoginMenuOpen ? 'block pointer-events-auto' : 'hidden'}`} ref={LoginMenuRef}>
            <div className="relative flex flex-col items-center justify-center">
                <div className="bg-gray-800 rounded-lg shadow border border-gray-700">
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
                                    value={userInfo["userId"]}
                                    required
                                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 placeholder-gray-400" />
                                {userInfo["userId"] === "" && <p className="text-xs text-red-500 mt-1">Required</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Password</label>
                                <div className="relative">
                                    <input type={`${isPassShow ? "text" : "password"}`}
                                        name="password"
                                        id="password"
                                        placeholder="•••••••••••••••"
                                        onChange={handleUserChange}
                                        value={userInfo["password"]}
                                        required
                                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 placeholder-gray-400" />
                                    <button type="button" className="text-white absolute end-1 bottom-2" onClick={handlePassToggle}>
                                        {
                                            isPassShow ?
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                                :
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                        }
                                    </button>
                                </div>
                                {userInfo["password"] === "" && <p className="text-xs text-red-500 mt-1">Required</p>}
                            </div>
                            <div className="flex justify-center pt-2">
                                <Button
                                    parentComponent="login"
                                    text="Sign In"
                                    isLoading={isDBUpdating}
                                    isDisabled={userInfo["userId"].length <= 0 || userInfo["password"].length <= 0}
                                    icon="none"
                                    buttonCommand={handleDBUpdate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}