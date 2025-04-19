from django.db import models
from django.contrib.auth.models import User

class Utilisateur(models.Model):
    id = models.AutoField(primary_key=True)
    utilisateur_id = models.IntegerField(null=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    nom = models.CharField(max_length=255, null=True, blank=True)
    prenom = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=255, null=True, blank=True)
    discriminator = models.CharField(max_length=255, null=False)
    
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
    id = models.AutoField(primary_key=True)
    information_id = models.IntegerField(null=False)
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='informations')
    numero_employe = models.CharField(max_length=255, null=True, blank=True)
    adresse = models.CharField(max_length=255, null=True, blank=True)
    numero_assurance = models.CharField(max_length=255, null=True, blank=True)
    ciin = models.CharField(max_length=255, null=True, blank=True)
    statut = models.BooleanField(null=False)
    
    def __str__(self):
        return f"Info de {self.utilisateur}"


class Historique(models.Model):
    id = models.AutoField(primary_key=True)
    historique_id = models.IntegerField(null=False)
    date = models.DateTimeField(auto_now_add=True)
    type_action = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"Historique {self.pk} ({self.date})"


class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    notification_id = models.IntegerField(null=False)
    historique = models.ForeignKey(Historique, on_delete=models.CASCADE, related_name='notifications')
    information = models.ForeignKey(Information, on_delete=models.CASCADE, related_name='notifications')
    objet = models.CharField(max_length=255, null=True, blank=True)
    contenu = models.CharField(max_length=255, null=True, blank=True)
    expediteur = models.CharField(max_length=255, null=True, blank=True)
    destinataire = models.CharField(max_length=255, null=True, blank=True)
    date_envoi = models.DateTimeField(null=True, blank=True)  # Changé pour DateTimeField
    statut = models.BooleanField(null=False)
    
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
    id = models.AutoField(primary_key=True)
    compagnie_id = models.IntegerField(null=False)
    nom_compagnie = models.CharField(max_length=255, null=True, blank=True)
    adresse_compagnie = models.CharField(max_length=255, null=True, blank=True)
    email_compagnie = models.CharField(max_length=255, null=True, blank=True)
    notifications = models.ManyToManyField(Notification, related_name='compagnies_assurance')
    
    def __str__(self):
        return self.nom_compagnie if self.nom_compagnie else f"Compagnie {self.pk}"