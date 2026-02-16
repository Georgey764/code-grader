# Accounts API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Create Course](#create-course)
  - [Get List Of Courses](#get-list-of-courses)
  - [Get Course Details](#get-course-details)
  - [Update Course Details](#update-course-details)
  - [Remove Course](#remove-course)
  - [Add To Course Roster](#add-to-course-roster)
  - [Remove From Course Roster](#remove-from-course-roster)
- [Status Codes](#status-codes)

## Overview

The Courses API enables faculty and students to manage course-related resources within the application. Faculty can create, update, and remove courses, while students can enroll in or remove themselves from course rosters. The API enforces role-based access control, ensuring that only authorized users can perform specific actions. All endpoints require authentication, and responses provide detailed information about courses and roster membership.

Key Features

- Role-based access for faculty and students
- Create, update, retrieve, and delete courses (faculty only)
- Enroll in or remove self from course rosters (students only)
- Detailed course and roster information in responses
- Standardized error handling and status codes
- Secure authentication using access tokens

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

| Method | Endpoint             | Authentication Required |  Role   | Description                       |
| ------ | -------------------- | :---------------------: | :-----: | --------------------------------- |
| POST   | /courses/            |           Yes           | Faculty | Create a new course               |
| GET    | /courses/            |           Yes           | Faculty | Retrieve the list of courses      |
| GET    | /courses/_id_        |           Yes           | Faculty | Retrieve course details           |
| PUT    | /courses/_id_        |           Yes           | Faculty | Update course details             |
| PATCH  | /courses/_id_        |           Yes           | Faculty | Partially update course details   |
| DELETE | /courses/_id_        |           Yes           | Faculty | Remove course                     |
| POST   | /courses/_id_/roster |           Yes           | Student | Adds student to the course roster |
| DELETE | /courses/_id_/roster |           Yes           | Student | Remove student from course roster |

### Create Course

- **Method**: POST
- **Path**: /courses/
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Creates a new course.

#### Request Body

```JSON
{
  "crn": 12345,
  "short_name": "CS101",
  "name": "Intro to CS",
  "description": "Basics of programming",
  "is_active": true
}
```

##### Request Body Fields

| Field       |  Type   | Required | Description                                        |
| ----------- | :-----: | :------: | -------------------------------------------------- |
| crn         |   int   |   Yes    | Course Registration Number (5 digits, 10000-99999) |
| name        | string  |   Yes    | Name of the course                                 |
| short_name  | string  |   Yes    | Short name for the course                          |
| description | string  |    No    | A description of the course                        |
| is_active   | boolean |    No    | Whether the course is active (default: true)       |

#### Responses

**201 Created**

```JSON
{
    "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
    "crn": 12345,
    "short_name": "CS101",
    "is_active": true,
    "created_at": "2026-02-12T15:34:48.353533Z",
    "updated_at": "2026-02-12T15:34:48.353544Z",
    "name": "Intro to CS",
    "description": "Basics of programming",
    "faculty_profile": "f409d595-c74d-41c0-a67c-2c7706a5bc1a"
}
```

- Note: `faculty_profile` is set automatically from the authenticated faculty user.

**400 Bad Request** (Vaildation Error)

```JSON
{
    "crn": [
        "This field is required."
    ],
    "short_name": [
        "This field is required."
    ],
    "name": [
        "This field is required."
    ]
}
```

### Get List Of Courses

- **Method**: GET
- **Path**: /courses
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Get a collection of courses.

#### Responses

**200 OK**

```JSON
[
    {
        "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
        "faculty_profile": {
            "id": "f409d595-c74d-41c0-a67c-2c7706a5bc1a",
            "user": {
                "id": "b54cb486-9f4d-4b7c-b148-550209339e31",
                "email": "john.doe@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "cwid": "99999999",
                "role": "FA"
            },
            "title": "Professor",
            "phone": "+13183420000"
        },
        "crn": 12345,
        "short_name": "CS101",
        "is_active": true,
        "created_at": "2026-02-12T15:34:48.353533Z",
        "updated_at": "2026-02-12T15:34:48.353544Z",
        "name": "Intro to CS",
        "description": "Basics of programming"
    },
    ...
]
```

##### Response Fields

| Field           |  Type  |         Description         |
| --------------- | :----: | :-------------------------: |
| id              |  UUID  |     Nested user fields      |
| faculty_profile | object |       Faculty profile       |
| crn             |  int   | Course Registration Number  |
| short_name      | string |  Short name for the course  |
| is_active       |  bool  |   Course's active status    |
| created_at      | string |      Date of creation       |
| updated_at      | string | Date of most recent changes |
| name            | string |     Name of the course      |
| description     | string | A description of the course |

- Note: Refer to [Accounts API](./Accounts_API.md#get-user-account-details) for `faculty_profile` details.

**401 Unauthorized** (Authentication Error)

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

**403 - Forbidden** (Authorization Error)

```JSON
{
    "detail": "Access denied. Only Faculty accounts can perform this action."
}
```

### Get Course Details

- **Method**: GET
- **Path**: /courses/_id_/
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Retrieves course details by _ID_.

#### Responses

**200 OK**

```JSON
{
    "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
    "faculty_profile": {
        "id": "f409d595-c74d-41c0-a67c-2c7706a5bc1a",
        "user": {
            "id": "b54cb486-9f4d-4b7c-b148-550209339e31",
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "cwid": "99999999",
            "role": "FA"
        },
        "title": "Professor",
        "phone": "+13183420000"
    },
    "crn": 12345,
    "short_name": "CS101",
    "is_active": true,
    "created_at": "2026-02-12T15:34:48.353533Z",
    "updated_at": "2026-02-12T15:34:48.353544Z",
    "name": "Intro to CS",
    "description": "Basics of programming"
}
```

##### Response Fields

| Field           |  Type  |         Description         |
| --------------- | :----: | :-------------------------: |
| id              |  UUID  |     Nested user fields      |
| faculty_profile | object |       Faculty profile       |
| crn             |  int   | Course Registration Number  |
| short_name      | string |  Short name for the course  |
| is_active       |  bool  |   Course's active status    |
| created_at      | string |      Date of creation       |
| updated_at      | string | Date of most recent changes |
| name            | string |     Name of the course      |
| description     | string | A description of the course |

- Note: Refer to [Accounts API](./Accounts_API.md#get-user-account-details) for `faculty_profile` details.

**401 Unauthorized** (Authentication Error)

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

**404 Not Found**

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Update Course Details

- **Method**: PUT
- **Path**: /courses/_id_/
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Update course details given the course _ID_.

#### Request Body

```JSON
{
  "crn": 12345,
  "short_name": "CS101",
  "name": "Intro to Programming",
  "description": "Basics of programming",
  "is_active": true
}
```

#### Responses

**200 OK**

```JSON
{
    "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
    "faculty_profile": {
        "id": "f409d595-c74d-41c0-a67c-2c7706a5bc1a",
        "user": {
            "id": "b54cb486-9f4d-4b7c-b148-550209339e31",
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "cwid": "99999999",
            "role": "FA"
        },
        "title": "Professor",
        "phone": "+13183420000"
    },
    "crn": 12345,
    "short_name": "CS101",
    "is_active": true,
    "created_at": "2026-02-12T15:34:48.353533Z",
    "updated_at": "2026-02-15T17:20:56.791598Z",
    "name": "Intro to Programming",
    "description": "Basics of programming"
}
```

##### Response Fields

| Field           |  Type  |         Description         |
| --------------- | :----: | :-------------------------: |
| id              |  UUID  |     Nested user fields      |
| faculty_profile | object |       Faculty profile       |
| crn             |  int   | Course Registration Number  |
| short_name      | string |  Short name for the course  |
| is_active       |  bool  |   Course's active status    |
| created_at      | string |      Date of creation       |
| updated_at      | string | Date of most recent changes |
| name            | string |     Name of the course      |
| description     | string | A description of the course |

- Note: Refer to [Accounts API](./Accounts_API.md#get-user-account-details) for `faculty_profile` details.

**400 Bad Request** (Validation Error)

```JSON
{
    "crn": [
        "This field is required."
    ],
    "short_name": [
        "This field is required."
    ],
    ...
}
```

**401 Unauthorized** (Authentication Error)

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

**404 Not Found**

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Partially Update Course Details

- **Method**: PATCH
- **Path**: /courses/_id_/
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Partially update course details given the course _ID_.

#### Request Body

```JSON
{
    "short_name": "ENGL101",
    "name": "English Composition I"
}
```

#### Responses

**200 OK**

```JSON
{
    "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
    "faculty_profile": {
        "id": "f409d595-c74d-41c0-a67c-2c7706a5bc1a",
        "user": {
            "id": "b54cb486-9f4d-4b7c-b148-550209339e31",
            "email": "john.doe@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "cwid": "99999999",
            "role": "FA"
        },
        "title": "Professor",
        "phone": "+13183420000"
    },
    "crn": 12345,
    "short_name": "CS102",
    "is_active": true,
    "created_at": "2026-02-12T15:34:48.353533Z",
    "updated_at": "2026-02-15T17:29:20.758165Z",
    "name": "English Composition I",
    "description": "Basics of programming"
}
```

**401 Unauthorized** (Authentication Error)

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

**404 Not Found**

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Remove Course

- **Method**: DELETE
- **Path**: /courses/_id_/
- **Auth Required**: Yes (Faculty Access Token)
- **Description**: Removes a course given the course _ID_.

#### Responses

**204 No Content**

**404 Not Found**

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Add to Course Roster

- **Method**: POST
- **Path**: /courses/_id_/roster
- **Auth Required**: Yes (Student Access Token)
- **Description**: Adds student to the course roster.

#### Responses

**201 Created**

```JSON
{
    "id": "9242b931-0122-4cdd-afb7-d713d7c9298a",
    "student_profile": {
        "id": "d68dfc7a-7f1e-4670-a868-a666c886cdcc",
        "user": {
            ...
        },
        "major": "CSCI",
        "classification": "freshman"
    },
    "course": {
        "id": "79617d6b-bcb4-48bb-988c-852ccf5ed105",
        "faculty_profile": {
            ...
            },
            "title": "Professor",
            "phone": "+13183420000"
        },
        "crn": 12345,
        "short_name": "CS101",
        "is_active": true,
        "created_at": "2026-02-12T15:34:48.353533Z",
        "updated_at": "2026-02-12T15:34:48.353544Z",
        "name": "Intro to CS",
        "description": "Basics of programming"
    },
    "created_at": "2026-02-14T21:06:19.399258Z",
    "updated_at": "2026-02-14T21:06:19.399269Z"
}
```

##### Response Fields

| Field           |  Type  |         Description         |
| --------------- | :----: | :-------------------------: |
| id              |  UUID  |     Nested user fields      |
| student_profile | object |       Student profile       |
| course          | object |       Course details        |
| created_at      | string |      Date of creation       |
| updated_at      | string | Date of most recent changes |

- Note: Refer to [Accounts API](./Accounts_API.md#get-user-account-details) for `student_profile` details.
- Note: Refer to [Get Course Details](#response-fields-1) for `course` fields.

**400 Bad Request**

```JSON
[
    "Student is already enrolled in this course."
]
```

**401 Unauthroized**

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

**403 Forbidden**

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

### Remove From Course Roster

- **Method**: DELETE
- **Path**: /courses/_id_/roster
- **Auth Required**: Yes (Student Access Token)
- **Description**: Removes student from the course roster.

#### Responses

**204 No Content**

```JSON
{
    "message": "Roster entry deleted."
}
```

**403 Forbidden**

```JSON
{
    "detail": "This action has been disabled for this resource."
}
```

## Status Codes

| Code                          | Description                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **200** OK                    | Everything worked as expected.                                                                                                          |
| **201** Created               | The request succeeded, and a new resource was created as a result.                                                                      |
| **204** No Content            | The request has succeeded, but the client doesn't need to navigate away from its current page                                           |
| **400** Bad Request           | The server cannot process the request due to something the server considered to be a client error. Most likely invalid request message. |
| **401** Unauthorized          | The request is unauthenticated.                                                                                                         |
| **403** Forbidden             | The server understood the request but refused to process it                                                                             |
| **404** Not Found             | The server cannot find the requested resource.                                                                                          |
| **500** Internal Server Error | The server encountered an unexpected condition that prevented it from fulfilling the request.                                           |
