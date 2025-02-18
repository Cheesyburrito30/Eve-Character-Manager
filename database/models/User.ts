import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export class User extends Model {}
User.init(
	{
		name: { type: DataTypes.STRING, unique: true },
		email: DataTypes.STRING,
		password: DataTypes.STRING,
	},
	{ sequelize, modelName: 'user' }
);
