import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import * as businessController from "./controllers/businessController";
import * as categoryController from "./controllers/categoryConroller";
import { authMiddleware, ownerMiddleware } from './middleware/auth';
import * as feedbackController from "./controllers/feedbackController";
import * as placesController from "./controllers/placesController";
import axios from "axios";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true
}));

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

// Login route
app.post("/businesses/login", (req: Request, res: Response, next: NextFunction) => {
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

// Feedback routes
app.post("/businesses/:id/feedback", (req: Request, res: Response) => {
  feedbackController.createFeedback(req, res);
});

app.get("/businesses/:id/feedback", (req: Request, res: Response) => {
  feedbackController.getFeedbackForBusiness(req, res);
});

app.put("/feedback/:id", (req: Request, res: Response) => {
  feedbackController.updateFeedback(req, res);
});

app.delete("/feedback/:id", (req: Request, res: Response) => {
  feedbackController.deleteFeedback(req, res);
});

// Places routes
app.get("/places/import", authMiddleware, (req: Request, res: Response) => {
  placesController.importBusinessesFromPlaces(req, res);
});

app.get("/places/suggestions", (req: Request, res: Response) => {
  placesController.getPlaceSuggestions(req, res);
});

// Move specific routes before parameter routes
app.get("/places/cache/clear", (req: Request, res: Response) => {
  placesController.clearPlacesCache(req, res);
});

app.get("/places/test", async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    console.log('Using API key:', apiKey ? `${apiKey.substring(0, 5)}...` : 'undefined');

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: {
        query: 'restaurant in Kigali',
        location: '-1.9441,30.0619',
        radius: 20000,
        key: apiKey
      }
    });

    console.log('Places API response status:', response.status);
    console.log('Places API results count:', response.data.results?.length || 0);

    res.json({
      status: response.data.status,
      results: response.data.results
    });
  } catch (error: any) {
    console.error('Places API test error:', error);
    res.status(500).json({
      error: 'Places API test failed',
      details: error.message,
      stack: error.stack
    });
  }
});


// Make sure this is placed AFTER any specific routes that start with /places/ but BEFORE the parameter route
app.get("/places/:placeId", (req: Request, res: Response) => {
  placesController.getPlaceDetails(req, res);
});



export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}