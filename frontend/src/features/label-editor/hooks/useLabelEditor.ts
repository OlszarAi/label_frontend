'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { EditorState, EditorTool, CanvasSize } from '../types/editor.types';
import { DEFAULT_EDITOR_CONFIG } from '../constants/editor.constants';

export const useLabelEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  const [editorState, setEditorState] = useState<EditorState>({
    zoom: 1,
    canvas: null,
    activeObject: null,
    selectedTool: EditorTool.SELECT,
  });

  const initializeCanvas = useCallback((canvasElement: HTMLCanvasElement) => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas(canvasElement, {
      width: DEFAULT_EDITOR_CONFIG.canvasSize.width,
      height: DEFAULT_EDITOR_CONFIG.canvasSize.height,
      backgroundColor: DEFAULT_EDITOR_CONFIG.backgroundColor,
    });

    // Disable Fabric.js wheel zoom since we'll handle viewport zoom
    canvas.on('mouse:wheel', (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Obsługa selekcji obiektów
    canvas.on('selection:created', (e: any) => {
      setEditorState(prev => ({ ...prev, activeObject: e.selected?.[0] || null }));
    });

    canvas.on('selection:updated', (e: any) => {
      setEditorState(prev => ({ ...prev, activeObject: e.selected?.[0] || null }));
    });

    canvas.on('selection:cleared', () => {
      setEditorState(prev => ({ ...prev, activeObject: null }));
    });

    fabricCanvasRef.current = canvas;
    canvasRef.current = canvasElement;
    
    setEditorState(prev => ({ ...prev, canvas }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setEditorState(prev => ({ ...prev, zoom }));
  }, []);

  const selectTool = useCallback((tool: EditorTool) => {
    setEditorState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  const addText = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const text = new fabric.IText('Dodaj nagłówek', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#000000',
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  }, []);

  const addRectangle = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: '#000000',
      stroke: '#666666',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  }, []);

  const addCircle = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: '#000000',
      stroke: '#666666',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
    fabricCanvasRef.current.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current || !editorState.activeObject) return;
    
    fabricCanvasRef.current.remove(editorState.activeObject);
    fabricCanvasRef.current.renderAll();
  }, [editorState.activeObject]);

  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = DEFAULT_EDITOR_CONFIG.backgroundColor;
    fabricCanvasRef.current.renderAll();
  }, []);

  // Cleanup na unmount
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  return {
    editorState,
    initializeCanvas,
    setZoom,
    selectTool,
    addText,
    addRectangle,
    addCircle,
    deleteSelected,
    clearCanvas,
  };
};
