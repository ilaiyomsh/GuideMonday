import React, { createContext, useContext } from 'react';
import { useGuideManager } from '../hooks/useGuideManager';

// 1. Create the context object
const GuideContext = createContext(null);

/**
 * 2. Create a custom hook for easy consumption of the context.
 * Any component that calls useGuide() will get the value from the provider.
 */
export const useGuide = () => {
    const context = useContext(GuideContext);
    if (!context) {
        // This error is helpful for debugging - it ensures you don't use the hook outside the provider
        throw new Error("useGuide must be used within a GuideProvider");
    }
    return context;
};

/**
 * 3. Create the Provider component.
 * This component will wrap our entire application. It calls the main logic hook (useGuideManager)
 * and provides all its return values to any child component that asks for them.
 */
export const GuideProvider = ({ children }) => {
    const guideManagerValues = useGuideManager();
    return (
        <GuideContext.Provider value={guideManagerValues}>
            {children}
        </GuideContext.Provider>
    );
};
