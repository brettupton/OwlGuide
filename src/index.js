import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createContext, useState } from "react"
import {
    HashRouter,
    Routes,
    Route
} from "react-router-dom"
import { Home } from "./renderer/Home"
import { BuyingD } from "./renderer/decisions/BuyingD"
import { EnrollHome } from "./renderer/enrollment/EnrollHome"
import { AdoptionHome } from "./renderer/adoptions/AdoptionHome"
import { DevHome } from "./renderer/dev/DevHome"

export const StoreContext = createContext(0)

const App = () => {
    const [store, setStore] = useState(0)

    const handleStoreChange = (value) => {
        setStore(value)
    }

    return (
        <StoreContext.Provider value={{ store, handleStoreChange }}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/enrollment" element={<EnrollHome />} />
                    <Route path="/buying" element={<BuyingD />} />
                    <Route path="/adoptions" element={<AdoptionHome />} />
                    <Route path="/dev" element={<DevHome />} />
                </Routes>
            </HashRouter>
        </StoreContext.Provider>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)


