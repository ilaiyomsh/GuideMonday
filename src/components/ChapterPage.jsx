import React from 'react';
import { useGuide } from '../context/GuideContext';
import Section from './Section';
import EditForm from './EditForm';

// NOTICE: The only prop is 'chapter' which is determined by App's navigation state
export default function ChapterPage({ chapter }) {
  // All handlers and state are now pulled from the context
  const { isEditMode, handleUpdateChapter, handleAddSection } = useGuide();

  if (!chapter) {
    return <div className="loading-container"><p>Chapter not found.</p></div>;
  }

  return (
    <div className="chapter-page">
      {isEditMode ? (
        <EditForm
          data={{ title: chapter.title, content: chapter.content }}
          onSave={(newData) => handleUpdateChapter(chapter.id, newData)}
        />
      ) : (
        <header className="chapter-header">
          <h1>{chapter.title}</h1>
          <p>{chapter.content}</p>
        </header>
      )}

      <div className="sections-list">
        {chapter.sections.map((section, index) => (
          <Section
            key={section.id}
            chapterId={chapter.id}
            section={section}
            sectionIndex={index}
            totalSections={chapter.sections.length}
          />
        ))}
      </div>

      {isEditMode && (
        <button onClick={() => handleAddSection(chapter.id)} className="add-btn">
          + Add Section
        </button>
      )}
    </div>
  );
}