import { SALT_ROUNDS } from '../constants';
import { Character, User } from '../database';
import { Express } from 'express';
import bcrypt from 'bcrypt';
import { checkAdminToken, checkToken, checkUserToken } from '../utils';

export const initializeUserRoutes = (app: Express) => {
  // CRUD routes for User model
  app.get('/users', checkAdminToken, async (req, res) => {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
    });
    res.json(users);
  });

  app.get('/users/:id', checkUserToken, async (req, res) => {
    const paramId = Number.parseInt(req.params.id, 10);
    if (req.body.userId !== paramId) {
      res.sendStatus(403);
      return;
    }

    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      include: ['Characters'],
    });
    res.json(user);
  });

  app.post('/users', async (req, res) => {
    try {
      const { password, ...body } = req.body ?? {};
      const hashedPassword = await hashPass(password);
      const user = await User.create({
        ...body,
        password: hashedPassword,
      });
      const { password: _userPass, ...userMinusPassword } = user.dataValues;

      res.json({
        status: 200,
        message: 'user created successfully',
        user: userMinusPassword,
      });
    } catch (err) {
      if ((err as any).name === 'SequelizeUniqueConstraintError') {
        res.json({ message: 'That username already exists' });
        return;
      }
      console.error(err);
      res.sendStatus(500);
    }
  });

  app.put('/users/:id', checkUserToken, async (req, res) => {
    const paramId = Number.parseInt(req.params.id, 10);
    if (req.body.userId !== paramId) {
      res.sendStatus(403);
      return;
    }

    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  app.delete('/users/:id', checkAdminToken, async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });

  app.get('/users/:id/characters', checkUserToken, async (req, res) => {
    const paramId = Number.parseInt(req.params.id, 10);
    if (req.body.userId !== paramId) {
      res.sendStatus(403);
      return;
    }

    try {
      const characters = await Character.findAll({
        where: {
          UserId: req.params.id,
        },
      });

      res.json(characters);
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
};

const hashPass = async (password: string) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPass = await bcrypt.hash(password, salt);

  return hashedPass;
  // return password;
};
