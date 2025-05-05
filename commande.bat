@echo off
echo ---- Création des images Docker ----
echo.
echo Construction de l'image Django...
docker build -t django-app:latest -f back_ginfo/Dockerfile ./back_ginfo

echo.
echo Construction de l'image Next.js...
docker build -t nextjs-app:latest -f front_ginfo/Dockerfile ./front_ginfo

echo.
echo ---- Déploiement sur Kubernetes ----
echo.
echo Vérification de Kubernetes...

kubectl get nodes

echo.
echo Déploiement des applications...
kubectl apply -f back_ginfo/deployment.yaml
kubectl apply -f back_ginfo/service.yaml
kubectl apply -f front_ginfo/deployment.yaml
kubectl apply -f front_ginfo/service.yaml

echo.
echo ---- Vérification des ressources ----
echo.
echo Déploiements:
kubectl get deployments

echo.
echo Pods:
kubectl get pods

echo.
echo Services:
kubectl get services

pause