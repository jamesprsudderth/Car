export default function CarLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 283 95"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="
          M 0,95
          C 5,93 12,90 22,87
          C 32,84 42,80 55,74
          C 65,69 75,63 87,54
          C 96,47 105,39 116,30
          C 125,23 135,16 148,11
          C 161,6 175,3 192,2
          C 209,1 224,2 237,5
          C 247,7 255,11 261,17
          C 267,23 271,30 274,38
          L 278,34
          C 280,37 281,42 282,48
          C 283,55 283,63 283,72
          C 283,80 283,88 283,95
          L 0,95
          Z
        "
        fill="currentColor"
      />
    </svg>
  );
}
