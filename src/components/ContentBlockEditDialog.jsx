import React, { useState, useEffect, useRef } from 'react';
import { useGuide } from '../context/GuideContext';
import DraftTextEditor from './DraftTextEditor';
import { getBlockTypeName } from '../constants/blockTypes';
import { FILE_UPLOAD } from '../constants/config';
import { useMondayApi } from '../hooks/useMondayApi';

export default function ContentBlockEditDialog({ 
  isOpen, 
  onClose, 
  block, 
  chapterId, 
  sectionId, 
  blockIndex 
}) {
  const { 
    handleUpdateContentBlock, 
    direction, 
    guideName, 
    getChapterContext, 
    getSectionContext 
  } = useGuide();
  const { uploadFileToMediaBoard } = useMondayApi();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [savedRange, setSavedRange] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (block) {
      // Handle both old format (text) and new format (content)
      const blockData = block.data || {};
      const formDataToSet = {
        ...blockData,
        // Ensure we have content field for text blocks
        content: blockData.content || blockData.text || ''
      };
      setFormData(formDataToSet);
      setErrors({});
    }
  }, [block]);

  // Draft.js handles content updates automatically

  // Close color palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPalette && !event.target.closest('.color-picker-container')) {
        setShowColorPalette(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showColorPalette]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type based on block type
    let isValidType = false;
    let errorMessage = '';
    
    switch (block?.type) {
      case 'image':
        isValidType = file.type.startsWith('image/');
        errorMessage = 'אנא בחרו קובץ תמונה בלבד';
        break;
      case 'video':
        isValidType = file.type.startsWith('video/');
        errorMessage = 'אנא בחרו קובץ וידאו בלבד';
        break;
      case 'gif':
        isValidType = file.type === 'image/gif';
        errorMessage = 'אנא בחרו קובץ GIF בלבד';
        break;
      default:
        isValidType = file.type.startsWith('image/');
        errorMessage = 'אנא בחרו קובץ תמונה בלבד';
    }

    if (!isValidType) {
      setErrors(prev => ({ ...prev, file: errorMessage }));
      return;
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
      setErrors(prev => ({ ...prev, file: `גודל הקובץ חייב להיות קטן מ-${FILE_UPLOAD.MAX_SIZE_MB}MB` }));
      return;
    }

    setIsUploading(true);
    setErrors(prev => ({ ...prev, file: null }));

    try {
      // הכנת context להעלאה
      const chapterContext = getChapterContext(chapterId);
      const sectionContext = getSectionContext(chapterId, sectionId);
      
      const context = {
        guideName: guideName,
        chapterName: chapterContext?.fullName || 'פרק לא ידוע',
        sectionName: sectionContext?.fullName || 'סעיף לא ידוע'
      };

      console.log('🚀 מעלה קובץ עם context:', context);

      // העלאה ללוח המדיה עם context מלא
      const result = await uploadFileToMediaBoard(file, context);
      
      // Update form data with the uploaded URL and itemId
      setFormData(prev => ({ 
        ...prev, 
        url: result.url,
        mediaItemId: result.itemId  // שמירת מזהה האייטם למחיקה עתידית
      }));
      
      // Clear any previous file errors
      setErrors(prev => ({ ...prev, file: null }));
      
      console.log('✅ קובץ הועלה בהצלחה:', result.url, 'Item ID:', result.itemId);
      
    } catch (error) {
      console.error('❌ שגיאה בהעלאת הקובץ:', error);
      setErrors(prev => ({ 
        ...prev, 
        file: 'שגיאה בהעלאת הקובץ. אנא נסו שוב.' 
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    switch (block?.type) {
      case 'text':
        if (!formData.content?.trim()) {
          newErrors.text = 'טקסט נדרש';
        }
        break;
      case 'image':
        if (!formData.url?.trim()) {
          newErrors.url = 'URL התמונה נדרש';
        }
        break;
      case 'video':
        if (formData.inputType === 'url') {
          if (!formData.url?.trim()) {
            newErrors.url = 'URL הוידאו נדרש';
          }
        } else if (formData.inputType === 'embedCode') {
        if (!formData.embedCode?.trim()) {
          newErrors.embedCode = 'קוד הטמעה נדרש';
          }
        } else if (formData.inputType === 'upload') {
          if (!formData.url?.trim()) {
            newErrors.file = 'יש להעלות קובץ וידאו';
          }
        }
        break;
      case 'gif':
        if (formData.inputType === 'url') {
          if (!formData.url?.trim()) {
            newErrors.url = 'URL ה-GIF נדרש';
          }
        } else if (formData.inputType === 'embedCode') {
        if (!formData.embedCode?.trim()) {
          newErrors.embedCode = 'קוד הטמעה נדרש';
          }
        } else if (formData.inputType === 'upload') {
          if (!formData.url?.trim()) {
            newErrors.file = 'יש להעלות קובץ GIF';
          }
        }
        break;
      case 'link':
        if (!formData.url?.trim()) {
          newErrors.url = 'URL נדרש';
        }
        if (!formData.text?.trim()) {
          newErrors.text = 'טקסט הקישור נדרש';
        }
        break;
      case 'form':
        if (!formData.embedCode?.trim()) {
          newErrors.embedCode = 'קוד הטמעת הטופס נדרש';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (block?.type === 'text') {
      // For text blocks, use formData.content which is updated by DraftTextEditor
      if (validateForm()) {
        handleUpdateContentBlock(chapterId, sectionId, block.id, formData);
        onClose();
      }
    } else {
      // For other block types (image, video, gif, link), use formData directly
      if (validateForm()) {
        handleUpdateContentBlock(chapterId, sectionId, block.id, formData);
      onClose();
      }
    }
  };

  const handleCancel = () => {
    // Reset to original block data
    const blockData = block?.data || {};
    const formDataToSet = {
      ...blockData,
      content: blockData.content || blockData.text || ''
    };
    setFormData(formDataToSet);
    setErrors({});
    onClose();
  };

  if (!isOpen || !block) return null;

  const getFontSize = (size) => {
    return `${size}px`;
  };

  // Rich Text Editor Functions
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  };

  const toggleColorPalette = () => {
    saveSelection();
    setShowColorPalette(!showColorPalette);
  };

  const selectColor = (color) => {
    restoreSelection();
    document.execCommand('foreColor', false, color);
    setShowColorPalette(false);
  };

  // Draft.js handles input and Enter key automatically

  const renderFormFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="form-field">
              <label htmlFor="text">טקסט *</label>
              <DraftTextEditor
                initialContent={formData.content || ''}
                onChange={(htmlContent) => {
                  setFormData(prev => ({ ...prev, content: htmlContent }));
                }}
                direction={direction}
              />
              {errors.text && <span className="error-message">{errors.text}</span>}
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="form-field">
              <label>אפשרויות תמונה *</label>
              <div className="upload-options">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="upload-button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                >
                  {isUploading ? 'מעלה...' : '📤 העלה תמונה'}
                </button>
                {errors.file && <span className="error-message">{errors.file}</span>}
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="url">או הכנס URL התמונה *</label>
              <input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className={errors.url ? 'error' : ''}
                placeholder="https://example.com/image.jpg או https://images.unsplash.com/photo-..."
              />
              {errors.url && <span className="error-message">{errors.url}</span>}
              <div className="form-help">
                <p>💡 טיפ: ודאו שה-URL חוקי ונגיש כדי שהתמונה תוצג כראוי</p>
              </div>
            </div>
            
            <div className="form-field">
              <label htmlFor="caption">כיתוב</label>
              <input
                id="caption"
                type="text"
                value={formData.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="תיאור קצר של התמונה או הסבר על תוכנה"
              />
              <div className="form-help">
                <p>💡 טיפ: השתמשו ב-URL של תמונות מ-Unsplash, Pexels או העלו תמונה מהמחשב</p>
              </div>
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <div className="form-field">
              <label>אפשרויות וידאו *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="videoInputType"
                    value="url"
                    checked={formData.inputType === 'url'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>URL הוידאו</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="videoInputType"
                    value="embedCode"
                    checked={formData.inputType === 'embedCode'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>קוד הטמעה HTML</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="videoInputType"
                    value="upload"
                    checked={formData.inputType === 'upload'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>העלאת קובץ מהמחשב</span>
                </label>
              </div>
            </div>

            {formData.inputType === 'url' ? (
              <div className="form-field">
                <label htmlFor="url">URL הוידאו *</label>
                <input
                  id="url"
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={errors.url ? 'error' : ''}
                  placeholder="https://www.youtube.com/watch?v=... או https://vimeo.com/... או https://player.vimeo.com/video/..."
                />
                {errors.url && <span className="error-message">{errors.url}</span>}
                <div className="form-help">
                  <p>💡 טיפ: העתיקו את ה-URL המלא של הוידאו מ-YouTube או Vimeo</p>
                </div>
              </div>
            ) : formData.inputType === 'embedCode' ? (
              <div className="form-field">
                <label htmlFor="embedCode">קוד הטמעה HTML *</label>
              <textarea
                id="embedCode"
                value={formData.embedCode || ''}
                onChange={(e) => handleInputChange('embedCode', e.target.value)}
                className={errors.embedCode ? 'error' : ''}
                rows="6"
                  placeholder="&lt;iframe src='https://www.youtube.com/embed/...' width='560' height='315'&gt;&lt;/iframe&gt;"
              />
              {errors.embedCode && <span className="error-message">{errors.embedCode}</span>}
                <div className="form-help">
                  <p>💡 טיפ: השתמשו בקוד ההטמעה המלא מ-YouTube או Vimeo</p>
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label>העלאת קובץ וידאו *</label>
                <div className="upload-options">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? 'מעלה...' : '🎥 העלה קובץ וידאו מהמחשב'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  {errors.file && <span className="error-message">{errors.file}</span>}
                </div>
                <div className="form-help">
                  <p>💡 טיפ: תומך בפורמטים MP4, AVI, MOV, WMV ועוד</p>
                </div>
            </div>
            )}

            <div className="form-field">
              <label htmlFor="title">כותרת הוידאו</label>
              <input
                id="title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="שם הוידאו או כותרת מתאימה"
              />
              <div className="form-help">
                <p>💡 טיפ: תומך ב-YouTube, Vimeo ורוב שירותי הוידאו הפופולריים</p>
              </div>
            </div>
          </>
        );

      case 'gif':
        return (
          <>
            <div className="form-field">
              <label>אפשרויות GIF *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gifInputType"
                    value="url"
                    checked={formData.inputType === 'url'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>URL ה-GIF</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gifInputType"
                    value="embedCode"
                    checked={formData.inputType === 'embedCode'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>קוד הטמעה HTML</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gifInputType"
                    value="upload"
                    checked={formData.inputType === 'upload'}
                    onChange={(e) => handleInputChange('inputType', e.target.value)}
                  />
                  <span>העלאת קובץ מהמחשב</span>
                </label>
              </div>
            </div>

            {formData.inputType === 'url' ? (
              <div className="form-field">
                <label htmlFor="url">URL ה-GIF *</label>
                <input
                  id="url"
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={errors.url ? 'error' : ''}
                  placeholder="https://media.giphy.com/media/... או https://i.giphy.com/media/... או https://example.com/animation.gif"
                />
                {errors.url && <span className="error-message">{errors.url}</span>}
                <div className="form-help">
                  <p>💡 טיפ: העתיקו את ה-URL הישיר של ה-GIF מ-GIPHY או שירות דומה</p>
                </div>
              </div>
            ) : formData.inputType === 'embedCode' ? (
              <div className="form-field">
                <label htmlFor="embedCode">קוד הטמעה HTML *</label>
              <textarea
                id="embedCode"
                value={formData.embedCode || ''}
                onChange={(e) => handleInputChange('embedCode', e.target.value)}
                className={errors.embedCode ? 'error' : ''}
                rows="6"
                  placeholder="&lt;img src='https://media.giphy.com/media/.../giphy.gif' alt='תיאור' /&gt;"
              />
              {errors.embedCode && <span className="error-message">{errors.embedCode}</span>}
                <div className="form-help">
                  <p>💡 טיפ: השתמשו בקוד HTML המלא עם תגיות img או iframe</p>
                </div>
              </div>
            ) : (
              <div className="form-field">
                <label>העלאת קובץ GIF *</label>
                <div className="upload-options">
                  <button
                    type="button"
                    className="upload-button"
                    onClick={triggerFileInput}
                    disabled={isUploading}
                  >
                    {isUploading ? 'מעלה...' : '🎬 העלה קובץ GIF מהמחשב'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/gif"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  {errors.file && <span className="error-message">{errors.file}</span>}
                </div>
                <div className="form-help">
                  <p>💡 טיפ: תומך בפורמט GIF בלבד</p>
                </div>
            </div>
            )}

            <div className="form-field">
              <label htmlFor="caption">כיתוב</label>
              <input
                id="caption"
                type="text"
                value={formData.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="תיאור של מה ה-GIF מציג או הסבר על הפעולה"
              />
              <div className="form-help">
                <p>💡 טיפ: GIPHY, Tenor ו-Imgur הם מקורות מצוינים ל-GIFים איכותיים</p>
              </div>
            </div>
          </>
        );

      case 'link':
        return (
          <>
            <div className="form-field">
              <label htmlFor="url">URL הקישור *</label>
              <input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className={errors.url ? 'error' : ''}
                placeholder="https://example.com או https://www.google.com או כל URL אחר"
              />
              {errors.url && <span className="error-message">{errors.url}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="text">טקסט הקישור *</label>
              <input
                id="text"
                type="text"
                value={formData.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                className={errors.text ? 'error' : ''}
                placeholder="הטקסט שיוצג על הקישור (לחץ כאן, קרא עוד, וכו')"
              />
              {errors.text && <span className="error-message">{errors.text}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="description">תיאור</label>
              <input
                id="description"
                type="text"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="תיאור קצר של לאן הקישור מוביל או מה הוא מכיל"
              />
              <div className="form-help">
                <p>💡 טיפ: הקישור יפתח בחלון חדש כדי לא להסיט את המשתמש מהמדריך</p>
              </div>
            </div>
          </>
        );

      case 'form':
        return (
          <>
            <div className="form-field">
              <label htmlFor="embedCode">קוד הטמעת הטופס *</label>
              <textarea
                id="embedCode"
                value={formData.embedCode || ''}
                onChange={(e) => handleInputChange('embedCode', e.target.value)}
                className={errors.embedCode ? 'error' : ''}
                rows="6"
                placeholder="הדביקו את קוד ההטמעה המלא של הטופס כאן..."
              />
              {errors.embedCode && <span className="error-message">{errors.embedCode}</span>}
              <div className="form-help">
                <p>דוגמה לקוד הטמעה:</p>
                <code>
                  &lt;iframe src="https://forms.monday.com/forms/embed/..." width="650" height="500" style="border: 0; box-shadow: 5px 5px 56px 0px rgba(0,0,0,0.25);"&gt;&lt;/iframe&gt;
                </code>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="title">כותרת הטופס</label>
              <input
                id="title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="שם הטופס או כותרת מתאימה (למשל: טופס יצירת קשר, שאלון משוב)"
              />
              <div className="form-help">
                <p>💡 טיפ: הטופס יוצג במלואו בתוך המדריך ויאפשר למשתמשים למלא אותו ישירות</p>
              </div>
            </div>
          </>
        );

      default:
        return <div>סוג בלוק לא נתמך</div>;
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>עריכת בלוק {getBlockTypeName(block.type)}</h3>
            <button className="close-button" onClick={handleCancel}>×</button>
          </div>
          
          <div className="modal-body">
            {renderFormFields()}
          </div>
          
          <div className="modal-footer">
            <button className="cancel-button" onClick={handleCancel}>
              ביטול
            </button>
            <button className="save-button" onClick={handleSave}>
              שמור
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

