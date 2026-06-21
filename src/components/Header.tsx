import { ChevronDown } from 'lucide-react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';

import svhLogo from '../assets/svh_logo.png';

export default function Header() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (pathname !== '/') {
      window.scrollTo(0, 0);
    }
  }, [hash, pathname]);

  const navLinks = [
    { label: "HOME", path: "/", hasDropdown: false },
    { label: "ABOUT SVH", path: "/#process-flow", hasDropdown: false },
    { label: "GUIDELINES", path: "/guidelines", hasDropdown: true },
    { label: "PROBLEM STATEMENTS", path: "/problem-statements", hasDropdown: false },
    { label: "FAQS", path: "/faq", hasDropdown: false },
    { label: "CONTACT US", path: "/contact", hasDropdown: false },
  ];

  return (
    <header className="w-full bg-white relative z-50 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Main Event Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <img id="svhLogoPin" src={svhLogo} alt="SVH Logo" className="w-16 h-16 object-contain shadow-sm border border-gray-200" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#0f2942] tracking-tight leading-none uppercase font-inter">SMART VIT BHOPAL</span>
            <span className="text-xl font-black text-[#0f2942] tracking-tight leading-none uppercase font-inter">HACKATHON</span>
            <span className="text-base font-bold text-[#0f2942] mt-1">2026</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link, idx) => {
            const isHashLink = link.path.includes('#');
            if (isHashLink) {
              return (
                <a
                  key={idx}
                  href={link.path}
                  className="flex items-center gap-1 text-[13px] font-bold font-inter tracking-wide transition-colors text-[#0f2942]/80 hover:text-sih-orange"
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-[#0f2942]" />}
                </a>
              );
            }
            return (
              <NavLink
                key={idx}
                to={link.path}
                className={({ isActive }) => `flex items-center gap-1 text-[13px] font-bold font-inter tracking-wide transition-colors ${isActive ? 'text-[#0f2942]' : 'text-[#0f2942]/80 hover:text-sih-orange'}`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-[#0f2942]" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Right side: SVH logo and Register button */}
        <div className="flex items-center gap-3 ml-auto">
          <img src={svhLogo} alt="SVH Logo" className="w-12 h-12 object-contain shadow-sm border border-gray-200" />
          <Link to="/" className="text-sm font-black px-6 py-2.5 bg-[#ea580c] text-white rounded-md hover:bg-[#c2410c] transition-colors uppercase tracking-wider shadow-sm">
            Register Now
          </Link>
        </div>
      </div>
    </header>
  );
}
