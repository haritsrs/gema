import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faHeart, faRetweet, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';
import localFont from "next/font/local";
import "./globals.css";

// Importing custom fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Defining metadata
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout() {
  return (
    <html lang="en">
      <head>
        <title>GEMA</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-900 antialiased mx-16`}
      >
        <div className="flex">
          <main className="flex-grow p-6">
            <div className="flex min-h-screen bg-gray-900 text-white">

              {/* Main Content */}
              <div className="flex-1">
                <div className="mx-4 bg-gray-800 p-4 flex items-center justify-between">
                <img src="/img/imgtest.jpg" alt="GEMA Logo" className="h-10" />
                  <FontAwesomeIcon icon={faUserCircle} className="text-white text-2xl w-16" />
                </div>
                <div className="p-4 space-y-4">
                  {/* Post 1 */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of Statman Dave" className="rounded-full"/>
                      <div>
                        <div className="font-bold">Statman Dave <span className="text-gray-500">@StatmanDave · 14h</span></div>
                        <div>Ruud van Nistelrooy has been booked in a Europa League game for the first time since 2010. 😉</div>
                      </div>
                    </div>
                    <img src="https://placehold.co/500x300" alt="Ruud van Nistelrooy in a football training outfit" className="mt-4 rounded-lg"/>
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>2</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>46</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>1.6K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>34K</span>
                      </div>
                    </div>
                  </div>

                  {/* Post 2 */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of Denita_fit" className="rounded-full"/>
                      <div>
                        <div className="font-bold">That mf is NOT real <span className="text-gray-500">@Denita_fit · 15h</span></div>
                        <div>So it finally happened. I asked someone "Hey, how are you?" as we normally do out of habit. They responded "not well actually"</div>
                        <div className="mt-2">I asked if they wanted to talk about it. They said "I think so" so I listened to a stranger, for 20 mins.</div>
                        <div className="mt-2">They gave me a big hug & thanked me after😊</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>293</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>4.4K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>105K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>942K</span>
                      </div>

                    </div>
                  </div>

                  {/* Post 3 */}
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <img src="https://placehold.co/40x40" alt="Profile picture of AbsoluteBruno" className="rounded-full"/>
                      <div>
                        <div className="font-bold">AB <span className="text-gray-500">@AbsoluteBruno · 13h</span></div>
                        <div>Give Onana his flowers btw, saved us from complete embarrassment today</div>
                      </div>
                    </div>
                    <img src="https://placehold.co/500x300" alt="Onana in a football match" className="mt-4 rounded-lg"/>
                    <div className="flex justify-between text-gray-500 mt-2">
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={farComment} />
                        <span>293</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faRetweet} />
                        <span>4.4K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faHeart} />
                        <span>105K</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FontAwesomeIcon icon={faChartBar} />
                        <span>942K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
