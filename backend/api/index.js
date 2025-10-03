const express = require("express");
const cors = require("cors");

const app = express();

// السماح للفرونت إند + أي دومين للتجربة
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://angular-node-ecommerce-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// معالجة preflight requests
app.options("*", cors());

// Middlewares
app.use(express.json());

// Routes
// const userRoutes = require('../src/routes/userProfile');
//  // ركوير بدل امبورت
// app.use("/users", userRoutes);

// مثال Route رئيسي
app.get("/", (req, res) => {
  res.json({ message: "API is running with CORS enabled 🚀" });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;

