import { Link } from 'react-router-dom';

const DestinationCard = ({ dest }) => (
  <Link
    to={`/destination/${dest.id}`}
    className="group relative h-72 w-full transform overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/20"
  >
    <img
      src={dest.imageUrl}
      alt={dest.name}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      onError={(e) => e.currentTarget.src = 'https://placehold.co/400x500/111/fff?text=Error'}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>

    <div className="absolute inset-0 p-6 flex flex-col justify-end">
      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">Popular Spot</p>
      <h4 className="text-2xl font-black text-white tracking-tighter drop-shadow-md">{dest.name}</h4>
    </div>

    {/* Subtle lighting overlay on hover */}
    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
  </Link>
);

export default DestinationCard;