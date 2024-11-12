import { useState, useEffect } from "react"
import { AdoptionTable, Spinner } from "../../components"

export default function CourseData() {
    const [data, setData] = useState<DBRow[]>()
    const [course, setCourse] = useState<string>("")

    useEffect(() => {
        if (typeof window !== 'undefined' && window.ipc) {
            window.ipc.on('data', ({ books, course }: { books: DBRow[], course: string }) => {
                setData(books)
                setCourse(course)
            })
        }
    }, [])

    return (
        <div className="flex m-2">
            {data ?
                <div className="flex flex-col">
                    <div className="flex text-sm">
                        {course}
                    </div>
                    {data.length > 0 ?
                        <div className="flex w-full">
                            <AdoptionTable adoptions={data} />
                        </div>
                        :
                        <div>No Titles Adopted</div>
                    }
                </div>
                :
                <Spinner />
            }
        </div>
    )
}