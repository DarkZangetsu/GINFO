'use client'
import { ApolloProvider } from '@apollo/client';
import client from '../lib/appolloClient'; 

export function ApolloWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}