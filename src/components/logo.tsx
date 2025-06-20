import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  fill?: boolean;
}

export function Logo({ className, priority, width, height, fill = false }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      {fill ? (
        <Image 
          src="/logo.svg" 
          alt="PATOOWORLD PA Logo" 
          priority={priority} 
          fill 
          style={{ objectFit: 'contain' }}
          data-ai-hint="site logo"
        />
      ) : (
        <Image 
          src="/logo.svg" 
          alt="PATOOWORLD PA Logo" 
          priority={priority} 
          width={width || 0} // width and height are required if not fill
          height={height || 0} // width and height are required if not fill
          data-ai-hint="site logo"
        />
      )}
    </div>
  );
}