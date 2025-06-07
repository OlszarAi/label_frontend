import { EditorConfig, ToolbarButton, EditorTool } from '../types/editor.types';

export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
  canvasSize: {
    width: 800,
    height: 600,
  },
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
  backgroundColor: '#ffffff',
};

export const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    id: EditorTool.SELECT,
    label: 'Wybierz',
    icon: 'mouse-pointer-2',
  },
  {
    id: EditorTool.TEXT,
    label: 'Tekst',
    icon: 'type',
  },
  {
    id: EditorTool.RECTANGLE,
    label: 'Prostokąt',
    icon: 'square',
  },
  {
    id: EditorTool.CIRCLE,
    label: 'Koło',
    icon: 'circle',
  },
  {
    id: EditorTool.LINE,
    label: 'Linia',
    icon: 'minus',
  },
];

export const ZOOM_LEVELS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2 },
];
