
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to set up storage buckets and other infrastructure on app initialization
 */
export function useStorageSetup() {
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const setupStorage = async () => {
      console.log('Setting up storage and infrastructure...');
      
      try {
        // Check if products table has availability column
        await ensureProductAvailabilityColumn();
        
        console.log('Storage setup complete');
        setIsStorageReady(true);
      } catch (error) {
        console.error('Error during storage setup:', error);
        setIsStorageReady(false);
      }
    };

    setupStorage();
  }, []);
  
  /**
   * Ensures the products table has the availability column
   */
  const ensureProductAvailabilityColumn = async () => {
    try {
      // Check if column exists using system tables
      const { data: columns, error: columnsError } = await supabase
        .rpc('check_column_exists', { 
          table_name: 'products', 
          column_name: 'availability' 
        });

      if (columnsError) {
        console.error('Error checking for availability column:', columnsError);
        
        // Fallback: try to add the column anyway
        await addAvailabilityColumn();
        return;
      }
      
      // If column doesn't exist (returns false or null), add it
      if (!columns) {
        await addAvailabilityColumn();
      } else {
        console.log('Availability column already exists');
      }
    } catch (error) {
      console.error('Error in ensureProductAvailabilityColumn:', error);
      // Try to add the column as a fallback
      await addAvailabilityColumn();
    }
  };
  
  /**
   * Adds the availability column to the products table
   */
  const addAvailabilityColumn = async () => {
    try {
      console.log('Adding availability column to products table...');
      
      // Execute raw SQL to add the column if it doesn't exist
      const { error } = await supabase.rpc('add_column_if_not_exists', {
        table_name: 'products',
        column_name: 'availability',
        column_type: 'text',
        column_default: "'available'"
      });
      
      if (error) {
        console.error('Error adding availability column:', error);
        throw error;
      }
      
      console.log('Availability column added successfully');
    } catch (error) {
      console.error('Error in addAvailabilityColumn:', error);
    }
  };
  
  return { isStorageReady };
}

export default useStorageSetup;
