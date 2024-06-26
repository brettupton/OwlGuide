import { useState } from "react"
import { Link } from "react-router-dom"

export const DevHome = () => {
    const [filePath, setFilePath] = useState("")
    const [store, setStore] = useState(0)
    const [term, setTerm] = useState("")
    const [progress, setProgress] = useState(0)
    const [processingData, setProcessingData] = useState(false)

    const handleFileChange = (e) => {
        const { files } = e.currentTarget

        if (files) {
            setFilePath(files[0].path)
        }
    }

    const handleStoreChange = (e) => {
        const { value } = e.currentTarget
        setStore(value)
    }

    const handleTermChange = (e) => {
        const { value } = e.currentTarget
        setTerm(value)
    }

    const handleFileSubmit = () => {
        setProcessingData(true)
        window.ipcRenderer.send('new-sales', { path: filePath, store: store, term: term })
    }

    window.ipcRenderer.on('progress-update', (event, data) => {
        setProgress(data.progress)
    })

    window.ipcRenderer.on('sales-processed', () => {
        setProcessingData(false)
    })

    return (
        <div className="container-fluid bg-dark vh-100 mx-0 text-white">
            <div className="row">
                <div className="col mt-3 mb-3">
                    <Link to="/" className="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                        </svg>
                    </Link>
                </div>
            </div>
            {!processingData
                ?
                <>
                    <div className="row mt-3">
                        <div className="col-2">
                            <input type="text" className="form-control" onChange={handleTermChange} placeholder="Term" maxLength={1} />
                        </div>
                        <div className="col-2">
                            <input type="number" className="form-control" onChange={handleStoreChange} placeholder="Store" />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-lg-4 col-sm-8">
                            <div className="input-group">
                                <input type="file" className="form-control" id="inputGroupFile" aria-describedby="inputGroupFile" aria-label="Upload" onChange={handleFileChange} />
                                <button className="btn btn-outline-secondary" type="button" id="inputGroupFile" onClick={handleFileSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-1">
                        <div className="col">
                            <small>Sequence: Term, Dept/Course, Section, Professor, ISBN, Est Enrl, Act Enrl, Est Sales, Reorders, Act Sales</small>
                        </div>
                    </div>
                </>
                :
                <>
                    <div className="progress mt-5">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar"
                            style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">{`${progress}%`}</div>
                    </div>
                    <div className="row text-center">
                        <div className="col">
                            <small>Processing</small>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}