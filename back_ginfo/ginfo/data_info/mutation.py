
import graphene
from django.contrib.auth.models import User
from graphql import GraphQLError

from .input import CompagnieAssuranceInput, HistoriqueInput, InformationInput, NotificationInput, UtilisateurInput

from .models import Utilisateur, Information, Historique, Notification, Compagnie_Assurance
from .djangoObjectType import CompagnieAssuranceType, HistoriqueType, InformationType, NotificationType, UtilisateurType

class CreateUtilisateur(graphene.Mutation):
    class Arguments:
        utilisateur_data = UtilisateurInput(required=True)
        
    utilisateur = graphene.Field(UtilisateurType)
    
    @staticmethod
    def mutate(root, info, utilisateur_data):
        # Créer le User d'abord si username et password fournis
        user = None
        if hasattr(utilisateur_data, 'username') and hasattr(utilisateur_data, 'password'):
            user = User.objects.create_user(
                username=utilisateur_data.username,
                email=utilisateur_data.email,
                password=utilisateur_data.password,
                first_name=utilisateur_data.prenom,
                last_name=utilisateur_data.nom
            )
        
        # Créer l'Utilisateur
        utilisateur = Utilisateur(
            utilisateur_id=utilisateur_data.utilisateur_id,
            nom=utilisateur_data.nom,
            prenom=utilisateur_data.prenom,
            email=utilisateur_data.email,
            role=utilisateur_data.role,
            discriminator=utilisateur_data.discriminator
        )
        if user:
            utilisateur.user = user
        utilisateur.save()
        
        return CreateUtilisateur(utilisateur=utilisateur)

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
            ciin=information_data.ciin,
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
            if hasattr(utilisateur_data, 'discriminator'):
                utilisateur.discriminator = utilisateur_data.discriminator
                
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