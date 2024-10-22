import Link from 'next/link'
import Image from 'next/image'


export default function HomePage({ isDev }) {
  return (
    <>
      <div className="grid grid-col-1 mt-5 text-3xl text-center">
        <div>
          <Image
            className="ml-auto mr-auto"
            src="/images/owl.png"
            alt="Owl logo"
            width={110}
            height={110}
          />
        </div>
        <span className="courgette-regular">OwlGuide</span>
      </div>
      <div>
        <div className="mt-16 ml-auto mr-auto flex-col flex-wrap flex justify-center w-1/5 gap-2">
          <Link href="/decision" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75">
            Decisions
          </Link>
          <Link href="/adoption" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center">
            Adoptions
          </Link>
          <Link href="/enrollment" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center">
            Enrollment
          </Link>
          {isDev &&
            <Link href="/dev" className="bg-white hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75">
              Dev
            </Link>
          }
        </div>
      </div>
    </>
  )
}
