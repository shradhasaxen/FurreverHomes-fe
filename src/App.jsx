import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Chatbot from './components/Chatbot'
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
import usePageTitle from './hooks/usePageTitle'

function TitleManager() {
  usePageTitle()
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <TitleManager />
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/adopt"     element={<AdoptPet />} />
        <Route path="/add-pet"   element={<AddPet />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/blog"      element={<Blog />} />
        <Route path="/shopping"  element={<Shopping />} />
        <Route path="/payment"   element={<Payment />} />
        <Route path="/grooming"  element={<PetGroom />} />
        <Route path="/pet-house" element={<PetHouse />} />
        <Route path="/book-pet"  element={<BookPet />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  )
}
