import express from "express";
import { sql } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use((_request, response, next) => {
  response.header("Access-Control-Allow-Origin", "http://localhost:5173");
  response.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/health", async (_request, response) => {
  try {
    await sql`select 1 as connected`;
    response.json({ database: "connected" });
  } catch {
    response.status(500).json({ database: "unavailable" });
  }
});

app.get("/api/bookings", async (_request, response) => {
  try {
    const bookings = await sql`
      select *
      from booking
      order by date_requested desc
    `;
    response.json(bookings);
  } catch {
    response.status(500).json({ error: "Unable to load bookings" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${port}`);
});
