# Groups API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints List](#endpoints-list)
  - [Create Group](#create-group)
  - [List Groups](#list-groups)
  - [Retrieve Group Details](#retrieve-group-details)
  - [Update Group Details](#update-group-details)
  - [Partially Update Group Details](#partially-update-group-details)
  - [Delete Group](#delete-group)
  - [Create Group Membership](#create-group-membership)
  - [List Group Memberships](#list-group-memberships)
  - [Retrieve Group Membership Details](#retrieve-group-membership-details)
  - [Update Group Membership Details](#update-group-membership-details)
  - [Partially Update Group Membership Details](#partially-update-group-membership-details)
  - [Delete Group Membership](#delete-group-membership)
- [Status Codes](#status-codes)

## Overview

The Groups API provides endpoints for managing student groups and group memberships within assignments. It supports operations for creating, retrieving, updating, and deleting groups, as well as managing group memberships. The API enforces assignment grouping rules and membership limits to ensure proper group management.

Key features:

- Create, retrieve, update, and delete groups for assignments
- Add and remove students from groups (group memberships)
- Enforce assignment grouping and group size limits
- Retrieve lists of groups and group members
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

| Method                    | Endpoint                                   | Authentication Required? | Description                               |
| :------------------------ | :----------------------------------------- | :----------------------: | :---------------------------------------- |
| ${\color{gold}POST}$      | /groups/                                   |           Yes            | Creates a group for an assignment         |
| ${\color{lightgreen}GET}$ | /groups/                                   |           Yes            | List all assignment groups                |
| ${\color{lightgreen}GET}$ | /groups/_\<group uuid\>_/                  |           Yes            | Retrieve group details                    |
| ${\color{lightblue}PUT}$  | /groups/_\<group uuid\>_/                  |           Yes            | Update group details                      |
| ${\color{lavender}PATCH}$ | /groups/_\<group uuid\>_/                  |           Yes            | Partially update group details            |
| ${\color{hotpink}DELETE}$ | /groups/_\<group uuid\>_/                  |           Yes            | Delete a group                            |
| ${\color{gold}POST}$      | /groups/memberships/                       |           Yes            | Add a student to a group (membership)     |
| ${\color{lightgreen}GET}$ | /groups/memberships/                       |           Yes            | List all group memberships                |
| ${\color{lightgreen}GET}$ | /groups/memberships/_<membership uuid\>_/  |           Yes            | Retrieve group membership details         |
| ${\color{lightblue}PUT}$  | /groups/memberships/_\<membership uuid\>_/ |           Yes            | Update group membership details           |
| ${\color{lavender}PATCH}$ | /groups/memberships/_\<membership uuid\>_/ |           Yes            | Partially update group membership details |
| ${\color{hotpink}DELETE}$ | /groups/memberships/_\<membership uuid\>_/ |           Yes            | Delete a group membership                 |

### Create Group

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /groups/
- **Authentication Required**: Yes
- **Description**: Creates a group for an assignment

#### Request

```JSON
{
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "Group 1"
}
```

| Field       |  Type   | Required? | Description                                                |
| :---------- | :-----: | :-------: | ---------------------------------------------------------- |
| assignment  |  uuid   |    Yes    | Unique identifier for the assignment this group belongs to |
| name        | string  |    Yes    | The name of the group                                      |
| max_members | integer |    No     | Maximum number of members allowed in the group             |

#### Responses

#### 201 Created

```JSON
{
    "id": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "Group 1",
    "max_members": 4,
    "current_count": 0,
    "memberships": []
}
```

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| id                   | uuid    | Unique identifier for the group                            |
| assignment           | uuid    | Unique identifier for the assignment this group belongs to |
| name                 | string  | The name of the group                                      |
| max_members          | integer | Maximum number of members allowed in the group             |
| current_count        | integer | Current number of members in the group                     |
| memberships          | array   | List of group membership objects (students in the group)   |
| membership.id        | uuid    | Unique identifier for the group membership                 |
| membership.group     | uuid    | Unique identifier for the group this membership belongs to |
| membership.roster    | uuid    | Unique identifier for the student (roster) in the group    |
| membership.name      | string  | Name of the student in the group                           |
| membership.is_leader | boolean | Whether the student is the group leader                    |

### List Groups

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /groups/
- **Authentication Required**: Yes
- **Description**: List all assignment groups

#### Responses

##### 200 OK

```JSON
[
    {
        "id": "4bb16f44-d498-4bb8-8724-7a52136cbd26",
        "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
        "name": "Group 2",
        "max_members": 5,
        "current_count": 0,
        "memberships": []
    },
    ...
]
```

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| id                   | uuid    | Unique identifier for the group                            |
| assignment           | uuid    | Unique identifier for the assignment this group belongs to |
| name                 | string  | The name of the group                                      |
| max_members          | integer | Maximum number of members allowed in the group             |
| current_count        | integer | Current number of members in the group                     |
| memberships          | array   | List of group membership objects (students in the group)   |
| membership.id        | uuid    | Unique identifier for the group membership                 |
| membership.group     | uuid    | Unique identifier for the group this membership belongs to |
| membership.roster    | uuid    | Unique identifier for the student (roster) in the group    |
| membership.name      | string  | Name of the student in the group                           |
| membership.is_leader | boolean | Whether the student is the group leader                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Retrieve Group Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /groups/_\<group uuid\>_/
- **Authentication Required**: Yes
- **Description**: Retrieve group details

#### Responses

#### 200 OK

```JSON
{
    "id": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "Group 1",
    "max_members": 4,
    "current_count": 1,
    "memberships": [
        {
            "id": "63139e9b-1293-4545-bd14-0562a874b52d",
            "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
            "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
            "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
            "is_leader": false
        }
    ]
}
```

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| id                   | uuid    | Unique identifier for the group                            |
| assignment           | uuid    | Unique identifier for the assignment this group belongs to |
| name                 | string  | The name of the group                                      |
| max_members          | integer | Maximum number of members allowed in the group             |
| current_count        | integer | Current number of members in the group                     |
| memberships          | array   | List of group membership objects (students in the group)   |
| membership.id        | uuid    | Unique identifier for the group membership                 |
| membership.group     | uuid    | Unique identifier for the group this membership belongs to |
| membership.roster    | uuid    | Unique identifier for the student (roster) in the group    |
| membership.name      | string  | Name of the student in the group                           |
| membership.is_leader | boolean | Whether the student is the group leader                    |

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

### Update Group Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /groups/_\<group uuid\>_/
- **Authentication Required**: Yes
- **Description**: Update group details

#### Request

```JSON
{
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "The Devs"
}
```

| Field       |  Type   | Required? | Description                                                |
| :---------- | :-----: | :-------: | ---------------------------------------------------------- |
| assignment  |  uuid   |    Yes    | Unique identifier for the assignment this group belongs to |
| name        | string  |    Yes    | The name of the group                                      |
| max_members | integer |    No     | Maximum number of members allowed in the group             |

#### Responses

##### 200 OK

```JSON
{
    "id": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "The Devs",
    "max_members": 4,
    "current_count": 1,
    "memberships": [
        {
            "id": "63139e9b-1293-4545-bd14-0562a874b52d",
            "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
            "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
            "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
            "is_leader": false
        }
    ]
}
```

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| id                   | uuid    | Unique identifier for the group                            |
| assignment           | uuid    | Unique identifier for the assignment this group belongs to |
| name                 | string  | The name of the group                                      |
| max_members          | integer | Maximum number of members allowed in the group             |
| current_count        | integer | Current number of members in the group                     |
| memberships          | array   | List of group membership objects (students in the group)   |
| membership.id        | uuid    | Unique identifier for the group membership                 |
| membership.group     | uuid    | Unique identifier for the group this membership belongs to |
| membership.roster    | uuid    | Unique identifier for the student (roster) in the group    |
| membership.name      | string  | Name of the student in the group                           |
| membership.is_leader | boolean | Whether the student is the group leader                    |

##### 400 Bad Request

```JSON
{
    "assignment": [
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

##### 404 Not Found

```JSON
{
    "detail": "Not found."
}
```

### Partially Update Group Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /groups/_\<group uuid\>_/
- **Authentication Required**: Yes
- **Description**: Partially update group details

#### Request

```JSON
{
    "max_members": 3
}
```

| Field       |  Type   | Description                                                |
| :---------- | :-----: | ---------------------------------------------------------- |
| assignment  |  uuid   | Unique identifier for the assignment this group belongs to |
| name        | string  | The name of the group                                      |
| max_members | integer | Maximum number of members allowed in the group             |

#### Responses

```JSON
{
    "id": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "assignment": "cfb1ddfe-a2d2-42d4-b76a-df3d97ac0b70",
    "name": "The Devs",
    "max_members": 3,
    "current_count": 1,
    "memberships": [
        {
            "id": "63139e9b-1293-4545-bd14-0562a874b52d",
            "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
            "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
            "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
            "is_leader": false
        }
    ]
}
```

| Field                | Type    | Description                                                |
| -------------------- | ------- | ---------------------------------------------------------- |
| id                   | uuid    | Unique identifier for the group                            |
| assignment           | uuid    | Unique identifier for the assignment this group belongs to |
| name                 | string  | The name of the group                                      |
| max_members          | integer | Maximum number of members allowed in the group             |
| current_count        | integer | Current number of members in the group                     |
| memberships          | array   | List of group membership objects (students in the group)   |
| membership.id        | uuid    | Unique identifier for the group membership                 |
| membership.group     | uuid    | Unique identifier for the group this membership belongs to |
| membership.roster    | uuid    | Unique identifier for the student (roster) in the group    |
| membership.name      | string  | Name of the student in the group                           |
| membership.is_leader | boolean | Whether the student is the group leader                    |

### Delete Group

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /groups/_\<group uuid\>_/
- **Authentication Required**: Yes
- **Description**: Delete a group

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
    "detail": "Not found."
}
```

### Create Group Membership

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /groups/memberships/
- **Authentication Required**: Yes
- **Description**: Add a student to a group (membership)

#### Request

```JSON
{
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21"
}
```

| Field     |  Type   | Required? | Description                                                |
| --------- | :-----: | :-------: | ---------------------------------------------------------- |
| group     |  uuid   |    Yes    | Unique identifier for the group this membership belongs to |
| roster    |  uuid   |    Yes    | Unique identifier for the roster                           |
| is_leader | boolean |    No     | Whether the student is the group leader                    |

#### Responses

##### 201 Created

```JSON
{
    "id": "63139e9b-1293-4545-bd14-0562a874b52d",
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
    "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
    "is_leader": false
}
```

| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| id          | uuid    | Unique identifier for the group membership                 |
| group       | uuid    | Unique identifier for the group this membership belongs to |
| roster      | uuid    | Unique identifier for the student (roster) in the group    |
| roster_name | string  | Name of the roster                                         |
| is_leader   | boolean | Whether the student is the group leader                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### List Group Memberships

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /groups/memberships/
- **Authentication Required**: Yes
- **Description**: List all group memberships

#### Responses

##### 200 OK

```JSON
[
    {
        "id": "2bec034f-f16a-4ece-93fa-57b2128cd21c",
        "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
        "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
        "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
        "is_leader": false
    },
    ...
]
```

| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| id          | uuid    | Unique identifier for the group membership                 |
| group       | uuid    | Unique identifier for the group this membership belongs to |
| roster      | uuid    | Unique identifier for the student (roster) in the group    |
| roster_name | string  | Name of the roster                                         |
| is_leader   | boolean | Whether the student is the group leader                    |

##### 401 Unauthorized

```JSON
{
    "detail": "Authentication credentials were not provided."
}
```

### Retrieve Group Membership Details

- **Method**: ${\color{lightgreen}GET}$
- **Path(s)**:
  - /groups/memberships/_\<membership uuid\>_/
- **Authentication Required**: Yes
- **Description**: Retrieve group membership details provided the membership uuid

#### Responses

##### 200 OK

```JSON
{
    "id": "2bec034f-f16a-4ece-93fa-57b2128cd21c",
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
    "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
    "is_leader": false
}
```

| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| id          | uuid    | Unique identifier for the group membership                 |
| group       | uuid    | Unique identifier for the group this membership belongs to |
| roster      | uuid    | Unique identifier for the student (roster) in the group    |
| roster_name | string  | Name of the roster                                         |
| is_leader   | boolean | Whether the student is the group leader                    |

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

### Update Group Membership Details

- **Method**: ${\color{lightblue}PUT}$
- **Path(s)**:
  - /groups/memberships/_\<membership uuid\>_/
- **Authentication Required**: Yes
- **Description**: Update group membership details provided the membership uuid

#### Request

```JSON
{
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
    "is_leader": true
}
```

| Field     |  Type   | Required? | Description                                                |
| --------- | :-----: | :-------: | ---------------------------------------------------------- |
| group     |  uuid   |    Yes    | Unique identifier for the group this membership belongs to |
| roster    |  uuid   |    Yes    | Unique identifier for the roster                           |
| is_leader | boolean |    No     | Whether the student is the group leader                    |

#### Responses

##### 200 OK

```JSON
{
    "id": "2bec034f-f16a-4ece-93fa-57b2128cd21c",
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
    "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
    "is_leader": true
}
```

| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| id          | uuid    | Unique identifier for the group membership                 |
| group       | uuid    | Unique identifier for the group this membership belongs to |
| roster      | uuid    | Unique identifier for the student (roster) in the group    |
| roster_name | string  | Name of the roster                                         |
| is_leader   | boolean | Whether the student is the group leader                    |

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

### Partially Update Group Membership Details

- **Method**: ${\color{lavender}PATCH}$
- **Path(s)**:
  - /groups/memberships/_\<membership uuid\>_/
- **Authentication Required**: Yes
- **Description**: Partially update group membership details provided the membership uuid

#### Request

```JSON
{
    "is_leader": false
}
```

| Field     |  Type   | Description                                                |
| --------- | :-----: | ---------------------------------------------------------- |
| group     |  uuid   | Unique identifier for the group this membership belongs to |
| roster    |  uuid   | Unique identifier for the roster                           |
| is_leader | boolean | Whether the student is the group leader                    |

#### Responses

##### 200 OK

```JSON
{
    "id": "2bec034f-f16a-4ece-93fa-57b2128cd21c",
    "group": "db18a5ac-b36f-4c9d-9380-ac5f0a29638e",
    "roster": "72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21",
    "roster_name": "Roster object (72fda8b8-f2af-4c7b-bb39-9bd4c8ddbd21)",
    "is_leader": true
}
```

| Field       | Type    | Description                                                |
| ----------- | ------- | ---------------------------------------------------------- |
| id          | uuid    | Unique identifier for the group membership                 |
| group       | uuid    | Unique identifier for the group this membership belongs to |
| roster      | uuid    | Unique identifier for the student (roster) in the group    |
| roster_name | string  | Name of the roster                                         |
| is_leader   | boolean | Whether the student is the group leader                    |

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

### Delete Group Membership

- **Method**: ${\color{hotpink}DELETE}$
- **Path(s)**:
  - /groups/memberships/_\<membership uuid\>_/
- **Authentication Required**: Yes
- **Description**: Delete a group membership provided the membership uuid

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
    "detail": "No GroupsMembership matches the given query."
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
| **404** Not Found             | The server cannot find the requested resource.                                                                                          |
| **500** Internal Server Error | The server encountered an unexpected condition that prevented it from fulfilling the request.                                           |
