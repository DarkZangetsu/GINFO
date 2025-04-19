import graphene
from graphql import GraphQLError
from django.contrib.auth.models import User

from back_ginfo.ginfo.data_info.mutation import CreateCompagnieAssurance, CreateHistorique, CreateInformation, CreateNotification, CreateUtilisateur, DeleteCompagnieAssurance, DeleteInformation, DeleteUtilisateur, UpdateCompagnieAssurance, UpdateInformation, UpdateUtilisateur

from .djangoObjectType import CompagnieAssuranceType, HistoriqueType, InformationType, NotificationType, UtilisateurType
from .models import Utilisateur, Information, Historique, Notification, Compagnie_Assurance



# Queries
class Query(graphene.ObjectType):
    # Utilisateur queries
    utilisateurs = graphene.List(UtilisateurType)
    utilisateur_by_id = graphene.Field(UtilisateurType, id=graphene.ID(required=True))
    utilisateur_by_email = graphene.Field(UtilisateurType, email=graphene.String(required=True))
    
    # Information queries
    informations = graphene.List(InformationType)
    information_by_id = graphene.Field(InformationType, id=graphene.ID(required=True))
    informations_by_utilisateur = graphene.List(InformationType, utilisateur_id=graphene.ID(required=True))
    
    # Historique queries
    historiques = graphene.List(HistoriqueType)
    historique_by_id = graphene.Field(HistoriqueType, id=graphene.ID(required=True))
    
    # Notification queries
    notifications = graphene.List(NotificationType)
    notification_by_id = graphene.Field(NotificationType, id=graphene.ID(required=True))
    # notifications_by_expediteur = graphene.List(NotificationType, expediteur=graphene.String(required=True))
    # notifications_by_destinataire = graphene.List(NotificationType, destinataire=graphene.String(required=True))
    
    # CompagnieAssurance queries
    compagnies = graphene.List(CompagnieAssuranceType)
    compagnie_by_id = graphene.Field(CompagnieAssuranceType, id=graphene.ID(required=True))
    compagnie_by_nom = graphene.Field(CompagnieAssuranceType, nom=graphene.String(required=True))

    # Resolvers pour Utilisateur
    def resolve_utilisateurs(root, info):
        return Utilisateur.objects.all()
        
    def resolve_utilisateur_by_id(root, info, id):
        try:
            return Utilisateur.objects.get(pk=id)
        except Utilisateur.DoesNotExist:
            raise GraphQLError(f"Utilisateur avec ID {id} n'existe pas")
            
    def resolve_utilisateur_by_email(root, info, email):
        try:
            return Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            raise GraphQLError(f"Utilisateur avec email {email} n'existe pas")
    
    # Resolvers pour Information
    def resolve_informations(root, info):
        return Information.objects.all()
        
    def resolve_information_by_id(root, info, id):
        try:
            return Information.objects.get(pk=id)
        except Information.DoesNotExist:
            raise GraphQLError(f"Information avec ID {id} n'existe pas")
            
    def resolve_informations_by_utilisateur(root, info, utilisateur_id):
        return Information.objects.filter(utilisateur_id=utilisateur_id)
    
    # Resolvers pour Historique
    def resolve_historiques(root, info):
        return Historique.objects.all()
        
    def resolve_historique_by_id(root, info, id):
        try:
            return Historique.objects.get(pk=id)
        except Historique.DoesNotExist:
            raise GraphQLError(f"Historique avec ID {id} n'existe pas")
    
    # Resolvers pour Notification
    def resolve_notifications(root, info):
        return Notification.objects.all()
        
    def resolve_notification_by_id(root, info, id):
        try:
            return Notification.objects.get(pk=id)
        except Notification.DoesNotExist:
            raise GraphQLError(f"Notification avec ID {id} n'existe pas")
            
    # def resolve_notifications_by_expediteur(root, info, expediteur):
    #     return Notification.objects.filter(expediteur=expediteur)
        
    # def resolve_notifications_by_destinataire(root, info, destinataire):
    #     return Notification.objects.filter(destinataire=destinataire)
    
    # Resolvers pour CompagnieAssurance
    def resolve_compagnies(root, info):
        return Compagnie_Assurance.objects.all()
        
    def resolve_compagnie_by_id(root, info, id):
        try:
            return Compagnie_Assurance.objects.get(pk=id)
        except Compagnie_Assurance.DoesNotExist:
            raise GraphQLError(f"Compagnie d'assurance avec ID {id} n'existe pas")
            
    def resolve_compagnie_by_nom(root, info, nom):
        try:
            return Compagnie_Assurance.objects.get(nom_compagnie=nom)
        except Compagnie_Assurance.DoesNotExist:
            raise GraphQLError(f"Compagnie d'assurance avec nom {nom} n'existe pas")


class Mutation(graphene.ObjectType):
    # Create mutations
    create_utilisateur = CreateUtilisateur.Field()
    create_information = CreateInformation.Field()
    create_historique = CreateHistorique.Field()
    create_notification = CreateNotification.Field()
    create_compagnie_assurance = CreateCompagnieAssurance.Field()
    
    # Update mutations
    update_utilisateur = UpdateUtilisateur.Field()
    update_information = UpdateInformation.Field()
    update_compagnie_assurance = UpdateCompagnieAssurance.Field()
    
    # Delete mutations
    delete_utilisateur = DeleteUtilisateur.Field()
    delete_information = DeleteInformation.Field()
    delete_compagnie_assurance = DeleteCompagnieAssurance.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)