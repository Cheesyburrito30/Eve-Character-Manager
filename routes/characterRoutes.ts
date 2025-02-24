import { Express } from 'express';
import { Character, User } from '../database';
import { checkUserToken } from '../utils';

export const initializeCharacterRoutes = (app: Express) => {
	app.post('/character', checkUserToken, async (req, res) => {
		const newCharacter = {
			name: req.body.name,
			characterId: req.body.characterId,
			accessToken: req.body.accessToken,
			refreshToken: req.body.refreshToken,
			isMain: req.body.isMain ?? false,
		};

		const user = await User.findByPk(req.body.userId);

		try {
			const character = await Character.create(newCharacter);
			//@ts-ignore sequelize isn't in TS :sob:
			character.setUser(user);
			//@ts-ignore sequelize isn't in TS :sob:
			user?.addCharacter(character);

			res.json({
				status: 200,
				message: 'Character created successfully',
				character,
			});
		} catch (err) {
			if ((err as any).name === 'SequelizeUniqueConstraintError') {
				res.status(400);
				res.send({ message: 'Character already exists' });
			}
			res.sendStatus(500);
		}
	});
};
