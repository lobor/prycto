interface PryctoLogoProps {
  className?: string;
}

const PryctoLogo = ({ className }: PryctoLogoProps) => {
  return (
    <svg
      className={className}
      width="65.954mm"
      height="65.954mm"
      version="1.1"
      viewBox="0 0 65.954 65.954"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-62.087 -81.915)">
        <circle
          cx="95.064"
          cy="114.89"
          r="32.977"
          fill="#111827"
          strokeWidth=".26458"
        />
      </g>
      <g transform="translate(-62.087 -81.915)">
        <g transform="translate(-8.7256 2.3129)" fill="#3b82f6">
          <text
            x="89.222015"
            y="132.85631"
            fontFamily="sans-serif"
            fontSize="51.615px"
            strokeWidth="1.2904"
            style={{ lineHeight: 1.25 }}
            xmlSpace="preserve"
          >
            <tspan
              x="89.222015"
              y="132.85631"
              fill="#3b82f6"
              strokeWidth="1.2904"
            >
              P
            </tspan>
          </text>
          <rect
            x="101.48"
            y="92.325"
            width="3.3233"
            height="30.521"
            fillRule="evenodd"
            strokeWidth=".2024"
          />
          <rect
            x="107.26"
            y="92.302"
            width="3.3233"
            height="30.521"
            fillRule="evenodd"
            strokeWidth=".2024"
          />
        </g>
      </g>
    </svg>
  );
};

export default PryctoLogo;
