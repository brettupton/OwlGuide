import Image from 'next/image'
import React, { MutableRefObject, useEffect, useRef, useState } from 'react'

interface IZoomImage {
    src: string
    alt: string
}

export default function ZoomImage({ src = "/images/placeholder.jpg", alt }: IZoomImage) {
    const [isZoomed, setIsZoomed] = useState<boolean>(false)
    const imageSrc = !src ? "/images/placeholder.jpg" : src

    return (
        <div className="flex relative">
            <div className="relative flex h-48 w-32 hover:cursor-zoom-in hover:brightness-75 active:scale-95"
                onClick={() => setIsZoomed(true)}>
                <Image
                    fill
                    src={imageSrc}
                    alt={`zoom-${alt}`}
                    className="rounded-md shadow-md object-cover"
                />
            </div>
            <div className={`fixed top-0 left-0 w-full h-full backdrop-blur z-50 content-center cursor-zoom-out ${isZoomed ? 'pointer-events-auto' : 'hidden'}`}
                onClick={() => setIsZoomed(false)}>
                <div className="flex justify-center">
                    <div className="relative flex h-96 w-64 active:scale-95">
                        <Image
                            fill
                            src={imageSrc}
                            alt={`zoom-${alt}`}
                            className="rounded-md shadow-md object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}