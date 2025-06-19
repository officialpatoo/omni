import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="" 
        width={34} 
        height={34} 
        className="h-8 w-8"
        data-ai-hint="site logo" 
      />
      <h1 className="text-2xl font-headline font-semibold text-foreground">PATOOWORLD PA</h1>
    </div>
  );
}
