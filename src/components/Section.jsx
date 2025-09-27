import React from 'react';
import { useGuide } from '../context/GuideContext';
import ContentBlock from './ContentBlock';
import EditForm from './EditForm';

// Props are simplified to just what's needed to identify the section
export default function Section({ chapterId, section, sectionIndex, totalSections }) {
  const {
    isEditMode,
    handleUpdateSection,
    handleDeleteSection,
    handleReorderSection,
    handleAddContentBlock
  } = useGuide();

  return (
    <div className="section-container">
      {isEditMode ? (
        <EditForm
          data={{ title: section.title, content: section.content }}
          onSave={(newData) => handleUpdateSection(chapterId, section.id, newData)}
        />
      ) : (
        <div className="section-header">
          <h2>{section.title}</h2>
          <p>{section.content}</p>
        </div>
      )}

      {isEditMode && (
        <div className="edit-controls">
          <button onClick={() => handleDeleteSection(chapterId, section.id)}>Delete Section</button>
          <button onClick={() => handleReorderSection(chapterId, sectionIndex, 'up')} disabled={sectionIndex === 0}>Up</button>
          <button onClick={() => handleReorderSection(chapterId, sectionIndex, 'down')} disabled={sectionIndex === totalSections - 1}>Down</button>
        </div>
      )}

      <div className="content-blocks-list">
        {section.contentBlocks.map((block, index) => (
          <ContentBlock
            key={block.id}
            chapterId={chapterId}
            sectionId={section.id}
            block={block}
            blockIndex={index}
            totalBlocks={section.contentBlocks.length}
          />
        ))}
      </div>

      {isEditMode && (
        <div className="add-content-block-controls">
          <button onClick={() => handleAddContentBlock(chapterId, section.id, 'text')}>+ Text</button>
          <button onClick={() => handleAddContentBlock(chapterId, section.id, 'image')}>+ Image</button>
          <button onClick={() => handleAddContentBlock(chapterId, section.id, 'video')}>+ Video</button>
          <button onClick={() => handleAddContentBlock(chapterId, section.id, 'link')}>+ Link</button>
        </div>
      )}
    </div>
  );
}