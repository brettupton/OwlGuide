import { ChangeEvent, FormEvent, useState } from "react"

interface FileFormProps {
    process: string
    label: string
    accept?: string
    multiple?: boolean
}

export default function FileForm({ process, label, accept, multiple = false }: FileFormProps) {
    const [filePaths, setFilePaths] = useState<string[]>([])
    const [fileUploaded, setFileUploaded] = useState(false)

    const handleSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            const fileArr: string[] = []

            for (let i = 0; i < e.currentTarget.files.length; i++) {
                fileArr.push(e.currentTarget.files[i].path)
            }
            setFilePaths(fileArr)
            setFileUploaded(true)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (filePaths.length > 0) {
            window.ipc.send(`${process}`, { method: "file-upload", data: filePaths })
        }
    }

    return (
        <div className="flex flex-col w-full">
            <form onSubmit={handleSubmit}>
                <div className="flex m-3 justify-center">
                    <div className="flex flex-col pr-4 text-white">
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
                <div className="flex text-center justify-center">
                    <button
                        className={`border border-white rounded px-2 py-1 ${!fileUploaded ? 'cursor-not-allowed' : 'hover:bg-white hover:text-black active:scale-95 transition-transform duration-75'}`}
                        type="submit"
                        disabled={!fileUploaded}
                    >Submit</button>
                </div>
            </form>
        </div>
    )
}