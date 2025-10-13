/**
 * פונקציות מיגרציה למבנה נתוני המדריך
 * מוסיפות שדות חדשים למדריכים קיימים
 */

/**
 * מיגרציה לגרסה 2.0 - הוספת אובייקט style
 * @param {Object} guideData - נתוני המדריך הקיימים
 * @returns {Object} - נתוני המדריך עם המבנה החדש
 */
export function migrateToV2(guideData) {
  // בדיקה אם המדריך כבר מכיל את האובייקט style
  if (guideData.style) {
    return guideData; // המדריך כבר מעודכן
  }

  // יצירת העתק של הנתונים כדי לא לשנות את המקור
  const migratedGuide = { ...guideData };

  // הוספת אובייקט style עם ערכי ברירת מחדל
  migratedGuide.style = {
    background: {
      color: migratedGuide.globalBackground || null, // העברת הערך הקיים
      type: "solid"
    },
    logo: {
      image: null,
      altText: "LOGO",
      size: "medium",
      alignment: "center"
    },
    font: {
      family: "Open Sans",
      size: "medium", 
      weight: "normal",
      direction: "rtl"
    }
  };

  // שמירה על globalBackground לתאימות לאחור
  if (!migratedGuide.globalBackground) {
    migratedGuide.globalBackground = migratedGuide.style.background.color;
  }

  return migratedGuide;
}

/**
 * מיגרציה אוטומטית - בודקת את גרסת המדריך ומפעילה מיגרציות נדרשות
 * @param {Object} guideData - נתוני המדריך
 * @returns {Object} - נתוני המדריך המעודכנים
 */
export function autoMigrate(guideData) {
  let migratedGuide = { ...guideData };

  // בדיקה אם יש שדה גרסה
  const version = migratedGuide.version || 1;

  // מיגרציה לגרסה 2.0
  if (version < 2) {
    migratedGuide = migrateToV2(migratedGuide);
    migratedGuide.version = 2;
  }

  return migratedGuide;
}

/**
 * בדיקה אם מדריך צריך מיגרציה
 * @param {Object} guideData - נתוני המדריך
 * @returns {boolean} - true אם נדרשת מיגרציה
 */
export function needsMigration(guideData) {
  return !guideData.style || (guideData.version && guideData.version < 2);
}

/**
 * יצירת גיבוי לפני מיגרציה
 * @param {Object} guideData - נתוני המדריך המקוריים
 * @returns {string} - JSON string של הגיבוי
 */
export function createBackup(guideData) {
  return JSON.stringify(guideData, null, 2);
}

/**
 * שחזור מגיבוי
 * @param {string} backupData - נתוני הגיבוי
 * @returns {Object} - נתוני המדריך המשוחזרים
 */
export function restoreFromBackup(backupData) {
  try {
    return JSON.parse(backupData);
  } catch (error) {
    console.error('שגיאה בשחזור הגיבוי:', error);
    return null;
  }
}
