'use client';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ 
  message = "Ładowanie...", 
  className = "" 
}: LoadingScreenProps) {
  return (
    <div className={`min-h-screen bg-black flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/70 text-sm">{message}</p>
      </div>
    </div>
  );
}
