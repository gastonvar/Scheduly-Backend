import type { Optional } from 'sequelize';
import { DataTypes, Model, type Sequelize } from 'sequelize';
import type { ClassPaymentStatus } from '../shared/constants.js';

export type ClassSessionAttributes = {
  id: string;
  date: Date;
  durationHours: number;
  subjectId: string;
  paymentStatus: ClassPaymentStatus;
  basePrice: number;
  surchargePercent: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ClassSessionCreationAttributes = Optional<
  ClassSessionAttributes,
  'id' | 'paymentStatus' | 'basePrice' | 'surchargePercent' | 'finalPrice' | 'createdAt' | 'updatedAt'
>;

export class ClassSession extends Model<ClassSessionAttributes, ClassSessionCreationAttributes> {
  declare id: string;
  declare date: Date;
  declare durationHours: number;
  declare subjectId: string;
  declare paymentStatus: ClassPaymentStatus;
  declare basePrice: number;
  declare surchargePercent: number;
  declare finalPrice: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initClassSessionModel(sequelize: Sequelize): typeof ClassSession {
  ClassSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      durationHours: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subjectId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      basePrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      surchargePercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      finalPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    {
      sequelize,
      tableName: 'classes',
    },
  );

  return ClassSession;
}
