import { sequelize } from '../database/sequelize.js';
import { ClassAttendee, initClassAttendeeModel } from './class-attendee.js';
import { ClassSession, initClassSessionModel } from './class-session.js';
import { Session, initSessionModel } from './session.js';
import { Student, initStudentModel } from './student.js';
import { StudentContact, initStudentContactModel } from './student-contact.js';
import { Subject, initSubjectModel } from './subject.js';
import { User, initUserModel } from './user.js';

let initialized = false;

export function initModels(): void {
  if (initialized) {
    return;
  }

  initUserModel(sequelize);
  initSessionModel(sequelize);
  initStudentModel(sequelize);
  initStudentContactModel(sequelize);
  initSubjectModel(sequelize);
  initClassSessionModel(sequelize);
  initClassAttendeeModel(sequelize);

  User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
  Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Student.belongsTo(Student, { foreignKey: 'referredById', as: 'referrer' });
  Student.hasMany(Student, { foreignKey: 'referredById', as: 'referredStudents' });

  Student.hasMany(StudentContact, { foreignKey: 'studentId', as: 'contacts' });
  StudentContact.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

  Subject.hasMany(ClassSession, { foreignKey: 'subjectId', as: 'classes' });
  ClassSession.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

  ClassSession.hasMany(ClassAttendee, { foreignKey: 'classId', as: 'attendees' });
  ClassAttendee.belongsTo(ClassSession, { foreignKey: 'classId', as: 'classSession' });

  Student.hasMany(ClassAttendee, { foreignKey: 'studentId', as: 'classAttendances' });
  ClassAttendee.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

  ClassSession.belongsToMany(Student, {
    through: ClassAttendee,
    foreignKey: 'classId',
    otherKey: 'studentId',
    as: 'attendeeStudents',
  });
  Student.belongsToMany(ClassSession, {
    through: ClassAttendee,
    foreignKey: 'studentId',
    otherKey: 'classId',
    as: 'attendedClasses',
  });

  initialized = true;
}

export {
  ClassAttendee,
  ClassSession,
  Session,
  Student,
  StudentContact,
  Subject,
  User,
};
