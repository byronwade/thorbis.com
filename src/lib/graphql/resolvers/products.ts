/**
 * GraphQL Resolvers for Retail Products
 */

export const productsResolvers = {
  Query: {
    retailProduct: async (_: unknown, { id }: { id: string }, { businessId }: { businessId: string }) => {
      return null
    },
    retailProducts: async (_: unknown, args: unknown, { businessId }: { businessId: string }) => {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        },
        totalCount: 0
      }
    }
  },
  Mutation: {
    createRetailProduct: async (_: unknown, { input }: any, { businessId }: { businessId: string }) => {
      throw new Error('Not implemented')
    },
    updateRetailProduct: async (_: unknown, { id, input }: any, { businessId }: { businessId: string }) => {
      throw new Error('Not implemented')
    },
    deleteRetailProduct: async (_: unknown, { id }: { id: string }, { businessId }: { businessId: string }) => {
      throw new Error('Not implemented')
    }
  }
}