import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { listProducts, deleteProduct } from "../store/productSlice";
import { Edit, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductListPage = () => {
  // React Router navigation hook
  const navigate = useNavigate();

  // Redux dispatch
  const dispatch = useAppDispatch();

  // Redux state se products data le rahe hain
  const { products, loading, error } = useAppSelector(
    (state) => state.products,
  );

  /* =========================================================
     Delete Product Handler
     ========================================================= */
  const deleteHandler = async (id: string) => {
    // Delete se pehle confirmation
    if (window.confirm("Bhai, pakka delete karna hai?")) {
      try {
        // Product delete action dispatch
        await dispatch(deleteProduct(id)).unwrap();

        // Success case
        alert("Product successfully delete ho gaya!");
      } catch (err) {
        // Error case
        alert("Delete nahi ho saka: " + err);
      }
    }
  };

  /* =========================================================
     Component Load Hone Par Products Fetch Karna
     ========================================================= */
  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      {/* =====================================================
          Header Section
          ===================================================== */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products Inventory</h2>

        {/* Add Product Button */}
        <button
          onClick={() => navigate("/products/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* =====================================================
          Loading State
          ===================================================== */}
      {loading ? (
        <p>Loading products...</p>
      ) : /* =====================================================
          Error State
          ===================================================== */
      error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        /* =====================================================
          Products Table
          ===================================================== */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Head */}
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-sm">
                <th className="p-4 border-b">Product Name</th>
                <th className="p-4 border-b">Category</th>
                <th className="p-4 border-b">Price</th>
                <th className="p-4 border-b">Stock</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 transition border-b last:border-0"
                  >
                    {/* Product Name */}
                    <td className="p-4 font-medium text-gray-800">
                      {product.name}
                    </td>

                    {/* Product Category */}
                    <td className="p-4 text-gray-600">{product.category}</td>

                    {/* Product Price */}
                    <td className="p-4 text-gray-900 font-semibold">
                      ${product.price}
                    </td>

                    {/* Product Stock */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          product.countInStock > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.countInStock > 0
                          ? `${product.countInStock} In Stock`
                          : "Out of Stock"}
                      </span>
                    </td>

                    {/* =================================================
                        Action Buttons
                        ================================================= */}
                    <td className="p-4 flex gap-3">
                      {/* Edit Button */}
                      <button
                        onClick={() =>
                          navigate(`/products/edit/${product._id}`)
                        }
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteHandler(product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                /* No Products Found */
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No Products Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
