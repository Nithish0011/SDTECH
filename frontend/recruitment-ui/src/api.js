const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8787";

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/api/jobs`);
  return res.json();
}

export async function fetchJob(id) {
  const res = await fetch(`${API_BASE}/api/jobs/${id}`);
  return res.json();
}

export async function applyToJob(jobId, formData) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/apply`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function createJob(data) {
  const res = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchApplications(jobId) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}/applications`);
  return res.json();
}
