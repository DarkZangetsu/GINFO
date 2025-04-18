import graphene


class UtilisateurInput(graphene.InputObjectType):
    utilisateur_id = graphene.Int(required=True)
    nom = graphene.String()
    prenom = graphene.String()
    email = graphene.String()
    role = graphene.String()
    discriminator = graphene.String(required=True)
    username = graphene.String()  # Pour créer le User associé
    password = graphene.String()  # Pour créer le User associé

class InformationInput(graphene.InputObjectType):
    information_id = graphene.Int(required=True)
    utilisateur_id = graphene.ID(required=True)
    numero_employe = graphene.String()
    adresse = graphene.String()
    numero_assurance = graphene.String()
    ciin = graphene.String()
    statut = graphene.Boolean(required=True)

class HistoriqueInput(graphene.InputObjectType):
    historique_id = graphene.Int(required=True)
    type_action = graphene.String()
    description = graphene.String()

class NotificationInput(graphene.InputObjectType):
    notification_id = graphene.Int(required=True)
    historique_id = graphene.ID(required=True)
    information_id = graphene.ID(required=True)
    objet = graphene.String()
    contenu = graphene.String()
    expediteur = graphene.String()
    destinataire = graphene.String()
    date_envoi = graphene.DateTime()
    statut = graphene.Boolean(required=True)

class CompagnieAssuranceInput(graphene.InputObjectType):
    compagnie_id = graphene.Int(required=True)
    nom_compagnie = graphene.String()
    adresse_compagnie = graphene.String()
    email_compagnie = graphene.String()
    notification_ids = graphene.List(graphene.ID)