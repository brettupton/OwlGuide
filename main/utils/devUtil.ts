import fs from "fs"
import path from "path"
import * as zip from "@zip.js/zip.js"
import { paths } from "."

export const createZipBlob = async () => {
    const directories = [paths.configPath, paths.tempPath, paths.logPath]
    const blobWriter = new zip.BlobWriter("application/zip")
    const writer = new zip.ZipWriter(blobWriter, { bufferedWrite: true })

    const addFilesRecursively = async (dir: string, parentPath = "") => {
        try {
            const files = await fs.promises.readdir(dir)
            for (const file of files) {
                const fullPath = path.join(dir, file)
                const relativePath = path.join(parentPath, file)
                const stat = fs.statSync(fullPath)

                if (stat.isDirectory()) {
                    // Recursively process subdirectory
                    await addFilesRecursively(fullPath, relativePath)
                } else if (stat.isFile()) {
                    // Read file and add it to the zip archive
                    const buffer = fs.readFileSync(fullPath)
                    await writer.add(relativePath, new zip.Uint8ArrayReader(buffer))
                }
            }
        } catch (error) {
            throw new Error(`Error reading directory ${dir}: ${error}`)
        }
    }

    try {
        // Process all directories
        for (const dir of directories) {
            if (fs.existsSync(dir)) {
                const stat = fs.statSync(dir)
                if (stat.isDirectory()) {
                    await addFilesRecursively(dir)
                } else if (stat.isFile()) {
                    const buffer = fs.readFileSync(dir)
                    await writer.add(path.basename(dir), new zip.Uint8ArrayReader(buffer))
                }
            }
        }

        await writer.close()
        return blobWriter.getData()
    } catch (error) {
        throw error
    }
}
