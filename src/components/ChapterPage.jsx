import React from "react";
import Section from "./Section";

const ChapterPage = ({ 
  chapter, 
  isEditMode, 
  onUpdateSection, 
  onDeleteSection,
  onUpdateContentBlock,
  onDeleteContentBlock,
  onReorderSection,
  onReorderContentBlock,
  onAddSection,
  onAddContentBlock
}) => {
  if (!chapter) {
    return (
      <div className="chapter-not-found">
        <h2>Chapter Not Found</h2>
        <p>The requested chapter could not be found.</p>
      </div>
    );
  }

  return (
    <div className="chapter-page">
      <div className="chapter-header">
        <h1 className="chapter-title">{chapter.title}</h1>
        <p className="chapter-content">{chapter.content}</p>
        {isEditMode && (
          <div className="add-section-container">
            <button 
              onClick={() => onAddSection(chapter.id)} 
              className="add-btn add-section-btn"
            >
              ➕ Add New Section
            </button>
          </div>
        )}
      </div>

      <div className="sections-container">
        {chapter.sections && chapter.sections.map((section, index) => (
          <Section 
            key={section.id} 
            section={section}
            sectionIndex={index}
            sectionsLength={chapter.sections.length}
            chapterId={chapter.id}
            isEditMode={isEditMode}
            onUpdateSection={onUpdateSection}
            onDeleteSection={onDeleteSection}
            onUpdateContentBlock={onUpdateContentBlock}
            onDeleteContentBlock={onDeleteContentBlock}
            onReorderSection={onReorderSection}
            onReorderContentBlock={onReorderContentBlock}
            onAddContentBlock={onAddContentBlock}
          />
        ))}
      </div>
    </div>
  );
};

export default ChapterPage;
