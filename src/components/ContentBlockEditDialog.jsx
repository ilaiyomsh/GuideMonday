import React, { useState, useEffect } from 'react';
import { useGuide } from '../context/GuideContext';

export default function ContentBlockEditDialog({ 
  isOpen, 
  onClose, 
  block, 
  chapterId, 
  sectionId, 
  blockIndex 
}) {
  const { handleUpdateContentBlock } = useGuide();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [savedRange, setSavedRange] = useState(null);

  useEffect(() => {
    if (block) {
      setFormData(block.data || {});
      setErrors({});
    }
  }, [block]);

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

  const validateForm = () => {
    const newErrors = {};
    
    switch (block?.type) {
      case 'text':
        if (!formData.text?.trim()) {
          newErrors.text = 'טקסט נדרש';
        }
        break;
      case 'image':
        if (!formData.url?.trim()) {
        newErrors.url = 'URL נדרש';
        }
        break;
      case 'video':
        if (!formData.embedCode?.trim()) {
          newErrors.embedCode = 'קוד הטמעה נדרש';
        }
        break;
      case 'gif':
        if (!formData.embedCode?.trim()) {
          newErrors.embedCode = 'קוד הטמעה נדרש';
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
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // Capture final HTML content from the rich text editor
    const editor = document.getElementById('rich-text-editor');
    if (editor) {
      const finalContent = editor.innerHTML;
      const updatedData = { ...formData, content: finalContent };
      handleUpdateContentBlock(chapterId, sectionId, block.id, updatedData);
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData(block?.data || {});
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

  const handleEditorInput = () => {
    const editor = document.getElementById('rich-text-editor');
    if (editor) {
      setFormData(prev => ({ ...prev, content: editor.innerHTML }));
    }
  };

  const renderFormFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="form-field">
              <label htmlFor="text">טקסט *</label>
              <div className="rich-text-editor-container">
                <div className="rich-text-toolbar">
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('bold', false, null)}
                    title="מודגש"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('italic', false, null)}
                    title="נטוי"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('underline', false, null)}
                    title="קו תחתון"
                  >
                    <u>U</u>
                  </button>
                  
                  <div className="toolbar-separator"></div>
                  
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('insertUnorderedList', false, null)}
                    title="רשימה עם נקודות"
                  >
                    <span className="bullet-icon">•</span>
                  </button>
                  
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('insertOrderedList', false, null)}
                    title="רשימה ממוספרת"
                  >
                    <span className="numbered-icon">1.</span>
                  </button>
                  
                  <div className="toolbar-separator"></div>
                  
                  <select
                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                    className="font-size-select"
                    title="גודל גופן"
                  >
                    <option value="1">קטן</option>
                    <option value="2">בינוני</option>
                    <option value="3" selected>גדול</option>
                    <option value="4">גדול מאוד</option>
                    <option value="5">ענק</option>
                    <option value="6">ענק מאוד</option>
                    <option value="7">מאסיבי</option>
                  </select>
                  
                  <div className="toolbar-separator"></div>
                  
                  <div className="color-picker-container">
                    <button
                      type="button"
                      className="color-trigger-button"
                      onClick={toggleColorPalette}
                      title="צבע טקסט"
                    >
                      <span className="color-icon">A</span>
                    </button>
                    {showColorPalette && (
                      <div className="color-palette">
                        {[
                          '#000000', '#333333', '#666666', '#999999',
                          '#ff0000', '#ff6600', '#ffcc00', '#ffff00',
                          '#00ff00', '#00ccff', '#0066ff', '#6600ff',
                          '#ff00ff', '#ff0066', '#ff3366', '#ff6699'
                        ].map(color => (
                          <button
                            key={color}
                            type="button"
                            className="color-option"
                            style={{ backgroundColor: color }}
                            onClick={() => selectColor(color)}
                            title={`צבע ${color}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="toolbar-separator"></div>
                  
                  <select
                    onChange={(e) => document.execCommand('justifyLeft', false, null)}
                    className="alignment-select"
                    title="יישור טקסט"
                  >
                    <option value="justifyLeft">שמאל</option>
                    <option value="justifyCenter">מרכז</option>
                    <option value="justifyRight">ימין</option>
                    <option value="justifyFull">יישור לשני הצדדים</option>
                  </select>
                </div>
                
                <div
                  id="rich-text-editor"
                  className="rich-text-editor"
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handleEditorInput}
                  dangerouslySetInnerHTML={{ __html: formData.content || '' }}
                />
              </div>
              {errors.text && <span className="error-message">{errors.text}</span>}
            </div>
          </>
        );

      case 'image':
        return (
          <>
            <div className="form-field">
              <label htmlFor="url">URL התמונה *</label>
              <input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                className={errors.url ? 'error' : ''}
                placeholder="https://example.com/image.jpg"
              />
              {errors.url && <span className="error-message">{errors.url}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="caption">כיתוב</label>
              <input
                id="caption"
                type="text"
                value={formData.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="כיתוב התמונה (אופציונלי)"
              />
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <div className="form-field">
              <label htmlFor="embedCode">קוד הטמעה *</label>
              <textarea
                id="embedCode"
                value={formData.embedCode || ''}
                onChange={(e) => handleInputChange('embedCode', e.target.value)}
                className={errors.embedCode ? 'error' : ''}
                rows="6"
                placeholder="הדביקו את קוד ההטמעה HTML כאן..."
              />
              {errors.embedCode && <span className="error-message">{errors.embedCode}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="title">כותרת הוידאו</label>
              <input
                id="title"
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="כותרת הוידאו (אופציונלי)"
              />
            </div>
          </>
        );

      case 'gif':
        return (
          <>
            <div className="form-field">
              <label htmlFor="embedCode">קוד הטמעה *</label>
              <textarea
                id="embedCode"
                value={formData.embedCode || ''}
                onChange={(e) => handleInputChange('embedCode', e.target.value)}
                className={errors.embedCode ? 'error' : ''}
                rows="6"
                placeholder="הדביקו את קוד ההטמעה HTML כאן..."
              />
              {errors.embedCode && <span className="error-message">{errors.embedCode}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="caption">כיתוב</label>
              <input
                id="caption"
                type="text"
                value={formData.caption || ''}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="כיתוב ה-GIF (אופציונלי)"
              />
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
                placeholder="https://example.com"
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
                placeholder="טקסט שיוצג כקישור"
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
                placeholder="תיאור הקישור (אופציונלי)"
              />
            </div>
          </>
        );

      default:
        return <div>סוג בלוק לא נתמך</div>;
    }
  };

  return (
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
  );
}

function getBlockTypeName(type) {
  const typeNames = {
    text: 'טקסט',
    image: 'תמונה',
    video: 'וידאו',
    gif: 'GIF',
    link: 'קישור'
  };
  return typeNames[type] || type;
}
