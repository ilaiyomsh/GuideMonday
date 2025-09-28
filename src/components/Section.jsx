import React, { useState } from 'react';
import { useGuide } from '../context/GuideContext.jsx';
import ContentBlock from './ContentBlock';
import EditForm from './EditForm';
import { Button, Flex, Box, IconButton } from '@vibe/core';
import { Edit, Delete, MoveArrowUp, MoveArrowDown, Add } from '@vibe/icons';

export default function Section({ chapterId, section, sectionIndex, totalSections }) {
  const {
    isEditMode,
    handleUpdateSection,
    handleDeleteSection,
    handleReorderSection,
    handleAddContentBlock
  } = useGuide();
  
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative' }}
    >
      <Flex direction={Flex.directions.COLUMN} gap={16}>
        {/* Contextual Edit Controls */}
        {isEditMode && isHovered && !isEditing && (
          <Box
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              zIndex: 5,
              background: 'white',
              borderRadius: 'var(--border-radius-small)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '4px'
            }}
          >
            <Flex gap={4}>
              <IconButton
                icon={Edit}
                size={IconButton.sizes.SMALL}
                onClick={() => setIsEditing(true)}
                ariaLabel="Edit section"
              />
              <IconButton
                icon={Delete}
                size={IconButton.sizes.SMALL}
                onClick={() => handleDeleteSection(chapterId, section.id)}
                ariaLabel="Delete section"
                color={IconButton.colors.NEGATIVE}
              />
              <IconButton
                icon={MoveArrowUp}
                size={IconButton.sizes.SMALL}
                onClick={() => handleReorderSection(chapterId, sectionIndex, 'up')}
                disabled={sectionIndex === 0}
                ariaLabel="Move section up"
              />
              <IconButton
                icon={MoveArrowDown}
                size={IconButton.sizes.SMALL}
                onClick={() => handleReorderSection(chapterId, sectionIndex, 'down')}
                disabled={sectionIndex === totalSections - 1}
                ariaLabel="Move section down"
              />
            </Flex>
          </Box>
        )}

        {isEditMode && isEditing ? (
          <EditForm
            data={{ title: section.title, content: section.content }}
            type="section"
            onSave={(newData) => {
              handleUpdateSection(chapterId, section.id, newData);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p>{section.content}</p>
        )}

      <div>
        {section.contentBlocks.map((block, index) => (
          <ContentBlock
            key={block.id}
            chapterId={chapterId}
            sectionId={section.id}
            block={block}
            blockIndex={index}
            totalBlocks={section.contentBlocks.length}
          />
        ))}
      </div>

        {isEditMode && (
          <Box 
            paddingTop={16}
            borderTop
          >
            <Flex gap={8}>
              <Button 
                onClick={() => handleAddContentBlock(chapterId, section.id, 'text')} 
                size={Button.sizes.SMALL}
                leftIcon={Add}
              >
                Add Block
              </Button>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
}