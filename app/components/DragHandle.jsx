import React from 'react';

const DragHandle = ({ attributes, listeners, isDragging, isLongPressed }) => {
  return (
    <div className="bg-gray-200 rounded-t-lg p-2 border-b border-gray-300 select-none">
      <div 
        className={`flex items-center justify-center py-3 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
          isDragging ? 'bg-blue-600 text-white' : isLongPressed ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
        {...attributes}
        {...listeners}
        style={{ touchAction: 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="mr-2 text-white">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
        </svg>
        <span className="font-medium text-white">DRAG TO REORDER</span>
      </div>
    </div>
  );
};

export default DragHandle;