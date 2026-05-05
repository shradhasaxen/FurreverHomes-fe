import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
import usePageTitle from './hooks/usePageTitle'

// Public pages
import Home from './pages/Home'
import AdoptPet from './pages/AdoptPet'
import AddPet from './pages/AddPet'
import Signup from './pages/Signup'
import Blog from './pages/Blog'
import Shopping from './pages/Shopping'
import Payment from './pages/Payment'
import PetGroom from './pages/PetGroom'
import PetHouse from './pages/PetHouse'
import BookPet from './pages/BookPet'
import NotFound from './pages/NotFound'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminBookings from './pages/admin/AdminBookings'
import AdminAdoptions from './pages/admin/AdminAdoptions'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import MyPets from './pages/dashboard/MyPets'
import Orders from './pages/dashboard/Orders'
import Bookings from './pages/dashboard/Bookings'
import Adoptions from './pages/dashboard/Adoptions'
import Profile from './pages/dashboard/Profile'

function TitleManager() {
  usePageTitle()
  return null
}

// Layout wrapper for public pages (with Navbar + Chatbot)
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Chatbot />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TitleManager />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/adopt" element={<PublicLayout><AdoptPet /></PublicLayout>} />
          <Route path="/add-pet" element={<PublicLayout><AddPet /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Signup /></PublicLayout>} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/shopping" element={<PublicLayout><Shopping /></PublicLayout>} />
          <Route path="/grooming" element={<PublicLayout><PetGroom /></PublicLayout>} />
          <Route path="/pet-house" element={<PublicLayout><PetHouse /></PublicLayout>} />
          <Route path="/book-pet" element={<PublicLayout><BookPet /></PublicLayout>} />

          {/* Protected: Payment requires login */}
          <Route path="/payment" element={
            <ProtectedRoute>
              <PublicLayout><Payment /></PublicLayout>
            </ProtectedRoute>
          } />

          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="my-pets" element={<MyPets />} />
            <Route path="orders" element={<Orders />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="adoptions" element={<Adoptions />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="adoptions" element={<AdminAdoptions />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
