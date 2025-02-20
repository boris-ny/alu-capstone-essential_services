import express, { Request, Response } from 'express';
import cors from 'cors';
import * as businessController from './controllers/businessController';
import * as categoryController from './controllers/categoryConroller';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

//Login route
app.post('/login', businessController.loginBusiness);

// Business routes
app.post('/businesses', businessController.createBusiness);
app.get('/businesses', businessController.getAllBusinesses);
app.get('/businesses/:id', businessController.getBusinessById);
app.put('/businesses/:id', businessController.updateBusiness);
app.delete('/businesses/:id', businessController.deleteBusiness);
app.get('/businesses/search', businessController.searchBusinesses);

// Category routes
app.post('/categories', categoryController.createCategory);
app.get('/categories', categoryController.getAllCategories);
app.get('/categories/:id', categoryController.getCategoryById);
app.put('/categories/:id', categoryController.updateCategory);
app.delete('/categories/:id', categoryController.deleteCategory);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});