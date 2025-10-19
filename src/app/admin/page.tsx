"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Profile = {
  matric_number: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  department: string | null;
  school: string | null;
  level: string | null;
  institution_type: string | null;
  teller_number: string | null;
};

export default function AdminPage() {
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [results, setResults] = useState<Profile[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const sanitizeMatric = (m: string) => m.trim().replace(/[^a-zA-Z0-9_-]/g, "_");

  const fetchImagesForMatric = async (matricNumber: string) => {
    // Fetch receipt images from storage using search on flat keys
    const safe = sanitizeMatric(matricNumber);
    const { data: list, error: listErr } = await supabase.storage
      .from("receipts")
      .list("", { search: `${safe}-doc-` });

    if (listErr) throw listErr;

    const urls: string[] = (list || [])
      .filter((f) => f.name.startsWith(`${safe}-doc-`))
      .map((f) => supabase.storage.from("receipts").getPublicUrl(f.name).data.publicUrl);

    setImages(urls);
  };

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfile(null);
    setImages([]);
    setResults([]);
    setTotal(null);
    setPage(0);

    const raw = matric.trim();
    // If empty, we will list all with pagination

    setLoading(true);
    try {
      if (!raw) {
        // List first page of all profiles
        const from = 0;
        const to = pageSize - 1;
        const { data: profs, error: profErr, count } = await supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .order("matric_number")
          .range(from, to);

        if (profErr) throw profErr;
        setResults((profs || []) as Profile[]);
        setTotal(count ?? null);
        return;
      }

      // Search profiles by partial matric number
      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .ilike("matric_number", `%${raw}%`)
        .order("matric_number");

      if (profErr) throw profErr;
      const list = (profs || []) as Profile[];
      if (list.length === 0) {
        setError("No profiles found for this search");
        return;
      }
      if (list.length === 1) {
        const single = list[0];
        setProfile(single);
        await fetchImagesForMatric(single.matric_number);
        return;
      }
      // Multiple results
      setResults(list);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : "Failed to fetch data");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchPage = async (newPage: number) => {
    setLoading(true);
    setError(null);
    setProfile(null);
    setImages([]);
    try {
      const from = newPage * pageSize;
      const to = from + pageSize - 1;
      const { data: profs, error: profErr, count } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("matric_number")
        .range(from, to);
      if (profErr) throw profErr;
      setResults((profs || []) as Profile[]);
      setTotal(count ?? null);
      setPage(newPage);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : "Failed to fetch data");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (p: Profile) => {
    setProfile(p);
    setResults([]);
    setImages([]);
    setError(null);
    setLoading(true);
    try {
      await fetchImagesForMatric(p.matric_number);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : "Failed to fetch images");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndRole = async () => {
    setAuthChecking(true);
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("admin_session") : null;
      if (!raw) {
        setAuthorized(false);
        setRole(null);
        return;
      }
      const parsed = JSON.parse(raw) as { email: string; role: string } | null;
      if (!parsed?.email || !parsed?.role) {
        setAuthorized(false);
        setRole(null);
        return;
      }
      setAuthorized(true);
      setRole(parsed.role);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    void checkAuthAndRole();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { data: adminRow, error: selErr } = await supabase
      .from("admin_users")
      .select("email, role, active")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (selErr) {
      setError(selErr.message);
      return;
    }
    if (!adminRow || adminRow.active === false) {
      setError("Invalid credentials");
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_session", JSON.stringify({ email: adminRow.email as string, role: adminRow.role as string }));
    }
    await checkAuthAndRole();
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("admin_session");
    }
    setAuthorized(false);
    setRole(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          {authChecking ? (
            <div className="text-sm text-gray-600">Checking authorization…</div>
          ) : authorized ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Admin: Lookup by Matric Number</h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">Role: {role}</span>
                  <button onClick={handleLogout} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm">Sign out</button>
                </div>
              </div>
              <form onSubmit={fetchData} className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                  placeholder="Enter matric number"
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {loading ? "Fetching..." : "Fetch"}
                </button>
              </form>

              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
              )}

              {/* Show-all controls */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => fetchPage(0)}
                  className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Show all
                </button>
                {typeof total === "number" && (
                  <span className="text-xs text-gray-600">Total: {total}</span>
                )}
              </div>

              {results.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Profiles ({results.length}{typeof total === "number" ? ` / ${total}` : ""})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-2 border">Matric</th>
                          <th className="text-left p-2 border">Name</th>
                          <th className="text-left p-2 border">Email</th>
                          <th className="text-left p-2 border">Department</th>
                          <th className="text-left p-2 border">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => (
                          <tr key={r.matric_number} className="hover:bg-gray-50">
                            <td className="p-2 border">{r.matric_number}</td>
                            <td className="p-2 border">{r.name}</td>
                            <td className="p-2 border">{r.email}</td>
                            <td className="p-2 border">{r.department}</td>
                            <td className="p-2 border">
                              <button
                                onClick={() => handleSelectProfile(r)}
                                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {typeof total === "number" && total > pageSize && (
                    <div className="flex items-center justify-between mt-3">
                      <button
                        type="button"
                        onClick={() => fetchPage(Math.max(0, page - 1))}
                        disabled={page === 0 || loading}
                        className={`px-3 py-1 rounded text-sm ${page === 0 ? "bg-gray-200 text-gray-500" : "bg-gray-100 hover:bg-gray-200"}`}
                      >
                        Previous
                      </button>
                      <span className="text-xs text-gray-600">Page {page + 1} of {Math.ceil(total / pageSize)}</span>
                      <button
                        type="button"
                        onClick={() => fetchPage(Math.min(page + 1, Math.ceil(total! / pageSize) - 1))}
                        disabled={page >= Math.ceil(total / pageSize) - 1 || loading}
                        className={`px-3 py-1 rounded text-sm ${page >= Math.ceil(total / pageSize) - 1 ? "bg-gray-200 text-gray-500" : "bg-gray-100 hover:bg-gray-200"}`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {profile && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Profile Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">Matric:</span> {profile.matric_number}</div>
                    <div><span className="font-medium">Name:</span> {profile.name}</div>
                    <div><span className="font-medium">First Name:</span> {profile.first_name}</div>
                    <div><span className="font-medium">Last Name:</span> {profile.last_name}</div>
                    <div><span className="font-medium">Email:</span> {profile.email}</div>
                    <div><span className="font-medium">Institution:</span> {profile.institution_type}</div>
                    <div><span className="font-medium">School:</span> {profile.school}</div>
                    <div><span className="font-medium">Department:</span> {profile.department}</div>
                    <div><span className="font-medium">Level:</span> {profile.level}</div>
                    <div><span className="font-medium">Teller No.:</span> {profile.teller_number}</div>
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Receipt Images</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((url, i) => (
                      <div key={url} className="border rounded p-2">
                        {url.toLowerCase().endsWith(".pdf") ? (
                          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open PDF (Doc {i + 1})</a>
                        ) : (
                          <img src={url} alt={`Receipt ${i + 1}`} className="w-full h-48 object-cover rounded" />
                        )}
                        <div className="mt-2 text-xs break-all">
                          <a className="text-gray-600" href={url} target="_blank" rel="noreferrer">{url}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile && images.length === 0 && (
                <p className="text-sm text-gray-600">No receipt images found for this user.</p>
              )}
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <button type="submit" className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700">
                  Sign in
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-600">Only authorized admins can access this page.</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
