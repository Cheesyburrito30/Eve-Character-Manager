import { DataTypes, Model, Sequelize } from 'sequelize';
import { User } from './User';

export class Character extends Model {}

export const initializeCharacterModel = (sequelize: Sequelize) => {
  Character.init(
    {
      isMain: DataTypes.BOOLEAN,
      name: DataTypes.STRING,
      characterId: { type: DataTypes.NUMBER, unique: true },
      accessToken: DataTypes.STRING,
      refreshToken: DataTypes.STRING,
    },
    { sequelize, modelName: 'character' }
  );
};
