
"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle() {
  const { activeTheme, setPreferredTheme } = useTheme();

  const handleToggle = () => {
    // This toggle will switch the preferred theme between light and dark explicitly.
    if (activeTheme === 'light') {
      setPreferredTheme('dark');
    } else {
      setPreferredTheme('light');
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Toggle theme">
      {/* Icon should reflect the currently active theme */}
      {activeTheme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}
