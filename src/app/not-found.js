import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-black">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
          404
        </h1>
        <h2 className="text-4xl text-white font-semibold mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Oops! The page you&apos;re looking for seems to have wandered off into the digital wilderness.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 transition-transform duration-300 inline-block"
        >
          Return to Home
        </Link>
        <div className="mt-8 text-gray-500 text-sm">
          Maybe our cosmic navigation system can help you find your way back
        </div>
      </div>
    </div>
  );
}