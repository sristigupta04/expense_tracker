import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center font-sans">
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-600 max-w-md">
        Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <a 
        href="/" 
        className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md transition duration-200"
      >
        Go Back Home
      </a>
    </div>
  );
};

export default NotFoundPage;
