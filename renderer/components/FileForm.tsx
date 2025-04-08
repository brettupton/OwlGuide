import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import Spinner from "./Spinner"

interface FileFormProps {
    process: string
    label: string
    accept?: string
    multiple?: boolean
}

export default function FileForm({ process, label, accept, multiple = false }: FileFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        window.ipc.on('file-error', () => {
            setIsLoading(false)
        })
    }, [])

    const handleSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const fileArr: string[] = []

            for (const newFile of Array.from(e.currentTarget.files)) {
                fileArr.push(newFile.path)
            }
            setIsLoading(true)
<<<<<<< HEAD
            window.ipc.send('main', { process, method: "file-upload", data: fileArr })
=======
            window.ipc.send('main', { process, method: "file-upload", data: { type: process, fileArr } })
>>>>>>> main
        }
    }

    return (
        <div className="flex flex-col w-full h-full">
            {isLoading ?
                <Spinner
                    size="md"
                    color="white"
                />
                :
                <form>
                    <div className="flex m-3 justify-center">
                        <div className="flex flex-col text-white">
                            <label className="block text-sm font-bold mb-2" htmlFor="file">
                                {label}
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                                id="file"
                                type="file"
                                multiple={multiple}
                                accept={`${accept ?? accept}`}
                                onChange={handleSelectionChange}
                            />
                        </div>
                    </div>
                </form>
            }
        </div>
    )
}