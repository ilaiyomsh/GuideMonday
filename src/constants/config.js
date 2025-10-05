/**
 * Application configuration constants
 */

// Text direction for Hebrew
export const TEXT_DIRECTION = 'rtl';

// Monday.com board and column IDs for file uploads
export const MONDAY_CONFIG = {
  BOARD_ID: '9265392875',
  FILE_COLUMN_ID: 'file_mkw7h32e'
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  ACCEPTED_GIF_TYPES: ['image/gif']
};

// Storage configuration
export const STORAGE_KEYS = {
  GUIDE_DATA: 'guideData',
  // Media Board Storage Keys
  MEDIA_BOARD_ID: 'media_board',
  MEDIA_BOARD_URL: 'media_board_url',
  MEDIA_BOARD_NAME_COL: 'media_board_name',
  MEDIA_BOARD_FILE_COL: 'media_board_file',
  MEDIA_BOARD_GUIDE_COL: 'media_board_guide',
  MEDIA_BOARD_CHAPTER_COL: 'media_board_chapter',
  MEDIA_BOARD_SECTION_COL: 'media_board_section',
  MEDIA_BOARD_DATE_COL: 'media_board_date'
};

// API configuration
export const API_CONFIG = {
  VERSION: '2025-07',
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 500
};

// Media Board configuration
export const MEDIA_BOARD_CONFIG = {
  BOARD_NAME: 'Guide Media Storage',
  BOARD_KIND: 'public', // main board
  COLUMNS: [
    { title: 'מדריך', type: 'dropdown', id: 'guide' },
    { title: 'פרק', type: 'dropdown', id: 'chapter' },
    { title: 'סעיף', type: 'dropdown', id: 'section' },
    { title: 'תאריך יצירה', type: 'date', id: 'date' },
    { title: 'קובץ', type: 'file', id: 'file' }
  ]
};
