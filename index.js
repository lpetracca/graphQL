const express = require('express');
const app = express();
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt
} = require('graphql');

const _ = require('lodash');
const students = require('./students.json');
const courses = require('./course.json');
const grades = require('./grade.json');

const CourseType = new GraphQLObjectType({
    name: 'Course',
    description: 'Course data',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLNonNull(GraphQLString) },
        
        student: {
            type: StudentType,
            resolve: (course) => {
                return students.find( student => student.courseId === course.id )
            }
        },

        grade: {
            type: GradeType,
            resolve: (course) => {
                return grades.find( grade => grade.courseId === course.id )
            }
        }
    })
})

const StudentType = new GraphQLObjectType({
    name: 'Student',
    description: 'Student data',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        
        course: {
            type: CourseType,
            resolve: (student) => {
                return courses.find( course => course.id === student.courseId )    
            }
        },

        grade: {
            type: GradeType,
            resolve: (student) => {
                return grades.find( grade=> grade.studentId === student.id )
            }
        }

    })
})

const GradeType = new GraphQLObjectType({
    name: 'Grades',
    description: 'Student grades',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        courseId: { type: GraphQLNonNull(GraphQLInt) },
        studentId: { type: GraphQLNonNull(GraphQLInt) },
        grade: { type: GraphQLNonNull(GraphQLInt) }
    })
})



const RootQueryType = new GraphQLObjectType({

    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        
        courses: {
            type: new GraphQLList(CourseType),
            description: 'List all courses',
            resolve: ()=> courses
        },
        
        students: {
            type: new GraphQLList(StudentType),
            description: 'List all students',
            resolve: ()=> students
        },      

        grades: {
            type: new GraphQLList(GradeType),
            description: 'List all grades',
            resolve: ()=> grades
        },
        
        course: {
            type: CourseType,
            description: 'Course by id',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => courses.find(course => course.id === args.id)
        },

        student: {
            type: StudentType,
            description: 'Student by id',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => students.find(student => student.id === args.id)
        },

        grade: {
            type: GradeType,
            description: 'Grades by id',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => grades.find(grade => grade.id === args.id)
        },

    }), 
});


const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        
        addCourse: {
            type: CourseType,
            description: 'Add a course',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const course = {
                    id: courses.length +1,
                    name: args.name,
                    description: args.description
                }
                courses.push(course)
                return course
            }
        },
        
        addStudent: {
            type: StudentType,
            description: 'Add a student',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                lastname: { type: GraphQLNonNull(GraphQLString) },
                courseId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const student = {
                    id: students.length +1,
                    name: args.name,
                    lastname: args.lastname,
                    courseId: args.courseId
                }
                students.push(student)
                return student
            }
        },

        addGrade: {
            type: GradeType,
            description: 'Add a grade',
            args: {
                courseId: { type: GraphQLNonNull(GraphQLInt) },
                studentId: { type: GraphQLNonNull(GraphQLInt) },
                grade: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const grade = {
                    id: grades.length + 1,
                    courseId: args.courseId,
                    studentId: args.studentId,
                    grade: args.grade
                }
                grades.push(grade)
                return grade

            }
        },


        deleteCourse: {
            type: new GraphQLList(CourseType),
            description: 'Delete a Course',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },              
            },                
            resolve: (parents, args) => {
                _.remove(courses, course => args.id === course.id)
                return courses;
            },
        },

        deleteStudent: {
            type: new GraphQLList(StudentType),
            description: 'Delete a Student',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                _.remove(students, student => args.id === student.id)
                return students;
            },
        },
        
        deleteGrade: {
            type: new GraphQLList(GradeType),
            description: 'Delete a Grade',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parents, args) => {
                _.remove(grades, grade => args.id === grade.id)
                return grades;
            },
        }




    })
})


const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
});

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(3000, () => {
    console.log('server running');
});