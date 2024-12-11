import fs from 'fs'
import path from 'path'
import { Features, LGBModel } from '../../types/LGBModel'

export const getPredictions = (books: Features[]): Promise<Features[]> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, "..", "main", "models", "forest_model.json"), (err, data) => {
            if (err) { reject(err) }

            const model: LGBModel = JSON.parse(data.toString())
            try {
                for (let book of books) {
                    const features = Object.keys(book)
                        .filter((key => !["ID", "ISBN", "Title", "EstEnrl", "ActEnrl", "EstSales"].includes(key)))
                        .map((key) => { return Number(book[key]) })
                    let predictionSum = 0

                    for (const tree of model.tree_info) {
                        let node = tree.tree_structure

                        while (node.left_child || node.right_child) {
                            const featureIndex = node.split_feature
                            const threshold = node.threshold

                            if (features[featureIndex] <= threshold) {
                                node = node.left_child
                            } else {
                                node = node.right_child
                            }
                        }

                        predictionSum += node.leaf_value
                    }
                    book.Prediction = predictionSum
                }
                resolve(books)
            } catch (error) {
                reject(error)
            }
        })
    })
}