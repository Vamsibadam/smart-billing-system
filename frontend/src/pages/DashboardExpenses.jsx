import CashBook from "../components/billing/CashBook";
import MainLayout from "../layouts/MainLayout";

function DashboardExpenses() {
    return (
        <MainLayout>
            <div className="w-full px-6 py-6">
                <CashBook />
            </div>
        </MainLayout>
    );
}

export default DashboardExpenses;