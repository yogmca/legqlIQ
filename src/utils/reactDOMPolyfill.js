// Polyfill for React 19 compatibility with react-quill
// react-quill uses findDOMNode which is removed in React 19
// This polyfill provides a workaround

import ReactDOM from 'react-dom';

// Add findDOMNode polyfill if it doesn't exist
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = function(component) {
    // For React 19, we need to use refs instead
    // This is a workaround for react-quill compatibility
    if (component === null) {
      return null;
    }
    
    // If it's a DOM element, return it
    if (component.nodeType === 1) {
      return component;
    }
    
    // If it has a ref with current, return that
    if (component._reactInternals && component._reactInternals.child) {
      const fiber = component._reactInternals.child;
      if (fiber && fiber.stateNode) {
        return fiber.stateNode;
      }
    }
    
    // Fallback: try to find the DOM node
    console.warn('findDOMNode polyfill: Unable to find DOM node, returning null');
    return null;
  };
}

export default ReactDOM;
