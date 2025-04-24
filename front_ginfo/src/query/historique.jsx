import { gql } from "@apollo/client";

export const GET_HISTORIQUES = gql`
  query Historiques {
    historiques {
      historiqueId
      date
      typeAction
      description
      notifications {
        notificationId
        objet
        contenu
        expediteur
        destinataire
        dateEnvoi
        statut
      }
    }
  }
`;