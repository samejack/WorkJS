// my-constructor-annotation.js
// ----------------------------

var Annotation = require('conga-annotations').Annotation;

module.exports = Annotation.extend({

  /**
   * The name of the annotation

   * @type {String}
   */
  annotation: 'Method',

  /**
   * The possible targets
   *
   * (Annotation.CONSTRUCTOR, Annotation.PROPERTY, Annotation.METHOD)
   *
   * @type {Array}
   */
  targets: [Annotation.METHOD],

  /**
   * The main value
   *
   * @type {String}
   */
  value: 'GET',

  /**
   * An additional attribute
   *
   * @type {String}
   */
  sample: 'GET',

  /**
   * Optional initialization method that
   * can be used to transform data
   *
   * @param  {Object} data
   * @return {void}
   */
  init: function(data){
    // do something with data
  }

});