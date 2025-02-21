import { bSQLDB, regex } from "../utils"

export const orderProcess = async ({ event, method, data }: ProcessArgs) => {
    switch (method) {
        case 'get-term-order':
            if (typeof data === "object" && data !== null && !Array.isArray(data)) {
                const [term, year] = regex.splitFullTerm(data["term"] as string)

                try {
                    const orders = await bSQLDB.orders.getOrdersByTerm(term, year)

                    event.reply('order-data', { orders })
                } catch (error) {
                    throw error
                }
            }
            break

        case 'search-po':
            if (typeof data === "object" && data !== null && !Array.isArray(data)) {
                const { searchPO, searchVendor } = data

                try {
                    const orders = await bSQLDB.orders.getOrdersByPOVendor(searchPO as string, searchVendor as string)

                    event.reply('order-data', { orders })
                } catch (error) {
                    throw error
                }
            }
            break
    }
}