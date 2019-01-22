import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo, formatError } from "graphql";
import { Transaction } from "sequelize";

export const userResolvers = {
    User: {
        //@ts-ignore
        posts: async (user, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return await db.Post
                .findAll({
                    where: {author: user.get('id')},
                    limit: first,
                    offset
                })
        },
    },
    Query: {
        //@ts-ignore
        users: async (parent, {first = 10, offset = 0}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            try {
                return await db.User
                .findAll({
                    limit: first,
                    offset
                })
            } catch (error) {
                return formatError(error)
            }
            
        },
        //@ts-ignore
        //@ts-nocheck
        user: async (parent, {id}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            id = parseInt(id)
            try {
                return await db.User
                .findById(id)
            } catch (error) {
                return formatError(error)
            }   
        }
    },
    Mutation: {
        //@ts-ignore
        createUser: async (parent, {input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            try {
                const response = await db.sequelize.transaction(async (t: Transaction) => {
                    const user = await db.User.create(input, {transaction: t})
                    return user;
                })
                return response
            } catch (error) {
                console.log(error)
                return formatError(error)
            }
        },
        //@ts-ignore
        updateUser: async (parent, {id, input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const user = await db.User.findById(id)
                    if(!user) {
                        throw new Error (`User with id ${id} not found!`)
                    }// retorna o usuário atualizado
                    await db.User.update(input, {where: {id}})
                    return await db.User.findById(id, {transaction: t }) 
                })
                return response
            } catch (error) {
                return formatError(error)
            }
            
            //id = parseInt(id)
            //return await db.sequelize.transaction(async (t: Transaction) => {
                //const user = await db.User.findById(id)
                //if(!user) throw new Error (`User with id ${id} not found!`) 
                //return await db.User.update(input,{where: {id}, transaction: t})
            //})
        },
        //@ts-ignore
        updateUserPassword: async (parent, {id, input}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const user = await db.User.findById(id)
                    if(!user) throw new Error (`User with id ${id} not found!`) 
                    return await db.User.update(input, {where: {id}, individualHooks: true, transaction: t})
                })
                 //retorna true / false

                return !!response
            } catch (error) {
                console.error(error)
                return formatError(error)
            }
            
            //id = parseInt(id)
            //return await db.sequelize.transaction(async (t: Transaction) => {
                //const user = await db.User.findById(id)
               // if(!user) throw new Error (`User with id ${id} not found!`) 
                //const userUpdate = await db.User.update(input,{where: {id}, transaction: t})
                //return !!userUpdate
           // })
        },
        //@ts-ignore
        deleteUser: async (parent, {id}, {db}: {db: DbConnection} , info: GraphQLResolveInfo) => {
            try {
                id = parseInt(id)
                const response = await db.sequelize.transaction(async (t: Transaction)=> {
                    const user = await db.User.findById(id)
                    if(!user) throw new Error (`User with id ${id} not found!`) 
                    return await db.User.destroy({where: {id}, transaction: t})
                     
                })
                // retorna true / false
                return !!response
            } catch (error) {
                console.error(error)
                return formatError(error)
            }
            //id = parseInt(id)
            //return db.sequelize.transaction(async(t: Transaction) => {
                //const user = await db.User.findById(id)
                //if(!user) throw new Error(`User with id ${id} not found!`);
                //const userDeleted = await db.User.destroy({where: {id}, transaction: t})
                //return !!userDeleted
            //})
        },
    }
}
