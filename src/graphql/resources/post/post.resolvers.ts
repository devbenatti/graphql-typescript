import { GraphQLResolveInfo, formatError } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { Transaction } from "sequelize";
import { compose } from "../../composable/composable.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import {throwError} from '../../../utils/utils'
import {authResolvers} from '../../composable/auth.resolver'
import { DataLoaders } from "../../../interfaces/DataLoadersInterace";
import { RequestedFields } from "../../ast/RequestedFields";
export const postResolvers = {

    Post: {
        //@ts-ignore
        author: async (post, args, {db, dataloaders: {userLoader}}:{db: DbConnection, dataloaders  : DataLoaders}, info:  GraphQLResolveInfo) => {
            /*return await db.User
                .findById(post.get('author'))*/
            return userLoader
                .load(post.get('author'))
        },
        //@ts-ignore
        comments: async(post, {first = 10, offset = 0}, context, info:  GraphQLResolveInfo) => {
            const attributes = context.requestedFields.getFields(info)
            return await context.db.Comment
                .findAll({
                    where: {post: post.get('id')},
                    limit: first,
                    offset,
                    attributes
                })
        },
    },
    Query: {
        //@ts-ignore
        posts: async (parent, {first = 10, offset = 0}, {db, requestedFields}:{db: DbConnection, requestedFields: RequestedFields}, info:  GraphQLResolveInfo) => {
            const attributes = requestedFields.getFields(info, {
                keep: ['id'],
                exclude: ['comments']
            })
            return await db.Post
                .findAll({
                    limit: first,
                    offset,
                    attributes
                })
        }, 
        //@ts-ignore
        post: async (parent, {id}, {db, requestedFields}:{db: DbConnection, requestedFields: RequestedFields}, info:  GraphQLResolveInfo) => {
            id = parseInt(id)
            const attributes = requestedFields.getFields(info, {
                keep: ['id'],
                exclude: ['comments']
            })
            const post = await db.Post
            .findByPk(id,{
                attributes
            })
            throwError(!post, `Post with id ${id} not found!`)
            return post;
        },
    },
    Mutation: {
        //@ts-ignore
        createPost : compose(... authResolvers)(async (parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser} , info: GraphQLResolveInfo) => {
            input.author = authUser.id
            return db.sequelize.transaction(async (t: Transaction) => {
                return await db.Post.create(input, {transaction: t})
            })
            
        }),
        //@ts-ignore
        updatePost: compose(... authResolvers)(async (parent, {id, input}, {db, authUser, requestedFields}: {db: DbConnection, authUser: AuthUser, requestedFields: RequestedFields} , info: GraphQLResolveInfo) => {
            const attributes = requestedFields.getFields(info, {
                keep: ['id'],
                exclude: ['comments']
            })
            id = parseInt(id)
            const response = await db.sequelize.transaction(async (t: Transaction)=> {
                const post = await db.Post.findByPk(id)
                throwError(!post, `Post with id ${id} not found!`)
                throwError(post.get('author') != authUser.id, `Unauthorized! You can only edit posts by yourself`)
                input.author = authUser.id
                await db.Post.update(input, {where: {id}})
                return await db.Post.findByPk(id, {transaction: t , attributes}) 
            })
            return response
    
        }),
        //@ts-ignore
        deletePost: compose(... authResolvers)(async (parent, {id}, {db,authUser}: {db: DbConnection, authUser: AuthUser} , info: GraphQLResolveInfo) => {
            id = parseInt(id)
            return db.sequelize.transaction(async(t: Transaction) => {
                const post = await db.Post.findByPk(id)
                throwError(!post, `Post with id ${id} not found!`)
                throwError(post.get('author') != authUser.id, `Unauthorized! You can only delete posts by yourself`)
                const postDeleted = await db.Post.destroy({where: {id}, transaction: t})
                return !!postDeleted
            })
        }),
    }
}

