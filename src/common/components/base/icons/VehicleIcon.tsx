type PropTypes = {
  className?: string;
  height?: string | number;
  width?: string | number;
  isActive?: boolean;
};

export default function VehicleIcon({
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
        d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 6.5H17.5L19 12H5L6.5 6.5ZM7 13.5C7.83 13.5 8.5 14.17 8.5 15S7.83 16.5 7 16.5 5.5 15.83 5.5 15 6.17 13.5 7 13.5ZM17 13.5C17.83 13.5 18.5 14.17 18.5 15S17.83 16.5 17 16.5 15.5 15.83 15.5 15 16.17 13.5 17 13.5Z"
        fill="url(#paint0_linear_vehicle_icon)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_vehicle_icon"
          x1={12}
          y1="5"
          x2={12}
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
      </defs>
    </svg>
  );
}
