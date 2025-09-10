import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage: React.FC = () => {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" className="text-blue-600" />
      </div>
    );
  }

  if (user) {
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h1>
          <p className="text-xl text-gray-600 mb-8">Ready to continue your journey?</p>
          <div className="space-x-4">
            <Link
              to="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              View Dashboard
            </Link>
            <Link
              to="/create-bet"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-50 transition-colors inline-block"
            >
              Create New Bet
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Commit to Sobriety with
            <span className="text-blue-600"> AlcoBet</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Put your money where your commitment is. Create accountability through trusted friends and real financial stakes.
          </p>
          
          <Button
            onClick={login}
            color="brand"
            size="xl"
            className="shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🚀 Get Started with Google
          </Button>
        </div>

        {/* How it Works */}
        <div className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How AlcoBet Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">1. Place Your Bet</h3>
              <p className="text-gray-600">
                Commit real money and set your sobriety deadline. Choose a trusted friend as your "trustman" to monitor your progress.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">2. Daily Accountability</h3>
              <p className="text-gray-600">
                Your trustman receives daily emails asking if you stayed alcohol-free. They respond honestly with just one click.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">3. Win or Lose</h3>
              <p className="text-gray-600">
                Stay clean until your deadline and get your money back. Drink alcohol and lose your commitment. Simple and effective.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-20 bg-blue-50 rounded-2xl p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose AlcoBet?</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">✅</div>
              <div>
                <h3 className="font-semibold text-gray-900">Real Financial Stakes</h3>
                <p className="text-gray-600">Put your own money on the line to create genuine motivation</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">✅</div>
              <div>
                <h3 className="font-semibold text-gray-900">Trusted Accountability</h3>
                <p className="text-gray-600">Choose someone you trust to monitor your progress honestly</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">✅</div>
              <div>
                <h3 className="font-semibred text-gray-900">Simple & Automated</h3>
                <p className="text-gray-600">Daily check-ins via email make it easy for your trustman</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-xl">✅</div>
              <div>
                <h3 className="font-semibold text-gray-900">Private & Secure</h3>
                <p className="text-gray-600">Google OAuth login, no passwords, and secure data handling</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Make Your Commitment?</h2>
          <p className="text-xl text-gray-600 mb-8">Join others who are serious about their sobriety journey</p>
          <Button
            onClick={login}
            color="brand"
            size="xl"
            className="shadow-lg"
          >
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;