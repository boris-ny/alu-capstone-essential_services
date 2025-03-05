import React, { useState, useEffect } from 'react';
import { Star, Send, Loader, AlertTriangle, MessageSquare } from 'lucide-react';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Feedback {
  id: number;
  businessId: number;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
}

interface FeedbackSectionProps {
  businessId: number | string;
}

const FeedbackSection: React.FC<FeedbackSectionProps> = ({ businessId }) => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    reviewerName: '',
  });
  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchFeedback();
  }, [businessId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${businessId}/feedback`);
      setFeedback(response.data.feedback);
      setAvgRating(response.data.meta.avgRating);
      setError('');
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRatingChange = (newRating: number) => {
    setFormData({ ...formData, rating: newRating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.rating < 1 || formData.rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      await api.post(`/businesses/${businessId}/feedback`, formData);

      // Reset form and show success message
      setFormData({ rating: 0, comment: '', reviewerName: '' });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);

      // Refresh feedback list
      fetchFeedback();

      // Optionally hide form after submission
      setShowForm(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      if (axios.isAxiosError(err)) {
        setFormError(
          err.response?.data?.errors?.[0] ||
            'Failed to submit review. Please try again.'
        );
      } else {
        setFormError('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">
          Customer Reviews
        </h2>

        <div className="flex items-center">
          {!loading && feedback.length > 0 && (
            <div className="flex items-center mr-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    className={cn(
                      'text-gray-300',
                      star <= avgRating && 'text-yellow-400 fill-yellow-400'
                    )}
                  />
                ))}
              </div>
              <span className="ml-2 font-medium">{avgRating.toFixed(1)}</span>
              <span className="ml-1 text-gray-500">({feedback.length})</span>
            </div>
          )}

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>
      </div>

      {/* Review form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Write a Review</h3>

          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{formError}</p>
            </div>
          )}

          {submitSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
              Your review has been submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none">
                    <Star
                      size={24}
                      className={cn(
                        'text-gray-300 hover:text-yellow-400 transition-colors',
                        star <= formData.rating &&
                          'text-yellow-400 fill-yellow-400'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="reviewerName"
                className="block text-sm font-medium text-gray-700 mb-1">
                Your Name{' '}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="reviewerName"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-1">
                Your Review{' '}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Share your experience with this business"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="flex justify-center">
            <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
          <p className="mt-3 text-gray-500">Loading reviews...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
          <p className="mt-3 text-gray-700">{error}</p>
        </div>
      ) : feedback.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-2 text-gray-700 font-medium">No Reviews Yet</h3>
          <p className="mt-1 text-gray-500">
            Be the first to share your experience
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={cn(
                          'text-gray-300',
                          star <= item.rating &&
                            'text-yellow-400 fill-yellow-400'
                        )}
                      />
                    ))}
                  </div>
                  {item.comment && (
                    <p className="text-gray-700 mb-3">{item.comment}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm font-medium">
                  {item.reviewerName || 'Anonymous'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;
