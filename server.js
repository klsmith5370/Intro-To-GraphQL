const express = require("express");

// In order to use GraphQL, need to pull in the protocol from express-graphql
const { graphqlHTTP } = require("express-graphql");

// pulling out from GraphQL to create the models and validations
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require("graphql");

// import the seed data
const {
    actors,
    movies
} = require("./seedData");

const app = express();

// setting up the types
const MovieType = new GraphQLObjectType({
    name: "Movie",
    description: "Represents a single movie with a actor",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        actorId: { type: GraphQLNonNull(GraphQLInt) },
        // linking actors to movies
        actor: {
            type: ActorType,
            resolve: (movie) => {
                return actors.find(actor => actor.id === movie.actorId)
            }
        }
    })
});

const ActorType = new GraphQLObjectType({
    name: "Actor",
    description: "Represents a single actor of a movie",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        // linking movies to the actor
        movies: {
            type: new GraphQLList(MovieType),
            resolve: (actor) => {
                return movies.filter(movie => movie.actorId === actor.id)
            }
        }
    })
});

// setting up the root query
const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "Root Query",
    fields: () => ({
        movie: {
            type: MovieType,
            description: "A single movie",
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) => movies.find(movie => movie.id === args.id)
        },
        movies: {
            type: GraphQLList(MovieType),
            description: "List of all the movies",
            resolve: () => movies
        },
        actor: {
            type: ActorType,
            description: "A single actor",
            args: {
                id: { type: GraphQLInt },
            },
            resolve: (parent, args) => actors.find(actor => actor.id === args.id)
        },
        actors: {
            type: GraphQLList(ActorType),
            description: "List of all the actors",
            resolve: () => actors
        }
    })
});

// creating the mutation query (for adding/making CRUD actions)
const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: () => ({
        addMovie: {
            type: MovieType,
            description: "Add a movie",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                actorId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const movie = {
                    id: movies.length + 1,
                    name: args.name,
                    actorId: args.actorId
                }
                movies.push(movie)
                return movie
            }
        }
    })
});


// creating the schema 
const schema = new GraphQLSchema({
    query: RootQueryType, // for getting 
    mutation: RootMutationType // for making changes to the database (such as adding)
});

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true // enables a Graphiql interface
}))

app.listen(5004, () => console.log("Server is running on PORT: 5004!"));