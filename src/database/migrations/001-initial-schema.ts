import { DataTypes } from 'sequelize';
import type { Migration } from '../migrator.js';

export const up: Migration['up'] = async ({ context: queryInterface }) => {
  await queryInterface.createTable('users', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('sessions', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('students', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    referred_by_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    discount_percent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('student_contacts', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    type: { type: DataTypes.STRING(32), allowNull: false },
    value: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('subjects', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    price_per_hour: { type: DataTypes.INTEGER, allowNull: false },
    color: { type: DataTypes.STRING(64), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('classes', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    duration_hours: { type: DataTypes.INTEGER, allowNull: false },
    subject_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'subjects', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    payment_status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'unpaid' },
    base_price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    surcharge_percent: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    final_price: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  });

  await queryInterface.createTable('class_attendees', {
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'classes', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  });

  await queryInterface.addIndex('sessions', ['user_id'], { name: 'sessions_user_id_idx' });
  await queryInterface.addIndex('sessions', ['expires_at'], { name: 'sessions_expires_at_idx' });
  await queryInterface.addIndex('students', ['name'], { name: 'students_name_idx' });
  await queryInterface.addIndex('students', ['referred_by_id'], { name: 'students_referred_by_id_idx' });
  await queryInterface.addIndex('student_contacts', ['student_id'], {
    name: 'student_contacts_student_id_idx',
  });
  await queryInterface.addIndex('subjects', ['name'], { name: 'subjects_name_idx' });
  await queryInterface.addIndex('classes', ['date'], { name: 'classes_date_idx' });
  await queryInterface.addIndex('classes', ['subject_id'], { name: 'classes_subject_id_idx' });
  await queryInterface.addIndex('classes', ['payment_status'], { name: 'classes_payment_status_idx' });
  await queryInterface.addIndex('class_attendees', ['student_id'], {
    name: 'class_attendees_student_id_idx',
  });
};

export const down: Migration['down'] = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('class_attendees');
  await queryInterface.dropTable('classes');
  await queryInterface.dropTable('student_contacts');
  await queryInterface.dropTable('students');
  await queryInterface.dropTable('subjects');
  await queryInterface.dropTable('sessions');
  await queryInterface.dropTable('users');
};
