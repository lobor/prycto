import nconf from 'nconf';

nconf.file({ file: './server/config/config.json' })

export default nconf;
