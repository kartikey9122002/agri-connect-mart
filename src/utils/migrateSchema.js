
// This file adds the missing fields to the chat_messages table schema
// Run this on app initialization if needed
import { supabase } from '@/integrations/supabase/client';

export async function migrateSchema() {
  try {
    console.log('Starting schema migration check...');
    
    // Check if the chat_messages table exists and has all required fields
    const { data: columnsCheck, error: columnsError } = await supabase
      .from('chat_messages')
      .select('id, sender_name, sender_role, receiver_name, thread_id')
      .limit(1);
    
    if (columnsError) {
      console.error('Error checking chat_messages table:', columnsError);
      
      // Try to add missing columns if they don't exist
      if (columnsError.message.includes("does not exist")) {
        console.log('Attempting to add missing columns to chat_messages table...');
        
        // Add sender_name if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'chat_messages',
          column_name: 'sender_name',
          column_type: 'text'
        }).catch(e => console.log('Error adding sender_name column:', e));
        
        // Add sender_role if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'chat_messages',
          column_name: 'sender_role',
          column_type: 'text'
        }).catch(e => console.log('Error adding sender_role column:', e));
        
        // Add receiver_name if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'chat_messages',
          column_name: 'receiver_name',
          column_type: 'text'
        }).catch(e => console.log('Error adding receiver_name column:', e));
      }
    }
    
    // Check if profiles table has required fields
    const { data: profileColumns, error: profileError } = await supabase
      .from('profiles')
      .select('is_blocked, email, created_at, full_name, role')
      .limit(1);
      
    if (profileError) {
      console.error('Error checking profiles table:', profileError);
      
      if (profileError.message.includes("does not exist")) {
        console.log('Attempting to add missing columns to profiles table...');
        
        // Add is_blocked if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'profiles',
          column_name: 'is_blocked',
          column_type: 'boolean',
          default_value: 'false'
        }).catch(e => console.log('Error adding is_blocked column:', e));
        
        // Add email if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'profiles',
          column_name: 'email',
          column_type: 'text'
        }).catch(e => console.log('Error adding email column:', e));
        
        // Add created_at if it doesn't exist
        await supabase.rpc('add_column_if_not_exists', {
          table_name: 'profiles',
          column_name: 'created_at',
          column_type: 'timestamp with time zone',
          default_value: 'now()'
        }).catch(e => console.log('Error adding created_at column:', e));
      }
    }
    
    console.log('Schema check completed');
    console.log('Chat message columns found:', columnsCheck);
    console.log('Profile columns found:', profileColumns);
  } catch (error) {
    console.error('Error in schema migration:', error);
  }
}
