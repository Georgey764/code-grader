# Authentication API Documentation

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Endpoints](#endpoints)
  - [Summary](#endpoints-summary)
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

### Endpoints Summary

| Method | Endpoint | Description                              |
| ------ | -------- | ---------------------------------------- |
| POST   | /token/  | Retrieves the access and refresh tokens. |

### Getting An Access Token

- **Method**: POST
- **Path**: /token/
- **Auth Required**: No
- **Description**: Retrieves the access and refresh tokens when provided the user's credentials.

**NOTE**: Use the access token for any requests that requires user authentication.

#### Request Body

```JSON
{
    "email": "jane.doe@example.com",
    "password": "password123"
}
```

##### Request Body Fields

| Field    |  Type  | Required |       Role        | Description          |
| -------- | :----: | :------: | :---------------: | -------------------- |
| email    | string |   Yes    | Student + Faculty | User's email address |
| password | string |   Yes    | Student + Faculty | User's password      |

#### Responses

**200 OK**

```JSON
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3MzQ5OTI5MiwiaWF0IjoxNzcwOTA3MjkyLCJqdGkiOiIyOGRmMGM1OTg4NTI0MDFmYmE2ZmQxODRmMjNlYzYyNyIsInVzZXJfaWQiOiJhNmY0MjhhZS04YjNiLTQ0M2EtOTZhZC00ZDI5NWZhZTBiMjQiLCJyb2xlIjoiU1QiLCJjd2lkIjoiMTExMTExMTEifQ.z-S-BoHoKCv1_f4mtfDt5I_NrvwSP7ipkoXHr7oS1DU",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwOTE0NDkyLCJpYXQiOjE3NzA5MDcyOTIsImp0aSI6ImNlZjg5MWUxMDFmZjRjYjQ5YjUxZmM0YTEzMDFlM2MwIiwidXNlcl9pZCI6ImE2ZjQyOGFlLThiM2ItNDQzYS05NmFkLTRkMjk1ZmFlMGIyNCIsInJvbGUiOiJTVCIsImN3aWQiOiIxMTExMTExMSJ9._b5a5UnsVoByK3qDU8_khkWXpew8manTp1fpBZks5Kw"
}
```

**401 Unauthorized** (Authentication Error)

```JSON
{
    "detail": "No active account found with the given credentials"
}
```

| Code                          | Description                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **200** OK                    | Everything worked as expected.                                                                |
| **401** Unauthorized          | The request is unauthenticated.                                                               |
| **404** Not Found             | The server cannot find the requested resource.                                                |
| **500** Internal Server Error | The server encountered an unexpected condition that prevented it from fulfilling the request. |
