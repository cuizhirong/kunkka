const download = require('client/utils/download');

module.exports = {
  export: function(data) {
    let url = `/proxy-shadowfiend/v1/downloads/orders?output_format=${data.format}&project_id=${HALO.user.projectId}`;
    if(data.startTime && data.endTime) {
      url += `&start_time=${data.startTime}&end_time=${data.endTime}`;
    }
    return download(url);
  }
};
