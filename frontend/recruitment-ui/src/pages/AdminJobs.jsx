import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJobs, createJob } from "../api";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", location: "", description: "" });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createJob(form);
      if (res.success) {
        setForm({ title: "", company: "", location: "", description: "" });
        setShowForm(false);
        loadJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="admin">
      <div className="admin-header">
        <h2>Manage Jobs</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Post New Job"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <label>
            Job Title *
            <input name="title" value={form.title} onChange={handleChange} required />
          </label>
          <label>
            Company *
            <input name="company" value={form.company} onChange={handleChange} required />
          </label>
          <label>
            Location *
            <input name="location" value={form.location} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </label>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Posting..." : "Post Job"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="empty">No jobs posted yet.</p>
      ) : (
        <div className="admin-job-list">
          {jobs.map((job) => (
            <div key={job.id} className="admin-job-card">
              <div>
                <h3>{job.title}</h3>
                <p className="meta">{job.company} &middot; {job.location}</p>
              </div>
              <Link to={`/admin/jobs/${job.id}/applications`} className="btn-secondary">
                View Applications
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
