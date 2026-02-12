import ProfilePage from './pages/ProfilePage'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetail from './pages/BookingDetail'
import ModifyBooking from './pages/ModifyBooking'
import ExtendBooking from './pages/ExtendBooking'
import AssistanceButton from './components/AssistanceButton'

function App() {
  const [customer, setCustomer] = useState<{
    id: string; firstName: string; lastName: string; email: string
  } | null>(null)

  const handleLogout = () => setCustomer(null)

  return (
    <BrowserRouter>
      <Routes>
        {!customer ? (
          <Route path="*" element={<LoginPage onLogin={setCustomer} />} />
        ) : (
          <>
            <Route path="/reservas" element={<BookingsPage customer={customer} onLogout={handleLogout} />} />
            <Route path="/reservas/:id" element={<BookingDetail customer={customer} onLogout={handleLogout} />} />
            <Route path="/reservas/:id/modificar" element={<ModifyBooking customer={customer} onLogout={handleLogout} />} />
            <Route path="/reservas/:id/prolongar" element={<ExtendBooking customer={customer} onLogout={handleLogout} />} />
            <Route path="/perfil" element={<ProfilePage customer={customer} onLogout={handleLogout} />} />
            <Route path="*" element={<Navigate to="/reservas" />} />
          </>
        )}
      </Routes>
      {customer && (
        <AssistanceButton
          customerName={`${customer.firstName} ${customer.lastName}`}
          customerEmail={customer.email}
        />
      )}
    </BrowserRouter>
  )
}

export default App