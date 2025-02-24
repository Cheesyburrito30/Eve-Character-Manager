import { Sequelize } from 'sequelize';
import { initializeCharacterModel, initializeUserModel, User } from './models';
import { Character } from './models';

export const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './database.sqlite',
});

export const initializeDBModels = () => {
	initializeUserModel(sequelize);
	initializeCharacterModel(sequelize);
	User.hasMany(Character, {
		as: 'Characters',
		onDelete: 'CASCADE',
	});
	Character.belongsTo(User);
	sequelize.sync();
};
