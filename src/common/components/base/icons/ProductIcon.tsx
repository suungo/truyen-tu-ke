type PropTypes = {
  className?: string;
  height?: string | number;
  width?: string | number;
  isActive?: boolean;
};

export default function ProductIcon({
  className,
  isActive = false,
  height = 24,
  width = 24,
}: PropTypes) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.48 11.1486C10.73 11.2586 10.99 11.3286 11.25 11.3886V20.9086C11.09 20.8686 10.93 20.8086 10.78 20.7386L4.78003 18.0686C3.70003 17.5886 3 16.5186 3 15.3286V8.6686C3 8.3986 3.03999 8.12859 3.10999 7.87859L10.48 11.1486ZM14.8199 8.9186L6.67004 5.08858L4.78003 5.92858C4.43003 6.07858 4.13 6.29858 3.87 6.55858L11.08 9.76857C11.66 10.0286 12.33 10.0286 12.92 9.76857L14.8199 8.9186ZM20.13 6.55858C19.87 6.29858 19.57 6.07858 19.22 5.92858L13.22 3.25859C12.44 2.90859 11.56 2.90859 10.78 3.25859L8.48999 4.27858L16.64 8.10857L20.13 6.55858ZM20.89 7.87859L17.38 9.43859V11.8886C17.38 12.2986 17.04 12.6386 16.63 12.6386C16.22 12.6386 15.88 12.2986 15.88 11.8886V10.0986L13.52 11.1486C13.27 11.2486 13.01 11.3286 12.75 11.3886V20.9086C12.91 20.8686 13.07 20.8086 13.22 20.7386L19.22 18.0686C20.3 17.5886 21 16.5186 21 15.3286V8.6686C21 8.3986 20.96 8.12859 20.89 7.87859Z"
        fill="url(#paint0_linear_4571_20959)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4571_20959"
          x1={12}
          y1="2.99609"
          x2={12}
          y2="20.9086"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
      </defs>
    </svg>
  );
}
