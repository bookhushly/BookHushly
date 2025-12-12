'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Star, ThumbsUp, Flag, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'

export function ReviewList({ listingId, showTitle = true }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })

  // Mock reviews data - in real app, fetch from database
  const mockReviews = [
    {
      id: 1,
      customer_name: "Adebayo Johnson",
      rating: 5,
      comment: "Excellent service! The hotel was clean, staff was friendly, and the location was perfect. Highly recommended for business travelers.",
      created_at: "2024-12-15T10:30:00Z",
      helpful_count: 12,
      verified_booking: true
    },
    {
      id: 2,
      customer_name: "Fatima Abdullahi",
      rating: 4,
      comment: "Good experience overall. The room was comfortable and the amenities were as described. Only minor issue was the WiFi speed.",
      created_at: "2024-12-10T14:20:00Z",
      helpful_count: 8,
      verified_booking: true
    },
    {
      id: 3,
      customer_name: "Chidi Okafor",
      rating: 5,
      comment: "Outstanding service from start to finish. The team was professional and went above and beyond our expectations.",
      created_at: "2024-12-05T09:15:00Z",
      helpful_count: 15,
      verified_booking: true
    },
    {
      id: 4,
      customer_name: "Amina Hassan",
      rating: 3,
      comment: "Average experience. The service was okay but nothing special. Room was clean but could use some updates.",
      created_at: "2024-11-28T16:45:00Z",
      helpful_count: 3,
      verified_booking: true
    }
  ]

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReviews(mockReviews)
      
      // Calculate stats
      const totalReviews = mockReviews.length
      const averageRating = totalReviews > 0 
        ? mockReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0
      
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      mockReviews.forEach(review => {
        ratingDistribution[review.rating]++
      })
      
      setStats({
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      })
      
      setLoading(false)
    }

    loadReviews()
  }, [listingId])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {showTitle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-500" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{stats.averageRating}</div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${stats.totalReviews > 0 
                            ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {review.customer_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{review.customer_name}</h4>
                      {review.verified_booking && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Booking
                        </Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{review.comment}</p>
                  
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful_count})
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {reviews.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}