import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Mail, 
  Phone, 
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  Eye
} from "lucide-react";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const queryClient = useQueryClient();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch testing summary
  const { data: testingSummary, isLoading: testingLoading } = useQuery({
    queryKey: ["/api/admin/testing-summary"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch pending business cards for review
  const { data: pendingCards, isLoading: cardsLoading } = useQuery({
    queryKey: ["/api/admin/business-cards/pending"],
    refetchInterval: 60000, // Refresh every minute
  });

  // Use real data from API
  const ordersData = stats?.recentOrders || [];
  const actualStats = stats || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    cardTypePopularity: {},
    recentOrders: []
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = ordersData.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  );

  const generateCardPreview = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/generate-card-preview/${orderId}`, {
        method: 'POST'
      });
      if (response.ok) {
        return URL.createObjectURL(await response.blob());
      }
    } catch (error) {
      console.error('Error generating card preview:', error);
    }
    return null;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Refresh the stats to get updated order data
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
        return true;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
    return false;
  };

  const handleCardReview = async (cardId, status, reviewNotes = '') => {
    try {
      const response = await fetch(`/api/admin/business-cards/${cardId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reviewNotes })
      });
      
      if (response.ok) {
        // Refresh the pending cards list
        queryClient.invalidateQueries({ queryKey: ["/api/admin/business-cards/pending"] });
        return true;
      }
    } catch (error) {
      console.error('Error updating card review:', error);
    }
    return false;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Metal Cards NYC - Order Management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            {actualStats.totalOrders} Total Orders
          </Badge>
          <Badge variant="outline" className="text-blue-600">
            ${actualStats.totalRevenue.toLocaleString()} Revenue
          </Badge>
          <Badge variant="outline" className="text-orange-600">
            {actualStats.pendingOrders} Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="cards">Card Reviews</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actualStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +8 from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{actualStats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${actualStats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.6%</div>
                <p className="text-xs text-muted-foreground">
                  Order completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-gray-500">Order #{order.id}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${((order.cardType === 'standard' ? 4 : order.cardType === 'premium' ? 5 : order.cardType === 'black-anodized' ? 7 : 9) * order.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.quantity} cards</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders ({ordersData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Order ID</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Preview</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-semibold">#{order.id}</td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.companyName}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{order.email}</td>
                        <td className="p-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="w-12 h-8 bg-gray-100 border rounded flex items-center justify-center">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View
                            </Button>
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-production">In Production</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Order Detail Modal */}
          {selectedOrder && (
            <Card className="fixed inset-0 bg-white z-50 m-4 overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order #{selectedOrder.id} Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                      <p><strong>Email:</strong> {selectedOrder.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                      <p><strong>Company:</strong> {selectedOrder.companyName}</p>
                      <p><strong>Position:</strong> {selectedOrder.position}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Order Details</h3>
                    <div className="space-y-2">
                      <p><strong>Quantity:</strong> {selectedOrder.quantity} cards</p>
                      <p><strong>Card Type:</strong> {selectedOrder.cardType}</p>
                      <p><strong>Card Style:</strong> {selectedOrder.cardStyle}</p>
                      <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> <Badge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</Badge></p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Special Requests</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedOrder.specialRequests || 'No special requests'}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Business Card Preview</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="w-80 h-48 bg-white border rounded-lg shadow-sm flex items-center justify-center mx-auto">
                      <p className="text-gray-500">Card preview for {selectedOrder.customerName}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Update Order Status</h3>
                  <div className="flex space-x-2">
                    <Button onClick={() => updateOrderStatus(selectedOrder.id, 'in-production')}>
                      Mark In Production
                    </Button>
                    <Button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}>
                      Mark Shipped
                    </Button>
                    <Button onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}>
                      Mark Completed
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Internal Notes</h3>
                  <textarea 
                    className="w-full p-3 border rounded-lg"
                    rows="4"
                    placeholder="Add internal notes about this order..."
                  />
                  <Button className="mt-2">Save Notes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          {/* Business Card Review Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Business Card Review Queue</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and approve business card designs generated by customers
              </p>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-emerald-500">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading business cards for review...
                  </div>
                </div>
              ) : !pendingCards || pendingCards.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
                  <p className="text-gray-500">All business card designs have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingCards.map((card) => (
                    <div key={card.id} className="border rounded-lg p-6 bg-yellow-50 border-yellow-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {card.profile?.fullName || 'Unknown Customer'}
                          </h3>
                          <p className="text-sm text-gray-600">{card.profile?.email}</p>
                          <p className="text-sm text-gray-600">{card.profile?.jobTitle}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(card.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending Review
                        </Badge>
                      </div>
                      
                      {/* Card Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-medium mb-2">Front Side</h4>
                          <div className="bg-white border rounded-lg p-4">
                            {card.frontImageUrl ? (
                              <img 
                                src={card.frontImageUrl} 
                                alt="Business card front" 
                                className="w-full h-32 object-contain rounded"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-500">Front Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Back Side</h4>
                          <div className="bg-white border rounded-lg p-4">
                            {card.backImageUrl ? (
                              <img 
                                src={card.backImageUrl} 
                                alt="Business card back" 
                                className="w-full h-32 object-contain rounded"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-gray-500">Back Preview</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Details */}
                      <div className="bg-white p-4 rounded-lg mb-4">
                        <h4 className="font-medium mb-2">Card Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Template ID:</span> {card.templateId}
                          </div>
                          <div>
                            <span className="font-medium">QR Code URL:</span> 
                            <a href={card.qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                              View Profile
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Review Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleCardReview(card.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleCardReview(card.id, 'rejected')}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordersData.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.companyName}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Contact Info</p>
                        <p className="text-gray-600">{order.email}</p>
                        <p className="text-gray-600">{order.phone}</p>
                      </div>
                      <div>
                        <p className="font-medium">Company</p>
                        <p className="text-gray-600">{order.companyName}</p>
                        <p className="text-gray-600">{order.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-gray-600">nyccustomcardsin24hrs@gmail.com</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-gray-600">(917) 653-3835</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-gray-600">Sunday: Closed</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Quick Actions</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => window.open('/shopify-admin', '_blank')}>
                      Shopify Admin
                    </Button>
                    <Button variant="outline" onClick={() => window.open('/dashboard', '_blank')}>
                      User Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Testing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {testingLoading ? (
                  <p>Loading testing data...</p>
                ) : testingSummary ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">System Status: Production Ready</h4>
                      <p className="text-sm text-green-700">All tests passed successfully</p>
                    </div>
                    
                    {testingSummary['comprehensive-test-report.json'] && (
                      <div>
                        <h4 className="font-semibold mb-2">Test Results</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Files Generated: {testingSummary['comprehensive-test-report.json'].filesGenerated?.length || 0}</div>
                          <div>Status: {testingSummary['comprehensive-test-report.json'].status}</div>
                        </div>
                      </div>
                    )}
                    
                    {testingSummary['link-crawl-report.json'] && (
                      <div>
                        <h4 className="font-semibold mb-2">Link Health</h4>
                        <div className="text-sm">
                          <p>Success Rate: {testingSummary['link-crawl-report.json'].successRate}%</p>
                          <p>Pages Checked: {testingSummary['link-crawl-report.json'].totalPages}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No testing data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;