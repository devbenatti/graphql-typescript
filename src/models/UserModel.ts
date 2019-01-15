import * as Sequelize from 'sequelize'
import {genSaltSync, hashSync, compareSync} from 'bcryptjs'
import { ModelsInterface } from '../interfaces/ModelsInterface';

export interface UserAttributes {
    id?: number
    name?: string
    email?: string
    password?: string
    photo?: string
}

export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {

    isPassword(encodedPassword: string , password: string): boolean
}

export interface UserModel extends  Sequelize.Model<UserInstance, UserAttributes> {
    protype?;
    associate?(models: ModelsInterface): void
}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):UserModel => {
    const User: UserModel = sequelize.define<UserInstance,UserAttributes>('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }, 
        password: {
            type: DataTypes.STRING,
            allowNull: false, 
            validate: {
                notEmpty: true
            }
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: true
        }
    },
    {
        tableName: 'Users',
        hooks: {
            //@ts-ignore
            beforeCreate: (user: UserInstance, options: Sequelize.CreateOptions): void => {
                const salt = genSaltSync();
                user.password = hashSync(user.password,salt)
                
            }
        },
    })
    //@ts-ignore
    User.associate = (models: ModelsInterface) => {

    }
    User.protype.isPassword = (encodedPassword: string , password: string): boolean => {
        return compareSync(password, encodedPassword)
    }
    return User
}