import React from 'react';
import { EmptyState, Button } from '@vibe/core';
import { Add } from '@vibe/icons';
import { useGuide } from '../context/GuideContext.jsx';

export default function EmptyChapters() {
  const { handleAddChapter, isEditMode } = useGuide();

  if (!isEditMode) {
    return (
      <EmptyState
        title="No chapters yet"
        description="This guide doesn't have any chapters. Switch to edit mode to add content."
        className="empty-chapters"
      />
    );
  }

  return (
    <EmptyState
      title="Ready to create your first chapter?"
      description="Start building your interactive guide by adding your first chapter."
      className="empty-chapters"
    >
      <Button
        onClick={handleAddChapter}
        leftIcon={Add}
        size={Button.sizes.LARGE}
      >
        Add First Chapter
      </Button>
    </EmptyState>
  );
}
