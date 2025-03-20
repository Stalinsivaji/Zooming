import React, { useState, useRef, useEffect, useCallback } from "react";
import "./ZoomableContainer.css";

const ZoomableContainer = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [scrollbars, setScrollbars] = useState({ showX: false, showY: false, sizeX: 100, sizeY: 100 });

  const updateScrollbars = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const showX = content.scrollWidth > container.clientWidth;
    const showY = content.scrollHeight > container.clientHeight;

    const sizeX = showX ? Math.max(100 / zoom, 20) : 100;
    const sizeY = showY ? Math.max(100 / zoom, 20) : 100;

    setScrollbars({ showX, showY, sizeX, sizeY });
  }, [zoom]);

  useEffect(() => {
    updateScrollbars();
  }, [zoom, updateScrollbars]); 

  const handleWheel = (e) => {
    e.preventDefault();
    const { offsetX, offsetY, deltaY } = e.nativeEvent;
    zoomImage(deltaY < 0 ? 1.1 : 0.9, offsetX, offsetY);
  };

  const zoomImage = (zoomFactor, offsetX = null, offsetY = null) => {
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 1), 5);
    const container = containerRef.current;
    if (!container) return;

    if (offsetX !== null && offsetY !== null) {
      const rect = container.getBoundingClientRect();
      const relX = (offsetX - rect.left) / container.clientWidth;
      const relY = (offsetY - rect.top) / container.clientHeight;
      setMousePos({ x: relX, y: relY });
    }

    setZoom(newZoom);
    updateScrollbars();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImageSrc(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="zoom-wrapper">
      <h2 className="zoom-title">Zoomable</h2>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="upload-button" />

      {imageSrc && (
        <>
          <div className="zoom-container" ref={containerRef} onWheel={handleWheel}>
            <div
              className="zoom-content"
              ref={contentRef}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: `${mousePos.x * 100}% ${mousePos.y * 100}%`,
              }}
            >
              <img src={imageSrc} alt="Uploaded" className="zoom-image" />
            </div>
            {scrollbars.showX && <div className="scrollbar horizontal" style={{ width: `${scrollbars.sizeX}%` }}></div>}
            {scrollbars.showY && <div className="scrollbar vertical" style={{ height: `${scrollbars.sizeY}%` }}></div>}
          </div>

          <div className="zoom-controls">
            <button onClick={() => zoomImage(1.1)}>+</button>
            <button onClick={() => zoomImage(0.9)}>-</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ZoomableContainer;
