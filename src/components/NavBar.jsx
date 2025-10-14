import React, { useRef, useState } from 'react';
import { useGuide } from '../context/GuideContext';
import { Home, NavigationChevronRight, NavigationChevronLeft, Edit, Check, Download, Upload, Gallery, Broom } from '@vibe/icons';
import { Dialog, DialogContentContainer } from '@vibe/core';
import SearchBar from './SearchBar';
import StyleSettings from './StyleSettings';

export default function NavBar({ currentPage, currentChapterId, onNavigate, onOpenUploadModal }) {
  const fileInputRef = useRef(null);
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  
  const { 
    guideData, 
    isEditMode, 
    setIsEditMode, 
    isOwner, 
    handleSave,
    mediaBoardState,
    loadGuideData,
    handleUpdateStyleSettings
  } = useGuide();


  if (!guideData) return null;

  // חישוב אינדקס הפרק הנוכחי
  const currentChapterIndex = guideData.chapters?.findIndex(ch => ch.id === currentChapterId) ?? -1;

  // ניווט לפרק הבא
  const handleNextChapter = () => {
    if (currentPage === 'home-page' && guideData.chapters && guideData.chapters.length > 0) {
      onNavigate('chapter-page', guideData.chapters[0].id);
    } else if (currentChapterIndex < guideData.chapters.length - 1) {
      onNavigate('chapter-page', guideData.chapters[currentChapterIndex + 1].id);
    }
  };

  // ניווט לפרק קודם
  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      onNavigate('chapter-page', guideData.chapters[currentChapterIndex - 1].id);
    } else if (currentChapterIndex === 0) {
      onNavigate('home-page');
    }
  };

  // ניווט לדף הבית
  const handleHome = () => {
    onNavigate('home-page');
  };

  // מצב כפתורים
  const isPrevDisabled = currentPage === 'home-page';
  const isNextDisabled = 
    currentPage === 'chapter-page' && 
    currentChapterIndex === guideData.chapters.length - 1;

  // שמות פרקים ל-tooltips
  const getPrevChapterTitle = () => {
    if (currentPage === 'home-page') return 'עמוד הבית';
    if (currentChapterIndex > 0) {
      return guideData.chapters[currentChapterIndex - 1]?.title || 'פרק קודם';
    }
    return 'עמוד הבית';
  };

  const getNextChapterTitle = () => {
    if (currentPage === 'home-page' && guideData.chapters.length > 0) {
      return guideData.chapters[0]?.title || 'פרק הבא';
    }
    if (currentChapterIndex < guideData.chapters.length - 1) {
      return guideData.chapters[currentChapterIndex + 1]?.title || 'פרק הבא';
    }
    return 'פרק הבא';
  };

  // פתיחת לוח מדיה
  const handleOpenMediaBoard = () => {
    if (mediaBoardState.boardUrl) {
      window.open(mediaBoardState.boardUrl, '_blank');
    } else {
      alert('לוח המדיה עדיין לא מוכן');
    }
  };

  // טיפול במצב עריכה
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveClick = async () => {
    await handleSave();
    try {
      const evt = new CustomEvent('guide:saved', { detail: { ts: Date.now() } });
      window.dispatchEvent(evt);
    } catch {}
  };

  // הורדת המדריך הנוכחי כ-JSON
  const handleDownloadGuide = () => {
    try {
      const dataStr = JSON.stringify(guideData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const guideName = guideData.guideName || 'guide';
      const exportFileDefaultName = `${guideName.replace(/\s+/g, '_')}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert(`שגיאה בהורדת המדריך: ${error.message}`);
    }
  };

  // טעינת קובץ JSON חדש
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('אנא בחרו קובץ JSON בלבד');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const newGuideData = JSON.parse(e.target.result);
        
        // Validate guide structure
        if (!newGuideData.homePage || !newGuideData.chapters) {
          throw new Error('קובץ המדריך אינו תקין - חסרים homePage או chapters');
        }

        // אישור החלפה
        const confirmReplace = window.confirm(
          'האם אתם בטוחים שברצונכם להחליף את המדריך הנוכחי? השינויים שלא נשמרו יאבדו.'
        );

        if (confirmReplace) {
          loadGuideData(newGuideData);
          alert('המדריך הוחלף בהצלחה!');
        }
      } catch (error) {
        alert(`שגיאה בקובץ: ${error.message}`);
      }
    };

    reader.onerror = () => {
      alert('שגיאה בקריאת הקובץ');
    };

    reader.readAsText(file);
    
    // איפוס input כדי לאפשר טעינת אותו קובץ שוב
    event.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="top-navbar">
      {/* חיפוש וניווט */}
      <div className="navbar-center">
        <SearchBar onNavigate={onNavigate} />
        
        <div className="navbar-navigation">
          <button
            className="navbar-nav-button"
            onClick={handleHome}
            title="עמוד הבית"
            disabled={currentPage === 'home-page'}
          >
            <Home />
          </button>
          
        <button
          className="navbar-nav-button"
          onClick={handlePrevChapter}
          title={getPrevChapterTitle()}
          disabled={isPrevDisabled}
        >
          <NavigationChevronRight />
        </button>

        <button
          className="navbar-nav-button"
          onClick={handleNextChapter}
          title={getNextChapterTitle()}
          disabled={isNextDisabled}
        >
          <NavigationChevronLeft />
        </button>
        </div>
      </div>

      {/* אזור עריכה */}
      {isOwner && (
        <div className="navbar-actions">
          <div className="navbar-edit-toggle">
            <span>מצב עריכה</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={isEditMode} 
                onChange={handleEditModeToggle}
              />
              <span className="slider"></span>
            </label>
          </div>

          {isEditMode && (
            <div className="navbar-edit-actions">
              <button 
                className="navbar-save-button" 
                onClick={handleSaveClick}
                title="שמור שינויים"
              >
                <Check />
              </button>

              <button 
                className="navbar-style-button" 
                onClick={() => setShowStyleSettings(true)}
                title="התאמה אישית - עיצוב"
              >
                <Broom />
              </button>

              <button 
                className="navbar-download-button" 
                onClick={handleDownloadGuide}
                title="הורד מדריך כ-JSON"
              >
                <Download />
              </button>

              <button 
                className="navbar-upload-button" 
                onClick={triggerFileInput}
                title="טען מדריך חדש"
              >
                <Upload />
              </button>
              
              {mediaBoardState.isReady && mediaBoardState.boardUrl && (
                <button 
                  className="navbar-media-button" 
                  onClick={handleOpenMediaBoard}
                  title="פתח לוח מדיה"
                >
                  <Gallery />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Style Settings Dialog */}
      <StyleSettings
        isOpen={showStyleSettings}
        onClose={() => setShowStyleSettings(false)}
        guideData={guideData}
        onUpdateStyle={(styleUpdates) => {
          // עדכון הגדרות עיצוב
          if (styleUpdates.globalBackground !== undefined) {
            handleUpdateGlobalBackground(styleUpdates.globalBackground);
          }
          // עדכון לוגו
          if (styleUpdates.logo !== undefined) {
            handleUpdateStyleSettings({
              logo: styleUpdates.logo
            });
          }
          // כאן נוסיף בעתיד עדכונים נוספים כמו primaryColor, fontFamily וכו'
        }}
        onOpenUploadModal={onOpenUploadModal}
      />
    </div>
  );
}

