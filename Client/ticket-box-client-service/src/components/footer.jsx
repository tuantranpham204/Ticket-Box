export default function Footer() {
    return (<footer className="bg-gray-900 text-gray-300 p-8 md:p-16">
            <div className="container mx-auto max-w-7xl">

                {/* <!-- Top Section: Logo & Socials (Inspired by Image 1) --> */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    {/* <!-- Logo Placeholder --> */}
                    <div className="text-white text-3xl font-bold mb-6 md:mb-0 tracking-wider">
                        COMPANY LOGO
                    </div>
                    {/* <!-- Social Icons (Inspired by Image 1) --> */}
                    <div className="flex space-x-5">
                        <a href="#" title="Instagram" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2.315a.75.75 0 0 1 .75.75L13.065 6h3.69a.75.75 0 0 1 .75.75l-.003 3.69.003.002a.75.75 0 0 1-.75.75h-3.69l.001 3.69a.75.75 0 0 1-.75.75l-3.69-.001-.002.001a.75.75 0 0 1-.75-.75l.001-3.69-3.69.003a.75.75 0 0 1-.75-.75l.003-3.69-.003-.002a.75.75 0 0 1 .75-.75h3.69l-.001-3.69a.75.75 0 0 1 .75-.75l3.69.001ZM11.25 7.5v9h1.5v-9h-1.5Z" clipRule="evenodd" /><path d="M10.06 13.06a1.5 1.5 0 1 1 3.001.001 1.5 1.5 0 0 1-3.001-.001Z" /><path fillRule="evenodd" d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21ZM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" clipRule="evenodd" /></svg>
                        </a>
                        <a href="#" title="TikTok" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 0 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 6.03 6.16 6.03s6.16-2.7 6.16-6.03V9.82a8.744 8.744 0 0 0 4.38 2.6V8.56s-1.72-.46-3.26-1.4Z" /></svg>
                        </a>
                        <a href="#" title="WhatsApp" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M18.403 5.633a10.25 10.25 0 0 0-14.496 14.496l-1.317 4.87a.75.75 0 0 0 .91.91l4.87-1.317a10.25 10.25 0 0 0 14.496-14.496ZM12 21.75a9.75 9.75 0 1 1 7.479-3.553.75.75 0 0 0-.488-.196l-4.87 1.317a.75.75 0 0 1-.91-.91l1.317-4.87a.75.75 0 0 0-.196-.488A9.75 9.75 0 0 1 12 21.75Z" clipRule="evenodd" /><path d="M15.228 13.92a3.375 3.375 0 0 1-4.341 1.341l-.065-.033a5.54 5.54 0 0 1-2.4-2.4l-.033-.065a3.375 3.375 0 0 1 1.341-4.341l1.167-.71S11.01 7.9 11.01 8.7s.015 1.485.015 1.485l-.3 1.05a.75.75 0 0 0 1.28.71l1.05-.3s.683.015 1.485.015.71-1.167.71-1.167l-.71 1.167Z" /></svg>
                        </a>
                        <a href="#" title="Facebook" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" clipRule="evenodd" /></svg>
                        </a>
                        <a href="#" title="X (Twitter)" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H4.68l4.71 6.23L13.89 2.25h4.354ZM17.15 19.5l-1.422-2.023L5.484 4.31H7.85l10.74 13.067H17.15Z" /></svg>
                        </a>
                        <a href="#" title="Discord" className="text-white hover:text-gray-400 transition-colors duration-200">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11.984 2.5A9.75 9.75 0 0 0 2.25 12.234c0 4.512 3.593 8.243 8.243 8.243 1.107 0 2.168-.22 3.14-.623a.75.75 0 0 1 .86.11l1.47 1.104a.75.75 0 0 0 1.15-.31l1.018-2.716a.75.75 0 0 1 .632-.51c3.22-.622 5.487-3.5 5.487-6.932A9.75 9.75 0 0 0 11.984 2.5Z" /><path d="m14.28 12.698 1.488 1.488a.75.75 0 0 1-1.06 1.06l-1.488-1.488a.75.75 0 0 1 1.06-1.06ZM9.72 12.698l1.488 1.488a.75.75 0 1 1-1.06 1.06l-1.488-1.488a.75.75 0 0 1 1.06-1.06Z" /></svg>
                        </a>
                    </div>
                </div>

                {/* <!-- Divider --> */}
                <div className="border-t border-gray-700 mb-12"></div>

                {/* <!-- 
                  Content Section (from Image 2)
                  - grid-cols-1: Single column on mobile
                  - md:grid-cols-2: Two columns on medium screens
                  - lg:grid-cols-4: Four-column layout on large screens (inspired by Image 1)
                --> */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* <!-- Column 1: Hotline & Email --> */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4">Hotline</h3>
                            <div className="flex items-start mb-2">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.827-1.46-5.152-3.785-6.613-6.613l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                </svg>
                                <span>Thứ 2 - Chủ Nhật (8:00 - 23:00)</span>
                            </div>
                            <a href="tel:19006408" className="text-2xl font-bold text-green-400 hover:text-green-300 transition-colors duration-200 ml-8">
                                1900.6408
                            </a>
                        </div>
                        
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4">Email</h3>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                <a href="mailto:support@ticketbox.vn" className="hover:text-white transition-colors duration-200">
                                    support@ticketbox.vn
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Column 2: Main Office --> */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Văn phòng chính</h3>
                        <div className="flex items-start">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            <span>
                                Tầng 12, Tòa nhà Viettel, 285 Cách Mạng Tháng Tám, Phường Hòa Hưng, TP. Hồ Chí Minh
                            </span>
                        </div>
                    </div>

                    {/* <!-- Column 3: For Customers & Organizers --> */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4">Dành cho Khách hàng</h3>
                            <ul>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors duration-200">Điều khoản sử dụng cho khách hàng</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4">Dành cho Ban Tổ chức</h3>
                            <ul>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors duration-200">Điều khoản sử dụng cho ban tổ chức</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* <!-- Column 4: About Us --> */}
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Về công ty chúng tôi</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Quy chế hoạt động</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Chính sách bảo mật thông tin</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Cơ chế giải quyết tranh chấp/ khiếu nại</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Chính sách bảo mật thanh toán</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Chính sách đổi trả và kiểm hàng</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Điều kiện vận chuyển và giao nhận</a></li>
                            <li><a href="#" className="hover:text-white transition-colors duration-200">Phương thức thanh toán</a></li>
                        </ul>
                    </div>

                </div>

                {/* <!-- Copyright Section --> */}
                <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; 2025 Ticketbox by Major Project Group 6. All rights reserved.</p>
                </div>

            </div>
        </footer>)
}