import { GraphQLResolveInfo, formatError } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";

export const postResolvers = {

    Post: {
        //@ts-ignore
        author: async (post, args, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            return await db.User
                .findById(post.get('author'))
        },
        //@ts-ignore
        comments: async(post, {first = 10, offset = 0}, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            return await db.Comment
                .findAll({
                    where: {post: post.get('id')},
                    limit: first,
                    offset
                })
        },
    },
    Query: {
        //@ts-ignore
        posts: async (parent, {first = 10, offset = 0}, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            return await db.Post
                .findAll({
                    limit: first,
                    offset
                })
        },
        //@ts-ignore
        post: async (parent, {id}, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            id = parseInt(id)
            const post = await db.Post.findById(id)
            if(!post) throw new Error(`Post with id ${id} not found!`)
            return post;
        },
    },
    Mutation: {
        //@ts-ignore
        createPost : async (parent, {input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            return db.sequelize.transaction(async (t: Transaction) => {
                return await db.Post.create(input, {transaction: t})
            })
            
        },
        //@ts-ignore
        updatePost: async (parent, {id, input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const user = await db.Post.findById(id)
                    if(!user) {
                        throw new Error (`User with id ${id} not found!`)
                    }// retorna o usuário atualizado
                    await db.Post.update(input, {where: {id}})
                    return await db.Post.findById(id, {transaction: t }) 
                })
                return response
            } catch (error) {
                return formatError(error)
            }
        },
        //@ts-ignore
        deletePost: async (parent, {id}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction(async(t: Transaction) => {
                const post = await db.Post.findById(id)
                if(!post) throw new Error(`Post with id ${id} not found!`);
                const postDeleted = await db.Post.destroy({where: {id}, transaction: t})
                return !!postDeleted
            })
        },
    }
}

