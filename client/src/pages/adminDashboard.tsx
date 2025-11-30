// src/pages/admin/AdminDashboard.tsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useGetAdminDashboardDataQuery } from '../features/dashboard/dashboardApi';
import LoadingOverlay from '../services/overLayLoader';

const AdminDashboard = () => {
  const { data, isLoading, isError } = useGetAdminDashboardDataQuery();
  if (isLoading) return <LoadingOverlay />;
  if (isError) return <div className="text-red-500">Failed to load data</div>;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042'];

  return (
    <div className="p-4 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ✅ Daily Report Section */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 p-4 rounded-xl shadow mb-8">
        <h2 className="text-lg font-bold mb-2">📋 Daily Report</h2>
        {data.dailyReport && data.dailyReport.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm">
            {data.dailyReport.map((event: string, index: number) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">No events recorded today.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ✅ Cards with chart + description */}
        {[
          {
            title: 'Sales',
            description: 'This chart shows the daily sales volume on the platform.',
            Chart: (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )
          },
          {
            title: 'Top Selling Products',
            description: 'Products with the highest number of orders.',
            Chart: (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )
          },
          {
            title: 'Pending Orders',
            description: 'Orders that are not yet completed, grouped by month.',
            Chart: (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.pendingOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            )
          },
          {
            title: 'Completed Orders',
            description: 'Orders that have been fulfilled and delivered to customers.',
            Chart: (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.completedOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4ade80" />
                </BarChart>
              </ResponsiveContainer>
            )
          },
          {
            title: 'Low Stock Products',
            description: 'Products that are running low in stock.',
            Chart: (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.lowStock}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            )
          },
          {
            title: 'Top Customers',
            description: 'Customers with the highest total purchase value.',
            Chart: (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.topCustomers}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {data.topCustomers.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        ].map(({ title, description, Chart }, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex flex-col">
            <div className="mb-4">
              <h2 className="font-semibold text-center">{title}</h2>
              <p className="text-sm text-center text-gray-600 dark:text-gray-300">{description}</p>
            </div>
            {Chart}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
