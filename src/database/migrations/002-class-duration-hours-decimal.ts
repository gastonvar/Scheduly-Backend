import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator.js';

export const up: Migration['up'] = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn('classes', 'duration_hours', {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
  });
};

export const down: Migration['down'] = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn('classes', 'duration_hours', {
    type: DataTypes.INTEGER,
    allowNull: false,
  });
};
