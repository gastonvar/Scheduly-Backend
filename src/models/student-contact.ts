import type { Optional } from 'sequelize';
import { DataTypes, Model, type Sequelize } from 'sequelize';
import type { ContactType } from '../shared/constants.js';

export type StudentContactAttributes = {
  id: string;
  studentId: string;
  type: ContactType;
  value: string;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentContactCreationAttributes = Optional<
  StudentContactAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class StudentContact extends Model<StudentContactAttributes, StudentContactCreationAttributes> {
  declare id: string;
  declare studentId: string;
  declare type: ContactType;
  declare value: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initStudentContactModel(sequelize: Sequelize): typeof StudentContact {
  StudentContact.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: 'student_contacts',
    },
  );

  return StudentContact;
}
