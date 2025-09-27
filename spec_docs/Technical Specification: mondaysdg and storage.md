# Technical Specification: Interactive Guide for Monday.com Board View

**Version:** 1.0  
**Date:** September 26, 2025  
**Author:** Software Architect

## 1. Overview

This document provides the technical specification for a React-based interactive guide application designed to run within a Monday.com board view. The application will manage the full lifecycle (CRUD) of a guide's content, which is structured as a JSON object. The system will leverage the monday.storage.instance API for data persistence, enabling any user with access to the board view to create, read, and update the guide content.

## 2. System Requirements

### 2.1 Functional Requirements (CRUD)

**Create:** Upon the initial creation of an application instance (i.e., when the view is added to a board), a default JSON guide template will be automatically generated and persisted to the instance storage.

**Read:** On every load, the application will fetch and render the most current version of the guide from storage.

**Update:** Users can edit the guide's content via the UI. All modifications will be saved back to the instance storage, overwriting the previous state.

**Delete:** All persisted data associated with the guide will be automatically and irrevocably deleted when the application instance is removed from the board by a user. This process is managed by the Monday.com platform, and no explicit delete functionality is required within the application UI.

### 2.2 Non-Functional Requirements

**Performance:** The application must exhibit fast load times. The data fetching strategy must be optimized to a single API call for reading the entire guide.

**Data Integrity & Atomicity:** All write operations (Create, Update) must be atomic to prevent data corruption or partial saves. The guide must be treated as a single, consistent unit.

**Simplicity:** The persistence mechanism must be self-contained within the Monday.com ecosystem, requiring no external databases or complex key management.

## 3. System Architecture and Design

### 3.1 Core Technology

- The application will be built entirely using React.
- All interactions with the Monday.com platform will be handled exclusively through the official monday-sdk-js library.

### 3.2 Data Persistence Strategy

**Method:** `monday.storage.instance`

**Definition:** This storage is scoped to a specific instance of the application on a board. All users accessing the app in that location share the same data store. A separate instance on another board will have its own isolated data store.

**Strategy:** The entire guide object will be stored as a single, serialized JSON string under a single, constant key (e.g., `guideData`).

**Justification:** This single-key approach is optimal as it:
- Ensures atomicity for all read/write operations.
- Maximizes performance by minimizing API calls.
- Simplifies state management within the React application.

### 3.3 Data Model & Serialization

The guide's content will be persisted as a stringified JSON object. The application is responsible for serialization and deserialization.

**On Write (Update/Create):** `JSON.stringify(guideObject)`  
**On Read:** `JSON.parse(retrievedString)`

## 4. React Implementation

### 4.1 State Management

The primary application state will be managed using the `useState` hook.

- `guide` [Object]: Holds the parsed guide object.
- `isLoading` [Boolean]: Manages the initial data-fetching state to provide user feedback.

### 4.2 Application Lifecycle: Initial Load (Create & Read)

The core data-fetching logic will be encapsulated within a `useEffect` hook with an empty dependency array to ensure it runs only once on component mount.

```javascript
// Example: Application Initialization Logic
useEffect(() => {
  const initializeApp = async () => {
    try {
      setLoading(true);

      // 1. Attempt to READ the guide from storage
      const storageRes = await monday.storage.instance.getItem('guideData');
      const storedString = storageRes.data.value;

      if (storedString) {
        // If data exists, parse and set it
        setGuide(JSON.parse(storedString));
      } else {
        // 2. If no data exists, CREATE the guide from a default template
        setGuide(DEFAULT_GUIDE_TEMPLATE);
        const stringifiedTemplate = JSON.stringify(DEFAULT_GUIDE_TEMPLATE);
        await monday.storage.instance.setItem('guideData', stringifiedTemplate);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
      setGuide(DEFAULT_GUIDE_TEMPLATE); // Fallback on error
    } finally {
      setLoading(false);
    }
  };

  initializeApp();
}, []);
```

### 4.3 Component Architecture

**App.jsx (Main Container):** The root component. Responsible for the `useEffect` data initialization logic, managing the primary guide state, and passing data and callback functions down to child components.

**Sidebar.jsx:** A navigational component that renders the guide's table of contents (chapters and sections) and handles navigation between them.

**HomePage.jsx:** A presentational component responsible for rendering the homePage object from the guide data.

**ChapterPage.jsx:** Renders a full chapter, mapping over its sections and passing data to the Section component.

**Section.jsx:** Renders a single section within a chapter, mapping over its contentBlocks and passing data to the ContentBlock component.

**ContentBlock.jsx:** A dynamic component that receives a single block object and renders the appropriate JSX based on the block.type property (e.g., text, image, video).

**EditForm.jsx:** A component containing the UI and logic for modifying the guide's content. It will trigger the handleSave function on submission.

### 4.4 Data Flow: Update Operation

1. User interaction with the `EditForm.jsx` component modifies a local copy of the guide state.
2. On submission (e.g., "Save" button click), the updated guide object is passed to a `handleSave` callback function.
3. This function serializes the object and persists it to storage, overwriting the previous version.

```javascript
// Example: Update Function
const handleSave = async (updatedGuide) => {
  try {
    const stringifiedData = JSON.stringify(updatedGuide);
    await monday.storage.instance.setItem('guideData', stringifiedData);

    // Provide user feedback via monday.com's native notice system
    monday.execute('notice', {
      message: 'Guide updated successfully!',
      type: 'success',
      timeout: 5000,
    });
  } catch (error) {
    console.error("Failed to save guide:", error);
    monday.execute('notice', {
      message: 'Error saving guide',
      type: 'error',
      timeout: 5000,
    });
  }
};
```

## 5. Error Handling

**JSON Parsing:** The `JSON.parse` operation will be wrapped in a try...catch block. If parsing fails due to corrupted data, the application will fall back to the `DEFAULT_GUIDE_TEMPLATE` to prevent a crash.

**API Failures:** All calls to the monday-sdk-js will be wrapped in try...catch blocks to handle potential network or platform errors gracefully.