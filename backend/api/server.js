const app = require('./app');  
const dotenv = require('dotenv');

dotenv.config();

app.use(cors({
  origin: [
    "http://localhost:4200",
    "https://frontend-noura-samirs-projects.vercel.app"
  ],
  credentials: false,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));
app.options("*", cors());
///////

app.use(cors());


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
