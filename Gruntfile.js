/*
 After you have changed any settings for the responsive_images task,
 run this with one of these options:
  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function(grunt) {
  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: "im",
          sizes: [
            {
              width: 800,
              suffix: "_lg_2x",
              quality: 30
            },
            {
              width: 610,
              rename: false,
              quality: 70
            },
            {
              width: 540,
              suffix: "_sml_2x",
              quality: 30
            },
            {
              width: 270,
              suffix: "_sml",
              quality: 70
            }
          ]
        },
        files: [
          {
            expand: true,
            src: ["*.{gif,jpg,png}"],
            cwd: "img_src/",
            dest: "img/"
          }
        ]
      }
    },

    /* Clear out the img directory if it exists */
    clean: {
      dev: {
        src: ["img"]
      }
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ["img"]
        }
      }
    },

    /* Copy the "fixed" images that don't go through processing into the images/directory */
    copy: {
      dev: {
        files: [
          {
            expand: true,
            src: ["img_src/fixed/*.{gif,jpg,png}"],
            dest: "img/",
            flatten: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks("grunt-responsive-images");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-mkdir");
  grunt.registerTask("default", [
    "clean",
    "mkdir",
    "copy",
    "responsive_images"
  ]);
};
