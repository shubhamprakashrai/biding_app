'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Users, Clock, Award } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export default function Hero() {
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

  const router = useRouter();
  const auth = getAuth();

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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Bring Your Projects to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">
              Life
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with top-tier professionals and freelancers. Submit your project requirements, 
            receive expert proposals, and collaborate seamlessly to achieve exceptional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <span>Get My First Project</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button 
              onClick={() => router.push(auth.currentUser ? '/dashboard' : '/login')}
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 hover:shadow-sm"
            >
              {auth.currentUser ? 'Go to Dashboard' : 'LogIn'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            <div className="text-center bg-white/80 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-emerald-600 mb-2">500+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center bg-white/80 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-emerald-600 mb-2">200+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div className="text-center bg-white/80 p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="text-3xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600">Expert Freelancers</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How-to Video Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">See Our Platform in Action</h2>
            <div className="w-20 h-1 bg-emerald-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how to submit projects, connect with professionals, and manage your workflow in minutes.
            </p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
            <iframe
              className="w-full h-full relative z-10"
              src="https://www.youtube.com/embed/H5_uZMWdXlI?autoplay=0&rel=0"
              title="How to Use Our Platform"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>



      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
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
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Next Project?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied clients who trust us with their projects
          </p>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center space-x-2 group"
          >
            <span>Get Your Project</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}