
// Returns a Factlabel object with empty values
// The object itself contains metadata, metrics and analysis properties,
// each as an array of FactLabelEntries.
// Each entry a JSON and should look like:
// {
//     "name": string,
//     "description": string,
//     "parent": string,
//     "level": int,
//     "value": string || [string],
//     "size": int,
//     "ratio": double
// }
export function getEmptyFactLabel() {
    return facts;
}
const facts = {
    "metrics": [
        {
            "name": "Features",
            "description": "Set of features in the feature model.",
            "parent": null,
            "level": 0,
        },
         {
            "name": "NumberOfFeatures",
            "description": "Number of Features",
            "parent": "Features",
            "level": 1,
        },
        {
            "name": "Number of Leaf Features",
            "description": "Number of Leaf Features",
            "parent": "Features",
            "level": 1,
        },
        {
            "name": "Number of Top Features",
            "description": "Number of Top Features",
            "parent": "Features",
            "level": 1,
        },
        {
            "name": "Tree relationships",
            "description": "Number of relationships (edges) of the feature model.",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Ratio optional Features",
            "description": "Ratio of optional features ",
            "parent": "Tree relationships",
            "level": 1,
        },
        {
            "name": "Cyclomatic Complexity",
            "description": "Cyclomatic Complexity",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Simple Cyclomatic Complexity",
            "description": "Simple Cyclomatic Complexity",
            "parent": "Cyclomatic Complexity",
            "level": 1,
        },
        {
            "name": "Independent Cyclomatic Complexity",
            "description": "Independent Cyclomatic Complexity",
            "parent": "Cyclomatic Complexity",
            "level": 1,
        },
        {
            "name": "Depth of tree",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Tree Depth",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
        },
        {
            "name": "Average Number of Children",
            "description": "Average Number of Children per feature",
            "parent": "Depth of tree",
            "level": 1,
        },
        {
            "name": "Clauses",
            "description": "Metrics for clause representation per model",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Number of Clauses",
            "description": "Number of Clauses for represantation",
            "parent": "Clauses",
            "level": 1,
        },
        {
            "name": "Number of literals",
            "description": "Number of Literals for represantation",
            "parent": "Clauses",
            "level": 1,
        },
        {
            "name": "Clause Density",
            "description": "Maximal number of children per feature.",
            "parent": "Clauses",
            "level": 1,
        },
        {
            "name": "Cross-tree constraints",
            "description": "Textual cross-tree constraints.",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Number of Constraints",
            "description": "Number of Constraints per model.",
            "parent": "Cross-tree constraints",
            "level": 1,
        },
        {
            "name": "Average Constraints Size",
            "description": "Average number of features involved in a constraint",
            "parent": "Cross-tree constraints",
            "level": 1,
        },
        {
            "name": "Cross-tree constraints density",
            "description": "Cross Tree constraints per model",
            "parent": "Cross-tree constraints",
            "level": 1,
        },
        {
            "name": "Features in constraints Density",
            "description": "Features involved in cross-tree constraints. The ratio to the total number of features is called 'Extra constraint representativeness (ECR)'.",
            "parent": "Cross-tree constraints",
            "level": 1,
        },
    ],
    "analysis": [
        {
            "name": "Core features",
            "description": "Features that are part of all the configurations (aka 'common features').",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Dead features",
            "description": "Features that cannot appear in any configuration.",
            "parent": null,
            "level": 0,
        },
        {
            "name": "Configurations",
            "description": "Number of valid configurations represented by the feature model. If <= is shown, the number represents an upper estimation bound.",
            "parent": null,
            "level": 0,
        }
    ]
}


