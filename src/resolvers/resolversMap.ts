import { IResolvers } from 'graphql-tools';
import mutation from './mutation';
import query from './query';
import subscription from './subscriptions';
import types from './types';

export const LIST: string[] = [];
const resolvers: IResolvers = {
  ...query,
  ...mutation,
  ...subscription,
  ...types,
};

export default resolvers;
