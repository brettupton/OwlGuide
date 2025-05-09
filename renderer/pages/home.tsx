import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface IHomePage {
  routes: { route: string, plural: boolean }[]
}

export default function HomePage({ routes }: IHomePage) {
  const [audioIsPlaying, setAudioIsPlaying] = useState<boolean>(false)

  const handleAudio = () => {
    const audioHTML = new Audio('/sounds/hoot.mp3')
    if (audioHTML) {
      audioHTML.volume = 0.2

      audioIsPlaying ? audioHTML.pause() : audioHTML.play()
      setAudioIsPlaying(!audioIsPlaying)
    }
  }

  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="flex flex-col text-center -mt-16">
        <Link href="/dev" className="hover:cursor-default"
          onClick={handleAudio}
        >
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
          {routes.map((routeInfo, index) => (
            <Link
              href={`${routeInfo.route}`}
              key={index}
              className="bg-white hover:bg-gray-300 text-gray-800 font-semibold w-full py-2 px-4 border border-gray-400 rounded shadow text-center active:scale-95 transition-transform duration-75"
            >
              {`${routeInfo.route[0].toUpperCase()}${routeInfo.route.slice(1)}${routeInfo.plural ? 's' : ''}`}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
