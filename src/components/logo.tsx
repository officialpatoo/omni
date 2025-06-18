import { Bot } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Bot className="h-8 w-8 text-primary" />
      <h1 className="text-2xl font-headline font-semibold text-foreground">PATOOWORLD PA</h1>
    </div>
  );
}
