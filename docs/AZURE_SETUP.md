# Despliegue en Azure (pendiente de Julio)

El workflow `.github/workflows/deploy.yml` despliega en el **mismo Azure que
appointments-service** (mismo ACR y mismo entorno de Container Apps). Hasta que
esté todo esto configurado, el workflow se salta con un aviso y no falla.

## 1. Crear la Container App (una vez, en Cloud Shell)

Usa los mismos valores que appointments-service (`<rg>`, `<acr>`, entorno `cae-appointments`):

```bash
az containerapp create \
  --name img2text-api \
  --resource-group <rg> \
  --environment cae-appointments \
  --image mcr.microsoft.com/k8se/quickstart:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server <acr>.azurecr.io \
  --registry-identity system \
  --min-replicas 0 --max-replicas 1
```

(La primera imagen es de prueba; el primer deploy la sustituye por la del repo.)

## 2. Permitir que este repo haga login por OIDC

En la App Registration que ya usa appointments-service, añade una
**credencial federada** para este repo:

- Organización/usuario: `julioayalalopez89`
- Repositorio: `img2text-microservice`
- Entidad: rama `main`

## 3. Secrets y variables del repo

En *Settings → Secrets and variables → Actions*:

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `AZURE_CLIENT_ID` | igual que en appointments-service |
| Secret | `AZURE_TENANT_ID` | igual que en appointments-service |
| Secret | `AZURE_SUBSCRIPTION_ID` | igual que en appointments-service |
| Variable | `ACR_NAME` | nombre del ACR (sin `.azurecr.io`) |
| Variable | `AZURE_RESOURCE_GROUP` | grupo de recursos de la Container App |

Después: *Actions → Build and deploy img2text → Run workflow* (o un push a `main`).
El resumen del workflow muestra la URL pública y el resultado de `/healthz`.
