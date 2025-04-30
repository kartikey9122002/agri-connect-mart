
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useStorageSetup = () => {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const setupStorageBuckets = async () => {
      try {
        // Check if product-images bucket exists
        const { data: buckets, error: bucketsError } = await supabase
          .storage
          .listBuckets();

        if (bucketsError) {
          throw bucketsError;
        }

        const productImagesBucket = buckets.find(b => b.name === 'product-images');
        
        if (!productImagesBucket) {
          console.log('Creating product-images bucket');
          
          // Create the bucket
          const { error: createError } = await supabase
            .storage
            .createBucket('product-images', { public: true });

          if (createError) {
            throw createError;
          }
          
          console.log('Successfully created product-images bucket');
        } else {
          console.log('product-images bucket already exists');
        }

        // Also check for availability column in products table
        const { error: columnError } = await supabase.rpc('check_column_exists', { 
          target_table: 'products',
          target_column: 'availability'
        });

        if (columnError) {
          console.log('Adding availability column to products table');
          
          // Add availability column to products table
          const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
            target_table: 'products',
            target_column: 'availability',
            column_type: 'text',
            default_value: '\'available\''
          });

          if (alterError) {
            console.error('Error adding availability column:', alterError);
          } else {
            console.log('Successfully added availability column to products table');
          }
        } else {
          console.log('availability column already exists in products table');
        }

        setIsStorageReady(true);
      } catch (error) {
        console.error('Error setting up storage:', error);
        toast({
          title: 'Storage setup issue',
          description: 'There was a problem setting up storage. Some features may not work correctly.',
          variant: 'destructive',
        });
      }
    };

    setupStorageBuckets();
  }, [toast]);

  return { isStorageReady };
};
