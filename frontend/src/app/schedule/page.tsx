"use client";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { listPosts, createPost, publishNow, deletePost } from "@/lib/api";
import { Plus, Send, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { cn, ALL_PLATFORMS } from "@/lib/utils";
import dynamic from "next/dynamic";

// FullCalendar is client-only
const Calendar = dynamic(() => import("@/components/CalendarView"), { ssr: false });

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-700 text-gray-300",
  scheduled: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  published: "bg-green-500/20 text-green-400 border border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border border-red-500/30",
  cancelled: "bg-gray-700 text-gray-400",
};

export default function SchedulePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [body, setBody] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    try {
      const r = await listPosts();
      setPosts(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  async function handleCreate() {
    if (!body.trim()) { toast.error("Post body required"); return; }
    setSaving(true);
    try {
      await createPost({
        body,
        platforms: selectedPlatforms,
        scheduled_at: scheduledAt || null,
      });
      toast.success(scheduledAt ? "Scheduled" : "Saved to drafts");
      setBody(""); setScheduledAt(""); setShowForm(false);
      fetchPosts();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  }

  async function handlePublishNow(id: number) {
    try {
      await publishNow(id);
      toast.success("Published");
      fetchPosts();
    } catch { toast.error("Publish failed"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule</h1>
            <p className="text-gray-400 text-sm mt-1">Plan and publish across all platforms</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New post
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="card mb-8 animate-fade-in">
            <h2 className="font-semibold text-white mb-4">Create Post</h2>
            <textarea
              className="input min-h-[120px] resize-none mb-4"
              placeholder="What's on your mind?"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatforms(prev =>
                        prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                      )}
                      className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", selectedPlatforms.includes(p) && "bg-brand-500 text-white")}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Schedule for (optional)</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Clock className="w-4 h-4" />}
                {scheduledAt ? "Schedule" : "Save draft"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="card mb-8">
          <Calendar posts={posts} />
        </div>

        {/* Post list */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4">All Posts</h2>
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-3">No posts yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-sm">Create your first post</button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p: any) => (
                <div key={p.id} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-2 mb-2">{p.body}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex flex-wrap gap-1">
                        {p.platforms.map((pl: string) => <span key={pl} className="capitalize">{pl}</span>)}
                      </span>
                      {p.scheduled_at && <span>📅 {new Date(p.scheduled_at).toLocaleString()}</span>}
                      {p.ai_generated && <span className="text-brand-400">AI</span>}
                    </div>
                  </div>
                  <span className={cn("badge flex-shrink-0", STATUS_STYLES[p.status])}>{p.status}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.status === "draft" && (
                      <button onClick={() => handlePublishNow(p.id)} className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Publish now">
                        <Send className="w-4 h-4 text-brand-400" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-gray-700 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
