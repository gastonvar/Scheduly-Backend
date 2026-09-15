import type { Optional } from 'sequelize';
import { DataTypes, Model, type Sequelize } from 'sequelize';

export type StudentAttributes = {
  id: string;
  name: string;
  referredById: string | null;
  discountPercent: number;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentCreationAttributes = Optional<
  StudentAttributes,
  'id' | 'referredById' | 'discountPercent' | 'createdAt' | 'updatedAt'
>;

export class Student extends Model<StudentAttributes, StudentCreationAttributes> {
  declare id: string;
  declare name: string;
  declare referredById: string | null;
  declare discountPercent: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initStudentModel(sequelize: Sequelize): typeof Student {
  Student.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      referredById: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      discountPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: 'students',
    },
  );

  return Student;
}
