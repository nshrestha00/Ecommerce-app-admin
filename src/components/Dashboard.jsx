import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl} from "../App";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
  });

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

  useEffect(() => {
    fetchStats();
  }, []);

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
    </div>
  );
};

export default Dashboard;