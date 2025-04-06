"use client"

import { useMemo } from "react"
import { WeatherData } from "@/lib/weather-service"
import { Sun, Cloud, CloudDrizzle, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react"

interface WeatherAnimationProps {
  weatherData: WeatherData;
}

export default function WeatherAnimation({ weatherData }: WeatherAnimationProps) {
  if (!weatherData.current) return null;
  
  const weatherCode = weatherData.current.weatherCode;
  // Determine if it's day time based on shortwaveRadiation (sunlight) if available, otherwise default to day
  const isDay = weatherData.current?.shortwaveRadiation ? weatherData.current.shortwaveRadiation > 0 : true;
  const temperature = weatherData.current?.temperature2m || 0;
  
  // Define common animation classes for floating effect
  const floatingAnimation = "animate-[float_3s_ease-in-out_infinite]"; 
  const pulseAnimation = "animate-[pulse_2s_ease-in-out_infinite]"; 
  const rotateAnimation = "animate-[spin_10s_linear_infinite]"; 
  
  // Determine weather icon, background, and animation based on weather code
  const { icon: WeatherIcon, background, animation, color, secondaryElements } = useMemo(() => {
    // Default values
    let icon = Sun;
    let background = "bg-gradient-to-b from-blue-400 to-blue-200";
    let animation = floatingAnimation;
    let color = "text-yellow-400";
    let secondaryElements = null;

    switch (true) {
      // Clear sky
      case weatherCode === 0:
        icon = Sun;
        background = isDay 
          ? "bg-gradient-to-b from-blue-400 to-blue-200" 
          : "bg-gradient-to-b from-blue-900 to-indigo-900";
        color = isDay ? "text-yellow-400" : "text-yellow-200";
        animation = `${rotateAnimation} ${pulseAnimation}`;
        break;
      
      // Partly cloudy
      case weatherCode >= 1 && weatherCode <= 3:
        icon = Cloud;
        background = isDay 
          ? "bg-gradient-to-br from-blue-300 to-blue-100" 
          : "bg-gradient-to-br from-blue-800 to-indigo-800";
        color = isDay ? "text-gray-200" : "text-gray-300";
        animation = floatingAnimation;
        // Add sun behind cloud for partly cloudy
        secondaryElements = (
          <Sun 
            className={`absolute -z-10 text-yellow-${isDay ? '400' : '200'} ${rotateAnimation}`} 
            size={60} 
            style={{ 
              top: '10px', 
              right: '15px', 
              opacity: weatherCode === 1 ? 0.9 : weatherCode === 2 ? 0.7 : 0.5 
            }} 
          />
        );
        break;

      // Fog
      case weatherCode >= 45 && weatherCode <= 49:
        icon = CloudFog;
        background = isDay 
          ? "bg-gradient-to-br from-gray-300 to-gray-200" 
          : "bg-gradient-to-br from-gray-700 to-gray-600";
        color = isDay ? "text-gray-400" : "text-gray-300";
        break;

      // Drizzle
      case weatherCode >= 50 && weatherCode <= 59:
        icon = CloudDrizzle;
        background = isDay 
          ? "bg-gradient-to-br from-blue-400 to-gray-300" 
          : "bg-gradient-to-br from-blue-800 to-gray-700";
        color = isDay ? "text-blue-400" : "text-blue-300";
        // Add rain drop animations
        secondaryElements = (
          <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-0.5 h-3 bg-blue-400 rounded-full animate-[raindrop_1.5s_ease-in_infinite]" 
                style={{ 
                  left: `${30 + i * 10}%`,
                  top: '60%',
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        );
        break;

      // Rain
      case weatherCode >= 60 && weatherCode <= 69:
      case weatherCode >= 80 && weatherCode <= 84: // Rain showers
        icon = CloudRain;
        background = isDay 
          ? "bg-gradient-to-br from-blue-500 to-gray-400" 
          : "bg-gradient-to-br from-blue-900 to-gray-800";
        color = isDay ? "text-blue-200" : "text-blue-200";
        // Add heavier rain animations
        secondaryElements = (
          <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-4 bg-blue-300 rounded-full animate-[heavyrain_1s_ease-in_infinite]" 
                style={{ 
                  left: `${20 + i * 10}%`,
                  top: '50%',
                  animationDelay: `${i * 0.15}s`,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        );
        break;

      // Snow
      case weatherCode >= 70 && weatherCode <= 79:
      case weatherCode >= 85 && weatherCode <= 86: // Snow showers
        icon = CloudSnow;
        background = isDay 
          ? "bg-gradient-to-br from-blue-100 to-gray-100" 
          : "bg-gradient-to-br from-blue-300 to-gray-400";
        color = "text-white";
        // Add snowflake animations
        secondaryElements = (
          <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full animate-[snowfall_2s_ease-in-out_infinite]" 
                style={{ 
                  left: `${25 + i * 10}%`,
                  top: '50%',
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.9
                }}
              />
            ))}
          </div>
        );
        break;

      // Thunderstorm
      case weatherCode >= 95 && weatherCode <= 99:
        icon = CloudLightning;
        background = isDay 
          ? "bg-gradient-to-br from-gray-600 to-gray-700" 
          : "bg-gradient-to-br from-gray-800 to-gray-900";
        color = "text-yellow-300";
        animation = `${pulseAnimation}`;
        // Add lightning flash animation
        secondaryElements = (
          <div className="absolute inset-0 flex justify-center items-center overflow-hidden">
            <div className="absolute inset-0 bg-yellow-400 opacity-0 animate-[lightning_3s_ease-out_infinite]"></div>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 bg-blue-300 rounded-full animate-[heavyrain_1.2s_ease-in_infinite]" 
                style={{ 
                  height: 4 + i * 2,
                  left: `${30 + i * 15}%`,
                  top: '60%',
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        );
        break;

      // Default - clear
      default:
        icon = Sun;
        background = isDay 
          ? "bg-gradient-to-b from-blue-400 to-blue-200" 
          : "bg-gradient-to-b from-blue-900 to-indigo-900";
        color = isDay ? "text-yellow-400" : "text-yellow-200";
        animation = `${rotateAnimation} ${pulseAnimation}`;
    }

    return { icon, background, animation, color, secondaryElements };
  }, [weatherCode, isDay, floatingAnimation, pulseAnimation, rotateAnimation]);

  return (
    <div className="relative mb-6 w-40 h-40">
      {/* Weather background */}
      <div className={`absolute inset-0 rounded-full ${background} transition-colors duration-700 opacity-80`}></div>
      
      {/* Secondary elements (sun behind clouds, raindrops, etc) */}
      {secondaryElements}
      
      {/* Primary weather icon */}
      <div className="absolute inset-0 flex justify-center items-center">
        <WeatherIcon 
          className={`${color} ${animation} transition-colors duration-500 z-10`} 
          size={80} 
          strokeWidth={1.5}
        />
      </div>

      {/* Temperature indicator */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1 text-center shadow-lg">
        <span className="text-2xl font-bold">{Math.round(temperature)}°</span>
      </div>
    </div>
  )
}

// Add this to tailwind.config.js (will auto-detect in JIT mode)
/* CSS keyframes */
/* 
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes raindrop {
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  70% { transform: translateY(25px) scale(1); opacity: 0.7; }
  100% { transform: translateY(30px) scale(0); opacity: 0; }
}

@keyframes heavyrain {
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  80% { transform: translateY(35px) scale(1); opacity: 0.8; }
  100% { transform: translateY(40px) scale(0); opacity: 0; }
}

@keyframes snowfall {
  0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
  70% { transform: translateY(25px) rotate(180deg); opacity: 0.9; }
  100% { transform: translateY(30px) rotate(360deg); opacity: 0; }
}

@keyframes lightning {
  0%, 100%, 15%, 31%, 47%, 60%, 77%, 91% { opacity: 0; }
  14%, 30%, 46%, 59%, 76%, 90% { opacity: 0.4; }
}
*/
