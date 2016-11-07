'use strict';

exports.getEffectiveRole = (userRoleList, roleFlowCongfig, originFlow) => {
  let effectiveRole;
  roleFlowCongfig.some(role => userRoleList.indexOf(role) > -1 && (effectiveRole = role));
  return {
    role: effectiveRole,
    index: originFlow.indexOf(effectiveRole)
  };
};
