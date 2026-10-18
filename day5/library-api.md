# Library API Design: Books

This is a REST API design for a library's **books** resource. All requests and responses use JSON.

Each book has:

- `id` (number) - created by the server
- `title` (text)
- `author` (text)
- `year` (number) - the year the book was published
- `genre` (text)

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns an array of all the books in the library.
- **Request body:** none
- **Success status:** 200 OK

### 2. Get one book

- **Method:** GET
- **Path:** `/books/:id` (for example `/books/3`)
- **Description:** Returns the single book with that id.
- **Request body:** none
- **Success status:** 200 OK

### 3. Create a book

- Method: POST
- Path: `/books`
- Description: Adds a new book to the library.

- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958,
  "genre": "Fiction"
}
```

- 201 Created (the response contains the new book with its `id`) -This shows that it was a success

### 4. Update a book

- Method: PUT
- Path: `/books/:id` (for example `/books/3`)
- Description: Replaces the details of the book with that id.

- **Example request body:**

```json
{
  "title": "The River Between",
  "author": "Ngugi wa Thiong'o",
  "year": 1965,
  "genre": "Fiction"
}
```

- Success: 200 OK (the response contains the updated book)

### 5. Delete a book

- Method: DELETE
- Path:`/books/:id` (for example `/books/3`)
- Description: Removes the book with that id from the library.
- Request body: none

- Success status: 200 OK

### 6. List books by an author

- Method: GET
- Path: `/books?author=Chinua Achebe`
- Description: Returns only the books written by that author, using the `author` query parameter.
- Request body: none
- Success: 200 OK (an empty array `[]` if the author has no books)

## Error codes

### 400 Bad Request

- Meaning: the request data is missing or not valid, so the server cannot use it.
- Example: sending `POST /books` without a `title`, or with `"year": "last year"` instead of a number.

### 404 Not Found

- Meaning: the thing asked for does not exist.
- Example: sending `GET /books/999` when there is no book with id 999.
