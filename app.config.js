// Loads static config from `app.json`. When EAS injects a file secret as `GOOGLE_SERVICES_JSON`
// (path to google-services.json on the build worker), use it so the file does not have to be in git.
const app = require('./app.json');

module.exports = () => ({
  expo: {
    ...app.expo,
    plugins: [...(app.expo.plugins || []), './plugins/withAndroidReleaseSigning'],
    android: {
      ...app.expo.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || app.expo.android.googleServicesFile,
    },
  },
});
