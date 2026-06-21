import { Linkedin, Instagram, Youtube, Twitter, Mail, MapPin } from 'lucide-react';
import svhLogo from '../assets/svh_logo.png';
import bcLogo from '../assets/Blockchain Club Logo (Circle).png';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#0a1b3f] text-white pt-16 pb-8 relative z-50">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-20">
          {/* Left Column: Follow Us */}
          <div className="flex-1">
            <h3 className="text-lg font-black font-inter mb-6 tracking-wide uppercase">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a href="https://linkedin.com/company/blockchain-club-vitb" target="_blank" rel="noopener noreferrer" className="hover:text-sih-orange transition-colors bg-white/10 p-2 rounded-full">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/blockchain.vitb" target="_blank" rel="noopener noreferrer" className="hover:text-sih-orange transition-colors bg-white/10 p-2 rounded-full">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@blockchainclubvitb" target="_blank" rel="noopener noreferrer" className="hover:text-sih-orange transition-colors bg-white/10 p-2 rounded-full">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://x.com/blockchainvitb" target="_blank" rel="noopener noreferrer" className="hover:text-sih-orange transition-colors bg-white/10 p-2 rounded-full">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-xs mt-8 opacity-60">&copy; {currentYear} Blockchain Club, VIT Bhopal. Inspired by the Smart India Hackathon (SIH) framework.</p>
          </div>
          {/* Right Column: Contact Us */}
          <div className="flex-1">
            <h3 className="text-lg font-black font-inter mb-6 tracking-wide uppercase">Contact Us</h3>
            <div className="flex flex-col gap-4 text-sm opacity-90">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-sih-orange shrink-0" />
                <span className="text-justify">Location: India</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sih-orange shrink-0" />
                <a href="mailto:blockchainclub@vitbhopal.ac.in" className="hover:text-sih-orange transition-colors text-justify">
                  blockchainclub@vitbhopal.ac.in
                </a>
              </div>
            </div>
          </div>
          {/* Branded Info Card */}
          <div className="hidden lg:block">
            <h4 className="text-xs font-black font-inter text-sih-orange uppercase tracking-wider mb-2">SMART VIT HACKATHON 2026</h4>
            <p className="text-[11px] text-gray-300 leading-relaxed text-justify">
              Organized by Blockchain Club, VIT Bhopal. Empowering student innovators with a realistic, high-pressure hackathon simulation to prep for national challenges.
            </p>
          </div>
          {/* Logos Row */}
          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <img src={svhLogo} alt="SVH Logo" className="h-10 w-10 object-contain" />
            <img src={bcLogo} alt="Blockchain Club Logo" className="h-10 w-10 rounded-full object-cover" />
          </div>
        </div>
      </div>
    </footer>
  );
}
