import * as Sequelize from 'sequelize'
import { ModelsInterface } from '../interfaces/ModelsInterface';

export interface ComentAttributes {
    id?: number
    comment?: string
    post?: number
    user?: number;
    createdAt?: string;
    updatedAt?: string
}

export interface ComentInstance extends Sequelize.Instance<ComentAttributes>, ComentAttributes {

}

export interface ComentModel extends  Sequelize.Model<ComentInstance, ComentAttributes> {
    protype?;
    associate?(models: ModelsInterface): void
}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):ComentModel => {
    const Coment: ComentModel = sequelize.define<ComentInstance,ComentAttributes>('Comment', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
    },{
        tableName: 'comments'
    })

    Coment.associate = (models: ModelsInterface):void => {
        Coment.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'user',
                name: 'user'
            }
        })
        Coment.belongsTo(models.Post, {
            foreignKey: {
                allowNull: false,
                field: 'post',
                name: 'post'
            }
        })
    }

    
    return Coment
}