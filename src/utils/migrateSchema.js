
// This file adds the missing fields to the chat_messages table schema
// Run this on app initialization if needed
import { supabase } from '@/integrations/supabase/client';

export async function migrateSchema() {
  try {
    // Check if the chat_messages table has the sender_name, sender_role, and receiver_name fields
    const { data: columns } = await supabase
      .from('_metadata')
      .select('columns')
      .eq('table', 'chat_messages')
      .single();
    
    // If the fields don't exist, add them
    const missingColumns = [];
    if (!columns.includes('sender_name')) missingColumns.push('sender_name');
    if (!columns.includes('sender_role')) missingColumns.push('sender_role');
    if (!columns.includes('receiver_name')) missingColumns.push('receiver_name');
    
    if (missingColumns.length > 0) {
      // Add the missing columns
      for (const column of missingColumns) {
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'chat_messages',
          column_name: column, 
          column_type: 'text'
        });
      }
      console.log('Schema migration completed');
    }
  } catch (error) {
    console.error('Error migrating schema:', error);
  }
}
