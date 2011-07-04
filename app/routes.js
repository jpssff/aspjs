/**
 * Controller Routes
 *
 * Maps pre-defined URL patterns to corresponding controller.
 * NOTE: Use strict JSON syntax.
 *
 */
dispatch({
  "/example": "example",
  "/test": {
    "controller": "test",
    "inc": "system/lib/qunit.js"
  },
  "/": "main"
});
