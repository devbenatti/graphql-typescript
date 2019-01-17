import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";

export const userResolvers = {

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
                return error
            }
            
        },
        //@ts-ignore
        //@ts-nocheck
        user: async (parent, {id}, {db}: {db: DbConnection} , info: GraphQLResolveInf) => {
            //const user = await db.User
               // .findById(id)
            //if(!user) {
              //  throw new Error(`User with id ${id} not found!`)
            //}
            return await db.User
                .findById(id)
        }
    }
}


