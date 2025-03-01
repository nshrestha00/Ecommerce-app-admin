import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    sizes: "",
    bestseller: false,
    images: [], 
  });
  const [loading, setLoading] = useState(true); 

  // Fetch product details when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${backendUrl}/api/product/single`, 
          { productId: id },
          { headers: { token } }
        );

        console.log("Product Data:", response.data);

        if (response.data.success) {
          setFormData({
            name: response.data.product.name,
            description: response.data.product.description,
            price: response.data.product.price,
            category: response.data.product.category,
            subCategory: response.data.product.subCategory,
            sizes: JSON.stringify(response.data.product.sizes), 
            bestseller: response.data.product.bestseller,
            images: response.data.product.image || [], 
          });
          setLoading(false);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to fetch product");
      }
    };

    fetchProduct();
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      
      // Prepare form data for image upload
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("price", formData.price);
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("subCategory", formData.subCategory);
      formDataToSubmit.append("sizes", formData.sizes);
      formDataToSubmit.append("bestseller", formData.bestseller);

      // Append images to form data
      formData.images.forEach((image) => {
        formDataToSubmit.append("images", image); 
      });

      const response = await axios.put(
        `${backendUrl}/api/product/update/${id}`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            token,
          },
        }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/list");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  // Handle adding images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...files], 
    }));
  };

  // Handle removing image
  const handleRemoveImage = (index) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index);
      return { ...prevData, images: newImages };
    });
  };

  if (loading) {
    return <p className="text-center mt-10">Loading product data...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-5 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded"
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="subCategory"
          value={formData.subCategory}
          onChange={handleChange}
          placeholder="Subcategory"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="sizes"
          value={formData.sizes}
          onChange={handleChange}
          placeholder="Sizes (comma-separated)"
          className="border p-2 rounded"
        />
        <label>
          Bestseller:
          <input
            type="checkbox"
            name="bestseller"
            checked={formData.bestseller}
            onChange={(e) => setFormData({ ...formData, bestseller: e.target.checked })}
          />
        </label>

        {/* Render the image previews */}
        <div className="my-2">
          {formData.images.map((image, index) => (
            <div key={index} className="relative inline-block mr-4">
              {image && image instanceof File ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product ${index + 1}`}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              ) : (
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-40 h-40 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                className="absolute top-0 right-0 text-white bg-red-500 p-1 rounded-full"
                onClick={() => handleRemoveImage(index)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Image upload input */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="border p-2 rounded"
        />

        <button type="submit" className="w-28 py-3 mt-4 bg-black text-white">
          Update 
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
