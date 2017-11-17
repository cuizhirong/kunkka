function checkVolumeTotalLegality(data, totalType) {
  let legal;
  let total = 0;
  let volumeTypesArr = [];

  for(let i in data) {
    if(i.indexOf(totalType + '_') !== -1) {
      volumeTypesArr.push(data[i].total);
    }
  }

  for(let i = 0; i < volumeTypesArr.length; i++) {
    if(volumeTypesArr[i] === -1) {
      total = -1;
      break;
    } else {
      total += volumeTypesArr[i];
    }
  }

  if(data[totalType].total === -1) {
    legal = true;
  } else {
    if(total === -1) {
      legal = false;
    } else {
      legal = (data[totalType].total >= total) ? true : false;
    }
  }
  return legal;
}

module.exports = {
  checkVolumeTotalLegality: checkVolumeTotalLegality
};
