export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      // GET /api/jobs
      if (url.pathname === "/api/jobs" && request.method === "GET") {
        return withCors(await getJobs(env));
      }

      // POST /api/jobs
      if (url.pathname === "/api/jobs" && request.method === "POST") {
        return withCors(await createJob(request, env));
      }

      // GET /api/jobs/:id
      const jobMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
      if (jobMatch && request.method === "GET") {
        return withCors(await getJob(env, jobMatch[1]));
      }

      // POST /api/jobs/:id/apply
      const applyMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)\/apply$/);
      if (applyMatch && request.method === "POST") {
        return withCors(await applyToJob(request, env, applyMatch[1]));
      }

      // GET /api/jobs/:id/applications
      const appsMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)\/applications$/);
      if (appsMatch && request.method === "GET") {
        return withCors(await getApplications(env, appsMatch[1]));
      }

      return withCors(new Response(JSON.stringify({ error: "Not Found" }), { status: 404 }));
    } catch (err) {
      return withCors(
        new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 })
      );
    }
  },
};

// --- Jobs ---

async function getJobs(env) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM jobs ORDER BY created_at DESC"
  ).all();
  return Response.json(results);
}

async function getJob(env, id) {
  const job = await env.DB.prepare("SELECT * FROM jobs WHERE id = ?").bind(id).first();
  if (!job) {
    return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
  }
  return Response.json(job);
}

async function createJob(request, env) {
  const body = await request.json();

  if (!body.title || !body.company || !body.location) {
    return new Response(
      JSON.stringify({ error: "title, company, and location are required" }),
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO jobs (id, title, company, location, description) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(id, body.title, body.company, body.location, body.description || null)
    .run();

  return Response.json({ success: true, id });
}

// --- Applications ---

async function applyToJob(request, env, jobId) {
  // Check job exists
  const job = await env.DB.prepare("SELECT id FROM jobs WHERE id = ?").bind(jobId).first();
  if (!job) {
    return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const resume = formData.get("resume");

  if (!name || !email || !resume) {
    return new Response(
      JSON.stringify({ error: "name, email, and resume are required" }),
      { status: 400 }
    );
  }

  // Upload resume to R2
  const fileExt = resume.name?.split(".").pop() || "pdf";
  const resumeKey = `resumes/${jobId}/${crypto.randomUUID()}.${fileExt}`;
  await env.BUCKET.put(resumeKey, resume.stream(), {
    httpMetadata: { contentType: resume.type },
  });

  // Save application to D1
  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO applications (id, job_id, name, email, phone, resume_url) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, jobId, name, email, phone || null, resumeKey)
    .run();

  return Response.json({ success: true, id });
}

async function getApplications(env, jobId) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC"
  )
    .bind(jobId)
    .all();
  return Response.json(results);
}

// --- CORS ---

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
