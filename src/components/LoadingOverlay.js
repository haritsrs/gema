const LoadingOverlay = ({ isLoading }) => {
  console.log('LoadingOverlay render:', isLoading); // Add this line
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          {/* Spinner animation */}
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-purple-500 border-gray-700 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-purple-400 border-r-purple-400 border-gray-800 animate-spin"></div>
        </div>
        <p className="text-white text-lg font-medium">Sedang Memuat...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;