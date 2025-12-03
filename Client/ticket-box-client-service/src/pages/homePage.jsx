import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatbotV1 from '../components/ChatbotV1';
import { 
  ChevronLeft, ChevronRight, Music, Theater, Palette, Tag, 
} from 'lucide-react';
import EventCarouselRow from '../components/eventCarouselRow';
import DestinationCard from '../components/destinationCard';
// Mock data for the event cards based on your screenshot
const mockSpecialEvents = [
  { id: 1, title: "VONG V", artist: "Artist Name", date: "19-15 AUG", imageUrl: "https://placehold.co/400x600/1a1a1a/ffffff?text=VONG+V" },
  { id: 2, title: "LÊ VĂN DUYỆT", artist: "Historical Play", date: "Multiple Dates", imageUrl: "https://placehold.co/400x600/3a3a3a/ffffff?text=LÊ+VĂN+DUYỆT" },
  { id: 3, title: "WATERBOMB 2025", artist: "Ho Chi Minh", date: "2025.11.15-16", imageUrl: "https://placehold.co/400x600/1a1a4a/ffffff?text=WATERBOMB" },
  { id: 4, title: "NÀNG TIÊN CÁ", artist: "Disney on Ice", date: "Various", imageUrl: "https://placehold.co/400x600/4a1a1a/ffffff?text=NÀNG+TIÊN+CÁ" },
  { id: 5, title: "MAI CẢ", artist: "Movie Event", date: "Now Showing", imageUrl: "https://placehold.co/400x600/2a2a2a/ffffff?text=MAI+CẢ" },
];

// Mock data for the main carousel

const mockCarouselEvents = [
  { id: 6, title: "K-POP SUPER CONCERT", date: "18:00 / 22.11.2025", imageUrl: "https://placehold.co/1200x500/0a2a3a/ffffff?text=K-POP+SUPER+CONCERT" },
  { id: 7, title: "ÜBERMENSCH", artist: "G-DRAGON 2025 WORLD TOUR", imageUrl: "https://placehold.co/1200x500/3a1a0a/ffffff?text=ÜBERMENSCH" },
];

const mockWeekendEvents = [
  { id: 8, title: "[LEMLAB] MINI WORKSHOP TRẢI NGHIỆM VẼ MÓC KHÓA", date: "01 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/f0f0e8/333?text=Vẽ+Móc+Khóa", price: "99.000đ" },
  { id: 9, title: "[LEMLAB] Workshop TRẢI NGHIỆM VẼ LY GỐM", date: "04 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/e8f0f0/333?text=Vẽ+Ly+Gốm", price: "180.000đ" },
  { id: 10, title: "CHÀO SHOW", date: "04 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/5a2a2a/fff?text=CHÀO+SHOW", price: "1.040.000đ" },
  { id: 11, title: "GÕM Show Tháng 11 - Hà Nội", date: "06 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/b08a5a/fff?text=GÕM+Show", price: "800.000đ" },
];

const mockArtsEvents = [
  { id: 12, title: "Nhà hát kịch IDECAF: TẤM CÁM ĐẠI CHIẾN!", date: "07 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/3a4a3a/fff?text=TẤM+CÁM", price: "270.000đ" },
  { id: 13, title: "ART WORKSHOP \"SAKURA BLOSSOM\"", date: "05 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/f0d0d0/333?text=Sakura+Cake", price: "390.000đ" },
  { id: 14, title: "[GARDEN ART] - ART WORKSHOP \"TIRAMISU\"", date: "06 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/d0b0a0/333?text=Tiramisu", price: "390.000đ" },
  { id: 15, title: "ART WORKSHOP \"BLUSH & BERRIES\"", date: "06 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/e0b0b0/333?text=Berries", price: "420.000đ" },
];

const mockOtherEvents = [
  { id: 16, title: "[FLOWER 1969'S] WORKSHOP SOLID PERFUME", date: "08 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/d0c0b0/333?text=Solid+Perfume", price: "279.000đ" },
  { id: 17, title: "COUNTDOWN PARTY 2026 - SAIGON'S BIGGEST BOLLYWOOD BASH", date: "31 Tháng 12, 2025", imageUrl: "https://placehold.co/400x300/a02040/fff?text=BOLLYWOOD+BASH", price: "500.000đ" },
  { id: 18, title: "VIEWING PARTY Chung Kết Tổng CKTG 2025", date: "09 Tháng 11, 2025", imageUrl: "https://placehold.co/400x300/201040/fff?text=VIEWING+PARTY", price: "299.000đ" },
  { id: 19, title: "COUNTDOWN PARTY 2026 - PHUQUOC'S BIGGEST BOLLYWOOD BASH", date: "31 Tháng 12, 2025", imageUrl: "https://placehold.co/400x300/a02040/fff?text=BOLLYWOOD+BASH", price: "500.000đ" },
];

const mockDestinations = [
  { id: 1, name: "Tp. Hồ Chí Minh", imageUrl: "https://placehold.co/400x500/1a3a5a/fff?text=HCMC" },
  { id: 2, name: "Hà Nội", imageUrl: "https://placehold.co/400x500/2a4a3a/fff?text=Hanoi" },
  { id: 3, name: "Đà Lạt", imageUrl: "https://placehold.co/400x500/5a3a4a/fff?text=Da+Lat" },
  { id: 4, name: "Vị trí khác", imageUrl: "https://placehold.co/400x500/4a4a4a/fff?text=Other" },
];

/**
 * The Home Page component.
 * This component does NOT include <BrowserRouter> because App.jsx already provides it.
 */
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === mockCarouselEvents.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? mockCarouselEvents.length - 1 : prev - 1));
  };

  const currentEvent = mockCarouselEvents[currentSlide];

  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* --- Main Carousel --- */}
        <div className="relative mb-12 h-[400px] w-full overflow-hidden rounded-lg">
          {/* Slide Content */}
          <div 
            className="h-full w-full bg-cover bg-center transition-opacity duration-700 ease-in-out" 
            style={{ backgroundImage: `url(${currentEvent.imageUrl})` }}
          >
            <div className="flex h-full w-full flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-8">
              <h2 className="mb-2 text-4xl font-bold">{currentEvent.title}</h2>
              <p className="text-lg text-gray-200">{currentEvent.artist || currentEvent.date}</p>
              <Link
                to={`/event/${currentEvent.id}`}
                className="mt-4 w-fit rounded-full bg-white px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                View Details
              </Link>
            </div>
          </div>
          {/* Carousel Controls */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
            {mockCarouselEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/40'}`}
              ></button>
            ))}
          </div>
        </div>

        {/* --- Category Links (Original) --- */}
        <div className="mb-12 flex items-center justify-center space-x-8 text-gray-400">
          {[
            { name: 'Life Style', icon: Music, link: "/category/lifestyle" },
            { name: 'Arts & Theater', icon: Theater, link: "/category/arts" },
            { name: 'Art', icon: Palette, link: "/category/art" },
            { name: 'Other', icon: Tag, link: "/category/other" },
          ].map((category) => (
            <Link 
              key={category.name}
              to={category.link} 
              className="flex flex-col items-center space-y-2 transition-colors hover:text-white"
            >
              <category.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>

        {/* --- Special Events Grid (Original) --- */}
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-semibold text-white">Special Events</h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {mockSpecialEvents.map((event) => (
              <Link 
                to={`/event/${event.id}`} 
                key={event.id}
                className="group transform overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-transform duration-300 hover:-translate-y-2"
              >
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="h-64 w-full object-cover" 
                  onError={(e) => e.currentTarget.src = 'https://placehold.co/400x600/111/fff?text=Image+Error'}
                />
                <div className="p-4">
                  <h4 className="truncate text-lg font-bold text-white group-hover:text-blue-400">{event.title}</h4>
                  <p className="text-sm text-gray-400">{event.artist}</p>
                  <p className="mt-2 text-xs font-semibold text-gray-300">{event.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* --- NEW: Weekend/Monthly Events --- */}
        <EventCarouselRow 
          title="Weekend / This Month"
          events={mockWeekendEvents}
          link="/events/weekend"
        />

        {/* --- NEW: Zalopay Banner --- */}
        <div className="mb-12 w-full overflow-hidden rounded-lg">
          <img 
            src="https://placehold.co/1200x300/1e90ff/ffffff?text=Zalopay+|+ticketbox+Banner+Here" 
            alt="Zalopay Banner"
            className="h-auto w-full"
          />
        </div>

        {/* --- NEW: Arts & Theater --- */}
        <EventCarouselRow 
          title="Arts & Theater"
          events={mockArtsEvents}
          link="/category/arts"
        />

        {/* --- NEW: Other Events --- */}
        <EventCarouselRow 
          title="Other Events"
          events={mockOtherEvents}
          link="/category/other"
        />

        {/* --- NEW: Destinations --- */}
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-semibold text-white">Interesting destinations</h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {mockDestinations.map((dest) => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        </div>
        <ChatbotV1 />
      </div>
    </div>
  );
};

