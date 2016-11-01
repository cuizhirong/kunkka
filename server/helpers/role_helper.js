'use strict';

exports.getEffectiveRole = (userRoleList, roleFlowCongfig) => {
  let effectiveRole;
  roleFlowCongfig.some(role => userRoleList.indexOf(role) > -1 && (effectiveRole = role));
  return {
    role: effectiveRole,
    index: roleFlowCongfig.indexOf(effectiveRole)
  };
};
