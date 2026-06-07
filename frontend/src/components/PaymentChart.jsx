import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function PaymentChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h3 className="text-xl font-semibold mb-4">
        Payment Analytics
      </h3>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="payment_method"
          />

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}

export default PaymentChart;