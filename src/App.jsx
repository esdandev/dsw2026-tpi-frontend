import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthProvider';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import { ROLES } from './modules/auth/constants';

// Auth Module
import AdminLoginPage from './modules/auth/pages/AdminLoginPage';

// Patients Module
import PatientLoginPage from './modules/patients/pages/PatientLoginPage';
import PatientLayout from './modules/patients/components/PatientLayout';
import PatientHome from './modules/patients/pages/PatientHome';
import AppointmentsPage from './modules/patients/pages/AppointmentsPage';

// Dashboard Module
import DashboardLayout from './modules/dashboard/components/DashboardLayout';
import OverviewPage from './modules/dashboard/pages/OverviewPage';

// Domain Modules (Screaming Architecture)
import DoctorsPage from './modules/doctors/pages/DoctorsPage';
import DoctorAvailabilityPage from './modules/doctors/pages/DoctorAvailabilityPage';
import DoctorCreatePage from './modules/doctors/pages/DoctorCreatePage';
import DoctorEditPage from './modules/doctors/pages/DoctorEditPage';
import SpecialtyCreatePage from './modules/specialties/pages/SpecialtyCreatePage';
import SpecialtyEditPage from './modules/specialties/pages/SpecialtyEditPage';
import SpecialtiesPage from './modules/specialties/pages/SpecialtiesPage';
import AppointmentsSearchPage from './modules/appointments/pages/AppointmentsSearchPage';
import AccessDeniedNotice from './modules/shared/components/AccessDeniedNotice';

const routes = [
  // Rutas públicas
  {
    path: '/login',
    element: <PatientLoginPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },

  // Rutas privadas de pacientes (URL base y turnos)
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.PATIENT]} redirectTo="/login">
        <PatientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <PatientHome />,
      },
      {
        path: 'appointments',
        element: <AppointmentsPage />,
      },
    ],
  },

  // Rutas privadas de gestión clínica y administración
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/admin/login">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/home" replace />,
      },
      {
        path: 'home',
        element: <OverviewPage />,
      },
      {
        path: 'patients',
        element: <AppointmentsSearchPage />,
      },
      {
        path: 'appointments',
        element: <Navigate to="/admin/patients" replace />,
      },
      {
        path: 'specialties',
        element: <SpecialtiesPage />,
      },
      { path: 'specialties/new', element: <SpecialtyCreatePage /> },
      { path: 'specialties/:id/edit', element: <SpecialtyEditPage /> },
      {
        path: 'doctors',
        element: <DoctorsPage />,
      },
      {
        path: 'doctors/new',
        element: <DoctorCreatePage />,
      },
      {
        path: 'doctors/:id/edit',
        element: <DoctorEditPage />,
      },
      {
        path: 'doctors/:id/availability',
        element: <DoctorAvailabilityPage />,
      },
    ],
  },

  // Redirección para cualquier otra URL
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

function App() {
  const router = createBrowserRouter(routes);

  return (
    <AuthProvider>
      <AccessDeniedNotice />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
