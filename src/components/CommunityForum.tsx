import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, ThumbsUp, Send, User, HelpCircle, Tag, Sparkles, Filter, RefreshCw, ChevronDown, CheckCircle, BookOpen, Heart, Info, SendHorizontal } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { ForumPost, ForumReply, FarmerProfile } from "../types";

interface CommunityForumProps {
  profile: FarmerProfile;
}

const FORUM_CATEGORIES = ["General", "Irrigation", "Pest Control", "Fertilizers", "Government Schemes", "Farm Machinery"];

// Pre-packaged expert guide solutions
const PREMADE_GUIDES = [
  {
    id: "guide-pest",
    title: "Eco-Friendly Control of Tomato Whitefly",
    category: "Pest Control",
    challenge: "Whiteflies transmit virus pathogens, causing leaf curling and severe yield failure.",
    steps: [
      "Yellow Sticky Traps: Install 15-20 bright yellow sticky sheets per acre to capture adult whiteflies mechanically.",
      "Neem Oil Spray: Apply a 1.5% concentration of organic cold-pressed Neem Oil emulsified with soapy water every 5 days.",
      "Parasitic Wasps: Release natural predators like Encarsia formosa wasps into fields during early outbreak stages.",
      "Avoid Heavy Nitrogen: Excessive chemical Nitrogen results in tender succulent growth which highly attracts sucking pests."
    ]
  },
  {
    id: "guide-irr",
    title: "Step-by-Step Sub-Surface Drip Irrigation Design",
    category: "Irrigation",
    challenge: "Extreme groundwater depletion requires high-efficiency water delivery directly to crop roots.",
    steps: [
      "Depth Placement: Bury emitter drip lines 10-15 cm below soil to completely avoid solar evaporation.",
      "Spacing Metric: Align lateral tube lines 40-50 cm apart, matching row spaces for high-density planting.",
      "Flush Manifolds: Clean lines every 2 weeks using phosphoric acid or chlorine solutions to prevent calcium/algae scaling.",
      "Scheduler Index: Water during pre-dawn or post-sunset hours matching soil tensiometer readings below 30 centibars."
    ]
  },
  {
    id: "guide-organic",
    title: "3-Step Certified Organic Sowing Transition",
    category: "Fertilizers",
    challenge: "High fertilizer costs and soil toxicity demand organic conversion without dropping harvest yield.",
    steps: [
      "Soil Inoculation: Apply Liquid Jeevamrutha (microbial soil broth made of cow dung/urine, pulse flour, and jaggery) during irrigation.",
      "Legume Cover Crops: Seed Crimson Clover or Alfalfa during seasonal rest periods to naturally fix up to 100kg Nitrogen per hectare.",
      "Composting Ledger: Build a vermicomposting pit using farm residuals and earthworms (Eisenia fetida) to generate dense humus."
    ]
  }
];

export default function CommunityForum({ profile }: CommunityForumProps) {
  // Q&A Forum states
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Post question states
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("General");
  const [postingQuestion, setPostingQuestion] = useState<boolean>(false);

  // Active reply target states
  const [activeReplyPostId, setActiveReplyPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // AI Assistant chat states
  const [aiMessage, setAiMessage] = useState<string>("");
  const [aiHistory, setAiHistory] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: `Namaste ${profile.name || "Farmer"}! I am KisanAI, your virtual senior agronomist. Ask me any questions regarding soil, crop diseases, watering issues, pest control, or agricultural schemes.` }
  ]);
  const [sendingAiMsg, setSendingAiMsg] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Active guide detail state
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>("guide-pest");

  useEffect(() => {
    fetchForumPosts();
  }, []);

  useEffect(() => {
    // scroll AI chat to bottom when history changes
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiHistory]);

  const fetchForumPosts = async () => {
    setLoadingPosts(true);
    const collectionPath = "forum_posts";
    try {
      const q = query(collection(db, collectionPath), orderBy("timestamp", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      const docsList: ForumPost[] = [];
      querySnapshot.forEach((doc) => {
        docsList.push({ id: doc.id, ...doc.data() } as ForumPost);
      });
      setPosts(docsList);
    } catch (err) {
      console.error("Error loading forum posts:", err);
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setPostingQuestion(true);
    const collectionPath = "forum_posts";
    try {
      const timestampStr = new Date().toISOString();
      const newPostData = {
        title: newTitle,
        content: newContent,
        category: newCategory,
        authorName: profile.name || "Anonymous Farmer",
        farmLocation: profile.location || "General Farm",
        timestamp: timestampStr,
        likes: 0,
        likedBy: [],
        replies: []
      };

      const docRef = await addDoc(collection(db, collectionPath), newPostData);
      
      const createdPost: ForumPost = {
        id: docRef.id,
        ...newPostData
      };

      setPosts((prev) => [createdPost, ...prev]);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Error creating forum post:", err);
      handleFirestoreError(err, OperationType.CREATE, collectionPath);
    } finally {
      setPostingQuestion(false);
    }
  };

  const handleLikePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const post = posts.find((p) => p.id === postId);
    if (!post || !postId) return;

    // Avoid double liking (simple client-side check)
    const currentLikedBy = post.likedBy || [];
    const myName = profile.name || "Anonymous Farmer";
    if (currentLikedBy.includes(myName)) return;

    const docPath = `forum_posts/${postId}`;
    try {
      const postRef = doc(db, "forum_posts", postId);
      const updatedLikes = post.likes + 1;
      const updatedLikedBy = [...currentLikedBy, myName];

      await updateDoc(postRef, {
        likes: updatedLikes,
        likedBy: updatedLikedBy
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: updatedLikes, likedBy: updatedLikedBy } : p
        )
      );
    } catch (err) {
      console.error("Error liking post:", err);
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  const handlePostReply = async (postId: string) => {
    if (!replyText.trim() || !postId) return;

    setSubmittingReply(true);
    const docPath = `forum_posts/${postId}`;
    try {
      const newReply: ForumReply = {
        authorName: profile.name || "Anonymous Farmer",
        content: replyText,
        timestamp: new Date().toISOString(),
        isAiExpert: false
      };

      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        replies: arrayUnion(newReply)
      });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p
        )
      );
      setReplyText("");
      setActiveReplyPostId(null);
    } catch (err) {
      console.error("Error saving reply:", err);
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Chat with KisanAI
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || sendingAiMsg) return;

    const userText = aiMessage;
    setAiMessage("");
    setAiHistory((prev) => [...prev, { sender: "user", text: userText }]);
    setSendingAiMsg(true);

    try {
      const response = await fetch("/api/farmer-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          chatHistory: aiHistory.slice(-6) // include up to 3 turns for context
        }),
      });

      if (!response.ok) throw new Error("AI service unresponsive");
      const data = await response.json();

      setAiHistory((prev) => [...prev, { sender: "bot", text: data.text }]);
    } catch (err) {
      console.error("Farmer Chat error:", err);
      setAiHistory((prev) => [
        ...prev,
        { sender: "bot", text: "I apologize, but my satellite link to KisanAI was momentarily disrupted. Please ask your farming query again shortly!" }
      ]);
    } finally {
      setSendingAiMsg(false);
    }
  };

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

  const activeGuide = PREMADE_GUIDES.find(g => g.id === selectedGuideId) || PREMADE_GUIDES[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="community-forum-root">
      {/* LEFT COLUMN: KisanAI chatbot & Premade Guides */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* KisanAI Agronomist Chat Box */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-lg border border-slate-800 flex flex-col h-[400px] overflow-hidden" id="kisan-ai-chat-box">
          {/* Header */}
          <div className="p-4 bg-emerald-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  KisanAI Agronomist Assistant
                </h4>
                <p className="text-[10px] text-emerald-300">Live 24/7 technical advisory</p>
              </div>
            </div>
            <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-md font-mono">
              v2.5 Flash
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" id="ai-chat-messages">
            {aiHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  chat.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <span className="text-[8px] text-slate-500 font-bold mb-0.5 flex items-center gap-1">
                  {chat.sender === "user" ? profile.name || "Farmer" : "KisanAI Agronomist"}
                </span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                    chat.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60"
                  }`}
                >
                  <p className="whitespace-pre-line">{chat.text}</p>
                </div>
              </div>
            ))}
            {sendingAiMsg && (
              <div className="mr-auto max-w-[85%] flex flex-col items-start animate-pulse">
                <span className="text-[8px] text-slate-500 font-bold mb-0.5">KisanAI Agronomist</span>
                <div className="p-3 bg-slate-800 text-slate-400 text-xs rounded-2xl rounded-tl-none border border-slate-700/60 flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                  Consulting soil metrics & weather charts...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendAiMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2" id="ai-chat-form">
            <input
              type="text"
              placeholder="Ask: 'How do I stop leaf spot in wheat?'"
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={!aiMessage.trim() || sendingAiMsg}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
              id="ai-chat-send-btn"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Premade Solutions Guides (Problem Solver) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4" id="problem-solver-guides">
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Agronomy Master Guides</h4>
            <h3 className="text-sm font-extrabold text-slate-800">Farmers' Direct Problem Solvers</h3>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {PREMADE_GUIDES.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuideId(guide.id)}
                className={`p-2.5 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                  selectedGuideId === guide.id
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-600"
                }`}
              >
                {guide.title.split(" ").slice(0, 3).join(" ")}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2" id="active-guide-details">
            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-2 py-0.5 rounded">
              {activeGuide.category}
            </span>
            <h4 className="text-xs font-black text-slate-900">{activeGuide.title}</h4>
            
            <div className="text-[11px] text-slate-500 pb-2 border-b border-slate-200/50">
              <span className="font-extrabold text-slate-700 block">The Challenge:</span>
              "{activeGuide.challenge}"
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Recommended Steps:</span>
              {activeGuide.steps.map((st, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] leading-relaxed">
                  <span className="text-emerald-600 font-black shrink-0">{i+1}.</span>
                  <span className="text-slate-600">{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Community Discussion Forum */}
      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[750px]" id="community-qa-forum">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Farmers' Q&A Community Ledger
            </h3>
            <p className="text-xs text-slate-500">Post queries, share local insights, and support other farmers internationally.</p>
          </div>

          <button
            onClick={fetchForumPosts}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 transition"
            title="Refresh discussions"
            id="forum-refresh-btn"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Ask Question Form toggle drawer */}
        <form onSubmit={handlePostQuestion} className="bg-slate-50 p-4 rounded-xl border border-slate-100/80 mb-5 space-y-3" id="ask-question-form">
          <span className="block text-xs font-bold text-slate-700">Have a field problem? Ask the Community:</span>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Question title (e.g. Rice leaves tuning reddish yellow)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                required
                id="post-title-input"
              />
            </div>

            <div>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                id="post-category-select"
              >
                {FORUM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            placeholder="Describe the symptoms, weather conditions, water intervals, or crop types..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 min-h-[60px]"
            required
            id="post-content-textarea"
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400">
              Posting as: <strong className="text-slate-600">{profile.name || "Anonymous Farmer"}</strong> ({profile.location || "General Farm"})
            </span>
            <button
              type="submit"
              disabled={postingQuestion || !newTitle.trim() || !newContent.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm transition-all"
              id="post-question-btn"
            >
              {postingQuestion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit Post
            </button>
          </div>
        </form>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
              selectedCategory === "All"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600"
            }`}
          >
            All Categories
          </button>
          {FORUM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                selectedCategory === cat
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discussion ledger list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1" id="forum-posts-ledger">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-12 animate-pulse">
              <MessageSquare className="w-8 h-8 text-slate-300 animate-bounce mb-2" />
              <span className="text-xs text-slate-500 font-semibold">Loading discussions from Cloud...</span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed text-slate-400 text-xs font-semibold">
              No discussions matching this category found. Be the first to start a conversation!
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 transition-all" id={`forum-post-${post.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-0.5">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase bg-slate-200 text-slate-700 rounded mb-1">
                      {post.category}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 leading-snug">{post.title}</h4>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-normal mb-3 whitespace-pre-line">{post.content}</p>

                {/* Author footer */}
                <div className="flex items-center justify-between border-t border-slate-100/60 pt-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>
                      Posted by: <strong className="text-slate-700">{post.authorName}</strong> ({post.farmLocation})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Like button */}
                    <button
                      onClick={(e) => post.id && handleLikePost(post.id, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition cursor-pointer font-bold ${
                        post.likedBy?.includes(profile.name || "Anonymous Farmer")
                          ? "bg-red-50 text-red-600"
                          : "bg-white hover:bg-slate-100 text-slate-500 hover:text-red-500 border border-slate-100"
                      }`}
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{post.likes || 0}</span>
                    </button>

                    {/* Reply toggle button */}
                    <button
                      onClick={() => setActiveReplyPostId(activeReplyPostId === post.id ? null : (post.id || null))}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      Replies ({post.replies?.length || 0})
                    </button>
                  </div>
                </div>

                {/* Replies nested section */}
                {(activeReplyPostId === post.id || (post.replies && post.replies.length > 0)) && (
                  <div className="mt-3.5 space-y-2 bg-white/70 p-3 rounded-xl border border-slate-100/50">
                    {/* Replies list */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="space-y-2">
                        {post.replies.map((rep, rIdx) => (
                          <div key={rIdx} className="text-[11px] leading-normal pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                              <span className="text-slate-700">{rep.authorName}</span>
                              <span>{new Date(rep.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600">{rep.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Write reply form */}
                    {activeReplyPostId === post.id && (
                      <div className="flex gap-2 pt-2 border-t border-slate-50">
                        <input
                          type="text"
                          placeholder="Write a helpful answer..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 text-[11px] px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                          id={`reply-input-${post.id}`}
                        />
                        <button
                          onClick={() => post.id && handlePostReply(post.id)}
                          disabled={submittingReply || !replyText.trim()}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
