import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMondayApi } from './useMondayApi';
import mondaySdk from 'monday-sdk-js';
import { deepClone, isEqual } from '../utils/helpers';
import * as guideService from '../services/guideService';

const monday = mondaySdk();
monday.setApiVersion("2023-10");

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
  const [isOwner, setIsOwner] = useState(false);
  
  // Function to check if current user is owner of the board
  const checkOwnerStatus = useCallback(async () => {
    try {
      const context = await monday.get('context');
      const boardId = context.data.boardId;
      const userId = context.data.user.id;
      
      if (!boardId || !userId) {
        setIsOwner(false);
        return;
      }
      
      const query = `
        query {
          boards(ids: [${boardId}]) {
            owners {
              id
            }
          }
        }
      `;
      
      const response = await monday.api(query);
      const owners = response.data.boards[0].owners;
      const isUserOwner = owners.some(owner => owner.id === userId);
      
      setIsOwner(isUserOwner);
      
    } catch (error) {
      setIsOwner(false);
    }
  }, []);
  
  // Load the initial data when the application mounts
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const data = await fetchGuide();
      
      if (data) {
        // Data found, set it up normally
        setGuideData(data);
        setOriginalData(deepClone(data)); // Deep copy for comparison
      } else {
        // No data found, set to null to show setup screen
        setGuideData(null);
        setOriginalData(null);
      }
      
      setIsLoading(false);
      
      // Check owner status after loading data
      await checkOwnerStatus();
    };
    loadInitialData();
  }, [fetchGuide, checkOwnerStatus]);

  // Calculate if there are unsaved changes
  const hasChanges = useMemo(() => {
    return () => {
      if (!guideData || !originalData) return false;
      return !isEqual(guideData, originalData);
    };
  }, [guideData, originalData]);
  
  // Save function that calls the API and handles exiting edit mode
  const handleSave = async () => {
    if (!guideData) return;
    const success = await saveApi(guideData);
    if (success) {
      setOriginalData(deepClone(guideData)); // Update original data after successful save
      setIsEditMode(false);
      return true;
    }
    return false;
  };

  // --- CRUD & Reordering Handlers ---
  // Using guideService for business logic, keeping state management here

  const handleUpdateHomePage = (newData) => {
    setGuideData(prevData => guideService.updateHomePage(prevData, newData));
  };

  const handleUpdateChapter = (chapterId, newData) => {
    setGuideData(prevData => guideService.updateChapter(prevData, chapterId, newData));
  };

  const handleDeleteChapter = (chapterId) => {
    setGuideData(prevData => guideService.deleteChapter(prevData, chapterId));
  };

  const handleUpdateSection = (chapterId, sectionId, newData) => {
    setGuideData(prevData => guideService.updateSection(prevData, chapterId, sectionId, newData));
  };

  const handleUpdateContentBlock = (chapterId, sectionId, blockId, newData) => {
    setGuideData(prevData => guideService.updateContentBlock(prevData, chapterId, sectionId, blockId, newData));
  };

  const handleDeleteSection = (chapterId, sectionId) => {
    setGuideData(prevData => guideService.deleteSection(prevData, chapterId, sectionId));
  };

  const handleDeleteContentBlock = (chapterId, sectionId, blockId) => {
    setGuideData(prevData => guideService.deleteContentBlock(prevData, chapterId, sectionId, blockId));
  };

  const handleReorderChapter = (chapterIndex, direction) => {
    setGuideData(prevData => guideService.reorderChapter(prevData, chapterIndex, direction));
  };

  const handleReorderSection = (chapterId, sectionIndex, direction) => {
    setGuideData(prevData => guideService.reorderSection(prevData, chapterId, sectionIndex, direction));
  };

  const handleReorderContentBlock = (chapterId, sectionId, blockIndex, direction) => {
    setGuideData(prevData => guideService.reorderContentBlock(prevData, chapterId, sectionId, blockIndex, direction));
  };

  const handleAddChapter = () => {
    setGuideData(prevData => guideService.addChapter(prevData));
  };

  const handleAddSection = (chapterId) => {
    setGuideData(prevData => guideService.addSection(prevData, chapterId));
  };

  const handleAddContentBlock = (chapterId, sectionId, blockType = 'text') => {
    setGuideData(prevData => guideService.addContentBlock(prevData, chapterId, sectionId, blockType));
  };

  // Function to load guide data from external source (setup screen)
  const loadGuideData = useCallback(async (newGuideData) => {
    setGuideData(newGuideData);
    setOriginalData(deepClone(newGuideData));
    
    // Save the new guide data to Monday Storage
    try {
      await saveApi(newGuideData);
      console.log("Guide data saved to Monday Storage successfully");
    } catch (error) {
      console.error("Failed to save guide data to Monday Storage:", error);
    }
    
    setIsLoading(false);
  }, [saveApi]);

  // Expose all state variables and handler functions for use in components
  return {
    guideData,
    isLoading,
    isEditMode,
    setIsEditMode,
    isOwner,
    hasChanges,
    loadGuideData,
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