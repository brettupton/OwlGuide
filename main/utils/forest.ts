import * as ort from 'onnxruntime-node'
import path from 'path'
import forestMap from '../forest/forestMap'

const getPrediction = async (term: string, year: string, book): Promise<number> => {
    const session = await ort.InferenceSession.create(path.join(__dirname, '..', 'main', 'forest', 'sales_forest.onnx'))
    const termVal = term === "F" ? 1 : term === "W" ? 2 : term === "A" ? 3 : 1
    const mapVal = mapBook(book)

    const inputArr = [termVal, Number(year), ...mapVal]
    const inputTensor = new ort.Tensor('float32', new Float32Array(inputArr), [1, 6])

    const results = await session.run({ input: inputTensor })
    return results.variable.cpuData[0]
}

const mapBook = (book): number[] => {
    const mappings = []
    for (const key in forestMap) {
        const map = forestMap[key][book[key]]
    }

    return mappings
}

export const predict = getPrediction 