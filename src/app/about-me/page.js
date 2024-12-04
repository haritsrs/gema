import Image from "next/legacy/image";
import logo from '../../../public/img/logo.png';
import localFont from "next/font/local";

const inter = localFont({
  src: "../fonts/Inter-VariableFont_opsz,wght.ttf",
  variable: "--font-inter",
  weight: "100 900",
});

const AboutMe = () => {
  return (
    <div className={`${inter.variable} antialiased min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center`}>
      <div className="relative w-[1000px] h-[250px]"> 
        <Image src={logo} alt="Logo"  layout="fill" objectFit="contain"  />
      </div>
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