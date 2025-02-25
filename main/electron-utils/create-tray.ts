import { nativeImage, Tray } from "electron"

export const createTray = (iconPath: string) => {
    const tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16 }))
    tray.setToolTip('OwlGuide')
}