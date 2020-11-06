import "reflect-metadata";
import {createConnection} from "typeorm";
import {Request, Response} from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { AppRoutes } from "./routes";
import { Category } from "./entity/Category";
import { Post } from "./entity/Post";

// Connect typeORM mysql
createConnection().then(async connection => {
  const newCategory = new Category;
  newCategory.name = 'typescript';
  await connection.manager.save(newCategory);

  const categoryRepository = connection.getRepository(Category);
  const react = await categoryRepository.findOne(2);

  const post = new Post;
  const postRepository = connection.getRepository(Post);

  post.title = '[20201111] post upload';
  post.text = '11월11일 빼빼로 데이~';
  post.categories = [newCategory, react];
  await postRepository.save(post);
  
  // create express server'
  const app = express();
  app.set('port', process.env.PORT || 3000);
  app.use(bodyParser.json());

  AppRoutes.forEach(route => {
    app[route.method](route.path, (request: Request, response: Response, next: Function) => {
      route.action(request, response).then(() => next).catch(err => next(err));
    })
  });

  app.listen(app.get('port'), () => {
    console.log(`Express application is up and running on port ${app.get('port')} / http://localhost:3000`);
  });
}).catch(err => console.log('TypeORM connection error: ', err));
