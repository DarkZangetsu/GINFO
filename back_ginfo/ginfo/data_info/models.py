from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Utilisateur(models.Model):
    utilisateur_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    nom = models.CharField(max_length=255, null=True, blank=True)
    prenom = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    mot_de_passe = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
    def save(self, *args, **kwargs):
        # Synchroniser les informations avec le User associé
        if self.user and (self.email or self.nom or self.prenom):
            if self.email:
                self.user.email = self.email
            if self.nom:
                self.user.last_name = self.nom
            if self.prenom:
                self.user.first_name = self.prenom
            self.user.save()
        super().save(*args, **kwargs) 


class Information(models.Model):
    information_id = models.AutoField(primary_key=True)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='informations')
    numero_employe = models.CharField(max_length=255, null=True, blank=True)
    adresse = models.CharField(max_length=255, null=True, blank=True)
    numero_assurance = models.CharField(max_length=255, null=True, blank=True)
    cin = models.CharField(max_length=255, null=True, blank=True)
    statut = models.BooleanField(null=False)
    
    def __str__(self):
        return f"Info de {self.utilisateur}"
    
    def save(self, *args, **kwargs):
        creation = not self.pk
        
        # Si c'est une mise à jour, récupére l'état précédent
        if not creation:
            ancien_etat = Information.objects.get(pk=self.pk)
            ancien_statut = ancien_etat.statut
        else:
            ancien_statut = False
            
        # Enregistrer l'objet
        super().save(*args, **kwargs)
        
        # Si c'est une création avec statut True ou une mise à jour de False à True
        if (creation and self.statut) or (not creation and not ancien_statut and self.statut):
            self.creer_notification()
    
    def creer_notification(self):
        """Crée une notification lorsqu'une information est ajoutée avec statut True ou passe de False à True"""
        historique = Historique.objects.create(
            type_action="envoye",
            description=f"Information {self.information_id} confirmé pour l'utilisateur {self.utilisateur}"
        )
        
        # Créer la notification associée
        notification = Notification.objects.create(
            historique=historique,
            information=self,
            objet="Confirmation d'information",
            contenu=f"L'information {self.information_id} pour {self.utilisateur} a été confirmé bien à jour",
            expediteur="Système",
            destinataire=self.utilisateur.email if self.utilisateur.email else "Administration",
            date_envoi=timezone.now(),
            statut=True
        )
        
        return notification


class Historique(models.Model):
    historique_id = models.AutoField(primary_key=True)
    date = models.DateTimeField(auto_now_add=True)
    type_action = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
     
    def __str__(self):
        return f"Historique {self.pk} ({self.date})"


class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    historique = models.ForeignKey(Historique, on_delete=models.CASCADE, related_name='notifications')
    information = models.ForeignKey(Information, on_delete=models.CASCADE, related_name='notifications')
    objet = models.CharField(max_length=255, null=True, blank=True)
    contenu = models.CharField(max_length=255, null=True, blank=True)
    expediteur = models.CharField(max_length=255, null=True, blank=True)
    destinataire = models.CharField(max_length=255, null=True, blank=True)
    date_envoi = models.DateTimeField(null=True, blank=True) 
    statut = models.BooleanField(null=True)
    
    def __str__(self):
        return f"{self.objet} ({self.date_envoi})"
    
    def enregistrer_dans_historique(self, type_action="envoi", description=None):
        """Méthode pour enregistrer une action dans l'historique"""
        if not description:
            description = f"Notification '{self.objet}' {type_action} à {self.destinataire}"
        
        # Création d'un nouvel historique ou mise à jour de l'existant
        if not hasattr(self, 'historique') or not self.historique:
            historique = Historique.objects.create(
                historique_id=self.notification_id,
                type_action=type_action,
                description=description
            )
            self.historique = historique
            self.save()
        else:
            self.historique.type_action = type_action
            self.historique.description = description
            self.historique.save()


class Compagnie_Assurance(models.Model):
    compagnie_id = models.AutoField(primary_key=True)
    nom_compagnie = models.CharField(max_length=255, null=True, blank=True)
    adresse_compagnie = models.CharField(max_length=255, null=True, blank=True)
    email_compagnie = models.CharField(max_length=255, null=True, blank=True)
    notifications = models.ManyToManyField(Notification, related_name='compagnies_assurance')
    
    def __str__(self):
        return self.nom_compagnie if self.nom_compagnie else f"Compagnie {self.pk}"