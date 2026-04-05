import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import AdminJobs from "./pages/AdminJobs";
import Applications from "./pages/Applications";
import "./App.css";

function Nav() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header>
      <h1><a href="/">Job Openings</a></h1>
      <nav>
        <Link to="/" className={!isAdmin ? "active" : ""}>Jobs</Link>
        <Link to="/admin" className={isAdmin ? "active" : ""}>Admin</Link>
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/admin" element={<AdminJobs />} />
          <Route path="/admin/jobs/:id/applications" element={<Applications />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
