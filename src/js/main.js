var emailIcon = document.getElementById("email-icon");
var menuIcon = document.getElementById("nav-menu");

// Toggle the "menu-open" classes
function toggle() {
	  var nav = document.getElementById("nav");
	  var button = document.getElementById("menu");
	  var site = document.getElementById("wrap");

	  if (nav.className == "menu-open") {
	  	  nav.className = "";
	  	  button.className = "";
	  	  site.className = "";
	  } else {
	  	  nav.className += "menu-open";
	  	  button.className += "btn-close";
	  	  site.className += "fixed";
	    }
	}

// Ensures backward compatibility with IE old versions
function addMenuClick() {
	if (document.addEventListener && menuIcon !== null) {
		menuIcon.addEventListener('click', toggle);
	} else if (document.attachEvent && menuIcon !== null) {
		menuIcon.attachEvent('onclick', toggle);
	} else {
		return;
	}
}

// Sorry about this, this is creates and opens a mailto link of my email address
function iHateSpam() {
	var link = window.atob('bW9jLmxpYW10b2hAdHRlcnJhYi5rZDpvdGxpYW0=');
	emailIcon.href = link.split("").reverse().join("");
}

// Ensures backward compatibility with IE old versions
function addEmailHover() {
	if (document.addEventListener && emailIcon !== null) {
		emailIcon.addEventListener('mouseover', iHateSpam);
	} else if (document.attachEvent && emailIcon !== null) {
		emailIcon.attachEvent('onmouseover', iHateSpam);
	} else {
		return;
	}
}

addMenuClick();
addEmailHover();
