# Backend

## Run

1. Copy `.env.example` to `.env` and adjust DB values if needed.
2. Make sure MySQL is running.
3. Initialize the database if you have not created it yet:

```bash
mysql -u root -p < mysql/init.sql
```

4. Install dependencies and start the server:

```bash
npm install
npm start
```

## Notes

- Default server port is `5001`.
- If MySQL is running in Docker, the user grant should allow remote hosts such as `%` rather than only `localhost`.
