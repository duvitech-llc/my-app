import React from 'react'
import { useEffect, useState, useRef } from 'react';
import context from 'react-bootstrap/esm/AccordionContext';
import './index.css';

export const CanvasWrapper = () => {
  const [provider, setProvider] = useState({ context: null });  
  const canvasWrapper = useRef(null);

  const fixDpi = () => {    
    console.log('fixDpi Called');
    let context = canvasWrapper.current.getContext("2d");
    let canvas = canvasWrapper.current;
    
    if (!context) return;

    let cs = getComputedStyle(canvas);
    let width = parseInt(cs.getPropertyValue("width"), 10);
    let scale = window.devicePixelRatio;


    setProvider({ width: Math.floor(width * scale) })
    setProvider({ height: Math.floor(width * 0.75 * scale) })

  };
  
  useEffect(() => {
    setProvider({ context: canvasWrapper.current.getContext("2d")});
    console.log(canvasWrapper);
    window.onresize = fixDpi;
    fixDpi();

  }, []);

  return (
    <div className="my-canvas-wrapper">
      <canvas ref={canvasWrapper} />
      <slot></slot>
    </div>
  )
};

export default CanvasWrapper;