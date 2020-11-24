# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## Package 설치 및 기본 설정
> npm init -y

> npm install typescript typeorm reflect-metadata @types/express express mysql nodemon

* @type/express: typescript에서 node express를 사용할 때
* reflect-metadata: typeorm에서 `@`(decorator) 문법 사용할 때
* ts-node: tsc로 빌드를 안해도 실행할 수 있는데, `nodemon`과 같이 쓰는것이 편하다.

## typeorm init을 이용해 기본적인 틀을 만들기

* 글로벌로 설치했을 때
> typeorm init

* 로컬로 설치했을 때
> node_modules/.bin/typeorm init     

## command line 
> "start": "nodemon src/index.ts"

## 환경변수 설정
`typeorm init` 커맨드를 이용했을 때 `ormconfig.json` 파일이 생성되는데, `.env` 파일이 있으면 우선순위가 밀려난다. `.env` 설정으로 실행

* .env
```
TYPEORM_CONNECTION=mariadb
TYPEORM_HOST=localhost
TYPEORM_USERNAME=root
TYPEORM_PASSWORD=비밀번호
TYPEORM_DATABASE=database명
TYPEORM_PORT=3306
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=false
TYPEORM_ENTITIES=src/entity/*.ts
```

* tsconfig.js
```json
{
  "compilerOptions": {
    "lib": [ "ESNext", "DOM" ],
    "target": "ESNext",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "sourceMap": false,
    "plugins": [{
      "transform": "@zerollup/ts-transform-paths"
    }],
    "baseUrl": ".",
    "paths": {
      "~/*": ["*"],
      "@/*": ["./src/*"]
    },
    "typeRoots": ["node_modules/@types", "node_modules/@hashsnap"]
  },
  "include": ["./src/**/*"],
  "exclude": ["node_modules"]
}
```

# typeORM
> [typeorm 공식문서](https://typeorm.io/#/)

## ManyToMany
> [typeorm doc 참고](https://typeorm.io/#/many-to-many-relations)

다 대 다 관계는 A와 B의 여러 인스턴스를 포함하고, B가 A의 여러 인스턴스를 포함하는 객체이다. 예를 들어 `post`와`category` 엔티티를 살펴보면, 포스트에는 여러 카테고리가 있을 수 있고, 카테고리에는 여러 포스트들이 있을 수 있다. `@JoinTable() @ManyToMany()` 관계가 필요하고, `@JoinTable()`은 한 쪽에 소유해야한다.

* `Category.ts`
```ts
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;  
}
```

* `Post.ts`
```ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable} from "typeorm";
import {Category} from './Category';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  //각 PRIMARY KEY로 column 생성
  @ManyToMany(type => Category, {
    cascade: true
  })
  @JoinTable()
  categories: Category[];
}
```
위 엔티티는 다음과 같이 테이블이 생성된다.

| category | | |
|:----------|:----------|:----------|
| id | init(11) | PRIMARY KEY AUTO_INCREMENT
| name | varchar(255) |  


| post | | |
|:----------|:----------|:----------|
| id | init(11) | PRIMARY KEY AUTO_INCREMENT
| title | varchar(255) |  


| post_categories_post | | |
|:----------|:----------|:----------|
| postId | init(11) | PRIMARY KEY AUTO_INCREMENT
| categoryId | init(11) | PRIMARY KEY AUTO_INCREMENT

### ManyToMany 데이터 저장하기
```ts
createConnection().then(async connection => {
  const newCategory = new Category;
  newCategory.name = 'typescript';
  await connection.manager.save(newCategory);

  const categoryRepository = connection.getRepository(Category);
  const react = await categoryRepository.findOne(2);

  const post = new Post;
  const postRepository = connection.getRepository(Post);

  post.title = 'new post';
  post.text = 'new post upload';
  post.categories = [newCategory, react];
  await postRepository.save(post);
}).catch(err => console.log('TypeORM connection error: ', err));
```
### ManyToOne / OneToMany

User, Photo 테이블이 있다고 가정했을 때, user는 여러 장의 사진을 가질 수 있지만, 각 사진은 한명의 사용자만 소유합니다.

```ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => User, user => user.photos)
  user: User;
}
```
```ts
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Photo } from "./Photo";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Photo,photo => photo.user)
    photos: Photo[];
}
```

```ts
const user = new User();
user.name = "Leo";
await connection.manager.save(user);

const photo1 = new Photo();
photo1.url = "me.jpg";
photo1.user = user;
await connection.manager.save(photo1);

const photo2 = new Photo();
photo2.url = "me2.jpg";
photo2.user = user;
await connection.manager.save(photo2);
```

### QueryBuilder
> [select-query-builder 공식문서](https://typeorm.io/#/select-query-builder)
```ts
import {getRepository} from 'typeorm';

const user = await getRepository(User)
  .createQueryBuilder('user')
  .where('user.age = :age', {age: 20})
  .getMany() 
  console.log(user)
```
Repository를 이용해 queryBuilder를 작성하는 방식이다.      
여기서 `createQueryBuilder("user")`에서 user는 SQL alias이다. mysql을 예로 들자면 `SELECT users AS user` 이런 느낌이라고 할 수 있겠다. 이것은 어디서든 사용할 수 있다. 여기서 사용하는 `user`는 테이블 명을 의미하고, '.' 아래로 써 내려가는 `sql query`에서 사용할 수 있다.     
하나의 query builder는 한 개의 alias만 가질 수 있는게 아니라 여러 개의 alias를 가질 수 있다. 여러 테이블마다 alias를 가지게 할 수 있고, 여러 테이블을 join할 수 도 있다.

DB에서 단일의 결과를 가져오려면 `.getOne()`, 여러 개의 결과를 가져오려면 `getMany()`를 사용하면 된다.     
특정 데이터를 가져와야할 때 entity가 아니라 **raw data**이다. 이런 결과값을 가져올 때는 `.getRawOne()`, `.getRawMany()`를 사용하여 가져오면 된다.

### Query Join

```ts
const photos = await getRepository(Photo)
  .createQueryBuilder('photo')
  .leftJoinAndSelect('photo.user', 'user')
  .where('photo.userId = :userId', {userId: 7})
  .getMany();
  console.log(photos)
```
`Photo`테이블에서 1:N으로 관계되어져 있는 `user` 정보를 Left Join해서 원하는 데이터를 가져오는

### 