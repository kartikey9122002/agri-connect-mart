
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LocationUpdateModal from './LocationUpdateModal';

interface WeatherDataType {
  location: string;
  temperature: number;
  condition: string;
  forecast: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

const WeatherWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherDataType | null>(null);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserLocation();
    }
  }, [user]);

  useEffect(() => {
    if (userLocation) {
      fetchWeatherData();
    }
  }, [userLocation]);

  const fetchUserLocation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.location) {
        setUserLocation(data.location);
      } else {
        // Default location if none set
        setUserLocation('Delhi');
      }
    } catch (error) {
      console.error('Error fetching user location:', error);
      // Default location on error
      setUserLocation('Delhi');
    }
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    
    try {
      // This would typically be a real API call to a weather service
      // using the userLocation as a parameter
      // For now we're simulating weather data
      
      setTimeout(() => {
        const mockWeatherData: WeatherDataType = {
          location: userLocation || 'Delhi',
          temperature: 28,
          condition: 'Sunny',
          forecast: [
            { date: 'Tomorrow', temperature: 29, condition: 'Partly Cloudy' },
            { date: 'Wednesday', temperature: 27, condition: 'Rainy' },
            { date: 'Thursday', temperature: 26, condition: 'Thunderstorms' },
          ],
        };
        
        setWeatherData(mockWeatherData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="h-12 w-12 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-12 w-12 text-blue-500" />;
      case 'thunderstorms':
        return <CloudLightning className="h-12 w-12 text-purple-500" />;
      case 'sunny':
      default:
        return <Sun className="h-12 w-12 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Weather Forecast
            <LocationUpdateModal />
          </CardTitle>
          <CardDescription>Loading weather data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Weather Forecast
            <LocationUpdateModal />
          </CardTitle>
          <CardDescription>No weather data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Weather Forecast
          <LocationUpdateModal />
        </CardTitle>
        <CardDescription>Current conditions for {weatherData.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-3xl font-bold">{weatherData.temperature}°C</p>
            <p className="text-gray-500">{weatherData.condition}</p>
          </div>
          {getWeatherIcon(weatherData.condition)}
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">3-Day Forecast</h3>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{day.date}</span>
                <div className="flex items-center gap-2">
                  <span>{day.temperature}°C</span>
                  <span className="text-xs text-gray-500">{day.condition}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
