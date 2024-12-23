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
  
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
  
    // Filter by createdAt range
    if (createdStartDate || createdEndDate) {
      query.createdAt = {};
      if (createdStartDate) query.createdAt.$gte = new Date(createdStartDate);
      if (createdEndDate) query.createdAt.$lte = new Date(createdEndDate);
    }
  
    // Filter by acknowledgeAt range
    if (acknowledgedStartDate || acknowledgedEndDate) {
      query.acknowledgeAt = {};
      if (acknowledgedStartDate) query.acknowledgeAt.$gte = new Date(acknowledgedStartDate);
      if (acknowledgedEndDate) query.acknowledgeAt.$lte = new Date(acknowledgedEndDate);
    }
  
    // Filter by resolvedAt range
    if (resolvedStartDate || resolvedEndDate) {
      query.resolvedAt = {};
      if (resolvedStartDate) query.resolvedAt.$gte = new Date(resolvedStartDate);
      if (resolvedEndDate) query.resolvedAt.$lte = new Date(resolvedEndDate);
    }
  
    // Add filters for other attributes (including details but excluding remarks and media)
    const filterableFields = [
      'raiserName',
      'subject',
      'department',
      'premises',
      'location',
      'details',
      'emergency',
      'status',
    ];
  
    filterableFields.forEach((field) => {
      if (filters[field] !== undefined && filters[field] !== '') {
        // Special handling for boolean fields like `emergency`
        if (field === 'emergency') {
          query[field] = filters[field] === 'true' ? true : filters[field] === 'false' ? false : null;
        } else if (field === 'status' || field === 'department' || field === 'premises') {
          // Treat status as an exact match field, not regex
          query[field] = filters[field];
        } else {
          // For string fields (except 'status'), use regex for partial matching
          if (typeof filters[field] === 'string') {
            query[field] = { $regex: filters[field], $options: 'i' };  // 'i' for case-insensitive matching
          } else {
            query[field] = filters[field];
          }
        }
      }
    });
  
    return query;
}
  
module.exports = getQuery;
  