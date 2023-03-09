import { IResolvers } from 'graphql-tools';
import {
  asignVoteId,
  getCharacter,
  getCharacters,
  getVote,
} from '../lib/database-operations';
import { Datetime } from '../lib/datetime';
import { CHANGE_VOTES, COLLECTIONS } from '../config/constants';
async function response(status: boolean, message: string, db: any) {
  return {
    status,
    message,
    character: await getCharacters(db),
  };
}
async function sendNotification(pubsub: any, db: any) {
  pubsub.publish(CHANGE_VOTES, { changeVotes: await getCharacters(db) });
}
// Los resolvers de las operaciones de modificación de información
const mutation: IResolvers = {
  Mutation: {
    async addVote(_: void, { character }, { pubsub, db }) {
      //Comprobar que el presonaje existe
      const selectCharacter = await getCharacter(db, character);
      if (selectCharacter == null || selectCharacter === undefined) {
        return response(
          false,
          'El personaje no existe y no se puede votar',
          db
        );
      }
      // Obtenemos el ide del voto
      const vote = {
        id: await asignVoteId(db),
        character,
        createdAt: new Datetime().getCurrentDateTime(),
      };
      return await db
        .collection(COLLECTIONS.VOTES)
        .insertOne(vote)
        .then(async () => {
          sendNotification(pubsub, db);
          return response(
            true,
            'El personaje existe y se ha emitido correctamente el voto',
            db
          );
        })
        .catch(async () => {
          return response(
            false,
            'El voto no se ha emitido. Prueba de nuevo por favor',
            db
          );
        });
    },
    async updateVote(_: void, { id, character }, { pubsub, db }) {
      //Comprobar que el personaje existe
      const selectCharacter = await getCharacter(db, character);
      if (selectCharacter == null || selectCharacter === undefined) {
        return response(
          false,
          'El personaje introducido no existe y no puedes actualizar el voto',
          db
        );
      }
      //Comprobar que el voto existe
      const selectVote = await getVote(db, id);
      if (selectVote == null || selectVote === undefined) {
        return response(
          false,
          'El voto introducido no existe y no puedes actualizar',
          db
        );
      }
      //Actualizar el voto despues de comprobar
      return await db
        .collection(COLLECTIONS.VOTES)
        .updateOne(
          { id },
          {
            $set: { character },
          }
        )
        .then(async () => {
          sendNotification(pubsub, db);
          return response(true, 'Voto actualizado correctamente', db);
        })
        .catch(async () => {
          return response(
            false,
            'Voto no actualizado correctamente. Prueba de nuevo por favor',
            db
          );
        });
    },
    async deleteVote(_: void, { id }, { pubsub, db }) {
      //Comprobar que el voto existe
      const selectVote = await getVote(db, id);
      if (selectVote == null || selectVote === undefined) {
        return response(
          false,
          'El voto introducido no existe y no puedes borrarlo',
          db
        );
      }
      //Si existe, borrarlo
      return await db
        .collection(COLLECTIONS.VOTES)
        .deleteOne({ id })
        .then(async () => {
          sendNotification(pubsub, db);
          return response(true, 'Voto borrado correctamente', db);
        })
        .catch(async () => {
          return response(
            false,
            'Voto no borrado. Por favor intentalo de nuevo',
            db
          );
        });
    },
  },
};

export default mutation;
