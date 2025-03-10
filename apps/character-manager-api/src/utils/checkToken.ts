import { RequestHandler, Express } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || '';

export const checkToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader !== 'undefined') {
    // header exists, we know that a token was probably passed
    const splitHeader = authHeader?.split(' ') ?? []; // ['bearer ', '<token>']
    const token = splitHeader[1]; // '<token>'

    if (token) {
      jwt.verify(token, secretKey, (err, data) => {
        if (err) {
          res.sendStatus(403);
          return;
        }

        next();
      });
    }
  }
};

export const checkAdminToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader !== 'undefined') {
    // header exists, we know that a token was probably passed
    const splitHeader = authHeader?.split(' ') ?? []; // ['bearer ', '<token>']
    const token = splitHeader[1]; // '<token>'

    if (token) {
      jwt.verify(token, secretKey, (err, data) => {
        const userIsAdmin = typeof data !== 'string' && data?.user.isAdmin;
        if (err || !userIsAdmin) {
          res.sendStatus(403);
          return;
        }

        next();
      });
    }
  }
};

export const checkUserToken: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (authHeader !== 'undefined') {
    // header exists, we know that a token was probably passed
    const splitHeader = authHeader?.split(' ') ?? []; // ['bearer ', '<token>']
    const token = splitHeader[1]; // '<token>'

    if (token) {
      jwt.verify(token, secretKey, (err, data) => {
        if (err) {
          res.sendStatus(403);
          return;
        }

        if (!data || typeof data === 'string') {
          res.sendStatus(403);
          return;
        }

        if (data?.user?.id) {
          req.body.userId = data.user.id;
          next();
          return;
        }

        // fallback, restrict access
        res.sendStatus(403);
        return;
      });
    }
  }
};
