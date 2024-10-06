import Image from "next/image";
import Head from "next/head";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faBell, faComment, faGlobe, faUserCircle, faHeart, faRetweet, faChartBar, faShare } from '@fortawesome/free-solid-svg-icons';
import { faComment as farComment } from '@fortawesome/free-regular-svg-icons';

export default function Home() {
  return (
    <>
      <Head>
        <title>GEMA</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
      </Head>
      <div className="flex min-h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <div className="w-16 bg-purple-700 h-screen flex flex-col items-center py-4 space-y-6">
          <FontAwesomeIcon icon={faHome} className="text-white text-2xl" />
          <FontAwesomeIcon icon={faSearch} className="text-white text-2xl" />
          <FontAwesomeIcon icon={faBell} className="text-white text-2xl" />
          <FontAwesomeIcon icon={faComment} className="text-white text-2xl" />
          <FontAwesomeIcon icon={faGlobe} className="text-white text-2xl" />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-gray-800 p-4 flex items-center justify-between">
            <div className="text-3xl font-bold">GEMA</div>
            <FontAwesomeIcon icon={faUserCircle} className="text-white text-3xl" />
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
                <FontAwesomeIcon icon={faShare} />
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
                <FontAwesomeIcon icon={faShare} />
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
                <FontAwesomeIcon icon={faShare} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
