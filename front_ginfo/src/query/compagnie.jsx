const { gql } = require("@apollo/client");

export const GET_COMPAGNIES = gql`
  query Compagnies {
    compagnies {
      compagnieId
      nomCompagnie
      adresseCompagnie
      emailCompagnie
    }
  }
`;

export const GET_COMPAGNIE_BY_ID = gql`
  query CompagnieById($id: ID!) {
    compagnieById(id: $id) {
      compagnieId
      nomCompagnie
      adresseCompagnie
      emailCompagnie
    }
  }
`;

export const CREATE_COMPAGNIE = gql`
  mutation CreateCompagnieAssurance($compagnieData: CompagnieAssuranceInput!) {
    createCompagnieAssurance(compagnieData: $compagnieData) {
      compagnie {
        compagnieId
        nomCompagnie
        adresseCompagnie
        emailCompagnie
      }
    }
  }
`;

export const UPDATE_COMPAGNIE = gql`
  mutation UpdateCompagnieAssurance($id: ID!, $compagnieData: CompagnieAssuranceInput!) {
    updateCompagnieAssurance(id: $id, compagnieData: $compagnieData) {
      compagnie {
        compagnieId
        nomCompagnie
        adresseCompagnie
        emailCompagnie
      }
    }
  }
`;

export const DELETE_COMPAGNIE = gql`
  mutation DeleteCompagnieAssurance($id: ID!) {
    deleteCompagnieAssurance(id: $id) {
      success
    }
  }
`;