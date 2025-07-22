// Zgodnie z wytycznymi README - eksportuje publiczny interfejs modułu

// Main component
export { LabelEditor } from './components/LabelEditor';

// Components
export { CanvasEditor } from './components/CanvasEditor';
export { CanvasProperties } from './components/CanvasProperties';

// Hooks
export { useEditorState } from './hooks/useEditorState';
export { useProjectLabels } from './hooks/useProjectLabels';
export { useToolHandlers } from './hooks/useToolHandlers';
export { useZoomControls } from './hooks/useZoomControls';
export { useLabelActions } from './hooks/useLabelActions';

// Types
export type { LabelDimensions, CanvasObject, EditorState, EditorPreferences } from './types/editor.types';

// Utils
export { generateUUID } from './utils/uuid';
export { snapCoordinatesToGrid, snapToGrid } from './utils/grid';
export { mmToPx, pxToMm } from './utils/dimensions';

// Constants
export {
  TOOL_TYPES,
  DEFAULT_DIMENSIONS,
  DEFAULT_OBJECT_PROPS,
  DEFAULT_GRID,
  ZOOM,
  KEYBOARD_SHORTCUTS,
  DEFAULT_POSITION
} from './constants';
