/**
 * Style Service - Business logic for style management
 * מנהל את כל הפעולות הקשורות לעיצוב המדריך
 * 
 * @version 4.0
 */

/**
 * עדכון הגדרות גופן
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {Object} fontUpdates - עדכונים לגופן (family, size, lineHeight)
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const updateFont = (styleData, fontUpdates) => {
  return {
    ...styleData,
    font: { ...styleData.font, ...fontUpdates },
    lastModified: new Date().toISOString()
  };
};

/**
 * עדכון רקע גלובלי
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {string} backgroundColor - צבע רקע חדש
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const updateGlobalBackground = (styleData, backgroundColor) => {
  return {
    ...styleData,
    globalBackground: backgroundColor,
    lastModified: new Date().toISOString()
  };
};

/**
 * עדכון הגדרות לוגו
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {Object} logoUpdates - עדכונים ללוגו (url, size, alignment, display)
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const updateLogo = (styleData, logoUpdates) => {
  return {
    ...styleData,
    logo: { ...styleData.logo, ...logoUpdates },
    lastModified: new Date().toISOString()
  };
};

/**
 * עדכון פלטת צבעים
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {Object} colorUpdates - עדכוני צבעים (primary, secondary, accent)
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const updateColors = (styleData, colorUpdates) => {
  return {
    ...styleData,
    colors: { ...styleData.colors, ...colorUpdates },
    lastModified: new Date().toISOString()
  };
};

/**
 * עדכון ערכת נושא
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {Object} themeUpdates - עדכוני נושא (mode, name)
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const updateTheme = (styleData, themeUpdates) => {
  return {
    ...styleData,
    theme: { ...styleData.theme, ...themeUpdates },
    lastModified: new Date().toISOString()
  };
};

/**
 * החלפת ערכת נושא שלמה
 * @param {Object} styleData - אובייקט העיצוב הנוכחי
 * @param {Object} presetTheme - ערכת נושא מוכנה מראש
 * @returns {Object} אובייקט עיצוב מעודכן
 */
export const applyPresetTheme = (styleData, presetTheme) => {
  return {
    ...styleData,
    globalBackground: presetTheme.globalBackground,
    colors: { ...presetTheme.colors },
    theme: {
      ...styleData.theme,
      name: presetTheme.name
    },
    lastModified: new Date().toISOString()
  };
};

// ============================================
// פונקציות מיגרציה
// ============================================

/**
 * מיגרציה: חילוץ עיצוב מ-guideData ישן
 * פונקציה זו לוקחת את כל הגדרות העיצוב מתוך guideData
 * ויוצרת אובייקט guideStyle חדש
 * 
 * @param {Object} guideData - נתוני המדריך המלאים עם עיצוב מוטמע
 * @returns {Object} אובייקט guideStyle חדש
 */
export const migrateStyleFromGuideData = (guideData) => {
  const extractedStyle = {
    version: "4.0",
    lastModified: new Date().toISOString(),
    
    // חילוץ רקע גלובלי
    globalBackground: guideData.globalBackground || guideData.style?.background?.color || "#ffffff",
    
    // חילוץ הגדרות גופן
    font: {
      family: guideData.style?.font?.family || "Open Sans",
      size: guideData.style?.font?.size || "16px",
      lineHeight: guideData.style?.font?.lineHeight || "1.6"
    },
    
    // חילוץ הגדרות לוגו
    logo: {
      url: guideData.style?.logo?.url || "",
      size: guideData.style?.logo?.size || "medium",
      alignment: guideData.style?.logo?.alignment || "center",
      display: guideData.style?.logo?.display !== undefined ? guideData.style.logo.display : true
    },
    
    // חילוץ פלטת צבעים
    colors: {
      primary: guideData.style?.colors?.primary || "#0073ea",
      secondary: guideData.style?.colors?.secondary || "#323338",
      accent: guideData.style?.colors?.accent || "#00d647"
    },
    
    // חילוץ הגדרות נושא
    theme: {
      mode: guideData.style?.theme?.mode || "light",
      name: guideData.style?.theme?.name || "default"
    }
  };
  
  console.log('✅ עיצוב חולץ בהצלחה מ-guideData:', extractedStyle);
  return extractedStyle;
};

/**
 * ניקוי עיצוב מ-guideData
 * מסיר את כל שדות העיצוב מ-guideData כדי להימנע מכפילות
 * 
 * @param {Object} guideData - נתוני המדריך עם עיצוב
 * @returns {Object} נתוני מדריך נקיים ללא עיצוב
 */
export const removeStyleFromGuideData = (guideData) => {
  const cleaned = { ...guideData };
  
  // הסרת שדות עיצוב
  delete cleaned.style;
  delete cleaned.globalBackground;
  
  console.log('✅ עיצוב הוסר מ-guideData');
  return cleaned;
};

/**
 * בדיקה אם guideData מכיל עיצוב שטרם הועבר
 * @param {Object} guideData - נתוני המדריך
 * @returns {boolean} true אם יש עיצוב שצריך למגרר
 */
export const hasEmbeddedStyle = (guideData) => {
  return !!(guideData?.style || guideData?.globalBackground);
};

/**
 * ולידציה של אובייקט עיצוב
 * @param {Object} styleData - אובייקט עיצוב לבדיקה
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateStyleData = (styleData) => {
  const errors = [];
  
  if (!styleData) {
    errors.push('אובייקט עיצוב חסר');
    return { isValid: false, errors };
  }
  
  // בדיקת שדות חובה
  if (!styleData.version) errors.push('גרסה חסרה');
  if (!styleData.globalBackground) errors.push('רקע גלובלי חסר');
  if (!styleData.font) errors.push('הגדרות גופן חסרות');
  if (!styleData.colors) errors.push('פלטת צבעים חסרה');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

