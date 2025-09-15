'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Users, Clock, Award, PlayCircle } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { useHomePageData } from '@/hooks/useHomePageData';
import { useEffect, useState } from 'react';

export default function Hero() {
  const router = useRouter();
  const auth = getAuth();
  const [homePageData, loading] = useHomePageData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading && !homePageData) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  const showVideo = isClient && homePageData?.videoUrl && homePageData.isActive !== false;
  const features = [
    {
      icon: CheckCircle,
      title: 'Project Management',
      description: 'Streamlined project request and tracking system',
      color: 'text-[#4f8efc]',
      bg: 'bg-[#4f8efc]/5',
      border: 'border-[#4f8efc]/10'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with verified professionals and freelancers',
      color: 'text-[#4f8efc]',
      bg: 'bg-[#4f8efc]/5',
      border: 'border-[#4f8efc]/10'
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Get proposals quickly and start projects faster',
      color: 'text-[#4f8efc]',
      bg: 'bg-[#4f8efc]/5',
      border: 'border-[#4f8efc]/10'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'All work is reviewed and meets high standards',
      color: 'text-[#4f8efc]',
      bg: 'bg-[#4f8efc]/5',
      border: 'border-[#4f8efc]/10'
    }
  ];

  const handleGetStarted = () => {
    const user = auth.currentUser;

    console.log('Logged in User is :', user);

    if (user) {
      // User is logged in, go to dashboard
      router.push('/dashboard');
    } else {
      // User is not logged in, go to register
      router.push('/register');
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#4f8efc]/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28">
        <div className="text-center relative z-10">
          <div className="inline-flex items-center mb-8 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 text-[#4f8efc] text-sm font-semibold tracking-wide shadow-lg shadow-gray-100/50 animate-fade-in">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f8efc] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f8efc]"></span>
            </span>
            🚀 Powering Your Digital Success
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animate-delay-100">
            Bring Your Projects to{' '}
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-[#4f8efc] to-[#6a9fff] bg-clip-text text-transparent animate-gradient-x">
                Life
              </span>
              <span className="relative z-10 text-transparent">Life</span>
            </span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animate-delay-200">
            Connect with top-tier professionals and freelancers. Submit your project requirements, 
            receive expert proposals, and collaborate seamlessly to achieve exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-fade-in-up animate-delay-300">
            <button 
              onClick={handleGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-[#4f8efc] to-[#6a9fff] text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-[#4f8efc]/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span className="relative z-10">Get My First Project</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#3a7df7] to-[#4f8efc] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => router.push(auth.currentUser ? '/dashboard' : '/login')}
              className="relative overflow-hidden border-2 border-gray-200 bg-white/90 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/30 flex items-center space-x-2 group"
            >
              <span className="relative z-10">{auth.currentUser ? 'Go to Dashboard' : 'Log In'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50/10 to-gray-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:border-[#4f8efc]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-[#4f8efc] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Projects Completed</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:border-[#4f8efc]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-[#4f8efc] mb-2">200+</div>
              <div className="text-gray-600 font-medium">Happy Clients</div>
            </div>
            <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200 hover:border-[#4f8efc]/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl font-bold text-[#4f8efc] mb-2">50+</div>
              <div className="text-gray-600 font-medium">Expert Freelancers</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How-to Video Section */}
      <div className="relative py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#4f8efc]/20 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Watch this quick video to see how easy it is to get started with our platform and connect with top talent.
            </p>
          </div>

          {showVideo ? (
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 max-w-4xl mx-auto bg-white">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={homePageData.videoUrl}
                  className="w-full h-[500px]"
                  title="How It Works"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 aspect-w-16 aspect-h-9 flex items-center justify-center">
              <div className="text-center p-8">
                <PlayCircle className="w-16 h-16 text-[#4f8efc] mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Video Coming Soon</h3>
                <p className="text-gray-600">We're preparing an amazing video to show you how it all works!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-950 to-transparent"></div>
      </div>



      {/* Features Section */}
      <div className="relative py-20 bg-white">
        <div className="absolute inset-0 bg-[#f8fafc]" aria-hidden="true"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block mb-4 text-sm font-semibold text-[#4f8efc] tracking-wider uppercase">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience the <span className="text-[#4f8efc]">Difference</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to successfully manage and complete your projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group relative"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f8efc] to-[#6a9fff] rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300 group-hover:duration-200"></div>
                  <div className="relative h-full bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 group-hover:border-[#4f8efc]/50 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className={`w-16 h-16 mx-auto mb-6 ${feature.bg} ${feature.border} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                      <Icon className={`h-7 w-7 ${feature.color} transition-transform`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-[#4f8efc] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 text-[#4f8efc] opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-1">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4f8efc] to-[#6a9fff] py-20">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 text-xs font-semibold text-white bg-white/20 rounded-full backdrop-blur-sm">
            Ready to Begin?
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Next <span className="text-white">Project Today</span>
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Join thousands of satisfied clients who trust us to bring their ideas to life with exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="group relative overflow-hidden bg-white text-[#4f8efc] px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span className="relative z-10">Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button 
              onClick={() => router.push(auth.currentUser ? '/dashboard' : '/login')}
              className="group relative overflow-hidden border-2 border-white/30 bg-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 flex items-center justify-center space-x-2"
            >
              <span className="relative z-10">{auth.currentUser ? 'Go to Dashboard' : 'Sign In'}</span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-sm text-white/80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-white" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-white/30"></div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-white" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}