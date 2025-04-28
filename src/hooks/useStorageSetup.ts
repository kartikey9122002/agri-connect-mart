
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useStorageSetup() {
  const { toast } = useToast();
  const [isStorageReady, setIsStorageReady] = useState<boolean>(false);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // First check if the bucket already exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          throw bucketsError;
        }
        
        const productImagesBucketExists = buckets.some(bucket => bucket.name === 'product-images');
        
        if (productImagesBucketExists) {
          console.log('Product images bucket already exists');
          setIsStorageReady(true);
          return;
        }
        
        // If bucket doesn't exist, try to create it
        const { error } = await supabase.storage.createBucket('product-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });
        
        if (!error) {
          console.log('Product images bucket created');
          setIsStorageReady(true);
        } else if (error.message === 'Bucket already exists') {
          console.log('Product images bucket already exists');
          setIsStorageReady(true);
        } else {
          console.error('Error creating storage bucket:', error);
          toast({
            title: 'Storage Setup Issue',
            description: 'There was a problem setting up storage. Some features may not work properly.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    };

    initializeStorage();
  }, [toast]);

  return { isStorageReady };
}
