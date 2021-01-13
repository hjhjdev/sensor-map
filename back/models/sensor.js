module.exports = (sequelize, Sequelize) => {
  const Sensor = sequelize.define('sensor', {
    sensorId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true
    },
    isAnalog: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
  });

  return Sensor;
};
