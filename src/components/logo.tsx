import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.svg" 
        alt="PATOOWORLD PA Logo" 
        width={32} 
        height={32} 
        className="h-8 w-8"
        data-ai-hint="site logo" 
      />
      <h1 className="text-2xl font-headline font-semibold text-foreground">PATOOWORLD PA</h1>
    </div>
  );
}
