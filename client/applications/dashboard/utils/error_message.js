function getErrorMessage(error) {
  if (error) {
    var response = JSON.parse(error.responseText);
    var errorMessage = '';
    if (response) {
      if (response.badRequest) {
        errorMessage = response.badRequest.message;
      } else if (response.conflictingRequest) {
        errorMessage = response.conflictingRequest.message;
      } else if (response.NeutronError) {
        errorMessage = response.NeutronError.message;
      }
      return errorMessage;
    }
  }
  return null;
}

module.exports = getErrorMessage;
