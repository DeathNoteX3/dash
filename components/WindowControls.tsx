
import React, { useState, useEffect } from 'react';

const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      const callback = (maximized: boolean) => setIsMaximized(maximized);
      window.electronAPI.onMaximizedStateChanged(callback);
    }
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeMaximizedStateListener();
      }
    };
  }, []);

  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  // Don't render controls if not in Electron
  if (!window.electronAPI) {
    return null;
  }

  return (
    <div className="flex items-center gap-0.5 non-draggable">
      <button onClick={handleMinimize} title="Minimizar" className="w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-yt-light-gray/80 rounded-sm transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 dark:text-yt-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </button>
      <button onClick={handleMaximize} title={isMaximized ? 'Restaurar' : 'Maximizar'} className="w-9 h-9 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-yt-light-gray/80 rounded-sm transition-colors">
        {isMaximized ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 dark:text-yt-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 8.25V4.5a.75.75 0 0 0-.75-.75h-8.25a.75.75 0 0 0-.75.75v8.25c0 .414.336.75.75.75h3.75m.75-3.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 dark:text-yt-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h13.5v13.5H5.25V5.25z" />
          </svg>
        )}
      </button>
      <button onClick={handleClose} title="Fechar" className="w-9 h-9 flex items-center justify-center bg-transparent hover:bg-red-500 dark:hover:bg-red-600 rounded-sm transition-colors group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800 dark:text-yt-text-primary group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default WindowControls;
