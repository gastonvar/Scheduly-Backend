import type { Optional } from 'sequelize';
import { DataTypes, Model, type Sequelize } from 'sequelize';

export type SubjectAttributes = {
  id: string;
  name: string;
  pricePerHour: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubjectCreationAttributes = Optional<
  SubjectAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class Subject extends Model<SubjectAttributes, SubjectCreationAttributes> {
  declare id: string;
  declare name: string;
  declare pricePerHour: number;
  declare color: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initSubjectModel(sequelize: Sequelize): typeof Subject {
  Subject.init(
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
      pricePerHour: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: 'subjects',
    },
  );

  return Subject;
}
