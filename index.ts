import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initializeCharacterRoutes, initializeUserRoutes } from './routes';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Model } from 'sequelize';
import { initializeDBModels, User } from './database';

export class Character extends Model {}

dotenv.config();

const app = express();
// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = process.env.PORT || 3001;
const secretKey = process.env.JWT_SECRET_KEY || '';
const saltRounds = 10;

// Enable CORS for all origins (including localhost)
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

initializeDBModels();

initializeUserRoutes(app);
initializeCharacterRoutes(app);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

app.post('/login', async (req, res) => {
	const { name, password } = req.body;

	const user = await User.findOne({
		where: { name },
	});
	// check if passwords match
	bcrypt.compare(password, user?.dataValues.password, (err, result) => {
		if (result) {
			// make sure we're not passing the password to the JWT
			const { password: _userPass, ...userMinusPassword } = user?.dataValues;
			jwt.sign(
				{ user: { ...userMinusPassword } },
				secretKey,
				{ expiresIn: '1h' },
				(err, token) => {
					res.send(token);
				}
			);
			return;
		}
		res.sendStatus(500);
	});
});

app.get('/redirect', async (req, res) => {
	const { code } = req.query ?? {};
	// console.log(req);
	const encodedAuth = btoa(
		`${process.env.ESI_CLIENT_ID}:${process.env.ESI_CLIENT_SECRET}`
	);
	const response = await fetch(
		`https://login.eveonline.com/v2/oauth/token`, //404
		{
			method: 'post',
			body: `grant_type=authorization_code&code=${code}`,
			headers: {
				Authorization: `Basic ${encodedAuth}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		}
	);

	const { access_token, refresh_token } = await response.json();

	const decodedJWT = jwt.decode(access_token);
	// if no JWT or if JWT isn't the right shape, abort
	if (!decodedJWT || typeof decodedJWT === 'string') {
		res.sendStatus(500);
		return;
	}

	const { sub, name } = decodedJWT;
	const characterId = sub?.split(':')[2]; // 'CHARACTER:EVE:<ID>'
	const character = {
		characterId,
		name,
		accessToken: access_token,
		refreshToken: refresh_token,
	};

	// console.log(access_token, refresh_token);
	res.send(response);
});

const queryString =
	'?response_type=code&client_id=f9a543657688496c82aaae245ade5671&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fredirect&scope=publicData esi-calendar.respond_calendar_events.v1&state=my-state';

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
