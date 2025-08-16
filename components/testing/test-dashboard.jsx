// 'use client'

// import { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import {
//   CheckCircle,
//   XCircle,
//   AlertTriangle,
//   Database,
//   CreditCard,
//   Upload,
//   Mail,
//   BarChart3,
//   Users,
//   Shield,
//   Search,
//   Bell,
//   Star,
//   Settings
// } from 'lucide-react'

// export function TestDashboard() {
//   const [activeTest, setActiveTest] = useState(null)

//   const testCategories = [
//     {
//       id: 'auth',
//       name: 'Authentication',
//       icon: <Shield className="h-5 w-5" />,
//       status: 'passed',
//       tests: [
//         { name: 'User Registration', status: 'passed', description: 'Customer and vendor registration working' },
//         { name: 'Login/Logout', status: 'passed', description: 'Email/password authentication functional' },
//         { name: 'Role Selection', status: 'passed', description: 'Customer/vendor role assignment working' },
//         { name: 'Session Management', status: 'passed', description: 'Zustand state management functional' },
//         { name: 'Password Reset', status: 'warning', description: 'UI ready, email service needed' }
//       ]
//     },
//     {
//       id: 'database',
//       name: 'Database',
//       icon: <Database className="h-5 w-5" />,
//       status: 'failed',
//       tests: [
//         { name: 'Supabase Connection', status: 'failed', description: 'Database not connected - using mock data' },
//         { name: 'Data Persistence', status: 'failed', description: 'Data resets on page refresh' },
//         { name: 'User Profiles', status: 'failed', description: 'Profile data not saved to database' },
//         { name: 'Booking Storage', status: 'failed', description: 'Bookings not persisted' },
//         { name: 'KYC Data', status: 'failed', description: 'Vendor verification data not stored' }
//       ]
//     },
//     {
//       id: 'payments',
//       name: 'Payments',
//       icon: <CreditCard className="h-5 w-5" />,
//       status: 'failed',
//       tests: [
//         { name: 'Paystack Integration', status: 'failed', description: 'API keys not configured' },
//         { name: 'Flutterwave Integration', status: 'failed', description: 'API keys not configured' },
//         { name: 'Payment Processing', status: 'failed', description: 'Mock payment flow only' },
//         { name: 'Payment Verification', status: 'failed', description: 'No real verification' },
//         { name: 'Webhooks', status: 'failed', description: 'Payment webhooks not implemented' }
//       ]
//     },
//     {
//       id: 'uploads',
//       name: 'File Uploads',
//       icon: <Upload className="h-5 w-5" />,
//       status: 'failed',
//       tests: [
//         { name: 'Image Upload', status: 'failed', description: 'File upload not implemented' },
//         { name: 'Document Upload', status: 'failed', description: 'KYC document upload missing' },
//         { name: 'File Storage', status: 'failed', description: 'No cloud storage configured' },
//         { name: 'Image Processing', status: 'failed', description: 'No image optimization' }
//       ]
//     },
//     {
//       id: 'notifications',
//       name: 'Notifications',
//       icon: <Bell className="h-5 w-5" />,
//       status: 'warning',
//       tests: [
//         { name: 'In-App Notifications', status: 'passed', description: 'Notification center working' },
//         { name: 'Email Notifications', status: 'failed', description: 'Email service not configured' },
//         { name: 'SMS Notifications', status: 'failed', description: 'SMS service not configured' },
//         { name: 'Real-time Updates', status: 'failed', description: 'WebSocket not implemented' },
//         { name: 'Notification Persistence', status: 'failed', description: 'Notifications not saved' }
//       ]
//     },
//     {
//       id: 'analytics',
//       name: 'Analytics',
//       icon: <BarChart3 className="h-5 w-5" />,
//       status: 'warning',
//       tests: [
//         { name: 'Admin Dashboard', status: 'passed', description: 'Dashboard UI complete' },
//         { name: 'Real Data', status: 'failed', description: 'Using mock analytics data' },
//         { name: 'Chart Visualization', status: 'warning', description: 'Charts are placeholders' },
//         { name: 'Export Functionality', status: 'failed', description: 'Report export not implemented' },
//         { name: 'Real-time Metrics', status: 'failed', description: 'No live data updates' }
//       ]
//     }
//   ]

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'passed': return 'text-green-600 bg-green-100 border-green-200'
//       case 'failed': return 'text-red-600 bg-red-100 border-red-200'
//       case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
//       default: return 'text-gray-600 bg-gray-100 border-gray-200'
//     }
//   }

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'passed': return <CheckCircle className="h-4 w-4" />
//       case 'failed': return <XCircle className="h-4 w-4" />
//       case 'warning': return <AlertTriangle className="h-4 w-4" />
//       default: return <AlertTriangle className="h-4 w-4" />
//     }
//   }

//   const overallStats = {
//     total: testCategories.reduce((sum, cat) => sum + cat.tests.length, 0),
//     passed: testCategories.reduce((sum, cat) => sum + cat.tests.filter(t => t.status === 'passed').length, 0),
//     failed: testCategories.reduce((sum, cat) => sum + cat.tests.filter(t => t.status === 'failed').length, 0),
//     warning: testCategories.reduce((sum, cat) => sum + cat.tests.filter(t => t.status === 'warning').length, 0)
//   }

//   return (
//     <div className="container py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-2">Platform Testing Dashboard</h1>
//         <p className="text-muted-foreground">
//           Comprehensive testing results for Bookhushly platform functionality
//         </p>
//       </div>

//       {/* Overall Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
//             <Settings className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{overallStats.total}</div>
//             <p className="text-xs text-muted-foreground">Across all categories</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Passed</CardTitle>
//             <CheckCircle className="h-4 w-4 text-green-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">{overallStats.passed}</div>
//             <p className="text-xs text-muted-foreground">
//               {Math.round((overallStats.passed / overallStats.total) * 100)}% success rate
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Failed</CardTitle>
//             <XCircle className="h-4 w-4 text-red-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
//             <p className="text-xs text-muted-foreground">Critical issues</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Warnings</CardTitle>
//             <AlertTriangle className="h-4 w-4 text-yellow-600" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-yellow-600">{overallStats.warning}</div>
//             <p className="text-xs text-muted-foreground">Needs attention</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Critical Issues Alert */}
//       <Alert className="mb-8 border-red-200 bg-red-50">
//         <XCircle className="h-4 w-4 text-red-600" />
//         <AlertDescription className="text-red-800">
//           <strong>Critical Issues Detected:</strong> Database connection, payment integration, and file uploads are not functional.
//           Platform is currently running on mock data only.
//         </AlertDescription>
//       </Alert>

//       {/* Test Categories */}
//       <Tabs defaultValue="overview" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-7">
//           <TabsTrigger value="overview">Overview</TabsTrigger>
//           {testCategories.map((category) => (
//             <TabsTrigger key={category.id} value={category.id}>
//               {category.name}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {testCategories.map((category) => (
//               <Card key={category.id} className="hover:shadow-lg transition-shadow">
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       {category.icon}
//                       <CardTitle className="text-lg">{category.name}</CardTitle>
//                     </div>
//                     <Badge className={getStatusColor(category.status)}>
//                       {getStatusIcon(category.status)}
//                       <span className="ml-1 capitalize">{category.status}</span>
//                     </Badge>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     {category.tests.map((test, index) => (
//                       <div key={index} className="flex items-center justify-between text-sm">
//                         <span className="truncate">{test.name}</span>
//                         <Badge variant="outline" className={getStatusColor(test.status)}>
//                           {getStatusIcon(test.status)}
//                         </Badge>
//                       </div>
//                     ))}
//                   </div>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     className="w-full mt-4"
//                     onClick={() => setActiveTest(category.id)}
//                   >
//                     View Details
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         {testCategories.map((category) => (
//           <TabsContent key={category.id} value={category.id} className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   {category.icon}
//                   <span className="ml-2">{category.name} Test Results</span>
//                   <Badge className={`ml-auto ${getStatusColor(category.status)}`}>
//                     {getStatusIcon(category.status)}
//                     <span className="ml-1 capitalize">{category.status}</span>
//                   </Badge>
//                 </CardTitle>
//                 <CardDescription>
//                   Detailed test results for {category.name.toLowerCase()} functionality
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {category.tests.map((test, index) => (
//                     <div key={index} className="border rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <h4 className="font-medium">{test.name}</h4>
//                         <Badge className={getStatusColor(test.status)}>
//                           {getStatusIcon(test.status)}
//                           <span className="ml-1 capitalize">{test.status}</span>
//                         </Badge>
//                       </div>
//                       <p className="text-sm text-muted-foreground">{test.description}</p>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         ))}
//       </Tabs>

//       {/* Recommendations */}
//       <Card className="mt-8">
//         <CardHeader>
//           <CardTitle>Recommendations</CardTitle>
//           <CardDescription>
//             Priority actions to improve platform functionality
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div className="border-l-4 border-red-500 pl-4">
//               <h4 className="font-medium text-red-700">Critical Priority</h4>
//               <ul className="text-sm text-muted-foreground mt-2 space-y-1">
//                 <li>• Connect Supabase database and configure environment variables</li>
//                 <li>• Set up Paystack and Flutterwave payment integration</li>
//                 <li>• Implement file upload service for images and documents</li>
//                 <li>• Configure email service for notifications</li>
//               </ul>
//             </div>
//             <div className="border-l-4 border-yellow-500 pl-4">
//               <h4 className="font-medium text-yellow-700">Medium Priority</h4>
//               <ul className="text-sm text-muted-foreground mt-2 space-y-1">
//                 <li>• Add real-time notification system with WebSockets</li>
//                 <li>• Implement proper chart visualization for analytics</li>
//                 <li>• Add SMS notification service</li>
//                 <li>• Create data export functionality</li>
//               </ul>
//             </div>
//             <div className="border-l-4 border-blue-500 pl-4">
//               <h4 className="font-medium text-blue-700">Future Enhancements</h4>
//               <ul className="text-sm text-muted-foreground mt-2 space-y-1">
//                 <li>• Mobile app development</li>
//                 <li>• Advanced search and filtering</li>
//                 <li>• AI-powered recommendations</li>
//                 <li>• Multi-language support</li>
//               </ul>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
