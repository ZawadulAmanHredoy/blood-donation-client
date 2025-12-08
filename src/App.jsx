// client/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardHome from "./pages/DashboardHome.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

import CreateDonationRequest from "./pages/CreateDonationRequest.jsx";
import MyDonationRequests from "./pages/MyDonationRequests.jsx";
import DonationRequestDetails from "./pages/DonationRequestDetails.jsx";
import SearchDonors from "./pages/SearchDonors.jsx";
import PendingRequestsPublic from "./pages/PendingRequestsPublic.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminRequests from "./pages/AdminRequests.jsx";
import VolunteerRequests from "./pages/VolunteerRequests.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FundingPage from "./pages/FundingPage.jsx";

import Navbar from "./components/Navbar.jsx";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search-donors" element={<SearchDonors />} />
        <Route path="/donation-requests" element={<PendingRequestsPublic />} />

        {/* Dashboard (protected) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* /dashboard */}
          <Route index element={<DashboardHome />} />

          {/* Profile & funding */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="funding" element={<FundingPage />} />

          {/* Donor/common */}
          <Route
            path="create-donation-request"
            element={<CreateDonationRequest />}
          />
          <Route
            path="my-donation-requests"
            element={<MyDonationRequests />}
          />
          <Route path="requests/:id" element={<DonationRequestDetails />} />

          {/* Volunteer */}
          <Route path="volunteer/requests" element={<VolunteerRequests />} />

          {/* Admin */}
          <Route path="admin/users" element={<AdminUsers />} />
          <Route path="admin/requests" element={<AdminRequests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
