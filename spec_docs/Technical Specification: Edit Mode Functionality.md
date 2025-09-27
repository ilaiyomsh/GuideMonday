# Technical Specification: Edit Mode Functionality

**Version:** 2.0  
**Date:** September 26, 2025  
**Author:** Software Architect  
**Dependencies:** Technical Specification: React Interactive Guide v1.0

## 1. Executive Summary

This document extends the core architecture of the Interactive Guide application to include a comprehensive "Edit Mode." This mode provides Content Management System (CMS) capabilities directly within the front-end, allowing for real-time creation, modification, deletion, and reordering of all content entities (Chapters, Sections, and Content Blocks).

The primary objective is to manage all modifications within the client-side state, with a final "Save" action that serializes the entire updated state back into a clean JSON string, ready for persistence.

## 2. Architectural Modifications & State Management

### 2.1. Global State Enhancements

The root App.jsx component's state will be augmented to manage the editing UI and its operations.

**`isEditMode` (Boolean):** A new state variable that serves as a global flag. When true, the application will render all editing controls and forms. This flag can be toggled by a dedicated UI switch in the application header.

**`guideData` (Object):** This existing state will now serve as the "working copy" or "draft." All CRUD (Create, Read, Update, Delete) operations will directly modify this state object, ensuring the UI always reflects the latest changes in real-time.

### 2.2. Core Principle: Immutable State Updates

To ensure predictable state transitions and prevent side effects, all modifications to the guideData object must be performed immutably. Instead of mutating the existing state object directly, handler functions will create new arrays and objects with the updated data.

**Example: Deleting a Section**

This function constructs a new chapters array, replacing the target chapter with a new version that has the specified section filtered out.

```javascript
// Located in App.jsx
const handleDeleteSection = (chapterId, sectionId) => {
  setGuideData(prevData => {
    // Create a new chapters array using map
    const newChapters = prevData.chapters.map(chapter => {
      // If this is not the target chapter, return it as is
      if (chapter.id !== chapterId) {
        return chapter;
      }
      // If it IS the target chapter, return a new chapter object
      return {
        ...chapter,
        // With a new sections array that excludes the deleted section
        sections: chapter.sections.filter(section => section.id !== sectionId)
      };
    });

    // Return the new top-level state object
    return { ...prevData, chapters: newChapters };
  });
};
```

## 3. Component-Level Implementation for Edit Mode

### 3.1. Overview of UI Controls

When `isEditMode` is true, the following controls will become visible:

**Add Controls:** Buttons for creating new entities (e.g., "Add Chapter", "Add Section", icons for adding different content blocks).

**Item Controls:** Controls displayed next to each existing item, including:
- **Edit:** Toggles an inline form to modify the item's data.
- **Delete:** Removes the item.
- **Reorder:** Up/Down arrows to change the item's position within its list.

### 3.2. Component Modifications

#### 3.2.1. App.jsx

**State:** Manages `isEditMode`.

**Responsibilities:**
- Hosts all handler functions for CRUD operations (`handleAddChapter`, `handleDeleteSection`, `handleUpdateBlockData`, `handleReorderChapter`, etc.). These handlers will be passed down as props to the relevant child components.
- Renders the global "Save" button.
- Implements the `handleSave` function.

#### 3.2.2. ChapterPage.jsx, Section.jsx, etc.

These components will receive the `isEditMode` boolean and the relevant handler functions as props.

They will use conditional rendering to display the appropriate "Add", "Edit", "Delete", and "Reorder" controls only when `isEditMode` is true.

```javascript
// Example inside Section.jsx
{isEditMode && (
  <div className="item-controls">
    <button onClick={() => onEdit(section.id)}>Edit</button>
    <button onClick={() => onDelete(section.id)}>Delete</button>
    {/* ... reorder buttons ... */}
  </div>
)}
```

### 3.3. New Component: EditForm.jsx

**Type:** Dynamic Presentational Component

**Responsibilities:**
- Renders a form with input fields tailored to the specific content entity being edited.
- It will be rendered conditionally within a component (e.g., ContentBlock.jsx) when a user clicks "Edit".

**Props API:**
- `entityData`: (Object) The current data for the item being edited (e.g., `{ text: 'Hello' }`).
- `entityType`: (String) The type of the entity ('text', 'image', 'chapter', etc.) to determine which fields to render.
- `onSave`: (Function) A callback that passes the updated data object back up to the App component handler.
- `onCancel`: (Function) A callback to close the form without saving.

**Example EditForm.jsx Logic:**

```javascript
const EditForm = ({ entityData, entityType, onSave, onCancel }) => {
  const [formData, setFormData] = useState(entityData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderFields = () => {
    switch (entityType) {
      case 'text':
        return <textarea name="text" value={formData.text} onChange={handleChange} />;
      case 'image':
        return (
          <>
            <input name="url" value={formData.url} onChange={handleChange} placeholder="Image URL" />
            <input name="caption" value={formData.caption} onChange={handleChange} placeholder="Caption" />
          </>
        );
      // ... other cases for 'video', 'link', 'chapter', 'section'
      default:
        return null;
    }
  };

  return (
    <div className="edit-form">
      {renderFields()}
      <button onClick={() => onSave(formData)}>Save Changes</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};
```

## 4. Reordering Logic

Reordering will be handled by functions in App.jsx. These functions will take the index of the item to be moved and the direction ('up' or 'down'). They must create a new, reordered array.

**Example: Reordering a Chapter**

```javascript
// Located in App.jsx
const handleReorderChapter = (chapterIndex, direction) => {
  const newIndex = direction === 'up' ? chapterIndex - 1 : chapterIndex + 1;
  
  // Boundary check
  if (newIndex < 0 || newIndex >= guideData.chapters.length) {
    return;
  }

  setGuideData(prevData => {
    const newChapters = [...prevData.chapters]; // Create a mutable copy
    const [movedChapter] = newChapters.splice(chapterIndex, 1); // Remove the item
    newChapters.splice(newIndex, 0, movedChapter); // Insert it at the new position
    return { ...prevData, chapters: newChapters };
  });
};
```

## 5. The "Save" Mechanism (Persistence)

The final step is to serialize the modified state into a JSON string.

A "Save" button will be rendered in the main App component, likely in the header, and will be visible only when `isEditMode` is true.

Its onClick handler will trigger the `handleSave` function.

**handleSave Function Implementation:**

This function is responsible for converting the `guideData` state object into a well-formatted JSON string. The resulting string can then be logged, sent to a backend API, or used to generate a downloadable file.

```javascript
// Located in App.jsx
const handleSave = () => {
  try {
    // The 'null, 2' arguments add indentation for readability
    const jsonString = JSON.stringify(guideData, null, 2);
    
    // For demonstration, we can log it to the console.
    // In a real application, this would be an API call or file download.
    console.log("Saving updated guide data:");
    console.log(jsonString);
    
    // Optionally, exit edit mode after saving
    setIsEditMode(false); 
    alert('Changes saved successfully! Check the console.');

  } catch (error) {
    console.error("Failed to serialize guide data:", error);
    alert('An error occurred while saving.');
  }
};
```
