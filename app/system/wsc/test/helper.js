function TestConstructor() {
  this.number = Math.random().toString().replace('.', '');
}

TestConstructor.prototype = {
  doSomethign: function() {
    return this.number;
  }
}
