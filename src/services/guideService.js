/**
 * Guide Service - Business logic for CRUD operations
 * Separated from useGuideManager to keep hooks focused on state management
 */

import { generateId } from '../utils/helpers';

/**
 * Update home page data
 */
export const updateHomePage = (guideData, newData) => {
  return {
    ...guideData,
    homePage: { ...guideData.homePage, ...newData }
  };
};

/**
 * Update a specific chapter
 */
export const updateChapter = (guideData, chapterId, newData) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter =>
      chapter.id === chapterId ? { ...chapter, ...newData } : chapter
    )
  };
};

/**
 * Delete a chapter
 */
export const deleteChapter = (guideData, chapterId) => {
  return {
    ...guideData,
    chapters: guideData.chapters.filter(chapter => chapter.id !== chapterId)
  };
};

/**
 * Add a new chapter
 */
export const addChapter = (guideData) => {
  const chapterNumber = (guideData?.chapters?.length || 0) + 1;
  const newChapter = {
    id: generateId('chap'),
    title: 'פרק חדש',
    content: 'תיאור הפרק יופיע כאן.',
    sections: []
  };
  return {
    ...guideData,
    chapters: [...(guideData.chapters || []), newChapter]
  };
};

/**
 * Reorder chapters
 */
export const reorderChapter = (guideData, chapterIndex, direction) => {
  const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
  if (newIndex < 0 || newIndex >= guideData.chapters.length) {
    return guideData;
  }

  const newChapters = [...guideData.chapters];
  const [movedChapter] = newChapters.splice(chapterIndex, 1);
  newChapters.splice(newIndex, 0, movedChapter);
  
  return { ...guideData, chapters: newChapters };
};

/**
 * Update a section within a chapter
 */
export const updateSection = (guideData, chapterId, sectionId, newData) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.map(section =>
          section.id === sectionId ? { ...section, ...newData } : section
        )
      };
    })
  };
};

/**
 * Delete a section
 */
export const deleteSection = (guideData, chapterId, sectionId) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.filter(section => section.id !== sectionId)
      };
    })
  };
};

/**
 * Add a new section to a chapter
 */
export const addSection = (guideData, chapterId) => {
  const newSection = {
    id: generateId('sec'),
    title: 'סעיף חדש',
    contentBlocks: []
  };
  
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => 
      chapter.id === chapterId
        ? { ...chapter, sections: [...chapter.sections, newSection] }
        : chapter
    )
  };
};

/**
 * Reorder sections within a chapter
 */
export const reorderSection = (guideData, chapterId, sectionIndex, direction) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      
      const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      if (newIndex < 0 || newIndex >= chapter.sections.length) return chapter;
      
      const newSections = [...chapter.sections];
      const [movedSection] = newSections.splice(sectionIndex, 1);
      newSections.splice(newIndex, 0, movedSection);
      
      return { ...chapter, sections: newSections };
    })
  };
};

/**
 * Update a content block
 */
export const updateContentBlock = (guideData, chapterId, sectionId, blockId, newData) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            contentBlocks: section.contentBlocks.map(block =>
              block.id === blockId ? { ...block, data: newData } : block
            )
          };
        })
      };
    })
  };
};

/**
 * Delete a content block
 */
export const deleteContentBlock = (guideData, chapterId, sectionId, blockId) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            contentBlocks: section.contentBlocks.filter(block => block.id !== blockId)
          };
        })
      };
    })
  };
};

/**
 * Add a new content block to a section
 */
export const addContentBlock = (guideData, chapterId, sectionId, blockType = 'text') => {
  const blockData = {
    text: { text: '' }, // בלוק ריק
    image: { url: '', caption: '' }, // בלוק ריק
    video: { embedUrl: '', description: '' }, // בלוק ריק
    link: { url: '', displayText: '' }, // בלוק ריק
  };
  
  const newBlock = {
    id: generateId('block'),
    type: blockType,
    data: blockData[blockType] || blockData.text
  };
  
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.map(section => {
          if (section.id !== sectionId) return section;
          return {
            ...section,
            contentBlocks: [...section.contentBlocks, newBlock]
          };
        })
      };
    })
  };
};

/**
 * Reorder content blocks within a section
 */
export const reorderContentBlock = (guideData, chapterId, sectionId, blockIndex, direction) => {
  return {
    ...guideData,
    chapters: guideData.chapters.map(chapter => {
      if (chapter.id !== chapterId) return chapter;
      return {
        ...chapter,
        sections: chapter.sections.map(section => {
          if (section.id !== sectionId) return section;
          
          const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
          if (newIndex < 0 || newIndex >= section.contentBlocks.length) return section;
          
          const newBlocks = [...section.contentBlocks];
          const [movedBlock] = newBlocks.splice(blockIndex, 1);
          newBlocks.splice(newIndex, 0, movedBlock);
          
          return { ...section, contentBlocks: newBlocks };
        })
      };
    })
  };
};
