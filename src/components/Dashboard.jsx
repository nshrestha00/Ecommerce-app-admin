import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from "../App";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
  });
  const [salesData, setSalesData] = useState([]);

  // Fetching stats (you can leave this as is if you still want to use backend)
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendUrl}/api/dashboard/stats`, {
        headers: { token },
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Generate random sales data for the chart
  const generateRandomSalesData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(() => Math.floor(Math.random() * 1000)); // Random sales amounts
    return data;
  };

  useEffect(() => {
    fetchStats();
    const randomSales = generateRandomSalesData();
    setSalesData(randomSales);
  }, []);

  // Sales Chart Data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: salesData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold">{stats.totalProducts}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              📦
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              🛍️
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default Dashboard;
