import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import BookingsPage from './pages/BookingsPage'
import BookingDetail from './pages/BookingDetail'
import ModifyBooking from './pages/ModifyBooking'
import ExtendBooking from './pages/ExtendBooking'
import AssistanceButton from './components/AssistanceButton'
import { mockBookings } from './mock/data'

function App() {
  const [customer, setCustomer] = useState<{
    id: string; firstName: string; lastName: string; email: string
  } | null>(null)

  const handleLogout = () => setCustomer(null)

  const getActiveBooking = () => {
    if (!customer) return null

    const inProgress = mockBookings.find(b => b.checkedIn && !b.checkedOut && b.status !== 'CANCELLED')
    if (inProgress) {
      return {
        reference: inProgress.reference,
        vehicleName: inProgress.fleetVehicle.vehicle.name.es,
        startDate: inProgress.startDate,
        endDate: inProgress.endDate,
        startTime: inProgress.startTime,
        endTime: inProgress.endTime,
      }
    }

    const upcoming = mockBookings
      .filter(b => new Date(b.startDate) >= new Date() && b.status === 'CONFIRMED')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    if (upcoming.length > 0) {
      return {
        reference: upcoming[0].reference,
        vehicleName: upcoming[0].fleetVehicle.vehicle.name.es,
        startDate: upcoming[0].startDate,
        endDate: upcoming[0].endDate,
        startTime: upcoming[0].startTime,
        endTime: upcoming[0].endTime,
      }
    }

    return null
  }

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
            <Route path="*" element={<Navigate to="/reservas" />} />
          </>
        )}
      </Routes>
      {customer && (
        <AssistanceButton
          customerName={`${customer.firstName} ${customer.lastName}`}
          customerEmail={customer.email}
          activeBooking={getActiveBooking()}
        />
      )}
    </BrowserRouter>
  )
}

export default App