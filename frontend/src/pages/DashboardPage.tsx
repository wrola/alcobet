import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';
import Layout from '../components/Layout';
import BetCard from '../components/BetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBets } from '../hooks/useBets';

const DashboardPage: React.FC = () => {
  const { bets, loading, error, fetchBets } = useBets();

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <LoadingSpinner size="xl" className="text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your bets...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bets</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={fetchBets}
              color="red"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const activeBets = bets.filter(bet => bet.status === 'active');
  const completedBets = bets.filter(bet => bet.status === 'completed');
  const failedBets = bets.filter(bet => bet.status === 'failed');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your sobriety commitments and progress</p>
          </div>
          <Link
            to="/create-bet"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            + Create New Bet
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{activeBets.length}</div>
            <div className="text-gray-600">Active Bets</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{completedBets.length}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">{failedBets.length}</div>
            <div className="text-gray-600">Failed</div>
          </div>
        </div>

        {bets.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No Bets Yet</h3>
              <p className="text-gray-600 mb-6">
                Ready to make your first commitment to sobriety? Create a bet and start your accountability journey.
              </p>
              <Link
                to="/create-bet"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Create Your First Bet
              </Link>
            </div>
          </div>
        ) : (
          /* Bets Sections */
          <div className="space-y-8">
            {/* Active Bets */}
            {activeBets.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Commitments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBets.map((bet) => (
                    <BetCard key={bet.id} bet={bet} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Bets */}
            {completedBets.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Completed Commitments 🎉</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedBets.map((bet) => (
                    <BetCard key={bet.id} bet={bet} />
                  ))}
                </div>
              </div>
            )}

            {/* Failed Bets */}
            {failedBets.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Previous Attempts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {failedBets.map((bet) => (
                    <BetCard key={bet.id} bet={bet} />
                  ))}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Remember:</strong> Every setback is a setup for a comeback. Learn from your previous attempts and create a new bet when you're ready to commit again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;