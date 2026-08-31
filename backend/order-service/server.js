/**
 * server.js — order-service entrypoint.
 */

const express = require("express");
const cors = require("cors");
const ordersRouter = require("./src/routes/orders");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

app.use("/api/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`order-service listening on port ${PORT}`);
});
