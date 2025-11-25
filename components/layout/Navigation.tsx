'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Home, LogIn, UserPlus, LayoutDashboard, Settings, ChevronDown, Cog } from 'lucide-react';
import { useAuthViewModel } from '@/viewmodels/AuthViewModel';
import { authService } from '@/services/firebase/AuthService';
import { userRepository } from '@/services/firebase/UserRepository';
import { UserWithTokens } from '@/services/firebase/UserRepository';

export default function Navigation() {
  const [currentUser, setCurrentUser] = useState<UserWithTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { signOut } = useAuthViewModel();

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

  const devLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dev-dashboard', label: 'Dev Panel', icon: Cog },
  ];

  const getLinks = () => {
    if (!currentUser) return publicLinks;

    switch (currentUser.role) {
      case "ADMIN":
        return adminLinks;
      case "DEV":
        return devLinks;
      case "USER":
      default:
        return userLinks;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check for user data in localStorage on component mount
        const storedUser = authService.getStoredUser();
        if (storedUser && isMounted) {
          setCurrentUser(storedUser);
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

    // Set up auth state listener using AuthService
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser && isMounted) {
          // Fetch fresh user data from Firestore using UserRepository
          const userData = await userRepository.getUserById(firebaseUser.uid);

          if (userData) {
            const userInfo: UserWithTokens = {
              uid: userData.uid,
              email: userData.email || firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'User',
              role: userData.role || 'USER',
              photoURL: userData.photoURL || firebaseUser.photoURL || '',
            };

            setCurrentUser(userInfo);

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(userInfo));
            }
          } else {
            // Handle case where user exists in Auth but not in Firestore
            const fallbackUserInfo: UserWithTokens = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'USER',
              photoURL: firebaseUser.photoURL || '',
            };
            setCurrentUser(fallbackUserInfo);

            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(fallbackUserInfo));
            }
          }
        } else if (!firebaseUser && isMounted) {
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
      await signOut();
      setCurrentUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.add(imageUrl);
      return newSet;
    });
  };

  const shouldShowImage = (photoURL: string | undefined) => {
    return photoURL && !imageErrors.has(photoURL);
  };

  const UserAvatar = ({ size = 'small', user }: { size?: 'small' | 'large', user: UserWithTokens }) => {
    const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
    const textSizeClass = size === 'small' ? '' : 'text-lg';

    if (shouldShowImage(user.photoURL)) {
      return (
        <img
          src={user.photoURL}
          alt={user.name || 'User'}
          className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-sm`}
          onError={() => handleImageError(user.photoURL!)}
        />
      );
    }

    return (
      <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-medium ${textSizeClass}`}>
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  if (loading) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <span className="text-white font-bold text-sm">SCL</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {'SourceCodeLelo'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getLinks().map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-emerald-600 bg-emerald-50/80 shadow-sm'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50/50'
                  }`}
                >
                  <Icon size={18} className={isActive(link.href) ? 'text-emerald-500' : 'text-gray-400'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {currentUser && (
              <div className="relative ml-2">
                <button
                  className="profile-button flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50/50 transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
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
                  <div className="profile-dropdown absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                      <UserAvatar size="large" user={currentUser} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">
                          {currentUser.role === "ADMIN"
                            ? "Administrator"
                            : currentUser.role === "DEV"
                            ? "Developer"
                            : "User"}
                        </p>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/userprofile"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Your Profile
                      </Link>
                      {currentUser.role === 'ADMIN' && (
                        <Link
                          href="/list-users"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setIsProfileOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700
                          hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          List Users
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                    </div>
                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-b-lg transition-colors"
                      >
                        Sign out
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
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-xl shadow-xl mx-2 my-2 overflow-hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive(link.href)
                        ? 'text-emerald-600 bg-emerald-50/80'
                        : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50/50'
                    }`}
                  >
                    <Icon size={20} className={isActive(link.href) ? 'text-emerald-500' : 'text-gray-400'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {currentUser && (
                <div className="pt-3 border-t border-gray-100 mt-3">
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <UserAvatar size="large" user={currentUser} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">{currentUser.role === 'ADMIN' ? 'Administrator' : 'User'}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/userprofile"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Your Profile
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Settings
                    </Link>

                    <Link
                      href="/list-users"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      List Users
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg mt-2 transition-colors"
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
