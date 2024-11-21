"use client";

import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import "../app/globals.css";

const Sidebar = () => {
  return (
    <div className="flex justify-between pl-4 pr-4 text-white text-sm items-center md:flex-col md:pl-0 md:pr-0 md:p-4">
      <Link href="/" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24"><path d="M13.106 22h-2.212c-3.447 0-5.17 0-6.345-1.012s-1.419-2.705-1.906-6.093l-.279-1.937c-.38-2.637-.57-3.956-.029-5.083s1.691-1.813 3.992-3.183l1.385-.825C9.8 2.622 10.846 2 12 2s2.199.622 4.288 1.867l1.385.825c2.3 1.37 3.451 2.056 3.992 3.183s.35 2.446-.03 5.083l-.278 1.937c-.487 3.388-.731 5.081-1.906 6.093S16.553 22 13.106 22" opacity={0.5}></path><path fill="white" d="M8.25 18a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75"></path></svg>
          <span className="md:hidden m-1">Home</span>
        </div>
      </Link>
      <Link href="/search" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24" className="flex"><path d="M20.313 11.157a9.157 9.157 0 1 1-18.313 0a9.157 9.157 0 0 1 18.313 0" opacity={0.5}></path><path fill="white" fillRule="evenodd" d="M18.839 18.839a.723.723 0 0 1 1.022 0l1.928 1.927a.723.723 0 0 1-1.023 1.023L18.84 19.86a.723.723 0 0 1 0-1.022" clipRule="evenodd"></path></svg>
          <span className="md:hidden m-1">Search</span>
        </div>
      </Link>
      <Link href="/notifications" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24">
            <path d="M18.75 9v.704c0 .845.24 1.671.692 2.374l1.108 1.723c1.011 1.574.239 3.713-1.52 4.21a25.8 25.8 0 0 1-14.06 0c-1.759-.497-2.531-2.636-1.52-4.21l1.108-1.723a4.4 4.4 0 0 0 .693-2.374V9c0-3.866 3.022-7 6.749-7s6.75 3.134 6.75 7" opacity={0.5}></path>
            <path d="M7.243 18.545a5.002 5.002 0 0 0 9.513 0c-3.145.59-6.367.59-9.513 0"></path>
          </svg>
          <span className="md:hidden m-1">Notifications</span>
        </div>
      </Link>
      <Link href="/profile" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24">
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
      <Link href="/settings" passHref>
        <div className="flex flex-col items-center justify-center mb-0 md:mb-6 fill-gray-400 active:text-purple-500 active:fill-purple-800 active:stroke-purple-800 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24"><path fillRule="evenodd" d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2 2 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.62 1.62 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.03 2.03 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361s-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a2 2 0 0 0-.399 1.479c.053.394.287.798.757 1.605s.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2 2 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a2 2 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361s.306-1.064.782-1.36c.324-.203.533-.364.682-.556a2 2 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605s-.704-1.21-1.022-1.453a2.03 2.03 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.62 1.62 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2 2 0 0 0-1.09-1.083" clipRule="evenodd" opacity="0.5" />
            <path d="M15.523 12c0 1.657-1.354 3-3.023 3s-3.023-1.343-3.023-3S10.83 9 12.5 9s3.023 1.343 3.023 3" /></svg>
          <span className="md:hidden m-1">
            Settings
          </span>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
