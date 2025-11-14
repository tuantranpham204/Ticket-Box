import React from 'react';

export default function Footer(){
  return (
    <footer className="bg-gray-900 p-8 text-gray-300 md:p-16">
      <div className="container mx-auto max-w-7xl">

        <div className="mb-12 flex flex-col items-center justify-between md:flex-row">
          <a href="/" className="text-4xl font-bold text-white">
            ticketbox
          </a>
          <div className="mt-8 flex space-x-5 md:mt-0">
            <a href="#" title="Instagram" className="text-white transition-colors duration-200 hover:text-gray-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2.315a.75.75 0 0 1 .75.75L13.065 6h3.69a.75.75 0 0 1 .75.75l-.003 3.69.003.002a.75.75 0 0 1-.75.75h-3.69l.001 3.69a.75.75 0 0 1-.75.75l-3.69-.001-.002.001a.75.75 0 0 1-.75-.75l.001-3.69-3.69.003a.75.75 0 0 1-.75-.75l.003-3.69-.003-.002a.75.75 0 0 1 .75-.75h3.69l-.001-3.69a.75.75 0 0 1 .75-.75l3.69.001ZM11.25 7.5v9h1.5v-9h-1.5Z" clipRule="evenodd" />
                <path d="M10.06 13.06a1.5 1.5 0 1 1 3.001.001 1.5 1.5 0 0 1-3.001-.001Z" />
                <path fillRule="evenodd" d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21ZM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" title="TikTok" className="text-white transition-colors duration-200 hover:text-gray-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 0 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 6.03 6.16 6.03s6.16-2.7 6.16-6.03V9.82a8.744 8.744 0 0 0 4.38 2.6V8.56s-1.72-.46-3.26-1.4Z" />
              </svg>
            </a>
            <a href="#" title="Facebook" className="text-white transition-colors duration-200 hover:text-gray-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" title="X (Twitter)" className="text-white transition-colors duration-200 hover:text-gray-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H4.68l4.71 6.23L13.89 2.25h4.354ZM17.15 19.5l-1.422-2.023L5.484 4.31H7.85l10.74 13.067H17.15Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-12 border-t border-gray-700"></div>

        {/* Content Section */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1: Hotline & Email */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Hotline</h3>
              <div className="mb-2 flex items-start">
                <svg className="mr-3 h-5 w-5 flex-shrink-0 stroke-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.827-1.46-5.152-3.785-6.613-6.613l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span>Monday - Sunday (8:00 - 23:00)</span>
              </div>
              <a href="tel:19006408" className="ml-8 text-2xl font-bold text-green-400 transition-colors duration-200 hover:text-green-300">
                113
              </a>
            </div>
            
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Email</h3>
              <div className="flex items-center">
                <svg className="mr-3 h-5 w-5 flex-shrink-0 stroke-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:12a1tranphamtuan@gmail.com" className="transition-colors duration-200 hover:text-white">
                  12a1tranphamtuan@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Main Office */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Main Office</h3>
            <div className="flex items-start">
              <svg className="mr-3 h-5 w-5 flex-shrink-0 stroke-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>
                298 Cầu Diễn, Nhổn, Minh Khai, Từ Liêm, Hà Nội
              </span>
            </div>
          </div>

          {/* Column 3: For Customers & Organizers */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">For Customers</h3>
              <ul>
                <li>
                  <a href="#" className="transition-colors duration-200 hover:text-white">Terms of Use for Customers</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">For Organizers</h3>
              <ul>
                <li>
                  <a href="#" className="transition-colors duration-200 hover:text-white">Terms of Use for Organizers</a>
                </li>

              </ul>
            </div>
          </div>

          {/* Column 4: About Us */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">About Our Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Operational Regulations</a></li>
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Information Privacy Policy</a></li>
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Dispute/Complaint Resolution</a></li>
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Payment Security Policy</a></li>
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Return and Inspection Policy</a></li>
              <li><a href="#" className="transition-colors duration-200 hover:text-white">Shipping and Delivery Policy</a></li>
              <li><a href="#" className="transition-colors duration-200 hover.text-white">Payment Methods</a></li>
            </ul>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Ticketbox by Major Project Group 6. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};


