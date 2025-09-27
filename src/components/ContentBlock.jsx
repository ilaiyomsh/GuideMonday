import React from 'react';
import { useGuide } from '../context/GuideContext';
import EditForm from './EditForm';

// Props are minimal, just for identification
export default function ContentBlock({ chapterId, sectionId, block, blockIndex, totalBlocks }) {
  const {
    isEditMode,
    handleUpdateContentBlock,
    handleDeleteContentBlock,
    handleReorderContentBlock
  } = useGuide();

  const renderViewMode = () => {
    switch (block.type) {
      case 'text':
        return <p>{block.data.text}</p>;
      case 'image':
        return <figure><img src={block.data.url} alt={block.data.caption} /><figcaption>{block.data.caption}</figcaption></figure>;
      case 'video':
        return <iframe src={block.data.embedUrl} title={block.data.description} frameBorder="0" allowFullScreen></iframe>;
      case 'link':
        return <a href={block.data.url} target="_blank" rel="noopener noreferrer">{block.data.displayText}</a>;
      default:
        return <div>Unsupported block type</div>;
    }
  };

  return (
    <div className="content-block">
      {isEditMode ? (
        <EditForm
          data={block.data}
          onSave={(newData) => handleUpdateContentBlock(chapterId, sectionId, block.id, newData)}
          blockType={block.type}
        />
      ) : (
        renderViewMode()
      )}

      {isEditMode && (
        <div className="edit-controls">
          <button onClick={() => handleDeleteContentBlock(chapterId, sectionId, block.id)}>Delete Block</button>
          <button onClick={() => handleReorderContentBlock(chapterId, sectionId, blockIndex, 'up')} disabled={blockIndex === 0}>Up</button>
          <button onClick={() => handleReorderContentBlock(chapterId, sectionId, blockIndex, 'down')} disabled={blockIndex === totalBlocks - 1}>Down</button>
        </div>
      )}
    </div>
  );
}