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
  ArrowDownRight,
  MapPin,
} from 'lucide-react'

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [locationData, setLocationData] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)
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
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }
    loadAnalytics()
  }, [timeRange])

  useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : timeRange === '1y' ? 90 : 30
    setLocationLoading(true)
    fetch(`/api/admin/location-analytics?days=${days}`)
      .then((r) => r.json())
      .then((data) => { setLocationData(data); setLocationLoading(false) })
      .catch(() => setLocationLoading(false))
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
          <h2 className="text-3xl font-medium">Analytics Dashboard</h2>
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
            <div className="text-2xl font-medium">{formatCurrency(analytics.overview.totalRevenue)}</div>
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
            <div className="text-2xl font-medium">{analytics.overview.totalBookings.toLocaleString()}</div>
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
            <div className="text-2xl font-medium">{analytics.overview.totalUsers.toLocaleString()}</div>
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
            <div className="text-2xl font-medium">{analytics.overview.totalVendors}</div>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
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
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{vendor.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {vendor.bookings} bookings • {vendor.rating}★ rating
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(vendor.revenue)}</div>
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
        {/* ── Locations ── */}
        <TabsContent value="locations" className="space-y-6">
          {locationLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-8 bg-gray-200 rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !locationData || locationData.error ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No location data yet. Data will appear once users grant location access.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Location Grants</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-medium">{locationData.totalGrants.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Last {locationData.days} days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-medium">{locationData.uniqueUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Distinct logged-in users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top State</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-medium">{locationData.topState || '—'}</div>
                    <p className="text-xs text-muted-foreground">Highest location requests</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top States */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Requests by State
                    </CardTitle>
                    <CardDescription>Where users are granting location access from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.states.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No state data available.</p>
                    ) : (
                      <div className="space-y-3">
                        {locationData.states.map((row, i) => {
                          const pct = Math.round((row.count / locationData.totalGrants) * 100)
                          return (
                            <div key={row.state}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">
                                  <span className="text-muted-foreground mr-2">#{i + 1}</span>
                                  {row.state}
                                </span>
                                <span className="text-muted-foreground">
                                  {row.count.toLocaleString()} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-purple-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Cities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Requests by City
                    </CardTitle>
                    <CardDescription>Most active cities on the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.cities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No city data available.</p>
                    ) : (
                      <div className="space-y-3">
                        {locationData.cities.map((row, i) => {
                          const pct = Math.round((row.count / locationData.totalGrants) * 100)
                          return (
                            <div key={`${row.city}-${row.state}`}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">
                                  <span className="text-muted-foreground mr-2">#{i + 1}</span>
                                  {row.city}
                                  {row.state ? (
                                    <span className="text-muted-foreground font-normal ml-1 text-xs">
                                      · {row.state}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="text-muted-foreground">
                                  {row.count.toLocaleString()} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Daily Location Grants
                    </CardTitle>
                    <CardDescription>Trend over the last {locationData.days} days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.daily.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No trend data available.</p>
                    ) : (() => {
                      const maxCount = Math.max(...locationData.daily.map((d) => d.count), 1)
                      const visible = locationData.daily.slice(-30)
                      return (
                        <div className="flex items-end gap-1 h-32">
                          {visible.map((d) => (
                            <div
                              key={d.date}
                              className="flex-1 flex flex-col items-center gap-0.5 group relative"
                            >
                              <div
                                className="w-full bg-purple-400 hover:bg-purple-600 rounded-t transition-colors"
                                style={{ height: `${Math.max((d.count / maxCount) * 100, 2)}%` }}
                              />
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                                {d.date}: {d.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Where Location Is Granted
                    </CardTitle>
                    <CardDescription>Pages where users enable location access</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {locationData.pages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No page data available.</p>
                    ) : (
                      <div className="space-y-2">
                        {locationData.pages.map((row) => (
                          <div key={row.page} className="flex items-center justify-between py-1.5 border-b last:border-0">
                            <span className="text-sm font-mono truncate max-w-[60%]" title={row.page}>
                              {row.page}
                            </span>
                            <Badge variant="secondary">{row.count.toLocaleString()}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}