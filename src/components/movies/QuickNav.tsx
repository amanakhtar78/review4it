"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  GanttChartSquare,
  Newspaper,
  TrendingUp,
  Clapperboard,
  Puzzle,
} from "lucide-react";
import QuizPopup from "./QuizPopup";

export default function QuickNav() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const navItems = [
    { label: "Daily Quiz", action: "openQuiz" as const, icon: Puzzle },
    { label: "In Theaters", href: "#in-theaters", icon: Clapperboard },
    { label: "Upcoming", href: "#upcoming-movies", icon: ArrowDown },
    { label: "Yearly Summary", href: "#yearly-summary", icon: TrendingUp },
    { label: "Movie News", href: "#movie-news", icon: Newspaper },
    { label: "Box Office", href: "#box-office-report", icon: GanttChartSquare },
  ];

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Card className="custom-card-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex overflow-x-auto overflow-y-hidden items-center md:justify-center gap-2 sm:gap-3">
            {navItems.map((item) =>
              item.action === "openQuiz" ? (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={() => setIsQuizOpen(true)}
                >
                  <item.icon className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                  {item.label}
                </Button>
              ) : (
                <Button
                  key={item.label}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                  asChild
                >
                  <a
                    href={item.href!}
                    onClick={(e) => handleScroll(e, item.href!)}
                  >
                    <item.icon className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                    {item.label}
                  </a>
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
      <QuizPopup isOpen={isQuizOpen} setIsOpen={setIsQuizOpen} />
    </>
  );
}
