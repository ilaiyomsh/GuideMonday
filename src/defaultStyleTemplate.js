/**
 * תבנית עיצוב ברירת מחדל למדריך
 * קובץ זה מכיל את הגדרות העיצוב הבסיסיות שנטענות בהעדר עיצוב שמור
 * 
 * @version 4.0
 * @created 2025-10-12
 */

export const DEFAULT_STYLE_TEMPLATE = {
  // גרסת העיצוב - לצורכי מיגרציות עתידיות
  version: "4.0",
  
  // חותמת זמן של עדכון אחרון
  lastModified: new Date().toISOString(),
  
  // רקע גלובלי של המדריך
  globalBackground: "#ffffff",
  
  // הגדרות גופן
  font: {
    family: "Open Sans",
    size: "16px",
    lineHeight: "1.6"
  },
  
  // הגדרות לוגו וכותרת
  logo: {
    image: "",
    altText: "",
    size: "medium", // small, medium, large
    alignment: "center", // left, center, right
    display: true
  },
  
  // פלטת צבעים של המדריך
  colors: {
    primary: "#0073ea",    // צבע ראשי
    secondary: "#323338",  // צבע משני
    accent: "#00d647"      // צבע הדגשה
  },
  
  // הגדרות ערכת נושא
  theme: {
    mode: "light",      // light, dark
    name: "default"     // default, professional, creative, minimal
  }
};

/**
 * פונקציה ליצירת עיצוב ברירת מחדל חדש עם חותמת זמן מעודכנת
 * @returns {Object} אובייקט עיצוב חדש
 */
export const createFreshDefaultStyle = () => ({
  ...DEFAULT_STYLE_TEMPLATE,
  lastModified: new Date().toISOString()
});

/**
 * ערכות נושא מוכנות מראש שניתן לבחור
 */
export const PRESET_THEMES = {
  default: {
    name: "ברירת מחדל",
    globalBackground: "#ffffff",
    colors: {
      primary: "#0073ea",
      secondary: "#323338",
      accent: "#00d647"
    }
  },
  professional: {
    name: "מקצועי",
    globalBackground: "#f8f9fa",
    colors: {
      primary: "#1a1a1a",
      secondary: "#4a5568",
      accent: "#3b82f6"
    }
  },
  creative: {
    name: "יצירתי",
    globalBackground: "#fef3c7",
    colors: {
      primary: "#f59e0b",
      secondary: "#dc2626",
      accent: "#8b5cf6"
    }
  },
  minimal: {
    name: "מינימליסטי",
    globalBackground: "#fafafa",
    colors: {
      primary: "#171717",
      secondary: "#737373",
      accent: "#a3a3a3"
    }
  },
  ocean: {
    name: "אוקיינוס",
    globalBackground: "#e0f2fe",
    colors: {
      primary: "#0284c7",
      secondary: "#0369a1",
      accent: "#06b6d4"
    }
  }
};

