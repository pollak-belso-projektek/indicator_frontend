# Environment Configuration

This project uses environment variables to configure the backend API URL and other settings.

## Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to match your setup:

   ```bash
   # For local development
   VITE_API_BASE_URL=http://localhost:5300/api/v1/

   # For local network access
   VITE_API_BASE_URL=http://192.168.1.100:5300/api/v1/

   # For production
   VITE_API_BASE_URL=https://your-production-domain.com/api/v1/
   ```

## Available Environment Variables

| Variable            | Description          | Default                         |
| ------------------- | -------------------- | ------------------------------- |
| `VITE_API_BASE_URL` | Backend API base URL | `http://10.0.0.83:5300/api/v1/` |

## Important Notes

- **Vite Prefix**: Environment variables must be prefixed with `VITE_` to be accessible in the client code
- **Security**: Never commit `.env` files to version control - they're in `.gitignore`
- **Public Variables**: All `VITE_` prefixed variables are public and included in the build
- **Restart Required**: You need to restart the dev server after changing environment variables

## Different Environments

### Development

```bash
VITE_API_BASE_URL=http://localhost:5300/api/v1/
```

### Local Network Testing

```bash
VITE_API_BASE_URL=http://192.168.1.100:5300/api/v1/
```

### Production

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1/
```

## Debugging

The app will log the current configuration in development mode. Check the browser console for:

```
🔧 App Configuration: { apiBaseUrl: "...", mode: "development", ... }
```
