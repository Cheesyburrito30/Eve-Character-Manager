A simple user and character management system for EVE Online built by a front end dev.

`/users` routes

- GET `/users` requires admin user privileges and returns a full list of users
- GET `/users/:id` gets the id, name, email, createdAt, updatedAt, and character list associated with the user
- POST `/users` creates a new user
  - requires name, email, and password
  - returns `200` when successful along with the created character object
- PUT `/users/:id` updates the existing user matching the ID
- DELETE `/users/:id` deletes the existing user matching the ID

`/character` routes

- POST `/character` creates a new character
  - expects `{
  name: string,
  characterId: string,
  accessToken: string,
  refreshToken: string,
  isMain: boolean //defaults false
}`
  - returns `200` and character object when successful
  - returns `400` if the character already exists
- GET `/character/:id` retrieves the character with the matching ID
- PUT `/character/:id` updates the character with the matching ID
- DELETE `/character/:id` deletes the character with the matching ID

Eventually I'd like to add some more tools to make this a useable application but for now just users and their characters.
