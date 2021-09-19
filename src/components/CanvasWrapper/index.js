import React from 'react'
import { useEffect, useState, useRef } from 'react';
import './index.css';

export const CanvasWrapper = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageReady, setImageReady] = useState(false);
  const [image, setImage] = useState(() => {return null;});  
  const [last, setLast] = useState({ x: 0, y:0 });  
  const [trackingInitialized, setTrackingInitialized] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1.1);
  const [points, setPoints] = useState([]);
  const [coordinateUpdated, setCoordinateUpdated] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [closest, setClosest] = useState(null);


  const [selectionColors,] = useState(["red", "blue", "green", "yellow"]);
  const [anchorMarkerColor,] = useState("rgba(255,255,255,0.01)");
  const [selectionRadius,] = useState(10);

  const canvasWrapper = useRef(null);

  const toImageDomain = (p, image, ibb) => {
    return {
      x: ((p.x - ibb.x) * image.width) / ibb.width,
      y: ((p.y - ibb.y) * image.height) / ibb.height,
    };
  };
  
  const fromImageDomain = (p, image, canvas) => {
    return {
      x: (p.x * canvas.width) / image.width,
      y: (p.y * canvas.height) / image.height,
    };
  };
  
  const translatePoint = (point, canvas) => {
    console.log(point);
    console.log(canvas);
    return {
      x: (point.x * image.width) / canvas.getBoundingClientRect().width,
      y: (point.y * image.height) / canvas.getBoundingClientRect().height,
    };
  };

  const colorToRgba = (color, alpha) => {
    const cvs = document.createElement("canvas");
    cvs.height = 1;
    cvs.width = 1;
    const ctx = cvs.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const x = [].concat(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3), alpha);
    const result = `rgba(${x.join()})`;
    return result;
  };

  const colorLuminance = (rgba, lum) => {
    let x = rgba.replace(/[^0-9,.]/gi, "").split(",");
    const alpha = x.pop();
    lum = lum || 0;

    x.forEach(function(c, index) {
      this[index] = Math.round(
        Math.min(Math.max(0, parseInt(c) * (1 + lum)), 255)
      ).toString();
    }, x);

    x.push(alpha);

    return `rgba(${x.join()})`;
  };

  const fixDpi = () => {    
    console.log('fixDpi Called');
    let context = canvasWrapper.current.getContext("2d");
    let canvas = canvasWrapper.current;
    
    if (!context) return;

    let cs = getComputedStyle(canvas);
    let width = parseInt(cs.getPropertyValue("width"), 10);
    let scale = window.devicePixelRatio;

    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(width * 0.75 * scale);
    myRenderFunc();
  };


  const getClosestPoint = (from) => {
    let minDist = 20;
    let closest = null;
    points.forEach(function(point, index) {
      const dist = Math.hypot(from.x - point.x, from.y - point.y);
      closest = dist < minDist ? index : closest;
      minDist = dist < minDist ? dist : minDist;
    });
    return closest;
  };

  const drawPoint = (p, color, radius = selectionRadius, crosshairs = false) => {
    const context = canvasWrapper.current.getContext("2d");
    if (!context) return;
    if (!p) return;

    context.save();
      context.beginPath();
      context.arc(p.x, p.y, radius, 0, 2 * Math.PI, false);
      context.fillStyle = colorToRgba(color, 0.33);
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = colorLuminance(
        colorToRgba(color, 0.33),
        -0.75
      );
      context.stroke();

      if (crosshairs) {
        context.beginPath();
        context.moveTo(p.x - radius, p.y);
        context.lineTo(p.x + radius, p.y);
        context.moveTo(p.x, p.y - radius);
        context.lineTo(p.x, p.y + radius);
        context.lineWidth = 1;
        context.strokeStyle = colorLuminance(
          colorToRgba(color, 0.75),
          0.5
        );
        context.stroke();
      }

      context.restore();

  };

  const drawPoints = () => {
    points.forEach((point, i) =>
      drawPoint(point, selectionColors[i], selectionRadius, true)
    );
  };

  const scaleToFit = (context, img) => {
    if (img === null) return;

    let canvas = context.canvas;
    var scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height
    );
    
    let bb = {
      x: canvas.width / 2 - (img.width / 2) * scale,
      y: canvas.height / 2 - (img.height / 2) * scale,
      width: img.width * scale,
      height: img.height * scale,
    };

    context.drawImage(img, bb.x, bb.y, bb.width, bb.height);
  };

  const redraw = () => {
    console.log("enter redraw");
    const context = canvasWrapper.current.getContext("2d");
    if(!imageReady){
      console.log("Image not ready");
      return;
    }
    if (!context){
      console.log("context is null");
      return;
    }

    const canvas = context.canvas;

    context.save();
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.restore();

    scaleToFit(context, image);
    console.log("exit redraw");
  };

  const findElementOffset = (e) => {
    var pos = { x: e.x, y: e.y };
    if (typeof e.offsetParent != "undefined") {
      for (pos = { x: 0, y: 0 }; e; e = e.offsetParent) {
        pos = { x: pos.x + e.offsetLeft, y: pos.y + e.offsetTop };
      }
    }
    return pos;
  };

  const zoom = (clicks) => {
    const ctx = canvasWrapper.current.getContext("2d");
    const canvas = ctx.canvas;

    var pt = ctx.transformedPoint(last.x, last.y);
    pt = { x: last.x, y: last.y };
    pt.x = (pt.x * canvas.width) / image.width;
    pt.y = (pt.y * canvas.height) / image.height;

    ctx.translate(pt.x, pt.y);
    var factor = Math.pow(scaleFactor, clicks);

    ctx.scale(factor, factor);
    ctx.translate(-pt.x, -pt.y);
  };

  const getPoint = (e) => {
    if (!e) e = window.event;

    const canvas = canvasWrapper.current;
    var pos = { x: 0, y: 0 };
    if (e.changedTouches) {
      pos = { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY };
    } else if (e.pageX || e.pageY) {
      pos = { x: e.pageX, y: e.pageY };
    } else if (e.clientX || e.clientY) {
      pos = {
        x:
          e.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft,
        y:
          e.clientY + document.scrollTop + document.documentElement.scrollTop,
      };
    }

    var topLeftCorner = findElementOffset(canvas);
    
    return translatePoint(
      {
        x: Math.max(pos.x - topLeftCorner.x, 0),
        y: Math.max(pos.y - topLeftCorner.y, 0),
      },
      canvas,
      image
    );
  };

  const mousedown = (evt) => {
    evt.preventDefault();
    if (zoomed) return;
    console.log("mousedown");

    const context = canvasWrapper.current.getContext("2d");
    const canvas = canvasWrapper.current;
    

    if(!imageReady){
      console.log("image not ready");
      return;
    }


    let tempLast = getPoint(evt);
    console.log("lastPoint: ", tempLast);
    setLast(tempLast);

    let pt = fromImageDomain(tempLast, image, canvas);
    let z = context.transformedPoint(pt.x, pt.y);

    context.save();

    zoom(8);
    setZoomed(true);
    redraw();

    const closest = getClosestPoint(z);
    let index = null;
    if (!(closest === null)) {
      index = closest;
    } else if (!(points.length === 4)) {
      index = points.length;
      points.push(z);
    }

    if (!(index === null)) {
      drawPoint(pt, selectionColors[index], 10, true);
      setClosest(index);
      setCoordinateUpdated(true);
    }
    setAnchor({ x: z.x, y: z.y });

    return;

  };

  const mousemove = (evt) => {
    evt.preventDefault();
    if (zoomed === false) return;
    console.log("mousemove zoom: " + zoomed);

  };

  const mouseup = (evt) => {
    evt.preventDefault();
    console.log("mouseup");

    if (!zoomed){
      console.log("not zoomed exiting");
      return;
    } 
    console.log("unzoom");
    zoom(-8);
    setZoomed(false);
    setAnchor(null);
    setClosest(null);
    setCoordinateUpdated(false);

    const context = canvasWrapper.current.getContext("2d");
    context.restore();

    redraw();
    drawPoints();

  };
  
  const trackTransforms = () => {
    console.log("enter track transform");
    const ctx = canvasWrapper.current.getContext("2d");   
    if (!ctx){
      console.log("context is null");
      return;
    }
    const canvas = ctx.canvas;

    let xmlns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(xmlns, "svg");
    var xform = svg.createSVGMatrix();

    ctx.getTransform = () => xform;

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function() {
      savedTransforms.push(xform.translate(0, 0));
      return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function() {
      xform = savedTransforms.pop();
      return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function(sx, sy) {
      xform = xform.scaleNonUniform(sx, sy);
      return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function(radians) {
      xform = xform.rotate((radians * 180) / Math.PI);
      return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function(dx, dy) {
      xform = xform.translate(dx, dy);
      return translate.call(ctx, dx, dy);
    };

    var transform = ctx.transform;
    ctx.transform = function(a, b, c, d, e, f) {
      var m2 = svg.createSVGMatrix();
      m2.a = a;
      m2.b = b;
      m2.c = c;
      m2.d = d;
      m2.e = e;
      m2.f = f;
      xform = xform.multiply(m2);
      return transform.call(ctx, a, b, c, d, e, f);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function(a, b, c, d, e, f) {
      xform.a = a;
      xform.b = b;
      xform.c = c;
      xform.d = d;
      xform.e = e;
      xform.f = f;
      return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var resetTransform = ctx.resetTransform;
    ctx.resetTransform = function() {
      xform.a = 1;
      xform.b = 0;
      xform.c = 0;
      xform.d = 1;
      xform.e = 0;
      xform.f = 0;
      return resetTransform.call(ctx);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function(x, y) {
      pt.x = x;
      pt.y = y;
      return pt.matrixTransform(xform.inverse());
    };
  };

  const removeEventListeners = () => {
    const canvas = canvasWrapper.current;
    canvas.removeEventListener("mousedown", mousedown, false);
    canvas.removeEventListener("mousemove", mousemove, false);
    canvas.removeEventListener("mouseup", mouseup, false);

  };

  const addEventListeners = () => {
    const canvas = canvasWrapper.current;
    canvas.addEventListener("mousedown", mousedown, false);
    canvas.addEventListener("mousemove", mousemove, false);
    canvas.addEventListener("mouseup", mouseup, false);

  };

  const setup = () => {
    console.log("enter setup");
    if(!imageUrl){
      console.log("loading image");
      let tempImage = new Image();
      tempImage.src = "http://localhost:5100/media/dice.png";
      tempImage.crossOrigin = "Anonymous";
      tempImage.onload = () => {
        console.log("ON Image Load");
        setImageReady(true);
      }
      setImageUrl("http://localhost:5100/media/dice.png");
      setImage(tempImage);
      return;
    }{
      console.log("image already initialized");
    }
    if (trackingInitialized)
    {
      console.log("tracking already initialized");
      return;
    }
    trackTransforms();
    const canvas = canvasWrapper.current;
    setLast({x: canvas.width / 2, y: canvas.height / 2 });


    setTrackingInitialized(true);
  };

  const myRenderFunc = () => {
    setup();
    redraw();

  };


  useEffect(() => {
    console.log("render");
    window.onresize = fixDpi;
    fixDpi();
    myRenderFunc();
    removeEventListeners();
    addEventListeners();
  }, []);

  useEffect(() => {
    removeEventListeners();
    addEventListeners();
    myRenderFunc();
  }, [zoomed, imageReady]);

  return (
    <div className="my-canvas-wrapper">
      <canvas ref={canvasWrapper} />
      <slot></slot>
    </div>
  )
};

export default CanvasWrapper;