import React from 'react';
import { Button, Flex, Box, Divider, Toast } from '@vibe/core';
import { Check, Undo, Redo, Show } from '@vibe/icons';
import { useGuide } from '../context/GuideContext.jsx';

export default function EditToolbar() {
  const { isEditMode, setIsEditMode, handleSave, hasChanges } = useGuide();
  const hasUnsavedChanges = hasChanges();
  const canUndo = false; // TODO: Implement undo/redo logic
  const canRedo = false;

  const handleSaveWithToast = async () => {
    try {
      await handleSave();
      Toast.show({
        message: 'Changes saved successfully!',
        type: Toast.types.POSITIVE,
        autoHideDuration: 3000
      });
    } catch (error) {
      Toast.show({
        message: 'Failed to save changes. Please try again.',
        type: Toast.types.NEGATIVE,
        autoHideDuration: 5000
      });
    }
  };

  const handlePreview = () => {
    setIsEditMode(false);
    Toast.show({
      message: 'Switched to preview mode',
      type: Toast.types.NEUTRAL,
      autoHideDuration: 2000
    });
  };

  if (!isEditMode) return null;

  return (
    <Box
      backgroundColor={Box.backgroundColors.SECONDARY_BACKGROUND_COLOR}
      borderBottom
      paddingX={24}
      paddingY={8}
      style={{
        position: 'sticky',
        top: '64px',
        zIndex: 9,
        direction: 'rtl'
      }}
    >
      <Flex justify={Flex.justify.SPACE_BETWEEN} align={Flex.align.CENTER}>
        <Flex gap={8} align={Flex.align.CENTER}>
          <Button
            kind={Button.kinds.TERTIARY}
            size={Button.sizes.SMALL}
            leftIcon={Check}
            onClick={handleSaveWithToast}
            disabled={!hasUnsavedChanges}
            color={hasUnsavedChanges ? Button.colors.PRIMARY : undefined}
          >
            Save
          </Button>
          
          <Divider direction={Divider.directions.VERTICAL} />
          
          <Button
            kind={Button.kinds.TERTIARY}
            size={Button.sizes.SMALL}
            leftIcon={Undo}
            onClick={() => {}} // TODO: Implement undo
            disabled={!canUndo}
          >
            Undo
          </Button>
          
          <Button
            kind={Button.kinds.TERTIARY}
            size={Button.sizes.SMALL}
            leftIcon={Redo}
            onClick={() => {}} // TODO: Implement redo
            disabled={!canRedo}
          >
            Redo
          </Button>
        </Flex>

        <Flex gap={8} align={Flex.align.CENTER}>
          <Button
            kind={Button.kinds.SECONDARY}
            size={Button.sizes.SMALL}
            leftIcon={Show}
            onClick={handlePreview}
          >
            Preview
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
