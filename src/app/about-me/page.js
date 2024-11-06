import Image from 'next/image';
import logo from '../../../public/img/logo.png';
import localFont from "next/font/local";

const geistSans = localFont({
    src: "../fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
  });
  
  const geistMono = localFont({
    src: "../fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
  });

const AboutMe = () => {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center`}>
      <Image src={logo} alt="Logo" className="max-w-[600px] mb-12" />
      <h2 className="text-2xl font-bold text-white mb-4">Kelompok 4</h2>
      <ul className="text-gray-300 space-y-2">
        <li>Harits Raharjo Setiono</li>
        <li>Budi Yansah</li>
        <li>Juniper Yosua Setiawan</li>
        <li>Jazmine Razanna Zaen</li>
        <li>Aqil Basyar Suyuti</li>
        <li>Danny Akbar Ganafiawan</li>
      </ul>
    </div>
  );
};

export default AboutMe;