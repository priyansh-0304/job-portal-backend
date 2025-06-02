import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import jobsRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import seekerRoutes from "./routes/seekerRoutes.js";
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'https://job-portal-frontend-rb5jzidyq-priyansh-0304s-projects.vercel.app',
  credentials: true,
}));

app.use((req, res, next) => {
  //res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Update with your frontend URL
  res.header('Access-Control-Allow-Origin', 'https://job-portal-frontend-rb5jzidyq-priyansh-0304s-projects.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use(express.json());

app.use('/api/employer', employerRoutes);
app.use("/api/seeker", seekerRoutes);
app.use('/api/admin', adminRoutes);

// Static file setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Route registration
app.use('/api/auth', authRoutes); // <-- This line is required
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
