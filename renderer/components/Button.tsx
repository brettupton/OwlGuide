import { useEffect } from "react"
import Spinner from "./Spinner"

interface IButton {
    parentComponent: string
    text: string
    isLoading: boolean
    icon: "none" | "search"
    title?: string
    isDisabled?: boolean
    buttonCommand?: () => void
}

export function Button({ parentComponent, text, isLoading, icon, title, isDisabled, buttonCommand }: IButton) {
    const maxTextLength = 12
    const iconChoice = {
        search:
            <div className="flex justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </div>
    }

    useEffect(() => {
        const handleEnterPress = (e: KeyboardEvent) => {
            console.log("Key pressed", e.key, document.activeElement?.tagName)
            if (e.key === "Enter" && !isDisabled && !isLoading) {
                console.log("Click")
                e.preventDefault()

                const activeElement = document.activeElement as HTMLElement | null;
                const activeTag = activeElement?.tagName.toLowerCase();

                if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
                    (document.activeElement as HTMLElement)?.blur(); // blur input
                }
                document.getElementById(`${parentComponent}-button`)?.click()
                // After clicking, refocus the original input
                if (activeElement && (activeTag === "input" || activeTag === "textarea" || activeTag === "select")) {
                    setTimeout(() => {
                        activeElement.focus();
                    }, 10);
                }
            }
        }
        document.addEventListener('keydown', handleEnterPress)

        return () => {
            document.removeEventListener('keydown', handleEnterPress)
        }
    }, [isDisabled, isLoading])

    return (
        <button type="button" id={`${parentComponent}-button`}
            className={`bg-gray-200 text-gray-800 font-semibold py-1 px-2.5 rounded-sm min-w-10 min-h-6 max-w-32 ${isLoading || isDisabled ? "cursor-not-allowed" : "hover:bg-gray-300 active:scale-95"}`}
            title={title}
            onClick={() => { buttonCommand() }}
        >
            {
                isLoading ?
                    <Spinner
                        size="sm"
                        color="gray"
                    />
                    :
                    icon === "none"
                        ?
                        text.length > maxTextLength ? `${text.slice(0, maxTextLength)}...` : text
                        :
                        iconChoice[icon]
            }
        </button>
    )
}