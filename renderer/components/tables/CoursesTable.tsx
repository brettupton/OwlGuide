interface CoursesTableProps {
    courses: DBRow[]
}

export default function CoursesTable({ courses }: CoursesTableProps) {
    const fields = Object.keys(courses[0])
    return (
        <div className="flex flex-col w-full pt-2 h-full justify-between">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg table-fixed">
                <table className="w-full text-sm text-left rtl:text-right text-white">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {fields.map((header, index) => {
                                return (
                                    <th scope="col" className={`p-1 ${typeof (courses[0][header]) === "number" ? "text-center" : ""}`} key={index}>
                                        {header}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((row, index) => {
                            return (
                                <tr className="bg-gray-800 hover:bg-gray-600 border-b border-gray-700" key={index}>
                                    {fields.map((field) => {
                                        return (
<<<<<<< HEAD
<<<<<<< HEAD
                                            <td className={`p-1 ${typeof (row[field]) === "number" ? "text-center" : ""}`}>
=======
                                            <td className={`p-1 ${typeof (row[field]) === "number" ? "text-center" : ""}`} key={`${index}-${field}`}>
>>>>>>> main
=======
                                            <td className={`p-1 ${typeof (row[field]) === "number" ? "text-center" : ""}`} key={`${index}-${field}`}>
>>>>>>> main
                                                {row[field]}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex text-xs justify-end mt-1">Num: {courses.length}</div>
        </div>
    )
}