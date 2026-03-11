# Assignment API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints List](#endpoints-list)
  - [Create Assignment](#create-assignemnt)
  - [List All Assignments](#list-all-assignments)
  - [Get Assignment Details](#get-assignment-details)
  - [Update Assignment Details](#update-assignment-details)
  - [Partially Update Assignment Details](#partially-update-assignment-details)
  - [Delete Assignment](#delete-assignment)
  - [Get Assignment Stats](#get-assignment-stats)
  - [Clone An Assignment](#clone-an-assignment)
  - [Create Assignment Test Case](#create-assignment-test-case)
  - [List All Assignment Test Cases](#list-all-assignment-test-cases)
  - [Get Assignment Test Case Details](#get-assignment-test-case-details)
  - [Update Assignment Test Case Details](#update-assignment-test-case-details)
  - [Partially Update Assignment Test Case Details](#partially-update-assignment-test-case-details)
  - [Delete Assignment Test Case](#delete-assignment-test-case)
- [Status Codes](#status-codes)

## Overview

The Assignments API enables management of assignments, rubrics, and test cases within courses. It provides endpoints for creating, retrieving, updating, deleting, and cloning assignments, as well as managing automated grading test cases and grading rubrics. This API is essential for faculty to administer coursework and for students to access assignment details and feedback.

Key features:

- Create, retrieve, update, and delete assignments
- Add rubrics and test cases when creating or updating assignments
- List all assignments for a course
- Clone assignments to other courses
- Retrieve assignment statistics (e.g., rubric and test case counts)
- Manage test cases for automated grading

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

| Method                    | Endpoint                                      | Authentication Required? | Description                                   |
| ------------------------- | --------------------------------------------- | :----------------------: | :-------------------------------------------- |
| ${\color{gold}POST}$      | /assignments/                                 |           Yes            | Create a new assignment                       |
| ${\color{lightgreen}GET}$ | /assignments/                                 |           Yes            | List all assignments                          |
| ${\color{lightgreen}GET}$ | /assignments/_\<assignment uuid\>_/           |           Yes            | Retrieve assignment details                   |
| ${\color{lightblue}PUT}$  | /assignments/_\<assignment uuid\>_/           |           Yes            | Update assignment details                     |
| ${\color{lavender}PATCH}$ | /assignments/_\<assignment uuid\>_/           |           Yes            | Partially update assignment details           |
| ${\color{hotpink}DELETE}$ | /assignments/_\<assignment uuid\>_/           |           Yes            | Delete an assignment                          |
| ${\color{lightgreen}GET}$ | /assignments/_\<assignment uuid\>_/stats/     |           Yes            | Retrieve assignment statistics                |
| ${\color{gold}POST}$      | /assignments/_\<assignment uuid\>_/clone/     |           Yes            | Clone an assignment to another course         |
| ${\color{gold}POST}$      | /assignments/test-cases/                      |           Yes            | Create a test case for an assignment          |
| ${\color{lightgreen}GET}$ | /assignments/test-cases/                      |           Yes            | List all assignment test cases                |
| ${\color{lightgreen}GET}$ | /assignments/test-cases/_\<test case uuid\>_/ |           Yes            | Retrieve assignment test case details         |
| ${\color{lightblue}PUT}$  | /assignments/test-cases/_\<test case uuid\>_/ |           Yes            | Update assignment test case details           |
| ${\color{lavender}PATCH}$ | /assignments/test-cases/_\<test case uuid\>_/ |           Yes            | Partially update assignment test case details |
| ${\color{hotpink}DELETE}$ | /assignments/test-cases/_\<test case uuid\>_/ |           Yes            | Delete an assignment test case                |

### Create Assignemnt

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /assignments/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Creates a assignment for a course

#### Request

```JSON
{
    "course":"399d3de4-c069-4e8a-a289-bdfa574aadec",
    "name":"Assignment 1",
    "deadline": "2026-02-28T14:30"
}
```

| Field                     |   Type   | Required? | Description                                                            |
| ------------------------- | :------: | :-------: | ---------------------------------------------------------------------- |
| course                    |   uuid   |    Yes    | The unique identifier of the course this assignment belongs to         |
| name                      |  string  |    Yes    | The name/title of the assignment                                       |
| deadline                  | datetime |    Yes    | The due date and time for the assignment                               |
| description               |  string  |    No     | Description of the assignment                                          |
| starter_code              |  string  |    No     | Starter code provided to students                                      |
| max_points_allowed        | integer  |    No     | Maximum points a student can earn for this assignment                  |
| is_grouped                | boolean  |    No     | Whether the assignment is a group assignment                           |
| rubrics                   |  array   |    No     | List of rubric objects for grading criteria                            |
| rubric.assignment         |   uuid   |   Yes\*   | Assignment ID for the rubric (required if including a rubric)          |
| rubric.name               |  string  |   Yes\*   | Name of the rubric (required if including a rubric)                    |
| rublic.max_points         | integer  |   Yes\*   | Maximum points for this rubric (required if including a rubric)        |
| test_cases                |  array   |    No     | List of test_case objects for automated grading                        |
| test_case.assignemnt      |   uuid   |   Yes\*   | Assignment ID for the test case (required if including a test_case)    |
| test_case.possible_points | integer  |   Yes\*   | Possible points for this test case (required if including a test_case) |

#### Responses

##### 201 Created

```JSON
{
    "id": "879ab44e-440c-4b75-835f-72be5cf1a5ec",
    "course": "6cc27afa-f00f-4117-86a9-f71f9354962a",
    "name": "Assignment 1",
    "description": null,
    "deadline": "2026-02-28T14:30:00Z",
    "starter_code": null,
    "max_points_allowed": 100,
    "is_grouped": false,
    "rubrics": [],
    "test_cases": []
}
```

| Field                     | Type     | Description                                                    |
| ------------------------- | -------- | -------------------------------------------------------------- |
| id                        | uuid     | Unique identifier for the assignment                           |
| course                    | uuid     | The unique identifier of the course this assignment belongs to |
| name                      | string   | The name of the assignment                                     |
| description               | string   | Description of the assignment                                  |
| deadline                  | datetime | The due date and time for the assignment                       |
| starter_code              | string   | Starter code provided to students                              |
| max_points_allowed        | integer  | Maximum points a student can earn for this assignment          |
| is_grouped                | boolean  | Whether the assignment is a group assignment                   |
| rubrics                   | array    | List of rubric objects for grading criteria                    |
| rubric.assignment         | uuid     | Assignment ID for the rubric                                   |
| rubric.name               | string   | Name of the rubric                                             |
| rublic.max_points         | integer  | Maximum points for this rubric                                 |
| test_cases                | array    | List of test_case objects for automated grading                |
| test_case.assignemnt      | uuid     | Assignment ID for the test case                                |
| test_case.possible_points | integer  | Possible points for this test case                             |

##### 400 Bad Request

```JSON
{
    "course": [
        "This field is required."
    ],
    ...
}
```

### List All Assignments

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /assignments/
- **Authentication Required**: Yes
- **Description**: Retrieves a list of assignments

#### Responses

##### 200 OK

```JSON
[
    {
        "id": "a9795ec5-2684-4e43-ba1b-b92a190b64b1",
        "course": "44285a0a-ce6a-40c2-b14d-238ddebd5724",
        "course_name": "Algebra",
        "name": "Assignment 1",
        "deadline": "2026-02-28T14:30:00Z",
        "max_points_allowed": 10,
        "is_grouped": true,
        "rubric_count": 0,
        "test_case_count": 0,
        "created_at": "2026-02-25T23:25:16.985967Z"
    },
    ...
]
```

| Field              | Type     | Description                                                    |
| ------------------ | -------- | -------------------------------------------------------------- |
| id                 | uuid     | Unique identifier for the assignment                           |
| course             | uuid     | The unique identifier of the course this assignment belongs to |
| course_name        | string   | The name/title of the course                                   |
| deadline           | datetime | The due date and time for the assignment                       |
| max_points_allowed | integer  | Maximum points a student can earn for this assignment          |
| is_grouped         | boolean  | Whether the assignment is a group assignment                   |
| rubrics_count      | integer  | Number of rubric objects for grading criteria                  |
| test_case_count    | integer  | Number of test_case objects for automated grading              |
| created_at         | datetime | Timestamp when the assignment was created                      |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Get Assignment Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/
- **Authentication Required**: Yes
- **Description**: Retrieve assignment details provided the assignemnt's uuid

#### Responses

##### 200 OK

```JSON
{
    "id": "a9795ec5-2684-4e43-ba1b-b92a190b64b1",
    "course": "44285a0a-ce6a-40c2-b14d-238ddebd5724",
    "course_name": "Algebra",
    "course_short_name": "MATH 101",
    "name": "Assignment 1",
    "description": "description",
    "deadline": "2026-02-28T14:30:00Z",
    "starter_code": "TEST1",
    "max_points_allowed": 10,
    "is_grouped": true,
    "rubrics": [],
    "test_cases": [],
    "created_at": "2026-02-25T23:25:16.985967Z",
    "updated_at": "2026-02-25T23:25:16.985976Z"
}
```

| Field                     | Type     | Description                                                    |
| ------------------------- | -------- | -------------------------------------------------------------- |
| id                        | uuid     | Unique identifier for the assignment                           |
| course                    | uuid     | The unique identifier of the course this assignment belongs to |
| course_name               | string   | The name/title of the course                                   |
| course_short_name         | string   | The short name/code of the course                              |
| name                      | string   | The name/title of the assignment                               |
| description               | string   | Description of the assignment                                  |
| deadline                  | datetime | The due date and time for the assignment                       |
| starter_code              | string   | Starter code provided to students                              |
| max_points_allowed        | integer  | Maximum points a student can earn for this assignment          |
| is_grouped                | boolean  | Whether the assignment is a group assignment                   |
| rubrics                   | array    | List of rubric objects for grading criteria                    |
| rubric.assignment         | uuid     | Assignment ID for the rubric                                   |
| rubric.name               | string   | Name of the rubric                                             |
| rublic.max_points         | integer  | Maximum points for this rubric                                 |
| test_cases                | array    | List of test_case objects for automated grading                |
| test_case.assignemnt      | uuid     | Assignment ID for the test case                                |
| test_case.possible_points | integer  | Possible points for this test case                             |
| created_at                | datetime | Timestamp when the assignment was created                      |
| updated_at                | datetime | Timestamp when the assignment was last updated                 |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Update Assignment Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/
- **Authentication Required**: Yes
- **Description**: Update assignment details provided the assignemnt's uuid

#### Request

```JSON
{
    "course":"44285a0a-ce6a-40c2-b14d-238ddebd5724",
    "name":"Syllabus Quiz",
    "deadline":"2026-02-28T14:30:00Z"
}
```

| Field                     |   Type   | Required? | Description                                                            |
| ------------------------- | :------: | :-------: | ---------------------------------------------------------------------- |
| course                    |   uuid   |    Yes    | The unique identifier of the course this assignment belongs to         |
| name                      |  string  |    Yes    | The name/title of the assignment                                       |
| deadline                  | datetime |    Yes    | The due date and time for the assignment                               |
| description               |  string  |    No     | Description of the assignment                                          |
| starter_code              |  string  |    No     | Starter code provided to students                                      |
| max_points_allowed        | integer  |    No     | Maximum points a student can earn for this assignment                  |
| is_grouped                | boolean  |    No     | Whether the assignment is a group assignment                           |
| rubrics                   |  array   |    No     | List of rubric objects for grading criteria                            |
| rubric.assignment         |   uuid   |   Yes\*   | Assignment ID for the rubric (required if including a rubric)          |
| rubric.name               |  string  |   Yes\*   | Name of the rubric (required if including a rubric)                    |
| rublic.max_points         | integer  |   Yes\*   | Maximum points for this rubric (required if including a rubric)        |
| test_cases                |  array   |    No     | List of test_case objects for automated grading                        |
| test_case.assignemnt      |   uuid   |   Yes\*   | Assignment ID for the test case (required if including a test_case)    |
| test_case.possible_points | integer  |   Yes\*   | Possible points for this test case (required if including a test_case) |

#### Responses

##### 200 OK

```JSON
{
    "id": "a9795ec5-2684-4e43-ba1b-b92a190b64b1",
    "course": "44285a0a-ce6a-40c2-b14d-238ddebd5724",
    "name": "Syllabus Quiz",
    "description": "description",
    "deadline": "2026-02-28T14:30:00Z",
    "starter_code": "TEST1",
    "max_points_allowed": 10,
    "is_grouped": true,
    "rubrics": [],
    "test_cases": []
}
```

| Field                     | Type     | Description                                                    |
| ------------------------- | -------- | -------------------------------------------------------------- |
| id                        | uuid     | Unique identifier for the assignment                           |
| course                    | uuid     | The unique identifier of the course this assignment belongs to |
| name                      | string   | The name of the assignment                                     |
| description               | string   | Description of the assignment                                  |
| deadline                  | datetime | The due date and time for the assignment                       |
| starter_code              | string   | Starter code provided to students                              |
| max_points_allowed        | integer  | Maximum points a student can earn for this assignment          |
| is_grouped                | boolean  | Whether the assignment is a group assignment                   |
| rubrics                   | array    | List of rubric objects for grading criteria                    |
| rubric.assignment         | uuid     | Assignment ID for the rubric                                   |
| rubric.name               | string   | Name of the rubric                                             |
| rublic.max_points         | integer  | Maximum points for this rubric                                 |
| test_cases                | array    | List of test_case objects for automated grading                |
| test_case.assignemnt      | uuid     | Assignment ID for the test case                                |
| test_case.possible_points | integer  | Possible points for this test case                             |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Partially Update Assignment Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/
- **Authentication Required**: Yes
- **Description**: Partially update assignment details provided the assignemnt's uuid

#### Request

_Example: Changing assignment deadline_

```JSON
{
    "deadline": "2026-03-31T14:30:00Z"
}
```

| Field                     |   Type   | Description                                                            |
| ------------------------- | :------: | ---------------------------------------------------------------------- |
| course                    |   uuid   | The unique identifier of the course this assignment belongs to         |
| name                      |  string  | The name/title of the assignment                                       |
| deadline                  | datetime | The due date and time for the assignment                               |
| description               |  string  | Description of the assignment                                          |
| starter_code              |  string  | Starter code provided to students                                      |
| max_points_allowed        | integer  | Maximum points a student can earn for this assignment                  |
| is_grouped                | boolean  | Whether the assignment is a group assignment                           |
| rubrics                   |  array   | List of rubric objects for grading criteria                            |
| rubric.assignment         |   uuid   | Assignment ID for the rubric (required if including a rubric)          |
| rubric.name               |  string  | Name of the rubric (required if including a rubric)                    |
| rublic.max_points         | integer  | Maximum points for this rubric (required if including a rubric)        |
| test_cases                |  array   | List of test_case objects for automated grading                        |
| test_case.assignemnt      |   uuid   | Assignment ID for the test case (required if including a test_case)    |
| test_case.possible_points | integer  | Possible points for this test case (required if including a test_case) |

#### Responses

##### 200 OK

_Example: Response after changing assignment deadline_

```JSON
{
    "id": "a9795ec5-2684-4e43-ba1b-b92a190b64b1",
    "course": "44285a0a-ce6a-40c2-b14d-238ddebd5724",
    "name": "Syllabus Quiz",
    "description": "description",
    "deadline": "2026-03-31T14:30:00Z",
    "starter_code": "TEST1",
    "max_points_allowed": 10,
    "is_grouped": true,
    "rubrics": [],
    "test_cases": []
}
```

| Field                     | Type     | Description                                                    |
| ------------------------- | -------- | -------------------------------------------------------------- |
| id                        | uuid     | Unique identifier for the assignment                           |
| course                    | uuid     | The unique identifier of the course this assignment belongs to |
| name                      | string   | The name of the assignment                                     |
| description               | string   | Description of the assignment                                  |
| deadline                  | datetime | The due date and time for the assignment                       |
| starter_code              | string   | Starter code provided to students                              |
| max_points_allowed        | integer  | Maximum points a student can earn for this assignment          |
| is_grouped                | boolean  | Whether the assignment is a group assignment                   |
| rubrics                   | array    | List of rubric objects for grading criteria                    |
| rubric.assignment         | uuid     | Assignment ID for the rubric                                   |
| rubric.name               | string   | Name of the rubric                                             |
| rublic.max_points         | integer  | Maximum points for this rubric                                 |
| test_cases                | array    | List of test_case objects for automated grading                |
| test_case.assignemnt      | uuid     | Assignment ID for the test case                                |
| test_case.possible_points | integer  | Possible points for this test case                             |

### Delete Assignment

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Removes an assignment provided the assignemnt's uuid

#### Responses

##### 204 No Content

##### 401 Unauthorized

##### 404 Not Found

```JSON
{
    "detail": "No Assignment matches the given query."
}
```

### Get Assignment Stats

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/stats/
- **Authentication Required**: Yes
- **Description**: Retrieve assignment stats provided the assignemnt's uuid

#### Responses

##### 200 OK

```JSON
{
    "total_rubric_criteria": 0,
    "total_test_cases": 0,
    "is_past_deadline": false
}
```

| Field                 | Type    | Description                                  |
| --------------------- | ------- | -------------------------------------------- |
| total_rubric_criteria | integer | Number of rubric criteria for the assignment |
| total_test_cases      | integer | Number of test cases for the assignment      |
| is_past_deadline      | boolean | Whether the assignment deadline has passed   |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "Not found."
}
```

### Clone An Assignment

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /assignments/_\<assignment uuid\>_/clone/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Creates a clone of an existing assignment

#### Request

```JSON
{
    "new_course_id": "c721f3b0-fd6a-4bb3-9948-58a6abb8aeee"
}
```

| Field         | Type | Required? | Description                                                      |
| :------------ | :--: | :-------: | ---------------------------------------------------------------- |
| new_course_id | uuid |    Yes    | The unique identifier of the course to clone the assignment into |

#### Responses

##### 201 Created

```JSON
{
    "status": "cloned"
}
```

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "Not found."
}
```

| Field  |  Type   | Description                                              |
| :----- | :-----: | -------------------------------------------------------- |
| status | boolean | Indicates whether the assignment was successfully cloned |

### Get Assignment Rubric

### Update Assignment Rubric

### Delete Assignment Rubric

### Create Assignment Test Case

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /assignments/test-cases/
- **Authentication Required**: Yes (Faculty Token)
- **Description**: Creates a test cases for an assignment

#### Request

```JSON
{
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "points_possible": 10
}
```

| Field           |  Type   | Required? | Description                                                       |
| :-------------- | :-----: | :-------: | :---------------------------------------------------------------- |
| assignemnt      |  uuid   |    Yes    | The unique identifier of the assignment this test case belongs to |
| points_possible | integer |    Yes    | The number of points this test case is worth                      |
| input_text      | string  |    No     | The input provided to the student's code during automated grading |
| expected_output | string  |    No     | The expected output for the test case                             |
| time_limit      | integer |    No     | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean |    No     | Whether this test case is hidden from students                    |

#### Response

##### 201 Created

```JSON
{
    "id": "94447ae5-9c1e-4c81-89c6-96f7f67a81cb",
    "input_text": null,
    "expected_output": null,
    "time_limit": 300,
    "is_hidden": true,
    "points_possible": 10.0,
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70"
}
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| id              |  uuid   | Unique identifier for the test case                               |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

### List All Assignment Test Cases

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /assignments/test-cases/
- **Authentication Required**: Yes
- **Description**: Retrieves a list of assignment test cases

#### Responses

##### 200 OK

```JSON
[
    {
        "id": "94447ae5-9c1e-4c81-89c6-96f7f67a81cb",
        "input_text": null,
        "expected_output": null,
        "time_limit": 300,
        "is_hidden": true,
        "points_possible": 10.0,
        "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70"
    },
    ...
]
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| id              |  uuid   | Unique identifier for the test case                               |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Get Assignment Test Case Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /assignments/test-cases/_\<test case uuid\>_/
- **Authentication Required**: Yes
- **Description**: Retrieves assignment test cases details provided the assignemnt test case's uuid

#### Responses

##### 200 OK

```JSON
{
    "id": "94447ae5-9c1e-4c81-89c6-96f7f67a81cb",
    "input_text": null,
    "expected_output": null,
    "time_limit": 300,
    "is_hidden": true,
    "points_possible": 10,
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70"
}
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| id              |  uuid   | Unique identifier for the test case                               |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No TestCase matches the given query."
}
```

### Update Assignment Test Case Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /assignments/test-cases/_\<test case uuid\>_/
- **Authentication Required**: Yes
- **Description**: Update assignment test case provided the assignemnt test case's uuid

#### Request

```JSON
{
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "points_possible": 10
}
```

| Field           |  Type   | Required? | Description                                                       |
| :-------------- | :-----: | :-------: | :---------------------------------------------------------------- |
| assignemnt      |  uuid   |    Yes    | The unique identifier of the assignment this test case belongs to |
| points_possible | integer |    Yes    | The number of points this test case is worth                      |
| input_text      | string  |    No     | The input provided to the student's code during automated grading |
| expected_output | string  |    No     | The expected output for the test case                             |
| time_limit      | integer |    No     | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean |    No     | Whether this test case is hidden from students                    |

#### Responses

##### 200 OK

```JSON
{
    "id": "94447ae5-9c1e-4c81-89c6-96f7f67a81cb",
    "input_text": null,
    "expected_output": null,
    "time_limit": 300,
    "is_hidden": true,
    "points_possible": 5,
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70"
}
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| id              |  uuid   | Unique identifier for the test case                               |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No TestCase matches the given query."
}
```

### Partially Update Assignment Test Case Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /assignments/test-cases/_\<test case uuid\>_/
- **Authentication Required**: Yes
- **Description**: Partially update assignment test case provided the assignemnt test case's uuid

#### Request

```JSON
{
    "time_limit": 1000
}
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

#### Responses

##### 200 OK

```JSON
{
    "id": "94447ae5-9c1e-4c81-89c6-96f7f67a81cb",
    "input_text": null,
    "expected_output": null,
    "time_limit": 1000,
    "is_hidden": true,
    "points_possible": 5.0,
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70"
}
```

| Field           |  Type   | Description                                                       |
| :-------------- | :-----: | :---------------------------------------------------------------- |
| id              |  uuid   | Unique identifier for the test case                               |
| assignemnt      |  uuid   | The unique identifier of the assignment this test case belongs to |
| points_possible | integer | The number of points this test case is worth                      |
| input_text      | string  | The input provided to the student's code during automated grading |
| expected_output | string  | The expected output for the test case                             |
| time_limit      | integer | Maximum time (in seconds) allowed for code execution              |
| is_hidden       | boolean | Whether this test case is hidden from students                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No TestCase matches the given query."
}
```

### Delete Assignment Test Case

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /assignments/test-cases/_\<test case uuid\>_/
- **Authentication Required**: Yes
- **Description**: Deletes an assignment test case provided the assignemnt test case's uuid

#### Responses

##### 204 No Content

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

##### 404 Not Found

```JSON
{
    "detail": "No TestCase matches the given query."
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
