import Link from 'next/link';
import Image from 'next/image';
import BrandLogo from './BrandLogo';
import { siteConfig, socialLinks } from '../config/site';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-borderC bg-heading text-slate-300 mt-0">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="mb-4">
            <BrandLogo variant="lockup" size={32} inverted />
          </div>
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-5">{siteConfig.description}</p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-btn border border-slate-600 text-slate-300 hover:border-primary hover:text-white transition"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-3">Explore</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/explore" className="hover:text-primary transition">
              All products
            </Link>
            <Link href="/categories" className="hover:text-primary transition">
              Categories
            </Link>
            <Link href="/#trending" className="hover:text-primary transition">
              Trending
            </Link>
            <Link href="/pricing" className="hover:text-primary transition">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-primary transition">
              Blog
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-3">Company</p>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/about" className="hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary transition">
              Contact
            </Link>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-primary transition">
              {siteConfig.email}
            </a>
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold text-white mb-3">Stay updated</p>
          <p className="text-sm text-slate-400 mb-4">Launches, rankings, and founder tips.</p>
          <Link
            href="/contact"
            className="inline-flex px-4 py-2.5 rounded-btn text-sm font-semibold bg-primary text-white hover:bg-primary-hover"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-700">
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-500">
          <span>
            © {year} {siteConfig.domain}  {siteConfig.tagline}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Image src={siteConfig.iconPath} alt="" width={18} height={18} className="rounded-[4px]" />
            Built for founders
          </span>
        </div>
      </div>
    </footer>
  );
}
