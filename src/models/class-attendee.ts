import { DataTypes, Model, type Sequelize } from 'sequelize';

export type ClassAttendeeAttributes = {
  classId: string;
  studentId: string;
};

export class ClassAttendee extends Model<ClassAttendeeAttributes, ClassAttendeeAttributes> {
  declare classId: string;
  declare studentId: string;
}

export function initClassAttendeeModel(sequelize: Sequelize): typeof ClassAttendee {
  ClassAttendee.init(
    {
      classId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: 'class_attendees',
      timestamps: false,
    },
  );

  return ClassAttendee;
}
