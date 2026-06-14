import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Code2,
  MessageCircle,
  Map,
  ChevronDown,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useInterview } from "../hooks/useInterview";

const NAV_ITEMS = [
  { id: "technical", label: "Technical Questions", icon: Code2 },
  { id: "behavioral", label: "Behavioral Questions", icon: MessageCircle },
  { id: "roadmap", label: "Road Map", icon: Map },
];

function QuestionCard({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-[var(--surface-elevated)] overflow-hidden transition-colors hover:border-[#3a4560]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        <span className="flex-shrink-0 mt-0.5 text-[0.7rem] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
          Q{index + 1}
        </span>
        <p className="flex-1 m-0 text-sm font-medium leading-relaxed">
          {item.question}
        </p>
        <ChevronDown
          className={`h-4 w-4 mt-0.5 flex-shrink-0 transition-transform ${open ? "rotate-180 text-primary" : "text-muted-foreground"}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-border flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="w-fit text-[0.68rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20">
              Intention
            </span>
            <p className="m-0 text-[0.835rem] leading-relaxed text-[#9aa3b2]">
              {item.intention}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="w-fit text-[0.68rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/20">
              Model Answer
            </span>
            <p className="m-0 text-[0.835rem] leading-relaxed text-[#9aa3b2]">
              {item.answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function RoadMapDay({ day }) {
  return (
    <div className="relative flex flex-col gap-2 py-3 pl-14">
      <span className="absolute left-[15px] top-[1.05rem] h-3.5 w-3.5 rounded-full bg-card border-2 border-primary" />
      <div className="flex items-center gap-2.5">
        <span className="text-[0.7rem] font-bold text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
          Day {day.day}
        </span>
        <h3 className="m-0 text-[0.95rem] font-semibold">{day.focus}</h3>
      </div>
      <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
        {day.tasks.map((task, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[0.845rem] leading-relaxed text-[#9aa3b2]"
          >
            <span className="flex-shrink-0 mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Interview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("technical");
  const { report, getReportById, loading, getResumePdf } = useInterview();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your interview plan...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* <LoggedInNavbar /> */}
        <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Report not found</h1>
          <p className="text-muted-foreground">
            This interview plan no longer exists or was generated on another
            device.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <ArrowLeft className="h-4 w-4" /> Create a new plan
          </button>
        </div>
      </div>
    );
  }

  const scoreColor =
    report.matchScore >= 80
      ? "border-[#3fb950]"
      : report.matchScore >= 60
        ? "border-[#f5a623]"
        : "border-[#ff4d4d]";
  const subColor =
    report.matchScore >= 80
      ? "text-[#3fb950]"
      : report.matchScore >= 60
        ? "text-[#f5a623]"
        : "text-[#ff4d4d]";
  const subText =
    report.matchScore >= 80
      ? "Strong match for this role"
      : report.matchScore >= 60
        ? "Decent match — close the gaps"
        : "Significant gaps — focus prep";

  const activeSection = (() => {
    if (activeNav === "technical")
      return {
        title: "Technical Questions",
        count: `${report.technicalQuestions.length} questions`,
        items: report.technicalQuestions,
      };
    if (activeNav === "behavioral")
      return {
        title: "Behavioral Questions",
        count: `${report.behavioralQuestions.length} questions`,
        items: report.behavioralQuestions,
      };
    return {
      title: "Preparation Road Map",
      count: `${report.preparationPlan.length}-day plan`,
      items: report.preparationPlan,
    };
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">

      <div className="w-full p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row rounded-2xl border border-border bg-card overflow-hidden lg:h-[calc(100vh-7rem)]">
          {/* Left Nav */}
          <nav className="w-full lg:w-[220px] flex-shrink-0 p-5 lg:p-6 flex flex-col gap-4 lg:justify-between border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex flex-col gap-1">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                Sections
              </p>
              <div className="flex lg:flex-col gap-1 overflow-x-auto">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center cursor-pointer gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors whitespace-nowrap ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-[var(--surface-elevated)] hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => {
                getResumePdf(interviewId);
                toast.success("Resume download coming soon");
                setTimeout(() => {}, 3000);
              }}
              className="inline-flex items-center cursor-pointer justify-center gap-2 rounded-lg bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:opacity-90 active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              Download Resume
            </button>
          </nav>

          {/* Center */}
          {/* <main className="flex-1 no-scrollbar p-5 sm:p-7 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-border"> */}
          <main className="flex-1 min-h-0 no-scrollbar p-5 sm:p-7 overflow-y-auto">
            <div
              id="center"
              className="flex items-baseline gap-3 pb-4 mb-6 border-b border-border"
            >
              <h2 className="m-0 text-lg font-bold">{activeSection.title}</h2>
              <span className="text-xs text-muted-foreground bg-[var(--surface-elevated)] border border-border rounded-full px-2.5 py-0.5">
                {activeSection.count}
              </span>
            </div>

            {activeNav === "roadmap" ? (
              <div className="relative flex flex-col gap-2 min-h-full">
                <span className="absolute left-[22px] top-0 bottom-0 w-0.5 rounded bg-gradient-to-b from-primary to-primary/10" />
                {report.preparationPlan.map((d) => (
                  <RoadMapDay key={d.day} day={d} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {activeSection.items.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-[240px] flex-shrink-0 p-5 lg:p-6 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <p className="self-start m-0 text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Match Score
              </p>
              <div
                className={`w-[90px] h-[90px] rounded-full border-4 flex flex-col items-center justify-center ${scoreColor}`}
              >
                <span className="text-[1.6rem] font-extrabold leading-none">
                  {report.matchScore}
                </span>
                <span className="text-xs text-muted-foreground -mt-0.5">%</span>
              </div>
              <p className={`m-0 text-xs text-center ${subColor}`}>{subText}</p>
            </div>

            <div className="h-px bg-border" />

            <div className="flex flex-col gap-3">
              <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Skill Gaps
              </p>
              <div className="flex flex-wrap gap-2">
                {report.skillGaps.map((gap, i) => {
                  const tone =
                    gap.severity === "high"
                      ? "text-[#ff4d4d] bg-[#ff4d4d]/10 border-[#ff4d4d]/25"
                      : gap.severity === "medium"
                        ? "text-[#f5a623] bg-[#f5a623]/10 border-[#f5a623]/25"
                        : "text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/25";
                  return (
                    <span
                      key={i}
                      className={`text-[0.775rem] font-medium px-2.5 py-1 rounded-md border ${tone}`}
                    >
                      {gap.skill}
                    </span>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Interview;
