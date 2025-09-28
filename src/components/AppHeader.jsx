import React from 'react';
import { Button, TextField, Flex, Box, Heading, Toast } from '@vibe/core';
import { Search, Edit, Check } from '@vibe/icons';
import { useGuide } from '../context/GuideContext.jsx';

export default function AppHeader() {
  const { guideData, isEditMode, setIsEditMode, handleSave, hasChanges } = useGuide();
  const hasUnsavedChanges = hasChanges();

  return (
    <Box
      paddingY={16}
      borderBottom
      backgroundColor={Box.backgroundColors.PRIMARY_BACKGROUND_COLOR}
      style={{ position: 'sticky', top: 0, zIndex: 10, direction: 'rtl' }}
    >
      <Flex
        justify={Flex.justify.SPACE_BETWEEN}
        align={Flex.align.CENTER}
      >
        <Flex gap={16} align={Flex.align.CENTER}>
          <TextField
            placeholder="Search in guide..."
            iconName={Search}
            size={TextField.sizes.MEDIUM}
            style={{ minWidth: '300px' }}
          />
        </Flex>

        <Flex gap={16} align={Flex.align.CENTER}>
          <Button
            kind={Button.kinds.TERTIARY}
            leftIcon={Edit}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'View Mode' : 'Edit Guide'}
          </Button>
          {isEditMode && (
            <Button 
              leftIcon={Check}
              onClick={handleSave} 
              disabled={!hasUnsavedChanges}
              color={hasUnsavedChanges ? Button.colors.PRIMARY : undefined}
            >
              Save Changes
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}