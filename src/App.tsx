import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import { About, Careers, Community, Contact, DemoNotice, Faq, Home, NotFound, ProgramDetail, Programs, WhoWeServe } from './pages/public'
import { StaffLayout, StaffLogin } from './employee/StaffLayout'
import Overview from './employee/Overview'
import Inbox from './employee/Inbox'
import InquiryDetail from './employee/InquiryDetail'
import Analytics from './employee/Analytics'
import Knowledge from './employee/Knowledge'
import Settings from './employee/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="programs" element={<Programs />} />
        <Route path="programs/:id" element={<ProgramDetail />} />
        <Route path="who-we-serve" element={<WhoWeServe />} />
        <Route path="community" element={<Community />} />
        <Route path="careers" element={<Careers />} />
        <Route path="contact" element={<Contact />} />
        <Route path="faq" element={<Faq />} />
        <Route path="demo-notice" element={<DemoNotice />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="staff/*" element={<Navigate to="/employee" replace />} />
      <Route path="employee" element={<StaffLogin />} />
      <Route path="employee" element={<StaffLayout />}>
        <Route path="overview" element={<Overview />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="inquiry/:id" element={<InquiryDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/employee/overview" replace />} />
      </Route>
    </Routes>
  )
}
