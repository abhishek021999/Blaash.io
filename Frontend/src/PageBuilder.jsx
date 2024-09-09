import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import axios from 'axios';

// Draggable component
const Draggable = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="draggable"
    >
      {children}
    </div>
  );
};

// Droppable component 
const Droppable = ({ id, children }) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className="droppable">
      {children}
    </div>
  );
};


const renderElement = (type, index) => {
  switch (type) {
    case "Label":
      return <label key={index}>Enter Your Name:</label>;
    case "Input Box":
      return <input key={index} type="text" placeholder="Enter Name" />;
    case "Check Box":
      return (
        <div key={index}>
          <input type="checkbox" id="checkbox" />
          <label htmlFor="checkbox">Is Working?</label>
        </div>
      );
    case "Button":
      return <button key={index}>Save</button>;
    case "Table":
      return (
        <table key={index} border="1">
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Row 1 Data 1</td>
              <td>Row 1 Data 2</td>
            </tr>
          </tbody>
        </table>
      );
    default:
      return null;
  }
};

const PageBuilder = () => {
  const [layoutName, setLayoutName] = useState("");
  const [canvasItems, setCanvasItems] = useState([]);
  const [positions, setPositions] = useState([]); // Store the positions of dragged elements

  // Function to handle drag end event
  const handleDragEnd = (event) => {
    if (event.over) {
      setCanvasItems([...canvasItems, event.active.id]);
      setPositions([
        ...positions,
        { id: event.active.id, x: event.delta.x, y: event.delta.y },
      ]); // Capture the drag positions
    }
  };

  // Function to save layout to MongoDB 
  const saveLayout = async () => {
    try {
      await axios.post('http://localhost:5000/save-layout', {
        name: layoutName,
        items: canvasItems,
        positions: positions, // Save positions as well
      });
      alert("Layout saved successfully!");
    } catch (error) {
      console.error("Error saving layout: ", error);
    }
  };

  // Updated Function to load layout from MongoDB or any backend
  const loadLayout = async () => {
    try {
      const response = await axios.get('http://localhost:5000/load-layout', {
        params: { layoutName }, // Pass the layout name to load the specific layout
      });
      const { name, items, positions } = response.data;

      // Update the state with the loaded layout
      setLayoutName(name);
      setCanvasItems(items);
      setPositions(positions);

      alert("Layout loaded successfully!");
    } catch (error) {
      console.error("Error loading layout: ", error);
    }
  };

  // Function to publish the layout (open in a new tab)
  const publishLayout = () => {
    const newWindow = window.open();
    const html = canvasItems
      .map((item, index) => {
        const elementHTML = renderElement(item, index).props.children || renderElement(item, index).props.placeholder;
        return `<div style="position: absolute; top: ${positions[index]?.y}px; left: ${positions[index]?.x}px;">${elementHTML}</div>`;
      })
      .join('');
    newWindow.document.write(`<html><body>${html}</body></html>`);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="container">
        {/* Left Panel: Controls */}
        <div className="left-panel">
          <h2 className="text-red-500 mb-4">Controls to Drag n Drop</h2>
          <div className="space-y-4">
            <Draggable id="Label">Label</Draggable>
            <Draggable id="Input Box">Input Box</Draggable>
            <Draggable id="Check Box">Check Box</Draggable>
            <Draggable id="Button">Button</Draggable>
            <Draggable id="Table">Table</Draggable>
          </div>
        </div>

        {/* Right Panel: Canvas */}
        <div className="right-panel">
          <div className="header">
            <input
              type="text"
              placeholder="Enter Layout Name"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
            />
            <button className="button-blue" onClick={saveLayout}>
              Save Layout
            </button>
            <button className="button-gray" onClick={loadLayout}>
              Load Layout
            </button>
            <button className="button-green" onClick={publishLayout}>
              Publish
            </button>
          </div>

          {/* Canvas area where items are dropped */}
          <Droppable id="canvas">
            {canvasItems.map((item, index) => (
              <div
                key={index}
                className="dropped-item"
                style={{ position: 'absolute', top: positions[index]?.y, left: positions[index]?.x }}
              >
                {renderElement(item, index)}
              </div>
            ))}
          </Droppable>
        </div>
      </div>
    </DndContext>
  );
};

export default PageBuilder;
