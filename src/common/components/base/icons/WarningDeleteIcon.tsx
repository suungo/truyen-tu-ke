type WarningDeleteIconProps = {
  size?: number;
};

export default function WarningDeleteIcon({
  size = 68,
}: WarningDeleteIconProps) {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M29.1562 10.9348L5.15782 50.9981C4.66303 51.855 4.40123 52.8265 4.39846 53.8159C4.39569 54.8054 4.65205 55.7783 5.14203 56.638C5.63202 57.4976 6.33855 58.2139 7.19133 58.7157C8.04411 59.2175 9.01342 59.4873 10.0028 59.4981H57.9995C58.9889 59.4873 59.9582 59.2175 60.811 58.7157C61.6638 58.2139 62.3703 57.4976 62.8603 56.638C63.3503 55.7783 63.6066 54.8054 63.6039 53.8159C63.6011 52.8265 63.3393 51.855 62.8445 50.9981L38.8462 10.9348C38.3411 10.1021 37.6299 9.41364 36.7812 8.93584C35.9326 8.45804 34.9751 8.20703 34.0012 8.20703C33.0272 8.20703 32.0698 8.45804 31.2211 8.93584C30.3724 9.41364 29.6613 10.1021 29.1562 10.9348Z"
          fill="#D32F2F"
        />
        <path
          d="M34 25.5V36.8333"
          stroke="white"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M34 48.168H34.0283"
          stroke="white"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </>
  );
}
