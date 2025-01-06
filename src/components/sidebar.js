"use client";

import Link from 'next/link';
import "../app/globals.css";

const Sidebar = () => {
  return (
    <div className="flex justify-between pl-4 pr-4 text-white text-sm items-center md:flex-col md:pl-0 md:pr-0 md:p-4">
      <Link href="/" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg group">
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2" className="duoicon-secondary-layer" opacity={0.3}></path>
          <path fill="currentColor" d="M16.243 7.757c-.354-.353-4.95.707-6.364 2.122c-1.414 1.414-2.475 6.01-2.122 6.364c.354.353 4.95-.707 6.364-2.122c1.415-1.414 2.475-6.01 2.122-6.364" className="duoicon-primary-layer"></path>
        </svg>
          <span className="md:hidden m-1">Explore</span>
        </div>
      </Link>
      
      <Link href="/following" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg group">
        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
          <path fill="currentColor" fillRule="evenodd" d="M14.447 1.106a1 1 0 0 1 .447 1.341L14.118 4H18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.882l-.776-1.553a1 1 0 0 1 1.788-.894L12 3.763l1.106-2.21a1 1 0 0 1 1.341-.447" className="duoicon-secondary-layer" opacity={0.3}></path>
          <path fill="currentColor" fillRule="evenodd" d="M12 9c-1.54 0-2.502 1.667-1.732 3c.357.619 1.017 1 1.732 1c1.54 0 2.502-1.667 1.732-3A2 2 0 0 0 12 9m1.5 5h-3a2.5 2.5 0 0 0-2.495 2.336L8 16.5v.5a1 1 0 0 0 1.993.117L10 17v-.5a.5.5 0 0 1 .41-.492L10.5 16h3a.5.5 0 0 1 .492.41l.008.09v.5a1 1 0 0 0 1.993.117L16 17v-.5a2.5 2.5 0 0 0-2.336-2.495z" className="duoicon-primary-layer"></path>
        </svg>
          <span className="md:hidden m-1">Following</span>
        </div>
      </Link>

      <Link href="/search" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg group">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300">
            <path d="M20.313 11.157a9.157 9.157 0 1 1-18.313 0a9.157 9.157 0 0 1 18.313 0" opacity={0.5}></path>
            <path fill="white" fillRule="evenodd" d="M18.839 18.839a.723.723 0 0 1 1.022 0l1.928 1.927a.723.723 0 0 1-1.023 1.023L18.84 19.86a.723.723 0 0 1 0-1.022" clipRule="evenodd"></path>
          </svg>
          <span className="md:hidden m-1">Search</span>
        </div>
      </Link>
      
      <Link href="/notifications" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg group">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300">
            <path d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.8 25.8 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.4 4.4 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7" opacity={0.5}></path>
            <path d="M7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"></path>
          </svg>
          <span className="md:hidden m-1">Notifications</span>
        </div>
      </Link>
      
      <Link href="/profile" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg group">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300">
            <path d="M12 13c2.396 0 4.575.694 6.178 1.671c.8.49 1.484 1.065 1.978 1.69c.486.616.844 1.352.844 2.139c0 .845-.411 1.511-1.003 1.986c-.56.45-1.299.748-2.084.956c-1.578.417-3.684.558-5.913.558s-4.335-.14-5.913-.558c-.785-.208-1.524-.506-2.084-.956C3.41 20.01 3 19.345 3 18.5c0-.787.358-1.523.844-2.139c.494-.625 1.177-1.2 1.978-1.69C7.425 13.694 9.605 13 12 13" className="duoicon-primary-layer">
            </path>
            <path d="M12 2c3.849 0 6.255 4.167 4.33 7.5A5 5 0 0 1 12 12c-3.849 0-6.255-4.167-4.33-7.5A5 5 0 0 1 12 2" className="duoicon-secondary-layer flex" opacity={0.3}>
            </path>
          </svg>
          <span className="md:hidden m-1">
            Profile
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;