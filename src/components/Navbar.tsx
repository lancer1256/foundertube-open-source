import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon, PlayIcon, Bars3Icon, XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [email, setEmail] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [afterDate, setAfterDate] = useState('');
  const [beforeDate, setBeforeDate] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const navigate = useNavigate();
  const { isSignedIn, userEmail, setSignedIn, signOut } = useAuth();

  // Refs for detecting outside clicks on the date picker
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);

  // Close date picker if user clicks outside it or its trigger
  useEffect(() => {
    if (!showDatePicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(target) &&
        dateTriggerRef.current &&
        !dateTriggerRef.current.contains(target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Helper: YYYY-MM-DD for N years ago
  const dateYearsAgo = (years: number): string => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    return d.toISOString().slice(0, 10);
  };

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (afterDate) params.set('after', afterDate);
    if (beforeDate) params.set('before', beforeDate);
    if (durationFilter) params.set('dur', durationFilter);
    return `/search?${params.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(buildSearchUrl());
    setShowDatePicker(false);
    setShowMobileMenu(false);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSignedIn(email.trim());
      setShowSignInModal(false);
      setEmail('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <PlayIcon className="h-8 w-8 text-red-600" />
                <span className="text-xl font-bold text-white hidden sm:block">FounderTube</span>
                <span className="text-lg font-bold text-white sm:hidden">FT</span>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                {/* Date picker trigger (desktop) */}
                <button
                  type="button"
                  ref={dateTriggerRef}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                >
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                </button>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="youtube-input pl-10 pr-20"
                />

                {/* Clear search */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}

                {/* Execute search */}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </button>
              </form>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/playlists" 
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Playlists
              </Link>
              
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <UserCircleIcon className="h-8 w-8 text-green-500" />
                    <span className="text-sm text-gray-300 max-w-[100px] truncate">{userEmail}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="youtube-button text-sm"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2 inline" />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button and Search Icon */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-400 hover:text-white"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <button
                  type="button"
                  ref={dateTriggerRef}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                >
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                </button>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="youtube-input pl-10 pr-20"
                />

                {/* Clear */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-10 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400" />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </button>
              </form>

              {/* Mobile Menu Items */}
              <div className="space-y-2">
                <Link 
                  to="/playlists"
                  onClick={() => setShowMobileMenu(false)}
                  className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium bg-gray-700 hover:bg-gray-600"
                >
                  <span className="flex items-center">
                    📋 Playlists
                  </span>
                </Link>
                
                {isSignedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-3 bg-green-900 rounded-md">
                      <UserCircleIcon className="h-8 w-8 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-green-100 truncate block">{userEmail}</span>
                        <span className="text-xs text-green-300">Signed in</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowMobileMenu(false);
                      }}
                      className="w-full text-left text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium bg-gray-700 hover:bg-gray-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowSignInModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left youtube-button py-3 text-base"
                  >
                    <UserCircleIcon className="h-6 w-6 mr-3 inline" />
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Simple Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Sign In to FounderTube</h3>
            <p className="text-gray-300 text-sm mb-4">
              Since you're already signed into YouTube in your browser, the embedded player will automatically use your account (including Premium benefits). Just enter your email to track your sign-in status in FounderTube.
            </p>
            <form onSubmit={handleSignIn}>
              <div className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email (e.g., your@gmail.com)"
                  className="youtube-input"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="youtube-button order-1 sm:order-2"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date dropdown */}
      {showDatePicker && (
        <div ref={datePickerRef} className="absolute mt-2 bg-gray-800 border border-gray-700 rounded-lg p-4 z-50 w-72">
          <div className="flex flex-col space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">After</label>
              <input type="date" value={afterDate} onChange={(e) => setAfterDate(e.target.value)} className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-gray-300">Before</label>
              <input type="date" value={beforeDate} onChange={(e) => setBeforeDate(e.target.value)} className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none flex-1" />
              <select
                value=""
                onChange={(e) => {
                  const yrs = parseInt(e.target.value, 10);
                  if (yrs) setBeforeDate(dateYearsAgo(yrs));
                }}
                className="bg-gray-700 text-white text-xs rounded px-1 py-1 focus:outline-none"
              >
                <option value="" disabled>Preset</option>
                <option value="5">&lt; 5y</option>
                <option value="10">&lt; 10y</option>
                <option value="15">&lt; 15y</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <label className="text-gray-300">Duration</label>
              <select
                value={durationFilter}
                onChange={(e)=>setDurationFilter(e.target.value)}
                className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none flex-1"
              >
                <option value="">Any</option>
                <option value="4-20">4–20 min</option>
                <option value="20+">Over 20 min</option>
              </select>
            </div>
            <button onClick={() => {setShowDatePicker(false); navigate(buildSearchUrl());}} className="youtube-button py-1 text-xs">Apply</button>
          </div>
        </div>
      )}
    </>
  );
} 