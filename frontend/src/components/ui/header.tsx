import Link from 'next/link';
import Sarathi from "../../../public/Sarathi.png"
import { User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/learning-path', label: 'Learning Path' },
    { href: '/performance-analytics', label: 'Performance Analytics' },
  ];

  return (
  <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between p-4 bg-white shadow-md rounded-2xl">
      {/* Left Section: Logo and Navigation */}
      <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
          <Link href="/student-dashboard" className="text-2xl font-bold text-black hover:text-indigo-300 transition-colors">
            <img src={Sarathi.src} alt="Saarathi Logo" className="h-10"/>
          </Link>
          </div>
      </div>

      {/* Right Section: Profile */}
      <div className="flex items-center space-x-6 text-black">
        <div>
          <nav className="flex space-x-6 text-black">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg transition-colors ${
                    pathname === link.href
                      ? 'text-indigo-600 font-bold underline'
                      : 'hover:text-indigo-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
        </div>
        <Link href="/profile" className="flex items-center">
          <User className="h-8 w-8 text-black hover:text-indigo-300 transition-colors" />
        </Link>
      </div>
    </header>
  );
}
