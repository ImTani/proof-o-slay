import React, { createContext, useContext, useState } from 'react';

export type CursorVariant = 'default' | 'selection' | 'text' | 'pointer';

interface CursorContextType {
    variant: CursorVariant;
    setVariant: (variant: CursorVariant) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [variant, setVariant] = useState<CursorVariant>('default');

    return (
        <CursorContext.Provider value={{ variant, setVariant }}>
            {children}
        </CursorContext.Provider>
    );
};

export const useCursor = () => {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error('useCursor must be used within a CursorProvider');
    }
    return context;
};
