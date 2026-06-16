import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';
import { address, email, gym_first_name, gym_full_name, instagram_link, phone_number, whatsapp_number } from '../constants/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-deep-black border-t border-gold/10 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <Link to="/" onClick={handleScrollToTop} className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-premium-yellow to-gold p-2 rounded-lg text-deep-black">
                <Dumbbell className="h-6 w-6" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-gold-gradient">
                {gym_first_name}<span className="text-white font-sans text-sm font-normal tracking-widest ml-1 uppercase">{gym_full_name}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              {gym_full_name} offers a premium, modern fitness facility designed to unleash your ultimate physical potential. Work with elite trainers and access high-end amenities.
            </p>
            <div className="flex space-x-4">
              <a href={instagram_link} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors p-2 glass rounded-full hover:scale-110 duration-300 flex items-center justify-center" aria-label="Instagram">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors p-2 glass rounded-full hover:scale-110 duration-300 flex items-center justify-center" aria-label="Facebook">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg>
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gold transition-colors p-2 glass rounded-full hover:scale-110 duration-300 flex items-center justify-center" aria-label="Youtube">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg tracking-wider mb-6 relative inline-block">
              QUICK LINKS
              <span className="absolute bottom-[-6px] left-0 w-12 h-1 bg-gold rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#hero" className="hover:text-gold transition-colors text-sm">Home</a>
              </li>
              <li>
                <a href="#about" className="hover:text-gold transition-colors text-sm">About Gym</a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-gold transition-colors text-sm">Facilities</a>
              </li>
              <li>
                <a href="#trainers" className="hover:text-gold transition-colors text-sm">Elite Trainers</a>
              </li>
              <li>
                <a href="#plans" className="hover:text-gold transition-colors text-sm">Membership Plans</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-bold text-lg tracking-wider mb-6 relative inline-block">
              CONTACT US
              <span className="absolute bottom-[-6px] left-0 w-12 h-1 bg-gold rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm">
                  {address}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold" />
                <span className="text-sm">{phone_number}</span>
              </li>
              <li className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-gold" />
                <span className="text-sm">{whatsapp_number} (WhatsApp)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold" />
                <span className="text-sm">{email}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-bold text-lg tracking-wider mb-6 relative inline-block">
              OPENING HOURS
              <span className="absolute bottom-[-6px] left-0 w-12 h-1 bg-gold rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Monday - Friday</span>
                <span className="text-white font-medium">05:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Saturday</span>
                <span className="text-white font-medium">06:00 AM - 08:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Sunday</span>
                <span className="text-gold font-medium">Closed</span>
              </li>
              <li className="pt-2 text-xs text-gold/80 italic">
                * Morning & Evening training sessions scheduled daily.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/10 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {currentYear} {gym_first_name} Gym. All rights reserved. Designed for Premium Fitness.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#refund" className="hover:text-gold transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
