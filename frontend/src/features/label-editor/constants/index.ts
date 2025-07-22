// Stałe dla label-editor zgodnie z wytycznymi README

// Tool types
export const TOOL_TYPES = {
  SELECT: 'select',
  TEXT: 'text',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  QRCODE: 'qrcode',
  UUID: 'uuid'
} as const;

// Default dimensions (in mm)
export const DEFAULT_DIMENSIONS = {
  WIDTH: 100,
  HEIGHT: 50
} as const;

// Default object properties
export const DEFAULT_OBJECT_PROPS = {
  TEXT: {
    fontSize: 12,
    fontFamily: 'Arial',
    fill: '#000000'
  },
  RECTANGLE: {
    width: 20,
    height: 10,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 1
  },
  CIRCLE: {
    width: 20,
    height: 20,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 1
  },
  QRCODE: {
    width: 20,
    height: 20,
    qrErrorCorrectionLevel: 'M' as const,
    fill: '#000000',
    stroke: '#ffffff'
  }
} as const;

// Grid settings
export const DEFAULT_GRID = {
  SIZE: 5,
  SHOW_GRID: true,
  SNAP_TO_GRID: true
} as const;

// Zoom settings
export const ZOOM = {
  MIN: 0.1,
  MAX: 5,
  STEP: 0.1,
  DEFAULT: 1
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SELECT_TOOL: 'v',
  TEXT_TOOL: 't',
  RECTANGLE_TOOL: 'r',
  CIRCLE_TOOL: 'c',
  QRCODE_TOOL: 'q',
  UUID_TOOL: 'u',
  SAVE: 'ctrl+s,cmd+s',
  ESCAPE: 'escape',
  DELETE: 'delete,backspace',
  RESET_VIEW: 'ctrl+0,cmd+0'
} as const;

// Default positions for new objects
export const DEFAULT_POSITION = {
  X: 10,
  Y: 10
} as const; 