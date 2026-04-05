import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchJob, applyToJob } from "../api";

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // "success" | "error" | null
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJob(id)
      .then(setJob)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const formData = new FormData(e.target);
    try {
      const res = await applyToJob(id, formData);
      if (res.success) {
        setStatus("success");
        e.target.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="loading">Loading...</p>;
  if (!job || job.error) return <p className="error">Job not found.</p>;

  return (
    <div className="job-detail">
      <Link to="/" className="back">&larr; All Jobs</Link>
      <h2>{job.title}</h2>
      <p className="meta">{job.company} &middot; {job.location}</p>
      {job.description && <p className="description">{job.description}</p>}

      <hr />

      <h3>Apply for this position</h3>

      {status === "success" && (
        <p className="msg success">Application submitted. Good luck!</p>
      )}
      {status === "error" && (
        <p className="msg error">Something went wrong. Please try again.</p>
      )}

      <form onSubmit={handleSubmit} className="apply-form">
        <label>
          Full Name *
          <input type="text" name="name" required />
        </label>
        <label>
          Email *
          <input type="email" name="email" required />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" />
        </label>
        <label>
          Resume (PDF) *
          <input type="file" name="resume" accept=".pdf,.doc,.docx" required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
