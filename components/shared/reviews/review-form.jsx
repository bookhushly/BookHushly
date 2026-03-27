'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export function ReviewForm({ listingId, listingType, listingTitle, onReviewSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (!comment.trim()) { toast.error('Please write a comment'); return }

    setLoading(true)
    try {
      const res = await fetch(`/api/reviews/${listingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_type: listingType, rating, comment }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to submit review')
        return
      }
      toast.success('Review submitted! Thank you for your feedback.')
      setRating(0)
      setComment('')
      if (onReviewSubmitted) onReviewSubmitted(json.data)
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        Write a Review
        {listingTitle && <span className="text-gray-400 font-normal text-sm">for {listingTitle}</span>}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stars */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    star <= (hovered || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
            {(hovered || rating) > 0 && (
              <span className="ml-2 text-sm text-gray-500">{LABELS[hovered || rating]}</span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1">
          <label htmlFor="review-comment" className="text-sm font-medium text-gray-700">Your experience</label>
          <Textarea
            id="review-comment"
            placeholder="Tell others about your stay, the service, or anything that stood out…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            className="resize-none rounded-xl"
          />
          <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-9"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="h-4 w-4 mr-2" /> Submit Review</>
          )}
        </Button>
      </form>
    </div>
  )
}
