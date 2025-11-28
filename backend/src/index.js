import express from "express";
import cors from "cors";
import gameRoutes from "./Routes/gameRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/games", gameRoutes);

app.get("/", (req, res) => {
  res.json({ message: "GameFlow API is running!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
