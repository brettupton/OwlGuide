import { useState, createContext, useContext } from 'react'

interface StoreContextType {
    store: number,
    setStore: (store: number) => void
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const useStoreContext = () => {
    const context = useContext(StoreContext)
    if (!context) {
        throw new Error('useStoreContext must be used within a Provider')
    }
    return context
}

export const StoreContextProvider = ({ children }) => {
    const [store, setStore] = useState<number>(0)

    return (
        <StoreContext.Provider value={{ store, setStore }}>
            {children}
        </StoreContext.Provider>
    );
};