
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const useStorageSetup = () => {
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Function to check if a column exists in a table
  const columnExists = async (table: "products" | "profiles" | "schemes", column: string) => {
    try {
      // This is a hacky way to check if column exists, by trying to select it
      const { error } = await supabase
        .from(table)
        .select(column)
        .limit(1);

      // If there's no error, the column exists
      return !error;
    } catch (error) {
      console.error(`Error checking if column ${column} exists in ${table}:`, error);
      return false;
    }
  };

  useEffect(() => {
    const setupStorage = async () => {
      try {
        // Check if availability column exists in products table
        const hasAvailability = await columnExists("products", "availability");
        
        if (!hasAvailability) {
          console.log('The "availability" column does not exist in the "products" table');
          // The migration was already run, so we don't need to add it again
        }
        
        setIsStorageReady(true);
      } catch (error) {
        console.error('Error setting up storage:', error);
      }
    };

    setupStorage();
  }, []);

  return { isStorageReady };
};

export default useStorageSetup;
