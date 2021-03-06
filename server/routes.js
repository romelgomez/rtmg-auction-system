var path = require('path');

var basePath = '';
switch(process.env.NODE_ENV) {
  case 'production':
    basePath = '/dist';
    break;
  case 'development':
    basePath = '/public';
    break;
}

module.exports = function(app) {
  app.get('*', function(req, res){
    res.sendFile('index1.html', {root: path.join(process.cwd(), basePath)});
  });
};
