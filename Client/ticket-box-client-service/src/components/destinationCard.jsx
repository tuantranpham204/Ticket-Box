import { Link } from 'react-router-dom';


const DestinationCard = ({ dest }) => (
  <Link 
    to={`/destination/${dest.id}`}
    className="relative h-64 w-full transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:-translate-y-1"
  >
    <img 
      src={dest.imageUrl}     
      alt={dest.name} 
      className="h-full w-full object-cover"
      onError={(e) => e.currentTarget.src = 'https://placehold.co/400x500/111/fff?text=Error'}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    <h4 className="absolute bottom-4 left-4 text-2xl font-bold text-white">{dest.name}</h4>
  </Link>
);

export default DestinationCard;