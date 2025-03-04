import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const token = localStorage.getItem('token')

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);
  
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(isEditMode);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);


  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const response = await axios.post(
            `${backendUrl}/api/product/single`,
            { productId: id },
            { headers: { token } }
          );

          if (response.data.success) {
            const product = response.data.product;
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price);
            setCategory(product.category);
            setSubCategory(product.subCategory);
            setBestseller(product.bestseller);
            setSizes(product.sizes || []);
            
            // Store existing images
            setExistingImages(product.image || []);
            
            setLoading(false);
          } else {
            toast.error(response.data.message);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to fetch product");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, token, isEditMode]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
    setPrice("");
    setCategory("Men");
    setSubCategory("Topwear");
    setBestseller(false);
    setSizes([]);
  };


  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));

      // Append new images if any
      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      let response;

      if (isEditMode) {
        // Update existing product
        response = await axios.put(
          `${backendUrl}/api/product/update/${id}`,
          formData,
          { headers: { token } }
        );
      } else {
        // Add new product
        response = await axios.post(
          `${backendUrl}/api/product/add`,
          formData,
          { headers: { token } }
        );
      }

      if (response.data.success) {
        toast.success(response.data.message);
        
        if (isEditMode) {
          navigate("/list"); // Navigate back to list after edit
        } else {
          resetForm(); // Reset form after add
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading product data...</p>;
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Upload Image {isEditMode && "(Upload new images to replace existing ones)"}</p>
        
        {/* Display existing images if in edit mode */}
        {isEditMode && existingImages.length > 0 && (
          <div className="mb-3">
            <p className="mb-2">Current Images:</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {existingImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    className="w-20 h-20 object-cover"
                    src={img}
                    alt={`Product ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload new images section */}
        <div className="flex gap-2">
          {[image1, image2, image3, image4].map((image, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>
              <img
                className="w-20"
                src={
                  !image
                    ? assets.upload_area
                    : URL.createObjectURL(image)
                }
                alt=""
              />
              <input
                onChange={(e) => {
                  const handlers = [
                    setImage1,
                    setImage2,
                    setImage3,
                    setImage4,
                  ];
                  handlers[index](e.target.files[0]);
                }}
                type="file"
                id={`image${index + 1}`}
                hidden
              />
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Type here"
          required
        />
      </div>

      <div className="w-full">
        <p className="mb-2">Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className="w-full max-w-[500px] px-3 py-2"
          placeholder="Write content here"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Product Category</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Sub Category</p>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-3 py-2"
          >
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className="w-full px-3 py-2 sm:w-[120px]"
            type="number"
            placeholder="25"
            required
          />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div
              key={size}
              onClick={() =>
                setSizes((prev) =>
                  prev.includes(size)
                    ? prev.filter((s) => s !== size)
                    : [...prev, size]
                )
              }
            >
              <p
                className={`${
                  sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                } px-3 py-1 cursor-pointer`}
              >
                {size}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller(prev => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Add to bestseller
        </label>
      </div>

      <button className="w-28 py-3 mt-4 bg-black text-white" type="submit">
        {isEditMode ? "UPDATE" : "ADD"}
      </button>
    </form>
  );
};

export default AddEditProduct;