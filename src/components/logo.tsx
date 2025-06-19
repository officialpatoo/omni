
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
          d="M25 95 Q15 95 15 85 V15 Q15 5 25 5 H50 Q70 5 75 20 Q85 40 75 60 Q70 75 50 75 H40 V95 H25Z"
          fill="#FFF352"
        />
        <path
          d="M30 90 V10 H47 C57.464 10 65 22.0576 65 38 C65 53.9424 57.464 66 47 66 H30 Z M42 26 V50 H47 C52.18 50 55 46.2512 55 38 C55 29.7488 52.18 26 47 26 H42 Z"
          fill="#1A1A1A"
        />
      </svg>
      <h1 className="text-2xl font-headline font-semibold text-foreground">PATOOWORLD PA</h1>
    </div>
  );
}
