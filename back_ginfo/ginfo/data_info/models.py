from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags


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
 
    email_notification = models.EmailField(max_length=255, null=True, blank=True, help_text="Email où envoyer la notification pour cette information")
    
    def __str__(self):
        return f"Info de {self.utilisateur}"
    
    def save(self, *args, **kwargs):
        creation = not self.pk
        
        if not creation:
            ancien_etat = Information.objects.get(pk=self.pk)
            ancien_statut = ancien_etat.statut
        else:
            ancien_statut = False
            
        super().save(*args, **kwargs)
        
        if (creation and self.statut) or (not creation and not ancien_statut and self.statut):
            self.creer_notification()
    
    def creer_notification(self):
        """Crée une notification lorsqu'une information est ajoutée avec statut True ou passe de False à True"""
        historique = Historique.objects.create(
            type_action="envoye",
            description=f"Information {self.information_id} confirmée pour l'utilisateur {self.utilisateur}"
        )
        
        destinataire = self.email_notification if self.email_notification else "Administration"
        
        notification = Notification.objects.create(
            historique=historique,
            information=self,
            objet="Confirmation d'information",
            contenu=f"L'information {self.information_id} pour {self.utilisateur} a été confirmée et est maintenant à jour",
            expediteur="Système",
            destinataire=destinataire,
            date_envoi=timezone.now(),
            statut=True
        )
        
        if self.email_notification:
            self.envoyer_email_notification(notification)
        
        return notification
    
    def envoyer_email_notification(self, notification):
        """Envoie un email de notification à l'adresse email spécifiée"""
        if not self.email_notification:
            notification.enregistrer_dans_historique(
                type_action="email_non_envoyé", 
                description="Aucune adresse email de notification définie"
            )
            return
        
        sujet = notification.objet
        message_html = f"""
        <html>
        <head></head>
        <body>
            <h2>Confirmation de mise à jour d'information</h2>
            <p>Bonjour,</p>
            <p>{notification.contenu}</p>
            <p>Détails de l'information mise à jour pour {self.utilisateur.prenom} {self.utilisateur.nom}:</p>
            <ul>
                <li>Numéro d'employé: {self.numero_employe or 'Non spécifié'}</li>
                <li>Adresse: {self.adresse or 'Non spécifiée'}</li>
                <li>Numéro d'assurance: {self.numero_assurance or 'Non spécifié'}</li>
                <li>CIN: {self.cin or 'Non spécifiée'}</li>
            </ul>
            <p>Cordialement,<br>L'équipe RH</p>
        </body>
        </html>
        """
        message_texte = strip_tags(message_html)
        
        try:
            print(f"Tentative d'envoi d'email à {self.email_notification}")
            
            send_mail(
                subject=sujet,
                message=message_texte,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[self.email_notification],
                html_message=message_html,
                fail_silently=False,  
            )
            
            print(f"Email envoyé avec succès à {self.email_notification}")
            
            notification.enregistrer_dans_historique(
                type_action="email_envoye", 
                description=f"Email de notification envoyé à {self.email_notification}"
            )
            
        except Exception as e:
            print(f"ERREUR d'envoi d'email: {str(e)}")
            notification.enregistrer_dans_historique(
                type_action="email_echec", 
                description=f"Échec de l'envoi d'email: {str(e)}"
            )


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