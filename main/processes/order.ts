import { bSQLDB, regex } from "../utils"

export const orderProcess = async ({ event, method, data }: ProcessArgs) => {
    if (data.type === "order") {
        switch (method) {
            case 'get-term-order':
                const [term, year] = regex.splitFullTerm(data["term"])

                try {
                    const orders = await bSQLDB.orders.getOrdersByTerm(term, year)
                    event.reply('order-data', { orders })
                } catch (error) {
                    throw error
                }
                break
            case 'search-po':
                try {
                    const orders = await bSQLDB.orders.getOrdersByPOVendor(data["searchPO"], data["searchVendor"])
                    event.reply('order-data', { orders })
                } catch (error) {
                    throw error
                }
                break
        }
    }
}