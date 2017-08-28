# migro

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![Build Status](https://travis-ci.org/YBogomolov/migro.svg?branch=master)](https://travis-ci.org/YBogomolov/migro)
[![npm](https://img.shields.io/npm/v/migro.svg)](https://www.npmjs.com/package/migro)

Migro is a lightweight database migration framework.

## Getting started

Install migro using the following command:

```
$ npm install --save migro
```

## Configuration

Migro can use special file called `.migrorc` in the root directory of the project. It is a JSON document which stores the following settings:

- `database`:
  - `<name>`:
    - `host` — database host.
    - `port` — database port.
    - `user` — database user (if any).
    - `password` — database user's password.
    - `database` — actual database name (overrides `<name>` above).
- `workingDir`: absolute path to the working directory, by default it is equal to the root path of the project.

## Commands

```
$ migro create-version <db> <version>
```
— creates a new version unders the `migrations/db` directory.

```
$ migro create <db> <name>
```
— creates a new migration under the `migrations/<db>/<last possible version>/` directory. Last possible version is determined by using alphabetical sort of the `migrations`'s subdirectories. Convention of calling versions (`v1.0.0`, `1.0.0`, `version-1.0.0`, etc.) is entirely up to you — as long as plain alphabetical sort provides you with an expected result.

```
$ migro up <db>
```
— migrates the `db` up from the last applied migration to the last possible version.

### Example of usage for PostgreSQL

1. Create a new `.migrorc` with the connection options for you database:

```
{
  "database": {
    "main": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "S3cur3P@55w0rd"
    }
  }
}
```
If you database has a long name, you can add separate `database` field in the connection section, and use top-level name as alias. For example, our `main` alias from the example above can actually point to `MyProjectDatabase` database.

2. Create a new version. [Semantic versioning](http://semver.org) is highly recommended — check it out if you don't know what it is.

```
$ migro create-version main 0.0.1
Path /my-project/migrations/main/0.0.1 successfully created.
```
Please note that `migrations` directory is created automatically if it is not present. You overrid its placement by adding a `workingDir` parameter to `.migrorc` or by passing it with `-w` argument to `migro` command.

3. Create a new migration. It is recommended to give it a meaningful name, so you'll understand what it does just by looking at the file name.

```
$ migro create main alter-table-Users-add-column-name
Created migration /my-project/migrations/main/0.0.1/20170825225258-alter-table-Users-add-column-name.js
```

4. Write code for the migration. The template for migration file mandatory includes two exported methods — `up` and `down`, both of which receive single parameter — `db`, which is database client for your database of choice. Currently `migro` supports [postgres](https://www.postgresql.org) only. The `up` and `down` methods are required to be async functions — i.e. they should either be marked as `async` or return a `Promise`.

5. Migrate your database to the latest possible version:

```
$ migro up main
Running migration 0.0.1 : 20170825225258-alter-table-Users-add-column-name.js
Done
```

That's all, folks!
