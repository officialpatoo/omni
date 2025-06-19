
export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        className="h-8 w-8"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M15 95 Q5 95 5 80 V20 Q5 5 20 5 H55 Q85 5 92 25 Q100 45 92 65 Q85 85 55 85 H45 V95 H15Z"
          fill="#FFF352"
        />
        <path
          d="M30 75 V25 H47 C57.464 25 65 32.536 65 42.5 C65 52.464 57.464 60 47 60 H30 Z M42 35 V50 H47 C52.18 50 55 47.657 55 42.5 C55 37.343 52.18 35 47 35 H42 Z"
          fill="#1A1A1A"
        />
      </svg>
      <h1 className="text-2xl font-headline font-semibold text-foreground">PATOOWORLD PA</h1>
    </div>
  );
}
