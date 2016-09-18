function getErrorMessage(error, isSubmit) {
  var response = JSON.parse(error.responseText);
  var errorMessage = '';
  if (error && !isSubmit) {
    if (response) {
      if (response.message) {
        errorMessage = response.message;
      } else if (response.error) {
        errorMessage = response.error;
      } else {
        let reg = new RegExp('"message":"(.*)","');
        let message = reg.exec(error.response);
        if (message && message[1]) {
          errorMessage = message[1];
        } else {
          errorMessage = 'There is an error occured!';
        }
      }
      return errorMessage;
    }
  } else if(error && isSubmit) {
    if(response) {
      errorMessage = response;
    }
    return errorMessage;
  }
  return null;
}

module.exports = getErrorMessage;
