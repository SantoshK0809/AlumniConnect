import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchJobs, deleteJob } from "../api/jobApi";
import axios from "axios";

const JOB_TYPES = ["All", "Full-Time", "Part-Time", "Internship", "Contract"];
const TYPE_COLORS = {
  "Full-Time": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Part-Time": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  Internship: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Contract: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
};

const JobBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase();
  const canPost = ["teacher", "alumni", "admin"].includes(role);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialJobId = searchParams.get("jobId");
  
  const [activeType, setActiveType] = useState("All");
  const [expandedId, setExpandedId] = useState(initialJobId || null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await fetchJobs({ type: activeType, search: searchTerm });
      setJobs(data.jobs || []);
      
      // Fetch recommendations if student or alumni
      if ((role === 'student' || role === 'alumni') && !searchTerm && activeType === "All") {
        const API = (await import('../api/index')).default;
        const recRes = await API.get('/recommendations');
        setRecommendedJobs(recRes.data.jobRecommendations || []);
      }
    } catch (err) { console.error("Error loading jobs:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadJobs(); }, [activeType]);
  useEffect(() => { const t = setTimeout(loadJobs, 400); return () => clearTimeout(t); }, [searchTerm]);

  const handleDelete = async (jobId) => {
    try { await deleteJob(jobId); setJobs(p => p.filter(j => j._id !== jobId)); setDeleteConfirm(null); setExpandedId(null); }
    catch (err) { console.error("Error deleting job:", err); }
  };

  const basePath = role === "admin" ? "/teacher/admin" : `/${role}`;
  const formatDeadline = (date) => {
    if (!date) return null;
    const d = new Date(date), now = new Date();
    const diff = Math.ceil((d - now) / 86400000);
    const fmt = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    if (diff < 0) return { text: `Closed ${fmt}`, urgent: true, expired: true };
    if (diff <= 3) return { text: `${diff}d left`, urgent: true, expired: false };
    return { text: fmt, urgent: false, expired: false };
  };

  const stats = useMemo(() => ({
    total: jobs.length,
    fullTime: jobs.filter(j => j.type === "Full-Time").length,
    internship: jobs.filter(j => j.type === "Internship").length,
  }), [jobs]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 md:p-12 mb-8 shadow-2xl shadow-indigo-200/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Job Board</h1>
            <p className="text-indigo-200 mt-2 text-lg">Discover opportunities posted by alumni & faculty</p>
            <div className="flex gap-4 mt-4">
              {[["Total", stats.total], ["Full-Time", stats.fullTime], ["Internships", stats.internship]].map(([l, v]) => (
                <div key={l} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <p className="text-2xl font-black text-white">{v}</p>
                  <p className="text-xs text-indigo-200 font-semibold">{l}</p>
                </div>
              ))}
            </div>
          </div>
          {canPost && (
            <button onClick={() => navigate(`${basePath}/jobs/create`)}
              className="self-start md:self-center bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Post a Job
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 sticky top-20 z-30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
            <input type="text" placeholder="Search jobs by title, company, or skills..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {JOB_TYPES.map(type => (
              <button key={type} onClick={() => setActiveType(type)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeType === type ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"}`}>
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommended Jobs Section */}
      {recommendedJobs.length > 0 && !searchTerm && activeType === "All" && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6 ml-2">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Top Matches For You
            </h2>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
              AI Match
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {recommendedJobs.map(job => (
                <JobCard 
                  key={`rec-${job._id}`} 
                  job={job} 
                  user={user} 
                  expandedId={expandedId} 
                  setExpandedId={setExpandedId} 
                  deleteConfirm={deleteConfirm} 
                  setDeleteConfirm={setDeleteConfirm} 
                  handleDelete={handleDelete} 
                  formatDeadline={formatDeadline}
                  isRecommendation={true}
                />
             ))}
          </div>
          <div className="my-8 h-px bg-gray-200/50 w-full" />
        </div>
      )}

      {/* Job Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-4 font-semibold">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
          </div>
          <h3 className="text-lg font-bold text-gray-600">No jobs found</h3>
          <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map(job => <JobCard key={job._id} job={job} user={user} expandedId={expandedId} setExpandedId={setExpandedId} deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm} handleDelete={handleDelete} formatDeadline={formatDeadline} />)}
        </div>
      )}
    </div>
  );
};

const JobCard = ({ job, user, expandedId, setExpandedId, deleteConfirm, setDeleteConfirm, handleDelete, formatDeadline, isRecommendation }) => {
  const tc = TYPE_COLORS[job.type] || TYPE_COLORS["Full-Time"];
  const deadline = formatDeadline(job.deadline);
  const isExpanded = expandedId === job._id;
  const isOwner = user?._id === job.postedBy?._id || user?.id === job.postedBy?._id;
  const cardRef = useRef(null);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isExpanded]);

  return (
    <div 
      ref={cardRef}
      className={`group bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100/50 cursor-pointer ${isExpanded ? "border-indigo-200 shadow-lg shadow-indigo-100/50 col-span-1 md:col-span-2" : "border-gray-100 shadow-sm"}`}
      onClick={() => setExpandedId(isExpanded ? null : job._id)}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200/50 shrink-0">{job.company?.charAt(0)}</div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{job.title}</h3>
              <p className="text-sm font-semibold text-gray-500 truncate">{job.company}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
             <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${tc.bg} ${tc.text} ${tc.border}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{job.type}
             </span>
             {isRecommendation && job.matchPercentage && (
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  {job.matchPercentage}% Match
                </span>
             )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
          {job.location && <span className="flex items-center gap-1.5 font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>{job.location}</span>}
          {job.salary && <span className="flex items-center gap-1.5 font-medium"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{job.salary}</span>}
          {deadline && <span className={`flex items-center gap-1.5 font-medium ${deadline.urgent ? "text-red-500" : ""}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{deadline.text}</span>}
        </div>

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.skills.slice(0, isExpanded ? undefined : 4).map((s, i) => <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">{s}</span>)}
            {!isExpanded && job.skills.length > 4 && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">+{job.skills.length - 4} more</span>}
          </div>
        )}

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-100" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-6">{job.description}</p>
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-indigo-600 text-xs font-bold">{job.authorName?.charAt(0)}</span></div>
              <span className="font-medium">Posted by <strong className="text-gray-700">{job.authorName}</strong> <span className="text-gray-400">· {job.role}</span></span>
              <span className="text-gray-300">·</span>
              <span>{new Date(job.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            </div>
            <div className="flex items-center gap-3">
              {job.applyLink && <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                Apply Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>}
              {(isOwner || user?.role === "Admin") && (
                deleteConfirm === job._id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-semibold">Delete?</span>
                    <button onClick={() => handleDelete(job._id)} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">Yes</button>
                    <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(job._id)} className="px-4 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors border border-red-100">Delete</button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
