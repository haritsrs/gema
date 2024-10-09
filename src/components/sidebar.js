"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBell, faComment, faGlobe, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
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
    <div className="w-16 h-screen bg-purple-800 text-white flex flex-col items-center py-4">
      <Link href="/" passHref>
        <FontAwesomeIcon icon={faHome} size="2x" className="mb-6" />
      </Link>
      <Link href="/search" passHref>
        <FontAwesomeIcon icon={faSearch} size="2x" className="mb-6" />
      </Link>
      <Link href="/notifications" passHref>
        <FontAwesomeIcon icon={faBell} size="2x" className="mb-6" />
      </Link>
      <Link href="/messages" passHref>
        <FontAwesomeIcon icon={faComment} size="2x" className="mb-6" />
      </Link>
      <Link href="/explore" passHref>
        <FontAwesomeIcon icon={faGlobe} size="2x" className="mb-6" />
      </Link>
    </div>
  );
};

export default Sidebar;
