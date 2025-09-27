import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "@vibe/core/tokens";
import { DEFAULT_GUIDE_TEMPLATE } from "./defaultGuideTemplate";
import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import ChapterPage from "./components/ChapterPage";

const monday = mondaySdk();

const App = () => {
  const [context, setContext] = useState();
  const [activePage, setActivePage] = useState({ type: 'home', id: null });
  const [isEditMode, setIsEditMode] = useState(false);
  const [localGuideData, setLocalGuideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    monday.execute("valueCreatedForUser");

    monday.listen("context", (res) => {
      setContext(res.data);
    });

    // Initialize the app with Monday Storage
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      console.log("=== INITIALIZING APP ===");
      console.log("Loading guide data from Monday Storage...");

      // 1. Attempt to READ the guide from Monday Storage
      console.log("Sending GET request to monday.storage.instance.getItem('guideData')");
      const storageRes = await monday.storage.instance.getItem('guideData');
      console.log("GET Response - Full object:", JSON.stringify(storageRes, null, 2));
      console.log("GET Response - data field:", storageRes?.data);
      console.log("GET Response - value field:", storageRes?.data?.value);
      console.log("GET Response - value type:", typeof storageRes?.data?.value);
      console.log("GET Response - value length:", storageRes?.data?.value?.length);
      
      const storedString = storageRes?.data?.value;

      if (storedString && storedString.trim() !== '') {
        // If data exists, parse and set it
        console.log("Found existing data, attempting to parse...");
        console.log("Raw stored string:", storedString);
        try {
          const parsedData = JSON.parse(storedString);
          console.log("Successfully parsed stored data:", parsedData);
          setLocalGuideData(parsedData);
          console.log("Set localGuideData with parsed data");
        } catch (parseError) {
          console.error("Failed to parse stored data, using default template:", parseError);
          console.log("Creating new guide from default template");
          setLocalGuideData(DEFAULT_GUIDE_TEMPLATE);
          // Save the default template to fix corrupted data
          const templateString = JSON.stringify(DEFAULT_GUIDE_TEMPLATE);
          console.log("Sending SET request to fix corrupted data:", templateString.substring(0, 100) + "...");
          const setRes = await monday.storage.instance.setItem('guideData', templateString);
          console.log("SET Response for corrupted data fix:", setRes);
        }
      } else {
        // 2. If no data exists, CREATE the guide from default template
        console.log("No existing data found, creating new guide from template");
        console.log("Default template:", DEFAULT_GUIDE_TEMPLATE);
        setLocalGuideData(DEFAULT_GUIDE_TEMPLATE);
        
        const stringifiedTemplate = JSON.stringify(DEFAULT_GUIDE_TEMPLATE);
        console.log("Saving default template to Monday Storage");
        console.log("Template string to save (first 200 chars):", stringifiedTemplate.substring(0, 200) + "...");
        console.log("Template string length:", stringifiedTemplate.length);
        
        console.log("Sending SET request to monday.storage.instance.setItem('guideData', template)");
        const setResponse = await monday.storage.instance.setItem('guideData', stringifiedTemplate);
        console.log("SET Response - Full object:", JSON.stringify(setResponse, null, 2));
        console.log("Default template save completed");
        
        // Verify the save immediately
        console.log("Verifying save by reading back immediately...");
        const verifyRes = await monday.storage.instance.getItem('guideData');
        console.log("Verification GET Response:", JSON.stringify(verifyRes, null, 2));
        console.log("Verification - value found:", verifyRes?.data?.value ? "YES" : "NO");
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      console.error("Error stack:", error.stack);
      console.log("Using fallback - setting default template");
      setLocalGuideData(DEFAULT_GUIDE_TEMPLATE); // Fallback on error
      
      // Try to save default template as fallback
      try {
        const fallbackTemplate = JSON.stringify(DEFAULT_GUIDE_TEMPLATE);
        console.log("Attempting to save fallback template...");
        const fallbackSetRes = await monday.storage.instance.setItem('guideData', fallbackTemplate);
        console.log("Fallback SET Response:", fallbackSetRes);
        console.log("Fallback template saved");
      } catch (saveError) {
        console.error("Failed to save fallback template:", saveError);
        console.error("Fallback save error stack:", saveError.stack);
      }
      
      // Show user-friendly error message
      if (monday.execute) {
        monday.execute('notice', {
          message: 'Failed to load guide data. Using default content.',
          type: 'warning',
          timeout: 5000,
        });
      }
    } finally {
      setIsLoading(false);
      console.log("=== APP INITIALIZATION COMPLETED ===");
    }
  };

  const handleNavigate = (type, id = null) => {
    setActivePage({ type, id });
  };

  const getCurrentChapter = () => {
    if (activePage.type === 'chapter' && activePage.id && localGuideData?.chapters) {
      return localGuideData.chapters.find(chapter => chapter.id === activePage.id);
    }
    return null;
  };

  // Toggle Edit Mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // CRUD Handlers
  const handleUpdateHomePage = (newData) => {
    if (!localGuideData) return;
    
    setLocalGuideData(prevData => ({
      ...prevData,
      homePage: { ...prevData.homePage, ...newData }
    }));
  };

  const handleUpdateChapter = (chapterId, newData) => {
    if (!localGuideData?.chapters) return;
    
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, ...newData }
          : chapter
      )
    }));
  };

  const handleDeleteChapter = (chapterId) => {
    if (!localGuideData?.chapters) return;
    
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.filter(chapter => chapter.id !== chapterId)
    }));
    // If we're viewing the deleted chapter, go home
    if (activePage.type === 'chapter' && activePage.id === chapterId) {
      setActivePage({ type: 'home', id: null });
    }
  };

  const handleUpdateSection = (chapterId, sectionId, newData) => {
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        return {
          ...chapter,
          sections: chapter.sections.map(section =>
            section.id === sectionId
              ? { ...section, ...newData }
              : section
          )
        };
      })
    }));
  };

  const handleDeleteSection = (chapterId, sectionId) => {
    setLocalGuideData(prevData => ({
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

  const handleUpdateContentBlock = (chapterId, sectionId, blockId, newData) => {
    setLocalGuideData(prevData => ({
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
                block.id === blockId
                  ? { ...block, data: { ...block.data, ...newData } }
                  : block
              )
            };
          })
        };
      })
    }));
  };

  const handleDeleteContentBlock = (chapterId, sectionId, blockId) => {
    setLocalGuideData(prevData => ({
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

  // Reordering Functions
  const handleReorderChapter = (chapterIndex, direction) => {
    if (!localGuideData?.chapters) return;
    
    const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
    
    if (newIndex < 0 || newIndex >= localGuideData.chapters.length) {
      return;
    }

    setLocalGuideData(prevData => {
      const newChapters = [...prevData.chapters];
      const [movedChapter] = newChapters.splice(chapterIndex, 1);
      newChapters.splice(newIndex, 0, movedChapter);
      return { ...prevData, chapters: newChapters };
    });
  };

  const handleReorderSection = (chapterId, sectionIndex, direction) => {
    const newIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
    
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        
        if (newIndex < 0 || newIndex >= chapter.sections.length) {
          return chapter;
        }
        
        const newSections = [...chapter.sections];
        const [movedSection] = newSections.splice(sectionIndex, 1);
        newSections.splice(newIndex, 0, movedSection);
        
        return { ...chapter, sections: newSections };
      })
    }));
  };

  const handleReorderContentBlock = (chapterId, sectionId, blockIndex, direction) => {
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => {
        if (chapter.id !== chapterId) return chapter;
        return {
          ...chapter,
          sections: chapter.sections.map(section => {
            if (section.id !== sectionId) return section;
            
            if (newIndex < 0 || newIndex >= section.contentBlocks.length) {
              return section;
            }
            
            const newBlocks = [...section.contentBlocks];
            const [movedBlock] = newBlocks.splice(blockIndex, 1);
            newBlocks.splice(newIndex, 0, movedBlock);
            
            return { ...section, contentBlocks: newBlocks };
          })
        };
      })
    }));
  };

  // Creation Functions
  const generateId = (prefix = 'item') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddChapter = () => {
    if (!localGuideData) {
      console.warn("Cannot add chapter - no guide data available");
      return;
    }
    
    const newChapter = {
      id: generateId('chap'),
      title: 'New Chapter',
      content: 'Chapter description goes here.',
      sections: []
    };
    
    console.log("Adding new chapter:", newChapter);
    
    setLocalGuideData(prevData => {
      const updatedData = {
        ...prevData,
        chapters: [...(prevData.chapters || []), newChapter]
      };
      console.log("Updated guide data with new chapter:", updatedData);
      return updatedData;
    });
  };

  const handleAddSection = (chapterId) => {
    const newSection = {
      id: generateId('sec'),
      title: 'New Section',
      content: 'Section description goes here.',
      contentBlocks: []
    };
    
    setLocalGuideData(prevData => ({
      ...prevData,
      chapters: prevData.chapters.map(chapter => 
        chapter.id === chapterId
          ? { ...chapter, sections: [...chapter.sections, newSection] }
          : chapter
      )
    }));
  };

  const handleAddContentBlock = (chapterId, sectionId, blockType = 'text') => {
    let blockData = {};
    
    switch (blockType) {
      case 'text':
        blockData = { text: 'New text content goes here.' };
        break;
      case 'image':
        blockData = { url: 'https://placehold.co/600x300/e9ecef/6c757d?text=New+Image', caption: 'Image caption' };
        break;
      case 'video':
        blockData = { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: 'Video description' };
        break;
      case 'link':
        blockData = { url: 'https://example.com', displayText: 'New Link' };
        break;
      default:
        blockData = { text: 'New content' };
    }
    
    const newBlock = {
      id: generateId('block'),
      type: blockType,
      data: blockData
    };
    
    setLocalGuideData(prevData => ({
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

  // Save functionality to Monday Storage
  // פונקציית עזר להשהייה
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

 const handleSave = async () => {
   console.log("=== ROBUST SAVE PROCESS STARTED ===");
   const MAX_RETRIES = 3;
   const RETRY_DELAY_MS = 500; // חצי שנייה
   let saveSuccessful = false;

   // וודא שיש נתונים לשמירה
   if (!localGuideData) {
     console.error("No guide data to save");
     monday.execute('notice', {
       message: 'אין נתונים לשמירה',
       type: 'error',
       timeout: 5000,
     });
     return;
   }

   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
     try {
       console.log(`Save Attempt ${attempt} of ${MAX_RETRIES}...`);
       console.log("Data to save:", localGuideData);
       const jsonString = JSON.stringify(localGuideData);

      // 1. נסיון כתיבה
      const saveResponse = await monday.storage.instance.setItem('guideData', jsonString);
      if (!saveResponse.data.success) {
        throw new Error("SDK reported a failure on setItem.");
      }
      console.log(`Attempt ${attempt}: Save request acknowledged by SDK.`);

      // 2. המתנה קצרה כדי לאפשר לשרת להתעדכן
      await sleep(RETRY_DELAY_MS);

      // 3. וידוא שהמידע אכן נכתב
      const verifyResponse = await monday.storage.instance.getItem('guideData');
      if (verifyResponse.data.value) {
        console.log(`Attempt ${attempt}: Verification successful! Data is persisted.`);
        saveSuccessful = true;
        break; // יציאה מהלולאה במקרה של הצלחה
      } else {
        console.warn(`Attempt ${attempt}: Verification FAILED. No value found after save.`);
        // הלולאה תמשיך לניסיון הבא
      }
    } catch (error) {
      console.error(`Save attempt ${attempt} failed:`, error);
    }
  }

 // מתן משוב סופי למשתמש
 if (saveSuccessful) {
   monday.execute('notice', {
     message: 'המדריך עודכן ונשמר בהצלחה!',
     type: 'success',
     timeout: 5000,
   });

   // יציאה ממצב עריכה אחרי שמירה מוצלחת
   setIsEditMode(false);
   
   // רענון הנתונים לוודא שהכל מתעדכן
   await refreshGuideData();
   
 } else {
   monday.execute('notice', {
     message: 'שגיאה קריטית: לא ניתן היה לשמור את השינויים. נסה לרענן את הדף.',
     type: 'error',
     timeout: 8000,
   });
 }
 console.log("=== ROBUST SAVE PROCESS COMPLETED ===");
};

  // Refresh guide data from storage
  const refreshGuideData = async () => {
    try {
      console.log("=== STARTING REFRESH PROCESS ===");
      console.log("Sending GET request for refresh...");
      
      const storageRes = await monday.storage.instance.getItem('guideData');
      console.log("REFRESH GET Response - Full object:", JSON.stringify(storageRes, null, 2));
      console.log("REFRESH - data field:", storageRes?.data);
      console.log("REFRESH - value field exists:", storageRes?.data?.value ? "YES" : "NO");
      console.log("REFRESH - value type:", typeof storageRes?.data?.value);
      console.log("REFRESH - value length:", storageRes?.data?.value?.length);
      
      const storedString = storageRes?.data?.value;
      
      if (storedString && storedString.trim() !== '') {
        console.log("REFRESH - Found data, parsing...");
        console.log("REFRESH - Raw stored string (first 200 chars):", storedString.substring(0, 200) + "...");
        
        try {
          const parsedData = JSON.parse(storedString);
          console.log("REFRESH - Successfully parsed data:", parsedData);
          console.log("REFRESH - Setting localGuideData with refreshed data");
          setLocalGuideData(parsedData);
          console.log("REFRESH - localGuideData updated");
        } catch (parseError) {
          console.error("REFRESH - Failed to parse refreshed data:", parseError);
        }
      } else {
        console.log("REFRESH - No data found in storage");
      }
      
      console.log("=== REFRESH PROCESS COMPLETED ===");
      
    } catch (error) {
      console.error("Failed to refresh guide data:", error);
      console.error("Refresh error stack:", error.stack);
    }
  };

  const renderMainContent = () => {
    // Show loading state while initializing
    if (isLoading || !localGuideData) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your guide...</p>
          </div>
        </div>
      );
    }

    switch (activePage.type) {
      case 'home':
        return (
          <HomePage
            homePageData={localGuideData?.homePage || { title: "Loading...", content: "" }}
            chapters={localGuideData?.chapters || []}
            onNavigate={handleNavigate}
            isEditMode={isEditMode}
            onUpdateHomePage={handleUpdateHomePage}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderChapter={handleReorderChapter}
            onAddChapter={handleAddChapter}
          />
        );
      case 'chapter':
        const chapter = getCurrentChapter();
        return (
          <ChapterPage 
            chapter={chapter}
            isEditMode={isEditMode}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onUpdateContentBlock={handleUpdateContentBlock}
            onDeleteContentBlock={handleDeleteContentBlock}
            onReorderSection={handleReorderSection}
            onReorderContentBlock={handleReorderContentBlock}
            onAddSection={handleAddSection}
            onAddContentBlock={handleAddContentBlock}
          />
        );
      default:
        return (
          <HomePage
            homePageData={localGuideData?.homePage || { title: "Loading...", content: "" }}
            chapters={localGuideData?.chapters || []}
            onNavigate={handleNavigate}
            isEditMode={isEditMode}
            onUpdateHomePage={handleUpdateHomePage}
            onUpdateChapter={handleUpdateChapter}
            onDeleteChapter={handleDeleteChapter}
            onReorderChapter={handleReorderChapter}
            onAddChapter={handleAddChapter}
          />
        );
    }
  };

  return (
    <div className="App">
      <div className="app-header">
        <div className="header-controls">
          <button 
            onClick={toggleEditMode}
            className={`toggle-edit-btn ${isEditMode ? 'active' : ''}`}
          >
            {isEditMode ? '👁️ View Mode' : '✏️ Edit Mode'}
          </button>
          {isEditMode && (
            <button onClick={handleSave} className="save-btn">
              💾 Save Changes
            </button>
          )}
          <button 
            onClick={refreshGuideData} 
            className="refresh-btn"
            disabled={isLoading}
            title="Refresh data from storage"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      <div className="app-layout">
        {!isLoading && localGuideData && (
          <Sidebar
            chapters={localGuideData.chapters || []}
            onNavigate={handleNavigate}
            activePageId={activePage.id}
          />
        )}
        <main className="main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
