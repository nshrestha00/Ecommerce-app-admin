import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // for table functionality

const List = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const fetchList = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
      });

      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  // Function to generate Excel data
  const downloadExcel = () => {
    try {
      const headers = ['Name', 'Category', 'Price', 'Image URL'];
      const rows = list.map(product => [
        product.name,
        product.category,
        `${currency}${product.price}`,
        product.image[0]
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `product_report_${new Date().toLocaleDateString()}.csv`;
      link.click();
      toast.success('Excel report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download Excel report');
      console.error(error);
    }
  };

  // Function to generate PDF using jsPDF
  const downloadPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text('Product Report', 14, 20);
      
      // Add generation date
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Products: ${list.length}`, 14, 37);

      // Prepare table data
      const tableColumn = ['Name', 'Category', 'Price'];
      const tableRows = list.map(product => [
        product.name,
        product.category,
        `${currency}${product.price}`
      ]);

      // Add table
      doc.autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      // Save PDF
      doc.save(`product_report_${new Date().toLocaleDateString()}.pdf`);
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF report');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="mb-2">All Products List</p>
        <div className="flex gap-4">
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

      <div className="flex flex-col gap-2">
        {/* List Table Title */}
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className="text-center">Actions</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12 h-12 object-contain" src={item.image[0]} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{currency}{item.price}</p>
            
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => navigate(`/edit/${item._id}`)}
                className="text-blue-600 hover:underline"
              >
                ✏️
              </button>
              <button
                onClick={() => removeProduct(item._id)}
                className="text-red-600 hover:underline"
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default List;