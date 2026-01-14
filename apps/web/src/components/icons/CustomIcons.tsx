import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * Icono de Vaca - Estilo Lucide React
 * Para PWA Install Prompt y branding
 */
export const Cow = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className = '', size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cabeza */}
      <circle cx="12" cy="10" r="6" />

      {/* Orejas */}
      <path d="M 7 6 Q 6 4 5 3" />
      <path d="M 17 6 Q 18 4 19 3" />

      {/* Ojos */}
      <circle cx="10" cy="9" r="1" fill="currentColor" />
      <circle cx="14" cy="9" r="1" fill="currentColor" />

      {/* Hocico */}
      <path d="M 11 11 Q 12 12 13 11" />
      <path d="M 11 11 L 10 13" />
      <path d="M 13 11 L 14 13" />

      {/* Cuerpo */}
      <ellipse cx="12" cy="18" rx="5" ry="3" />

      {/* Patas */}
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="12" y1="20" x2="12" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="18" y1="20" x2="18" y2="23" />

      {/* Cola */}
      <path d="M 16 17 Q 19 17 20 15" />
    </svg>
  )
);

Cow.displayName = 'Cow';
