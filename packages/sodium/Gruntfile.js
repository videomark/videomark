/* eslint-disable func-names */

module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-license-report");

  // Plugin configuration(s).
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    "grunt-license-report": {
      output: {
        path: "./report/licenses",
        format: "html",
      },
    },
  });
};
