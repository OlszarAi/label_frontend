import { useCallback } from 'react';
import { toast } from 'sonner';
import { EditorState, CanvasObject } from '../types/editor.types';
import { snapCoordinatesToGrid } from '../utils/grid';
import { DEFAULT_OBJECT_PROPS, DEFAULT_POSITION, TOOL_TYPES } from '../constants';
import { UserAsset } from '../../../services/userAsset.service';

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

  const handleAddImage = useCallback((asset: UserAsset) => {
    const coords = snapCoordinatesToGrid(
      DEFAULT_POSITION.X,
      DEFAULT_POSITION.Y, 
      state.preferences.grid.size, 
      state.preferences.grid.snapToGrid
    );

    // Calculate dimensions while maintaining aspect ratio
    let width = 20; // Default width in mm
    let height = 20; // Default height in mm

    if (asset.width && asset.height) {
      // Convert from pixels to mm (assuming 96 DPI)
      const mmPerPixel = 25.4 / 96;
      const assetWidthMm = asset.width * mmPerPixel;
      const assetHeightMm = asset.height * mmPerPixel;

      // Scale to fit within a reasonable size (max 50mm)
      const maxSize = 50;
      const scale = Math.min(maxSize / assetWidthMm, maxSize / assetHeightMm, 1);
      
      width = assetWidthMm * scale;
      height = assetHeightMm * scale;
    }

    addObject({
      type: 'image',
      x: coords.x,
      y: coords.y,
      width,
      height,
      imageUrl: asset.url,
      imageAssetId: asset.id,
      imageOriginalWidth: asset.width || undefined,
      imageOriginalHeight: asset.height || undefined,
    });
    setSelectedTool(TOOL_TYPES.SELECT);
    toast.success(`Added image: ${asset.name}`);
  }, [addObject, state.preferences.grid, setSelectedTool]);

  return {
    handleAddText,
    handleAddRectangle,
    handleAddCircle,
    handleAddQRCode,
    handleAddUUID,
    handleAddImage
  };
}; 