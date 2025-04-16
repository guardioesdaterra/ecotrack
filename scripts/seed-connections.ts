import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ycttxorvsijgagobvqiq.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdHR4b3J2c2lqZ2Fnb2J2cWlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDQ2NzY5MSwiZXhwIjoyMDYwMDQzNjkxfQ._OrYexaXHU9jeT6ZV_QM2pCFoRLbJ8ptWTyhShZeC8k";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  // Get all activities to map mock IDs to real IDs
  const { data: activities, error: activitiesError } = await supabase
    .from('activities')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(10); // Get the 10 most recent activities (our mock data)

  if (activitiesError) {
    console.error('Error fetching activities:', activitiesError);
    return;
  }

  // Original mock connections (using positions 0-9 from the activities array)
  const mockConnections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 9 },
    { from: 9, to: 0 },
    { from: 0, to: 4 },
    { from: 1, to: 6 },
    { from: 2, to: 8 },
    { from: 3, to: 9 }
  ];

  // Convert to real connections using activity IDs
  const connections = mockConnections.map(conn => ({
    from_activity_id: activities[conn.from].id,
    to_activity_id: activities[conn.to].id
  }));

  // Insert connections
  const { error } = await supabase.from('connections').insert(connections);
  if (error) {
    console.error('Error inserting connections:', error);
  } else {
    console.log('Seeded connections successfully');
  }
}

main();
