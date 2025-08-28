"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

interface PaymentLog {
  id: string;
  member_id: number;
  member_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'completed' | 'failed' | 'refunded' | 'pending';
  transaction_id: string;
  date: string;
  session_title?: string;
}

interface BookingLog {
  id: string;
  session_id: string;
  session_title: string;
  member_id: number;
  member_name: string;
  booking_date: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'refunded';
  notes?: string;
  payment_id?: string;
  created_at: string;
}

interface AppLog {
  id: string;
  member_id: number;
  member_name: string;
  auth_user_id: string;
  action: string;
  details: string;
  timestamp: string;
  device_type: 'ios' | 'android' | 'web';
  session_id?: string;
  ip_address?: string;
}

interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'database' | 'payment' | 'auth' | 'booking' | 'api' | 'migration';
  message: string;
  details?: string;
  timestamp: string;
  user_id?: string;
  request_id?: string;
  duration_ms?: number;
}

interface SystemMetrics {
  totalBookings: number;
  totalRevenue: number;
  totalMembers: number;
  totalSessions: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  recentActivity: number;
  mobileAppUsers: number;
  onlyGymMembers: number;
  appLogins24h: number;
  systemErrors24h: number;
}

export default function InsightsPage() {
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [bookingLogs, setBookingLogs] = useState<BookingLog[]>([]);
  const [appLogs, setAppLogs] = useState<AppLog[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("7"); // Last 7 days
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadInsightsData();
  }, [dateFilter, statusFilter]);

  const loadInsightsData = async () => {
    setLoading(true);
    try {
      // Fetch real app logs data
      const appLogsResponse = await fetch(`/api/app-logs?days=${dateFilter}`);
      const appLogsData = await appLogsResponse.json();
      
      // Fetch real system logs data  
      const systemLogsResponse = await fetch(`/api/system-logs?days=${dateFilter}`);
      const systemLogsData = await systemLogsResponse.json();

      // Mock payment logs (still using mock data as real payment logs would need payment history)
      const mockPaymentLogs: PaymentLog[] = [
        {
          id: "1",
          member_id: 1,
          member_name: "John Doe",
          amount: 2500,
          currency: "LKR",
          payment_method: "credit_card",
          status: "completed",
          transaction_id: "demo_txn_1735372800_abc123",
          date: new Date().toISOString(),
          session_title: "CrossFit Training"
        },
        {
          id: "2", 
          member_id: 2,
          member_name: "Jane Smith",
          amount: 1500,
          currency: "LKR",
          payment_method: "debit_card",
          status: "completed",
          transaction_id: "demo_txn_1735372600_def456",
          date: new Date(Date.now() - 3600000).toISOString(),
          session_title: "Yoga Session"
        },
        {
          id: "3",
          member_id: 3,
          member_name: "Mike Johnson",
          amount: 2000,
          currency: "LKR", 
          payment_method: "credit_card",
          status: "failed",
          transaction_id: "demo_txn_1735372400_ghi789",
          date: new Date(Date.now() - 7200000).toISOString(),
          session_title: "Pilates Class"
        }
      ];

      // Mock booking logs (could be enhanced with real booking data)
      const mockBookingLogs: BookingLog[] = [
        {
          id: "booking_1",
          session_id: "session_1",
          session_title: "CrossFit Training",
          member_id: 1,
          member_name: "John Doe",
          booking_date: new Date().toISOString(),
          status: "confirmed",
          payment_id: "1",
          created_at: new Date().toISOString()
        },
        {
          id: "booking_2",
          session_id: "session_2", 
          session_title: "Yoga Session",
          member_id: 2,
          member_name: "Jane Smith",
          booking_date: new Date(Date.now() - 3600000).toISOString(),
          status: "confirmed",
          payment_id: "2",
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "booking_3",
          session_id: "session_3",
          session_title: "Pilates Class", 
          member_id: 3,
          member_name: "Mike Johnson",
          booking_date: new Date(Date.now() - 7200000).toISOString(),
          status: "cancelled",
          notes: "Payment failed",
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      // Combine metrics from real API data
      const combinedMetrics: SystemMetrics = {
        totalBookings: 156,
        totalRevenue: 125000,
        totalMembers: 89,
        totalSessions: 45,
        successfulPayments: 142,
        failedPayments: 8,
        refundedPayments: 6,
        recentActivity: 23,
        // Real data from API
        mobileAppUsers: appLogsData.metrics?.mobileAppUsers || 0,
        onlyGymMembers: appLogsData.metrics?.onlyGymMembers || 0,
        appLogins24h: appLogsData.metrics?.appLogins24h || 0,
        systemErrors24h: systemLogsData.metrics?.errorCount || 0
      };

      setPaymentLogs(mockPaymentLogs);
      setBookingLogs(mockBookingLogs);
      setAppLogs(appLogsData.appLogs || []);
      setSystemLogs(systemLogsData.systemLogs || []);
      setMetrics(combinedMetrics);
      
    } catch (error) {
      console.error('Error loading insights data:', error);
      
      // Fallback to mock data if API fails
      const fallbackAppLogs: AppLog[] = [
        {
          id: "app_fallback",
          member_id: 0,
          member_name: "Data Loading Failed",
          auth_user_id: "fallback",
          action: "error",
          details: "Could not load real app logs - using fallback",
          timestamp: new Date().toISOString(),
          device_type: "web",
          ip_address: "127.0.0.1"
        }
      ];
      
      const fallbackSystemLogs: SystemLog[] = [
        {
          id: "sys_fallback",
          level: "error",
          category: "api",
          message: "Failed to load system logs",
          details: "API endpoint error - using fallback data",
          timestamp: new Date().toISOString(),
          request_id: "fallback_req"
        }
      ];
      
      setAppLogs(fallbackAppLogs);
      setSystemLogs(fallbackSystemLogs);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
      case 'pending_payment':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warn':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'debug':
        return <Activity className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'debug':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'ios':
        return '📱';
      case 'android':
        return '🤖';
      case 'web':
        return '🌐';
      default:
        return '💻';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportData = (type: 'payments' | 'bookings' | 'app' | 'system') => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'payments':
        data = paymentLogs;
        filename = 'payment_logs';
        break;
      case 'bookings':
        data = bookingLogs;
        filename = 'booking_logs';
        break;
      case 'app':
        data = appLogs;
        filename = 'app_logs';
        break;
      case 'system':
        data = systemLogs;
        filename = 'system_logs';
        break;
      default:
        data = [];
        filename = 'export';
    }
    
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading insights data...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 pl-4">
            <div className="container mx-auto p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">System Insights</h1>
                  <p className="text-muted-foreground">
                    Comprehensive logs and analytics for gym operations
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 3 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

      {/* System Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR {metrics.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobile App Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.mobileAppUsers}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.onlyGymMembers} gym-only members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((metrics.successfulPayments / (metrics.successfulPayments + metrics.failedPayments)) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.systemErrors24h} errors in 24h
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Logs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Payment Logs</TabsTrigger>
          <TabsTrigger value="bookings">Booking Logs</TabsTrigger>
          <TabsTrigger value="app">App Logs</TabsTrigger>
          <TabsTrigger value="system">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Payment Transaction Logs</CardTitle>
                  <CardDescription>
                    Detailed payment processing history and status
                  </CardDescription>
                </div>
                <Button onClick={() => exportData('payments')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Transaction ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{log.member_name}</TableCell>
                      <TableCell>{log.session_title}</TableCell>
                      <TableCell>LKR {log.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{log.payment_method.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge variant="outline" className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.transaction_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Session Booking Logs</CardTitle>
                  <CardDescription>
                    Complete booking history with status tracking
                  </CardDescription>
                </div>
                <Button onClick={() => exportData('bookings')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Created</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{log.member_name}</TableCell>
                      <TableCell>{log.session_title}</TableCell>
                      <TableCell>
                        {format(new Date(log.booking_date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge variant="outline" className={getStatusColor(log.status)}>
                            {log.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.payment_id ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            Free
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">{log.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Mobile App Activity Logs</CardTitle>
                  <CardDescription>
                    Activity from gym members using the mobile app (auth_user_id present)
                  </CardDescription>
                </div>
                <Button onClick={() => exportData('app')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{log.member_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {log.auth_user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getDeviceIcon(log.device_type)}</span>
                          <span className="capitalize">{log.device_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{log.details}</TableCell>
                      <TableCell>
                        {log.session_id ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {log.session_id}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Logs</CardTitle>
                  <CardDescription>
                    Dashboard application events, errors, and system operations
                  </CardDescription>
                </div>
                <Button onClick={() => exportData('system')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Request ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLogLevelIcon(log.level)}
                          <Badge variant="outline" className={getLogLevelColor(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-48 truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">
                        {log.details || '-'}
                      </TableCell>
                      <TableCell>
                        {log.duration_ms ? (
                          <span className="text-sm font-mono">
                            {log.duration_ms}ms
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.request_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
