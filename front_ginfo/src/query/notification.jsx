const { gql } = require("@apollo/client");

export const GET_NOTIFICATIONS = gql`
  query Notifications {
    notifications {
      notificationId
      objet
      contenu
      expediteur
      destinataire
      dateEnvoi
      statut
      information {
        numeroEmploye
        adresse
        numeroAssurance
        cin
      }
    }
  }
`;