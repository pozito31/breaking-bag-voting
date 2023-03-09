import { COLLECTIONS } from '../config/constants';
//Lista de personaje

export async function getCharacters(db: any) {
  return await db
    .collection(COLLECTIONS.CHARACTERS)
    .find()
    .sort({ id: 1 })
    .toArray();
}

//Personaje seleccionado
export async function getCharacter(db: any, id: string) {
  return await db.collection(COLLECTIONS.CHARACTERS).findOne({ id });
}

//Voto seleccionado
export async function getVote(db: any, id: string) {
  return await db.collection(COLLECTIONS.VOTES).findOne({ id });
}

//Votos de un personajes
export async function getCharacterVotes(db: any, id: string) {
  return await db.collection(COLLECTIONS.VOTES).find({ character: id }).count();
}

//Obtener el id del nuevo voto
export async function asignVoteId(db: any) {
  const lastVotes = await db
    .collection(COLLECTIONS.VOTES)
    .find()
    .sort({ _id: -1 })
    .limit(1)
    .toArray();
  if (lastVotes.length === 0) {
    return '1';
  }
  return String(+lastVotes[0].id + 1);
}
