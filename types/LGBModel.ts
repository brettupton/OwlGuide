type TreeStructure = {
    split_index: number
    split_feature: number
    split_gain: number
    threshold: number
    decision_type: string
    default_left: boolean
    missing_type: string
    internal_value: number
    internal_count: number
    left_child: TreeStructure
    right_child: TreeStructure
    leaf_index?: number
    leaf_value?: number
    leaf_weight?: number
    leaf_count?: number
}

export type LGBModel = {
    name: string
    version: string
    num_class: number
    num_tree_per_interation: number
    label_index: number
    max_feature_idx: number
    objective: string
    average_output: boolean
    feature_names: string[]
    monotone_constraints: any[]
    feature_infos: {
        [feature: string]: {
            min_value: number
            max_value: number
            values: number[]
        }
    }
    tree_info: {
        tree_index: number
        num_leaves: number
        num_cat: number
        shrinkage: number
        tree_structure: TreeStructure
    }[]
    feature_importances: {
        [feature: string]: number
    }
    pandas_categorical: []
}

export type Features = {
    ID: number
    ISBN: number
    Title: string
    EstSales: number
    Term: string
    Year: number
    Publisher: string
    Dept: string
    Course: number
    EstEnrl: number
    ActEnrl: number
    Price: number
    Prediction?: number
}