module.exports = (sequelize, Sequelize) => {
  const Log = sequelize.define('log', {
    logId: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    value: {
      type: Sequelize.DECIMAL(15, 5),
      allowNull: false
    },
    measureMode: {
      type: Sequelize.STRING(2),
      allowNull: false
    },
    measureModeWarnLevel: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    measureModeValue: {
      type: Sequelize.DECIMAL(15, 5),
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      unique: 'single_log'
    },
    deviceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'single_log'
    },
    sensorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: 'single_log'
    }
  },
  {
    indexes: [
      {
        fields: [ 'sensorId', 'deviceId', 'createdAt' ]
      }
    ]
  });
  
  return Log;
};
