import express from 'express';
import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import { ApolloServer, PubSub } from 'apollo-server-express';
import { createServer } from 'http';
import environments from './config/environments';
import Database from './config/database';
import expressPlayGround from 'graphql-playground-middleware-express';
if (process.env.NODE_ENV !== 'production') {
  const envs = environments;
  console.log(envs);
}

async function init() {
  const app = express();

  const pubsub = new PubSub();

  app.use('*', cors());

  app.use(compression());

  const database = new Database();
  const db = await database.init();

  const context: any = async () => {
    return { db, pubsub };
  };

  const server = new ApolloServer({
    schema,
    context,
    introspection: true,
  });

  server.applyMiddleware({ app });

  app.use(
    '/',
    expressPlayGround({
      endpoint: '/graphql',
    })
  );

  const PORT = process.env.PORT || 5300;
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen({ port: PORT }, () => {
    console.log(
      '=================================SERVER================================'
    );
    console.log(
      `Votaciones Breaking Bad GraphQL http://localhost:${PORT}${server.graphqlPath}`
    );
    console.log(
      `Subscription Votaciones Breaking Bad GraphQL ws://localhost:${PORT}${server.subscriptionsPath}`
    );
  });
}

init();
