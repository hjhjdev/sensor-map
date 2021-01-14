module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('users', [{
      userName: 'admin',
      password: '$2b$10$9U3quodbMItQprIhXPDI0uyPCbQPR/8pWUZhnzYsHj4id.3qu5UBu',
      name: '관리자',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});

    await queryInterface.bulkInsert('sensors', [{
      sensorId: 1,
      name: '온도',
      isAnalog: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});

    await queryInterface.bulkInsert('sensors', [{
      sensorId: 2,
      name: '습도',
      isAnalog: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
