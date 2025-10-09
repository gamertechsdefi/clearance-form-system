"use client";

import { useState } from "react";
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

  const sanitizeMatric = (m: string) => m.trim().replace(/[^a-zA-Z0-9_-]/g, "_");

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setProfile(null);
    setImages([]);

    const raw = matric.trim();
    if (!raw) {
      setError("Please enter a matric number");
      return;
    }

    setLoading(true);
    try {
      // Fetch profile
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("matric_number", raw)
        .maybeSingle();

      if (profErr) throw profErr;
      if (!prof) {
        setError("No profile found for this matric number");
        return;
      }
      setProfile(prof as Profile);

      // Fetch receipt images from storage using search on flat keys
      const safe = sanitizeMatric(raw);
      const { data: list, error: listErr } = await supabase.storage
        .from("receipts")
        .list("", { search: `${safe}-doc-` });

      if (listErr) throw listErr;

      const urls: string[] = (list || [])
        .filter((f) => f.name.startsWith(`${safe}-doc-`))
        .map((f) => supabase.storage.from("receipts").getPublicUrl(f.name).data.publicUrl);

      setImages(urls);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : (typeof err === 'string' ? err : "Failed to fetch data");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Admin: Lookup by Matric Number</h1>
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
        </div>
      </section>
    </main>
  );
}
