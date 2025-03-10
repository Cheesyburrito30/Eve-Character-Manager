import { Sequelize } from 'sequelize';
import { DataTypes, Model } from 'sequelize';
import { Character } from './Character';

export class User extends Model {}

export const initializeUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      name: { type: DataTypes.STRING, unique: true },
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: DataTypes.BOOLEAN,
      characters: DataTypes.ARRAY(DataTypes.NUMBER),
    },
    { sequelize, modelName: 'user' }
  );
};
