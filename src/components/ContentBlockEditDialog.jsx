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
    if (validateForm()) {
      handleUpdateContentBlock(chapterId, sectionId, block.id, formData);
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

  const renderFormFields = () => {
    switch (block.type) {
      case 'text':
        return (
          <>
            <div className="form-field">
              <label htmlFor="text">טקסט *</label>
              <div className="text-editor-container">
                <div className="text-formatting-toolbar">
                  <button
                    type="button"
                    className={`format-button ${formData.bold ? 'active' : ''}`}
                    onClick={() => handleInputChange('bold', !formData.bold)}
                    title="מודגש"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    className={`format-button ${formData.italic ? 'active' : ''}`}
                    onClick={() => handleInputChange('italic', !formData.italic)}
                    title="נטוי"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    className={`format-button ${formData.underline ? 'active' : ''}`}
                    onClick={() => handleInputChange('underline', !formData.underline)}
                    title="קו תחתון"
                  >
                    <u>U</u>
                  </button>
                  
                  <div className="toolbar-separator"></div>
                  
                  <div className="color-picker-container">
                    <div className="color-matrix">
                      {[
                        '#000000', '#333333', '#666666', '#999999',
                        '#ff0000', '#ff6600', '#ffcc00', '#ffff00',
                        '#00ff00', '#00ccff', '#0066ff', '#6600ff',
                        '#ff00ff', '#ff0066', '#ff3366', '#ff6699'
                      ].map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${formData.textColor === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleInputChange('textColor', color)}
                          title={`צבע ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="toolbar-separator"></div>
                  
                  <select
                    value={formData.fontSize || '16'}
                    onChange={(e) => handleInputChange('fontSize', e.target.value)}
                    className="font-size-select"
                    title="גודל גופן"
                  >
                    <option value="12">12</option>
                    <option value="14">14</option>
                    <option value="16">16</option>
                    <option value="18">18</option>
                    <option value="20">20</option>
                    <option value="24">24</option>
                    <option value="28">28</option>
                    <option value="32">32</option>
                  </select>
                  
                  <div className="toolbar-separator"></div>
                  
                  <button
                    type="button"
                    className={`format-button ${formData.bulletList ? 'active' : ''}`}
                    onClick={() => handleInputChange('bulletList', !formData.bulletList)}
                    title="רשימה עם נקודות"
                  >
                    <span className="bullet-icon">•</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`format-button ${formData.numberedList ? 'active' : ''}`}
                    onClick={() => handleInputChange('numberedList', !formData.numberedList)}
                    title="רשימה ממוספרת"
                  >
                    <span className="numbered-icon">1.</span>
                  </button>
                  
                  <div className="toolbar-separator"></div>
                  
                  <select
                    value={formData.alignment || 'right'}
                    onChange={(e) => handleInputChange('alignment', e.target.value)}
                    className="alignment-select"
                    title="יישור טקסט"
                  >
                    <option value="right">ימין</option>
                    <option value="center">מרכז</option>
                    <option value="left">שמאל</option>
                    <option value="justify">יישור לשני הצדדים</option>
                  </select>
                </div>
                
                <div className="text-preview-container">
                  <div 
                    className="text-preview"
                    style={{
                      textAlign: formData.alignment || 'right',
                      fontWeight: formData.bold ? 'bold' : 'normal',
                      fontStyle: formData.italic ? 'italic' : 'normal',
                      textDecoration: formData.underline ? 'underline' : 'none',
                      color: formData.textColor || '#000000',
                      fontSize: getFontSize(formData.fontSize || 'medium')
                    }}
                  >
                    {formData.text || 'הזינו את הטקסט כאן...'}
                  </div>
                </div>
                
                <textarea
                  id="text"
                  value={formData.text || ''}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  className={errors.text ? 'error' : ''}
                  rows="6"
                  placeholder="הזינו את הטקסט..."
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
