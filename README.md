# migro

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![Build Status](https://travis-ci.org/YBogomolov/migro.svg?branch=develop)](https://travis-ci.org/YBogomolov/migro)

Migro is a lightweight database migration framework.

## Getting started

Install migro using the following command:

```
$ npm install --save migro
```

This sould install a symlink to a `migro` command.

## Configuration

Migro can use special file called `.migrorc` in the root directory of the project. It is a JSON document which stores the following settings:

- `database`:
  - `<name>`:
    - `host` — database host.
    - `port` — database port.
    - `user` — database user (if any).
    - `password` — database user's password.
    - `connectionString` — substitutes and precedes the other settings.
- `workingDir`: path to the working directory, by default it is equal to the root path of the project.

## Commands

```
$ migro create-version <version>
```
— creates a new version unders the `migrations` directory.

```
$ migro create <name>
```
— creates a new migration under the `migrations/<last possible version>/` directory. Last possible version is determined by using alphabetical sort of the `migrations`'s subdirectories. Convention of calling versions (`v1.0.0`, `1.0.0`, `version-1.0.0`, etc.) is entirely up to you — as long as plain alphabetical sort provides you with an expected result.

#### [TODO]:

1. ~~Create .migrorc — JSON file with connections to DB, working dir, etc.~~
1. Write some tests