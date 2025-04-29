import { gql } from "@apollo/client";

export const GET_INFORMATIONS = gql`
  query Informations {
    informations {
      informationId
      numeroEmploye
      adresse
      numeroAssurance
      cin
      statut
      emailNotification
      utilisateur {
        utilisateurId
        nom
        prenom
        email
        role
      }
      compagnieAssurance {
        compagnieId
        nomCompagnie
      }
    }
  }
`;

export const GET_INFORMATION_BY_ID = gql`
  query InformationById($id: ID!) {
    informationById(id: $id) {
      informationId
      numeroEmploye
      adresse
      numeroAssurance
      cin
      statut
      emailNotification
      utilisateur {
        utilisateurId
        nom
        prenom
        email
        role
      }
      compagnieAssurance {
        compagnieId
        nomCompagnie
      }
    }
  }
`;


export const CREATE_INFORMATION = gql`
  mutation CreateInformation($informationData: InformationInput!) {
    createInformation(informationData: $informationData) {
      information {
        informationId
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
        emailNotification
        utilisateur {
          utilisateurId
          nom
          prenom
        }
        compagnieAssurance {
          compagnieId
          nomCompagnie
        }
      }
    }
  }
`;

export const UPDATE_INFORMATION = gql`
  mutation UpdateInformation($id: ID!, $informationData: InformationInput!) {
    updateInformation(id: $id, informationData: $informationData) {
      information {
        informationId
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
        emailNotification
        utilisateur {
          utilisateurId
          nom
          prenom
        }
        compagnieAssurance {
          compagnieId
          nomCompagnie
        }
      }
    }
  }
`;

export const DELETE_INFORMATION = gql`
  mutation DeleteInformation($id: ID!) {
    deleteInformation(id: $id) {
      success
    }
  }
`;