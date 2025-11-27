### Dev
shell1 > `cd frontend` & `npm run dev`
shell2 > `cd backend` & `docker compose down --volumes`, `docker compose up -d`
shell3 > `cd backend` & `npm run dev`
optional > `docker exec -it bjj-mongo mongosh` take a look around mongo

### Todos
- 🚧 Flesh out basic functionality (renew/upgrade subscription plan, sign up for classes, change profile pic, etc)
- Tests
- Firebase
- Figure out payments (at least mocked version)