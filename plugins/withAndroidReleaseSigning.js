const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * After `expo prebuild`, put your Play upload keystore next to `android/keystore.properties`
 * (see `android-keystore.properties.example` at repo root). Then `bundleRelease` signs the AAB
 * for Google Play. If the file is missing, release still uses the debug keystore (dev only).
 */
function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    if (mod.modResults.language !== 'groovy') return mod;

    let c = mod.modResults.contents;
    const needle = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

    if (!c.includes(needle)) return mod;

    const replacement = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            if (keystorePropertiesFile.exists()) {
                def keystoreProperties = new Properties()
                keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
                storeFile rootProject.file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            } else {
                initWith signingConfigs.debug
            }
        }
    }`;

    c = c.replace(needle, replacement);

    const releaseBlock = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;

    if (c.includes(releaseBlock)) {
      c = c.replace(
        releaseBlock,
        `        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug`
      );
    }

    mod.modResults.contents = c;
    return mod;
  });
}

module.exports = withAndroidReleaseSigning;
