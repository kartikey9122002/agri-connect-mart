
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const useStorageSetup = () => {
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Function to check if a column exists in a table
  const columnExists = async (table: string, column: string) => {
    try {
      // This is a hacky way to check if column exists, by trying to select it
      const { error } = await supabase
        .from(table as any)
        .select(column)
        .limit(1);

      // If there's no error, the column exists
      return !error;
    } catch (error) {
      console.error(`Error checking if column ${column} exists in ${table}:`, error);
      return false;
    }
  };

  // Add a column if it doesn't exist
  const addColumnIfNotExists = async (table: string, column: string, type: string) => {
    try {
      const exists = await columnExists(table, column);
      if (!exists) {
        console.log(`Adding column ${column} to ${table}`);
        
        // Use RPC to execute SQL (safer than raw SQL)
        const { error } = await supabase.rpc('execute_sql', { 
          sql_query: `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${column} ${type};` 
        });
        
        if (error) {
          throw error;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error adding column ${column} to ${table}:`, error);
      return false;
    }
  };

  useEffect(() => {
    const setupStorage = async () => {
      try {
        // Add availability column to products table if it doesn't exist
        await addColumnIfNotExists('products', 'availability', "TEXT NOT NULL DEFAULT 'available'");
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
