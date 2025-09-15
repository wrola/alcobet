import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@mantine/core';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import BetsService from '../services/bets.service';
import type { TrustmanResponseData } from '../types';
import { formatCurrency, formatDateShort } from '../utils/formatters';

const TrustmanResponsePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<TrustmanResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState<'clean' | 'drank' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const responseData = await BetsService.getTrustmanResponse(token!);
      setData(responseData);
      
      if (responseData.alreadyResponded) {
        setSubmitted(true);
      }
    } catch (err: unknown) {
      console.error('Error fetching trustman data:', err);
      const networkError = err as { response?: { status?: number } };
      if (networkError.response?.status === 404) {
        setError('This response link is invalid or has expired.');
      } else {
        setError('Failed to load response data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError('Invalid response link');
      setLoading(false);
    }
  }, [token, fetchData]);

  const handleSubmit = async (selectedResponse: 'clean' | 'drank') => {
    if (!token) return;

    try {
      setSubmitting(true);
      setError('');
      
      await BetsService.submitTrustmanResponse(token, selectedResponse);
      setResponse(selectedResponse);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Error submitting response:', err);
      const networkError = err as { response?: { status?: number } };
      if (networkError.response?.status === 400) {
        setError('This response has already been submitted or the link has expired.');
      } else {
        setError('Failed to submit response. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <LoadingSpinner size="xl" className="text-blue-600" />
          <p className="mt-4 text-gray-600">Loading response form...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-800 mb-4">Unable to Load</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Button
              onClick={fetchData}
              color="red"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">No Data Found</h2>
            <p className="text-gray-600">Unable to find the requested response data.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Response Recorded</h2>
            {response ? (
              <div className="mb-6">
                <p className="text-green-700 mb-2">
                  You reported that <strong>{data.userName}</strong>:
                </p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  response === 'clean' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {response === 'clean' ? '✓ Stayed alcohol-free' : '✗ Drank alcohol'}
                </div>
              </div>
            ) : (
              <p className="text-green-700 mb-6">
                Your response for <strong>{data.userName}</strong> has been recorded.
              </p>
            )}
            <p className="text-green-600 text-sm">
              Thank you for helping {data.userName} stay accountable to their commitment!
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Daily Check</h1>
            <p className="text-blue-100">Help {data.userName} stay accountable</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Bet Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatCurrency(data.amount)}
                </div>
                <div className="text-sm text-gray-600">at stake</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">Day {data.currentDay} of {data.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check Date:</span>
                  <span className="font-medium">{formatDateShort(data.checkDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">{formatDateShort(data.deadline)}</span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Did <span className="text-blue-600">{data.userName}</span> drink alcohol yesterday?
              </h2>
              <p className="text-gray-600 text-sm">
                Please answer honestly. Your response helps them stay committed to their goal.
              </p>
            </div>

            {/* Response Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => handleSubmit('drank')}
                loading={submitting}
                color="red"
                fullWidth
                size="lg"
              >
                ❌ Yes, they drank alcohol
              </Button>
              
              <Button
                onClick={() => handleSubmit('clean')}
                loading={submitting}
                color="green"
                fullWidth
                size="lg"
              >
                ✅ No, they stayed clean
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>This is a secure response link from AlcoBet.</p>
              <p>Your response will be recorded and cannot be changed.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrustmanResponsePage;