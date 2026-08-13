import {
  deductBillInventoryWithRetry
} from "../services/billingService";

export const recoverPendingInventory = async () => {

    const pendingBills = JSON.parse(
        localStorage.getItem(
            "pending_inventory_bills"
        ) || "[]"
    );

    if (pendingBills.length === 0) {
        return;
    }

    console.log(
        "Recovering pending inventory:",
        pendingBills
    );

    for (const billId of pendingBills) {

        try {

            await deductBillInventoryWithRetry(
                billId
            );

            console.log(
                "Inventory recovered for bill:",
                billId
            );

            removePendingBill(billId);

        } catch (error) {

            const status =
                error.response?.status;

            // ==========================================
            // 400 = CANNOT BE FIXED BY RETRY
            // ==========================================

            if (status === 400) {

                console.error(
                    `Inventory cannot be completed for bill ${billId}:`,
                    error.response?.data
                );

                removePendingBill(
                    billId
                );

                continue;
            }

            // ==========================================
            // NETWORK / SERVER ERROR
            // KEEP IT PENDING
            // ==========================================

            console.error(
                `Inventory still pending for bill ${billId}`,
                error
            );
        }
    }
};


const removePendingBill = (billId) => {

    const pendingBills = JSON.parse(
        localStorage.getItem(
            "pending_inventory_bills"
        ) || "[]"
    );

    const updatedBills =
        pendingBills.filter(
            id => id !== billId
        );

    localStorage.setItem(
        "pending_inventory_bills",
        JSON.stringify(
            updatedBills
        )
    );
};