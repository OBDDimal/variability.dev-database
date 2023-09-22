<template>
    <v-card>
        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for MetaData: -->
        <v-data-table :headers="factHeaders" :items="metadata" item-value="name" class="elevation-1">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>{{ name }}</v-toolbar-title>
                </v-toolbar>
            </template>
            <template v-slot:headers>
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for Metrics: -->
        <v-data-table v-model:expanded="expanded" :headers="factHeaders" :items="metrics" item-value="name" show-expand
            class="elevation-1">
            <template v-slot:headers>
            </template>
            <template v-slot:expanded-row="{ columns, item }">
                <tr>
                    <td :colspan="columns.length">
                        <!-- TODO : mdi-arrow-right-bold-box-outline -->
                        More info about {{ item.raw.name }}
                    </td>
                </tr>
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>
        <v-divider class="border-opacity-100"></v-divider>
        <!--  Data Table for Analysis: -->
        <v-data-table :headers="factHeaders" :items="analysis" item-value="name" class="elevation-1">
            <template v-slot:headers>
            </template>
            <template v-slot:bottom>
            </template>
        </v-data-table>

    </v-card>
</template>

<script>
const facts = {
    "metadata": [
        {
            "name": "Name",
            "description": "Name of the feature model.",
            "parent": null,
            "level": 0,
            "value": "JHipster v3.6.1",
            "size": null,
            "ratio": null
        },
        {
            "name": "Description",
            "description": "Description of the feature model.",
            "parent": null,
            "level": 0,
            "value": "A popular open-source code generator for web applications",
            "size": null,
            "ratio": null
        },
        {
            "name": "Author",
            "description": "Author of the feature model",
            "parent": null,
            "level": 0,
            "value": "Axel Halin et al.",
            "size": null,
            "ratio": null
        },
        {
            "name": "Year",
            "description": "Year of creation of the feature model",
            "parent": null,
            "level": 0,
            "value": 2017,
            "size": null,
            "ratio": null
        },
        {
            "name": "Reference",
            "description": "Main paper for reference or DOI of the feature model",
            "parent": null,
            "level": 0,
            "value": "https://doi.org/10.1145/3023956.3023963",
            "size": null,
            "ratio": null
        },
        {
            "name": "Tags",
            "description": "Tags or keywords that identify the feature model.",
            "parent": null,
            "level": 0,
            "value": "code generator, web",
            "size": null,
            "ratio": null
        },
        {
            "name": "Domain",
            "description": "Domain of the feature model.",
            "parent": null,
            "level": 0,
            "value": "web applications",
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
            "value": [
                "JHipster",
                "Generator",
                "Server",
                "Application",
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "Authentication",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SocialLogin",
                "Database",
                "SQL",
                "Cassandra",
                "MongoDB",
                "Hibernate2ndLvlCache",
                "HazelCast",
                "EhCache",
                "Development",
                "H2",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "Production",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "BackEnd",
                "Gradle",
                "Maven",
                "InternationalizationSupport",
                "Docker",
                "TestingFrameworks",
                "Protractor",
                "Gatling",
                "Cucumber"
            ],
            "size": 45,
            "ratio": null
        },
        {
            "name": "Abstract features",
            "description": "Features used to structure the feature model that, however, do not have any impact at implementation level.",
            "parent": "Features",
            "level": 1,
            "value": [
                "JHipster",
                "Generator",
                "Server",
                "Application",
                "Authentication",
                "Database",
                "SQL",
                "Hibernate2ndLvlCache",
                "Development",
                "H2",
                "Production",
                "BackEnd",
                "TestingFrameworks"
            ],
            "size": 13,
            "ratio": 0.2889
        },
        {
            "name": "Abstract leaf features",
            "description": "Abstract and leaf features.",
            "parent": "Abstract features",
            "level": 2,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Abstract compound features",
            "description": "Abstract and compound features.",
            "parent": "Abstract features",
            "level": 2,
            "value": [
                "JHipster",
                "Generator",
                "Server",
                "Application",
                "Authentication",
                "Database",
                "SQL",
                "Hibernate2ndLvlCache",
                "Development",
                "H2",
                "Production",
                "BackEnd",
                "TestingFrameworks"
            ],
            "size": 13,
            "ratio": 1.0
        },
        {
            "name": "Concrete features",
            "description": "Features that are mapped to at least one implementation artifact.",
            "parent": "Features",
            "level": 1,
            "value": [
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SocialLogin",
                "Cassandra",
                "MongoDB",
                "HazelCast",
                "EhCache",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "Gradle",
                "Maven",
                "InternationalizationSupport",
                "Docker",
                "Protractor",
                "Gatling",
                "Cucumber"
            ],
            "size": 32,
            "ratio": 0.7111
        },
        {
            "name": "Concrete leaf features",
            "description": "Concrete and leaf features.",
            "parent": "Concrete features",
            "level": 2,
            "value": [
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SocialLogin",
                "Cassandra",
                "MongoDB",
                "HazelCast",
                "EhCache",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "Gradle",
                "Maven",
                "InternationalizationSupport",
                "Docker",
                "Protractor",
                "Gatling",
                "Cucumber"
            ],
            "size": 32,
            "ratio": 1.0
        },
        {
            "name": "Concrete compound features",
            "description": "Concrete and compound features.",
            "parent": "Concrete features",
            "level": 2,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Compound features",
            "description": "Features that have subfeatures.",
            "parent": "Features",
            "level": 1,
            "value": [
                "JHipster",
                "Generator",
                "Server",
                "Application",
                "Authentication",
                "Database",
                "SQL",
                "Hibernate2ndLvlCache",
                "Development",
                "H2",
                "Production",
                "BackEnd",
                "TestingFrameworks"
            ],
            "size": 13,
            "ratio": 0.2889
        },
        {
            "name": "Leaf features",
            "description": "Features that have not subfeatures (aka 'primitive features' or 'terminal features').",
            "parent": "Features",
            "level": 1,
            "value": [
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SocialLogin",
                "Cassandra",
                "MongoDB",
                "HazelCast",
                "EhCache",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "Gradle",
                "Maven",
                "InternationalizationSupport",
                "Docker",
                "Protractor",
                "Gatling",
                "Cucumber"
            ],
            "size": 32,
            "ratio": 0.7111
        },
        {
            "name": "Root feature",
            "description": "The root of the feature model.",
            "parent": "Features",
            "level": 1,
            "value": "JHipster",
            "size": 1,
            "ratio": 0.0222
        },
        {
            "name": "Top features",
            "description": "Features that are first descendants of the root.",
            "parent": "Root feature",
            "level": 2,
            "value": [
                "Generator",
                "Authentication",
                "SocialLogin",
                "Database",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "BackEnd",
                "InternationalizationSupport",
                "Docker",
                "TestingFrameworks"
            ],
            "size": 11,
            "ratio": 0.2444
        },
        {
            "name": "Solitary features",
            "description": "Features that are not grouped in a feature group.",
            "parent": "Features",
            "level": 1,
            "value": [
                "Generator",
                "Authentication",
                "SocialLogin",
                "Database",
                "Hibernate2ndLvlCache",
                "Development",
                "Production",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "BackEnd",
                "InternationalizationSupport",
                "Docker",
                "TestingFrameworks",
                "Protractor",
                "Gatling",
                "Cucumber"
            ],
            "size": 18,
            "ratio": 0.4
        },
        {
            "name": "Grouped features",
            "description": "Features that occurs in a feature group.",
            "parent": "Features",
            "level": 1,
            "value": [
                "Server",
                "Application",
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SQL",
                "Cassandra",
                "MongoDB",
                "HazelCast",
                "EhCache",
                "H2",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "Gradle",
                "Maven"
            ],
            "size": 26,
            "ratio": 0.5778
        },
        {
            "name": "Tree relationships",
            "description": "Number of relationships (edges) of the feature model.",
            "parent": null,
            "level": 0,
            "value": [
                "(mandatory) JHipster[1,1]Generator ",
                "(alternative) Generator[1,1]Server Application ",
                "(alternative) Server[1,1]MicroserviceApplication UaaServer ",
                "(alternative) Application[1,1]MicroserviceGateway Monolithic ",
                "(mandatory) JHipster[1,1]Authentication ",
                "(alternative) Authentication[1,1]HTTPSession OAuth2 Uaa JWT ",
                "(optional) JHipster[0,1]SocialLogin ",
                "(optional) JHipster[0,1]Database ",
                "(alternative) Database[1,1]SQL Cassandra MongoDB ",
                "(optional) SQL[0,1]Hibernate2ndLvlCache ",
                "(alternative) Hibernate2ndLvlCache[1,1]HazelCast EhCache ",
                "(mandatory) SQL[1,1]Development ",
                "(alternative) Development[1,1]H2 PostgreSQLDev MariaDBDev MySql ",
                "(alternative) H2[1,1]DiskBased InMemory ",
                "(mandatory) SQL[1,1]Production ",
                "(alternative) Production[1,1]MySQL MariaDB PostgreSQL ",
                "(optional) SQL[0,1]ElasticSearch ",
                "(optional) JHipster[0,1]SpringWebSockets ",
                "(optional) JHipster[0,1]Libsass ",
                "(optional) JHipster[0,1]ClusteredSession ",
                "(mandatory) JHipster[1,1]BackEnd ",
                "(alternative) BackEnd[1,1]Gradle Maven ",
                "(optional) JHipster[0,1]InternationalizationSupport ",
                "(optional) JHipster[0,1]Docker ",
                "(mandatory) JHipster[1,1]TestingFrameworks ",
                "(optional) TestingFrameworks[0,1]Protractor ",
                "(mandatory) TestingFrameworks[1,1]Gatling ",
                "(mandatory) TestingFrameworks[1,1]Cucumber "
            ],
            "size": 28,
            "ratio": null
        },
        {
            "name": "Mandatory features",
            "description": "Features marked as mandatory that need to be selected if its parent is selected.",
            "parent": "Tree relationships",
            "level": 1,
            "value": [
                "Generator",
                "Authentication",
                "Development",
                "Production",
                "BackEnd",
                "TestingFrameworks",
                "Gatling",
                "Cucumber"
            ],
            "size": 8,
            "ratio": 0.4444
        },
        {
            "name": "Optional features",
            "description": "Feature marked as optional.",
            "parent": "Tree relationships",
            "level": 1,
            "value": [
                "SocialLogin",
                "Database",
                "Hibernate2ndLvlCache",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "InternationalizationSupport",
                "Docker",
                "Protractor"
            ],
            "size": 10,
            "ratio": 0.5556
        },
        {
            "name": "Feature groups",
            "description": "Features that express a choice over the grouped features in a group.",
            "parent": "Tree relationships",
            "level": 1,
            "value": [
                "Generator",
                "Server",
                "Application",
                "Authentication",
                "Database",
                "Hibernate2ndLvlCache",
                "Development",
                "H2",
                "Production",
                "BackEnd"
            ],
            "size": 10,
            "ratio": 0.3571
        },
        {
            "name": "Alternative groups",
            "description": "Feature groups that require the selection of just one child (i.e., [1..1] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": [
                "Generator",
                "Server",
                "Application",
                "Authentication",
                "Database",
                "Hibernate2ndLvlCache",
                "Development",
                "H2",
                "Production",
                "BackEnd"
            ],
            "size": 10,
            "ratio": 1.0
        },
        {
            "name": "Or groups",
            "description": "Feature groups that require the selection of at least one child (i.e., [1..*] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Mutex groups",
            "description": "Feature groups that require the selection of zero or just one child (i.e., [0..1] cardinality).",
            "parent": "Feature groups",
            "level": 2,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Cardinality groups",
            "description": "Feature groups with arbitraty cardinality [a..b] that require the selection of an minimum and a maximum number of children.",
            "parent": "Feature groups",
            "level": 2,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Depth of tree",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": null,
            "level": 0,
            "value": 5,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max depth of tree",
            "description": "Number of features of the longest path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": 5,
            "size": null,
            "ratio": null
        },
        {
            "name": "Mean depth of tree",
            "description": "Number of features of the mean path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": 2.66,
            "size": null,
            "ratio": null
        },
        {
            "name": "Median depth of tree",
            "description": "Number of features of the median path from the root to the leaf features.",
            "parent": "Depth of tree",
            "level": 1,
            "value": 2.0,
            "size": null,
            "ratio": null
        },
        {
            "name": "Branching factor",
            "description": "Average number of children per non-leaf feature (aka 'Ratio of Variability').",
            "parent": null,
            "level": 0,
            "value": 3.38,
            "size": null,
            "ratio": null
        },
        {
            "name": "Avg children per feature",
            "description": "Average number of children per feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": 0.98,
            "size": null,
            "ratio": null
        },
        {
            "name": "Min children per feature",
            "description": "Minimal number of children per non-leaf feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": 2,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max children per feature",
            "description": "Maximal number of children per feature.",
            "parent": "Branching factor",
            "level": 1,
            "value": 11,
            "size": null,
            "ratio": null
        },
        {
            "name": "Cross-tree constraints",
            "description": "Textual cross-tree constraints.",
            "parent": null,
            "level": 0,
            "value": [],
            "size": 0,
            "ratio": null
        },
        {
            "name": "Simple constraints",
            "description": "Requires and Excludes constraints.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": [
                "(CTC3) IMPLIES[UaaServer][Uaa]",
                "(CTC5) IMPLIES[Server][NOT[Protractor][]]",
                "(CTC13) IMPLIES[Libsass][Application]"
            ],
            "size": 3,
            "ratio": 0.0
        },
        {
            "name": "Requires constraints",
            "description": "Constraints modeling that the activation of a feature f1 implies the activation of a feature f2.",
            "parent": "Simple constraints",
            "level": 2,
            "value": [
                "(CTC3) IMPLIES[UaaServer][Uaa]",
                "(CTC13) IMPLIES[Libsass][Application]"
            ],
            "size": 2,
            "ratio": 0.6667
        },
        {
            "name": "Excludes constraints",
            "description": "Constraints modeling that two features are mutually exclusive and cannot be activated together.",
            "parent": "Simple constraints",
            "level": 2,
            "value": [
                "(CTC5) IMPLIES[Server][NOT[Protractor][]]"
            ],
            "size": 1,
            "ratio": 0.3333
        },
        {
            "name": "Complex constraints",
            "description": "Constraints in arbitrary propositional logic formulae.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": [
                "(CTC1) IMPLIES[AND[AND[OAuth2][NOT[SocialLogin][]]][NOT[MicroserviceApplication][]]][OR[SQL][MongoDB]]",
                "(CTC2) IMPLIES[SocialLogin][AND[AND[OR[HTTPSession][JWT]][Monolithic]][OR[SQL][MongoDB]]]",
                "(CTC4) IMPLIES[AND[AND[NOT[OAuth2][]][NOT[SocialLogin][]]][NOT[MicroserviceApplication][]]][OR[OR[SQL][MongoDB]][Cassandra]]",
                "(CTC6) IMPLIES[NOT[Server][]][Protractor]",
                "(CTC7) IMPLIES[MySQL][OR[H2][MySql]]",
                "(CTC8) IMPLIES[OR[MicroserviceApplication][MicroserviceGateway]][OR[JWT][Uaa]]",
                "(CTC9) IMPLIES[Monolithic][OR[OR[JWT][HTTPSession]][OAuth2]]",
                "(CTC10) IMPLIES[MariaDB][OR[H2][MariaDBDev]]",
                "(CTC11) IMPLIES[PostgreSQL][OR[H2][PostgreSQLDev]]",
                "(CTC12) IMPLIES[OR[SpringWebSockets][ClusteredSession]][Application]"
            ],
            "size": 10,
            "ratio": 0.0
        },
        {
            "name": "Pseudo-complex constraints",
            "description": "Constraints that are convertible to a set of simple constraints.",
            "parent": "Complex constraints",
            "level": 2,
            "value": [
                "(CTC12) IMPLIES[OR[SpringWebSockets][ClusteredSession]][Application]"
            ],
            "size": 1,
            "ratio": 0.1
        },
        {
            "name": "Strict-complex constraints",
            "description": "Constraints that cannot be converted to a set of simple constraints.",
            "parent": "Complex constraints",
            "level": 2,
            "value": [
                "(CTC1) IMPLIES[AND[AND[OAuth2][NOT[SocialLogin][]]][NOT[MicroserviceApplication][]]][OR[SQL][MongoDB]]",
                "(CTC2) IMPLIES[SocialLogin][AND[AND[OR[HTTPSession][JWT]][Monolithic]][OR[SQL][MongoDB]]]",
                "(CTC4) IMPLIES[AND[AND[NOT[OAuth2][]][NOT[SocialLogin][]]][NOT[MicroserviceApplication][]]][OR[OR[SQL][MongoDB]][Cassandra]]",
                "(CTC6) IMPLIES[NOT[Server][]][Protractor]",
                "(CTC7) IMPLIES[MySQL][OR[H2][MySql]]",
                "(CTC8) IMPLIES[OR[MicroserviceApplication][MicroserviceGateway]][OR[JWT][Uaa]]",
                "(CTC9) IMPLIES[Monolithic][OR[OR[JWT][HTTPSession]][OAuth2]]",
                "(CTC10) IMPLIES[MariaDB][OR[H2][MariaDBDev]]",
                "(CTC11) IMPLIES[PostgreSQL][OR[H2][PostgreSQLDev]]"
            ],
            "size": 9,
            "ratio": 0.9
        },
        {
            "name": "Features in constraints",
            "description": "Features involved in cross-tree constraints. The ratio to the total number of features is called 'Extra constraint representativeness (ECR)'.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": [
                "SocialLogin",
                "MongoDB",
                "Protractor",
                "MicroserviceApplication",
                "ClusteredSession",
                "Cassandra",
                "SpringWebSockets",
                "HTTPSession",
                "UaaServer",
                "Uaa",
                "Libsass",
                "MySQL",
                "Application",
                "H2",
                "MicroserviceGateway",
                "OAuth2",
                "PostgreSQLDev",
                "MariaDBDev",
                "JWT",
                "Monolithic",
                "MariaDB",
                "Server",
                "PostgreSQL",
                "SQL",
                "MySql"
            ],
            "size": 25,
            "ratio": 0.56
        },
        {
            "name": "Avg constraints per feature",
            "description": "The average number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": 1,
            "size": null,
            "ratio": null
        },
        {
            "name": "Min constraints per feature",
            "description": "The minimal number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": 0,
            "size": null,
            "ratio": null
        },
        {
            "name": "Max constraints per feature",
            "description": "The maximal number of constraints per feature.",
            "parent": "Cross-tree constraints",
            "level": 1,
            "value": 3,
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
            "value": "Yes",
            "size": null,
            "ratio": null
        },
        {
            "name": "Core features",
            "description": "Features that are part of all the configurations (aka 'common features').",
            "parent": null,
            "level": 0,
            "value": [
                "JHipster",
                "Generator",
                "Authentication",
                "BackEnd",
                "TestingFrameworks",
                "Gatling",
                "Cucumber"
            ],
            "size": 7,
            "ratio": 0.1556
        },
        {
            "name": "Dead features",
            "description": "Features that cannot appear in any configuration.",
            "parent": null,
            "level": 0,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Variant features",
            "description": "Features that do not appear in all the configurations.",
            "parent": null,
            "level": 0,
            "value": [
                "Server",
                "Application",
                "MicroserviceApplication",
                "UaaServer",
                "MicroserviceGateway",
                "Monolithic",
                "HTTPSession",
                "OAuth2",
                "Uaa",
                "JWT",
                "SocialLogin",
                "Database",
                "SQL",
                "Cassandra",
                "MongoDB",
                "Hibernate2ndLvlCache",
                "HazelCast",
                "EhCache",
                "Development",
                "H2",
                "PostgreSQLDev",
                "MariaDBDev",
                "MySql",
                "DiskBased",
                "InMemory",
                "Production",
                "MySQL",
                "MariaDB",
                "PostgreSQL",
                "ElasticSearch",
                "SpringWebSockets",
                "Libsass",
                "ClusteredSession",
                "Gradle",
                "Maven",
                "InternationalizationSupport",
                "Docker",
                "Protractor"
            ],
            "size": 38,
            "ratio": 0.8444
        },
        {
            "name": "False-optional features",
            "description": "Features defined as optionals the selection of their parents make the feature itself selected as well.",
            "parent": null,
            "level": 0,
            "value": [],
            "size": 0,
            "ratio": 0.0
        },
        {
            "name": "Configurations",
            "description": "Number of configurations represented by the feature model. If <= is shown, the number represents an upper estimation bound.",
            "parent": null,
            "level": 0,
            "value": "26256",
            "size": null,
            "ratio": null
        }
    ]
}
const FM_CHAR_NAME_DESC = "Name"; // FM Characterization Name Descriptor

export default {
    name: 'FactLabel',

    components: {},

    props: {},

    data: () => ({
        name: "Feature Model Fact Label",
        expanded: [],
        factHeaders: [{ key: "name", sortable: false }, { key: "value", sortable: false }],
        metadata: [], // Array of simple k,v pairs

        metrics: [], //complex array of k,v with optional parent 

        analysis: [],
    }),


    computed: {},
    created() {
        this.initialize()
    },
    methods: {
        initialize() {
            this.fillMetaData();
            this.fillAnalysis();
            this.fillMetrics();
            return;
        },
        fillMetaData() {
            this.metadata = facts.metadata.map((entry) => {
                if (entry.name === FM_CHAR_NAME_DESC) {
                    this.name = entry.value; //handle special entry Name which defines Name of FM
                }
                var obj = {}; // temporry JSON object to fill for visualisation of metadata
                obj["name"] = entry.name;
                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },

        fillAnalysis() {
            this.analysis = facts.analysis.map((entry) => {
                var obj = {}; // temporry JSON object to fill for visualisation of analysis
                obj["name"] = entry.name;
                // Value depends on if Size and Ratio are set

                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
        },
        fillMetrics() {

            /**
             * Metric Data structure:
             * name: str
             * value: str
             * parent: null || str
             */
             let root_entries = facts.metrics.filter((entry) => entry.level === 0);
            this.metrics= facts.metrics.map((entry)=>{
                var obj = {}; // temporry JSON object to fill for visualisation of analysis
                obj["name"] = entry.name;
                // Value depends on if Size and Ratio are set

                obj["value"] = this.getDisplayValue(entry);
                return obj;
            });
            for (let level = 0; level <= this.getMaxLevel(facts.metrics); level++) {
                //iterating over each level 
                let entries_on_level = facts.metrics.filter((entry) => entry.level === level);

            }
        },
        getMaxLevel(arr) {
            // Iterate over an Array of metric  entries and return the highest found level
            var maxLevel = 0;
            arr.forEach(function (entry, index) {
                if (entry.level >= maxLevel) {
                    maxLevel = entry.level;
                }
            });
            return maxLevel;
        },
        getDisplayValue(entry) {
            // Determine which value of an entry should be displayed ( size and ratio attributes overwrite value)
            try {
                var value_str = "";
                if (entry.size !== null) {
                    value_str = "" + entry.size;
                    if (entry.ratio !== null) { // append optional ratio
                        var rounded = Math.round(100 * entry.ratio);
                        value_str = value_str + " (" + rounded + "\%)";
                    }
                } else {
                    value_str = entry.value;
                }
                return value_str
            } catch (e) {
                console.error(e);
                return "Failed to determine which value to display";
            }

        }

    },
};
</script>

<style scoped></style>
