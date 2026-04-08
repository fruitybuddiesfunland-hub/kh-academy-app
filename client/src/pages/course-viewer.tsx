import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { PRODUCTS } from "@/lib/products";
import {
  BookOpen, ChevronLeft, ChevronRight,
  Menu, X, LogOut, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KHLogo } from "@/components/kh-logo";

import { IntroSection } from "@/components/course/IntroSection";
import { InstructionsSection } from "@/components/course/InstructionsSection";
import { TOCSection } from "@/components/course/TOCSection";
import { PromptsSection } from "@/components/course/PromptsSection";
import { EducationalSection } from "@/components/course/EducationalSection";
import { TemplateSection } from "@/components/course/TemplateSection";
import { WorkflowSection } from "@/components/course/WorkflowSection";
import { CTASection } from "@/components/course/CTASection";
import { SkillsSection } from "@/components/course/SkillsSection";

type CourseSection = {
  title: string;
  type: string;
  content?: string;
  [key: string]: any;
};

type CourseData = {
  product_id: string;
  title: string;
  subtitle: string;
  sections: CourseSection[];
};

function renderSection(section: CourseSection) {
  switch (section.type) {
    case "intro":
      return <IntroSection section={section} />;
    case "instructions":
      return <InstructionsSection section={section} />;
    case "toc":
      return <TOCSection section={section} />;
    case "prompts":
      return <PromptsSection section={section} />;
    case "educational":
      return <EducationalSection section={section} />;
    case "templates":
      return <TemplateSection section={section} />;
    case "workflow":
      return <WorkflowSection section={section} />;
    case "cta":
      return <CTASection section={section} />;
    case "skills":
      return <SkillsSection section={section} />;
    case "system":
      return <WorkflowSection section={section} />;
    case "advanced":
      return <EducationalSection section={section} />;
    case "tips":
      return <EducationalSection section={section} />;
    case "overview":
      return <EducationalSection section={section} />;
    default:
      return <EducationalSection section={section} />;
  }
}

export default function CourseViewer() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ productId: string }>();
  const productId = params.productId || "";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const productInfo = PRODUCTS[productId];

  const { data: courseData, isLoading, error } = useQuery<CourseData>({
    queryKey: ["/api/course", productId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && !!productId,
  });

  if (!user) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading course...</div>
      </div>
    );
  }

  if (error) {
    const is403 = error.message?.includes("403");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {is403 ? "Purchase Required" : "Course Not Found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {is403
              ? `You need to purchase ${productInfo?.title || "this course"} to access this content.`
              : "The course you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!courseData) return null;

  const sections = courseData.sections;
  const currentSection = sections[activeSectionIdx];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const goToSection = (idx: number) => {
    setActiveSectionIdx(idx);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border z-50 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <a onClick={() => navigate("/dashboard")} className="cursor-pointer">
            <KHLogo />
          </a>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-4 py-3 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {productInfo?.label || "Course"}
          </h3>
          <p className="text-sm font-medium truncate">{courseData.title}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => goToSection(idx)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                activeSectionIdx === idx
                  ? "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="text-[10px] font-mono shrink-0 w-5 text-right opacity-60">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate">{section.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
            <BookMarked className="w-4 h-4 mr-2" />
            All Courses
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 lg:px-8 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {activeSectionIdx + 1}/{sections.length}
            </Badge>
            <h2 className="font-semibold text-sm truncate">
              {currentSection?.title}
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
        </div>

        <div className="p-4 lg:p-8 max-w-4xl">
          {currentSection && renderSection(currentSection)}

          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border/50">
            {activeSectionIdx > 0 ? (
              <Button
                variant="ghost"
                onClick={() => goToSection(activeSectionIdx - 1)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-[200px]">
                  {sections[activeSectionIdx - 1].title}
                </span>
                <span className="sm:hidden">Previous</span>
              </Button>
            ) : <div />}
            {activeSectionIdx < sections.length - 1 ? (
              <Button
                variant="ghost"
                onClick={() => goToSection(activeSectionIdx + 1)}
                className="gap-2"
              >
                <span className="hidden sm:inline truncate max-w-[200px]">
                  {sections[activeSectionIdx + 1].title}
                </span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : <div />}
          </div>
        </div>
      </main>
    </div>
  );
}
