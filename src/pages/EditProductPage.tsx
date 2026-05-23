import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getProductDetails, updateProductAction } from "../store/productSlice";
import API from "../api/axios";

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>(); // URL se ID nikalne ke liye
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading } = useAppSelector((state) => state.products);

  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    description: "",
    category: "",
    countInStock: 0,
    image: "",
  });

  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // 🔄 Component load hote hi purana data lekar aao
  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id))
        .unwrap()
        .then((product) => {
          setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            category: product.category,
            countInStock: product.countInStock,
            image: product.image,
          });
          setPreview(product.image); // Purani image ka preview dikhao
        })
        .catch((err) => alert("Failed to load product: " + err));
    }
  }, [id, dispatch]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "countInStock" ? Number(value) : value,
    });
  };

  // 🖼️ Image Upload Handler (If they want to change image)
  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    const fileData = new FormData();
    fileData.append("image", file);

    setUploading(true);
    try {
      const { data } = await API.post("/upload", fileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image: data.image });
      setUploading(false);
    } catch (error: any) {
      alert("Image upload failed: " + error.message);
      setUploading(false);
    }
  };

  // 🚀 Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await dispatch(
        updateProductAction({ id, productData: formData }),
      ).unwrap();
      alert("Product updated successfully! 🔄");
      navigate("/products");
    } catch (err) {
      alert("Update failed: " + err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              name="price"
              type="number"
              required
              value={formData.price}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock Count
            </label>
            <input
              name="countInStock"
              type="number"
              required
              value={formData.countInStock}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={onChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            name="category"
            type="text"
            required
            value={formData.category}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            onChange={uploadFileHandler}
          />
          {uploading && (
            <p className="text-xs text-blue-500 mt-1">Uploading new image...</p>
          )}
          {preview && (
            <div className="mt-3 w-32 h-32 border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={
                  preview.startsWith("http") || preview.startsWith("/")
                    ? preview
                    : preview
                }
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            required
            value={formData.description}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={onChange}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
