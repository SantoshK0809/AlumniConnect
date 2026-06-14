import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createJob } from "../api/jobApi";

const JOB_TYPES = ["Full-Time", "Part-Time", "Internship", "Contract"];

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase();
  const basePath = role === "admin" ? "/teacher/admin" : `/${role}`;

  const [form, setForm] = useState({
    title: "", company: "", location: "", type: "Full-Time",
    description: "", salary: "", applyLink: "", deadline: "",
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setSkillInput(""); }
  };
  const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));
  const handleSkillKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.type || !form.description) {
      setError("Please fill in all required fields."); return;
    }
    try {
      setSubmitting(true);
      await createJob({ ...form, skills });
      setSuccess(true);
      setTimeout(() => navigate(`${basePath}/jobs`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post job.");
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Job Posted!</h2>
        <p className="text-gray-500 mt-2">Redirecting to job board...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate(`${basePath}/jobs`)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Job Board
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Post a New Job</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to create a job listing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl text-sm font-semibold">{error}</div>
        )}

        {/* Title & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Software Engineer"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
            <input name="company" value={form.company} onChange={handleChange} placeholder="e.g. Google India"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
        </div>

        {/* Location, Type, Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore / Remote"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Job Type *</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Salary Range</label>
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. ₹12-22 LPA"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5}
            placeholder="Describe the role, responsibilities, and what you're looking for..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none" />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Required Skills</label>
          <div className="flex gap-2 mb-3">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown}
              placeholder="Type a skill and press Enter"
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
            <button type="button" onClick={addSkill}
              className="px-5 py-3 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg border border-indigo-100">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-indigo-400 hover:text-red-500 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Apply Link & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Apply Link</label>
            <input name="applyLink" value={form.applyLink} onChange={handleChange} placeholder="https://careers.company.com/apply"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Application Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={submitting}
            className={`flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-indigo-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"}`}>
            {submitting ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Posting...</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Post Job
              </>
            )}
          </button>
          <button type="button" onClick={() => navigate(`${basePath}/jobs`)}
            className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
