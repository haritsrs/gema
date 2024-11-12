import { useState, useCallback } from 'react';

export const useImageDimensions = () => {
  const [imageDimensions, setImageDimensions] = useState({});

  // Function to handle image loading and storing dimensions
  const handleImageLoad = useCallback((id, { naturalWidth, naturalHeight }) => {
    setImageDimensions((prevDimensions) => ({
      ...prevDimensions,
      [id]: {
        width: naturalWidth,
        height: naturalHeight,
      },
    }));
  }, []);

  return { imageDimensions, handleImageLoad };
};

