
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Map } from 'lucide-react';

const LocationUpdateModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch current location when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchCurrentLocation();
    }
  }, [open, user]);

  const fetchCurrentLocation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data && data.location) {
        setLocation(data.location);
      }
    } catch (error: any) {
      console.error('Error fetching location:', error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ location })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Your location has been updated.',
      });
      
      setOpen(false);
    } catch (error: any) {
      console.error('Error updating location:', error);
      toast({
        title: 'Error',
        description: 'Failed to update location. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Map className="h-4 w-4" />
          Update Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Your Location</DialogTitle>
          <DialogDescription>
            Enter your village, city, or pin code to receive accurate weather predictions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your village, city, or pin code"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateLocation}
            disabled={isLoading || !location.trim()}
          >
            {isLoading ? 'Updating...' : 'Update Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationUpdateModal;
