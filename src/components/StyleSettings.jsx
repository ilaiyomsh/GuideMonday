import React, { useState, useEffect, useRef } from 'react';
import { ColorPicker, Dialog, DialogContentContainer } from '@vibe/core';
import { NavigationChevronLeft, HighlightColorBucket } from '@vibe/icons';
import { useGuide } from '../context/GuideContext';

/**
 * קומפוננטת הגדרות עיצוב למדריך
 * מאפשרת התאמה אישית של נושא צבעים, רקע, פונט ולוגו
 * 
 * NEW in v4.0: עובדת עם styleData נפרד מ-guideData
 */
export default function StyleSettings({ isOpen, onClose, onOpenUploadModal }) {
  // קבלת נתוני עיצוב ופונקציות מה-Context
  const { 
    styleData, 
    hasStyleChanges, 
    isSavingStyle,
    handleUpdateBackground, 
    handleUpdateFont,
    handleSaveStyle,
    handleResetStyle
  } = useGuide();
  
  const [activeAccordionItem, setActiveAccordionItem] = useState(-1); // All items closed by default

  // Reset accordion to closed state when opening
  useEffect(() => {
    if (!isOpen) {
      setActiveAccordionItem(-1);
    }
  }, [isOpen]);

  // רשימת צבעים לרקע - אותם צבעים מהכפתור הראשי
  const colorsList = [
    // שורה 1
    '#457d50', '#5cb85c', '#9ccc65', '#c7a23c', '#fdd835',
    // שורה 2
    '#f5a623', '#f4511e', '#f48fb1', '#e57373', '#c62828',
    // שורה 3
    '#9c27b0', '#d81b60', '#ec407a', '#ce93d8', '#8e24aa',
    // שורה 4
    '#673ab7', '#5e35b1', '#3d5afe', '#3949ab', '#1e88e5',
    // שורה 5
    '#64b5f6', '#42a5f5', '#4dd0e1', '#4fc3f7', '#90a4ae',
    // שורה 6
    '#cfd8dc', '#b0bec5', '#78909c', '#455a64', '#795548',
    // שורה 7
    '#ce93d8', '#d2b48c', '#b3e5fc', '#bc8f8f', '#2962ff',
    // שורה 8
    '#26a69a', '#b39ddb', '#c5cae9', '#9fa8da', '#5d4037'
  ];

  // נושאי צבעים מוכנים
  const colorThemes = [
    { name: 'ברירת מחדל', primary: '#0073ea', secondary: '#323338' },
    { name: 'ירוק רענן', primary: '#5cb85c', secondary: '#457d50' },
    { name: 'סגול מלכותי', primary: '#9c27b0', secondary: '#673ab7' },
    { name: 'כתום חם', primary: '#f5a623', secondary: '#f4511e' },
    { name: 'כחול שקט', primary: '#42a5f5', secondary: '#1e88e5' }
  ];

  // אפשרויות פונטים
  const fontOptions = [
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Poppins', value: "'Poppins', sans-serif" },
    { name: 'Assistant', value: "'Assistant', sans-serif" },
    { name: 'Heebo', value: "'Heebo', sans-serif" },
    { name: 'Rubik', value: "'Rubik', sans-serif" }
  ];

  // Handle click outside - collapse all accordions and close dialog
  const handleClickOutside = () => {
    // Close all accordions first
    setActiveAccordionItem(-1);
    // Then close the dialog
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onClickOutside={handleClickOutside}
        position={Dialog.positions.BOTTOM_START}
        moveBy={{ main: 0, secondary: -20 }}
        content={() => (
          <DialogContentContainer className="style-settings-dialog">
            <div className="style-settings-header">
              <h2>התאמה אישית</h2>
            </div>
            <div className="style-settings-content">
              {/* Accordion Container */}
              <div className="accordion-container">
            
            {/* 1. Color Theme Accordion Item - COMMENTED OUT FOR FUTURE USE */}
            {/* <div className={`accordion-item ${activeAccordionItem === 0 ? 'open' : ''}`}>
              <button 
                className="accordion-toggle"
                onClick={() => setActiveAccordionItem(activeAccordionItem === 0 ? -1 : 0)}
              >
                <div className="accordion-left">
                  <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="accordion-icon">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 3.92574C8.69962 3.92574 7.42844 4.31139 6.34725 5.0339C5.26606 5.75641 4.42342 6.78333 3.92591 7.98478C3.42841 9.18623 3.29838 10.5082 3.55227 11.7836C3.80488 13.0525 4.42622 14.2184 5.33827 15.1356C5.44218 15.2255 5.57593 15.2737 5.71362 15.2706C5.85591 15.2673 5.9915 15.2095 6.09232 15.109C6.19314 15.0085 6.25147 14.8731 6.25522 14.7309C6.25897 14.5886 6.20787 14.4503 6.11248 14.3447L6.10013 14.3306C5.87953 14.073 5.76426 13.7417 5.77735 13.4028C5.79044 13.0639 5.93093 12.7424 6.17074 12.5026C6.41055 12.2628 6.73202 12.1223 7.07091 12.1092C7.4098 12.0961 7.74115 12.2114 7.99874 12.432C8.01247 12.4438 8.02574 12.456 8.03853 12.4688L10.726 15.1499C10.9834 15.4075 11.2891 15.6118 11.6255 15.7512C11.962 15.8906 12.3226 15.9623 12.6867 15.9623C13.0509 15.9623 13.4115 15.8906 13.7479 15.7512C14.0844 15.6118 14.39 15.4075 14.6475 15.1499C15.5672 14.2306 16.1938 13.059 16.4477 11.7836C16.7016 10.5082 16.5716 9.18623 16.0741 7.98478C15.5766 6.78333 14.7339 5.75641 13.6528 5.0339C12.5716 4.31139 11.3004 3.92574 10 3.92574Z" fill="currentColor"/>
                  </svg>
                  <span className="accordion-title">ערכת צבעים</span>
                </div>
                <div className="accordion-right">
                  <div className="color-theme-toggle">
                    <div className="toggle-half" style={{ backgroundColor: '#ffe580' }}></div>
                    <div className="toggle-half" style={{ backgroundColor: '#4B5563' }}></div>
                  </div>
                  <NavigationChevronLeft className={`accordion-arrow ${activeAccordionItem === 0 ? 'rotated' : ''}`} />
                </div>
              </button>
              <div className={`accordion-content ${activeAccordionItem === 0 ? 'open' : ''}`}>
                <div className="accordion-inner">
                  <div className="color-picker-section">
                    <div className="color-picker-row">
                      <div className="color-preview-circle" style={{ backgroundColor: '#ffe580' }}></div>
                      <select className="color-select">
                        <option>Primary color</option>
                      </select>
                      <svg className="select-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="default-colors-section">
                    <h4>צבעים ברירת מחדל</h4>
                    <div className="colors-grid">
                      {colorsList.slice(0, 30).map((color, index) => (
                        <div 
                          key={index}
                          className="color-square" 
                          style={{ backgroundColor: color }}
                          onClick={() => onUpdateStyle({ primaryColor: color })}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}

            {/* 2. Background Accordion Item */}
            <div className={`accordion-item ${activeAccordionItem === 1 ? 'open' : ''}`}>
              <button 
                className="accordion-toggle"
                onClick={() => setActiveAccordionItem(activeAccordionItem === 1 ? -1 : 1)}
              >
                <div className="accordion-left">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" className="accordion-icon">
                    <path d="M1.82141 4.56839C1.82141 3.04961 3.05263 1.81839 4.57141 1.81839H15.4286C16.9473 1.81839 18.1786 3.04961 18.1786 4.56839V15.4255C18.1786 16.9443 16.9473 18.1755 15.4286 18.1755H4.57141C3.05263 18.1755 1.82141 16.9443 1.82141 15.4255V4.56839ZM4.57141 3.31839C3.88105 3.31839 3.32141 3.87803 3.32141 4.56839V15.4255C3.32141 16.1159 3.88105 16.6755 4.57141 16.6755H15.4286C16.1189 16.6755 16.6786 16.1159 16.6786 15.4255V4.56839C16.6786 3.87803 16.1189 3.31839 15.4286 3.31839H4.57141ZM6.28295 6.3898L6.28502 6.3898H6.28571C6.5604 6.3898 6.82384 6.49892 7.01808 6.69315C7.21231 6.88739 7.32143 7.15083 7.32143 7.42552C7.32143 7.63025 7.26075 7.83038 7.14707 8.00064C7.03338 8.17091 6.87179 8.30366 6.6827 8.38213C6.49361 8.4606 6.2855 8.48127 6.08467 8.44153C5.88384 8.40179 5.69929 8.30342 5.55433 8.15885C5.40937 8.01428 5.31051 7.82999 5.27024 7.62926C5.22996 7.42854 5.25008 7.22038 5.32805 7.03108C5.40602 6.84178 5.53834 6.67983 5.7083 6.56569C5.87825 6.45156 6.07822 6.39035 6.28295 6.3898ZM11.7308 8.54731C11.5156 8.54558 11.3032 8.59644 11.1122 8.69549C10.9218 8.79421 10.7583 8.93781 10.6359 9.11387L9.57506 10.6293L9.25659 10.3747C9.11353 10.2605 8.94829 10.1772 8.77136 10.1302C8.59443 10.0832 8.40966 10.0734 8.22876 10.1016C8.04787 10.1298 7.8748 10.1952 7.72053 10.2938C7.56634 10.3923 7.43413 10.522 7.33259 10.6742L5.39295 13.5806C5.23937 13.8107 5.22496 14.1067 5.35544 14.3507C5.48593 14.5946 5.74012 14.747 6.01679 14.747H15.1429C15.4191 14.747 15.673 14.5951 15.8037 14.3517C15.9344 14.1082 15.9206 13.8127 15.7679 13.5825L12.8194 9.13598L12.8175 9.13325C12.6978 8.95444 12.5363 8.80758 12.3468 8.70546C12.1574 8.60334 11.9459 8.54905 11.7308 8.54731ZM13.7456 13.247L11.7161 10.1864L10.3455 12.1444C10.2267 12.3141 10.0429 12.4272 9.83782 12.4567C9.63272 12.4861 9.42456 12.4295 9.26272 12.3001L8.47253 11.6683L7.41899 13.247H13.7456Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                  </svg>
                  <span className="accordion-title">רקע</span>
                </div>
                <div className="accordion-right">
                  <div className="background-preview-pill" style={{ backgroundColor: styleData?.globalBackground || '#ffffff' }}></div>
                  <NavigationChevronLeft className={`accordion-arrow ${activeAccordionItem === 1 ? 'rotated' : ''}`} />
                </div>
              </button>
              <div className={`accordion-content ${activeAccordionItem === 1 ? 'open' : ''}`}>
                <div className="accordion-inner">
                  <div className="color-picker-wrapper">
                    <ColorPicker
                      id="style-background-color-picker"
                      numberOfColorsInLine={5}
                      colorsList={colorsList}
                      value={styleData?.globalBackground || ''}
                      onSave={(selectedColors) => {
                        if (selectedColors && selectedColors.length > 0) {
                          handleUpdateBackground(selectedColors[0]);
                        } else {
                          handleUpdateBackground('#ffffff');
                        }
                      }}
                      forceUseRawColorList={true}
                      colorSize="small"
                      noColorText="ללא רקע"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Logo Accordion Item */}
            <div className={`accordion-item ${activeAccordionItem === 2 ? 'open' : ''}`}>
              <button 
                className="accordion-toggle"
                onClick={() => setActiveAccordionItem(activeAccordionItem === 2 ? -1 : 2)}
              >
                <div className="accordion-left">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accordion-icon">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                  <span className="accordion-title">לוגו</span>
                </div>
                <NavigationChevronLeft className={`accordion-arrow ${activeAccordionItem === 2 ? 'rotated' : ''}`} />
              </button>
              <div className={`accordion-content ${activeAccordionItem === 2 ? 'open' : ''}`}>
                <div className="accordion-inner">
                  <button 
                    className="choose-image-btn"
                    onClick={() => onOpenUploadModal && onOpenUploadModal()}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                    </svg>
                    בחר תמונה
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Font Accordion Item */}
            <div className={`accordion-item ${activeAccordionItem === 3 ? 'open' : ''}`}>
              <button 
                className="accordion-toggle"
                onClick={() => setActiveAccordionItem(activeAccordionItem === 3 ? -1 : 3)}
              >
                <div className="accordion-left">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="24" height="24" className="accordion-icon">
                    <path d="M4.75 5C4.75 4.86193 4.86193 4.75 5 4.75H9.24961V15.2498H7.5C7.08579 15.2498 6.75 15.5856 6.75 15.9998C6.75 16.414 7.08579 16.7498 7.5 16.7498H9.98232L9.99961 16.75L10.0169 16.7498H12.5C12.9142 16.7498 13.25 16.414 13.25 15.9998C13.25 15.5856 12.9142 15.2498 12.5 15.2498H10.7496V4.75H15C15.1381 4.75 15.25 4.86193 15.25 5V6C15.25 6.41421 15.5858 6.75 16 6.75C16.4142 6.75 16.75 6.41421 16.75 6V5C16.75 4.0335 15.9665 3.25 15 3.25H5C4.0335 3.25 3.25 4.0335 3.25 5V6C3.25 6.41421 3.58579 6.75 4 6.75C4.41421 6.75 4.75 6.41421 4.75 6V5Z" fill="currentColor"/>
                  </svg>
                  <span className="accordion-title">גופן</span>
                </div>
                <div className="accordion-right">
                  <span className="font-badge">{styleData?.font?.family || 'Open Sans'}</span>
                  <NavigationChevronLeft className={`accordion-arrow ${activeAccordionItem === 3 ? 'rotated' : ''}`} />
                </div>
              </button>
              <div className={`accordion-content ${activeAccordionItem === 3 ? 'open' : ''}`}>
                <div className="accordion-inner">
                  <div className="form-group">
                    <label>גופן</label>
                    <select 
                      className="form-select"
                      value={styleData?.font?.family || 'Open Sans'}
                      onChange={(e) => handleUpdateFont({ family: e.target.value })}
                    >
                      <option value="Open Sans">Open Sans</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Assistant">Assistant</option>
                      <option value="Heebo">Heebo</option>
                      <option value="Rubik">Rubik</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          
          {/* Footer עם כפתורי שמירה - NEW in v4.0 */}
          <div className="style-settings-footer">
            <button 
              className="btn-reset"
              onClick={() => {
                handleResetStyle();
              }}
              disabled={!hasStyleChanges || isSavingStyle}
              title="ביטול השינויים וחזרה למצב השמור"
            >
              ביטול
            </button>
            <button 
              className="btn-save-style"
              onClick={async () => {
                const success = await handleSaveStyle();
                if (success) {
                  // אופציונלי: סגור את הדיאלוג אחרי שמירה מוצלחת
                  // onClose();
                }
              }}
              disabled={!hasStyleChanges || isSavingStyle}
              title={hasStyleChanges ? 'שמור את השינויים' : 'אין שינויים לשמירה'}
            >
              {isSavingStyle ? (
                <>
                  <svg className="spinner-icon" width="16" height="16" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                  שומר...
                </>
              ) : (
                <>
                  שמור עיצוב
                  {hasStyleChanges && <span className="unsaved-indicator">●</span>}
                </>
              )}
            </button>
          </div>
          </DialogContentContainer>
        )}
      />
      
    </>
  );
}