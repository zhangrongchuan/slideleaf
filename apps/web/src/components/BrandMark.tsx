import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  nameClassName?: string;
  markClassName?: string;
};

const sizeClass = {
  sm: "h-7 w-9",
  md: "h-9 w-12",
  lg: "h-10 w-14"
};

export function BrandMark({
  href,
  showName = true,
  size = "md",
  className = "",
  nameClassName = "text-sm font-semibold",
  markClassName = ""
}: BrandMarkProps) {
  const content = (
    <>
      <span
        className={`grid shrink-0 place-items-center bg-transparent ${sizeClass[size]} ${markClassName}`}
      >
        <img src="/logo.png" alt="" className="h-full w-full object-contain" />
      </span>
      {showName ? <span className={nameClassName}>SlideLeaf</span> : null}
    </>
  );

  const classes = `inline-flex min-w-0 items-center gap-2.5 ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
