// This Cordova Hook (script) removes "AdSupport.framework" and "libAdIdAccess" references
// from the cordova-plugin-google-analytics plugin, as well as removes it from
// references found in the corresponding node_module and .project.pbxproj.
// The authoritive source is found at: https://gist.github.com/SteveKennedy

module.exports = function (ctx) {

    console.log("Attempting To Remove Ad (IDFA) References from project....")

    var pluginName = 'cordova-plugin-google-analytics';

    // Reference Dependencies
    var fs = ctx.requireCordovaModule('fs'),
        path = ctx.requireCordovaModule('path');

    // Define Path to Plugin.XML of cordova-plugin-google-analytics
    var pluginFilePath = path.join(ctx.opts.projectRoot, 'plugins/' + pluginName + '/plugin.xml');
    var nodeModulesPath = path.join(ctx.opts.projectRoot, 'node_modules/' + pluginName + '/plugin.xml');
    var pbxprojFilePath = getIOSProjectPath();

    removeAdReferencesFrom(pluginFilePath);
    removeAdReferencesFrom(pbxprojFilePath);
    removeAdReferencesFrom(nodeModulesPath);

    function removeAdReferencesFrom(filePath) {
        // Only Do This Only If Plugin.XML is found for this plugin.
        fs.stat(filePath, function (error, stat) {

            if (error) {
                return;
            }

            // Read In That Plugin.XML File
            var data = fs.readFileSync(filePath, 'utf8');

            // Split the Contents of That File Into An Array Of Lines
            var dataArray = data.split('\n');

            // Define Substrings To Eliminate if contained within Each Line
            var frameworkString = "AdSupport.framework";
            var sourceFileString = "libAdIdAccess";

            // Store original length of Array for comparison later
            var originalDataArrayLength = dataArray.length;

            // Loop Through The Lines and Remove the Line/Item if it contains The Substrings
            for (var i = dataArray.length - 1; i >= 0; i--) {
                if (dataArray[i].indexOf(sourceFileString) !== -1 ||
                    dataArray[i].indexOf(frameworkString) !== -1) {
                        console.log('Removing line:' + dataArray[i]);
                    dataArray.splice(i, 1);
                }
            }

            // If Nothing Was Found/Removed/Spliced, No Need To Overwrite.
            if (originalDataArrayLength === dataArray.length) {
                console.log("No Changes to File: " + filePath);
                return;
            }

            // Rejoin the Array Into A String
            var newData = dataArray.join("\r\n");

            // Overwrite the File with Modified Contents
            fs.writeFileSync(filePath, newData, 'utf8');
        });
    }

    function getIOSProjectPath() {

        var common = ctx.requireCordovaModule('cordova-common');
        var util = ctx.requireCordovaModule('cordova-lib/src/cordova/util');

        var projectName = new common.ConfigParser(util.projectConfig(util.isCordova())).name();
        var projectPath = './platforms/ios/' + projectName + '.xcodeproj/project.pbxproj';
        return projectPath;
    }

};
