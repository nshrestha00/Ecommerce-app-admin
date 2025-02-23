import { useEffect, useState } from "react";
import { backendUrl, currency } from "../App";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable"; 
import { assets } from "../assets/assets";

const Orders = (token) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) {
      return null;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to generate Excel data
  const downloadExcel = () => {
    try {
      const headers = ["Name", "Address", "Items", "Amount", "Status"];
      const rows = orders.map((order) => [
        order.address.firstName + " " + order.address.lastName,
        `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}`,
        order.items.map(item => `${item.name} x ${item.quantity}`).join(", "),
        `${currency}${order.amount}`,
        order.status
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `order_report_${new Date().toLocaleDateString()}.csv`;
      link.click();
      toast.success("Excel report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download Excel report");
      console.error(error);
    }
  };

  // Function to generate PDF using jsPDF
  const downloadPdf = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text("Order Report", 14, 20);

      // Add generation date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Orders: ${orders.length}`, 14, 37);

      // Prepare table data
      const tableColumn = ["Name", "Items", "Amount", "Status"];
      const tableRows = orders.map((order) => [
        order.address.firstName + " " + order.address.lastName,
        order.items.map(item => `${item.name} x ${item.quantity}`).join(", "),
        `${currency}${order.amount}`,
        order.status
      ]);

      // Add table
      doc.autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Save PDF
      doc.save(`order_report_${new Date().toLocaleDateString()}.pdf`);
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      toast.error("Failed to download PDF report");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div>
      <h3>Order Page</h3>

      <div className="flex justify-end items-center mb-4">
        <div className="flex gap-2"> 
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            📥 Export Excel
          </button>

          <button
            onClick={downloadPdf}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            📥 Export PDF
          </button>
        </div>
      </div>

      <div>
        {orders.map((order, index) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700"
            key={index}
          >
            <img className="w-12" src={assets.parcel_icon} alt="" />

            <div>
              <div>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} x {item.quantity} <span>{item.size}</span>
                      </p>
                    );
                  } else {
                    return (
                      <p className="py-0.5" key={index}>
                        {item.name} x {item.quantity} <span>{item.size}</span>,
                      </p>
                    );
                  }
                })}
              </div>

              <p className="mt-3 mb-2 font-medium">
                {order.address.firstName + " " + order.address.lastName}
              </p>

              <div>
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipCode}
                </p>
              </div>
              <p>{order.address.phone}</p>
            </div>

            <div>
              <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? "Done" : "Pending"}</p>
              <p>Date: {new Date(order.date).toLocaleString()}</p>
            </div>

            <p className="text-sm sm:text-[15px]">{currency}{order.amount}</p>

            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              className="p-2 font-semibold"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Packing">Packing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
