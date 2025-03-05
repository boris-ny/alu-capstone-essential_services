import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as businessController from "./controllers/businessController";
import * as categoryController from "./controllers/categoryConroller";
import { authMiddleware, ownerMiddleware } from './middleware/auth';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins (temporary fix)
  credentials: true
}));

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

// Login route
app.post("/login", (req: Request, res: Response, next: NextFunction) => {
  businessController.loginBusiness(req, res, next);
});

// Business routes
app.post("/businesses", (req: Request, res: Response) => {
  businessController.createBusiness(req, res);
});

app.get("/businesses", (req: Request, res: Response) => {
  businessController.getAllBusinesses(req, res);
});

// Important: Search route MUST come before the :id route
app.get("/businesses/search", (req: Request, res: Response, next: NextFunction) => {
  businessController.searchBusinesses(req, res, next);
});

app.get("/businesses/:id", (req: Request, res: Response) => {
  businessController.getBusinessById(req, res);
});

app.put(
  "/businesses/:id",
  authMiddleware,
  ownerMiddleware,
  (req: Request, res: Response) => {
    businessController.updateBusiness(req, res);
  }
);

app.delete("/businesses/:id", (req: Request, res: Response) => {
  businessController.deleteBusiness(req, res);
});

// Category routes
app.post("/categories", categoryController.createCategory);
app.get("/categories", categoryController.getAllCategories);
app.get("/categories/:id", categoryController.getCategoryById);
app.put("/categories/:id", categoryController.updateCategory);
app.delete("/categories/:id", categoryController.deleteCategory);

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}