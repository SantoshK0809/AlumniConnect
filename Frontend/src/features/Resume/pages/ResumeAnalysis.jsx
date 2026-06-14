import React, { useState, useRef } from "react";
import {
  Briefcase,
  User,
  Upload,
  CheckCircle2,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";


const ResumeAnalysis = () => {
  const { loading, generateReport, reports } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const resumeInputRef = useRef();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  const navigate = useNavigate();

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0];

    if (!jobDescription || (!selfDescription && !resumeFile)) {
      toast.error(
        "Provide a job description and either a self description or a resume.",
      );
      return;
    }

    const toastId = toast.loading("Generating your interview strategy...");

    try {
      // setTimeout(() => {
      //   toast.loading("Generating your interview strategy...");
      // }, 1000);
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });

      if (data && data._id) {
        toast.success("Interview strategy generated successfully!", {
          id: toastId,
        });
        navigate(`/interview/${data._id}`);
      }
    } catch (error) {
      console.error(error);
      // alert(
      //   "Failed to generate report. Please try again or provide a different resume.",
      // );
      toast.error(
        error?.message ||
          "Failed to generate report. Please try again or provide a different resume.",
      );
    }
  };

  if (loading) {
    return (
      // <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      //   <Loader2 className="h-10 w-10 animate-spin text-primary" />
      //   <p className="text-muted-foreground">Loading your interview plan...</p>
      // </div>

      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-full border-4 border-red-500/20 border-t-blue-700 animate-spin mb-6" />
        <h2 className="text-xl text-black font-semibold">Preparing Your Experience</h2>
        <p className="text-gray-400 mt-2 text-sm">
          This will only take a moment...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
    
      <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-10 sm:px-6 sm:py-14">
        {/* Page Header */}
        <header className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Create Your Custom{" "}
            <span className="text-primary">Interview Plan</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
            Let our AI analyze the job requirements and your unique profile to
            build a winning strategy.
          </p>
        </header>

        {/* Main Card */}
        <div className="w-full rounded-2xl border border-border bg-card overflow-hidden shadow-elevated">
          <div className="flex flex-col lg:flex-row lg:min-h-[520px]">
            {/* Left Panel */}
            <div className="flex-1 flex flex-col gap-4 p-5 sm:p-6 relative">
              <div className="flex items-center gap-2">
                <Briefcase className="h-[18px] w-[18px] text-primary" />
                <h2 className="flex-1 text-base font-semibold">
                  Target Job Description
                </h2>
                <span className="text-[0.7rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
                  Required
                </span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                maxLength={5000}
                className="flex-1 no-scrollbar min-h-[200px] w-full resize-none rounded-lg border border-border bg-[var(--input)] px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
              />
              <div className="text-right text-xs text-muted-foreground">
                {jobDescription.length} / 5000 chars
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px lg:w-px lg:h-auto bg-border flex-shrink-0" />

            {/* Right Panel */}
            <div className="flex-1 flex flex-col gap-3 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-[18px] w-[18px] text-primary" />
                <h2 className="flex-1 text-base font-semibold">Your Profile</h2>
              </div>

              {/* Upload */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  Upload Resume
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
                    Best Results
                  </span>
                </label>
                <label
                  htmlFor="resume"
                  className="flex flex-col items-center justify-center gap-1.5 px-4 py-6 rounded-lg border-2 border-dashed border-border bg-[var(--input)] cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
                >
                  {resumeFileName ? (
                    <>
                      <CheckCircle2 className="h-7 w-7 text-primary" />
                      <p className="text-sm font-semibold text-primary m-0">
                        File Selected
                      </p>
                      <p className="text-xs text-muted-foreground m-0">
                        {resumeFileName}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-primary" />
                      <p className="text-sm font-medium m-0">
                        Click to upload or drag &amp; drop
                      </p>
                      <p className="text-xs text-muted-foreground m-0">
                        PDF or DOCX (Max 5MB)
                      </p>
                    </>
                  )}
                  <input
                    ref={resumeInputRef}
                    hidden
                    type="file"
                    id="resume"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* OR */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex-1 h-px bg-border" />
                <span>OR</span>
                <span className="flex-1 h-px bg-border" />
              </div>

              {/* Self description */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="selfDescription"
                  className="text-sm font-medium"
                >
                  Quick Self-Description
                </label>
                <textarea
                  id="selfDescription"
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  className="h-24 no-scrollbar w-full resize-none rounded-lg border border-border bg-[var(--input)] px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                />
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-[#2d4a7a] bg-white/5">
                <Info className="h-4 w-4 mt-0.5 text-[#4a90e2] flex-shrink-0" />
                <p className="m-0 text-xs leading-relaxed text-muted-foreground">
                  Either a <strong className="text-foreground">Resume</strong>{" "}
                  or a{" "}
                  <strong className="text-foreground">Self Description</strong>{" "}
                  is required to generate a personalized plan.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              AI-Powered Strategy Generation • Approx 30s
            </span>
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="inline-flex cursor-pointer items-center border border-[#2d4a7a] hover:border-blue-500 hover:text-blue-500 justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-black bg-gradient-primary shadow-glow transition-transform hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Generate Interview Strategy
            </button>
          </div>
        </div>

        {/* Footer links */}
        <footer className="flex gap-6 pt-4">
          {["Privacy Policy", "Terms of Service", "Help Center"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {l}
            </a>
          ))}
        </footer>
        {reports.length > 0 && (
          <section className="mx-auto max-w-7xl mt-10">
            <h2 className="font-bold text-2xl mb-6">Recent Plans</h2>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => navigate(`/interview/${report._id}`)}
                  className="cursor-pointer rounded-2xl bg-white border border-white/10 p-5 hover:border-blue-500 transition"
                >
                  <h3 className="font-semibold">
                    {report.title || "Untitled Position"}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>

                  <p className="mt-4 text-blue-400 font-semibold">
                    Match Score : &nbsp;
                    {report.matchScore}%
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ResumeAnalysis;
