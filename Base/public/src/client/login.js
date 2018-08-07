'use strict';

define('forum/login', [], function () {
	var ssoUrl = atob(decodeURIComponent(window.cookie("sso_url")));
	window.location.replace(ssoUrl + "?redirect=" + window.location.origin);
});
