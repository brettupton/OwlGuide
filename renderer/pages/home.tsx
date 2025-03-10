import Link from 'next/link'
import Image from 'next/image'

<<<<<<< HEAD

export default function HomePage() {
  const routes = ['course', 'book', 'decision', 'enrollment']
  const plurals = ['course', 'decision', 'book']
=======
export default function HomePage() {
  const routes = ["adoption", "course", "book", "decision", "enrollment", "order", "report"]
  const plurals = ["adoption", "course", "decision", "book", "order", "report"]
>>>>>>> main

  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="flex flex-col text-center -mt-16">
        <Link href="/dev">
          <Image
            className="ml-auto mr-auto"
            src="/images/owl.png"
            alt="OwlGuide Logo"
            width={110}
            height={110}
            priority={true}
          />
        </Link>
        <span className="courgette-regular text-3xl">OwlGuide</span>
        <div className="grid grid-cols-2 gap-5 mt-10">
          {routes.map((route, index) => (
            <Link
              href={`${route}`}
              key={index}
              className="bg-white hover:bg-gray-300 text-gray-800 font-semibold w-full py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
            >
              {`${route[0].toUpperCase()}${route.slice(1)}${plurals.includes(route) ? 's' : ''}`}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
