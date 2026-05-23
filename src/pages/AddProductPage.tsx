import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createProduct } from "../store/productSlice";
import API from "../api/axios"; // Axios instance import kiya upload ke liye

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    countInStock: 0,
    image: "", // Shuru mein khali hoga
  });

  const [uploading, setUploading] = useState(false); // Image upload loading state
  const [preview, setPreview] = useState<string | null>(null); // Image preview local state

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.products);

  // 📝 Text Fields Handler
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" || name === "countInStock" ? Number(value) : value,
    });
  };

  // 📁 Image Upload Handler (The Boss Logic)
  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview dikhane ke liye URL banana
    setPreview(URL.createObjectURL(file));

    const fileData = new FormData();
    fileData.append("image", file); // Backend 'upload.single("image")' accept karta hai

    setUploading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await API.post("/upload", fileData, config);
      
      // Backend se jo image path aaya, usay state mein save kiya
      setFormData({ ...formData, image: data.image });
      setUploading(false);
    } catch (error: any) {
      alert("Image upload failed: " + (error.response?.data?.message || error.message));
      setUploading(false);
    }
  };

  // 🚀 Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Bhai, pehle image upload hone do!");
      return;
    }
    try {
      await dispatch(createProduct(formData)).unwrap();
      alert("Mubarak ho! Product with image save ho gaya. 🎉");
      navigate("/products");
    } catch (err) {
      alert("Masla aa gaya: " + err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            name="name" type="text" required
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              name="price" type="number" required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock Count</label>
            <input
              name="countInStock" type="number" required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={onChange}
            />
          </div>
        </div>

        {/* Category Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            name="category" type="text" required
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          />
        </div>

        {/* 🖼️ Image Selection Box */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          <input
            type="file"
            accept="image/*"
            required
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            onChange={uploadFileHandler}
          />
          {uploading && <p className="text-xs text-blue-500 mt-1">Uploading Image... Please wait.</p>}
          
          {/* Live Image Preview Window */}
          {preview && (
            <div className="mt-3 w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description" rows={3} required
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className={`w-full text-white py-3 rounded-xl font-bold transition ${
            loading || uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving Product..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;