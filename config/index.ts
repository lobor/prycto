import nconf from 'nconf';

nconf.file({ file: './config/config.json' })
console.log(nconf.get())
export default nconf;
