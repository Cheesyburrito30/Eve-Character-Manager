import express, { Express, Request, RequestHandler, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sequelize, User } from './database';
import { initializeUserRoutes } from './routes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const secretKey = process.env.JWT_SECRET_KEY || '';
const saltRounds = 10;

// Enable CORS for all origins (including localhost)
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

// sync db
sequelize.sync();

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

initializeUserRoutes(app);

app.post('/login', async (req, res) => {
	const { name, password } = req.body;

	const user = await User.findOne({ where: { name } });
	bcrypt.compare(password, user?.dataValues.password, (err, result) => {
		if (result) {
			console.log('wee');
			jwt.sign({ user }, secretKey, { expiresIn: '1h' }, (err, token) => {
				res.send(token);
			});
			return;
		}
		res.sendStatus(500);
	});
});

const checkToken: RequestHandler = (req, res, next) => {
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

app.get('/protected', checkToken, async (req, res) => {
	res.json({
		message: 'fuck ye bro it worked',
	});
});

// import { querystring } from "@evespace/esi-client";
// const loginParams = querystring({
//     'response_type': 'code',
//     "client_id": process.env.NEXT_PUBLIC_ESI_CLIENT_ID ?? '',
//     "redirect_uri": 'http://localhost:3000/redirect',
//     "scope": scopes.join(' '),
//     "state": 'my-state',
//   })
//   const params = useSearchParams();

//   const basicAuth = btoa(`${process.env.NEXT_PUBLIC_ESI_CLIENT_ID}:${process.env.NEXT_PUBLIC_ESI_CLIENT_SECRET}`)

//   const esiCode = params.get('code') ?? '';
//   useEffect(() => {
//       const request = async () => {
//           // ping eve auth to get JWT to continue making requests to the API
//           const response = await fetch(
//               `https://login.eveonline.com/v2/oauth/token`, //404
//               {
//                   method: 'post',
//                   body: `grant_type=authorization_code&code=${esiCode}`,
//                   headers: {
//                       "Authorization": `Basic ${basicAuth}`,
//                       "Content-Type": "application/x-www-form-urlencoded",
//                   }
//               }
//           )

//           const accessToken = (await response.json()).access_token
//           setToken(accessToken);
//           return
//       }
//       request()
//   }, [esiCode, basicAuth])
