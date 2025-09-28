import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMondayApi } from './useMondayApi'; // Ensure you have created this file as demonstrated

// Helper function to generate unique IDs
const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * A custom hook to manage all the business logic and state for the interactive guide.
 * It separates the logic from the presentation layer (App.jsx) and uses useMondayApi to handle communication.
 */
export const useGuideManager = () => {
  // Use the API hook for loading and saving data
  const { fetchGuide, saveGuide: saveApi } = useMondayApi();

  // Manage the core state of the application
  const [guideData, setGuideData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load the initial data when the application mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const data = await fetchGuide();
      setGuideData(data);
      setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy for comparison
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchGuide]);

  // Calculate if there are unsaved changes
  const hasChanges = useMemo(() => {
    return () => {
      if (!guideData || !originalData) return false;
      return JSON.stringify(guideData) !== JSON.stringify(originalData);
    };
  }, [guideData, originalData]);
  
  // Save function that calls the API and handles exiting edit mode
  const handleSave = async () => {
    if (!guideData) return;
    const success = await saveApi(guideData);
    if (success) {
      setOriginalData(JSON.parse(JSON.stringify(guideData))); // Update original data after successful save
      setIsEditMode(false);
      return true;
    }
    return false;
  };

  // --- CRUD & Reordering Handlers ---
  // All these functions were moved from App.jsx and adapted to work with setGuideData

  const handleUpdateHomePage = (newData) => {
    setGuideData(prevData => ({
      ...prevData,
      homePage: { ...prevData.homePage, ...newData }
    }));
  };

  const handleUpdateChapter = (chapterId, newData) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter =>
        chapter.id === chapterId ? { ...chapter, ...newData } : chapter
      )
    }));
  };

  const handleDeleteChapter = (chapterId) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.filter(chapter => chapter.id !== chapterId)
    }));
  };

  const handleUpdateSection = (chapterId, sectionId, newData) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        return {
          ...chapter,
          sections: chapter.sections.map(section =>
            section.id === sectionId ? { ...section, ...newData } : section
          )
        };
      })
    }));
  };

  const handleUpdateContentBlock = (chapterId, sectionId, blockId, newData) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
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
    }));
  };

  const handleDeleteSection = (chapterId, sectionId) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        return {
          ...chapter,
          sections: chapter.sections.filter(section => section.id !== sectionId)
        };
      })
    }));
  };


  const handleDeleteContentBlock = (chapterId, sectionId, blockId) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
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
    }));
  };

  const handleReorderChapter = (chapterIndex, direction) => {
    const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    if (newIndex < 0 || newIndex >= guideData.chapters.length) return;

    setGuideData(prevData => {
      const newChapters = [...prevData.chapters];
      const [movedChapter] = newChapters.splice(chapterIndex, 1);
      newChapters.splice(newIndex, 0, movedChapter);
      return { ...prevData, chapters: newChapters };
    });
  };

  const handleReorderSection = (chapterId, sectionIndex, direction) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
        if (newIndex < 0 || newIndex >= chapter.sections.length) return chapter;
        
        const newSections = [...chapter.sections];
        const [movedSection] = newSections.splice(sectionIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        return { ...chapter, sections: newSections };
      })
    }));
  };

  const handleReorderContentBlock = (chapterId, sectionId, blockIndex, direction) => {
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
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
    }));
  };

  const handleAddChapter = () => {
    const newChapter = {
      id: generateId('chap'),
      title: 'New Chapter',
      content: 'Chapter description goes here.',
      sections: []
    };
    setGuideData(prevData => ({
      ...prevData,
      chapters: [...(prevData.chapters || []), newChapter]
    }));
  };

  const handleAddSection = (chapterId) => {
    const newSection = {
      id: generateId('sec'),
      title: 'New Section',
      content: 'Section description goes here.',
      contentBlocks: []
    };
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => 
        chapter.id === chapterId
          ? { ...chapter, sections: [...chapter.sections, newSection] }
          : chapter
      )
    }));
  };

  const handleAddContentBlock = (chapterId, sectionId, blockType = 'text') => {
    const blockData = {
      text: { text: 'New text content goes here.' },
      image: { url: 'https://placehold.co/600x300/e9ecef/6c757d?text=New+Image', caption: 'Image caption' },
      video: { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Video description' },
      link: { url: 'https://example.com', displayText: 'New Link' },
    };
    
    const newBlock = {
      id: generateId('block'),
      type: blockType,
      data: blockData[blockType] || blockData.text
    };
    
    setGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
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
    }));
  };

  // Expose all state variables and handler functions for use in components
  return {
    guideData,
    isLoading,
    isEditMode,
    setIsEditMode,
    hasChanges,
    handleSave,
    handleUpdateHomePage,
    handleUpdateChapter,
    handleDeleteChapter,
    handleUpdateSection,
    handleDeleteSection,
    handleUpdateContentBlock,
    handleDeleteContentBlock,
    handleReorderChapter,
    handleReorderSection,
    handleReorderContentBlock,
    handleAddChapter,
    handleAddSection,
    handleAddContentBlock,
  };
};