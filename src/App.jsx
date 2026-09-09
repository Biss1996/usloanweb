import React from 'react'
import { Routes, Route } from 'react-router-dom'

import PublicLayout from './layouts/PublicLayout.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'

import Home from './pages/Home.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import LoanOptions from './pages/LoanOptions.jsx'
import FAQ from './pages/FAQ.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Apply from './pages/Apply.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import Disclosures from './pages/Disclosures.jsx'
import ESignConsent from './pages/ESignConsent.jsx'
import ResponsibleLending from './pages/ResponsibleLending.jsx'
import NotFound from './pages/NotFound.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'
import Applications from './pages/dashboard/Applications.jsx'
import ApplicationDetail from './pages/dashboard/ApplicationDetail.jsx'
import Notifications from './pages/dashboard/Notifications.jsx'
import Profile from './pages/dashboard/Profile.jsx'

import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminApplications from './pages/admin/AdminApplications.jsx'
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminPayments from './pages/admin/AdminPayments.jsx'
import AdminPaymentLinks from './pages/admin/AdminPaymentLinks.jsx'
import AdminLoanSettings from './pages/admin/AdminLoanSettings.jsx'
import AdminStates from './pages/admin/AdminStates.jsx'
import AdminContactMessages from './pages/admin/AdminContactMessages.jsx'
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/loan-options" element={<LoanOptions />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/disclosures" element={<Disclosures />} />
        <Route path="/e-sign-consent" element={<ESignConsent />} />
        <Route path="/responsible-lending" element={<ResponsibleLending />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/applications" element={<Applications />} />
        <Route path="/dashboard/application/:id" element={<ApplicationDetail />} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
        <Route path="/dashboard/profile" element={<Profile />} />
      </Route>

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/applications" element={<AdminApplications />} />
        <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/payment-links" element={<AdminPaymentLinks />} />
        <Route path="/admin/settings/loans" element={<AdminLoanSettings />} />
        <Route path="/admin/states" element={<AdminStates />} />
        <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
