/* eslint-disable quotes */
if(process.env.PLATFORM === 'native') {
  var spawn = require('cross-spawn')
  var packages = require('./package.json').nativeDependencies

  console.log('>>>>>>>>> Installing nativeDependencies')
  var npmArgs = ['install']
  for (var pkg in packages) {
    if (packages.hasOwnProperty(pkg)) {
      npmArgs.push(pkg.concat('@').concat(packages[pkg]))
    }
  }
  npmArgs.push('--no-save')

  var options = {
    stdio: 'inherit' // feed all child process logging into parent process
  }

  console.log('>>>>>>>>> npmArgs', npmArgs)
  spawn('npm', npmArgs, options)
}
