import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import Home from './Home';
import './App.css';
import SearchResults from './searchresults';
import BusinessDetails from './businessdetails';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
