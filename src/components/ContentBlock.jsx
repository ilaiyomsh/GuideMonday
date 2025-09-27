import React, { useState } from "react";
import EditForm from "./EditForm";

const ContentBlock = ({ 
  block,
  blockIndex,
  blocksLength,
  chapterId, 
  sectionId, 
  isEditMode, 
  onUpdateContentBlock, 
  onDeleteContentBlock,
  onReorderContentBlock
}) => {
  const [editingBlock, setEditingBlock] = useState(false);
  if (!block || !block.type || !block.data) {
    return null;
  }

  const handleEditBlock = () => {
    setEditingBlock(true);
  };

  const handleSaveBlock = (updatedData) => {
    onUpdateContentBlock(chapterId, sectionId, block.id, updatedData);
    setEditingBlock(false);
  };

  const handleDeleteBlock = () => {
    if (window.confirm('Are you sure you want to delete this content block?')) {
      onDeleteContentBlock(chapterId, sectionId, block.id);
    }
  };

  const handleReorderBlock = (direction) => {
    onReorderContentBlock(chapterId, sectionId, blockIndex, direction);
  };

  const renderEditControls = () => {
    if (!isEditMode) return null;
    
    return (
      <div className="item-controls content-controls">
        <div className="reorder-controls">
          <button
            onClick={() => handleReorderBlock('up')}
            className="reorder-btn"
            disabled={blockIndex === 0}
            title="Move block up"
          >
            ↑
          </button>
          <button
            onClick={() => handleReorderBlock('down')}
            className="reorder-btn"
            disabled={blockIndex === blocksLength - 1}
            title="Move block down"
          >
            ↓
          </button>
        </div>
        <button
          onClick={handleEditBlock}
          className="edit-btn"
          title="Edit content block"
        >
          ✏️
        </button>
        <button
          onClick={handleDeleteBlock}
          className="delete-btn"
          title="Delete content block"
        >
          🗑️
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="content-block text-block">
            {renderEditControls()}
            <p>{block.data.text}</p>
          </div>
        );

      case 'image':
        return (
          <div className="content-block image-block">
            {renderEditControls()}
            <figure>
              <img 
                src={block.data.url} 
                alt={block.data.caption || "Content image"} 
                className="content-image"
              />
              {block.data.caption && (
                <figcaption className="image-caption">
                  {block.data.caption}
                </figcaption>
              )}
            </figure>
          </div>
        );

      case 'video':
        return (
          <div className="content-block video-block">
            {renderEditControls()}
            <iframe
              src={block.data.embedUrl}
              title={block.data.description || "Video content"}
              frameBorder="0"
              allowFullScreen
              className="content-video"
            ></iframe>
            {block.data.description && (
              <p className="video-description">{block.data.description}</p>
            )}
          </div>
        );

      case 'link':
        return (
          <div className="content-block link-block">
            {renderEditControls()}
            <a
              href={block.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="content-link"
            >
              {block.data.displayText}
            </a>
          </div>
        );

      default:
        console.warn(`Unknown content block type: ${block.type}`);
        return (
          <div className="content-block unknown-block">
            {renderEditControls()}
            <p>Unknown content type: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <>
      {renderContent()}
      {editingBlock && (
        <EditForm
          entityData={block.data}
          entityType={block.type}
          onSave={handleSaveBlock}
          onCancel={() => setEditingBlock(false)}
        />
      )}
    </>
  );
};

export default ContentBlock;
