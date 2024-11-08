import bSQLDB from "../utils/bSQLDB"

export const replaceTables = async (files: string[]) => {
    try {
        // Files need to be in specific order for table creation
        // Tables that have foreign key references need their foreign table to be created first
        const order = ['ADP024', 'ADP001', 'ADP006', 'ADP003']
        files.sort((a, b) => {
            const nameA = a.split('\\').pop().split('.')[0]
            const nameB = b.split('\\').pop().split('.')[0]

            return order.indexOf(nameA) - order.indexOf(nameB)
        })

        for (const filePath of files) {
            await bSQLDB.all.replaceTable(filePath)
        }
    } catch (error) {
        throw error
    }
}