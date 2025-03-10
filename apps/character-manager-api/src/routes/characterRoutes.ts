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
      //@ts-expect-error sequelize isn't in TS :sob:
      character.setUser(user);
      //@ts-expect-error sequelize isn't in TS :sob:
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

  app.get('/character/:id', checkUserToken, async (req, res) => {
    const character = await Character.findByPk(req.params.id);
    if (!character) {
      res.status(400);
      res.send({
        message: 'Character does not exist',
      });
    }
    if (req.body.userId !== character?.dataValues.userId) {
      res.sendStatus(403);
      return;
    }
    res.status(200);
    res.json(character);
  });

  app.put('/character/:id', checkUserToken, async (req, res) => {
    const character = await Character.findByPk(req.params.id);
    if (!character) {
      res.status(400);
      res.send({
        message: 'Character does not exist',
      });
    }
    if (req.body.userId !== character?.dataValues.userId) {
      res.sendStatus(403);
      return;
    }

    try {
      await character?.update(req.body);
      res.sendStatus(200);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.delete('/character/:id', checkUserToken, async (req, res) => {
    const character = await Character.findByPk(req.params.id);
    if (!character) {
      res.status(400);
      res.send({
        message: 'Character does not exist',
      });
    }
    if (req.body.userId !== character?.dataValues.userId) {
      res.sendStatus(403);
      return;
    }
    try {
      await character?.destroy();

      res.json({
        status: 200,
        message: 'Character deleted successfully',
      });
    } catch (err) {
      res.sendStatus(500);
    }
  });
};
