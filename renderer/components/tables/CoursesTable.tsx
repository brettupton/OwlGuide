interface CoursesTableProps {
    courses: DBRow[]
}

export default function CoursesTable({ courses }: CoursesTableProps) {
    const fields = Object.keys(courses[0])
    return (
        <div className="m-2 relative overflow-x-auto shadow-md sm:rounded-lg max-h-[calc(100vh-20rem)]">
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
                                        <td className={`p-1 ${typeof (row[field]) === "number" ? "text-center" : ""}`}>
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
    )
}