import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface Props {
  children: ReactNode;
  /** Extra classes on <main> */
  className?: string;
  /** Constrain content width (default true) */
  contained?: boolean;
}

/**
 * Full-viewport page shell: header + stretching main + footer pinned to bottom.
 */
export default function PageShell({ children, className = '', contained = true }: Props) {
  return (
    <div className="flex flex-col flex-1 min-h-dvh">
      <Header />
      <main
        className={`flex-1 flex flex-col w-full ${
          contained ? 'max-w-[1100px] mx-auto px-4 sm:px-6 py-10 sm:py-14' : ''
        } ${className}`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
