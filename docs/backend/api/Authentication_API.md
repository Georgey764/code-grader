# Accounts API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Endpoints List](#endpoints-list)
  - [Getting An Access Token](#getting-an-access-token)
- [Status Codes](#status-codes)

## Overview

The Authentication API provides secure access control for the application. It allows users to authenticate using their credentials and obtain access and refresh tokens for authorized API usage. The API supports token-based authentication, ensuring that only registered users can access protected resources. Typical use cases include logging in, obtaining tokens, and handling authentication errors.

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

### Endpoints List

| Method               | Endpoint | Description                              |
| -------------------- | -------- | ---------------------------------------- |
| ${\color{gold}POST}$ | /token/  | Retrieves the access and refresh tokens. |

### Getting An Access Token

- **Method**: ${\color{gold}POST}$
- **Path(s)**:
  - /token/
- **Auth Required**: No
- **Description**: Retrieves the access and refresh tokens when provided the user's credentials.

#### Request

```JSON
{
    "email": "jane.doe@example.com",
    "password": "password123"
}
```

| Field    |  Type  | Required? | Description          |
| :------- | :----: | :-------: | :------------------- |
| email    | string |    Yes    | User's email address |
| password | string |    Yes    | User's password      |

#### Responses

##### 200 OK

```JSON
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MzQ5OTI5MiwiaWF0IjoxNzcwOTA3MjkyLCJqdGkiOiIyOGRmMGM1OTg4NTI0MDFmYmE2ZmQxODRmMjNlYzYyNyIsInVzZXJfaWQiOiJhNmY0MjhhZS04YjNiLTQ0M2EtOTZhZC00ZDI5NWZhZTBiMjQiLCJyb2xlIjoiU1QiLCJjd2lkIjoiMTExMTExMTEifQ.z-S-BoHoKCv1_f4mtfDt5I_NrvwSP7ipkoXHr7oS1DU",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwOTE0NDkyLCJpYXQiOjE3NzA5MDcyOTIsImp0aSI6ImNlZjg5MWUxMDFmZjRjYjQ5YjUxZmM0YTEzMDFlM2MwIiwidXNlcl9pZCI6ImE2ZjQyOGFlLThiM2ItNDQzYS05NmFkLTRkMjk1ZmFlMGIyNCIsInJvbGUiOiJTVCIsImN3aWQiOiIxMTExMTExMSJ9._b5a5UnsVoByK3qDU8_khkWXpew8manTp1fpBZks5Kw"
}
```

| Field   | Type   | Description                                                                          |
| ------- | ------ | ------------------------------------------------------------------------------------ |
| refresh | string | Refresh token used to obtain new access tokens when the current access token expires |
| access  | string | Access token used for authenticating API requests                                    |

##### 400 Bad Request

```JSON
{
    "email": [
        "This field is required."
    ],
    ...
}
```

##### 401 Unauthorized

```JSON
{
    "detail": "No active account found with the given credentials"
}
```

## Status Codes

| Code                 | Description                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **200** OK           | Everything worked as expected.                                                                                                          |
| **400** Bad Request  | The server cannot process the request due to something the server considered to be a client error. Most likely invalid request message. |
| **401** Unauthorized | The request is unauthenticated.                                                                                                         |
