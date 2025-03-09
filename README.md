# Essential Services

A comprehensive platform connecting residents of Kigali with essential services in their area. This application allows users to search for, discover, and review various businesses and service providers across different categories.

## Project Overview

Essential Services is a web-based application that serves as a directory and discovery platform for essential services in Kigali, Rwanda. The platform enables:

- Businesses to register and showcase their services
- Users to search for services by category or keyword
- View detailed information about service providers
- Access location-based service recommendations
- Leave ratings and feedback for businesses
- Business owners to manage their profiles

## Features

- **User-friendly Search**: Quickly find services with advanced filtering options
- **Business Profiles**: Detailed pages with service descriptions, contact information, and business hours
- **Interactive Maps**: Location-based service discovery with Google Maps integration
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Business Registration**: Easy sign-up process for service providers
- **Feedback System**: Rating and review capabilities for community-driven quality assessment

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, React Router
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Maps**: Google Maps API

## Running the Project Locally

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Google Maps API key (for location features)

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd alu-capstone-essential_services/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/essential_services?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   PORT=3000
   ```

4. Set up the database and run migrations:

   ```bash
   npm run prisma:migrate
   ```

5. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

The backend server will start on <http://localhost:3000>

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd alu-capstone-essential_services/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with:

   ```env
   VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
   VITE_GOOGLE_MAPS_ID="your_google_maps_id"
   VITE_API_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The frontend development server will start on <http://localhost:5173> (or another port if 5173 is in use)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
