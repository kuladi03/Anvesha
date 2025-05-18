import Link from 'next/link';
import Image from 'next/image';
import Sarathi from "../../../public/Sarathi.png";
import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/learning-path', label: 'Learning Path' },
    { href: '/performance-analytics', label: 'Performance Analytics' },
    { href: '/dashboard', label: 'Anvesha' },
  ];

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-5xl z-50 flex items-center justify-between px-6 py-3 bg-white shadow-lg rounded-2xl">
      {/* Logo */}
      <Link href="/student-dashboard" className="flex items-center space-x-2">
        <Image src={Sarathi} alt="Saarathi Logo" height={40} className="w-auto h-10" />
      </Link>

      {/* Navigation */}
      <nav className="flex space-x-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-base font-medium transition-colors ${
              pathname === link.href
                ? 'text-indigo-600 font-bold underline underline-offset-4'
                : 'text-gray-700 hover:text-indigo-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Profile */}
      <Link href="/profile" className="flex items-center">
        <User className="h-8 w-8 text-gray-700 hover:text-indigo-400 transition-colors" />
      </Link>
    </header>
  );
}
