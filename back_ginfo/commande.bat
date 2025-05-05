@echo off
echo Construction de l'image Docker...
docker build -t ginfo:latest .

echo Vérification de Kubernetes...
kubectl get nodes

echo Déploiement de l'application sur Kubernetes...
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

echo Vérification des ressources...
kubectl get deployments
kubectl get pods
kubectl get services

echo.
echo Votre application sera disponible dans quelques instants à:
echo http://localhost (si vous utilisez Docker Desktop avec LoadBalancer)
echo.

pause