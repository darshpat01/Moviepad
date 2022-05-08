module.exports.isLoggedIn = (req, res, next) => {
  console.log(req.isAuthenticated());
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  } else {
    next();
  }
};

module.exports.isMember = (req, res, next) => {
  if (req.user.role == "member") {
    console.log("Member confirmed");
    next();
  } else {
    console.log("wrong role");
    return res.redirect("/login");
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role == "admin") {
    console.log("Admin confirmed");
    next();
  } else {
    console.log("wrong role");
    return res.redirect("/login");
  }
};
