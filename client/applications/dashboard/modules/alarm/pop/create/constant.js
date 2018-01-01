const hour = Number(HALO.configs.telemerty.hour),
  day = Number(HALO.configs.telemerty.day),
  week = Number(HALO.configs.telemerty.week),
  month = Number(HALO.configs.telemerty.month),
  year = Number(HALO.configs.telemerty.year);
const constant = {

  RECENT_HOUR: 3,
  RECENT_DAY: 1,
  RECENT_WEEK: 1,
  RECENT_MONTH: 1,
  RECENT_YEAR: 1,

  GRANULARITY_HOUR: hour,
  GRANULARITY_DAY: day,
  GRANULARITY_WEEK: week,
  GRANULARITY_MONTH: month,
  GRANULARITY_YEAR: year

};

module.exports = constant;
