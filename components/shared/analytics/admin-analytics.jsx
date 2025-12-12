'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Building, 
  Calendar, 
  DollarSign,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 2500000,
      totalBookings: 456,
      totalUsers: 1250,
      totalVendors: 89,
      revenueGrowth: 15.2,
      bookingsGrowth: 23.1,
      usersGrowth: 18.5,
      vendorsGrowth: 12.3
    },
    revenue: {
      monthly: [
        { month: 'Jan', revenue: 180000, bookings: 32 },
        { month: 'Feb', revenue: 220000, bookings: 38 },
        { month: 'Mar', revenue: 195000, bookings: 35 },
        { month: 'Apr', revenue: 240000, bookings: 42 },
        { month: 'May', revenue: 280000, bookings: 48 },
        { month: 'Jun', revenue: 320000, bookings: 55 },
        { month: 'Jul', revenue: 350000, bookings: 62 },
        { month: 'Aug', revenue: 380000, bookings: 68 },
        { month: 'Sep', revenue: 420000, bookings: 75 },
        { month: 'Oct', revenue: 450000, bookings: 82 },
        { month: 'Nov', revenue: 480000, bookings: 89 },
        { month: 'Dec', revenue: 520000, bookings: 95 }
      ]
    },
    categories: [
      { name: 'Hotels', value: 35, revenue: 875000, color: '#3b82f6' },
      { name: 'Food & Restaurants', value: 25, revenue: 625000, color: '#10b981' },
      { name: 'Events', value: 20, revenue: 500000, color: '#f59e0b' },
      { name: 'Logistics', value: 12, revenue: 300000, color: '#ef4444' },
      { name: 'Security', value: 8, revenue: 200000, color: '#8b5cf6' }
    ],
    topVendors: [
      { name: 'Grand Lagos Hotels', revenue: 125000, bookings: 45, rating: 4.9 },
      { name: 'Elite Events', revenue: 98000, bookings: 32, rating: 4.8 },
      { name: 'SecureGuard Nigeria', revenue: 87000, bookings: 28, rating: 4.7 },
      { name: 'Swift Logistics', revenue: 76000, bookings: 38, rating: 4.6 },
      { name: 'Delicious Delights', revenue: 65000, bookings: 42, rating: 4.8 }
    ],
    userActivity: {
      dailyActiveUsers: 234,
      weeklyActiveUsers: 892,
      monthlyActiveUsers: 1250,
      averageSessionDuration: '12m 34s',
      bounceRate: '23.4%',
      conversionRate: '12.8%'
    }
  })

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setLoading(false)
    }

    loadAnalytics()
  }, [timeRange])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.overview.revenueGrowth > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={analytics.overview.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercentage(analytics.overview.revenueGrowth)}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalBookings.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">
                {formatPercentage(analytics.overview.bookingsGrowth)}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">
                {formatPercentage(analytics.overview.usersGrowth)}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalVendors}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-600">
                {formatPercentage(analytics.overview.vendorsGrowth)}
              </span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Monthly revenue and booking trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Revenue Chart</p>
                  <p className="text-sm">Chart visualization would be implemented here</p>
                  <p className="text-xs mt-2">Integration with charting library (Chart.js, Recharts, etc.)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2 h-5 w-5" />
                  Service Categories
                </CardTitle>
                <CardDescription>
                  Distribution by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.value}%</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(category.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Revenue by service category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categories.map((category) => (
                    <div key={category.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.name}</span>
                        <span>{formatCurrency(category.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${category.value}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Top Performing Vendors
              </CardTitle>
              <CardDescription>
                Highest revenue generating vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topVendors.map((vendor, index) => (
                  <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{vendor.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {vendor.bookings} bookings • {vendor.rating}★ rating
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(vendor.revenue)}</div>
                      <Badge variant="secondary" className="text-xs">
                        Top Performer
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Daily Active Users</span>
                  <span className="font-medium">{analytics.userActivity.dailyActiveUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekly Active Users</span>
                  <span className="font-medium">{analytics.userActivity.weeklyActiveUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Active Users</span>
                  <span className="font-medium">{analytics.userActivity.monthlyActiveUsers}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Session Duration</span>
                  <span className="font-medium">{analytics.userActivity.averageSessionDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="font-medium">{analytics.userActivity.bounceRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-medium text-green-600">{analytics.userActivity.conversionRate}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">User Growth</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(analytics.overview.usersGrowth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Vendor Growth</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(analytics.overview.vendorsGrowth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Revenue Growth</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(analytics.overview.revenueGrowth)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}