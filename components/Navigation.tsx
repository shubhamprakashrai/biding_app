'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Home, LogIn, UserPlus, LayoutDashboard, Settings, ChevronDown } from 'lucide-react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  email: string;
  role: 'USER' | 'ADMIN';
  name: string;
  photoURL?: string;
  uid: string;
}

export default function Navigation() {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;

  const publicLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/login', label: 'Login', icon: LogIn },
    { href: '/register', label: 'Register', icon: UserPlus },
  ];

  const userLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const adminLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/admin', label: 'Admin Panel', icon: Settings },
  ];

  const getLinks = () => {
    if (!currentUser) return publicLinks;
    return currentUser.role === 'ADMIN' ? adminLinks : userLinks;
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Check for user data in localStorage on component mount
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          console.log('Initial user data from localStorage:', userData);
          
          if (userData) {
            try {
              const parsedData = JSON.parse(userData);
              console.log('Parsed user data:', parsedData);
              if (isMounted) {
                setCurrentUser(parsedData);
              }
            } catch (parseError) {
              console.error('Error parsing user data:', parseError);
              localStorage.removeItem('user'); // Remove corrupted data
            }
          } else {
            console.log('No user data found in localStorage');
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        console.log('Auth state changed:', user);
        if (user && isMounted) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData);
            const userInfo = {
              email: userData.email || user.email || '',
              name: userData.name || user.displayName || 'User',
              role: userData.role || 'USER',
              photoURL: userData.photoURL || user.photoURL || '',
              uid: user.uid
            };
            
            setCurrentUser(userInfo);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(userInfo));
            }
          } else {
            console.log('User document does not exist in Firestore');
            // Handle case where user exists in Auth but not in Firestore
            const fallbackUserInfo = {
              email: user.email || '',
              name: user.displayName || 'User',
              role: 'USER' as const,
              photoURL: user.photoURL || '',
              uid: user.uid
            };
            setCurrentUser(fallbackUserInfo);
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(fallbackUserInfo));
            }
          }
        } else if (!user && isMounted) {
          console.log('No user signed in');
          setCurrentUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const profileDropdown = target.closest('.profile-dropdown');
      const profileButton = target.closest('.profile-button');
      
      if (!profileDropdown && !profileButton && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      setIsProfileOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleImageError = (imageUrl: string) => {
    console.log('Image failed to load:', imageUrl);
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.add(imageUrl);
      return newSet;
    });
  };

  const shouldShowImage = (photoURL: string | undefined) => {
    return photoURL && !imageErrors.has(photoURL);
  };

  const UserAvatar = ({ size = 'small', user }: { size?: 'small' | 'large', user: UserData }) => {
    const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
    const textSizeClass = size === 'small' ? 'text-sm' : 'text-lg';
    
    if (shouldShowImage(user.photoURL)) {
      return (
        <>
          <img 
            src={user.photoURL} 
            alt={user.name || 'User'} 
            className={`${sizeClasses} rounded-full object-cover border-2 border-cyan-400/40 shadow-md transition-all duration-300 hover:scale-105 hover:border-cyan-300/60`}
            onError={() => handleImageError(user.photoURL!)}
            onLoad={() => console.log('Image loaded successfully:', user.photoURL)}
          />
        </>
      );
    }
    
    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold ${textSizeClass} shadow-md border border-cyan-400/60 hover:scale-105 hover:border-cyan-300/80 transition-all duration-300`}>
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 backdrop-blur-md border-b border-blue-700/30 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl animate-pulse border border-cyan-400/20"></div>
              <div className="h-7 w-32 bg-gradient-to-r from-cyan-300/20 to-blue-400/20 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl animate-pulse border border-cyan-400/10"></div>
                ))}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 animate-pulse border border-cyan-400/20"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 backdrop-blur-md border-b border-blue-700/30 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] border-2 border-cyan-300/30">
              <span className="text-white font-bold text-sm">BID</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-blue-400 bg-clip-text text-transparent">
              {currentUser?.name?.split(' ')[0] || 'BidHub'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {getLinks().map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center space-x-2.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-lg shadow-cyan-500/10 border border-cyan-400/30 backdrop-blur-sm'
                      : 'text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 border border-transparent hover:border-cyan-400/20 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                  }`}
                >
                  <Icon 
                    size={18} 
                    className={`transition-transform duration-300 ${isActive(link.href) ? 'text-cyan-300 scale-110' : 'text-blue-200 group-hover:text-cyan-300 group-hover:scale-110'}`} 
                  />
                  <span className="relative">
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cyan-400/80 rounded-full"></span>
                    )}
                  </span>
                </Link>
              );
            })}

            {currentUser && (
              <div className="relative ml-1">
                <button
                  className="profile-button flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-sm font-medium text-white/90 hover:text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 border border-white/10 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Profile button clicked, current state:', isProfileOpen);
                    setIsProfileOpen(!isProfileOpen);
                  }}
                >
                  <UserAvatar size="small" user={currentUser} />
                  <span className="hidden lg:inline">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="profile-dropdown absolute right-0 mt-2 w-64 rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 backdrop-blur-xl shadow-2xl ring-1 ring-cyan-500/20 focus:outline-none z-50 overflow-hidden border border-cyan-400/20">
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-cyan-400/20 flex items-center space-x-3">
                      <div className="relative">
                        <UserAvatar size="large" user={currentUser} />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-blue-900"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                        <div className="flex items-center mt-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
                            {currentUser.role === 'ADMIN' ? 'Administrator' : 'User'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <Link
                        href="/userprofile"
                        className="group flex items-center w-full text-left px-4 py-2.5 text-sm text-blue-100 hover:bg-cyan-500/10 hover:text-white transition-all duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="w-1 h-1 rounded-full bg-cyan-400 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200"></span>
                        <span className="flex-1">Your Profile</span>
                        <span className="text-blue-300/50 group-hover:text-cyan-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                      </Link>
                      <Link
                        href="/settings"
                        className="group flex items-center w-full text-left px-4 py-2.5 text-sm text-blue-100 hover:bg-cyan-500/10 hover:text-white transition-all duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="w-1 h-1 rounded-full bg-cyan-400 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200"></span>
                        <span className="flex-1">Settings</span>
                        <span className="text-blue-300/50 group-hover:text-cyan-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                      </Link>
                    </div>
                    <div className="py-1.5 border-t border-cyan-400/10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Logout button clicked');
                          handleLogout();
                        }}
                        className="group flex items-center w-full text-left px-4 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10 transition-all duration-200"
                      >
                        <span className="w-1 h-1 rounded-full bg-rose-400 mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200"></span>
                        <span className="flex-1">Sign out</span>
                        <span className="text-blue-300/50 group-hover:text-rose-300 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-200 hover:bg-blue-800/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-300 border border-transparent hover:border-cyan-400/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-gradient-to-b from-blue-900 to-blue-950 backdrop-blur-xl rounded-xl shadow-2xl mx-2 my-2 overflow-hidden border border-blue-700/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive(link.href)
                        ? 'text-white bg-blue-800/60 border border-cyan-500/30 shadow-md'
                        : 'text-blue-200 hover:text-white hover:bg-blue-800/40 border border-transparent hover:border-cyan-400/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    }`}
                  >
                    <Icon size={20} className={isActive(link.href) ? 'text-cyan-300' : 'text-blue-300 group-hover:text-cyan-300'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {currentUser && (
                <div className="pt-3 border-t border-blue-800/50 mt-3">
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <UserAvatar size="large" user={currentUser} />
                    <div>
                      <p className="text-sm font-medium text-white">{currentUser.name}</p>
                      <p className="text-xs text-cyan-300/80">{currentUser.role === 'ADMIN' ? 'Administrator' : 'User'}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/userprofile"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-blue-100 hover:bg-blue-800/50 hover:text-white transition-colors"
                    >
                      Your Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-blue-100 hover:bg-blue-800/50 hover:text-white transition-colors"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Mobile logout clicked');
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors hover:text-rose-300"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}