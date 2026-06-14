import React, { useState } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import logo from '../../assets/AluminiLogo.png'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <div>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 w-full z-50">
        <nav className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6 lg:px-1">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <a href="/" className="flex items-center">
              <img src={logo} alt="Alumini Logo" className="h-13 w-auto" />
              {/* <AcademicCapIcon  className="h-8 w-8 text-indigo-600 ml-2" /> */}
              {/* <h2 className="ml-2 text-xl font-bold text-gray-900"> Alumini Connect</h2> */}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="/Login"
              className="inline-block px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-150"
            >
              Sign In
            </a>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-0 w-40 bg-white shadow-lg rounded-b-lg z-40">
            <div className="flex flex-col p-4 space-y-3">
              {/* Sign In / Login buttons */}
              <Link
                to={"/Login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600 font-medium text-center py-2 border rounded-md"
              >
                Sign In
              </Link>
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-indigo-600 font-medium text-center py-2 border rounded-md"
              >
                Login
              </a>

              {/* Optional Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700 self-center"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  )
}

export default Header
