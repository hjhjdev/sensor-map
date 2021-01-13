module.exports = (sequelize, Sequelize) => {
  const Role = sequelize.define('role', {
    roleId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique:"single_role"
    },
    deviceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique:"single_role"
    }
  });

  return Role;
};
