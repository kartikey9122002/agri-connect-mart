
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, CloudSun, MapPin } from 'lucide-react';
import { WeatherData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchSellerLocation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('address')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.address) {
          setLocation(data.address);
          fetchWeatherData(data.address);
        } else {
          // Default location if user doesn't have an address
          setLocation('New Delhi, India');
          fetchWeatherData('New Delhi, India');
        }
      } catch (error) {
        console.error('Error fetching seller location:', error);
        setLoading(false);
      }
    };

    fetchSellerLocation();
    
    // Set up hourly refresh
    const refreshInterval = setInterval(() => {
      if (location) {
        fetchWeatherData(location);
      }
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(refreshInterval);
  }, [user]);
  
  const fetchWeatherData = async (locationQuery: string) => {
    setLoading(true);
    try {
      // For demo purposes, we're using a mock API response
      // In a real application, you would use a weather API like OpenWeatherMap
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock weather data
      const mockWeatherData: WeatherData = {
        location: locationQuery,
        temperature: 28,
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        forecast: [
          { date: 'Tomorrow', temperature: 29, condition: 'Sunny', icon: 'sun' },
          { date: 'Day after', temperature: 27, condition: 'Scattered Showers', icon: 'cloud-rain' },
          { date: 'In 3 days', temperature: 25, condition: 'Rain', icon: 'rain' }
        ]
      };
      
      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLocationUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (location) {
      fetchWeatherData(location);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-400">
        <CardTitle className="text-white flex items-center gap-2">
          <CloudSun className="h-5 w-5" />
          Weather Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agrigreen-600"></div>
          </div>
        ) : weatherData ? (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-gray-500 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{weatherData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold">{weatherData.temperature}°C</span>
                    <span className="text-gray-600">{weatherData.condition}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <CloudSun className="h-10 w-10 text-blue-500" />
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium mb-2">3-Day Forecast</h4>
              <div className="grid grid-cols-3 gap-2">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-2 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-500">{day.date}</div>
                    <div className="my-1">
                      <Thermometer className="h-4 w-4 mx-auto text-blue-400" />
                    </div>
                    <div className="font-medium">{day.temperature}°C</div>
                    <div className="text-xs text-gray-500 truncate">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleLocationUpdate} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Update location..."
                  className="flex-1 px-3 py-2 border rounded text-sm"
                />
                <button 
                  type="submit"
                  className="px-3 py-2 bg-agrigreen-600 text-white rounded text-sm hover:bg-agrigreen-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Weather data could not be loaded.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
