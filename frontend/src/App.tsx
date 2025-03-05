import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Login from './login';
import Register from './register';
import Home from './Home';
import './App.css';
import SearchResults from './searchresults';
import BusinessDetails from './businessdetails';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth'; // You'll need to import your auth hook
import BusinessProfile from './Profile';

// Create a ProtectedRoute component
const ProtectedRoute = ({ children }: { children: TSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/business/:id" element={<BusinessDetails />} />
          {/* Add the profile route with protection */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <BusinessProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
