import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useGuideManager } from '../hooks/useGuideManager';
import { useStyleManager } from '../hooks/useStyleManager';
import { useMondayApi } from '../hooks/useMondayApi';
import { initializeMediaBoard, checkMediaBoardValidity, clearMediaBoardStorage } from '../services/mediaBoardService';
import MediaBoardDialog from '../components/MediaBoardDialog';

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
    
    // Get Monday API functions (including new style functions)
    const { fetchStyle, saveStyle, migrateStyleToSeparateStorage } = useMondayApi();
    
    // Style Manager - NEW in v4.0 - manages style separately from content
    const styleManagerValues = useStyleManager(fetchStyle, saveStyle);
    
    // State לניהול לוח המדיה - אתחול מרכזי פעם אחת
    const [mediaBoardState, setMediaBoardState] = useState({
        isInitializing: true,
        isReady: false,
        boardId: null,
        boardUrl: null,
        message: 'מכין תשתית אחסון קבצים...'
    });

    // State לתיבת דו-שיח
    const [mediaBoardDialog, setMediaBoardDialog] = useState({
        isOpen: false,
        isChecking: false,
        message: '',
        onConfirm: null,
        onCancel: null
    });

    // פונקציה ליצירת לוח מדיה חדש
    const initializeMediaBoardWithState = useCallback(async () => {
        setMediaBoardState(prev => ({
            ...prev,
            isInitializing: true,
            message: '🚀 יוצר לוח מדיה חדש...'
        }));

        try {
            const result = await initializeMediaBoard();
            
            if (result.success) {
                setMediaBoardState({
                    isInitializing: false,
                    isReady: true,
                    boardId: result.boardId,
                    boardUrl: result.boardUrl,
                    message: '✅ לוח המדיה נוצר בהצלחה!'
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
            console.error('שגיאה ביצירת לוח מדיה:', error);
            setMediaBoardState({
                isInitializing: false,
                isReady: false,
                boardId: null,
                boardUrl: null,
                message: '⚠️ שגיאה ביצירת לוח המדיה'
            });
        }
    }, []);

    // פונקציה לבדיקת תקינות לוח מדיה עם תיבת דו-שיח
    const checkMediaBoardWithDialog = useCallback(async () => {
        setMediaBoardState(prev => ({
            ...prev,
            isInitializing: true,
            message: '🔍 בודק תקינות לוח מדיה...'
        }));

        try {
            const validity = await checkMediaBoardValidity();
            
            if (validity.isValid) {
                // הלוח תקין - ממשיכים
                setMediaBoardState({
                    isInitializing: false,
                    isReady: true,
                    boardId: validity.boardId,
                    boardUrl: validity.boardUrl,
                    message: '✅ לוח המדיה תקין'
                });
                return;
            }
            
            // הלוח לא תקין - מציגים תיבת אישור
            setMediaBoardState(prev => ({
                ...prev,
                isInitializing: false
            }));

            setMediaBoardDialog({
                isOpen: true,
                isChecking: false,
                message: `⚠️ ${validity.message}\n\nהאם ליצור לוח מדיה חדש?`,
                onConfirm: async () => {
                    setMediaBoardDialog(prev => ({ ...prev, isOpen: false }));
                    // ניקוי storage הישן
                    await clearMediaBoardStorage();
                    // יצירת לוח חדש
                    await initializeMediaBoardWithState();
                },
                onCancel: () => {
                    setMediaBoardDialog(prev => ({ ...prev, isOpen: false }));
                    setMediaBoardState({
                        isInitializing: false,
                        isReady: false,
                        boardId: null,
                        boardUrl: null,
                        message: '⚠️ לוח מדיה לא זמין'
                    });
                }
            });
            
        } catch (error) {
            console.error('שגיאה בבדיקת לוח מדיה:', error);
            setMediaBoardState({
                isInitializing: false,
                isReady: false,
                boardId: null,
                boardUrl: null,
                message: '⚠️ שגיאה בבדיקת לוח המדיה'
            });
        }
    }, [initializeMediaBoardWithState]);

    // אתחול לוח המדיה - בדיקה אם יש מדריך טעון
    useEffect(() => {
        let isMounted = true;
        
        const initMediaBoard = async () => {
            // אם יש מדריך טעון - בודקים תקינות לוח מדיה
            if (guideManagerValues.guideData) {
                await checkMediaBoardWithDialog();
            } else {
                // אין מדריך - יוצרים לוח מדיה חדש
                await initializeMediaBoardWithState();
            }
        };

        initMediaBoard();

        return () => {
            isMounted = false;
        };
    }, [guideManagerValues.guideData, checkMediaBoardWithDialog, initializeMediaBoardWithState]);
    
    // מיגרציה חד-פעמית של עיצוב - NEW in v4.0
    // מריץ את המיגרציה פעם אחת כשהאפליקציה נטענת
    useEffect(() => {
        const runStyleMigration = async () => {
            console.log('🔄 מריץ מיגרציית עיצוב חד-פעמית...');
            await migrateStyleToSeparateStorage();
        };
        
        // רק אם יש guideData נטען
        if (guideManagerValues.guideData && !guideManagerValues.isLoading) {
            runStyleMigration();
        }
    }, [guideManagerValues.guideData, guideManagerValues.isLoading, migrateStyleToSeparateStorage]);
    
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
                fullName: chapter.title
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
        ...styleManagerValues,  // Style management - NEW in v4.0
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
            <MediaBoardDialog
                isOpen={mediaBoardDialog.isOpen}
                isChecking={mediaBoardDialog.isChecking}
                message={mediaBoardDialog.message}
                onConfirm={mediaBoardDialog.onConfirm}
                onCancel={mediaBoardDialog.onCancel}
            />
        </GuideContext.Provider>
    );
};

// Add displayName for Fast Refresh compatibility
GuideProvider.displayName = 'GuideProvider';
