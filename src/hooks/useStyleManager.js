import { useState, useEffect, useCallback, useMemo } from 'react';
import { deepClone, isEqual } from '../utils/helpers';
import * as styleService from '../services/styleService';

/**
 * Custom Hook לניהול עיצוב המדריך בנפרד מהתוכן
 * מנהל state, שינויים, ושמירה של הגדרות העיצוב
 * 
 * @param {Function} fetchStyle - פונקציה לטעינת עיצוב מ-storage
 * @param {Function} saveStyleApi - פונקציה לשמירת עיצוב ל-storage
 * @returns {Object} אובייקט עם state ופונקציות לניהול עיצוב
 */
export const useStyleManager = (fetchStyle, saveStyleApi) => {
  // State management
  const [styleData, setStyleData] = useState(null);
  const [originalStyle, setOriginalStyle] = useState(null);
  const [isStyleLoading, setIsStyleLoading] = useState(true);
  const [isSavingStyle, setIsSavingStyle] = useState(false);

  // טעינת עיצוב ראשונית
  useEffect(() => {
    const loadStyle = async () => {
      setIsStyleLoading(true);
      console.log('🎨 טוען עיצוב מדריך...');
      
      try {
        const data = await fetchStyle();
        console.log('✅ עיצוב נטען:', data);
        setStyleData(data);
        setOriginalStyle(deepClone(data));
      } catch (error) {
        console.error('❌ שגיאה בטעינת עיצוב:', error);
      } finally {
        setIsStyleLoading(false);
      }
    };
    
    loadStyle();
  }, [fetchStyle]);

  // בדיקה האם יש שינויים שלא נשמרו
  const hasStyleChanges = useMemo(() => {
    if (!styleData || !originalStyle) return false;
    const hasChanges = !isEqual(styleData, originalStyle);
    if (hasChanges) {
      console.log('⚠️ יש שינויים שלא נשמרו בעיצוב');
    }
    return hasChanges;
  }, [styleData, originalStyle]);

  // שמירת עיצוב
  const handleSaveStyle = useCallback(async () => {
    if (!styleData) {
      console.warn('⚠️ אין נתוני עיצוב לשמירה');
      return false;
    }
    
    console.log('💾 שומר עיצוב...');
    setIsSavingStyle(true);
    
    try {
      const success = await saveStyleApi(styleData);
      
      if (success) {
        console.log('✅ עיצוב נשמר בהצלחה');
        setOriginalStyle(deepClone(styleData));
        return true;
      } else {
        console.error('❌ שמירת עיצוב נכשלה');
        return false;
      }
    } catch (error) {
      console.error('❌ שגיאה בשמירת עיצוב:', error);
      return false;
    } finally {
      setIsSavingStyle(false);
    }
  }, [styleData, saveStyleApi]);

  // עדכון גופן
  const handleUpdateFont = useCallback((fontUpdates) => {
    console.log('🔤 מעדכן גופן:', fontUpdates);
    setStyleData(prev => styleService.updateFont(prev, fontUpdates));
  }, []);

  // עדכון רקע גלובלי
  const handleUpdateBackground = useCallback((backgroundColor) => {
    console.log('🎨 מעדכן רקע:', backgroundColor);
    setStyleData(prev => styleService.updateGlobalBackground(prev, backgroundColor));
  }, []);

  // עדכון לוגו
  const handleUpdateLogo = useCallback((logoUpdates) => {
    console.log('🖼️ מעדכן לוגו:', logoUpdates);
    setStyleData(prev => styleService.updateLogo(prev, logoUpdates));
  }, []);

  // עדכון צבעים
  const handleUpdateColors = useCallback((colorUpdates) => {
    console.log('🌈 מעדכן צבעים:', colorUpdates);
    setStyleData(prev => styleService.updateColors(prev, colorUpdates));
  }, []);

  // עדכון נושא
  const handleUpdateTheme = useCallback((themeUpdates) => {
    console.log('🎭 מעדכן נושא:', themeUpdates);
    setStyleData(prev => styleService.updateTheme(prev, themeUpdates));
  }, []);

  // החלפת נושא מוכן מראש
  const handleApplyPresetTheme = useCallback((presetTheme) => {
    console.log('✨ מחליף לנושא מוכן:', presetTheme.name);
    setStyleData(prev => styleService.applyPresetTheme(prev, presetTheme));
  }, []);

  // ביטול שינויים (חזרה למצב שמור)
  const handleResetStyle = useCallback(() => {
    console.log('↩️ מבטל שינויים בעיצוב');
    setStyleData(deepClone(originalStyle));
  }, [originalStyle]);

  // ייצוא עיצוב כ-JSON (לשמירה חיצונית)
  const exportStyle = useCallback(() => {
    if (!styleData) return null;
    console.log('📤 מייצא עיצוב');
    return JSON.stringify(styleData, null, 2);
  }, [styleData]);

  // ייבוא עיצוב מ-JSON
  const importStyle = useCallback((jsonString) => {
    try {
      const importedStyle = JSON.parse(jsonString);
      const validation = styleService.validateStyleData(importedStyle);
      
      if (validation.isValid) {
        console.log('📥 מייבא עיצוב');
        setStyleData(importedStyle);
        return { success: true };
      } else {
        console.error('❌ עיצוב לא תקין:', validation.errors);
        return { success: false, errors: validation.errors };
      }
    } catch (error) {
      console.error('❌ שגיאה בייבוא עיצוב:', error);
      return { success: false, errors: ['פורמט JSON לא תקין'] };
    }
  }, []);

  // Expose all state and functions
  return {
    // State
    styleData,
    isStyleLoading,
    isSavingStyle,
    hasStyleChanges,
    
    // Actions
    handleSaveStyle,
    handleUpdateFont,
    handleUpdateBackground,
    handleUpdateLogo,
    handleUpdateColors,
    handleUpdateTheme,
    handleApplyPresetTheme,
    handleResetStyle,
    
    // Import/Export
    exportStyle,
    importStyle
  };
};

