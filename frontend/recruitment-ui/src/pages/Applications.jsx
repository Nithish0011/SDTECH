import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchJob, fetchApplications } from "../api";

export default function Applications() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchJob(id), fetchApplications(id)])
      .then(([jobData, appsData]) => {
        setJob(jobData);
        setApps(appsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading...</p>;
  if (!job || job.error) return <p className="error">Job not found.</p>;

  return (
    <div className="applications">
      <Link to="/admin" className="back">&larr; Back to Jobs</Link>
      <h2>Applications for: {job.title}</h2>
      <p className="meta">{job.company} &middot; {job.location}</p>

      {apps.length === 0 ? (
        <p className="empty">No applications yet.</p>
      ) : (
        <div className="app-list">
          {apps.map((app) => (
            <div key={app.id} className="app-card">
              <div className="app-info">
                <h4>{app.name}</h4>
                <p>{app.email}{app.phone ? ` · ${app.phone}` : ""}</p>
                <p className="meta">Applied {new Date(app.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
