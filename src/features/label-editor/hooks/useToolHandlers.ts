import { useCallback } from 'react';
import { toast } from 'sonner';
import { EditorState, CanvasObject } from '../types/editor.types';
import { snapCoordinatesToGrid } from '../utils/grid';
import { DEFAULT_OBJECT_PROPS, DEFAULT_POSITION, TOOL_TYPES } from '../constants';

interface UseToolHandlersProps {
  state: EditorState;
  addObject: (object: Omit<CanvasObject, 'id'>) => void;
  setSelectedTool: (tool: string) => void;
}

export const useToolHandlers = ({
  state,
  addObject,
  setSelectedTool
}: UseToolHandlersProps) => {
  
  const handleAddText = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'text',
      x: coords.x,
      y: coords.y,
      text: 'New Text',
      ...DEFAULT_OBJECT_PROPS.TEXT,
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success('Text element added');
  }, [addObject, state.preferences.grid, setSelectedTool]);

  const handleAddRectangle = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'rectangle',
      x: coords.x,
      y: coords.y,
      ...DEFAULT_OBJECT_PROPS.RECTANGLE,
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success('Rectangle added');
  }, [addObject, state.preferences.grid, setSelectedTool]);

  const handleAddCircle = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'circle',
      x: coords.x,
      y: coords.y,
      ...DEFAULT_OBJECT_PROPS.CIRCLE,
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success('Circle added');
  }, [addObject, state.preferences.grid, setSelectedTool]);

  const handleAddQRCode = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'qrcode',
      x: coords.x,
      y: coords.y,
      ...DEFAULT_OBJECT_PROPS.QRCODE,
      // sharedUUID will be set automatically in addObject
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success('QR Code added');
  }, [addObject, state.preferences.grid, setSelectedTool]);

  const handleAddUUID = useCallback(() => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );
    addObject({
      type: 'uuid',
      x: coords.x,
      y: coords.y,
      ...DEFAULT_OBJECT_PROPS.TEXT,
      // text and sharedUUID will be set automatically in addObject
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success('UUID added');
  }, [addObject, state.preferences.grid, setSelectedTool]);

  return {
    handleAddText,
    handleAddRectangle,
    handleAddCircle,
    handleAddQRCode,
    handleAddUUID
  };
}; 