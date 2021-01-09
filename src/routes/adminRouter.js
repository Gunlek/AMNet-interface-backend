let express = require('express');
const { AdminHome } = require('../admin/adminHome');
const { AdminInternet } = require('../admin/internet/adminInternet');
const { AdminInternetAllowAccess } = require('../admin/internet/adminInternetAllowAccess');
const { AdminInternetDeleteAccess } = require('../admin/internet/adminInternetDeleteAccess');
const { AdminInternetDisallowAccess } = require('../admin/internet/adminInternetDisallowAccess');
const { AdminMaterial } = require('../admin/material/adminMaterial');
const { AdminMaterialAllowRequest } = require('../admin/material/adminMaterialAllowRequest');
const { AdminMaterialDeleteRequest } = require('../admin/material/adminMaterialDeleteRequest');
const { AdminMaterialDisallowRequest } = require('../admin/material/adminMaterialDisallowRequest');
const { AdminSettings } = require('../admin/settings/adminSettings');
const { AdminSettingsNewApiKey } = require('../admin/settings/adminSettingsNewApiKey');
const { AdminSettingsUpdateNewsMessage } = require('../admin/settings/adminSettingsUpdateNewsMessage');
const { AdminSettingsUpdateSettings } = require('../admin/settings/adminSettingsUpdateSettings');
const { AdminUserDeleteUser } = require('../admin/users/adminUserDeleteUser');
const { AdminUserListUsers } = require('../admin/users/adminUserListUsers');
const { AdminUserProfile } = require('../admin/users/adminUserProfile');
const { AdminUserUpdateGlobalPayStatus } = require('../admin/users/adminUserUpdateGlobalPayStatus');
const { AdminUserUpdateUserPayStatus } = require('../admin/users/adminUserUpdateUserPayStatus');
const { AdminUserGrant } = require('../admin/users/adminUserGrant');
const { AdminEnableGuestAccess } = require('../admin/settings/adminEnableGuestAccess');
const { AdminDisableGuestAccess } = require('../admin/settings/adminDisableGuestAccess');

const { isUserAdmin } = require('../utils/isUserAdmin');
const { isUserLoggedIn } = require('../utils/isUserLoggedIn');

let adminRouter = express.Router();

// Ensure user is logged-in and admin
adminRouter.use(isUserLoggedIn);
adminRouter.use(isUserAdmin);

adminRouter.get('/', AdminHome)

// Internet
adminRouter.get('/internet', AdminInternet);
adminRouter.get('/internet/allow/:access_id', AdminInternetAllowAccess);
adminRouter.get('/internet/delete/:access_id', AdminInternetDeleteAccess);
adminRouter.get('/internet/disallow/:access_id', AdminInternetDisallowAccess);

// Material
adminRouter.get('/material', AdminMaterial);
adminRouter.get('/material/allow/:material_id', AdminMaterialAllowRequest);
adminRouter.get('/material/delete/:material_id', AdminMaterialDeleteRequest);
adminRouter.get('/material/disallow/:material_id', AdminMaterialDisallowRequest);

// Settings
adminRouter.get('/settings', AdminSettings);
adminRouter.post('/settings/new-api-key/', AdminSettingsNewApiKey);
adminRouter.post('/update-news-message/', AdminSettingsUpdateNewsMessage);
adminRouter.post('/update-settings/', AdminSettingsUpdateSettings);
adminRouter.get('/settings/enable-guest-access/', AdminEnableGuestAccess);
adminRouter.get('/settings/disable-guest-access/', AdminDisableGuestAccess);

// Users
adminRouter.get('/users/', AdminUserListUsers);
adminRouter.get('/users/delete-user/:user_id', AdminUserDeleteUser);
adminRouter.get('/users/update-pay-status/:user_id/:status', AdminUserUpdateUserPayStatus);
adminRouter.get('/users/udate-all-pay-status/:status', AdminUserUpdateGlobalPayStatus);
adminRouter.get('/users/profile/:user_id', AdminUserProfile);
adminRouter.get('/users/grant-user/:user_id/:user_rank', AdminUserGrant);

module.exports = adminRouter;




