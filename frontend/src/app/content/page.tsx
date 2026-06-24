"use client";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { generatePost, generateVideoScript, repurposeContent, generateBanner, createPost } from "@/lib/api";
import { ALL_PLATFORMS, cn } from "@/lib/utils";
import { Wand2, Video, Repeat2, Image, Copy, Check, Calendar, Send } from "lucide-react";
import toast from "react-hot-toast";

const TONES = ["professional", "casual", "witty", "inspirational", "educational", "bold"];
const TABS = [
  { id: "post", label: "Write Post", icon: Wand2 },
  { id: "video", label: "Video Script", icon: Video },
  { id: "repurpose", label: "Repurpose", icon: Repeat2 },
  { id: "banner", label: "Banner", icon: Image },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="p-1.5 rounded hover:bg-gray-700 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
    </button>
  );
}

export default function ContentPage() {
  const [tab, setTab] = useState("post");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Post form
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [tone, setTone] = useState("professional");
  const [numVariants, setNumVariants] = useState(3);

  // Video form
  const [videoTopic, setVideoTopic] = useState("");
  const [duration, setDuration] = useState(60);
  const [style, setStyle] = useState("educational");
  const [videoPlatform, setVideoPlatform] = useState("tiktok");

  // Repurpose form
  const [originalContent, setOriginalContent] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("linkedin");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["twitter", "instagram"]);

  // Banner form
  const [headline, setHeadline] = useState("");
  const [brandName, setBrandName] = useState("");
  const [bannerPlatform, setBannerPlatform] = useState("instagram");

  async function handleGeneratePost() {
    if (!topic.trim()) { toast.error("Enter a topic"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await generatePost({ topic, platform, tone, num_variants: numVariants });
      setResult({ type: "post", data: r.data.variants });
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  }

  async function handleGenerateVideo() {
    if (!videoTopic.trim()) { toast.error("Enter a topic"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await generateVideoScript({ topic: videoTopic, duration_seconds: duration, style, platform: videoPlatform });
      setResult({ type: "video", data: r.data });
    } catch { toast.error("Generation failed"); }
    finally { setLoading(false); }
  }

  async function handleRepurpose() {
    if (!originalContent.trim()) { toast.error("Paste your original content"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await repurposeContent({ original_content: originalContent, source_platform: sourcePlatform, target_platforms: targetPlatforms });
      setResult({ type: "repurpose", data: r.data });
    } catch { toast.error("Repurpose failed"); }
    finally { setLoading(false); }
  }

  async function handleBanner() {
    if (!headline.trim() || !brandName.trim()) { toast.error("Fill in headline and brand name"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await generateBanner({ headline, brand_name: brandName, platform: bannerPlatform, style: "modern" });
      setResult({ type: "banner", data: r.data });
    } catch { toast.error("Banner generation failed"); }
    finally { setLoading(false); }
  }

  async function scheduleVariant(body: string, hashtags: string[]) {
    try {
      await createPost({ body, platforms: [platform], hashtags, ai_generated: true });
      toast.success("Saved to drafts");
    } catch { toast.error("Failed to save"); }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-8 max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-2">Content Studio</h1>
        <p className="text-gray-400 text-sm mb-8">AI-powered content creation for every platform</p>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-8 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setResult(null); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                tab === id ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: form */}
          <div className="card space-y-4">
            {tab === "post" && (
              <>
                <div>
                  <label className="label">Topic or brief</label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="e.g. We just launched a new feature that helps marketers save 2 hours/day..."
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Platform</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PLATFORMS.map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", platform === p && "bg-brand-500 text-white border-brand-500")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", tone === t && "bg-brand-500 text-white")}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Variants: {numVariants}</label>
                  <input type="range" min={1} max={5} value={numVariants} onChange={e => setNumVariants(+e.target.value)} className="w-full accent-brand-500" />
                </div>
                <button onClick={handleGeneratePost} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  Generate posts
                </button>
              </>
            )}

            {tab === "video" && (
              <>
                <div>
                  <label className="label">Video topic</label>
                  <textarea className="input min-h-[80px] resize-none" placeholder="e.g. 5 productivity hacks for remote workers" value={videoTopic} onChange={e => setVideoTopic(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Duration (sec)</label>
                    <input type="number" className="input" value={duration} min={15} max={300} onChange={e => setDuration(+e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Platform</label>
                    <select className="input" value={videoPlatform} onChange={e => setVideoPlatform(e.target.value)}>
                      {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Style</label>
                  <div className="flex flex-wrap gap-2">
                    {["educational", "entertaining", "storytelling", "tutorial", "motivational"].map(s => (
                      <button key={s} onClick={() => setStyle(s)} className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", style === s && "bg-brand-500 text-white")}>{s}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleGenerateVideo} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Video className="w-4 h-4" />}
                  Generate script
                </button>
              </>
            )}

            {tab === "repurpose" && (
              <>
                <div>
                  <label className="label">Original content</label>
                  <textarea className="input min-h-[120px] resize-none" placeholder="Paste your original post here..." value={originalContent} onChange={e => setOriginalContent(e.target.value)} />
                </div>
                <div>
                  <label className="label">Source platform</label>
                  <select className="input" value={sourcePlatform} onChange={e => setSourcePlatform(e.target.value)}>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Repurpose for</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PLATFORMS.filter(p => p !== sourcePlatform).map(p => (
                      <button
                        key={p}
                        onClick={() => setTargetPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                        className={cn("btn-secondary text-xs px-3 py-1.5 capitalize", targetPlatforms.includes(p) && "bg-brand-500 text-white")}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleRepurpose} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Repeat2 className="w-4 h-4" />}
                  Repurpose
                </button>
              </>
            )}

            {tab === "banner" && (
              <>
                <div>
                  <label className="label">Headline</label>
                  <input className="input" placeholder="e.g. Launch Your Brand in 5 Minutes" value={headline} onChange={e => setHeadline(e.target.value)} />
                </div>
                <div>
                  <label className="label">Brand name</label>
                  <input className="input" placeholder="e.g. Orbit" value={brandName} onChange={e => setBrandName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Platform format</label>
                  <select className="input" value={bannerPlatform} onChange={e => setBannerPlatform(e.target.value)}>
                    {ALL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <button onClick={handleBanner} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Image className="w-4 h-4" />}
                  Generate banner
                </button>
              </>
            )}
          </div>

          {/* Right: results */}
          <div className="space-y-4">
            {loading && (
              <div className="card flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Generating with Claude...</p>
                </div>
              </div>
            )}

            {result?.type === "post" && result.data.map((v: any, i: number) => (
              <div key={i} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Variant {i + 1}</span>
                  <div className="flex gap-1">
                    <CopyButton text={v.body} />
                    <button onClick={() => scheduleVariant(v.body, v.hashtags)} className="p-1.5 rounded hover:bg-gray-700 transition-colors" title="Save to drafts">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white leading-relaxed">{v.body}</p>
                {v.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.hashtags.map((h: string) => (
                      <span key={h} className="text-xs text-brand-400 bg-brand-500/10 rounded px-2 py-0.5">#{h}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-800">
                  <span>{v.hook}</span>
                  <span>{v.best_time}</span>
                </div>
              </div>
            ))}

            {result?.type === "video" && (
              <div className="card space-y-4">
                <h3 className="font-semibold text-white">{result.data.title}</h3>
                <div className="p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-brand-400 font-medium mb-1">Hook (0-3s)</div>
                  <p className="text-sm text-white">{result.data.hook}</p>
                </div>
                <div className="space-y-2">
                  {result.data.scenes?.map((s: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-gray-500 text-xs w-12 flex-shrink-0 mt-0.5">{s.time_marker}</span>
                      <div>
                        <div className="text-gray-400 text-xs">{s.action}</div>
                        <div className="text-white">{s.dialogue}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-500/20">
                  <div className="text-xs text-brand-400 font-medium mb-1">CTA</div>
                  <p className="text-sm text-white">{result.data.cta}</p>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Caption</div>
                  <p className="text-sm text-gray-300">{result.data.caption}</p>
                </div>
              </div>
            )}

            {result?.type === "repurpose" && Object.entries(result.data).map(([plat, v]: [string, any]) => (
              <div key={plat} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">{plat}</span>
                  <CopyButton text={v.body} />
                </div>
                <p className="text-sm text-white leading-relaxed">{v.body}</p>
                {v.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.hashtags.map((h: string) => (
                      <span key={h} className="text-xs text-brand-400">#{h}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 italic">{v.adaptation_notes}</p>
              </div>
            ))}

            {result?.type === "banner" && (
              <div className="card">
                {result.data.url ? (
                  <img src={result.data.url} alt="Generated banner" className="w-full rounded-lg" />
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {result.data.status === "no_api_key" ? "Add REPLICATE_API_TOKEN to enable image generation" : result.data.status}
                  </div>
                )}
              </div>
            )}

            {!result && !loading && (
              <div className="card flex items-center justify-center h-48 text-center">
                <div>
                  <Wand2 className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Your generated content will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
