import graphene 
from data_info.schema import Query as DataInfoQuery, Mutation as DataInfoMutation

class Query (DataInfoQuery, graphene.ObjectType):
    pass

class Mutation(DataInfoMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query = Query, mutation = Mutation)