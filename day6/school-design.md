# School Database Design

## Tables

### students

- Stores one row for each student.
- Columns: `id` (primary key), `name` (required) and `email` (required and **unique**, so two students cannot share an email).

### courses

- Each row stores a course as offered by the school.
- Columns: `id` (primary key), `title` (required) and `teacher` (required).

### enrolments

- Stores one row each time a student is enrolled on a course, together with the grade for that course, and the teacher.
- Columns: `id` (primary key), `student_id` (foreign key to `students`), `course_id` (foreign key to `courses`) and `grade` (can be empty until the grade is given).
- The rule `UNIQUE (student_id, course_id)` stops the same student being enrolled on the same course twice.

## Relationships

- **students to enrolments is one-to-many:** one student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses to enrolments is one-to-many:** one course can have many enrolments, but each enrolment is for exactly one course.
- **students to courses is many-to-many:** one student can take many courses, and one course can have many students.

### Why a join table is needed

A single column cannot hold a list of values. If we put a `course_id` column in `students`, each student could only take one course. If we put a `student_id` column in `courses`, each course could only have one student. The `enrolments` table solves this: each row joins one student to one course, so we can add as many rows as we need. It is also the natural place to store the **grade**, because a grade belongs to a student _on a particular course_, not to the student or the course alone.

## One index I would add

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);
```

- **Reason:** the queries "all students on one course" and "number of students per course" look up enrolments by `course_id`. Without an index, the database has to read every row in `enrolments` to find the matching ones. With the index, it can jump straight to the rows for that course, which matters as the school grows to thousands of enrolments.
- The `UNIQUE (student_id, course_id)` rule already creates an index that starts with `student_id`, so lookups by student are already fast. Lookups by course are not, which is why this index is the useful one to add.

## SQL or NoSQL?

I would choose **SQL** for this system. The data has a clear, fixed structure (every student has a name and email, every course has a title and teacher), and the most important thing about it is the **relationships** between students and courses.foreign keys stop an enrolment from pointing to a student or course that does not exist, `UNIQUE` stops duplicate emails and duplicate enrolments, and `JOIN` and `GROUP BY` answer questions like "which students are on this course" and "how many students per course" directly. Transactions also keep grade updates safe. A NoSQL document database is too manual and prone to mistakes.
