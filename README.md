# Maps

create user, cities and Location Table

**User Table**

| Column    | Type    |
| --------  | ------- |
| id        | INTEGER |
| name      | TEXT    |
| username  | TEXT    |
| password  | TEXT    |
| gender    | TEXT    |

**Category Table**

| Column              | Type    |
| ------------------- | ------- |
| category_id         | INTEGER |
| category_name       | TEXT    |
| item_count          | INTEGER |
| categ0ry_image      | TEXT    |


<Section id="section1>

### API 1

### Path: `api/regitser/`

#### Method: `POST`

```
{
  "username":"ammu_aditya",
  "password":"Invincible@303"
  "name: "Aditya",
  "gender: "Male"
}
```

**Scenario 1**

  - **Description**:

    If the user doesn't have an account

  - **Response**

  **Response**
    - **Status code**
      ```
      200
      ```
    - **Body**
      ```
      User created successfully
      ```

**Scenario 2**

  - **Description**:

    If the user provides an existing name

  - **Response**
    - **Status code**

<Section id="section1">

### API 2

#### Path: `api/login/`

#### Method: `POST`

**Request**
- **Status code**
      ```
      $00
      ```
    - **Body**
      ```
      User already exists
      ```

```
{
  "username":"ammu_aditya",
  "password":"Invincible@303"
}
```

- **Scenario 1**

  - **Description**:

    If the user doesn't have an account

  - **Response**
    - **Status code**
      ```
      400
      ```
    - **Body**
      ```
      Invalid user
      ```

- **Scenario 2**

  - **Description**:

    If the user provides an incorrect password

  - **Response**
    - **Status code**
      ```
      400
      ```
    - **Body**
      ```
      Invalid password
      ```

- **Scenario 3**

  - **Description**:

    Successful login of the user

  - **Response**

    Return the JWT Token

    ```
    {
      "jwtToken": "ak2284ns8Di32......"
    }
    ```

</Section>

### Authentication with JWT Token

Write a middleware to authenticate the JWT token.

- **Scenario 1**

  - **Description**:

    If the JWT token is not provided by the user or an invalid JWT token is provided

  - **Response**
    - **Status code**
      ```
      401
      ```
    - **Body**
      ```
      Invalid JWT Token
      ```

- **Scenario 2**
  - After successful verification of JWT token, proceed to next middleware or handler

</Section>

<Section id="section3">

### API 5

#### Path: `/api/categories/`

#### Method: `GET`

#### Description:

Returns the list of all categories

#### Response

```
[
  {
    "category_id": 1,
    "category_name": "Mens Clothes",
    "item_count": 25,
    "category_image: ""
  },
  ...
]
```

</Section>

<Section id="section3">

### API 5

#### Path: `/api/categories`

#### Method: `POST`

#### Description:

Add new categories

#### Response

- **Description**:

    if added new category
  **Resposne**
    category added successfully

</Section>

### Packages Used
    express - to cerate Restful API's, handle routing and to manage middleware function
    sqlite - to interact with sqlite Database
    sqlite3 - to interact with sqlite Database through command line
    bcrypt - to hash and compare the passwords
    jsonwebtoken - to provide auhencation token
    uuid - to get uniqueId's for different users
    dotenv - to configure and listen to server

Use `npm install` to install the packages.

**,Export the express instance using the default export syntax.**

**Use Common JS module syntax.**