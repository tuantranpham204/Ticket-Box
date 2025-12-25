import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/5 bg-gray-950 pt-20 pb-12">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-600/5 blur-[120px]"></div>

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">

          {/* Brand Section */}
          <div className="lg:col-span-4">
            <a href="/" className="text-4xl font-black tracking-tighter text-white hover:text-blue-400 transition-colors">
              ticketbox
            </a>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-gray-400">
              The premier destination for discovering and booking the most exciting events in Vietnam. Premium experiences, just a click away.
            </p>
            <div className="mt-10 flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:bg-blue-500 hover:text-white hover:scale-110 transition-all">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-12 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Contact Us</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 group">
                  <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Hotline (8:00 - 23:00)</p>
                    <a href="tel:113" className="text-lg font-bold text-white hover:text-blue-400 transition-colors">113</a>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Support</p>
                    <a href="mailto:support@ticketbox.vn" className="text-sm font-medium text-white hover:text-blue-400 transition-colors truncate block max-w-[150px]">support@ticketbox.vn</a>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Resources</h3>
              <ul className="space-y-4">
                {['For Customers', 'For Organizers', 'Security Policy', 'Return Policy'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm font-medium text-gray-400 hover:text-white hover:translate-x-1 transition-all inline-block">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8">Location</h3>
              <div className="flex gap-4">
                <div className="rounded-xl bg-green-500/10 p-2 text-green-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium leading-relaxed text-gray-400">
                  298 Cầu Diễn, Nhổn, Minh Khai, Bắc Từ Liêm, HN
                </p>
              </div>
              <div className="mt-8 rounded-2xl liquid-glass p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Certified by</p>
                    <p className="text-xs font-bold text-white">Security Alliance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 border-t border-white/5 pt-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-xs font-medium text-gray-500">
            &copy; 2025 Ticketbox Major Project. Crafted with ❤️ by Group 6.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


