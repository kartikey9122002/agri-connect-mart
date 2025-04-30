
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceCommandButtonProps {
  onCommandDetected: (command: string) => void;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onCommandDetected }) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startListening = () => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not supported',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    setIsListening(true);
    setIsLoading(true);

    // For demo purposes, simulate processing with a timeout
    setTimeout(() => {
      setIsLoading(false);
      
      // Sample commands for demonstration - in a real app this would use actual speech recognition
      const sampleCommands = [
        'search for organic vegetables',
        'show me honey products',
        'filter by price low to high',
        'chat with seller'
      ];
      const randomCommand = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
      
      toast({
        title: 'Command detected',
        description: randomCommand,
      });
      
      onCommandDetected(randomCommand);
      setIsListening(false);
    }, 2000);

    /* 
    // Real implementation would use the Web Speech API like this:
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onCommandDetected(transcript);
      setIsListening(false);
      setIsLoading(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast({
        title: 'Recognition Error',
        description: `Error: ${event.error}`,
        variant: 'destructive',
      });
      setIsListening(false);
      setIsLoading(false);
    };
    
    recognition.start();
    */
  };

  const stopListening = () => {
    setIsListening(false);
    setIsLoading(false);
  };

  return (
    <Button
      onClick={isListening ? stopListening : startListening}
      variant={isListening ? "destructive" : "default"}
      size="sm"
      className={`rounded-full p-3 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-agrigreen-600 hover:bg-agrigreen-700'}`}
      aria-label={isListening ? "Stop listening" : "Start voice command"}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
};

export default VoiceCommandButton;
