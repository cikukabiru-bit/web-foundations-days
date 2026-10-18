-- Make SQLite check the foreign keys
PRAGMA foreign_keys = ON;

-- Start fresh if the tables already exist
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

-- 1. Create the tables


CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  teacher TEXT NOT NULL
);

CREATE TABLE enrolments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE (student_id, course_id)
);


-- 2. Insert sample data


INSERT INTO students (name, email) VALUES
  ('Wanjiku Kamau', 'wanjiku.kamau@school.ac.ke'),
  ('Otieno Odhiambo', 'otieno.odhiambo@school.ac.ke'),
  ('Achieng Atieno', 'achieng.atieno@school.ac.ke'),
  ('Kiprono Kiptoo', 'kiprono.kiptoo@school.ac.ke');

INSERT INTO courses (title, teacher) VALUES
  ('Web Development', 'Mr. Mwangi'),
  ('Data Analysis', 'Ms. Njeri'),
  ('System Design', 'Dr. Mutua');

-- Kiprono Kiptoo (id 4) has no enrolments on purpose
INSERT INTO enrolments (student_id, course_id, grade) VALUES
  (1, 1, 'A'),
  (1, 2, 'B'),
  (2, 1, 'B'),
  (2, 3, NULL),
  (3, 2, 'A'),
  (3, 3, 'C');


-- 3. Queries


-- Query 1: all courses for one student (by name)
SELECT courses.title, courses.teacher, enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE students.name = 'Wanjiku Kamau';

-- Query 2: all students on one course
SELECT students.name, students.email, enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE courses.title = 'Web Development';

-- Query 3: the number of students per course
SELECT courses.title, COUNT(enrolments.id) AS number_of_students
FROM courses
LEFT JOIN enrolments ON enrolments.course_id = courses.id
GROUP BY courses.id, courses.title;

-- Query 4: students who have no enrolments
SELECT students.name, students.email
FROM students
LEFT JOIN enrolments ON enrolments.student_id = students.id
WHERE enrolments.id IS NULL;

-- Query 5: update one enrolment's grade
-- (eg. Otieno Odhiambo on System Design gets his grade)
UPDATE enrolments
SET grade = 'B'
WHERE student_id = 2 AND course_id = 3;

SELECT students.name, courses.title, enrolments.grade
FROM enrolments
JOIN students ON enrolments.student_id = students.id
JOIN courses ON enrolments.course_id = courses.id
WHERE students.name = 'Otieno Odhiambo';