import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_GUIDE_TEMPLATE } from '../defaultGuideTemplate';
import { useMondayApi } from '../hooks/useMondayApi';

export default function GuideSetup({ onGuideLoad }) {
  const [guideName, setGuideName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaBoardStatus, setMediaBoardStatus] = useState({
    isInitializing: true,
    isReady: false,
    message: 'מכין תשתית אחסון קבצים...'
  });
  const fileInputRef = useRef(null);
  const { ensureMediaBoardReady } = useMondayApi();

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

  const handleDownloadTemplate = () => {
    try {
      const templateData = { ...DEFAULT_GUIDE_TEMPLATE };
      if (guideName.trim()) {
        templateData.guideName = guideName.trim();
      }

      const dataStr = JSON.stringify(templateData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = guideName.trim() ? 
        `guide_${guideName.trim().replace(/\s+/g, '_')}.json` : 
        'guide_template.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      setError(`שגיאה בהורדת התבנית: ${error.message}`);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // אתחול לוח המדיה
  useEffect(() => {
    const initMediaBoard = async () => {
      setMediaBoardStatus({
        isInitializing: true,
        isReady: false,
        message: '🚀 מכין תשתית אחסון קבצים...'
      });

      try {
        const isReady = await ensureMediaBoardReady();
        
        if (isReady) {
          setMediaBoardStatus({
            isInitializing: false,
            isReady: true,
            message: '✅ תשתית אחסון הקבצים מוכנה!'
          });
        } else {
          setMediaBoardStatus({
            isInitializing: false,
            isReady: false,
            message: '⚠️ לא הצלחנו להכין את תשתית הקבצים. תוכלו עדיין להשתמש במדריך.'
          });
        }
      } catch (error) {
        console.error('שגיאה באתחול לוח מדיה:', error);
        setMediaBoardStatus({
          isInitializing: false,
          isReady: false,
          message: '⚠️ שגיאה בהכנת תשתית הקבצים'
        });
      }
    };

    initMediaBoard();
  }, [ensureMediaBoardReady]);

  return (
    <div className="guide-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h1>🎯 מדריך אינטראקטיבי חדש</h1>
          <p>ברוכים הבאים! בחרו איך להתחיל את המדריך שלכם</p>
          
          {/* הצגת סטטוס לוח המדיה */}
          {mediaBoardStatus.isInitializing && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              {mediaBoardStatus.message}
            </div>
          )}
          {!mediaBoardStatus.isInitializing && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              background: mediaBoardStatus.isReady ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              {mediaBoardStatus.message}
            </div>
          )}
        </div>

        <div className="setup-content">
          <div className="form-section">
            <label htmlFor="guideName">שם המדריך (אופציונלי)</label>
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
              <div className="option-icon">📁</div>
              <h3>טען מדריך קיים</h3>
              <p>העלו קובץ JSON של מדריך ששמרתם בעבר</p>
              <button 
                onClick={triggerFileInput}
                disabled={isLoading || mediaBoardStatus.isInitializing}
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

            <div className="option-card">
              <div className="option-icon">📋</div>
              <h3>הורד תבנית לדוגמה</h3>
              <p>הורידו קובץ JSON עם דוגמה למדריך מלא</p>
              <button 
                onClick={handleDownloadTemplate}
                disabled={isLoading || mediaBoardStatus.isInitializing}
                className="option-button secondary"
              >
                הורד תבנית
              </button>
            </div>

            <div className="option-card primary">
              <div className="option-icon">🚀</div>
              <h3>התחל עם מדריך ברירת מחדל</h3>
              <p>התחילו עם מדריך דוגמה מלא ומוכן לעריכה</p>
              <button 
                onClick={handleLoadDefault}
                disabled={isLoading || mediaBoardStatus.isInitializing}
                className="option-button primary"
              >
                {isLoading ? 'טוען...' : mediaBoardStatus.isInitializing ? 'מכין תשתית...' : 'התחל עכשיו'}
              </button>
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
              <li>אם יש לכם קובץ JSON של מדריך, העלו אותו</li>
              <li>אם אתם מתחילים, הורידו את התבנית או התחילו עם ברירת המחדל</li>
              <li>שם המדריך יופיע בכותרת העליונה</li>
              <li>תמיד תוכלו לערוך את המדריך לאחר הטעינה</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
