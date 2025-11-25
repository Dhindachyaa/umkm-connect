import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from '../supabase/client';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

const Location = () => {
  const [locations, setLocations] = useState([]);
  
  // Koordinat default Semarang
  const position = [-6.966667, 110.416664]; 

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from('umkm').select('id, name, latitude, longitude, category');
      if (data) setLocations(data);
    };
    fetchLocations();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col">
        <div className="bg-white p-4 shadow z-10">
            <h1 className="font-bold text-lg">Peta Persebaran UMKM</h1>
            <p className="text-xs text-gray-500">Temukan UMKM di sekitar Semarang</p>
        </div>
        
        <div className="flex-1 relative z-0">
            <MapContainer center={position} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locations.map((loc) => (
                    loc.latitude && loc.longitude && (
                        <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="block mb-1">{loc.name}</strong>
                                    <span className="text-xs text-gray-500 block mb-2">{loc.category}</span>
                                    <Link 
                                        to={`/umkm/${loc.id}`} 
                                        className="text-[#236fa6] text-xs font-bold underline"
                                    >
                                        Lihat Detail
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    </div>
  );
};

export default Location;
