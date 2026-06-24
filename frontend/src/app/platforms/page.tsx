"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { listPlatforms, disconnectPlatform, connectPlatform } from "@/lib/api";
import { PLATFORM_COLORS } from "@/lib/utils";
import { Link2, Unlink, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const PLATFORM_INFO: Record<string, { name: string; description: string; authUrl: string }> = {
  twitter: {
    name: "X (Twitter)",
    description: "Connect your X account to post tweets and threads.",
    authUrl: "/api/auth/twitter",
  },
  linkedin: {
    name: "LinkedIn",
    description: "Post to your LinkedIn profile or company page.",
    authUrl: "/api/auth/linkedin",
  },
  instagram: {
    name: "Instagram",
    description: "Schedule posts and reels to your Instagram business account.",
    authUrl: "/api/auth/instagram",
  },
  facebook: {
    name: "Facebook",
    description: "Post to your Facebook page.",
    authUrl: "/api/auth/facebook",
  },
  tiktok: {
    name: "TikTok",
    description: "Schedule TikTok videos with AI-generated scripts.",
    authUrl: "/api/auth/tiktok",
  },
};

export default function PlatformsPage() {
  const [connected, setConnected] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [manualOpen, setManualOpen] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [manualUsername, setManualUsername] = useState("");

  const fetchConnections = async () => {
    try {
      const r = await listPlatforms();
      const map: Record<string, any> = {};
      r.data.forEach((c: any) => { map[c.platform] = c; });
      setConnected(map);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchConnections(); }, []);

  async function handleDisconnect(platform: string) {
    if (!confirm(`Disconnect ${platform}?`)) return;
    try {
      await disconnectPlatform(platform);
      setConnected(prev => { const n = { ...prev }; delete n[platform]; return n; });
      toast.success(`${platform} disconnected`);
    } catch { toast.error("Failed to disconnect"); }
  }

  async function handleManualConnect(platform: string) {
    if (!manualToken || !manualUsername) { toast.error("Fill in token and username"); return; }
    try {
      await connectPlatform({
        platform,
        access_token: manualToken,
        platform_username: manualUsername,
      });
      toast.success(`${platform} connected`);
      setManualOpen(null); setManualToken(""); setManualUsername("");
      fetchConnections();
    } catch { toast.error("Connection failed"); }
  }

  return (
    <div className="flex min-h-screen bg-[#080810]">
      <Sidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-2">Platforms</h1>
        <p className="text-white/50 text-sm mb-8">Connect your social media accounts to start scheduling</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {Object.entries(PLATFORM_INFO).map(([platform, info]) => {
              const conn = connected[platform];
              return (
                <div key={platform} className="card">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                      style={{ background: PLATFORM_COLORS[platform] }}
                    >
                      {platform[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{info.name}</span>
                        {conn && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <p className="text-sm text-white/50">{info.description}</p>
                      {conn && (
                        <p className="text-xs text-white/35 mt-1">Connected as @{conn.platform_username}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {conn ? (
                        <button onClick={() => handleDisconnect(platform)} className="btn-secondary text-sm flex items-center gap-2 text-red-400 hover:text-red-300">
                          <Unlink className="w-4 h-4" /> Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => setManualOpen(manualOpen === platform ? null : platform)}
                          className="btn-primary text-sm flex items-center gap-2"
                        >
                          <Link2 className="w-4 h-4" /> Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {manualOpen === platform && !conn && (
                    <div className="mt-4 p-4 bg-white/[0.04] rounded-lg space-y-3 border border-white/[0.08]">
                      <p className="text-xs text-white/50">
                        Enter your {info.name} API access token to connect manually.
                        In production, OAuth flow redirects to <code className="text-indigo-400">{info.authUrl}</code>.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="label text-xs">Access token</label>
                          <input className="input text-sm" type="password" placeholder="Bearer token..." value={manualToken} onChange={e => setManualToken(e.target.value)} />
                        </div>
                        <div>
                          <label className="label text-xs">Username</label>
                          <input className="input text-sm" placeholder="@handle" value={manualUsername} onChange={e => setManualUsername(e.target.value)} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleManualConnect(platform)} className="btn-primary text-sm">Save</button>
                        <button onClick={() => setManualOpen(null)} className="btn-ghost text-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
