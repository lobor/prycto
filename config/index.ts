import nconf from 'nconf';

nconf.file({ file: './config/config.json' })

export default nconf;
