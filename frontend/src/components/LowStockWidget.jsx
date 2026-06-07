function LowStockWidget({ products }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h3 className="text-xl font-semibold mb-4 text-red-500">
        Low Stock Alerts
      </h3>

      {products.length === 0 ? (
        <p className="text-green-600">
          All products sufficiently stocked.
        </p>
      ) : (
        products.map((product) => (

          <div
            key={product.id}
            className="flex justify-between py-3 border-b"
          >
            <span>
              {product.name}
            </span>

            <span className="font-bold text-red-500">
              {product.stock}
            </span>

          </div>

        ))
      )}
    </div>
  );
}

export default LowStockWidget;