
import graphene
from django.contrib.auth.models import User
from graphql import GraphQLError

from django.contrib.auth import authenticate
from graphql import GraphQLError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from .input import CompagnieAssuranceInput, HistoriqueInput, InformationInput, NotificationInput, UtilisateurInput

from .models import Utilisateur, Information, Historique, Notification, Compagnie_Assurance
from .djangoObjectType import CompagnieAssuranceType, HistoriqueType, InformationType, NotificationType, UtilisateurType


class LoginMutation(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String() 
    refresh_token = graphene.String()
    utilisateur = graphene.Field(UtilisateurType)
    
    @staticmethod
    def mutate(root, info, username, password):
        # Authentifier l'utilisateur
        user = authenticate(username=username, password=password)
        
        if user is None:
            return LoginMutation(
                success=False,
                message="Identifiants invalides",
                token=None,
                refresh_token=None,
                utilisateur=None
            )
        
        if not user.is_active:
            return LoginMutation(
                success=False,
                message="Ce compte a été désactivé",
                token=None,
                refresh_token=None,
                utilisateur=None
            )
        
        # Récupérer le profil Utilisateur associé
        try:
            profile = Utilisateur.objects.get(user=user)
        except Utilisateur.DoesNotExist:
            return LoginMutation(
                success=False,
                message="Profil utilisateur non trouvé",
                token=None,
                refresh_token=None,
                utilisateur=None
            )
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return LoginMutation(
            success=True,
            message="Connexion réussie",
            token=str(refresh.access_token),  
            refresh_token=str(refresh), 
            utilisateur=profile
        )

# mutation pour rafraîchir le token
class RefreshTokenMutation(graphene.Mutation):
    class Arguments:
        refresh_token = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    
    @staticmethod
    def mutate(root, info, refresh_token):
        try:        
            # Vérifier et rafraîchir le token
            refresh = RefreshToken(refresh_token)
            
            return RefreshTokenMutation(
                success=True,
                message="Token rafraîchi avec succès",
                token=str(refresh.access_token)
            )
        except Exception as e:
            return RefreshTokenMutation(
                success=False,
                message=f"Erreur lors du rafraîchissement du token: {str(e)}",
                token=None
            )

#mutation pour la déconnexion
class LogoutMutation(graphene.Mutation):
    class Arguments:
        refresh_token = graphene.String(required=True)
    
    success = graphene.Boolean()
    message = graphene.String()
    
    @staticmethod
    def mutate(root, info, refresh_token):
        try:       
            # Blacklister le token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return LogoutMutation(
                success=True,
                message="Déconnexion réussie"
            )
        except Exception as e:
            return LogoutMutation(
                success=False,
                message=f"Erreur lors de la déconnexion: {str(e)}"
            )

class CreateUtilisateur(graphene.Mutation):
    class Arguments:
        utilisateur_data = UtilisateurInput(required=True)
        
    utilisateur = graphene.Field(UtilisateurType)
    success = graphene.Boolean()
    message = graphene.String()
    token = graphene.String()
    refresh_token = graphene.String()
    
    @staticmethod
    def mutate(root, info, utilisateur_data):
        try:
            username = utilisateur_data.get('username')
            password = utilisateur_data.get('password')
            email = utilisateur_data.get('email')
            nom = utilisateur_data.get('nom')
            prenom = utilisateur_data.get('prenom')
            role = utilisateur_data.get('role')
            
            if not username or not password:
                return CreateUtilisateur(
                    utilisateur=None,
                    success=False, 
                    message="Nom d'utilisateur et mot de passe requis"
                )
                
            if User.objects.filter(username=username).exists():
                return CreateUtilisateur(
                    utilisateur=None,
                    success=False, 
                    message="Cet utilisateur existe déjà"
                )
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=prenom if prenom else "",
                last_name=nom if nom else ""
            )
            
            utilisateur = Utilisateur(
                user=user,
                nom=nom,
                prenom=prenom,
                email=email,
                role=role,
                mot_de_passe=password 
            )
            utilisateur.save()
            
            refresh = RefreshToken.for_user(user)
            token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            return CreateUtilisateur(
                utilisateur=utilisateur,
                success=True, 
                message="Utilisateur créé avec succès",
                token=token,
                refresh_token=refresh_token
            )
            
        except Exception as e:
            return CreateUtilisateur(
                utilisateur=None,
                success=False, 
                message=f"Erreur lors de la création de l'utilisateur: {str(e)}"
            )

class CreateInformation(graphene.Mutation):
    class Arguments:
        information_data = InformationInput(required=True)
        
    information = graphene.Field(InformationType)
    
    @staticmethod
    def mutate(root, info, information_data):
        utilisateur = Utilisateur.objects.get(pk=information_data.utilisateur_id)
        information = Information(
            information_id=information_data.information_id,
            utilisateur=utilisateur,
            numero_employe=information_data.numero_employe,
            adresse=information_data.adresse,
            numero_assurance=information_data.numero_assurance,
            cin=information_data.cin,
            statut=information_data.statut
        )
        information.save()
        
        return CreateInformation(information=information)

class CreateHistorique(graphene.Mutation):
    class Arguments:
        historique_data = HistoriqueInput(required=True)
        
    historique = graphene.Field(HistoriqueType)
    
    @staticmethod
    def mutate(root, info, historique_data):
        historique = Historique(
            historique_id=historique_data.historique_id,
            type_action=historique_data.type_action,
            description=historique_data.description
        )
        historique.save()
        
        return CreateHistorique(historique=historique)

class CreateNotification(graphene.Mutation):
    class Arguments:
        notification_data = NotificationInput(required=True)
        
    notification = graphene.Field(NotificationType)
    
    @staticmethod
    def mutate(root, info, notification_data):
        historique = Historique.objects.get(pk=notification_data.historique_id)
        information = Information.objects.get(pk=notification_data.information_id)
        
        notification = Notification(
            notification_id=notification_data.notification_id,
            historique=historique,
            information=information,
            objet=notification_data.objet,
            contenu=notification_data.contenu,
            expediteur=notification_data.expediteur,
            destinataire=notification_data.destinataire,
            date_envoi=notification_data.date_envoi,
            statut=notification_data.statut
        )
        notification.save()
        
        return CreateNotification(notification=notification)

class CreateCompagnieAssurance(graphene.Mutation):
    class Arguments:
        compagnie_data = CompagnieAssuranceInput(required=True)
        
    compagnie = graphene.Field(CompagnieAssuranceType)
    
    @staticmethod
    def mutate(root, info, compagnie_data):
        compagnie = Compagnie_Assurance(
            compagnie_id=compagnie_data.compagnie_id,
            nom_compagnie=compagnie_data.nom_compagnie,
            adresse_compagnie=compagnie_data.adresse_compagnie,
            email_compagnie=compagnie_data.email_compagnie
        )
        compagnie.save()
        
        # Ajouter les notifications si fournies
        if hasattr(compagnie_data, 'notification_ids') and compagnie_data.notification_ids:
            for notification_id in compagnie_data.notification_ids:
                notification = Notification.objects.get(pk=notification_id)
                compagnie.notifications.add(notification)
        
        return CreateCompagnieAssurance(compagnie=compagnie)

# Update mutations
class UpdateUtilisateur(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        utilisateur_data = UtilisateurInput(required=True)
        
    utilisateur = graphene.Field(UtilisateurType)
    
    @staticmethod
    def mutate(root, info, id, utilisateur_data):
        try:
            utilisateur = Utilisateur.objects.get(pk=id)
            
            # Mettre à jour les champs
            if hasattr(utilisateur_data, 'utilisateur_id'):
                utilisateur.utilisateur_id = utilisateur_data.utilisateur_id
            if hasattr(utilisateur_data, 'nom'):
                utilisateur.nom = utilisateur_data.nom
            if hasattr(utilisateur_data, 'prenom'):
                utilisateur.prenom = utilisateur_data.prenom
            if hasattr(utilisateur_data, 'email'):
                utilisateur.email = utilisateur_data.email
            if hasattr(utilisateur_data, 'role'):
                utilisateur.role = utilisateur_data.role
                
            utilisateur.save()
            
            return UpdateUtilisateur(utilisateur=utilisateur)
        except Utilisateur.DoesNotExist:
            raise GraphQLError(f"Utilisateur avec ID {id} n'existe pas")
        
class UpdateInformation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        information_data = InformationInput(required=True)
        
    information = graphene.Field(InformationType)
    
    @staticmethod
    def mutate(root, info, id, information_data):
        try:
            information = Information.objects.get(pk=id)
            
            # Mettre à jour les champs
            if hasattr(information_data, 'information_id'):
                information.information_id = information_data.information_id
            if hasattr(information_data, 'utilisateur_id'):
                utilisateur = Utilisateur.objects.get(pk=information_data.utilisateur_id)
                information.utilisateur = utilisateur
            if hasattr(information_data, 'numero_employe'):
                information.numero_employe = information_data.numero_employe
            if hasattr(information_data, 'adresse'):
                information.adresse = information_data.adresse
            if hasattr(information_data, 'numero_assurance'):
                information.numero_assurance = information_data.numero_assurance
            if hasattr(information_data, 'ciin'):
                information.ciin = information_data.ciin
            if hasattr(information_data, 'statut'):
                information.statut = information_data.statut
                
            information.save()
            
            return UpdateInformation(information=information)
        except Information.DoesNotExist:
            raise GraphQLError(f"Information avec ID {id} n'existe pas")

class UpdateCompagnieAssurance(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        compagnie_data = CompagnieAssuranceInput(required=True)
        
    compagnie = graphene.Field(CompagnieAssuranceType)
    
    @staticmethod
    def mutate(root, info, id, compagnie_data):
        try:
            compagnie = Compagnie_Assurance.objects.get(pk=id)
            
            # Mettre à jour les champs
            if hasattr(compagnie_data, 'compagnie_id'):
                compagnie.compagnie_id = compagnie_data.compagnie_id
            if hasattr(compagnie_data, 'nom_compagnie'):
                compagnie.nom_compagnie = compagnie_data.nom_compagnie
            if hasattr(compagnie_data, 'adresse_compagnie'):
                compagnie.adresse_compagnie = compagnie_data.adresse_compagnie
            if hasattr(compagnie_data, 'email_compagnie'):
                compagnie.email_compagnie = compagnie_data.email_compagnie
                
            # Mettre à jour les notifications si fournies
            if hasattr(compagnie_data, 'notification_ids') and compagnie_data.notification_ids:
                compagnie.notifications.clear()  # Supprimer les anciennes associations
                for notification_id in compagnie_data.notification_ids:
                    notification = Notification.objects.get(pk=notification_id)
                    compagnie.notifications.add(notification)
                
            compagnie.save()
            
            return UpdateCompagnieAssurance(compagnie=compagnie)
        except Compagnie_Assurance.DoesNotExist:
            raise GraphQLError(f"Compagnie d'assurance avec ID {id} n'existe pas")

# Delete mutations
class DeleteUtilisateur(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        
    success = graphene.Boolean()
    
    @staticmethod
    def mutate(root, info, id):
        try:
            utilisateur = Utilisateur.objects.get(pk=id)
            # Supprimer également le User associé si nécessaire
            if utilisateur.user:
                utilisateur.user.delete()
            utilisateur.delete()
            return DeleteUtilisateur(success=True)
        except Utilisateur.DoesNotExist:
            return DeleteUtilisateur(success=False)

class DeleteInformation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        
    success = graphene.Boolean()
    
    @staticmethod
    def mutate(root, info, id):
        try:
            information = Information.objects.get(pk=id)
            information.delete()
            return DeleteInformation(success=True)
        except Information.DoesNotExist:
            return DeleteInformation(success=False)

class DeleteCompagnieAssurance(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        
    success = graphene.Boolean()
    
    @staticmethod
    def mutate(root, info, id):
        try:
            compagnie = Compagnie_Assurance.objects.get(pk=id)
            compagnie.delete()
            return DeleteCompagnieAssurance(success=True)
        except Compagnie_Assurance.DoesNotExist:
            return DeleteCompagnieAssurance(success=False)