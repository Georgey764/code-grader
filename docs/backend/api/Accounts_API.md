# Accounts API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints List](#endpoints-list)
  - [Create User Account](#create-user-account)
  - [Retrieve Account Details](#retrieve-account-details)
  - [Update Account Details](#update-account-details)
  - [Partially Update Account Details](#partially-update-account-details)
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
Authorization: Bearer <access_token> (for authenticated endpoints)
Content-Type: application/json
```

## Endpoints

### Endpoints List

| Method                    | Endpoint                      | Authentication Required? | Description                                |
| ------------------------- | ----------------------------- | :----------------------: | ------------------------------------------ |
| ${\color{gold}POST}$      | /accounts/                    |            No            | Creates a new user account                 |
| ${\color{lightgreen}GET}$ | /accounts/student/_\<cwid\>_/ |           Yes            | Get student's account details              |
| ${\color{lightgreen}GET}$ | /accounts/faculty/_\<cwid\>_/ |           Yes            | Get faculty's account details              |
| ${\color{lightblue}PUT}$  | /accounts/student/_\<cwid\>_/ |           Yes            | Update student's account details           |
| ${\color{lightblue}PUT}$  | /accounts/faculty/_\<cwid\>_/ |           Yes            | Update faculty's account details           |
| ${\color{lavender}PATCH}$ | /accounts/student/_\<cwid\>_/ |           Yes            | Partially update student's account details |
| ${\color{lavender}PATCH}$ | /accounts/faculty/_\<cwid\>_/ |           Yes            | Partially update faculty's account details |

### Create User Account

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /accounts/
- **Authentication Required**: No (registration)
- **Description**: Creates a new user account

#### Request

_Example: Registering as a student_

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

| Field            |  Type  |   Registering As   | Required? | Description                                    |
| :--------------- | :----: | :----------------: | :-------: | :--------------------------------------------- |
| email            | string | Student or Faculty |    Yes    | User's email address                           |
| password         | string | Student or Faculty |    Yes    | Password for the new account                   |
| password_confirm | string | Student or Faculty |    Yes    | Password confirmation (must match password)    |
| role             | string | Student or Faculty |    Yes    | User role: FACULTY/FA or STUDENT/ST            |
| first_name       | string | Student or Faculty |    Yes    | User's first name                              |
| last_name        | string | Student or Faculty |    Yes    | User's last name                               |
| cwid             | string | Student or Faculty |    Yes    | User's Campus-wide ID                          |
| major            | string |      Student       |    No     | Student major (required for students)          |
| classification   | string |      Student       |    No     | Student classification (required for students) |
| title            | string |      Faculty       |   Yes\*   | Faculty title (required for faculty)           |
| phone            | string |      Faculty       |   Yes\*   | Faculty phone number (required for faculty)    |

#### Responses

##### 201 Created

_Example: Response after registering as a student_

```JSON
{
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "ST",
    "cwid": "11111111"
}
```

| Field      |  Type  | Description                         |
| :--------- | :----: | :---------------------------------- |
| email      | string | User's email address                |
| first_name | string | User's first name                   |
| last_name  | string | User's last name                    |
| role       | string | User role: FACULTY/FA or STUDENT/ST |
| cwid       | string | User's Campus-wide ID               |

##### 400 Bad Request

```JSON
{
  "email": [
    "This field is required."
  ],
  ...
}
```

### Retrieve Account Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /accounts/student/_\<cwid\>_/
  - /accounts/faculty/_\<cwid\>_/
- **Authentication Required**: Yes
- **Description**: Get account details provided the user's cwid.

#### Responses

#### 200 OK

_Example: Getting student account details_

```JSON
{
    "id": "7609d561-20f1-4889-8116-30ce83063df8",
    "user": {
        "id": "9e3a5ce5-0c15-4e00-a4c0-2e88071df919",
        "email": "jane.doe@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "cwid": "11111111",
        "role": "ST"
    },
    "major": "CSCI",
    "classification": "freshman",
    "rosters": []
}
```

| Field           |  Type  |       Role        | Description                                  |
| :-------------- | :----: | :---------------: | :------------------------------------------- |
| id              |  uuid  | Student + Faculty | Unique identifier for the account profile    |
| user            | object | Student + Faculty | Nested user object containing user details   |
| user.id         |  uuid  | Student + Faculty | Unique identifier for the user               |
| user.email      | string | Student + Faculty | User's email address                         |
| user.first_name | string | Student + Faculty | User's first name                            |
| user.last_name  | string | Student + Faculty | User's last name                             |
| user.cwid       | string | Student + Faculty | User's Campus-wide ID                        |
| user.role       | string | Student + Faculty | User role: FACULTY/FA or STUDENT/ST          |
| major           | string |      Student      | Student major (if applicable)                |
| classification  | string |      Student      | Student classification (if applicable)       |
| rosters         | array  |      Student      | List of enrolled courses for the student     |
| title           | string |      Faculty      | Faculty title (if applicable)                |
| phone           | string |      Faculty      | Faculty phone number (if applicable)         |
| courses         | array  |      Faculty      | List of courses taught by the faculty member |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No StudentProfile matches the given query."
}
```

### Update Account Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /accounts/student/_\<cwid\>_/
  - /accounts/faculty/_\<cwid\>_/
- **Authentication Required**: Yes
- **Description**: Update account details provided the user's cwid.

#### Request

_Example: Updating student major and classification_

```JSON
{
    "user": {
        "email":"jane.doe@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "cwid": "11111111"
    },
    "major":"MATH",
    "classification":"Sophomore"
}
```

| Field           |  Type  |    Updating As     | Required? | Description                                        |
| :-------------- | :----: | :----------------: | :-------: | :------------------------------------------------- |
| user            | object | Student or Faculty |    Yes    | Nested user object containing updated user details |
| user.email      | string | Student or Faculty |    Yes    | User's email address                               |
| user.first_name | string | Student or Faculty |    Yes    | User's first name                                  |
| user.last_name  | string | Student or Faculty |    Yes    | User's last name                                   |
| user.cwid       | string | Student or Faculty |    Yes    | User's Campus-wide ID                              |
| major           | string |      Student       |    No     | Updated student major (if applicable)              |
| classification  | string |      Student       |    No     | Updated student classification (if applicable)     |
| title           | string |      Faculty       |    Yes    | Updated faculty title                              |
| phone           | string |      Faculty       |    Yes    | Updated faculty phone number                       |

#### Responses

##### 200 OK

_Example: Response after updating student major and classification_

```JSON
{
    "id": "7609d561-20f1-4889-8116-30ce83063df8",
    "user": {
        "id": "9e3a5ce5-0c15-4e00-a4c0-2e88071df919",
        "email": "jane.doe@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "cwid": "11111111",
        "role": "ST"
    },
    "major": "MATH",
    "classification": "Sophomore",
    "rosters": []
}
```

| Field           |  Type  |       Role        | Description                                  |
| :-------------- | :----: | :---------------: | :------------------------------------------- |
| id              |  uuid  | Student + Faculty | Unique identifier for the account profile    |
| user            | object | Student + Faculty | Nested user object containing user details   |
| user.id         |  uuid  | Student + Faculty | Unique identifier for the user               |
| user.email      | string | Student + Faculty | User's email address                         |
| user.first_name | string | Student + Faculty | User's first name                            |
| user.last_name  | string | Student + Faculty | User's last name                             |
| user.cwid       | string | Student + Faculty | User's Campus-wide ID                        |
| user.role       | string | Student + Faculty | User role: FACULTY/FA or STUDENT/ST          |
| major           | string |      Student      | Student major (if applicable)                |
| classification  | string |      Student      | Student classification (if applicable)       |
| rosters         | array  |      Student      | List of enrolled courses for the student     |
| title           | string |      Faculty      | Faculty title (if applicable)                |
| phone           | string |      Faculty      | Faculty phone number (if applicable)         |
| courses         | array  |      Faculty      | List of courses taught by the faculty member |

##### 400 Bad Request

```JSON
{
    "user": {
        "email": [
            "This field is required."
        ]
    }
}
```

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 403 Forbidden

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

##### 404 Not Found

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

### Partially Update Account Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /accounts/student/_\<cwid\>_/
  - /accounts/faculty/_\<cwid\>_/
- **Authentication Required**: Yes
- **Description**: Partially update account details provided the user's cwid.

#### Request

_Example: Updating student major_

```JSON
{
    "major":"ENGLISH"
}

```

| Field           |  Type  |    Updating As     | Required? | Description                                           |
| :-------------- | :----: | :----------------: | :-------: | :---------------------------------------------------- |
| user            | object | Student or Faculty |    Yes    | Nested user object containing fields to update        |
| user.email      | string | Student or Faculty |    Yes    | User's email address                                  |
| user.first_name | string | Student or Faculty |    Yes    | User's first name                                     |
| user.last_name  | string | Student or Faculty |    Yes    | User's last name                                      |
| user.cwid       | string | Student or Faculty |    Yes    | User's Campus-wide ID                                 |
| major           | string |      Student       |    No     | New or updated student major (if applicable)          |
| classification  | string |      Student       |    No     | New or updated student classification (if applicable) |
| title           | string |      Faculty       |    Yes    | New or updated faculty title                          |
| phone           | string |      Faculty       |    Yes    | New or updated faculty phone number                   |

#### Responses

##### 200 OK

_Example: After updating student major_

```JSON
{
    "id": "7609d561-20f1-4889-8116-30ce83063df8",
    "user": {
        "id": "9e3a5ce5-0c15-4e00-a4c0-2e88071df919",
        "email": "jane.doe@example.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "cwid": "11111111",
        "role": "ST"
    },
    "major": "ENGLISH",
    "classification": "Sophomore",
    "rosters": []
}
```

| Field           |  Type  |       Role        | Description                                  |
| :-------------- | :----: | :---------------: | :------------------------------------------- |
| id              |  uuid  | Student + Faculty | Unique identifier for the account profile    |
| user            | object | Student + Faculty | Nested user object containing user details   |
| user.id         |  uuid  | Student + Faculty | Unique identifier for the user               |
| user.email      | string | Student + Faculty | User's email address                         |
| user.first_name | string | Student + Faculty | User's first name                            |
| user.last_name  | string | Student + Faculty | User's last name                             |
| user.cwid       | string | Student + Faculty | User's Campus-wide ID                        |
| user.role       | string | Student + Faculty | User role: FACULTY/FA or STUDENT/ST          |
| major           | string |      Student      | Student major (if applicable)                |
| classification  | string |      Student      | Student classification (if applicable)       |
| rosters         | array  |      Student      | List of enrolled courses for the student     |
| title           | string |      Faculty      | Faculty title (if applicable)                |
| phone           | string |      Faculty      | Faculty phone number (if applicable)         |
| courses         | array  |      Faculty      | List of courses taught by the faculty member |

##### 400 Bad Request

```JSON
{
    "user": {
        "cwid": [
            "Ensure this field has no more than 10 characters."
        ]
    }
}
```

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 403 Forbidden

```JSON
{
    "detail": "Access denied. Only Faculty accounts can perform this action."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No StudentProfile matches the given query."
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
