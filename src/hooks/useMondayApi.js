import { useCallback } from 'react';
import mondaySdk from 'monday-sdk-js';
import { DEFAULT_GUIDE_TEMPLATE } from "../defaultGuideTemplate";
import { STORAGE_KEYS } from '../constants/config';
import { initializeMediaBoard, checkMediaBoardExists } from '../services/mediaBoardService';

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
            const boardId = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_ID);
            const nameCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_NAME_COL);
            const fileCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_FILE_COL);
            const guideCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_GUIDE_COL);
            const chapterCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_CHAPTER_COL);
            const sectionCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_SECTION_COL);
            const dateCol = await monday.storage.instance.getItem(STORAGE_KEYS.MEDIA_BOARD_DATE_COL);

            if (!boardId?.data?.value) {
                console.error('לא נמצא מזהה לוח מדיה');
                return null;
            }

            return {
                boardId: boardId.data.value,
                columnIds: {
                    name: nameCol?.data?.value || 'name',
                    file: fileCol?.data?.value,
                    guide: guideCol?.data?.value,
                    chapter: chapterCol?.data?.value,
                    section: sectionCol?.data?.value,
                    date: dateCol?.data?.value
                }
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
     * @returns {Promise<string|null>} - URL ציבורי של הקובץ או null
     */
    const uploadFileToMediaBoard = useCallback(async (file, context) => {
        try {
            // קבלת קונפיגורציה
            const config = await getMediaBoardConfig();
            if (!config) {
                throw new Error('לא נמצאה קונפיגורציית לוח מדיה');
            }

            const { boardId, columnIds } = config;
            const { guideName, chapterName, sectionName } = context;

            // הכנת column_values
            const columnValues = {};
            if (guideName && columnIds.guide) {
                columnValues[columnIds.guide] = { labels: [guideName] };
            }
            if (chapterName && columnIds.chapter) {
                columnValues[columnIds.chapter] = { labels: [chapterName] };
            }
            if (sectionName && columnIds.section) {
                columnValues[columnIds.section] = { labels: [sectionName] };
            }
            if (columnIds.date) {
                const today = new Date().toISOString().split('T')[0];
                columnValues[columnIds.date] = { date: today };
            }

            // שלב 1: יצירת אייטם עם כל הנתונים
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

            const createItemResponse = await monday.api(createItemQuery, { variables: createItemVars });
            const itemId = createItemResponse.data?.create_item?.id;

            if (!itemId) {
                throw new Error('נכשל ביצירת אייטם');
            }

            console.log(`✅ אייטם נוצר: ${itemId}`);

            // שלב 2: העלאת הקובץ
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

            const uploadResponse = await monday.api(addFileQuery, { variables: addFileVars });
            const assetId = uploadResponse.data?.add_file_to_column?.id;

            if (!assetId) {
                throw new Error('נכשל בהעלאת הקובץ');
            }

            console.log(`✅ קובץ הועלה: ${assetId}`);

            // שלב 3: קבלת URL ציבורי
            await sleep(1000); // המתנה קצרה לעיבוד

            const getUrlQuery = `
                query ($assetId: [ID!]) {
                    assets(ids: $assetId) {
                        public_url
                    }
                }
            `;

            const getUrlVars = { assetId: [assetId] };
            const getUrlResponse = await monday.api(getUrlQuery, { variables: getUrlVars });
            const url = getUrlResponse.data?.assets?.[0]?.public_url;

            if (!url) {
                throw new Error('נכשל בקבלת URL ציבורי');
            }

            console.log(`✅ URL ציבורי: ${url}`);
            return url;

        } catch (error) {
            console.error('❌ שגיאה בהעלאת קובץ:', error);
            throw error;
        }
    }, [getMediaBoardConfig]);

    return { 
        fetchGuide, 
        saveGuide, 
        getMediaBoardConfig, 
        ensureMediaBoardReady, 
        uploadFileToMediaBoard 
    };
};
