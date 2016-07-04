'use strict';

module.exports = (roles, roleConfig) => {
  if (!Array.isArray(roles)) {
    return false;
  }
  let roleList = Object.keys(roleConfig).reverse();
  let roleListLength = roleList.length;
  let roleIndex = -1;

  roleList.some(function (role) {
    roleIndex = roles.indexOf(role);
    return roleIndex > -1;
  });

  if (roleIndex < 0) {
    return false;
  }
  return {
    showSelf: roleList.indexOf(roles[roleIndex]) === 0 ? false : true,
    showOthers: roleList.indexOf(roles[roleIndex]) === roleListLength - 1 ? false : true
  };
};
