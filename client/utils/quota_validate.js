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

function quotaValidate(quota, __) {
  const result = {
    status: 'pass',
    errorMessage: ''
  };

  for(let item in quota) {
    let resource = quota[item];
    if(resource.total !== -1 && resource.total < resource.used) {
      result.status = 'fail';
      let msgPrefix = '';

      switch(item) {
        case 'instances':
          msgPrefix = __.instance;
          break;
        case 'key_pairs':
          msgPrefix = __.keypair;
          break;
        case 'cores':
          msgPrefix = __.cpu;
          break;
        case 'volumes':
          msgPrefix = __.all_volumes;
          break;
        case 'gigabytes':
          msgPrefix = __.all_gigabytes;
          break;
        default:
          msgPrefix = __[item];
      }

      result.errorMessage = msgPrefix + __.quota_total_less_than_used;
      return result;
    }
  }

  let totalLegal = checkVolumeTotalLegality(quota, 'volumes');

  if(!totalLegal) {
    result.status = 'fail';
    result.errorMessage = __.volumes_small_than_total;
    return result;
  }

  let totalGigaLegal = checkVolumeTotalLegality(quota, 'gigabytes');

  if(!totalGigaLegal) {
    result.status = 'fail';
    result.errorMessage = __.gigabytes_small_than_total;
    return result;
  }

  return result;
}

module.exports = {
  checkVolumeTotalLegality: checkVolumeTotalLegality,
  quotaValidate: quotaValidate
};
