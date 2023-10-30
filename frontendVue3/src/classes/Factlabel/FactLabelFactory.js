
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
    "metadata": [
        {
            "name": "Name",
            "description": "Name of the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Description",
            "description": "Description of the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Author",
            "description": "Author of the feature model",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Year",
            "description": "Year of creation of the feature model",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Reference",
            "description": "Main paper for reference or DOI of the feature model",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Tags",
            "description": "Tags or keywords that identify the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Domain",
            "description": "Domain of the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        }
    ],
    "metrics": [
        {
            "name": "Features",
            "description": "Set of features in the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Abstract features",
            "description": "Features used to structure the feature model that, however, do not have any impact at implementation level.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Abstract leaf features",
            "description": "Abstract and leaf features.",
            "parent": "Abstract features",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Abstract compound features",
            "description": "Abstract and compound features.",
            "parent": "Abstract features",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Concrete features",
            "description": "Features that are mapped to at least one implementation artifact.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Concrete leaf features",
            "description": "Concrete and leaf features.",
            "parent": "Concrete features",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Concrete compound features",
            "description": "Concrete and compound features.",
            "parent": "Concrete features",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Compound features",
            "description": "Features that have subfeatures.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Leaf features",
            "description": "Features that have not subfeatures (aka 'primitive features' or 'terminal features').",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Root feature",
            "description": "The root of the feature model.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Top features",
            "description": "Features that are first descendants of the root.",
            "parent": "Root feature",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Solitary features",
            "description": "Features that are not grouped in a feature group.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Grouped features",
            "description": "Features that occurs in a feature group.",
            "parent": "Features",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Tree relationships",
            "description": "Number of relationships (edges) of the feature model.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Mandatory features",
            "description": "Features marked as mandatory that need to be selected if its parent is selected.",
            "parent": "Tree relationships",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Optional features",
            "description": "Feature marked as optional.",
            "parent": "Tree relationships",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Feature groups",
            "description": "Features that express a choice over the grouped features in a group.",
            "parent": "Tree relationships",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Alternative groups",
            "description": "Feature groups that require the selection of just one child (i.e., [1..1] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Or groups",
            "description": "Feature groups that require the selection of at least one child (i.e., [1..*] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Mutex groups",
            "description": "Feature groups that require the selection of zero or just one child (i.e., [0..1] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Cardinality groups",
            "description": "Feature groups with arbitraty cardinality [a..b] that require the selection of an minimum and a maximum number of children.",
            "parent": "Feature groups",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Depth of tree",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max depth of tree",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Mean depth of tree",
            "description": "Number of features of the mean path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Median depth of tree",
            "description": "Number of features of the median path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Branching factor",
            "description": "Average number of children per non-leaf feature (aka 'Ratio of Variability').",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Avg children per feature",
            "description": "Average number of children per feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Min children per feature",
            "description": "Minimal number of children per non-leaf feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max children per feature",
            "description": "Maximal number of children per feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Cross-tree constraints",
            "description": "Textual cross-tree constraints.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Simple constraints",
            "description": "Requires and Excludes constraints.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Requires constraints",
            "description": "Constraints modeling that the activation of a feature f1 implies the activation of a feature f2.",
            "parent": "Simple constraints",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Excludes constraints",
            "description": "Constraints modeling that two features are mutually exclusive and cannot be activated together.",
            "parent": "Simple constraints",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Complex constraints",
            "description": "Constraints in arbitrary propositional logic formulae.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Pseudo-complex constraints",
            "description": "Constraints that are convertible to a set of simple constraints.",
            "parent": "Complex constraints",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Strict-complex constraints",
            "description": "Constraints that cannot be converted to a set of simple constraints.",
            "parent": "Complex constraints",
            "level": 2,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Features in constraints",
            "description": "Features involved in cross-tree constraints. The ratio to the total number of features is called 'Extra constraint representativeness (ECR)'.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Avg constraints per feature",
            "description": "The average number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Min constraints per feature",
            "description": "The minimal number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max constraints per feature",
            "description": "The maximal number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": null,
            "size": null,
            "ratio": null
        }
    ],
    "analysis": [
        {
            "name": "Valid (not void)",
            "description": "A feature model is valid if it represents at least one configuration.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Core features",
            "description": "Features that are part of all the configurations (aka 'common features').",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Dead features",
            "description": "Features that cannot appear in any configuration.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Variant features",
            "description": "Features that do not appear in all the configurations.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "False-optional features",
            "description": "Features defined as optionals the selection of their parents make the feature itself selected as well.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        },
        {
            "name": "Configurations",
            "description": "Number of configurations represented by the feature model. If <= is shown, the number represents an upper estimation bound.",
            "parent": null,
            "level": 0,
            "value": null,
            "size": null,
            "ratio": null
        }
    ]
}


