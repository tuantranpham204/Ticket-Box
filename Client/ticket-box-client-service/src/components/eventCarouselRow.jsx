import { Link } from 'react-router-dom';
import EventCard from './eventCard';
import { 
  ArrowRight 
} from 'lucide-react';


const EventCarouselRow = ({ title, events, link = "#" }) => (
  <div className="mb-12">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <Link to={link} className="flex items-center text-sm text-blue-400 hover:underline">
        More <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {events.map((event) => (
        <div key={event.id} className="w-1/4 min-w-[280px]">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  </div>
);

export default EventCarouselRow;