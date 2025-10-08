import { useCallback } from 'react';
import mondaySdk from 'monday-sdk-js';
import { DEFAULT_GUIDE_TEMPLATE } from "../defaultGuideTemplate";
import { STORAGE_KEYS } from '../constants/config';
import { initializeMediaBoard, checkMediaBoardExists, checkMediaBoardValidity } from '../services/mediaBoardService';

const monday = mondaySdk();
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useMondayApi = () => {

    const fetchGuide = useCallback(async () => {
        try {
            const res = await monday.storage.instance.getItem('guideData');
            const storedString = res?.data?.value;
            if (storedString && storedString.trim() !== '') {
                return JSON.parse(storedString);
            }
            // If no data, return null to show setup screen
            return null;
        } catch (error) {
            console.error("Failed to fetch guide data:", error);
            // On failure, return null to show setup screen
            return null;
        }
    }, []);

    const saveGuide = useCallback(async (guideToSave) => {
        if (!guideToSave) return false;
        
        const jsonString = JSON.stringify(guideToSave);
        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 500;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await monday.storage.instance.setItem('guideData', jsonString);
                await sleep(RETRY_DELAY_MS);
                const verifyRes = await monday.storage.instance.getItem('guideData');
                if (verifyRes.data.value) {
                    monday.execute('notice', { message: 'המדריך נשמר בהצלחה', type: 'success' });
                    return true;
                }
            } catch (error) {
                console.error(`Save attempt ${attempt} failed:`, error);
            }
        }

        monday.execute('notice', { message: 'שגיאה קריטית בשמירת המדריך.', type: 'error' });
        return false;
    }, []);

    /**
     * קבלת קונפיגורציה דינמית של לוח המדיה
     * @returns {Promise<{boardId: string, columnIds: Object}|null>}
     */
    const getMediaBoardConfig = useCallback(async () => {
        try {
            // קריאה אחת במקום 7! 🚀
            const res = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_CONFIG);
            
            if (!res?.data?.value) {
                console.error('לא נמצאה קונפיגורציית לוח מדיה');
                return null;
            }

            const config = JSON.parse(res.data.value);
            
            if (!config?.boardId) {
                console.error('לא נמצא מזהה לוח מדיה בקונפיגורציה');
                return null;
            }

            return {
                boardId: config.boardId,
                columnIds: config.columnIds
            };
        } catch (error) {
            console.error('שגיאה בקריאת קונפיגורציית לוח מדיה:', error);
            return null;
        }
    }, []);

    /**
     * וידוא שלוח המדיה מוכן לשימוש
     * @returns {Promise<boolean>}
     */
    const ensureMediaBoardReady = useCallback(async () => {
        try {
            const exists = await checkMediaBoardExists();
            if (exists) {
                return true;
            }

            // אם לא קיים - נאתחל אותו
            const result = await initializeMediaBoard();
            return result.success;
        } catch (error) {
            console.error('שגיאה בוידוא לוח מדיה:', error);
            return false;
        }
    }, []);

    /**
     * העלאת קובץ ללוח המדיה עם context מלא
     * @param {File} file - הקובץ להעלאה
     * @param {Object} context - {guideName, chapterName, sectionName}
     * @returns {Promise<{url: string, itemId: string}|null>} - אובייקט עם URL ציבורי ו-itemId או null
     */
    const uploadFileToMediaBoard = useCallback(async (file, context) => {
        try {
            // קבלת קונפיגורציה - קריאה אחת בלבד! 🚀
            const config = await getMediaBoardConfig();
            
            if (!config) {
                throw new Error('לא נמצאה קונפיגורציית לוח מדיה');
            }

            const { boardId, columnIds } = config;
            const { guideName, chapterName, sectionName } = context;

            // console.log('📊 פרטי הקונפיגורציה:', {
            //     boardId,
            //     columnIds,
            //     contextData: { guideName, chapterName, sectionName }
            // });

            // הכנת column_values
            // console.log('🏗️ בונה column_values...');
            const columnValues = {};
            if (guideName && columnIds.guide) {
                columnValues[columnIds.guide] = { labels: [guideName] };
                // console.log(`✅ הוסף מדריך: ${guideName} לעמודה ${columnIds.guide}`);
            }
            if (chapterName && columnIds.chapter) {
                columnValues[columnIds.chapter] = { labels: [chapterName] };
                // console.log(`✅ הוסף פרק: ${chapterName} לעמודה ${columnIds.chapter}`);
            }
            if (sectionName && columnIds.section) {
                columnValues[columnIds.section] = { labels: [sectionName] };
                // console.log(`✅ הוסף סעיף: ${sectionName} לעמודה ${columnIds.section}`);
            }
            if (columnIds.date) {
                const today = new Date().toISOString().split('T')[0];
                columnValues[columnIds.date] = { date: today };
                // console.log(`✅ הוסף תאריך: ${today} לעמודה ${columnIds.date}`);
            }

            // console.log('📋 column_values הסופי:', columnValues);

            // שלב 1: יצירת אייטם עם כל הנתונים
            // console.log('🎯 שלב 1: יוצר אייטם...');
            const createItemQuery = `
                mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                    create_item(
                        board_id: $boardId,
                        item_name: $itemName,
                        column_values: $columnValues,
                        create_labels_if_missing: true
                    ) {
                        id
                    }
                }
            `;

            const createItemVars = {
                boardId,
                itemName: file.name,
                columnValues: JSON.stringify(columnValues)
            };

            // console.log('📤 שולח בקשה ליצירת אייטם:', createItemVars);
            const createItemResponse = await monday.api(createItemQuery, { variables: createItemVars });
            // console.log('📥 תגובה מיצירת אייטם:', createItemResponse);
            
            const itemId = createItemResponse.data?.create_item?.id;

            if (!itemId) {
                // console.error('❌ לא התקבל itemId מהתגובה:', createItemResponse);
                throw new Error('נכשל ביצירת אייטם');
            }

            // console.log(`✅ אייטם נוצר בהצלחה: ${itemId}`);

            // שלב 2: העלאת הקובץ
            // console.log('📁 שלב 2: מעלה קובץ...');
            const addFileQuery = `
                mutation ($file: File!, $itemId: ID!, $columnId: String!) {
                    add_file_to_column(
                        item_id: $itemId,
                        column_id: $columnId,
                        file: $file
                    ) {
                        id
                    }
                }
            `;

            const addFileVars = {
                file: file,
                itemId: itemId,
                columnId: columnIds.file
            };

            // console.log('📤 שולח בקשה להעלאת קובץ:', {
            //     fileName: file.name,
            //     fileSize: file.size,
            //     fileType: file.type,
            //     itemId,
            //     columnId: columnIds.file
            // });
            
            const uploadResponse = await monday.api(addFileQuery, { variables: addFileVars });
            // console.log('📥 תגובה מהעלאת קובץ:', uploadResponse);
            
            const assetId = uploadResponse.data?.add_file_to_column?.id;

            if (!assetId) {
                // console.error('❌ לא התקבל assetId מהתגובה:', uploadResponse);
                throw new Error('נכשל בהעלאת הקובץ');
            }

            // console.log(`✅ קובץ הועלה בהצלחה: ${assetId}`);

            // שלב 3: קבלת URL ציבורי
            // המתנה קצרה של 300ms לעיבוד הקובץ בשרת
            await sleep(300);

            const getUrlQuery = `
                query ($assetId: ID!) {
                    assets(ids: [$assetId]) {
                        url
                    }
                }
            `;

            const getUrlVars = { assetId: assetId };
            // console.log('📤 שולח בקשה לקבלת URL:', getUrlVars);
            
            const getUrlResponse = await monday.api(getUrlQuery, { variables: getUrlVars });
            // console.log('📥 תגובה מקבלת URL:', getUrlResponse);
            
            const url = getUrlResponse.data?.assets?.[0]?.url;

            if (!url) {
                // console.error('❌ לא התקבל URL מהתגובה:', getUrlResponse);
                throw new Error('נכשל בקבלת URL ציבורי');
            }

            // console.log(`✅ URL ציבורי התקבל בהצלחה: ${url}`);
            // console.log('🎉 תהליך העלאת הקובץ הושלם בהצלחה!');
            return { url, itemId };

        } catch (error) {
            console.error('❌ שגיאה בהעלאת קובץ:', error);
            throw error;
        }
    }, [getMediaBoardConfig]);

    /**
     * מחיקת אייטם מלוח המדיה
     * @param {string} itemId - מזהה האייטם למחיקה
     * @returns {Promise<boolean>} - הצלחה או כשלון
     */
    const deleteItemFromMediaBoard = useCallback(async (itemId) => {
        try {
            if (!itemId) {
                console.warn('⚠️ לא התקבל itemId למחיקה');
                return false;
            }

            console.log('🗑️ מוחק אייטם מלוח מדיה:', itemId);

            const mutation = `
                mutation ($itemId: ID!) {
                    delete_item(item_id: $itemId) {
                        id
                    }
                }
            `;

            const response = await monday.api(mutation, {
                variables: { itemId }
            });

            if (response.data?.delete_item?.id) {
                console.log('✅ אייטם נמחק בהצלחה מלוח המדיה');
                return true;
            }

            return false;
        } catch (error) {
            console.error('❌ שגיאה במחיקת אייטם מלוח מדיה:', error);
            return false;
        }
    }, []);

    return { 
        fetchGuide, 
        saveGuide, 
        getMediaBoardConfig, 
        ensureMediaBoardReady, 
        uploadFileToMediaBoard,
        deleteItemFromMediaBoard
    };
};
