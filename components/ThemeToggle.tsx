"use client";

import { useTheme } from "@/hooks/useTheme";
import { FaMoon, FaSun } from "react-icons/fa";
import { FaDisplay } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { capitalizeWords } from "@/lib/helper/clientHelperfunc";
import type { Theme } from "@/lib/redux-features/theme/theme-slice";

export function ThemeToggle() {
  const { currentTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const options: Array<{ value: Theme; icon: React.ReactNode; label: string }> =
    [
      {
        value: "system",
        icon: <FaDisplay className="h-3.5 w-3.5" />,
        label: "System",
      },
      {
        value: "light",
        icon: <FaSun className="h-3.5 w-3.5" />,
        label: "Light",
      },
      {
        value: "dark",
        icon: <FaMoon className="h-3.5 w-3.5" />,
        label: "Dark",
      },
    ];

  // Prevent mismatches: don't render anything until client is mounted
  if (!mounted) {
    return (
      <div className="flex gap-1 bg-muted px-1 py-0.5 rounded-full border w-fit">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="ghost"
            size="icon"
            className="rounded-full w-7 h-7 text-muted-foreground"
            disabled
          >
            {option.icon}
            <span className="sr-only">{option.label}</span>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 bg-muted px-1 py-0.5 rounded-full border w-fit">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="icon"
          onClick={() => setTheme(option.value)}
          className={cn(
            "rounded-full w-7 h-7 text-muted-foreground hover:text-foreground transition-all duration-200",
            currentTheme === option.value &&
              "bg-background text-foreground shadow-sm ring-1 ring-border"
          )}
          title={capitalizeWords(option.value)}
        >
          {option.icon}
          <span className="sr-only">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
