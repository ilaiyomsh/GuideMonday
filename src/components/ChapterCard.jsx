import React from 'react';
import { Box, Flex, Accordion, AccordionItem, Heading, EditableHeading, EditableText } from '@vibe/core';
import Section from './Section';
import { useGuide } from '../context/GuideContext.jsx';

export default function ChapterCard({ chapter, refProp }) {
  const { isEditMode, handleUpdateChapter } = useGuide();

  return (
    <div id={`chapter-card-${chapter.id}`} ref={refProp} className="chapter-card">
      <Box
        border
        shadow
        padding={24}
        rounded
        backgroundColor={Box.backgroundColors.PRIMARY_BACKGROUND_COLOR}
      >
        <Flex direction={Flex.directions.COLUMN} gap={16}>
          <Box 
            paddingBottom={16}
            borderBottom
          >
            {isEditMode ? (
              <EditableHeading
                type="h3"
                weight="medium"
                value={chapter.title}
                onFinishEditing={(value) => handleUpdateChapter(chapter.id, { title: value })}
                placeholder="Enter chapter title..."
                ariaLabel="Edit chapter title"
              />
            ) : (
              <Heading type={Heading.types.H3} value={chapter.title} />
            )}
          </Box>
          
          {isEditMode ? (
            <EditableText
              type="text1"
              multiline
              value={chapter.content}
              onFinishEditing={(value) => handleUpdateChapter(chapter.id, { content: value })}
              placeholder="Enter chapter description..."
              ariaLabel="Edit chapter content"
            />
          ) : (
            <p>{chapter.content}</p>
          )}

          <Accordion>
            {chapter.sections.map((section, index) => (
              <AccordionItem key={section.id} title={section.title}>
                <Section
                  chapterId={chapter.id}
                  section={section}
                  sectionIndex={index}
                  totalSections={chapter.sections.length}
                />
              </AccordionItem>
            ))}
          </Accordion>
        </Flex>
      </Box>
    </div>
  );
}