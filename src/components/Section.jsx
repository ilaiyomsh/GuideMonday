import React, { useState } from "react";
import ContentBlock from "./ContentBlock";
import EditForm from "./EditForm";

const Section = ({ 
  section,
  sectionIndex,
  sectionsLength,
  chapterId,
  isEditMode, 
  onUpdateSection, 
  onDeleteSection,
  onUpdateContentBlock,
  onDeleteContentBlock,
  onReorderSection,
  onReorderContentBlock,
  onAddContentBlock
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(false);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  const handleEditSection = () => {
    setEditingSection(true);
  };

  const handleSaveSection = (updatedData) => {
    onUpdateSection(chapterId, section.id, updatedData);
    setEditingSection(false);
  };

  const handleDeleteSection = () => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      onDeleteSection(chapterId, section.id);
    }
  };

  const handleReorderSection = (direction) => {
    onReorderSection(chapterId, sectionIndex, direction);
  };

  const handleAddContentBlock = (blockType) => {
    onAddContentBlock(chapterId, section.id, blockType);
  };

  return (
    <div className="section">
      <div className="section-header">
        <button
          onClick={toggleSection}
          className="section-toggle"
          aria-expanded={isOpen}
          aria-controls={`section-${section.id}`}
        >
          <span className="section-title">{section.title}</span>
          <span className={`toggle-icon ${isOpen ? 'open' : ''}`}>
            ▼
          </span>
        </button>
        {isEditMode && (
          <div className="item-controls">
            <div className="reorder-controls">
              <button
                onClick={() => handleReorderSection('up')}
                className="reorder-btn"
                disabled={sectionIndex === 0}
                title="Move section up"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorderSection('down')}
                className="reorder-btn"
                disabled={sectionIndex === sectionsLength - 1}
                title="Move section down"
              >
                ↓
              </button>
            </div>
            <button
              onClick={handleEditSection}
              className="edit-btn"
              title="Edit section"
            >
              ✏️
            </button>
            <button
              onClick={handleDeleteSection}
              className="delete-btn"
              title="Delete section"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="section-intro">
        <p>{section.content}</p>
        {isEditMode && isOpen && (
          <div className="add-content-container">
            <div className="add-content-buttons">
              <button 
                onClick={() => handleAddContentBlock('text')} 
                className="add-btn add-content-btn"
                title="Add text block"
              >
                ➕ Text
              </button>
              <button 
                onClick={() => handleAddContentBlock('image')} 
                className="add-btn add-content-btn"
                title="Add image block"
              >
                ➕ Image
              </button>
              <button 
                onClick={() => handleAddContentBlock('video')} 
                className="add-btn add-content-btn"
                title="Add video block"
              >
                ➕ Video
              </button>
              <button 
                onClick={() => handleAddContentBlock('link')} 
                className="add-btn add-content-btn"
                title="Add link block"
              >
                ➕ Link
              </button>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          id={`section-${section.id}`}
          className="section-content"
        >
          {section.contentBlocks && section.contentBlocks.map((block, blockIndex) => (
            <ContentBlock 
              key={block.id} 
              block={block}
              blockIndex={blockIndex}
              blocksLength={section.contentBlocks.length}
              chapterId={chapterId}
              sectionId={section.id}
              isEditMode={isEditMode}
              onUpdateContentBlock={onUpdateContentBlock}
              onDeleteContentBlock={onDeleteContentBlock}
              onReorderContentBlock={onReorderContentBlock}
            />
          ))}
        </div>
      )}

      {editingSection && (
        <EditForm
          entityData={{
            title: section.title,
            content: section.content
          }}
          entityType="section"
          onSave={handleSaveSection}
          onCancel={() => setEditingSection(false)}
        />
      )}
    </div>
  );
};

export default Section;
