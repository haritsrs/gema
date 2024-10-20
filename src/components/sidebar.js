"use client";

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import "../app/globals.css";

// Defining metadata
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const Sidebar = () => {
  return (
    <div className= "flex justify-between pl-4 pr-4 text-white text-sm items-center md:flex-col md:pl-0 md:pr-0 md:p-4">
      <Link href="/" passHref>
        <div className="flex flex-col md:flex-col-0 items-center justify-center mb-0 rounded-lg md:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M13.106 22h-2.212c-3.447 0-5.17 0-6.345-1.012s-1.419-2.705-1.906-6.093l-.279-1.937c-.38-2.637-.57-3.956-.029-5.083s1.691-1.813 3.992-3.183l1.385-.825C9.8 2.622 10.846 2 12 2s2.199.622 4.288 1.867l1.385.825c2.3 1.37 3.451 2.056 3.992 3.183s.35 2.446-.03 5.083l-.278 1.937c-.487 3.388-.731 5.081-1.906 6.093S16.553 22 13.106 22" opacity={0.5}></path><path fill="white" d="M8.25 18a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75"></path></svg> 
          <span className="md:hidden">Home</span>
        </div>
      </Link>
      <Link href="/search" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24" className="flex"><path fill="white" d="M20.313 11.157a9.157 9.157 0 1 1-18.313 0a9.157 9.157 0 0 1 18.313 0" opacity={0.5}></path><path fill="white" fillRule="evenodd" d="M18.839 18.839a.723.723 0 0 1 1.022 0l1.928 1.927a.723.723 0 0 1-1.023 1.023L18.84 19.86a.723.723 0 0 1 0-1.022" clipRule="evenodd"></path></svg>
          <span className="md:hidden">Search</span>
        </div>
      </Link>
      <Link href="/explore" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2" className="duoicon-secondary-layer" opacity={0.3}></path><path fill="white" d="M16.243 7.757c-.354-.353-4.95.707-6.364 2.122c-1.414 1.414-2.475 6.01-2.122 6.364c.354.353 4.95-.707 6.364-2.122c1.415-1.414 2.475-6.01 2.122-6.364" className="duoicon-primary-layer"></path></svg>
          <span className="md:hidden">Explore</span>
        </div>
      </Link>
      <Link href="/messages" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="white" fillRule="evenodd" d="M2 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7.333L4 21.5c-.824.618-2 .03-2-1z" className="duoicon-secondary-layer" opacity={0.3}></path><path fill="white" fillRule="evenodd" d="M8 12a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2zM7 9a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1" className="duoicon-primary-layer"></path></svg>
          <span className="md:hidden text-center">Message</span>
        </div>
      </Link>
      <Link href="/profile" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 hover:bg-gray-950 hover:rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
            <path fill="white" d="M12 13c2.396 0 4.575.694 6.178 1.671c.8.49 1.484 1.065 1.978 1.69c.486.616.844 1.352.844 2.139c0 .845-.411 1.511-1.003 1.986c-.56.45-1.299.748-2.084.956c-1.578.417-3.684.558-5.913.558s-4.335-.14-5.913-.558c-.785-.208-1.524-.506-2.084-.956C3.41 20.01 3 19.345 3 18.5c0-.787.358-1.523.844-2.139c.494-.625 1.177-1.2 1.978-1.69C7.425 13.694 9.605 13 12 13" className="duoicon-primary-layer">
            </path>
            <path fill="white" d="M12 2c3.849 0 6.255 4.167 4.33 7.5A5 5 0 0 1 12 12c-3.849 0-6.255-4.167-4.33-7.5A5 5 0 0 1 12 2" className="duoicon-secondary-layer flex" opacity={0.3}>
            </path>
          </svg>
          <span className="md:hidden text-center">
            Profile
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
