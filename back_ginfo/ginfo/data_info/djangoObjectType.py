from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from .models import Compagnie_Assurance, Historique, Information, Notification, Utilisateur


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class UtilisateurType(DjangoObjectType):
    class Meta:
        model = Utilisateur
        fields = "__all__"

class InformationType(DjangoObjectType):
    class Meta:
        model = Information
        fields = "__all__"

class HistoriqueType(DjangoObjectType):
    class Meta:
        model = Historique
        fields = "__all__"

class NotificationType(DjangoObjectType):
    class Meta:
        model = Notification
        fields = "__all__"

class CompagnieAssuranceType(DjangoObjectType):
    class Meta:
        model = Compagnie_Assurance
        fields = "__all__"
