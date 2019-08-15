const yup = require("yup");

module.exports = TripService => async (userID, tripID) => {
  const args = await validate({ userID, tripID });
  const resultSet = await TripService.findWhere({
    createdBy: args.userID,
    id: args.tripID
  });
  if (resultSet.length === 0) {
    const e = new Error("Record not found");
    e.code = "ER_NOT_FOUND";
    throw e;
  }

  if (resultSet.length > 1) {
    const e = new Error("Record not unique");
    e.code = "ER_NOT_UNIQUE";
    throw e;
  }

  return {
    ...resultSet[0],
    dateTimeStart: Date.parse(resultSet[0].dateTimeStart)
  };
};

async function validate(data) {
  try {
    return await tripOfDoneeSchema.validate(data, {
      stripUnknown: true
    });
  } catch (e) {
    e.code = "BAD_ARGS";
    throw e;
  }
}

const tripOfDoneeSchema = yup.object().shape({
  userID: yup
    .number()
    .integer()
    .required(),
  tripID: yup
    .number()
    .integer()
    .required()
});
