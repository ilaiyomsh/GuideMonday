import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useGuideManager } from '../hooks/useGuideManager';
import { initializeMediaBoard } from '../services/mediaBoardService';

// 1. Create the context object
const GuideContext = createContext(null);

// Add displayName for better debugging and Fast Refresh compatibility
GuideContext.displayName = 'GuideContext';

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
    
    // State לניהול לוח המדיה - אתחול מרכזי פעם אחת
    const [mediaBoardState, setMediaBoardState] = useState({
        isInitializing: true,
        isReady: false,
        boardId: null,
        boardUrl: null,
        message: 'מכין תשתית אחסון קבצים...'
    });

    // אתחול לוח המדיה פעם אחת בלבד
    useEffect(() => {
        let isMounted = true;
        
        const initMediaBoard = async () => {
            setMediaBoardState(prev => ({
                ...prev,
                isInitializing: true,
                message: '🚀 מכין תשתית אחסון קבצים...'
            }));

            try {
                const result = await initializeMediaBoard();
                
                if (!isMounted) return; // Prevent state update if unmounted
                
                if (result.success) {
                    setMediaBoardState({
                        isInitializing: false,
                        isReady: true,
                        boardId: result.boardId,
                        boardUrl: result.boardUrl,
                        message: '✅ תשתית אחסון הקבצים מוכנה!'
                    });
                } else {
                    setMediaBoardState({
                        isInitializing: false,
                        isReady: false,
                        boardId: null,
                        boardUrl: null,
                        message: `⚠️ ${result.message}`
                    });
                }
            } catch (error) {
                console.error('שגיאה באתחול לוח מדיה:', error);
                
                if (!isMounted) return;
                
                setMediaBoardState({
                    isInitializing: false,
                    isReady: false,
                    boardId: null,
                    boardUrl: null,
                    message: '⚠️ שגיאה בהכנת תשתית הקבצים'
                });
            }
        };

        initMediaBoard();

        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array - run only once!
    
    // פונקציות עזר לקבלת context של פרק וסעיף
    const getChapterContext = useMemo(() => {
        return (chapterId) => {
            if (!guideManagerValues.guideData?.chapters) return null;
            const chapterIndex = guideManagerValues.guideData.chapters.findIndex(ch => ch.id === chapterId);
            if (chapterIndex === -1) return null;
            const chapter = guideManagerValues.guideData.chapters[chapterIndex];
            return {
                name: chapter.title,
                index: chapterIndex,
                fullName: `פרק ${chapterIndex + 1}: ${chapter.title}`
            };
        };
    }, [guideManagerValues.guideData]);

    const getSectionContext = useMemo(() => {
        return (chapterId, sectionId) => {
            if (!guideManagerValues.guideData?.chapters) return null;
            const chapter = guideManagerValues.guideData.chapters.find(ch => ch.id === chapterId);
            if (!chapter?.sections) return null;
            const sectionIndex = chapter.sections.findIndex(sec => sec.id === sectionId);
            if (sectionIndex === -1) return null;
            const section = chapter.sections[sectionIndex];
            const chapterIndex = guideManagerValues.guideData.chapters.findIndex(ch => ch.id === chapterId);
            return {
                name: section.title,
                index: sectionIndex,
                fullName: `סעיף ${chapterIndex + 1}.${sectionIndex + 1}: ${section.title}`
            };
        };
    }, [guideManagerValues.guideData]);

    // שם המדריך
    const guideName = useMemo(() => {
        return guideManagerValues.guideData?.guideName || 
               guideManagerValues.guideData?.homePage?.title || 
               'המדריך שלי';
    }, [guideManagerValues.guideData]);

    const contextValue = {
        ...guideManagerValues,
        direction: 'rtl', // Hebrew direction
        guideName,
        getChapterContext,
        getSectionContext,
        // Media Board State
        mediaBoardState
    };
    
    return (
        <GuideContext.Provider value={contextValue}>
            {children}
        </GuideContext.Provider>
    );
};

// Add displayName for Fast Refresh compatibility
GuideProvider.displayName = 'GuideProvider';
