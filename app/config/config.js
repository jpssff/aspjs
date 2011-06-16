/**
 * Application Specific Configuration.
 *
 * This function should return a set of key/value pairs specific to this application or deployment.
 *
 */
if (!this.lib_appcfg) this.lib_appcfg = lib_appcfg;
function lib_appcfg() {
  return {

    //Application Defaults
    defaults: {
      //Timezone Offset
      timezone: {
        offset: 10 * 60
      }
    },

    //Session Settings
    session: {
      default_datastore: 'database'
    },

    //Outgoing Email Server
    smtp: {
      host: 'localhost',
      port: '25',
      user: 'username',
      pass: 'password'
    },
    
    //Templating Engine
    template: {
      engine: 'nitro',
      defaults: {
        date_format: '{d} {c} {yyyy} {h}:{nn}{p}'
      }
    }

  };
}
