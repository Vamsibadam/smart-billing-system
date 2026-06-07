function TopProducts({ products }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h3 className="text-xl font-semibold mb-4">
        Top Products
      </h3>

      {products.map((product, index) => (

        <div
          key={index}
          className="flex justify-between py-3 border-b"
        >
          <span>
            {product.product__name}
          </span>

          <strong>
            {product.quantity_sold}
          </strong>
        </div>

      ))}
    </div>
  );
}

export default TopProducts;