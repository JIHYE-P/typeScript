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




