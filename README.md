# AMNet Rest API

## Introduction

This branch implements a fully workable REST API to provide informations to AMNet Interface.

## Features

- Internet access management using frontend and Radius Backend
- Hardware request management
- Various settings
- Mail sending

## Technical stack

This branch is based on the Nest.JS framework and MySQL connector to interact with database
Passwords are encrypted using bcrypt algorithm
Authentication uses both JWT and plain password authentication

It runs on port 3333 for now.
