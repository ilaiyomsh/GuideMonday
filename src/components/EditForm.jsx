import React, { useState } from "react";

const EditForm = ({ entityData, entityType, onSave, onCancel }) => {
  const [formData, setFormData] = useState(entityData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFields = () => {
    switch (entityType) {
      case 'text':
        return (
          <textarea
            name="text"
            value={formData.text || ''}
            onChange={handleChange}
            placeholder="Enter text content..."
            className="edit-textarea"
            rows={4}
          />
        );
      
      case 'image':
        return (
          <>
            <input
              name="url"
              value={formData.url || ''}
              onChange={handleChange}
              placeholder="Image URL"
              className="edit-input"
            />
            <input
              name="caption"
              value={formData.caption || ''}
              onChange={handleChange}
              placeholder="Image caption"
              className="edit-input"
            />
          </>
        );
      
      case 'video':
        return (
          <>
            <input
              name="embedUrl"
              value={formData.embedUrl || ''}
              onChange={handleChange}
              placeholder="Video embed URL"
              className="edit-input"
            />
            <input
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Video description"
              className="edit-input"
            />
          </>
        );
      
      case 'link':
        return (
          <>
            <input
              name="url"
              value={formData.url || ''}
              onChange={handleChange}
              placeholder="Link URL"
              className="edit-input"
            />
            <input
              name="displayText"
              value={formData.displayText || ''}
              onChange={handleChange}
              placeholder="Display text"
              className="edit-input"
            />
          </>
        );
      
      case 'homePage':
        return (
          <>
            <input
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Home page title"
              className="edit-input"
            />
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              placeholder="Home page description"
              className="edit-textarea"
              rows={4}
            />
          </>
        );

      case 'chapter':
        return (
          <>
            <input
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Chapter title"
              className="edit-input"
            />
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              placeholder="Chapter description"
              className="edit-textarea"
              rows={3}
            />
          </>
        );
      
      case 'section':
        return (
          <>
            <input
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="Section title"
              className="edit-input"
            />
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              placeholder="Section content"
              className="edit-textarea"
              rows={3}
            />
          </>
        );
      
      default:
        return (
          <div className="unknown-entity">
            <p>Unknown entity type: {entityType}</p>
          </div>
        );
    }
  };

  return (
    <div className="edit-form-overlay">
      <div className="edit-form">
        <div className="edit-form-header">
          <h3>Edit {entityType}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-fields">
            {renderFields()}
          </div>
          <div className="form-actions">
            <button type="submit" className="save-changes-btn">
              Save Changes
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;
