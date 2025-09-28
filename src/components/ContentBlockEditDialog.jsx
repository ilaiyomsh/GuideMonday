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
                    title="הדגשה"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.6,10.79c.97-.67,1.65-1.77,1.65-2.79,0-2.26-1.75-4-4.25-4H7v14h7.04c2.1,0,3.71-1.7,3.71-3.78,0-1.52-.86-2.82-2.15-3.43M10,6.5h3c.83,0,1.5.67,1.5,1.5s-.67,1.5-1.5,1.5h-3V6.5m3.5,9H10v-3h3.5c.83,0,1.5.67,1.5,1.5s-.67,1.5-1.5,1.5Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('italic', false, null)}
                    title="הטיה"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10,4v3h2.21l-3.42,8H6v3h8v-3h-2.21l3.42-8H18V4H10Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('underline', false, null)}
                    title="קו תחתון"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,17c3.31,0,6-2.69,6-6V3h-2.5v8c0,1.93-1.57,3.5-3.5,3.5S8.5,12.93,8.5,11V3H6v8c0,3.31,2.69,6,6,6M5,19v2h14v-2H5Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('insertUnorderedList', false, null)}
                    title="רשימת נקודות"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7,5h14v2H7V5M7,11h14v2H7V11M7,17h14v2H7V17M3,5h2v2H3V5M3,11h2v2H3V11M3,17h2v2H3V17Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('insertOrderedList', false, null)}
                    title="רשימה ממוספרת"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7,5h14v2H7V5M7,11h14v2H7V11M7,17h14v2H7V17M3.5,5.5L2,4v3H5V5.5H3.5m0,4.5L2,8.5v3h3V10H3.5m.5,5.5H2v-1.5l1,.5L4,14v-3h1.5v4.5h-2Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('justifyLeft', false, null)}
                    title="יישור לשמאל"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15,15H3v2h12V15m0-8H3v2h12V7M3,13h18v-2H3v2M3,21h18v-2H3v2M3,3V5h18V3H3Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('justifyCenter', false, null)}
                    title="יישור למרכז"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7,15v2h10v-2H7m-4,6h18v-2H3v2m0-8h18v-2H3v2m4-6v2h10V7H7M3,3v2h18V3H3Z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="toolbar-button"
                    onClick={() => document.execCommand('justifyRight', false, null)}
                    title="יישור לימין"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,15v2h12v-2H9m-6,6h18v-2H3v2m6-8h12v-2H9v2m-6-6v2h18V7H3M3,3v2h18V3H3Z"></path>
                    </svg>
                  </button>
                  <select
                    onChange={(e) => document.execCommand('fontName', false, e.target.value)}
                    className="font-select"
                    title="גופן"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Figtree, sans-serif" selected>Figtree</option>
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Open Sans, sans-serif">Open Sans</option>
                    <option value="Merriweather, serif">Merriweather</option>
                    <option value="Courier Prime, monospace">Courier</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                  </select>
                  <select
                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                    className="font-size-select"
                    title="גודל גופן"
                  >
                    <option value="2">קטן</option>
                    <option value="3" selected>רגיל</option>
                    <option value="4">בינוני</option>
                    <option value="5">גדול</option>
                    <option value="6">גדול מאוד</option>
                  </select>
                  <div className="color-picker-container">
                    <button
                      type="button"
                      className="toolbar-button"
                      onClick={toggleColorPalette}
                      title="צבע גופן"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.62,12L12,5.67L14.37,12M11,3L5.5,17H7.5L8.62,14H15.37L16.5,17H18.5L13,3H11M21,19V22H3V19H21Z"></path>
                      </svg>
                    </button>
                    {showColorPalette && (
                      <div className="color-palette">
                        {[
                          '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
                          '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
                          '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
                          '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
                          '#d0442f', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
                          '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
                          '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47',
                          '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'
                        ].map(color => (
                          <div
                            key={color}
                            className="color-swatch"
                            style={{ backgroundColor: color }}
                            onClick={() => selectColor(color)}
                            title={`צבע ${color}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
