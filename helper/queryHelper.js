const getQuery = (req) => {
  const {
    startDate,
    endDate,
    createdStartDate,
    createdEndDate,
    acknowledgedStartDate,
    acknowledgedEndDate,
    resolvedStartDate,
    resolvedEndDate,
    ...filters
  } = req;

  const query = {};

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (createdStartDate || createdEndDate) {
    query.createdAt = {};
    if (createdStartDate) query.createdAt.$gte = new Date(createdStartDate);
    if (createdEndDate) query.createdAt.$lte = new Date(createdEndDate);
  }

  if (acknowledgedStartDate || acknowledgedEndDate) {
    query.acknowledgeAt = {};
    if (acknowledgedStartDate)
      query.acknowledgeAt.$gte = new Date(acknowledgedStartDate);
    if (acknowledgedEndDate)
      query.acknowledgeAt.$lte = new Date(acknowledgedEndDate);
  }

  if (resolvedStartDate || resolvedEndDate) {
    query.resolvedAt = {};
    if (resolvedStartDate) query.resolvedAt.$gte = new Date(resolvedStartDate);
    if (resolvedEndDate) query.resolvedAt.$lte = new Date(resolvedEndDate);
  }

  const filterableFields = [
    "raiserName",
    "subject",
    "department",
    "premises",
    "location",
    "specificLocation",
    "details",
    "emergency",
    "status",
    "complaintID",
  ];

  filterableFields.forEach((field) => {
    if (filters[field] !== undefined && filters[field] !== "") {
      if (field === "emergency") {
        if (filters[field] === "true") {
          query[field] = true;
        } else {
          query[field] = false;
        }
      } else if (field === "status" || field === "department") {
        query[field] = filters[field];
      } else if (field === "complaintID") {
        const complaintID = Number(filters[field]);
        if (!isNaN(complaintID)) {
          query[field] = complaintID;
        }
      } else {
        query[field] = { $regex: filters[field], $options: "i" };
      }
    }
  });

  return query;
};

module.exports = getQuery;
