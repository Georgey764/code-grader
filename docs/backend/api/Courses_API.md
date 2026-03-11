# Course API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints List](#endpoints-list)
  - [Create A New Course](#create-a-new-course)
  - [List Courses](#list-courses)
  - [Retrieve Course Details](#retrieve-course-details)
  - [Update Course Details](#update-course-details)
  - [Partially Update Course Details](#partially-update-course-details)
  - [Remove Course](#remove-course)
  - [Add Student To Course Roster](#add-student-to-course-roster)
  - [Get List Of Student Enrolled Course Rosters](#get-list-of-student-enrolled-course-rosters)
  - [Remove Student From Course Roster](#remove-student-from-course-roster)
- [Status Codes](#status-codes)

## Overview

The Course API provides endpoints for managing courses and course rosters within the system. It supports operations for creating, retrieving, updating, and deleting courses, as well as enrolling and removing students from course rosters. The API is designed to handle role-based access for both faculty and students, ensuring secure and efficient management of academic data.

Key features:

- Create, retrieve, update, and delete courses
- Add and remove students from course rosters
- Retrieve lists of courses and enrolled rosters
- Role-based access and authentication for faculty and students
- Assignment integration within course objects

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

| Method                    | Endpoint                                  | Authentication Required? | Description                          |
| :------------------------ | :---------------------------------------- | :----------------------: | :----------------------------------- |
| ${\color{gold}POST}$      | /courses/                                 |           Yes            | Creates a course                     |
| ${\color{lightgreen}GET}$ | /courses/                                 |           Yes            | List all courses                     |
| ${\color{lightgreen}GET}$ | /courses/_\<course uuid\>_/               |           Yes            | Retrieve course details              |
| ${\color{lightblue}PUT}$  | /courses/_\<course uuid\>_/               |           Yes            | Update course details                |
| ${\color{lavender}PATCH}$ | /courses/_\<course uuid\>_/               |           Yes            | Partially update course details      |
| ${\color{hotpink}DELETE}$ | /courses/_\<course uuid\>_/               |           Yes            | Delete a course                      |
| ${\color{gold}POST}$      | /courses/roster/                          |           Yes            | Add student to course roster         |
| ${\color{lightgreen}GET}$ | /courses/roster/                          |           Yes            | List Student Enrolled Course Rosters |
| ${\color{hotpink}DELETE}$ | /courses/roster/_\<course roster uuid\>_/ |           Yes            | Remove student from course roster    |

### Create A New Course

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /courses/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Creates a new course under the faculty

#### Request

_Example: Creating a computer science course_

```JSON
{
    "crn":"12345",
    "short_name":"CS 101",
    "name":"Intro to Programming"
}
```

| Field       |  Type  | Required? | Description                               |
| :---------- | :----: | :-------: | :---------------------------------------- |
| crn         | string |    Yes    | Course Registration Number                |
| short_name  | string |    Yes    | Short code or abbreviation for the course |
| name        | string |    Yes    | Full course name                          |
| description | string |    No     | Course description                        |

#### Responses

##### 201 Created

```JSON
{
    "id": "a80abd74-22aa-44b7-a3c1-aa536de5f5a1",
    "faculty_profile": {
        "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
        "title": "Professor",
        "first_name": "John",
        "last_name": "Doe"
    },
    "crn": 12345,
    "short_name": "CS 101",
    "is_active": true,
    "assignments": [],
    "created_at": "2026-02-24T02:29:12.770165Z",
    "updated_at": "2026-02-24T02:29:12.770174Z",
    "name": "Intro to Programming",
    "description": null
}
```

| Field                      |   Type   | Description                                       |
| :------------------------- | :------: | :------------------------------------------------ |
| id                         |   uuid   | Unique identifier for the course                  |
| faculty_profile            |  object  | Faculty profile object associated with the course |
| faculty_profile.id         |   uuid   | Unique identifier for the faculty profile         |
| faculty_profile.title      |  string  | Faculty member's title                            |
| faculty_profile.first_name |  string  | Faculty member's first name                       |
| faculty_profile.last_name  |  string  | Faculty member's last name                        |
| crn                        | integer  | Course Registration Number                        |
| short_name                 |  string  | Short code or abbreviation for the course         |
| is_active                  | boolean  | Indicates if the course is currently active       |
| assignments                |  array   | List of assignments for the course                |
| created_at                 | datetime | Timestamp when the course was created             |
| updated_at                 | datetime | Timestamp when the course was last updated        |
| name                       |  string  | Full course name                                  |
| description                |  string  | Course description                                |

##### 400 Bad Request

```JSON
{
    "crn": [
        "This field is required."
    ],
    ...
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

### List Courses

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /courses/
- **Authentication Required**: Yes
- **Description**: Retrieves a list of all courses that the faculty is instructing or a list of courses the student is enrolled in.

#### Responses

##### 200 OK

_Example: Listing all courses that the faculty is instructing_

```JSON
[
    {
        "id": "a80abd74-22aa-44b7-a3c1-aa536de5f5a1",
        "faculty_profile": {
            "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
            "title": "Professor",
            "first_name": "John",
            "last_name": "Doe"
        },
        "crn": 12345,
        "short_name": "CS 101",
        "is_active": true,
        "assignments": [],
        "created_at": "2026-02-24T02:29:12.770165Z",
        "updated_at": "2026-02-24T02:29:12.770174Z",
        "name": "Intro to Programming",
        "description": null
    },
    ...
]
```

| Field                      |   Type   | Description                                       |
| :------------------------- | :------: | :------------------------------------------------ |
| id                         |   uuid   | Unique identifier for the course                  |
| faculty_profile            |  object  | Faculty profile object associated with the course |
| faculty_profile.id         |   uuid   | Unique identifier for the faculty profile         |
| faculty_profile.title      |  string  | Faculty member's title                            |
| faculty_profile.first_name |  string  | Faculty member's first name                       |
| faculty_profile.last_name  |  string  | Faculty member's last name                        |
| crn                        | integer  | Course Registration Number                        |
| short_name                 |  string  | Short code or abbreviation for the course         |
| is_active                  | boolean  | Indicates if the course is currently active       |
| assignments                |  array   | List of assignments for the course                |
| created_at                 | datetime | Timestamp when the course was created             |
| updated_at                 | datetime | Timestamp when the course was last updated        |
| name                       |  string  | Full course name                                  |
| description                |  string  | Course description                                |

### Retrieve Course Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /courses/_\<course uuid\>_/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Retrieves course details provided the course's uuid.

#### Responses

##### 200 OK

```JSON
{
    "id": "a80abd74-22aa-44b7-a3c1-aa536de5f5a1",
    "faculty_profile": {
        "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
        "title": "Professor",
        "first_name": "John",
        "last_name": "Doe"
    },
    "crn": 12345,
    "short_name": "CS 101",
    "is_active": true,
    "assignments": [],
    "created_at": "2026-02-24T02:29:12.770165Z",
    "updated_at": "2026-02-24T02:29:12.770174Z",
    "name": "Intro to Programming",
    "description": null
}
```

| Field                      |   Type   | Description                                       |
| :------------------------- | :------: | :------------------------------------------------ |
| id                         |   uuid   | Unique identifier for the course                  |
| faculty_profile            |  object  | Faculty profile object associated with the course |
| faculty_profile.id         |   uuid   | Unique identifier for the faculty profile         |
| faculty_profile.title      |  string  | Faculty member's title                            |
| faculty_profile.first_name |  string  | Faculty member's first name                       |
| faculty_profile.last_name  |  string  | Faculty member's last name                        |
| crn                        | integer  | Course Registration Number                        |
| short_name                 |  string  | Short code or abbreviation for the course         |
| is_active                  | boolean  | Indicates if the course is currently active       |
| assignments                |  array   | List of assignments for the course                |
| created_at                 | datetime | Timestamp when the course was created             |
| updated_at                 | datetime | Timestamp when the course was last updated        |
| name                       |  string  | Full course name                                  |
| description                |  string  | Course description                                |

##### 401 Unauthorized

```JSON
{
    "detail": "Authorization header must contain two space-delimited values",
    "code": "bad_authorization_header"
}
```

##### 404 Not Found

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Update Course Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /courses/_\<course uuid\>_/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Updates course details provided the course's uuid.

#### Request

_Example: Chaning a course's crn, short name, and name_

```JSON
{
    "crn":"24680",
    "short_name":"CS 102",
    "name":"Intro to Programming II"
}
```

| Field       |  Type  | Required? | Description                               |
| :---------- | :----: | :-------: | :---------------------------------------- |
| crn         | string |    Yes    | Course Registration Number                |
| short_name  | string |    Yes    | Short code or abbreviation for the course |
| name        | string |    Yes    | Full course name                          |
| description | string |    No     | Course description                        |

#### Responses

##### 200 OK

_Example: Response after chaning a course's crn, short name, and name_

```JSON
{
    "id": "a80abd74-22aa-44b7-a3c1-aa536de5f5a1",
    "faculty_profile": {
        "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
        "title": "Professor",
        "first_name": "John",
        "last_name": "Doe"
    },
    "crn": 24680,
    "short_name": "CS 102",
    "is_active": true,
    "assignments": [],
    "created_at": "2026-02-24T02:29:12.770165Z",
    "updated_at": "2026-02-24T03:31:32.542797Z",
    "name": "Intro to Programming II",
    "description": null
}
```

| Field                      |   Type   | Description                                       |
| :------------------------- | :------: | :------------------------------------------------ |
| id                         |   uuid   | Unique identifier for the course                  |
| faculty_profile            |  object  | Faculty profile object associated with the course |
| faculty_profile.id         |   uuid   | Unique identifier for the faculty profile         |
| faculty_profile.title      |  string  | Faculty member's title                            |
| faculty_profile.first_name |  string  | Faculty member's first name                       |
| faculty_profile.last_name  |  string  | Faculty member's last name                        |
| crn                        | integer  | Course Registration Number                        |
| short_name                 |  string  | Short code or abbreviation for the course         |
| is_active                  | boolean  | Indicates if the course is currently active       |
| assignments                |  array   | List of assignments for the course                |
| created_at                 | datetime | Timestamp when the course was created             |
| updated_at                 | datetime | Timestamp when the course was last updated        |
| name                       |  string  | Full course name                                  |
| description                |  string  | Course description                                |

##### 401 Unauthorized

```JSON
{
    "detail": "Authorization header must contain two space-delimited values",
    "code": "bad_authorization_header"
}
```

##### 404 Not Found

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Partially Update Course Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /courses/_\<course uuid\>_/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Updates course details provided the course's uuid.

#### Request

_Example: Chaning a course's description_

```JSON
{
    "description":"Variable types, loops, and conditions"
}
```

| Field       |  Type  | Required? | Description                               |
| :---------- | :----: | :-------: | :---------------------------------------- |
| crn         | string |    Yes    | Course Registration Number                |
| short_name  | string |    Yes    | Short code or abbreviation for the course |
| name        | string |    Yes    | Full course name                          |
| description | string |    No     | Course description                        |

#### Responses

##### 200 OK

_Example: Response after chaning a course's description_

```JSON
{
    "id": "a80abd74-22aa-44b7-a3c1-aa536de5f5a1",
    "faculty_profile": {
        "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
        "title": "Professor",
        "first_name": "John",
        "last_name": "Doe"
    },
    "crn": 12345,
    "short_name": "CS 101",
    "is_active": true,
    "assignments": [],
    "created_at": "2026-02-24T02:29:12.770165Z",
    "updated_at": "2026-02-24T03:38:42.019011Z",
    "name": "Intro to Programming I",
    "description": "Variable types, loops, and conditions"
}
```

##### 401 Unauthorized

```JSON
{
    "detail": "Authorization header must contain two space-delimited values",
    "code": "bad_authorization_header"
}
```

##### 404 Not Found

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Remove Course

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /courses/_\<course uuid\>_/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Delete a course provided the course's uuid.

#### Responses

##### 204 No Content

##### 401 Unauthorized

```JSON
{
    "detail": "Authorization header must contain two space-delimited values",
    "code": "bad_authorization_header"
}
```

##### 404 Not Found

```JSON
{
    "detail": "No Course matches the given query."
}
```

### Add Student To Course Roster

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /courses/roster/
- **Authentication Required**: Yes (Student Token)
- **Description**: Adds student to the course roster

#### Request

```JSON
{
    "course_id": "6cc27afa-f00f-4117-86a9-f71f9354962a"
}
```

| Field     | Type | Required? | Description                      |
| --------- | ---- | --------- | -------------------------------- |
| course_id | uuid | Yes       | Unique identifier for the course |

#### Responses

##### 201 Created

```JSON
{
    "id": "304b66eb-aa3f-4b8c-a158-00c44e63201d",
    "student_profile": {
        "id": "7609d561-20f1-4889-8116-30ce83063df8",
        "major": "ENGLISH",
        "first_name": "Jane",
        "last_name": "Doe"
    },
    "course": {
        "id": "6cc27afa-f00f-4117-86a9-f71f9354962a",
        "faculty_profile": {
            "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
            "title": "Professor",
            "first_name": "John",
            "last_name": "Doe"
        },
        "crn": 12345,
        "short_name": "CS 101",
        "is_active": true,
        "assignments": [],
        "created_at": "2026-02-24T15:43:42.323528Z",
        "updated_at": "2026-02-24T15:43:42.323537Z",
        "name": "Intro to Programming",
        "description": "Variable types, loops, and conditions."
    },
    "submissions": [],
    "created_at": "2026-02-24T15:46:38.367665Z",
    "updated_at": "2026-02-24T15:46:38.367672Z"
}
```

| Field                             | Type     | Description                                       |
| --------------------------------- | -------- | ------------------------------------------------- |
| id                                | uuid     | Unique identifier for the roster entry            |
| student_profile                   | object   | Student profile object                            |
| student_profile.id                | uuid     | Unique identifier for the student profile         |
| student_profile.major             | string   | Student's major                                   |
| student_profile.first_name        | string   | Student's first name                              |
| student_profile.last_name         | string   | Student's last name                               |
| course                            | object   | Course object                                     |
| course.id                         | uuid     | Unique identifier for the course                  |
| course.faculty_profile            | object   | Faculty profile object associated with the course |
| course.faculty_profile.id         | uuid     | Unique identifier for the faculty profile         |
| course.faculty_profile.title      | string   | Faculty member's title                            |
| course.faculty_profile.first_name | string   | Faculty member's first name                       |
| course.faculty_profile.last_name  | string   | Faculty member's last name                        |
| course.crn                        | integer  | Course Registration Number                        |
| course_short_name                 | string   | Short code or abbreviation for the course         |
| course.is_active                  | boolean  | Indicates if the course is currently active       |
| course.name                       | string   | Full course name                                  |
| course.assignments                | array    | List of assignments for the course                |
| course.created_at                 | datetime | Timestamp when the course was created             |
| course.updated_at                 | datetime | Timestamp when the course was last updated        |
| course.description                | string   | Course description                                |
| submissions                       | array    | List of submissions by the student in this course |
| created_at                        | datetime | Timestamp when the roster entry was created       |
| updated_at                        | datetime | Timestamp when the roster entry was last updated  |

##### 401 Unauthorized

```JSON
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid"
        }
    ]
}
```

##### 403 Forbidden

```JSON
{
    "detail": "Access denied. Only Student accounts can perform this action."
}
```

### Get List Of Student Enrolled Course Rosters

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /courses/roster/
- **Authentication Required**: Yes (Student Token)
- **Description**: Retrieve a list of all course rosters the student is enrolled in.

#### Request

```JSON
{
    "course_id": "6cc27afa-f00f-4117-86a9-f71f9354962a"
}
```

| Field     | Type | Required? | Description                      |
| --------- | ---- | --------- | -------------------------------- |
| course_id | uuid | Yes       | Unique identifier for the course |

#### Responses

##### 200 OK

```JSON
[
    {
        "id": "304b66eb-aa3f-4b8c-a158-00c44e63201d",
        "student_profile": {
            "id": "7609d561-20f1-4889-8116-30ce83063df8",
            "major": "ENGLISH",
            "first_name": "Jane",
            "last_name": "Doe"
        },
        "course": {
            "id": "6cc27afa-f00f-4117-86a9-f71f9354962a",
            "faculty_profile": {
                "id": "13f2be38-5a47-4f59-88b8-445b5febc5f2",
                "title": "Professor",
                "first_name": "John",
                "last_name": "Doe"
            },
            "crn": 12345,
            "short_name": "CS 101",
            "is_active": true,
            "assignments": [],
            "created_at": "2026-02-24T15:43:42.323528Z",
            "updated_at": "2026-02-24T15:43:42.323537Z",
            "name": "Intro to Programming",
            "description": "Variable types, loops, and conditions."
        },
        "submissions": [],
        "created_at": "2026-02-24T15:46:38.367665Z",
        "updated_at": "2026-02-24T15:46:38.367672Z"
    },
    ...
]
```

| Field                             | Type     | Description                                       |
| --------------------------------- | -------- | ------------------------------------------------- |
| id                                | uuid     | Unique identifier for the roster entry            |
| student_profile                   | object   | Student profile object                            |
| student_profile.id                | uuid     | Unique identifier for the student profile         |
| student_profile.major             | string   | Student's major                                   |
| student_profile.first_name        | string   | Student's first name                              |
| student_profile.last_name         | string   | Student's last name                               |
| course                            | object   | Course object                                     |
| course.id                         | uuid     | Unique identifier for the course                  |
| course.faculty_profile            | object   | Faculty profile object associated with the course |
| course.faculty_profile.id         | uuid     | Unique identifier for the faculty profile         |
| course.faculty_profile.title      | string   | Faculty member's title                            |
| course.faculty_profile.first_name | string   | Faculty member's first name                       |
| course.faculty_profile.last_name  | string   | Faculty member's last name                        |
| course.crn                        | integer  | Course Registration Number                        |
| course_short_name                 | string   | Short code or abbreviation for the course         |
| course.is_active                  | boolean  | Indicates if the course is currently active       |
| course.name                       | string   | Full course name                                  |
| course.assignments                | array    | List of assignments for the course                |
| course.created_at                 | datetime | Timestamp when the course was created             |
| course.updated_at                 | datetime | Timestamp when the course was last updated        |
| course.description                | string   | Course description                                |
| submissions                       | array    | List of submissions by the student in this course |
| created_at                        | datetime | Timestamp when the roster entry was created       |
| updated_at                        | datetime | Timestamp when the roster entry was last updated  |

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

### Remove Student From Course Roster

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /courses/roster/_\<course roster uuid\>_
- **Authentication Required**: Yes (Student Token)
- **Description**: Removes student from the course roster provided the course roster uuid

#### Responses

##### 204 No Content

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 403 Forbidden

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
