import React, { useState, useEffect } from 'react';
import { useOpenCv } from 'opencv-react'
import Button from 'react-bootstrap/Button';
import diceImg from '../../img/dice.png';
import './index.css';

var bSelected = -1;

function MyOpencvComponent() {
  const { cv } = useOpenCv()
  const [cornerList, setcornerList] = useState(
    [
     {x: 10, y: 10, r: 5, color: 'red'},
     {x: 290, y: 10, r: 5, color: 'yellow'},
     {x: 10, y: 140, r: 5, color: 'blue'},
     {x: 290, y: 140, r: 5, color: 'green'}
    ]
  );
  const [canCrop, setcanCrop] = useState(false);
  useEffect(() => {
    if (cv) {
          
    }

    
    return function cleanup() {
      console.log('cleanup');
    };
  }, [cv]);
  
  const mean = (array) => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += parseInt(array[i], 10);
    }
    return sum / array.length;
  };

  
  const collisionDetection = (point, circleList, radius) => {
    console.log("Collision Detection Entered");
    console.log(point);
    console.log(circleList);
    let i = 0;
    let retIndex = -1;

    // get bounding box
    for(i = 0; i < circleList.length; i ++){        
      let bb = {ix: (circleList[i].x - radius), iy:  (circleList[i].y - radius), ax: (circleList[i].x + radius), ay: (circleList[i].y + radius)};
      if( bb.ix <= point.x && point.x <= bb.ax && bb.iy <= point.y && point.y <= bb.ay ) {
        // Point is in bounding box
        console.log("Collision Detected");
        retIndex = i;
        break;
      }
    }
    // return index of collision detected
    return retIndex;
  }
  
  const drawCircle = (ctx, x, y, radius, fill, stroke, strokeWidth) => {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
    if (fill) {
      ctx.fillStyle = fill
      ctx.fill()
    }
    if (stroke) {
      ctx.lineWidth = strokeWidth
      ctx.strokeStyle = stroke
      ctx.stroke()
    }
  };

  
  const updateOverlay = (ctx, markerList) => {
    let i = 0;
    for(i = 0; i < cornerList.length; i++){
      drawCircle(ctx, markerList[i].x, markerList[i].y, markerList[i].r, markerList[i].color, markerList[i].color, 1);
    }
  };


  const handleMouseDown = (e) => {  
    var canvaOL = document.getElementById('cornerPlot');
    var rect = canvaOL.getBoundingClientRect();
    var xx = (e.clientX - rect.left) / (document.getElementById('cornerPlot').clientWidth / document.getElementById('cornerPlot').width);
    var yy = (e.clientY - rect.top) / (document.getElementById('cornerPlot').clientHeight / document.getElementById('cornerPlot').height);
    xx = Math.ceil(xx);
    yy = Math.ceil(yy);
    console.log("Mouse DOWN " + xx + "," + yy);

    let detect = collisionDetection({x: xx, y: yy}, cornerList, 10);
    console.log("Detect: " + detect);
    bSelected = detect;
  };

  const handleMouseUp = (e) => {
    var canvaOL = document.getElementById('cornerPlot');
    var rect = canvaOL.getBoundingClientRect();
    var xx = (e.clientX - rect.left) / (document.getElementById('cornerPlot').clientWidth / document.getElementById('cornerPlot').width);
    var yy = (e.clientY - rect.top) / (document.getElementById('cornerPlot').clientHeight / document.getElementById('cornerPlot').height);
    xx = Math.ceil(xx);
    yy = Math.ceil(yy);

    console.log("Mouse UP " + xx + "," + yy);
    bSelected = -1;
  };

  const handleMouseMove = (e) => {
    if(bSelected > -1)
    {
      var canvaOL = document.getElementById('cornerPlot');
      let ctxOverlay = document.getElementById('cornerPlot').getContext('2d');
      var rect = canvaOL.getBoundingClientRect();
 
      var xx = (e.clientX - rect.left) / (document.getElementById('cornerPlot').clientWidth / document.getElementById('cornerPlot').width);
      var yy = (e.clientY - rect.top) / (document.getElementById('cornerPlot').clientHeight / document.getElementById('cornerPlot').height);
      xx = Math.ceil(xx);
      yy = Math.ceil(yy);
      cornerList[bSelected].x = xx;
      cornerList[bSelected].y = yy;
      ctxOverlay.clearRect(0, 0, canvaOL.width, canvaOL.height);
      updateOverlay(ctxOverlay, cornerList);
      
      console.log("Mouse MOVE " + xx + "," + yy);
    }
  };

  const handleMouseOut = (e) => {
    bSelected = -1;
  };

  const handleLoadImageClick = () => {
    let img = document.getElementById('image1');
    let canvaOL = document.getElementById('cornerPlot');
    let canvas = document.getElementById('myCanvas');
    let canvas2 = document.getElementById('myCanvas2');
    let context = document.getElementById('myCanvas').getContext('2d');
    let context2 = document.getElementById('myCanvas2').getContext('2d');
    let ctxOverlay = document.getElementById('cornerPlot').getContext('2d');

    console.log('canvasOL: ' + canvaOL.width +', ' + canvaOL.height);
    console.log('canvas: ' + canvas.width +', ' + canvas.height);
    console.log('canvas2: ' + canvas2.width +', ' + canvas2.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    
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
    console.log('Image w: ' + img.width + ' h: ' + img.height);
    context.drawImage(img, bb.x, bb.y, bb.width, bb.height);
    setcornerList([
      {x: 10, y: 10, r: 5, color: 'red'},
      {x: 290, y: 10, r: 5, color: 'yellow'},
      {x: 10, y: 140, r: 5, color: 'blue'},
      {x: 290, y: 140, r: 5, color: 'green'}
     ]);
   
    ctxOverlay.clearRect(0, 0, canvaOL.width, canvaOL.height);
    console.log(cornerList);
    updateOverlay(ctxOverlay, cornerList);
    setcanCrop(true);
  }


  const handleCropClick = () => {
    if(!canCrop)
    {
      alert('Must load image first');
      return;
    }

    let keepin = 15; // property    
    let canvas = document.getElementById('myCanvas');
    let img = document.getElementById('image1');

    var scale = Math.min(
      img.width / canvas.width,
      img.height / canvas.height
    );

    console.log('Image w: ' + img.width + ' h: ' + img.height);
    let xy = [];
    xy.push(cornerList[0].x * scale);   // upper left x
    xy.push(cornerList[0].y * scale);   // upper left y
    xy.push(cornerList[1].x * scale);   // lower left x
    xy.push(cornerList[1].y * scale);   // lower left y
    xy.push(cornerList[2].x * scale);   // upper right x
    xy.push(cornerList[2].y * scale);   // upper right y
    xy.push(cornerList[3].x * scale);   // lower right x
    xy.push(cornerList[3].x * scale);   // lower right y
    

    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, xy);
    const UL_x = xy[0];
    const UL_y = xy[1];
    const UR_x = xy[2];
    const UR_y = xy[3];
    const BL_x = xy[4];
    const BL_y = xy[5];
    const BR_x = xy[6];
    const BR_y = xy[7];

    let dest_BL_x = mean([UL_x, BL_x]);
    let dest_UL_x = dest_BL_x;
    let dest_UL_y = mean([UL_y, UR_y]);
    let dest_UR_y = dest_UL_y;
    let dest_UR_x = mean([UR_x, BR_x]);
    let dest_BR_x = dest_UR_x;
    let dest_BR_y = mean([BL_y, BR_y]);
    let dest_BL_y = dest_BR_y;

    let dest = [
      dest_UL_x,
      dest_UL_y,
      dest_UR_x,
      dest_UR_y,
      dest_BL_x,
      dest_BL_y,
      dest_BR_x,
      dest_BR_y,
    ];

    let src = cv.imread('image1');
    let dst = new cv.Mat();
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, dest);
    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    let dsize = new cv.Size(src.cols, src.rows);
    let scalar = new cv.Scalar();
    
    const flags = cv.INTER_LINEAR;
    const borderMode = cv.BORDER_CONSTANT;
    cv.warpPerspective(src, dst, M, dsize, flags, borderMode, scalar);

    let top = Math.round(Math.min(dest[1], dest[3]) + 0.5) + keepin;
    let bottom = Math.round(Math.max(dest[5], dest[7]) + 0.5) - keepin;
    let left = Math.round(Math.min(dest[0], dest[4]) + 0.5) + keepin;
    let right = Math.round(Math.max(dest[2], dest[6]) + 0.5) - keepin;
    let boundingBox = new cv.Rect(left, top, right - left, bottom - top);

    let correctedImage = dst.roi(boundingBox);
    // need to resize to fit bounding box of canvas
    cv.imshow('myCanvas2', correctedImage);
  };

  return (
    <div>
      <p>OpenCv React test</p>
      
      <div className="wrapper">              
        <canvas id="cornerPlot" className="sxoverlaycanvas" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}></canvas>
        <canvas id="myCanvas" className="backcanvas"></canvas>
      </div>
      <div className="wrapper">              
        <canvas id='myCanvas2'  className="backcanvas"></canvas>
      </div>      
      
      <Button
        variant="primary"
        onClick={handleLoadImageClick}
      >
      Load
      </Button>
      <br />
      <Button
        variant="primary"
        onClick={handleCropClick}
      >
      Crop
      </Button>
      <img src={diceImg}  id="image1" hidden="hidden" alt="" />
    </div>
  );
}

export default MyOpencvComponent;