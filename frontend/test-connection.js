const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://cqykdjrazqsirctedjfp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxeWtkanJhenFzaXJjdGVkamZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0NjM1MTQsImV4cCI6MjA2NjAzOTUxNH0.HURay-Wo8XrHb4pF1pfcS0g56LoQmDxpntgdTPoZ8uQ";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log("Attempting to connect to Supabase and fetch organizations...");

  try {
    const { data, error } = await supabase.from("organizations").select("name");

    if (error) {
      console.error("An error occurred:", error);
    } else {
      console.log("Successfully connected and fetched data:");
      console.log(data);
    }
  } catch (e) {
    console.error("A critical exception occurred:", e);
  } finally {
    console.log("Test finished.");
  }
}

testConnection();
