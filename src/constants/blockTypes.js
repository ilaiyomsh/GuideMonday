/**
 * Content block types and their metadata
 */

export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  GIF: 'gif',
  LINK: 'link',
  FORM: 'form',
  CODE: 'code'
};

export const BLOCK_TYPE_NAMES = {
  [BLOCK_TYPES.TEXT]: 'טקסט',
  [BLOCK_TYPES.IMAGE]: 'תמונה',
  [BLOCK_TYPES.VIDEO]: 'וידאו',
  [BLOCK_TYPES.GIF]: 'GIF',
  [BLOCK_TYPES.LINK]: 'קישור',
  [BLOCK_TYPES.FORM]: 'טופס',
  [BLOCK_TYPES.CODE]: 'קוד'
};

export const BLOCK_TYPE_ICONS = {
  [BLOCK_TYPES.TEXT]: '📝',
  [BLOCK_TYPES.IMAGE]: '🖼️',
  [BLOCK_TYPES.VIDEO]: '🎥',
  [BLOCK_TYPES.GIF]: '🎬',
  [BLOCK_TYPES.LINK]: '🔗',
  [BLOCK_TYPES.FORM]: '📋',
  [BLOCK_TYPES.CODE]: '💻'
};

export const BLOCK_TYPE_PLACEHOLDERS = {
  [BLOCK_TYPES.TEXT]: 'לחץ על כפתור העריכה כדי להוסיף טקסט',
  [BLOCK_TYPES.IMAGE]: 'לחץ על כפתור העריכה כדי להוסיף תמונה',
  [BLOCK_TYPES.VIDEO]: 'לחץ על כפתור העריכה כדי להוסיף וידאו',
  [BLOCK_TYPES.GIF]: 'לחץ על כפתור העריכה כדי להוסיף GIF',
  [BLOCK_TYPES.LINK]: 'לחץ על כפתור העריכה כדי להוסיף קישור',
  [BLOCK_TYPES.FORM]: 'לחץ על כפתור העריכה כדי להוסיף טופס',
  [BLOCK_TYPES.CODE]: 'לחץ על כפתור העריכה כדי להוסיף קוד'
};

/**
 * Get block type name in Hebrew
 * @param {string} type - Block type
 * @returns {string} Hebrew name
 */
export const getBlockTypeName = (type) => {
  return BLOCK_TYPE_NAMES[type] || type;
};

/**
 * Get block type icon
 * @param {string} type - Block type
 * @returns {string} Icon emoji
 */
export const getBlockTypeIcon = (type) => {
  return BLOCK_TYPE_ICONS[type] || '❓';
};

/**
 * Get block type placeholder text
 * @param {string} type - Block type
 * @returns {string} Placeholder text
 */
export const getBlockTypePlaceholder = (type) => {
  return BLOCK_TYPE_PLACEHOLDERS[type] || 'בלוק לא ידוע';
};
