import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJobs } from "../api";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading jobs...</p>;

  if (jobs.length === 0) {
    return (
      <div className="empty">
        <h2>No openings right now</h2>
        <p>Check back soon for new opportunities.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <Link to={`/jobs/${job.id}`} key={job.id} className="job-card">
          <h3>{job.title}</h3>
          <p className="meta">
            {job.company} &middot; {job.location}
          </p>
          {job.description && <p className="desc">{job.description}</p>}
        </Link>
      ))}
    </div>
  );
}
