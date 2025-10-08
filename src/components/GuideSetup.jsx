import React, { useState, useRef } from 'react';
import { DEFAULT_GUIDE_TEMPLATE } from '../defaultGuideTemplate';
import { BLANK_GUIDE_TEMPLATE } from '../blankGuideTemplate';
import { GUIDE_STRUCTURE_EXAMPLE } from '../guideStructureExample';
import { useGuide } from '../context/GuideContext';

export default function GuideSetup({ onGuideLoad }) {
  const [guideName, setGuideName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { mediaBoardState } = useGuide();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('אנא בחרו קובץ JSON בלבד');
      return;
    }

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const guideData = JSON.parse(e.target.result);
        
        // Validate guide structure
        if (!guideData.homePage || !guideData.chapters) {
          throw new Error('קובץ המדריך אינו תקין - חסרים homePage או chapters');
        }

        // Add guide name if provided
        if (guideName.trim()) {
          guideData.guideName = guideName.trim();
        }

        onGuideLoad(guideData);
      } catch (error) {
        setError(`שגיאה בקובץ: ${error.message}`);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('שגיאה בקריאת הקובץ');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleLoadBlank = () => {
    setIsLoading(true);
    setError('');

    try {
      const blankGuide = { ...BLANK_GUIDE_TEMPLATE };
      
      // Add guide name if provided
      if (guideName.trim()) {
        blankGuide.guideName = guideName.trim();
      }

      onGuideLoad(blankGuide);
    } catch (error) {
      setError(`שגיאה בטעינת המדריך הריק: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleLoadDefault = () => {
    setIsLoading(true);
    setError('');

    try {
      const defaultGuide = { ...DEFAULT_GUIDE_TEMPLATE };
      
      // Add guide name if provided
      if (guideName.trim()) {
        defaultGuide.guideName = guideName.trim();
      }

      onGuideLoad(defaultGuide);
    } catch (error) {
      setError(`שגיאה בטעינת המדריך ברירת המחדל: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleDownloadStructureExample = () => {
    try {
      const structureData = { ...GUIDE_STRUCTURE_EXAMPLE };

      const dataStr = JSON.stringify(structureData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'guide_structure_example_for_ai.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      setError(`שגיאה בהורדת מבנה הדוגמה: ${error.message}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="guide-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>מדריך  חדש</h1>
          <p>ברוכים הבאים! בחרו איך להתחיל את המדריך שלכם</p>
          
          {/* הצגת סטטוס לוח המדיה מה-Context - רק אם יש בעיה */}
          {mediaBoardState.isInitializing && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              ⏳ {mediaBoardState.message}
            </div>
          )}
          {!mediaBoardState.isInitializing && !mediaBoardState.isReady && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: 'rgba(255, 193, 7, 0.2)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              ⚠️ {mediaBoardState.message}
            </div>
          )}
        </div>

        <div className="setup-content">
          <div className="form-section">
            <label htmlFor="guideName">שם המדריך </label>
            <input
              id="guideName"
              type="text"
              value={guideName}
              onChange={(e) => setGuideName(e.target.value)}
              placeholder="הזינו שם למדריך שלכם..."
              className="guide-name-input"
            />
          </div>

          <div className="options-section">
            <div className="option-card">
              <div className="option-icon">📄</div>
              <h3>התחל עם מדריך ריק</h3>
              <p>צרו מדריך חדש ממש מאפס</p>
              <button 
                onClick={handleLoadBlank}
                disabled={isLoading || mediaBoardState.isInitializing}
                className="option-button"
              >
                {isLoading ? 'טוען...' : mediaBoardState.isInitializing ? 'מכין תשתית...' : 'התחל עכשיו'}
              </button>
            </div>

            <div className="option-card">
              <div className="option-icon">🚀</div>
              <h3>התחל עם מדריך ברירת מחדל</h3>
              <p>התחילו עם מדריך דוגמה מלא ומוכן לעריכה</p>
              <button 
                onClick={handleLoadDefault}
                disabled={isLoading || mediaBoardState.isInitializing}
                className="option-button"
              >
                {isLoading ? 'טוען...' : mediaBoardState.isInitializing ? 'מכין תשתית...' : 'התחל עם דוגמה'}
              </button>
            </div>

            <div className="option-card">
              <div className="option-icon">🤖</div>
              <h3>הורד מבנה עבור AI</h3>
              <p>הורידו קובץ JSON עם הסבר מפורט למבנה המדריך עבור מודל בינה מלאכותית</p>
              <button 
                onClick={handleDownloadStructureExample}
                disabled={isLoading || mediaBoardState.isInitializing}
                className="option-button"
              >
                הורד מבנה
              </button>
            </div>

            <div className="option-card">
              <div className="option-icon">📁</div>
              <h3>טען מדריך קיים</h3>
              <p>העלו קובץ JSON של מדריך ששמרתם בעבר</p>
              <button 
                onClick={triggerFileInput}
                disabled={isLoading || mediaBoardState.isInitializing}
                className="option-button"
              >
                {isLoading ? 'טוען...' : 'בחר קובץ JSON'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="setup-help">
            <h4>💡 טיפים:</h4>
            <ul>
              <li><strong>מדריך ריק</strong> - מתאים למי שרוצה לבנות מדריך מאפס בעצמו</li>
              <li><strong>מדריך ברירת מחדל</strong> - מדריך דוגמה עם תוכן מלא להשראה</li>
              <li><strong>מבנה עבור AI</strong> - הורידו קובץ עם הסבר מפורט למבנה, העבירו למודל AI וביקשו לייצר מדריך</li>
              <li><strong>טען קיים</strong> - אם יש לכם קובץ JSON של מדריך, העלו אותו</li>
              <li>שם המדריך שתזינו יופיע בכותרת המדריך</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
