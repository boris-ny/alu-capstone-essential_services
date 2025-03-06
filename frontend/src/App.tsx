import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Register from './register';
import Home from './Home';
import './App.css';
import SearchResults from './searchresults';
import BusinessDetails from './businessdetails';
import { AuthProvider } from './contexts/AuthContext';
import BusinessProfile from './Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import Categories from './Categories';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
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
