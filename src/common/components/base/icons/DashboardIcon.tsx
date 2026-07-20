type PropTypes = {
  className?: string;
  height?: string | number;
  width?: string | number;
  isActive?: boolean;
};

export default function DashboardIcon({
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
        d="M11 19.9V4.1C11 2.6 10.36 2 8.77 2H4.73C3.14 2 2.5 2.6 2.5 4.1V19.9C2.5 21.4 3.14 22 4.73 22H8.77C10.36 22 11 21.4 11 19.9Z"
        fill="url(#paint0_linear_4571_20908)"
      />
      <path
        d="M21.5 19.64V15.36C21.5 14.06 20.5 13 19.27 13H15.23C14 13 13 14.06 13 15.36V19.64C13 20.94 14 22 15.23 22H19.27C20.5 22 21.5 20.94 21.5 19.64Z"
        fill="url(#paint1_linear_4571_20908)"
      />
      <path
        d="M21.5 8.64V4.36C21.5 3.06 20.5 2 19.27 2H15.23C14 2 13 3.06 13 4.36V8.64C13 9.94 14 11 15.23 11H19.27C20.5 11 21.5 9.94 21.5 8.64Z"
        fill="url(#paint2_linear_4571_20908)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4571_20908"
          x1="6.75"
          y1={2}
          x2="6.75"
          y2={22}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_4571_20908"
          x1="17.25"
          y1={13}
          x2="17.25"
          y2={22}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_4571_20908"
          x1="17.25"
          y1={2}
          x2="17.25"
          y2={11}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
      </defs>
    </svg>
  );
}
