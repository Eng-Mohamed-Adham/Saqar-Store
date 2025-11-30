import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white/60 dark:bg-gray-900/80 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-black dark:border-white"></div>
    </div>
  );
};

export default LoadingOverlay;
