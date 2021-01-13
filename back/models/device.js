module.exports = (sequelize, Sequelize) => {
  const Device = sequelize.define('device', {
    deviceId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(12),
      allowNull: false,
      unique: true,
    },
    macAddress: {
      type: Sequelize.STRING(12),
      allowNull: false,
      unique: true,
    },
    companyName: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    chargeName: {
      type: Sequelize.STRING(20),
      allowNull: false,
    },
    chargePhone: {
      type: Sequelize.STRING(11),
      allowNull: false,
    },
    latitude: {
      type: Sequelize.DECIMAL(17, 14),
      allowNull: false,
    },
    longitude: {
      type: Sequelize.DECIMAL(17, 14),
      allowNull: false,
    },
    measureMode: {
      type: Sequelize.STRING(2),
      allowNull: false,
    },
    analogNormal: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    analogWarning: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    analogDanger: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    analogOutlier: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });

  return Device;
};
