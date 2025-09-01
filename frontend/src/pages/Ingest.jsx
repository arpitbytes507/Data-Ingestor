// src/pages/Ingest.jsx
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../supaBase/supaBaseclient";
import { useNavigate } from "react-router-dom";

const API_URL = " https://data-ingestor-1.onrender.com";

export default function Ingest() {
  const [docs, setDocs] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const inputRef = useRef();
  const navigate = useNavigate();

  // 📥 Fetch all docs from Supabase
  const fetchDocs = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setDocs(data);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // 📤 Submit to API + Save to Supabase
  const onSubmit = async () => {
    setLoading(true);
    setResp(null);
    try {
      const fd = new FormData();
      if (text && !file) fd.append("text", text);
      if (file) fd.append("file", file);

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setResp({ error: "No valid session. Please log in again." });
        setLoading(false);
        return;
      }

      const r = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });

      const j = await r.json();
      setResp(j);

      // ✅ Save structured output into Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("documents").insert([
        {
          user_id: user.id,
          title: file ? file.name : "Text Input",
          content: JSON.stringify(j),
        },
      ]);

      if (error) {
        console.error("Error saving document:", error.message);
      } else {
        fetchDocs(); // refresh document list
      }
    } catch (err) {
      setResp({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete document
  const deleteDoc = async (id) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (!error) fetchDocs();
  };

  // ⬇️ Download JSON file
  const downloadDoc = (doc) => {
    const blob = new Blob([doc.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title || "document"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-800 to-pink-700 flex flex-col">
      
      <header className="flex justify-between items-center p-6 text-white">
        <h1 className="text-2xl font-bold">Data Management</h1>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start px-4 py-8">
        {/* Main card */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white mb-10">
          <h2 className="text-3xl font-bold mb-6 text-center">Convert Data</h2>

          <textarea
            rows={6}
            className="w-full p-4 mb-4 rounded-lg bg-white/10 border border-white/20 placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Paste your unstructured text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) setFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-400 rounded-lg p-6 mb-4 text-center cursor-pointer hover:border-yellow-300 transition"
          >
            <p className="mb-2 text-gray-200">
              Drag & drop a file here, or click to select
            </p>
            <input
              type="file"
              ref={inputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block mx-auto"
            />
            {file && (
              <p className="mt-2 text-yellow-300">Selected: {file.name}</p>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={loading || (!text && !file)}
            className="w-full bg-yellow-400 text-purple-700 font-bold py-3 rounded-lg shadow hover:bg-yellow-300 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Processing…" : "Submit"}
          </button>

          {resp && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Structured Output</h3>
              {resp.error ? (
                <p className="text-red-400">Error: {resp.error}</p>
              ) : (
                <pre className="bg-black/60 p-4 rounded-lg overflow-x-auto text-green-300 font-mono text-sm whitespace-pre-wrap">
                  {JSON.stringify(resp, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* 📚 Documents List */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl shadow-xl p-6 w-full max-w-4xl text-white">
          <h2 className="text-2xl font-bold mb-4">Saved Documents</h2>
          {docs.length === 0 ? (
            <p className="text-gray-300">No documents yet. Submit one above.</p>
          ) : (
            <ul className="space-y-4">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="p-4 bg-white/10 rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <p className="text-xs text-gray-300">
                      {new Date(doc.created_at).toLocaleString()}
                    </p>
                    <pre className="mt-2 bg-black/40 p-2 rounded text-sm text-green-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(doc.content), null, 2)}
                    </pre>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="bg-yellow-400 text-purple-700 px-3 py-1 rounded hover:bg-yellow-300"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => deleteDoc(doc.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-400"
                    >
                      ❌ Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Documents History */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">My Documents</h3>
          {docs.length === 0 ? (
            <p className="text-gray-300">No documents yet.</p>
          ) : (
            <ul className="space-y-3">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="bg-white/10 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-yellow-300">
                      {doc.title || "Untitled"}
                    </p>
                    <p className="text-sm text-gray-300">
                      {new Date(doc.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setText(doc.content); // Load into textarea
                        setTitle(doc.title || "");
                        setFile(null);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await supabase
                          .from("documents")
                          .delete()
                          .eq("id", doc.id);
                        fetchDocs();
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
