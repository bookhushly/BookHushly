'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Bell, CheckCircle, AlertCircle, Info, Star, Calendar, CreditCard, User, Settings, X, BookMarked as MarkAsRead } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export function NotificationCenter({ userId, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, bookings, payments

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Your booking for Luxury Hotel Suite has been confirmed by the vendor.',
      read: false,
      created_at: '2024-12-20T10:30:00Z',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'payment_successful',
      title: 'Payment Successful',
      message: 'Your payment of ₦78,750 has been processed successfully.',
      read: false,
      created_at: '2024-12-20T09:15:00Z',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'review_request',
      title: 'Review Request',
      message: 'How was your experience with Grand Lagos Hotels? Leave a review.',
      read: true,
      created_at: '2024-12-19T16:45:00Z',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      type: 'booking_reminder',
      title: 'Booking Reminder',
      message: 'Your booking is tomorrow at 2:00 PM. Don\'t forget!',
      read: false,
      created_at: '2024-12-19T14:20:00Z',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'kyc_approved',
      title: 'KYC Approved',
      message: 'Your vendor application has been approved. You can now create listings.',
      read: true,
      created_at: '2024-12-18T11:30:00Z',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 6,
      type: 'system_update',
      title: 'System Update',
      message: 'New features have been added to improve your booking experience.',
      read: true,
      created_at: '2024-12-17T08:00:00Z',
      icon: Info,
      color: 'text-blue-600'
    }
  ]

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setNotifications(mockNotifications)
      setLoading(false)
    }

    loadNotifications()
  }, [userId])

  const markAsRead = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      
      toast.success('Notification marked as read')
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      )
      
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'bookings') return ['booking_confirmed', 'booking_reminder', 'booking_cancelled'].includes(notification.type)
    if (filter === 'payments') return ['payment_successful', 'payment_failed', 'refund_processed'].includes(notification.type)
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'bookings', label: 'Bookings' },
            { key: 'payments', label: 'Payments' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(tab.key)}
              className="text-xs"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Actions */}
        {unreadCount > 0 && (
          <div className="px-4 pb-3">
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          </div>
        )}

        <ScrollArea className="h-96">
          <div className="space-y-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => {
                const IconComponent = notification.icon
                return (
                  <div key={notification.id}>
                    <div className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 ${notification.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator />}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}