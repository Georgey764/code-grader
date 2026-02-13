# Accounts API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Summary](#endpoints-summary)
  - [Create Student User Account](#create-user-account---student)
  - [Create Faculty User Account](#create-user-account---faculty)
  - [Get User Account](#get-user-account)
  - [Update Student User Account](#update-user-account---student)
  - [Update Faculty User Account](#update-user-account---faculty)
- [Status Codes](#status-codes)

## Overview

The Accounts API provides endpoints for managing user accounts within the system. It supports operations for creating, retrieving, and updating accounts for students and faculty. The API is designed to handle authentication, role assignment, and user profile information securely and efficiently.

Key features:

- Create new user accounts (students and faculty)
- Retrieve account details by CWID
- Update account information
- Role-based access and authentication

## Base URL

Development:

```
http://localhost:8000/api
```

## Authentication

```
Authorization: Bearer <access_token>
```

## Common Headers

```
Content-Type: application/json
```

## Endpoints

### Endpoints Summary

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | /accounts/                | Create a new user account        |
| GET    | /accounts/student/_cwid_/ | Retrieve student account details |
| GET    | /accounts/faculty/_cwid_/ | Retrieve faculty account details |
| PUT    | /accounts/student/_cwid_/ | Update student account details   |
| PUT    | /accounts/faculty/_cwid_/ | Update faculty account details   |

### Create User Account - Student

**POST** /account/

Creates a student user account.

**Request Body**

```JSON
{
    "email": "jane.doe@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "role": "ST",
    "first_name": "Jane",
    "last_name": "Doe",
    "cwid": "11111111",
    "major": "CSCI",
    "classification": "freshman"
}
```

**Response - 201 Created**

```JSON
{
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "ST",
    "cwid": "11111111",
    "classification": null
}
```

### Create User Account - Faculty

**POST** /account/

Creates a faculty user account.

**Request Body**

```JSON
{
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "role": "FA",
    "first_name": "John",
    "last_name": "Doe",
    "cwid": "99999999",
    "title": "Professor",
    "phone": "(318) 342-0000"
}
```

**Response - 201 Created**

```JSON
{
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "FA",
    "cwid": "99999999",
    "classification": null
}
```

**Response - 400 Bad Request**

```JSON
{
    "email": [
        "User with this email already exists."
    ],
    "cwid": [
        "User with this cwid already exists."
    ]
}
```

### Get User Account

**POST** /accounts/student/_cwid_/

**POST** /accounts/faculty/_cwid_/

Retrieves account details of the student/faculty user by _CWID_.

**Response - 200 OK**

```JSON
{
    "id": "d68dfc7a-7f1e-4670-a868-a666c886cdcc",
    "user": {
        "id": "a6f428ae-8b3b-443a-96ad-4d295fae0b24",
        "email": "jane.doe@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "cwid": "11111111",
        "role": "ST"
    },
    "major": "CSCI",
    "classification": "freshman"
}
```

**Response - 401 Unauthorized**

```JSON
 {
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is expired"
        }
    ]
}
```

### Update User Account - Student

**PUT** /accounts/student/_cwid_/

Updates student account details by _CWID_.

**Request Body**

```JSON
{
  "user": {
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "cwid": "11111111",
    "role": "ST"
  },
  "major": "Computer Science",
  "classification": "Sophomore"
}
```

## Update User Account - Faculty

**PUT** /accounts/faculty/_cwid_/

Updates faculty account details by CWID.

**Request Body**

```JSON
{
  "user": {
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "cwid": "99999999",
    "role": "FA"
  },
  "title": "Teacher's Assistant",
  "phone": "(318) 342-0000"
}
```

## Status Codes

| Code                          | Description                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **200** OK                    | Everything worked as expected.                                                                                                          |
| **201** Created               | The request succeeded, and a new resource was created as a result.                                                                      |
| **400** Bad Request           | The server cannot process the request due to something the server considered to be a client error. Most likely invalid request message. |
| **401** Unauthorized          | The request is unauthenticated.                                                                                                         |
| **404** Not Found             | The server cannot find the requested resource.                                                                                          |
| **500** Internal Server Error | The server encountered an unexpected condition that prevented it from fulfilling the request.                                           |
