import Image from "next/image"
import { BookResult } from "../../types/Book"

export default function BookDisplay({ book }: { book: BookResult }) {
    return (
        <div className="flex bg-gray-300 rounded-xl border border-white m-4 p-3 text-black">
            <div className="flex">
                <Image
                    src={`${book.Image ?? '/images/placeholder.jpg'}`}
                    width={130}
                    height={130}
                    alt="Book Thumbnail"
                />
            </div>
            <div className="flex flex-col ml-2 w-full">
                <div className="flex text-xl">{book.Title}</div>
                <div className="flex">{book.ISBN}</div>
                <div className="flex">{book.AuthorLast}</div>
                <div className="flex">{book.Author}</div>
                <div className="flex">{book.Edition}</div>
                <div className="flex">{book.Vendor}</div>
                <div className="flex">{book.Publisher}</div>
                <div className="flex text-sm place-self-end translate-y-3 translate-x-1">{book.ID}</div>
            </div>
        </div>
    )
}