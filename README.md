**English** | [Русский](README.ru.md)

# Series Randomizer

🎲 Random episode picker for a selected TV series. Watched episodes are tracked, and each new episode is picked from the remaining unwatched ones. Series currently available:
- *How I Met Your Mother* (2005)

![Screenshot](docs/screenshot.png)

## 🚀 Standalone

```bash
docker compose up -d --build
```

→ <http://localhost:8080>

## ⚙️ Configuration

Optional: without `.env` the defaults are used. To change them, copy `.env.example` to `.env`.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `series` | database name |
| `POSTGRES_USER` | `series` | database user |
| `POSTGRES_PASSWORD` | `series` | database password, applied only when the database is created for the first time |
| `APP_PORT` | `8080` | app port on `127.0.0.1` |
| `PROXY_NETWORK` | `series-proxy` | Docker network for the reverse proxy |
| `PROXY_EXTERNAL` | `false` | `true` if `PROXY_NETWORK` already exists and is not managed by this project |

## 🔀 Reverse proxy

Set the proxy's existing Docker network in `.env`. Inside it, the app is available at `http://series-randomizer:8080`.

```bash
cp .env.example .env
```

```env
PROXY_NETWORK=traefik
PROXY_EXTERNAL=true
```

```bash
docker compose up -d --build
```

## 📺 Data

Episode data: [TVmaze](https://www.tvmaze.com/), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
