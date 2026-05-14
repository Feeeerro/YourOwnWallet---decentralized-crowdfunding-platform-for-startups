import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StartupList from './pages/StartupList';
import StartupDetail from './pages/StartupDetail';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import MyAccount from './pages/MyAccount';

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/login"         element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/startups"      element={<StartupList />} />
                <Route path="/startups/:id"  element={<StartupDetail />} />
                <Route path="/campaigns"     element={<CampaignList />} />
                <Route path="/campaigns/:id" element={<CampaignDetail />} />
                <Route path="/account" element={
                    <ProtectedRoute>
                        <MyAccount />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}