# Type-peptide# Type-Peptide (dockerizado)

Frontend estático (Three.js) para visualizar péptidos en forma de hélice
y calcular propiedades fisicoquímicas. La API es mínima y se deja lista
por si en el futuro se necesitan endpoints.

## Estructura

- `frontend/` → HTML, CSS y JS estático (Type-Peptide).
- `api/` → API Node.js (por ahora solo `/health`).
- `docker-compose.yml` → orquesta Nginx + API.
- `nginx.conf` → configuración de Nginx en el contenedor `frontend`.

## Despliegue

```bash
docker compose up -d --build
