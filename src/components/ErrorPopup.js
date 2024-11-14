import React, { useEffect } from 'react';

const ErrorPopup = ({ errorMessage, setErrorMessage }) => {
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, setErrorMessage]);

  if (!errorMessage) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
      <p>{errorMessage}</p>
      <button
        onClick={() => setErrorMessage('')}
        className="mt-2 text-sm text-red-200 hover:text-red-100"
      >
        Close
      </button>
    </div>
  );
};

export default ErrorPopup;

