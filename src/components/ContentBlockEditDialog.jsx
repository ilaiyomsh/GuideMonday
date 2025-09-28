import React, { useState, useEffect } from 'react';
import { useGuide } from '../context/GuideContext';
import DraftTextEditor from './DraftTextEditor';

export default function ContentBlockEditDialog({ 
  isOpen, 
  onClose, 
  block, 
  chapterId, 
  sectionId, 
  blockIndex 
}) {
  const { handleUpdateContentBlock, direction } = useGuide();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [savedRange, setSavedRange] = useState(null);

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
