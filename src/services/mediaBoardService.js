/**
 * Media Board Service
 * ניהול יצירה והגדרה של לוח המדיה האוטומטי
 */

import mondaySdk from 'monday-sdk-js';
import { STORAGE_KEYS, MEDIA_BOARD_CONFIG } from '../constants/config';

const monday = mondaySdk();

// Lock mechanism למניעת race condition (Strict Mode / Multiple calls)
let isInitializing = false;
let initializationPromise = null;

/**
 * בדיקה האם לוח המדיה כבר קיים ב-storage גלובלי
 * @returns {Promise<boolean>}
 */
export const checkMediaBoardExists = async () => {
  try {
    const res = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_ID);
    const boardId = res?.data?.value;
    return !!boardId;
  } catch (error) {
    console.error('Error checking media board existence:', error);
    return false;
  }
};

/**
 * יצירת לוח מדיה חדש עם owner
 * @returns {Promise<string|null>} - Board ID או null במקרה של כשלון
 */
export const createMediaBoard = async () => {
  try {
    // קבלת context של המשתמש הנוכחי
    let ownerId = null;
    try {
      const context = await monday.get('context');
      ownerId = context?.data?.user?.id;
      console.log(`👤 משתמש נוכחי: ${ownerId}`);
    } catch (contextError) {
      console.warn('⚠️ לא הצלחנו לקבל context של המשתמש:', contextError);
    }

    // יצירת הלוח עם או בלי owner
    const mutation = ownerId 
      ? `
        mutation {
          create_board(
            board_name: "${MEDIA_BOARD_CONFIG.BOARD_NAME}",
            board_kind: ${MEDIA_BOARD_CONFIG.BOARD_KIND},
            board_owner_ids: [${ownerId}]
          ) {
            id
          }
        }
      `
      : `
        mutation {
          create_board(
            board_name: "${MEDIA_BOARD_CONFIG.BOARD_NAME}",
            board_kind: ${MEDIA_BOARD_CONFIG.BOARD_KIND}
          ) {
            id
          }
        }
      `;
    
    const response = await monday.api(mutation);
    const boardId = response.data?.create_board?.id;
    
    if (!boardId) {
      throw new Error('Failed to get board ID from response');
    }
    
    console.log(`✅ לוח מדיה נוצר בהצלחה: ${boardId}`);
    return boardId;
  } catch (error) {
    console.error('❌ שגיאה ביצירת לוח מדיה:', error);
    return null;
  }
};

/**
 * יצירת עמודות ללוח המדיה
 * @param {string} boardId - מזהה הלוח
 * @returns {Promise<Object|null>} - אובייקט עם מזהי העמודות או null
 */
export const createMediaBoardColumns = async (boardId) => {
  try {
    const columnIds = {};
    
    for (const column of MEDIA_BOARD_CONFIG.COLUMNS) {
      const mutation = `
        mutation {
          create_column(
            board_id: ${boardId},
            title: "${column.title}",
            column_type: ${column.type}
          ) {
            id
            title
          }
        }
      `;
      
      const response = await monday.api(mutation);
      const columnId = response.data?.create_column?.id;
      
      if (!columnId) {
        throw new Error(`Failed to create column: ${column.title}`);
      }
      
      columnIds[column.id] = columnId;
      console.log(`✅ עמודה נוצרה: ${column.title} (${columnId})`);
    }
    
    return columnIds;
  } catch (error) {
    console.error('❌ שגיאה ביצירת עמודות:', error);
    return null;
  }
};

/**
 * קבלת URL של הלוח מ-API
 * @param {string} boardId - מזהה הלוח
 * @returns {Promise<string|null>} - URL של הלוח או null
 */
export const getBoardUrl = async (boardId) => {
  try {
    const query = `
      query {
        boards (ids: ${boardId}) {
          url
        }
      }
    `;
    
    const response = await monday.api(query);
    const url = response.data?.boards?.[0]?.url;
    
    if (!url) {
      throw new Error('Failed to get board URL from response');
    }
    
    console.log(`✅ URL של הלוח: ${url}`);
    return url;
  } catch (error) {
    console.error('❌ שגיאה בקבלת URL של הלוח:', error);
    return null;
  }
};

/**
 * שמירת קונפיגורציה של לוח המדיה ב-storage גלובלי
 * @param {string} boardId - מזהה הלוח
 * @param {string} boardUrl - URL של הלוח
 * @param {Object} columnIds - אובייקט עם מזהי העמודות
 * @returns {Promise<boolean>} - הצלחה או כשלון
 */
export const saveMediaBoardConfig = async (boardId, boardUrl, columnIds) => {
  try {
    // שמירת מזהה הלוח ו-URL ב-storage גלובלי (לכל החשבון)
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_ID, boardId);
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_URL, boardUrl);
    
    // שמירת מזהי העמודות
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_NAME_COL, 'name'); // עמודת שם ברירת מחדל
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_GUIDE_COL, columnIds.guide);
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_CHAPTER_COL, columnIds.chapter);
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_SECTION_COL, columnIds.section);
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_DATE_COL, columnIds.date);
    await monday.storage.setItem(STORAGE_KEYS.MEDIA_BOARD_FILE_COL, columnIds.file);
    
    console.log('✅ קונפיגורציית לוח מדיה נשמרה בהצלחה ב-storage גלובלי');
    return true;
  } catch (error) {
    console.error('❌ שגיאה בשמירת קונפיגורציה:', error);
    return false;
  }
};

/**
 * פונקציה מאסטר לאתחול לוח המדיה
 * בודקת אם קיים, אם לא - יוצרת לוח, עמודות ושומרת קונפיגורציה
 * @returns {Promise<{success: boolean, boardId: string|null, boardUrl: string|null, message: string}>}
 */
export const initializeMediaBoard = async () => {
  // 🔒 Lock Mechanism - אם כבר יש תהליך אתחול רץ, נחזיר את אותו Promise
  if (isInitializing && initializationPromise) {
    console.log('⏳ אתחול כבר רץ, ממתין לתהליך הקיים...');
    return initializationPromise;
  }

  // סימון שמתחילים אתחול
  isInitializing = true;
  
  // יצירת Promise שנשמור
  initializationPromise = (async () => {
    try {
      // בדיקה ראשונה - האם כבר קיים?
      const exists = await checkMediaBoardExists();
      if (exists) {
        console.log('✅ לוח המדיה כבר קיים ב-storage גלובלי');
        const boardIdRes = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_ID);
        const boardUrlRes = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_URL);
        const boardId = boardIdRes?.data?.value;
        const boardUrl = boardUrlRes?.data?.value;
        
        return {
          success: true,
          boardId,
          boardUrl,
          message: 'לוח המדיה כבר קיים'
        };
      }
      
      // יצירת לוח חדש
      console.log('🚀 מתחיל יצירת לוח מדיה...');
      
      // 🔒 Double-Check - אולי תהליך מקביל כבר יצר?
      const doubleCheck = await checkMediaBoardExists();
      if (doubleCheck) {
        console.log('⚠️ לוח כבר נוצר על ידי תהליך מקביל');
        const boardIdRes = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_ID);
        const boardUrlRes = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_URL);
        return {
          success: true,
          boardId: boardIdRes?.data?.value,
          boardUrl: boardUrlRes?.data?.value,
          message: 'לוח המדיה כבר קיים'
        };
      }
      
      const boardId = await createMediaBoard();
      if (!boardId) {
        return {
          success: false,
          boardId: null,
          boardUrl: null,
          message: 'נכשל ביצירת לוח המדיה'
        };
      }
      
      // קבלת URL של הלוח
      console.log('🔗 מאחזר URL של הלוח...');
      const boardUrl = await getBoardUrl(boardId);
      if (!boardUrl) {
        return {
          success: false,
          boardId,
          boardUrl: null,
          message: 'נכשל בקבלת URL של הלוח'
        };
      }
      
      // יצירת עמודות
      console.log('📋 יוצר עמודות ללוח...');
      const columnIds = await createMediaBoardColumns(boardId);
      if (!columnIds) {
        return {
          success: false,
          boardId,
          boardUrl,
          message: 'נכשל ביצירת העמודות'
        };
      }
      
      // שמירת קונפיגורציה
      console.log('💾 שומר קונפיגורציה...');
      const saved = await saveMediaBoardConfig(boardId, boardUrl, columnIds);
      if (!saved) {
        return {
          success: false,
          boardId,
          boardUrl,
          message: 'נכשל בשמירת הקונפיגורציה'
        };
      }
    
      return {
        success: true,
        boardId,
        boardUrl,
        message: 'לוח המדיה נוצר בהצלחה! 🎉'
      };
    } catch (error) {
      console.error('❌ שגיאה כללית באתחול לוח מדיה:', error);
      return {
        success: false,
        boardId: null,
        boardUrl: null,
        message: `שגיאה: ${error.message}`
      };
    } finally {
      // איפוס הדגלים בסוף - חשוב!
      isInitializing = false;
      initializationPromise = null;
    }
  })();
  
  return initializationPromise;
};

/**
 * קבלת מזהה לוח המדיה מה-storage גלובלי
 * @returns {Promise<string|null>}
 */
export const getMediaBoardId = async () => {
  try {
    const res = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_ID);
    return res?.data?.value || null;
  } catch (error) {
    console.error('Error getting media board ID:', error);
    return null;
  }
};

/**
 * קבלת URL של לוח המדיה מה-storage גלובלי
 * @returns {Promise<string|null>}
 */
export const getMediaBoardUrlFromStorage = async () => {
  try {
    const res = await monday.storage.getItem(STORAGE_KEYS.MEDIA_BOARD_URL);
    return res?.data?.value || null;
  } catch (error) {
    console.error('Error getting media board URL:', error);
    return null;
  }
};
