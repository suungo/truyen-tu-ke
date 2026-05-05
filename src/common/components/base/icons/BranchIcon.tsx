type PropTypes = {
  className?: string;
  height?: string | number;
  width?: string | number;
  isActive?: boolean;
};

export default function BranchIcon({
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
        d="M16.75 13.4995V14.7495H7.25V13.4995C7.25 12.9095 7.41 12.7495 8 12.7495H16C16.59 12.7495 16.75 12.9095 16.75 13.4995ZM7.25 17.7495H16.75V16.2495H7.25V17.7495ZM7.25 20.6994C7.25 20.8654 7.38405 20.9995 7.55005 20.9995H16.45C16.616 20.9995 16.75 20.8654 16.75 20.6994V19.2495H7.25V20.6994ZM21 8.58954V19.4995C21 20.3275 20.328 20.9995 19.5 20.9995H18.55C18.384 20.9995 18.25 20.8654 18.25 20.6994V13.4995C18.25 12.2565 17.243 11.2495 16 11.2495H8C6.757 11.2495 5.75 12.2565 5.75 13.4995V20.6994C5.75 20.8654 5.61595 20.9995 5.44995 20.9995H4.5C3.672 20.9995 3 20.3275 3 19.4995V8.58954C3 8.03954 3.29002 7.53947 3.77002 7.26947L11.03 3.24945C11.63 2.91945 12.37 2.91945 12.97 3.24945L20.23 7.26947C20.7 7.53947 21 8.03954 21 8.58954ZM14.25 7.99945C14.25 7.58545 13.914 7.24945 13.5 7.24945H10.5C10.086 7.24945 9.75 7.58545 9.75 7.99945C9.75 8.41345 10.086 8.74945 10.5 8.74945H13.5C13.914 8.74945 14.25 8.41345 14.25 7.99945Z"
        fill="url(#paint0_linear_4571_20925)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4571_20925"
          x1={12}
          y1="3.00195"
          x2={12}
          y2="20.9995"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={isActive ? "#ffffff" : "#00B4DB"} />
          <stop offset={1} stopColor={isActive ? "#ffffff" : "#038EB7"} />
        </linearGradient>
      </defs>
    </svg>
  );
}
