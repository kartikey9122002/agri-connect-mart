
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, CloudSun, MapPin } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  forecast: {
    date: string;
    temperature: number;
    condition: string;
    icon: string;
  }[];
}

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a call to a weather API using the user's location
        // For demo purposes, we'll use some mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockWeatherData: WeatherData = {
          location: 'New Delhi, India',
          temperature: 32,
          condition: 'Sunny',
          icon: 'sun',
          forecast: [
            {
              date: 'Tomorrow',
              temperature: 30,
              condition: 'Partly Cloudy',
              icon: 'cloud-sun'
            },
            {
              date: 'Wednesday',
              temperature: 29,
              condition: 'Cloudy',
              icon: 'cloud'
            },
            {
              date: 'Thursday',
              temperature: 31,
              condition: 'Sunny',
              icon: 'sun'
            }
          ]
        };
        
        setWeatherData(mockWeatherData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeatherData();
  }, []);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p>Unable to fetch weather data</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setIsLoading(true)}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Weather Forecast</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <CloudSun className="h-10 w-10 text-amber-500 mr-3" />
          <div>
            <div className="flex items-center">
              <h3 className="text-xl font-bold">{weatherData.temperature}°C</h3>
              <span className="ml-2 text-gray-600">{weatherData.condition}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{weatherData.location}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-sm font-medium mb-2">3-Day Forecast</h4>
          <div className="space-y-2">
            {weatherData.forecast.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{day.date}</span>
                <div className="flex items-center">
                  <CloudSun className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-sm">{day.condition}</span>
                </div>
                <div className="flex items-center">
                  <Thermometer className="h-3 w-3 mr-1 text-amber-500" />
                  <span className="text-sm font-medium">{day.temperature}°C</span>
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
