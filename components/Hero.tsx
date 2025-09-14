'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Users, Clock, Award } from 'lucide-react';
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
      description: 'Streamlined project request and tracking system'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connect with verified professionals and freelancers'
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Get proposals quickly and start projects faster'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'All work is reviewed and meets high standards'
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
    <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Bring Your Projects to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Life
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with top-tier professionals and freelancers. Submit your project requirements, 
            receive expert proposals, and collaborate seamlessly to achieve exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Get My First Project</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button 
              onClick={() => router.push(auth.currentUser ? '/dashboard' : '/login')}
              className="border-2 border-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800/30 hover:border-cyan-400 transition-all duration-300 hover:shadow-sm"
            >
              {auth.currentUser ? 'Go to Dashboard' : 'LogIn'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            <div className="text-center bg-blue-800/30 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 hover:border-cyan-400/50 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-cyan-400 mb-2">500+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div className="text-center bg-blue-800/30 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 hover:border-cyan-400/50 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-cyan-400 mb-2">200+</div>
              <div className="text-blue-100">Happy Clients</div>
            </div>
            <div className="text-center bg-blue-800/30 backdrop-blur-sm p-6 rounded-xl border border-blue-700/50 hover:border-cyan-400/50 hover:shadow-lg transition-all duration-300">
              <div className="text-3xl font-bold text-cyan-400 mb-2">50+</div>
              <div className="text-blue-100">Expert Freelancers</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How-to Video Section */}
      <div className="relative py-20 bg-gradient-to-b from-blue-950 to-blue-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block mb-3 text-sm font-medium text-cyan-400 tracking-widest uppercase">Platform Showcase</span>
            <h2 className="text-4xl font-bold text-white mb-4">
              See Our Platform in <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Action</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-blue-200/90 max-w-2xl mx-auto">
              Learn how to submit projects, connect with professionals, and manage your workflow in minutes.
            </p>
          </div>

          {showVideo ? (
            <div className="relative w-full max-w-6xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border border-blue-800/50 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-950/80 backdrop-blur-sm flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/90 to-blue-600/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              <iframe
                className="w-full h-full relative z-10"
                src={homePageData.videoUrl}
                title="How to Use Our Platform"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="w-full max-w-6xl mx-auto aspect-video rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-950/40 border-2 border-dashed border-blue-800/50 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-900/50 rounded-full flex items-center justify-center border border-blue-800/50">
                  <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Video Coming Soon</h3>
                <p className="text-blue-300/80">We're preparing an amazing demo for you</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-950 to-transparent"></div>
      </div>



      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
        
        <div className="text-center mb-16 relative z-10">
          <span className="inline-block mb-4 text-sm font-medium text-cyan-400 tracking-widest uppercase">Why Choose Us</span>
          <h2 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Experience the Difference
          </h2>
          <p className="text-lg text-blue-200/90 max-w-2xl mx-auto">
            We provide everything you need to successfully manage and complete your projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300 group-hover:duration-200"></div>
                <div className="relative h-full bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 p-6 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:-translate-y-1.5">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-cyan-900/30 to-blue-900/50 border border-cyan-400/20 rounded-xl flex items-center justify-center text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <Icon className="h-7 w-7 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100/90 text-center leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 text-cyan-400 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-1">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-900 py-20">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}
          ></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-3 px-4 py-1.5 text-xs font-semibold text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/20">
            Ready to Begin?
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start Your Next <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Project Today</span>
          </h2>
          
          <p className="text-xl text-blue-200/90 max-w-2xl mx-auto mb-10">
            Join thousands of satisfied clients who trust us to bring their ideas to life with exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="relative group px-8 py-4 font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-100 group-hover:opacity-0 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative flex items-center justify-center space-x-2">
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
            
            <button 
              onClick={() => router.push(auth.currentUser ? '/dashboard' : '/login')}
              className="px-8 py-4 font-medium text-cyan-400 bg-transparent border-2 border-cyan-400/30 rounded-xl hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group"
            >
              <span>{auth.currentUser ? 'Go to Dashboard' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-blue-300/80">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
              <span>No credit card required</span>
            </div>
            <div className="h-4 w-px bg-blue-700"></div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-blue-950 to-transparent"></div>
      </div>
    </div>
  );
}