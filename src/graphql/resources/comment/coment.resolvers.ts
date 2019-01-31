import { GraphQLResolveInfo, formatError } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";

export const commentResolvers = {

    Comment: {
        //@ts-ignore
        user: async (comment, args, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            try {
                const response = await db.User.findById(comment.get('user'))
                return response
            } catch (error) {
                return formatError(error)
            } 
        },
        //@ts-ignore
        post: async (comment, args, {db}:{db: DbConnection}, info:  GraphQLResolveInfo) => {
            try {
                const response = await db.Post.findById(comment.get('post'))
                return response
            } catch (error) {
                return formatError(error)
            } 
        },
    },
    Query: {
        //@ts-ignore
        commentByPost: async (comment, {postId, first= 10, offset=0}, {db} :{db: DbConnection}, info: GraphQLResolveInfo) => {
            
            try {
                postId = parseInt(postId)
                const response = await db.Comment.findAll({
                    where: {post: postId},
                    limit: first,
                    offset
                })
                return response;
            } catch (error) {
                return formatError(error)
            }
        }
    },
    Mutation: {
        //@ts-ignore
        createComment: async (parent, {input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            return db.sequelize.transaction(async (t: Transaction) => {
                return await db.Comment.create(input, {transaction: t})
            })
        },
        //@ts-ignore
        updateComment: async (parent, {id, input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const comment = await db.Comment.findById(id)
                    if(!comment) throw new Error (`Comment with id ${id} not found!`) 
                    // retorna o usuário atualizado
                    await db.Comment.update(input, {where: {id}, transaction: t})
                    return await db.Comment.findById(id, {transaction: t})
                    
                })
                return response
            } catch (error) {
                console.error(error)
                return formatError(error)
            }
        },
        //@ts-ignore
        deleteComment: async (parent, {id}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const comment = await db.Comment.findById(id)
                    if(!comment) throw new Error (`Comment with id ${id} not found!`) 
                    return await db.Comment.destroy({where: {id}, transaction: t})
                })
                // retorna true / false
                return !!response
            } catch (error) {
                console.error(error)
                return formatError(error)
            }
        },
    }
}