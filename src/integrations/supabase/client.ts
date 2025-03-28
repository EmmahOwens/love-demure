
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bjhpsgnovsumyvkrglgz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaHBzZ25vdnN1bXl2a3JnbGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NDc3NjAsImV4cCI6MjA1NjQyMzc2MH0.npoPPpae7MdpP_kKl37Mec7rnBkSsb7zUVYcIHh_4ZY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Ensure the memories bucket exists and is properly configured
export const ensureMemoriesBucket = async () => {
  try {
    // Check if the memories bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'memories');
    
    if (!bucketExists) {
      console.log("Creating 'memories' bucket...");
      const { error } = await supabase.storage.createBucket('memories', {
        public: true
      });
      
      if (error) {
        console.error("Error creating memories bucket:", error);
        return false;
      }
      
      console.log("Successfully created 'memories' bucket");
    }
    
    // Always update the bucket to ensure it's public
    const { error: updateError } = await supabase.storage.updateBucket('memories', {
      public: true,
      fileSizeLimit: 10485760 // 10MB limit
    });
    
    if (updateError) {
      console.error("Error updating bucket settings:", updateError);
      return false;
    } else {
      console.log("Memories bucket is confirmed public with 10MB limit");
      return true;
    }
  } catch (error) {
    console.error("Error managing memories bucket:", error);
    return false;
  }
};

// Initialize the bucket when the client is loaded
ensureMemoriesBucket();
