window.app.handleInvalidSession = function () {
	window.app.flags = app.flags || {};
	window.app.flags._sessionRefresh = true;
	window.location.replace(window.location.origin);
};

function cookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length === 2) return parts.pop().split(";").shift();
}

var ssoUrl = atob(decodeURIComponent(cookie("sso_url")));

$(window).on('action:ajaxify.end', function (data) {
	var page = data.target.ajaxify.currentPage;
	if (page === "login" || page === "register") {
		window.location.replace(ssoUrl + "?redirect=" + window.location.origin);
	}
});




