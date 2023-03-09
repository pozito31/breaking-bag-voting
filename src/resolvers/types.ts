import { IResolvers } from 'graphql-tools';
import { PHOTO_URL } from '../config/constants';
import { getCharacterVotes } from '../lib/database-operations';

const types: IResolvers = {
  Character: {
    votes: async (parent: any, __: any, { db }) => {
      return await getCharacterVotes(db, parent.id);
    },
    photo: (parent) => PHOTO_URL.concat(parent.photo),
  },
};

export default types;
