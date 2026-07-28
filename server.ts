import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";

let cca: ConfidentialClientApplication | null = null;

function getMsalClient() {
  if (!cca) {
    if (!process.env.MS_GRAPH_CLIENT_SECRET) {
      throw new Error("MS_GRAPH_CLIENT_SECRET environment variable is not set.");
    }
    const msalConfig: Configuration = {
      auth: {
        clientId: "1b3a49ac-4de8-4637-894c-d66b6209e935",
        authority: "https://login.microsoftonline.com/77c7033c-3f2c-4f86-8479-1d015042233f",
        clientSecret: process.env.MS_GRAPH_CLIENT_SECRET,
      },
    };
    cca = new ConfidentialClientApplication(msalConfig);
  }
  return cca;
}

async function getToken() {
  const client = getMsalClient();
  const tokenRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const response = await client.acquireTokenByClientCredential(tokenRequest);
    return response?.accessToken;
  } catch (error) {
    console.error("Error acquiring token", error);
    throw error;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for MS Graph Integration

  // Get Room Availability (Free/Busy)
  app.get("/api/graph/rooms/:roomId/availability", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { startTime, endTime } = req.query; // Expecting ISO strings
      
      const token = await getToken();
      if (!token) return res.status(500).json({ error: "Failed to acquire token" });

      const requestBody = {
        schedules: [roomId],
        startTime: {
          dateTime: startTime as string,
          timeZone: "Central Standard Time"
        },
        endTime: {
          dateTime: endTime as string,
          timeZone: "Central Standard Time"
        },
        availabilityViewInterval: 30
      };

      const response = await fetch("https://graph.microsoft.com/v1.0/users/visixtestA@capitol.tn.gov/calendar/getSchedule", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": 'outlook.timezone="Central Standard Time"'
        },
        body: JSON.stringify({ ...requestBody, schedules: [roomId] }) // Ensure using the requested room SMTP
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "Graph API Error", details: errorText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Room Bookings (Calendar View)
  app.get("/api/graph/rooms/:roomId/events", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { startTime, endTime } = req.query; 

      const token = await getToken();
      if (!token) return res.status(500).json({ error: "Failed to acquire token" });

      const url = new URL(`https://graph.microsoft.com/v1.0/users/${roomId}/calendarView`);
      if (startTime) url.searchParams.append("startDateTime", startTime as string);
      if (endTime) url.searchParams.append("endDateTime", endTime as string);
      url.searchParams.append("$select", "subject,organizer,start,end,isCancelled,showAs");
      url.searchParams.append("$orderby", "start/dateTime");

      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Prefer": 'outlook.timezone="Central Standard Time"'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "Graph API Error", details: errorText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create Booking
  app.post("/api/graph/rooms/:roomId/events", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { subject, start, end } = req.body; 

      const token = await getToken();
      if (!token) return res.status(500).json({ error: "Failed to acquire token" });

      const requestBody = {
        subject,
        start: { dateTime: start, timeZone: "Central Standard Time" },
        end: { dateTime: end, timeZone: "Central Standard Time" }
      };

      const response = await fetch(`https://graph.microsoft.com/v1.0/users/${roomId}/events`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: "Graph API Error", details: errorText });
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
