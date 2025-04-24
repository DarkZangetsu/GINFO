const { gql } = require("@apollo/client");

export const GET_UTILISATEURS = gql`
  query Utilisateurs {
    utilisateurs {
      utilisateurId
      nom
      prenom
      email
      role
      informations {
        informationId
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
      }
    }
  }
`;

export const GET_UTILISATEUR = gql`
  query UtilisateurById ($id: ID!) {
    utilisateurById(id: $id) {
      utilisateurId
      nom
      prenom
      email
      role
      informations {
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
      }
    }
  }
`;

export const CREATE_UTILISATEUR = gql`
  mutation CreateUtilisateur($utilisateurData: UtilisateurInput!) {
    createUtilisateur(utilisateurData: $utilisateurData) {
      success
      message
      token
      refreshToken
      utilisateur {
        utilisateurId
        nom
        prenom
        email
        role
      }
    }
  }
`;

export const UPDATE_UTILISATEUR = gql`
  mutation UpdateUtilisateur($id: ID!, $utilisateurData: UtilisateurInput!) {
    updateUtilisateur(id: $id, utilisateurData: $utilisateurData) {
      utilisateur {
        utilisateurId
        nom
        prenom
        email
        role
      }
    }
  }
`;

export const DELETE_UTILISATEUR = gql`
  mutation DeleteUtilisateur($id: ID!) {
    deleteUtilisateur(id: $id) {
      success
    }
  }
`;