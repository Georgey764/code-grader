# Accounts API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints Summary](#endpoints-summary)
  - [Create User Account](#create-user)
  - [Get User Account Details](#get-user-account-details)
  - [Update User Account Details](#update-user-account-details)
- [Status Codes](#status-codes)

## Overview

The Accounts API provides endpoints for managing user accounts within the system. It supports operations for creating, retrieving, and updating accounts for students and faculty. The API is designed to handle authentication, role assignment, and user profile information securely and efficiently.

Key features:

- Create new user accounts (students and faculty)
- Retrieve account details by CWID
- Update account information
- Role-based access and authentication

## Authentication

```
Authorization: Bearer <access_token>
```

To know how to retrieve an access token refer to the [Authentication API: Getting An Access Token](Authentication_API.md#getting-an-access-token).

## Base URL

Development:

```
http://localhost:8000/api
```

## Common Headers

```
Content-Type: application/json
```

## Endpoints

### Endpoints Summary

| Method | Endpoint                  | Authentication Required | Description                      |
| ------ | ------------------------- | :---------------------: | -------------------------------- |
| POST   | /accounts/                |           No            | Create a new user account        |
| GET    | /accounts/student/_cwid_/ |           Yes           | Retrieve student account details |
| GET    | /accounts/faculty/_cwid_/ |           Yes           | Retrieve faculty account details |
| PUT    | /accounts/student/_cwid_/ |           Yes           | Update student account details   |
| PUT    | /accounts/faculty/_cwid_/ |           Yes           | Update faculty account details   |

### Create User

- **Method**: POST
- **Path**: /account/
- **Auth Required**: No (registration)
- **Description**: Creates a student user account.

#### Request Body

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

##### Request Body Fields

| Field            |  Type  | Required |       Role        | Description                                        |
| ---------------- | :----: | :------: | :---------------: | -------------------------------------------------- |
| email            | string |   Yes    | Student + Faculty | User's email address                               |
| password         | string |   Yes    | Student + Faculty | Password                                           |
| password_confirm | string |   Yes    | Student + Faculty | Password confirmation (must match password)        |
| role             | string |   Yes    | Student + Faculty | User role: FACULTY/FA or STUDENT/ST                |
| first_name       | string |   Yes    | Student + Faculty | User's first name                                  |
| last_name        | string |   Yes    | Student + Faculty | User's last name                                   |
| cwid             | string |   Yes    | Student + Faculty | Campus-wide ID                                     |
| major            | string |  Yes\*   |      Student      | Student major (required if role is STUDENT)        |
| classification   | string |  Yes\*   |      Student      | Student classification (required if STUDENT)       |
| title            | string |  Yes\*   |      Faculty      | Faculty title (required if role is FACULTY)        |
| phone            | string |  Yes\*   |      Factuly      | Faculty phone number (required if role is FACULTY) |

#### Responses

**201 Created**

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

**400 Bad Request** (Validation Error)

```JSON
{
    "email": [
        "This field is required."
    ],
    "first_name": [
        "This field is required."
    ],
    ...
}
```

### Get User Account Details

- **Method**: GET
- **Paths**:
  - /accounts/faculty/_cwid_/
  - /accounts/student/_cwid_/
- **Auth Required**: Yes (Access Token)
- **Description**: Retrieves account details of the student/faculty user by _CWID_.

#### Responses

**200 OK**

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

**401 Unauthorized** (Authentication Error)

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (Authorization Error)

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

### Update User Account Details

- **Method**: PUT
- **Paths**:
  - /accounts/faculty/_cwid_/
  - /accounts/student/_cwid_/
- **Auth Required**: Yes (Access Token)
- **Description**: Updates student/faculty account details by _CWID_.

#### Request Body

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

##### Request Body Fields

| Field          |  Type  |  Role   |      Description       |
| -------------- | :----: | :-----: | :--------------------: |
| user           | object |  Both   |   Nested user fields   |
| major          | string | Student |     Student major      |
| classification | string | Student | Student classification |
| title          | string | Faculty |     Faculty title      |
| phone          | string | Factuly |  Faculty phone number  |

##### Nested User Object Fields

| Field      |  Type  |    Description    |
| ---------- | :----: | :---------------: |
| id         |  int   |      User ID      |
| email      | string |   User's email    |
| first_name | string | User's first name |
| last_name  | string | User's last name  |
| cwid       | string |  Campus-wide ID   |
| role       | string |     User role     |

#### Responses

**400 Bad Request** (Validation Error)

```JSON
{
    "user": {
        "email": [
            "User with this email already exists."
        ],
        "cwid": [
            "User with this cwid already exists."
        ]
    }
}
```

**401 Unauthorized** (Authentication Error)

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden** (Authorization Error)

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

## Status Codes

| Code                          | Description                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **200** OK                    | Everything worked as expected.                                                                                                          |
| **201** Created               | The request succeeded, and a new resource was created as a result.                                                                      |
| **400** Bad Request           | The server cannot process the request due to something the server considered to be a client error. Most likely invalid request message. |
| **401** Unauthorized          | The request is unauthenticated.                                                                                                         |
| **403** Forbidden             | The server understood the request but refused to process it                                                                             |
| **404** Not Found             | The server cannot find the requested resource.                                                                                          |
| **500** Internal Server Error | The server encountered an unexpected condition that prevented it from fulfilling the request.                                           |
