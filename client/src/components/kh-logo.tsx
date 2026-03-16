export function KHLogo({ size = "sm", href }: { size?: "sm" | "md"; href?: string }) {
  const dim = size === "md" ? "w-9 h-9" : "w-7 h-7";
  const inner = (
    <div className="inline-flex items-center gap-2">
      <img
        src="/kh-icon.png"
        alt="KH Academy"
        className={`${dim} rounded-lg`}
      />
      <span className={`font-bold ${size === "md" ? "text-lg" : "text-sm"}`}>
        KH Academy
      </span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="hover:opacity-80 transition-opacity">
        {inner}
      </a>
    );
  }

  return inner;
}
