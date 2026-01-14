import { forwardRef } from 'react';

/**
 * Icono de Vaca - Perfil Lateral Estilo Lucide React
 * Para PWA Install Prompt y branding
 */
export const CowIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 14c0 2 2 2 2 4v2" />
    <path d="M20 14c0 2-2 2-2 4v2" />
    <path d="M20 10V6a2 2 0 0 0-2-2h-3l-2-2h-4L7 6H4a2 2 0 0 0-2 2v2" />
    <path d="M4 14h16" />
    <path d="M2 10h3" />
  </svg>
));
CowIcon.displayName = 'CowIcon';

// Alias para compatibilidad hacia atrás
export const Cow = CowIcon;
