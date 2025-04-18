import fs from 'fs'
import path from 'path'
import { Features } from '../../types/LGBModel'
import { fileHandler } from './fileHandler'

export const getPredictions = (books: Features[]): Promise<Features[]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const forest = await fileHandler.JSON.read(path.join(__dirname, "..", "main", "models", "forest_model.json")) as any

            for (let book of books) {
                book = await encodeFeatures(book)
                const predictions = forest.trees.map((tree) => {
                    let nodeIndex = 0
                    const features = Object.keys(book)
                        .filter((key => !["ID", "ISBN", "Title", "EstSales"].includes(key)))
                        .map((key) => { return Number(book[key]) })

                    while (nodeIndex !== -1) {
                        const node = tree.nodes[nodeIndex];
                        const { left, right, feature, threshold, value } = node;

                        if (left === -1 && right === -1) {
                            // Leaf node: return the prediction value
                            return value;
                        }

                        // Traverse the tree based on the feature's value and the threshold
                        if (features[feature] <= threshold) {
                            nodeIndex = left; // Go to the left child
                        } else {
                            nodeIndex = right; // Go to the right child
                        }
                    }
                })

                // Average predictions from all trees
                const forestPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length
                book.Prediction = 10 ** forestPrediction
            }
            resolve(books)
        } catch (error) {
            reject(error)
        }
    })
}

const encodeFeatures = async (book: Features) => {
    try {
        const encodings = await fileHandler.JSON.read(path.join(__dirname, "..", "main", "models", "forest_encodings.json"))

        for (const key of Object.keys(encodings)) {
            const textFeature = book[key]
            if (encodings[key][textFeature]) {
                book[key] = encodings[key][textFeature]
            } else {
                book[key] = 1
            }
        }
        return book
    } catch (error) {
        throw error
    }
}

export const forest = { getPredictions }