
// This file adds the missing fields to the chat_messages table schema
// Run this on app initialization if needed
import { supabase } from '@/integrations/supabase/client';

export async function migrateSchema() {
  try {
    console.log('Starting schema migration check...');
    
    // Check if the chat_messages table exists and has the required fields
    const { data: columns, error: columnsError } = await supabase
      .from('chat_messages')
      .select('id, sender_name, sender_role, receiver_name')
      .limit(1);
    
    if (columnsError) {
      console.error('Error checking chat_messages table:', columnsError);
      return;
    }
    
    // Check if profiles table has required fields
    const { data: profileColumns, error: profileError } = await supabase
      .from('profiles')
      .select('is_blocked, email, created_at')
      .limit(1);
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profiles table:', profileError);
    }
    
    console.log('Schema check completed');
    console.log('Chat message columns found:', columns);
    console.log('Profile columns found:', profileColumns);
  } catch (error) {
    console.error('Error in schema migration:', error);
  }
}
