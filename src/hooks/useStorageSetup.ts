
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useStorageSetup() {
  const [isStorageReady, setIsStorageReady] = useState<boolean>(false);

  useEffect(() => {
    const checkStorage = async () => {
      console.log("Checking storage setup...");
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error listing storage buckets:", error);
          throw error;
        }

        const productImagesBucketExists = buckets.some(bucket => bucket.name === 'product-images');
        console.log('Buckets:', buckets);
        
        if (productImagesBucketExists) {
          console.log('Product images bucket found.');
          setIsStorageReady(true);
        } else {
          console.error('Product images bucket NOT found.');
          toast({
            title: 'Storage Error',
            description: 'Required storage bucket not found. Please check your setup.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error checking storage:', error);
        toast({
          title: 'Storage Error',
          description: 'Could not verify storage. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    checkStorage();
  }, []);

  return { isStorageReady };
}
