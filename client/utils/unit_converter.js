//convert file sizes to number under 1024 and its unit

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const MAX_INDEX = UNITS.length;

module.exports = function unitConverter(num, unit, i) {
  if (isNaN(i)) {
    i = UNITS.indexOf(unit);
    if (i < 0) {
      i = 0;
    }
  }

  if (num >= 1024 && i < MAX_INDEX) {
    //when new number is less than 10(old sum is less than 1024 * 9.95), display one digit in the decimal
    let newNum = num < 10189 ? (Math.round(num / 1024 * 10).toFixed(1) / 10) : Math.round(num / 1024);
    return unitConverter(newNum, UNITS[i], i + 1);
  } else {
    return {
      num: num,
      unit: UNITS[i]
    };
  }
};
