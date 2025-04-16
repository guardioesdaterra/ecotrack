import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ycttxorvsijgagobvqiq.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHR4b3J2c2lqZ2Fnb2J2cWlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ2NzY5MSwiZXhwIjoyMDYwMDQzNjkxfQ._OrYexaXHU9jeT6ZV_QM2pCFoRLbJ8ptWTyhShZeC8k";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const activities = [
  { lat: 40.7128, lng: -74.006, type: "reforestation", title: "NYC Urban Forest", intensity: 0.8 },
  { lat: 51.5074, lng: -0.1278, type: "cleanup", title: "Thames Cleanup", intensity: 0.6 },
  { lat: 35.6762, lng: 139.6503, type: "renewable", title: "Tokyo Solar Initiative", intensity: 0.9 },
  { lat: -33.8688, lng: 151.2093, type: "conservation", title: "Sydney Reef Protection", intensity: 0.7 },
  { lat: -1.2921, lng: 36.8219, type: "reforestation", title: "Nairobi Green Belt", intensity: 0.85 },
  { lat: 19.4326, lng: -99.1332, type: "cleanup", title: "Mexico City Air Quality", intensity: 0.75 },
  { lat: 55.7558, lng: 37.6173, type: "renewable", title: "Moscow Wind Farm", intensity: 0.65 },
  { lat: -22.9068, lng: -43.1729, type: "conservation", title: "Rio Rainforest Project", intensity: 0.9 },
  { lat: 28.6139, lng: 77.209, type: "reforestation", title: "Delhi Green Initiative", intensity: 0.7 },
  { lat: 37.7749, lng: -122.4194, type: "cleanup", title: "SF Bay Restoration", intensity: 0.8 },
];

async function main() {
  // Insert activities
  const { error } = await supabase.from("activities").insert(activities);
  if (error) {
    console.error("Error inserting activities:", error);
  } else {
    console.log("Seeded activities successfully.");
  }
}

main();
