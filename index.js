// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    Module.printErr('Exiting runtime. Any attempt to access the compiled C code may fail from now. If you want to keep the runtime alive, set Module["noExitRuntime"] = true or build with -s NO_EXIT_RUNTIME=1');
  }
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(18667);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,7,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,1,0,0,0,0,0,0,37,1,0,0,1,0,0,0,38,1,0,0,2,0,0,0,1,1,0,0,3,0,0,0,32,0,0,0,4,0,0,0,27,1,0,0,5,0,0,0,28,1,0,0,6,0,0,0,30,1,0,0,7,0,0,0,29,1,0,0,8,0,0,0,31,1,0,0,9,0,0,0,32,1,0,0,9,0,0,0,33,1,0,0,10,0,0,0,34,1,0,0,10,0,0,0,35,1,0,0,11,0,0,0,36,1,0,0,10,0,0,0,255,0,0,0,3,0,0,0,13,0,0,0,2,0,0,0,8,0,0,0,0,0,0,0,85,115,101,114,32,99,108,111,115,101,100,32,65,83,67,73,73,32,119,101,98,32,97,112,112,108,105,99,97,116,105,111,110,0,0,0,0,0,0,0,248,2,0,0,0,3,0,0,8,3,0,0,16,3,0,0,24,3,0,0,32,3,0,0,40,3,0,0,48,3,0,0,48,48,48,48,48,48,0,0,67,68,48,48,48,48,0,0,48,48,67,68,48,48,0,0,67,68,67,68,48,48,0,0,48,48,48,48,69,69,0,0,67,68,48,48,67,68,0,0,48,48,67,68,67,68,0,0,69,53,69,53,69,53,0,0,60,115,112,97,110,32,99,108,97,115,115,61,34,99,98,120,32,99,102,120,34,59,62,120,0,0,0,0,0,0,0,0,60,112,114,101,62,0,0,0,60,47,115,112,97,110,62,0,60,98,114,62,0,0,0,0,60,47,112,114,101,62,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,69,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,43,126,126,43,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,61,61,61,61,61,61,61,61,61,46,46,46,46,46,46,46,46,46,46,33,42,42,33,46,46,46,46,46,46,46,46,46,46,61,61,61,61,61,61,61,61,61,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,43,126,126,43,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,80,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,69,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,43,126,126,43,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,61,61,61,61,61,61,61,61,61,46,46,46,46,46,33,42,42,33,46,46,46,46,46,61,61,61,61,61,61,61,61,61,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,43,126,126,43,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,80,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,46,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,0,152,3,0,0,120,9,0,0,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,9,32,32,32,32,32,32,32,32,32,32,32,32,69,110,99,121,99,108,111,112,101,100,105,97,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,71,101,116,32,121,111,117,114,32,107,110,111,119,108,101,100,103,101,32,104,101,114,101,33,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,32,32,32,32,32,32,32,32,32,32,32,65,98,111,117,116,32,69,108,101,109,101,110,116,105,116,105,101,115,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,69,108,101,109,101,110,116,105,116,105,101,115,32,97,114,101,32,115,109,97,108,108,32,99,114,101,97,116,117,114,101,115,44,32,119,104,105,99,104,32,121,111,117,32,99,97,110,32,117,115,101,32,116,111,32,102,105,103,104,116,32,97,103,97,105,110,115,116,32,111,116,104,101,114,32,32,32,32,32,32,69,108,101,109,101,110,116,105,116,121,32,116,114,97,105,110,101,114,115,46,32,65,115,32,116,104,101,32,110,97,109,101,32,109,105,103,104,116,32,32,105,109,112,108,121,44,32,97,108,108,32,69,108,101,109,101,110,116,105,116,105,101,115,32,104,97,118,101,32,97,32,101,108,101,109,101,110,116,32,32,119,104,105,99,104,32,116,104,101,121,32,98,101,108,111,110,103,32,116,111,46,32,84,104,101,114,101,32,97,114,101,32,78,97,116,117,114,101,44,32,87,97,116,101,114,44,32,76,105,103,104,116,44,32,83,116,111,110,101,44,32,70,105,114,101,32,97,110,100,32,68,97,114,107,110,101,115,115,45,32,69,108,101,109,101,110,116,105,116,105,101,115,44,32,119,104,105,99,104,32,109,97,121,32,104,97,118,101,32,115,112,101,99,105,97,108,32,32,32,32,97,116,116,97,99,107,32,101,102,102,101,99,116,115,32,111,110,32,69,108,101,109,101,110,116,105,116,105,101,115,32,102,114,111,109,32,32,32,32,32,97,110,111,116,104,101,114,32,101,108,101,109,101,110,116,32,40,115,101,101,32,40,50,41,69,102,102,101,99,116,32,84,97,98,108,101,41,46,32,32,66,101,115,105,100,101,115,32,116,104,97,116,32,101,118,101,114,121,32,69,108,101,109,101,110,116,32,104,97,115,32,115,116,97,116,115,32,32,32,32,119,104,105,99,104,32,103,101,116,32,98,101,116,116,101,114,32,105,102,32,121,111,117,32,108,101,118,101,108,32,117,112,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,32,32,32,32,32,32,32,32,32,32,32,32,32,69,102,102,101,99,116,45,84,97,98,108,101,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,78,58,32,110,111,116,32,101,102,102,101,99,116,105,118,101,32,32,89,58,32,118,101,114,121,32,101,102,102,101,99,116,105,118,101,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,118,65,116,116,97,99,107,118,124,32,78,32,124,32,87,32,124,32,76,32,124,32,83,32,124,32,70,32,124,32,68,32,124,32,32,32,32,32,32,43,61,61,61,61,61,61,61,61,43,61,61,61,43,61,61,61,43,61,61,61,43,61,61,61,43,61,61,61,43,61,61,61,43,32,32,32,32,32,32,124,32,78,97,116,117,114,101,32,124,32,32,32,124,32,89,32,124,32,32,32,124,32,78,32,124,32,78,32,124,32,89,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,32,87,97,116,101,114,32,32,124,32,78,32,124,32,32,32,124,32,89,32,124,32,32,32,124,32,89,32,124,32,32,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,32,76,105,103,104,116,32,32,124,32,32,32,124,32,78,32,124,32,32,32,124,32,78,32,124,32,32,32,124,32,89,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,32,83,116,111,110,101,32,32,124,32,89,32,124,32,32,32,124,32,89,32,124,32,32,32,124,32,78,32,124,32,78,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,32,70,105,114,101,32,32,32,124,32,89,32,124,32,78,32,124,32,32,32,124,32,89,32,124,32,32,32,124,32,89,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,124,68,97,114,107,110,101,115,115,124,32,78,32,124,32,32,32,124,32,78,32,124,32,89,32,124,32,78,32,124,32,32,32,124,32,32,32,32,32,32,43,45,45,45,45,45,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,45,45,45,43,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,32,32,32,32,32,32,32,32,32,32,32,32,65,98,111,117,116,32,116,104,101,32,87,111,114,108,100,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,73,110,32,116,104,101,32,119,111,114,108,100,32,121,111,117,39,108,108,32,102,105,110,100,32,116,104,101,115,101,32,116,104,105,110,103,115,58,32,32,32,64,32,45,32,84,104,105,115,32,105,115,32,121,111,117,40,103,114,101,101,110,41,32,111,114,32,97,110,111,116,104,101,114,32,32,32,32,32,32,32,32,32,32,32,116,114,97,105,110,101,114,40,114,101,100,41,46,46,46,32,101,113,117,97,108,108,121,32,100,105,115,103,117,115,116,105,110,103,32,32,72,32,45,32,84,104,105,115,32,105,115,32,97,32,108,97,100,100,101,114,32,116,111,32,116,104,101,32,110,101,120,116,32,32,32,32,32,32,32,32,32,32,32,32,104,105,103,104,101,114,32,108,101,118,101,108,44,32,98,117,116,32,100,97,114,101,32,116,111,32,103,111,32,111,117,116,32,32,32,32,32,32,32,32,111,102,32,116,104,105,115,32,99,97,118,101,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,79,32,45,32,84,104,105,115,32,105,115,32,97,32,116,114,97,112,100,111,111,114,32,116,111,32,116,104,101,32,110,101,120,116,32,32,32,32,32,32,32,32,32,32,100,101,101,112,101,114,32,108,101,118,101,108,46,32,89,111,117,114,32,101,118,101,114,121,116,105,109,101,32,103,111,97,108,32,32,32,36,32,45,32,78,101,97,114,32,116,104,101,32,108,97,100,100,101,114,32,121,111,117,32,119,105,108,108,32,97,108,119,97,121,115,32,32,32,32,32,32,32,32,32,104,97,118,101,32,97,32,115,104,111,112,32,40,115,101,101,40,51,41,65,98,111,117,116,32,116,104,101,32,115,104,111,112,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,32,32,32,32,32,32,32,32,32,32,32,32,65,98,111,117,116,32,116,104,101,32,115,104,111,112,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,73,110,32,116,104,101,32,115,104,111,112,32,121,111,117,32,99,97,110,32,104,101,97,108,32,121,111,117,114,32,32,32,32,32,32,32,32,32,32,32,69,108,101,109,101,110,116,105,116,105,101,115,32,111,114,32,98,117,121,32,97,100,100,105,116,105,111,110,97,108,32,111,110,101,115,46,32,32,32,32,89,111,117,32,99,97,110,32,103,97,105,110,32,109,111,110,101,121,32,102,111,114,32,112,97,121,105,110,103,32,115,116,117,102,102,32,98,121,32,32,99,111,109,112,101,116,101,32,97,103,97,105,110,115,116,32,111,116,104,101,114,32,116,114,97,105,110,101,114,115,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,32,32,32,32,32,32,32,32,32,32,32,32,65,98,111,117,116,32,102,105,103,104,116,105,110,103,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,83,104,111,111,116,32,121,111,117,114,32,101,110,101,109,121,32,119,104,105,108,101,32,100,111,110,39,116,32,103,101,116,32,115,104,111,116,32,32,32,98,121,32,116,104,101,32,101,110,101,109,121,46,32,87,105,116,104,32,91,49,93,45,91,53,93,32,121,111,117,32,99,97,110,32,32,32,32,32,32,115,119,105,116,99,104,32,98,101,116,119,101,101,110,32,121,111,117,114,32,69,108,101,109,101,110,116,105,116,105,101,115,46,32,32,32,32,32,32,32,87,105,116,104,32,91,83,112,97,99,101,93,32,121,111,117,32,99,97,110,32,115,104,111,111,116,44,32,98,117,116,32,105,102,32,121,111,117,32,32,104,111,108,100,32,91,83,112,97,99,101,93,32,100,111,119,110,32,121,111,117,32,97,108,119,97,121,115,32,115,104,111,111,116,32,105,110,32,32,32,116,104,101,32,100,105,114,101,99,116,105,111,110,32,121,111,117,32,102,97,99,101,100,32,119,104,101,110,32,112,114,101,115,115,105,110,103,32,32,32,116,104,101,32,91,83,112,97,99,101,93,32,98,117,116,116,111,110,32,100,111,119,110,46,32,83,111,32,121,111,117,32,99,97,110,32,32,32,32,32,97,118,111,105,100,32,112,114,111,106,101,99,116,105,108,101,115,32,97,110,100,32,115,104,111,111,116,32,105,110,32,116,104,101,32,32,32,32,32,32,114,105,103,104,116,32,100,105,114,101,99,116,105,111,110,32,97,116,32,111,110,101,32,116,105,109,101,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,0,0,0,69,110,99,121,99,108,111,112,101,100,105,97,32,91,37,104,104,117,47,37,104,104,117,93,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,94,118,60,62,0,0,0,0,78,111,116,32,101,102,102,101,99,116,105,118,101,33,0,0,86,101,114,121,32,101,102,102,101,99,116,105,118,101,33,0,89,111,117,114,32,37,115,32,100,101,102,101,97,116,101,100,32,37,115,33,0,0,0,0,37,115,32,100,101,102,101,97,116,101,100,32,121,111,117,114,32,37,115,33,0,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,43,45,45,45,45,45,45,45,45,45,45,45,45,45,89,111,117,32,108,111,115,116,32,116,104,101,32,98,97,116,116,108,101,45,45,45,45,45,45,45,45,45,45,45,45,45,43,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,87,104,97,116,32,97,32,115,97,100,32,100,97,121,44,32,97,108,108,32,121,111,117,114,32,101,108,101,109,101,110,116,105,116,105,101,115,32,100,105,101,100,44,32,124,124,32,109,117,114,100,101,114,101,100,32,98,121,32,115,116,114,97,110,103,101,32,112,101,111,112,108,101,32,105,110,32,97,32,101,118,101,110,32,32,32,32,32,32,32,32,124,124,32,115,116,114,97,110,103,101,114,32,99,97,118,101,46,46,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,66,117,116,32,105,102,32,73,32,119,97,115,32,121,111,117,44,32,73,32,119,111,117,108,100,32,114,117,110,32,97,115,32,113,117,105,99,107,108,121,32,117,112,32,124,124,32,116,111,32,116,104,101,32,108,105,103,104,116,44,32,119,104,101,114,101,32,121,111,117,32,99,97,110,32,109,97,121,98,101,32,102,105,110,100,32,32,32,32,32,32,124,124,32,97,110,111,116,104,101,114,32,108,105,102,101,32,119,105,116,104,32,102,114,101,115,104,32,97,105,114,32,97,110,100,32,104,105,103,104,32,112,108,97,99,101,115,32,124,124,32,116,111,32,115,116,97,121,44,32,116,111,32,108,105,118,101,44,32,116,111,32,100,105,101,46,46,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,46,46,46,98,117,116,32,116,104,97,116,32,105,115,32,97,110,111,116,104,101,114,32,115,116,111,114,121,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,32,32,32,32,32,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,103,111,32,98,97,99,107,32,116,111,32,116,104,101,32,109,101,110,117,32,32,32,32,32,124,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,0,0,0,0,0,0,208,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,47,0,0,0,0,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,5,0,0,0,6,0,0,0,4,0,0,0,86,101,114,115,117,115,0,0,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,99,111,110,116,105,110,117,101,46,0,0,0,0,0,0,0,0,89,111,117,0,0,0,0,0,69,110,101,109,121,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,7,0,0,0,8,0,0,0,5,0,0,0,89,111,117,32,119,111,110,32,116,104,101,32,98,97,116,116,108,101,33,0,0,0,0,0,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,99,111,110,116,105,110,117,101,46,0,0,0,0,0,0,0,0,89,111,117,32,103,111,116,32,37,117,36,46,32,78,111,119,32,121,111,117,32,104,97,118,101,32,37,117,36,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,9,0,0,0,10,0,0,0,6], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([71,114,97,115,115,45,67,97,118,101,32,73,0,0,0,0,71,114,97,115,115,45,67,97,118,101,32,73,73,0,0,0,67,97,118,101,32,73,0,0,67,97,118,101,32,73,73,0,68,101,112,116,104,32,73,0,68,101,112,116,104,32,73,73,0,0,0,0,0,0,0,0,72,101,108,108,32,73,0,0,72,101,108,108,32,73,73,0,8,58,0,0,2,0,0,0,4,0,0,0,6,0,0,0,4,0,0,0,24,58,0,0,2,0,0,0,5,0,0,0,7,0,0,0,4,0,0,0,40,58,0,0,7,0,0,0,7,0,0,0,8,0,0,0,5,0,0,0,48,58,0,0,7,0,0,0,8,0,0,0,9,0,0,0,5,0,0,0,56,58,0,0,0,7,0,0,10,0,0,0,11,0,0,0,6,0,0,0,64,58,0,0,0,7,0,0,11,0,0,0,12,0,0,0,6,0,0,0,80,58,0,0,1,0,0,0,13,0,0,0,14,0,0,0,6,0,0,0,88,58,0,0,1,0,0,0,14,0,0,0,15,0,0,0,6,0,0,0,97,101,105,111,117,0,0,0,98,99,100,102,103,104,106,107,108,109,110,112,113,114,115,116,118,119,120,121,122,0,0,0,99,106,120,121,122,113,0,0,1,4,1,4,1,4,1,4,1,3,5,10,0,0,0,0,35,89,35,78,78,89,78,35,89,35,89,35,35,78,35,78,35,89,89,35,89,35,78,78,89,78,35,89,35,89,78,35,78,89,78,35,0,0,0,0,2,4,3,5,1,0,0,0,0,0,0,0,0,7,0,0,7,1,0,0,0,0,0,0,40,32,32,32,47,32,32,32,41,0,0,0,0,0,0,0,76,118,58,37,104,104,117,32,45,32,37,104,104,117,47,37,104,104,117,0,0,0,0,0,65,84,84,58,37,104,104,117,45,37,104,104,117,40,37,104,104,117,41,32,68,69,70,58,37,104,104,117,32,83,80,69,69,68,58,37,104,104,117,0,76,118,58,37,104,104,117,0,76,118,58,37,104,104,117,32,37,104,104,117,47,37,104,104,117,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,95,120,120,120,120,120,124,32,72,105,32,116,104,101,114,101,32,65,100,118,101,110,116,117,114,101,114,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,92,120,120,120,120,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,92,120,120,120,124,32,97,110,100,32,119,101,108,99,111,109,101,32,116,111,32,84,104,101,32,65,114,101,110,97,45,67,97,118,101,46,32,72,101,114,101,32,121,111,117,114,92,120,120,124,32,103,117,105,100,97,110,99,101,32,97,110,100,32,116,114,97,105,110,101,114,45,97,98,105,108,105,116,121,32,119,105,108,108,32,98,101,32,32,32,32,32,92,120,124,32,116,101,115,116,101,100,32,98,121,32,109,97,110,121,32,111,116,104,101,114,32,65,100,118,101,110,116,117,114,101,114,115,32,119,105,116,104,32,116,104,101,32,124,124,32,115,97,109,101,32,103,111,97,108,32,97,115,32,121,111,117,58,32,71,101,116,32,116,111,32,116,104,101,32,101,110,100,44,32,119,104,101,114,101,32,32,32,124,124,32,121,111,117,32,97,110,100,32,121,111,117,114,32,101,108,101,109,101,110,116,105,116,105,101,115,32,119,105,108,108,32,98,101,32,114,101,119,97,114,101,100,32,124,124,32,119,105,116,104,32,101,110,100,108,101,115,115,32,109,111,110,101,121,32,97,110,100,32,102,97,109,101,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,73,102,32,121,111,117,32,116,104,105,110,107,32,121,111,117,32,97,114,101,32,116,111,117,103,104,32,101,110,111,117,103,104,58,32,72,101,114,101,32,32,32,124,124,32,97,114,101,32,121,111,117,114,32,119,101,97,112,111,110,115,32,111,102,32,109,121,32,99,104,111,105,99,101,58,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,32,45,32,89,111,117,114,32,102,105,114,115,116,32,69,108,101,109,101,110,116,105,116,121,46,32,66,101,32,99,97,114,101,102,117,108,44,32,105,102,32,32,124,124,32,32,32,32,121,111,117,32,108,111,115,101,32,105,116,44,32,121,111,117,32,119,105,108,108,32,110,101,118,101,114,32,119,105,110,32,116,104,105,115,32,32,32,124,124,32,32,45,32,84,104,101,32,69,110,99,121,99,108,111,112,101,100,105,97,44,32,109,97,107,101,32,115,117,114,101,32,121,111,117,32,114,101,97,100,32,105,116,124,124,32,32,32,32,99,97,114,101,102,117,108,108,121,44,32,105,116,32,104,111,108,100,115,32,105,109,112,111,114,116,97,110,116,32,112,105,101,99,101,115,32,111,102,124,124,32,32,32,32,97,100,118,105,99,101,32,111,110,32,104,111,119,32,116,111,32,110,111,116,32,98,101,32,97,32,112,105,101,99,101,32,111,102,32,115,104,105,116,124,124,32,32,32,32,110,111,116,32,119,111,114,116,104,121,32,116,104,101,32,116,105,109,101,32,105,116,32,116,97,107,101,115,32,116,111,32,98,114,105,110,103,32,32,124,124,32,32,32,32,121,111,117,114,32,100,101,97,100,32,98,111,100,121,32,116,111,32,116,104,101,32,116,114,97,115,104,46,46,46,32,32,32,32,32,32,32,32,32,124,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,89,111,117,114,32,66,111,115,115,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,80,46,83,46,32,66,101,99,97,117,115,101,32,73,32,104,97,100,32,97,32,118,101,114,121,32,103,111,111,100,32,100,97,121,32,115,111,32,102,97,114,44,124,124,32,32,32,32,32,32,73,32,116,104,114,101,119,32,105,110,32,50,48,32,98,117,99,107,115,32,102,111,114,32,121,111,117,32,97,115,32,119,101,108,108,46,32,124,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,0,0,0,0,0,0,0,0,240,59,0,0,0,0,0,0,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,95,120,120,120,120,120,124,32,72,105,32,116,104,101,114,101,32,87,105,110,110,101,114,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,92,120,120,120,120,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,92,120,120,120,124,32,87,111,119,44,32,73,32,110,101,118,101,114,32,116,104,111,117,103,104,116,32,73,32,119,111,117,108,100,32,115,97,121,32,116,104,105,115,32,98,117,92,120,120,124,32,67,79,78,71,82,65,84,85,76,65,84,73,79,78,83,33,32,89,111,117,32,109,97,100,101,32,105,116,32,116,104,114,111,117,103,104,32,116,104,101,32,92,120,124,32,119,104,111,108,101,32,99,97,118,101,32,40,97,110,100,32,101,118,101,110,32,116,104,101,32,104,101,108,108,44,32,73,32,100,105,100,32,110,111,116,32,32,124,124,32,97,99,116,117,97,108,108,121,32,101,118,101,110,32,112,108,97,110,110,101,100,32,116,104,97,116,41,46,32,78,111,119,32,73,32,99,97,110,32,32,32,32,124,124,32,116,101,108,108,32,121,111,117,32,116,104,101,32,114,101,97,115,111,110,32,102,111,114,32,116,104,105,115,32,97,108,108,58,32,73,39,109,32,32,32,32,32,124,124,32,103,111,105,110,103,32,116,111,32,97,32,112,108,97,99,101,32,119,104,101,114,101,32,104,117,110,100,114,101,100,115,32,111,102,32,32,32,32,32,32,32,32,124,124,32,100,97,110,103,101,114,111,117,115,32,69,108,101,109,101,110,116,105,116,105,101,115,32,97,114,101,44,32,106,117,115,116,32,119,97,105,116,105,110,103,32,32,124,124,32,116,111,32,107,105,108,108,32,109,101,32,97,110,100,32,73,32,110,101,101,100,32,115,111,109,101,111,110,101,32,116,111,32,102,105,103,104,116,32,32,32,32,124,124,32,116,104,101,109,46,32,73,102,32,121,111,117,32,97,114,101,32,105,110,116,101,114,101,115,116,101,100,32,106,117,115,116,32,115,101,110,100,32,109,101,32,32,124,124,32,97,110,32,101,45,109,97,105,108,46,46,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,66,117,116,32,104,101,121,33,32,87,105,116,104,32,103,111,105,110,103,32,116,104,97,116,32,108,97,115,116,32,108,97,100,100,101,114,32,100,111,119,110,32,124,124,32,121,111,117,32,101,97,114,110,101,100,32,121,111,117,114,115,101,108,102,32,116,104,101,32,109,111,110,101,121,32,97,110,100,32,116,104,101,32,102,97,109,101,124,124,32,84,104,101,32,112,114,101,115,115,32,105,115,32,106,117,115,116,32,119,97,105,116,105,110,103,32,102,111,114,32,105,110,116,101,114,118,105,101,119,115,32,32,124,124,32,119,105,116,104,32,121,111,117,32,97,110,100,32,73,32,104,101,97,114,100,32,115,111,109,101,32,102,97,109,111,117,115,32,112,101,111,112,108,101,32,32,32,124,124,32,116,97,108,107,105,110,103,32,97,98,111,117,116,32,115,111,109,101,32,111,116,104,101,114,32,112,114,111,106,101,99,116,115,32,105,110,32,119,104,105,99,104,124,124,32,116,104,101,121,32,119,97,110,116,32,121,111,117,32,116,111,32,105,110,116,101,103,114,97,116,101,46,32,65,110,121,119,97,121,115,32,98,101,32,32,32,32,124,124,32,104,97,112,112,121,32,102,111,114,32,116,104,101,32,114,101,115,116,32,111,102,32,121,111,117,114,32,108,105,102,101,32,97,110,100,32,107,101,101,112,32,32,124,124,32,121,111,117,114,32,110,101,119,32,112,101,116,115,46,32,73,32,116,104,105,110,107,32,116,104,101,121,32,97,114,101,32,103,111,111,100,32,32,32,32,32,32,124,124,32,102,114,105,101,110,100,115,32,102,111,114,32,121,111,117,32,110,111,119,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,89,111,117,114,32,102,114,105,101,110,100,46,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,0,0,0,0,0,0,0,0,56,64,0,0,0,0,0,0,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,124,91,94,93,91,118,93,91,60,93,91,62,93,32,45,32,77,111,118,101,109,101,110,116,32,32,32,32,32,124,124,91,49,93,45,91,53,93,32,45,32,83,119,105,116,99,104,32,69,108,101,109,101,110,116,105,116,121,32,124,124,91,83,112,97,99,101,93,32,45,32,70,105,114,101,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,91,69,110,116,101,114,93,32,45,32,77,101,110,117,32,32,32,32,32,32,32,32,32,32,32,32,32,32,124,124,91,72,93,32,45,32,79,112,101,110,47,67,108,111,115,101,32,69,110,99,121,108,111,112,101,100,105,97,124,43,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,43,0,0,0,0,0,0,128,68,0,0,0,0,0,0,0,0,0,0,0,0,0,0,45,0,0,0,24,0,0,0,0,0,0,0,120,0,0,0,45,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,91,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,115,116,97,114,116,93,0,0,16,0,0,0,17,0,0,0,18,0,0,0,11,0,0,0,12,0,0,0,7,0,0,0,80,114,101,115,115,32,69,110,116,101,114,32,116,111,32,99,111,110,116,105,110,117,101,46,0,0,0,0,0,0,0,0,19,0,0,0,20,0,0,0,21,0,0,0,13,0,0,0,14,0,0,0,8,0,0,0,89,111,117,32,119,111,110,33,0,0,0,0,0,0,0,0,83,111,109,101,111,110,101,32,97,99,116,117,97,108,108,121,32,109,97,100,101,32,105,116,32,116,104,114,111,117,103,104,32,116,104,101,32,119,104,111,108,101,32,103,97,109,101,32,58,41,0,0,0,0,0,0,89,111,117,32,104,97,118,101,58,32,37,117,36,0,0,0,22,0,0,0,23,0,0,0,24,0,0,0,15,0,0,0,16,0,0,0,9,0,0,0,7,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,91,76,101,97,118,101,32,115,104,111,112,93,0,0,0,0,83,104,111,112,32,45,32,37,117,36,0,0,0,0,0,0,91,72,101,97,108,32,97,108,108,32,37,117,36,93,0,0,91,72,101,97,108,32,37,117,36,93,0,0,0,0,0,0,91,66,117,121,32,37,117,36,93,0,0,0,0,0,0,0,25,0,0,0,26,0,0,0,27,0,0,0,17,0,0,0,18,0,0,0,10,0,0,0,46,58,44,59,120,43,42,39,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+14848);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

   
  Module["_memset"] = _memset;

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _js_ascii_changeConsoleText(textPtr,len) {
  	  var text=intArrayToString(HEAPU8.subarray(textPtr, textPtr+len));
  	  setTimeout (function () {document.getElementById('console').innerHTML=text;},20);
  	}

  
  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy; 
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;

  var _llvm_memset_p0i8_i32=_memset;

  var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  function _toupper(chr) {
      if (chr >= 97 && chr <= 122) {
        return chr - 97 + 65;
      } else {
        return chr;
      }
    }

  function _js_ascii_onMouseMoveEvent(functionName,el,ev) {
  	  if (functionName!=0&&(typeof lockMouseEvent === "undefined" || lockMouseEvent==null)) {
  	    var fontWidthTest=document.getElementById('fontWidthTest');
  	    var fontWidth=fontWidthTest.clientWidth; //put this in some precalculated data
  	    var fontHeight=fontWidthTest.clientHeight;
  
  	    var rect = el.getBoundingClientRect();
  	    var X = ev.clientX - rect.left - el.clientLeft + el.scrollLeft;
  	    var Y = ev.clientY - rect.top - el.clientTop + el.scrollTop;
  	    X=Math.floor(X/fontWidth);
  	    Y=Math.floor(Y/fontHeight);
  	    
  	    if (X>=0&&Y>=0&&(typeof lastMouseX === "undefined" || lastMouseX!=X || lastMouseY!=Y)) {
  	      Module.ccall(functionName,'number',['number','number'],[X,Y]);
  	      lockMouseEvent=1;
  	      setTimeout (function () {lockMouseEvent=null;},10);
  	      lastMouseX=X;
  	      lastMouseY=Y;
  	    }
  	  }
  	}

   
  Module["_strlen"] = _strlen;


  function _js_ascii_setConsoleSize(cols,lines) {
  	  var console=document.getElementById('console');
  	  var fontWidthTest=document.getElementById('fontWidthTest');
  	  var fontWidth=fontWidthTest.clientWidth;
  	  var fontHeight=fontWidthTest.clientHeight;
  	  console.style.width=(cols*fontWidth).toString()+'px';
  	  console.style.height=(lines*fontHeight).toString()+'px';
  	  console.style.maxWidth=console.style.width;
  	}

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }


  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            assert(buffer.length);
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};var SDL={defaults:{width:320,height:200,copyOnLock:true},version:null,surfaces:{},canvasPool:[],events:[],fonts:[null],audios:[null],rwops:[null],music:{audio:null,volume:1},mixerFrequency:22050,mixerFormat:32784,mixerNumChannels:2,mixerChunkSize:1024,channelMinimumNumber:0,GL:false,glAttributes:{0:3,1:3,2:2,3:0,4:0,5:1,6:16,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:1,16:0,17:0,18:0},keyboardState:null,keyboardMap:{},canRequestFullscreen:false,isRequestingFullscreen:false,textInput:false,startTime:null,initFlags:0,buttonState:0,modState:0,DOMButtons:[0,0,0],DOMEventToSDLEvent:{},keyCodes:{16:1249,17:1248,18:1250,33:1099,34:1102,37:1104,38:1106,39:1103,40:1105,46:127,96:1112,97:1113,98:1114,99:1115,100:1116,101:1117,102:1118,103:1119,104:1120,105:1121,112:1082,113:1083,114:1084,115:1085,116:1086,117:1087,118:1088,119:1089,120:1090,121:1091,122:1092,123:1093,173:45,188:44,190:46,191:47,192:96},scanCodes:{8:42,9:43,13:40,27:41,32:44,44:54,46:55,47:56,48:39,49:30,50:31,51:32,52:33,53:34,54:35,55:36,56:37,57:38,59:51,61:46,91:47,92:49,93:48,96:52,97:4,98:5,99:6,100:7,101:8,102:9,103:10,104:11,105:12,106:13,107:14,108:15,109:16,110:17,111:18,112:19,113:20,114:21,115:22,116:23,117:24,118:25,119:26,120:27,121:28,122:29,305:224,308:226},loadRect:function (rect) {
        return {
          x: HEAP32[((rect + 0)>>2)],
          y: HEAP32[((rect + 4)>>2)],
          w: HEAP32[((rect + 8)>>2)],
          h: HEAP32[((rect + 12)>>2)]
        };
      },loadColorToCSSRGB:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgb(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ')';
      },loadColorToCSSRGBA:function (color) {
        var rgba = HEAP32[((color)>>2)];
        return 'rgba(' + (rgba&255) + ',' + ((rgba >> 8)&255) + ',' + ((rgba >> 16)&255) + ',' + (((rgba >> 24)&255)/255) + ')';
      },translateColorToCSSRGBA:function (rgba) {
        return 'rgba(' + (rgba&0xff) + ',' + (rgba>>8 & 0xff) + ',' + (rgba>>16 & 0xff) + ',' + (rgba>>>24)/0xff + ')';
      },translateRGBAToCSSRGBA:function (r, g, b, a) {
        return 'rgba(' + (r&0xff) + ',' + (g&0xff) + ',' + (b&0xff) + ',' + (a&0xff)/255 + ')';
      },translateRGBAToColor:function (r, g, b, a) {
        return r | g << 8 | b << 16 | a << 24;
      },makeSurface:function (width, height, flags, usePageCanvas, source, rmask, gmask, bmask, amask) {
        flags = flags || 0;
        var is_SDL_HWSURFACE = flags & 0x00000001;
        var is_SDL_HWPALETTE = flags & 0x00200000;
        var is_SDL_OPENGL = flags & 0x04000000;
  
        var surf = _malloc(60);
        var pixelFormat = _malloc(44);
        //surface with SDL_HWPALETTE flag is 8bpp surface (1 byte)
        var bpp = is_SDL_HWPALETTE ? 1 : 4;
        var buffer = 0;
  
        // preemptively initialize this for software surfaces,
        // otherwise it will be lazily initialized inside of SDL_LockSurface
        if (!is_SDL_HWSURFACE && !is_SDL_OPENGL) {
          buffer = _malloc(width * height * 4);
        }
  
        HEAP32[((surf)>>2)]=flags;
        HEAP32[(((surf)+(4))>>2)]=pixelFormat;
        HEAP32[(((surf)+(8))>>2)]=width;
        HEAP32[(((surf)+(12))>>2)]=height;
        HEAP32[(((surf)+(16))>>2)]=width * bpp;  // assuming RGBA or indexed for now,
                                                                                          // since that is what ImageData gives us in browsers
        HEAP32[(((surf)+(20))>>2)]=buffer;
        HEAP32[(((surf)+(36))>>2)]=0;
        HEAP32[(((surf)+(56))>>2)]=1;
  
        HEAP32[((pixelFormat)>>2)]=0 /* XXX missing C define SDL_PIXELFORMAT_RGBA8888 */;
        HEAP32[(((pixelFormat)+(4))>>2)]=0;// TODO
        HEAP8[(((pixelFormat)+(8))|0)]=bpp * 8;
        HEAP8[(((pixelFormat)+(9))|0)]=bpp;
  
        HEAP32[(((pixelFormat)+(12))>>2)]=rmask || 0x000000ff;
        HEAP32[(((pixelFormat)+(16))>>2)]=gmask || 0x0000ff00;
        HEAP32[(((pixelFormat)+(20))>>2)]=bmask || 0x00ff0000;
        HEAP32[(((pixelFormat)+(24))>>2)]=amask || 0xff000000;
  
        // Decide if we want to use WebGL or not
        SDL.GL = SDL.GL || is_SDL_OPENGL;
        var canvas;
        if (!usePageCanvas) {
          if (SDL.canvasPool.length > 0) {
            canvas = SDL.canvasPool.pop();
          } else {
            canvas = document.createElement('canvas');
          }
          canvas.width = width;
          canvas.height = height;
        } else {
          canvas = Module['canvas'];
        }
  
        var webGLContextAttributes = {
          antialias: ((SDL.glAttributes[13 /*SDL_GL_MULTISAMPLEBUFFERS*/] != 0) && (SDL.glAttributes[14 /*SDL_GL_MULTISAMPLESAMPLES*/] > 1)),
          depth: (SDL.glAttributes[6 /*SDL_GL_DEPTH_SIZE*/] > 0),
          stencil: (SDL.glAttributes[7 /*SDL_GL_STENCIL_SIZE*/] > 0)
        };
        
        var ctx = Browser.createContext(canvas, is_SDL_OPENGL, usePageCanvas, webGLContextAttributes);
              
        SDL.surfaces[surf] = {
          width: width,
          height: height,
          canvas: canvas,
          ctx: ctx,
          surf: surf,
          buffer: buffer,
          pixelFormat: pixelFormat,
          alpha: 255,
          flags: flags,
          locked: 0,
          usePageCanvas: usePageCanvas,
          source: source,
  
          isFlagSet: function(flag) {
            return flags & flag;
          }
        };
  
        return surf;
      },copyIndexedColorData:function (surfData, rX, rY, rW, rH) {
        // HWPALETTE works with palette
        // setted by SDL_SetColors
        if (!surfData.colors) {
          return;
        }
        
        var fullWidth  = Module['canvas'].width;
        var fullHeight = Module['canvas'].height;
  
        var startX  = rX || 0;
        var startY  = rY || 0;
        var endX    = (rW || (fullWidth - startX)) + startX;
        var endY    = (rH || (fullHeight - startY)) + startY;
        
        var buffer  = surfData.buffer;
        var data    = surfData.image.data;
        var colors  = surfData.colors;
  
        for (var y = startY; y < endY; ++y) {
          var indexBase = y * fullWidth;
          var colorBase = indexBase * 4;
          for (var x = startX; x < endX; ++x) {
            // HWPALETTE have only 256 colors (not rgba)
            var index = HEAPU8[((buffer + indexBase + x)|0)] * 3;
            var colorOffset = colorBase + x * 4;
  
            data[colorOffset   ] = colors[index   ];
            data[colorOffset +1] = colors[index +1];
            data[colorOffset +2] = colors[index +2];
            //unused: data[colorOffset +3] = color[index +3];
          }
        }
      },freeSurface:function (surf) {
        var refcountPointer = surf + 56;
        var refcount = HEAP32[((refcountPointer)>>2)];
        if (refcount > 1) {
          HEAP32[((refcountPointer)>>2)]=refcount - 1;
          return;
        }
  
        var info = SDL.surfaces[surf];
        if (!info.usePageCanvas && info.canvas) SDL.canvasPool.push(info.canvas);
        if (info.buffer) _free(info.buffer);
        _free(info.pixelFormat);
        _free(surf);
        SDL.surfaces[surf] = null;
      },touchX:0,touchY:0,savedKeydown:null,receiveEvent:function (event) {
        switch(event.type) {
          case 'touchstart':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            var event = {
              type: 'mousedown',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 1;
            SDL.events.push(event);
            break;
          case 'touchmove':
            event.preventDefault();
            var touch = event.touches[0];
            touchX = touch.pageX;
            touchY = touch.pageY;
            event = {
              type: 'mousemove',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.events.push(event);
            break;
          case 'touchend':
            event.preventDefault();
            event = {
              type: 'mouseup',
              button: 0,
              pageX: touchX,
              pageY: touchY
            };
            SDL.DOMButtons[0] = 0;
            SDL.events.push(event);
            break;
          case 'mousemove':
            if (Browser.pointerLock) {
              // workaround for firefox bug 750111
              if ('mozMovementX' in event) {
                event['movementX'] = event['mozMovementX'];
                event['movementY'] = event['mozMovementY'];
              }
              // workaround for Firefox bug 782777
              if (event['movementX'] == 0 && event['movementY'] == 0) {
                // ignore a mousemove event if it doesn't contain any movement info
                // (without pointer lock, we infer movement from pageX/pageY, so this check is unnecessary)
                event.preventDefault();
                return;
              }
            }
            // fall through
          case 'keydown': case 'keyup': case 'keypress': case 'mousedown': case 'mouseup': case 'DOMMouseScroll': case 'mousewheel':
            // If we preventDefault on keydown events, the subsequent keypress events
            // won't fire. However, it's fine (and in some cases necessary) to
            // preventDefault for keys that don't generate a character. Otherwise,
            // preventDefault is the right thing to do in general.
            if (event.type !== 'keydown' || (!SDL.unicode && !SDL.textInput) || (event.keyCode === 8 /* backspace */ || event.keyCode === 9 /* tab */)) {
              event.preventDefault();
            }
  
            if (event.type == 'DOMMouseScroll' || event.type == 'mousewheel') {
              var button = Browser.getMouseWheelDelta(event) > 0 ? 4 : 3;
              var event2 = {
                type: 'mousedown',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
              SDL.events.push(event2);
              event = {
                type: 'mouseup',
                button: button,
                pageX: event.pageX,
                pageY: event.pageY
              };
            } else if (event.type == 'mousedown') {
              SDL.DOMButtons[event.button] = 1;
            } else if (event.type == 'mouseup') {
              // ignore extra ups, can happen if we leave the canvas while pressing down, then return,
              // since we add a mouseup in that case
              if (!SDL.DOMButtons[event.button]) {
                return;
              }
  
              SDL.DOMButtons[event.button] = 0;
            }
  
            // We can only request fullscreen as the result of user input.
            // Due to this limitation, we toggle a boolean on keydown which
            // SDL_WM_ToggleFullScreen will check and subsequently set another
            // flag indicating for us to request fullscreen on the following
            // keyup. This isn't perfect, but it enables SDL_WM_ToggleFullScreen
            // to work as the result of a keypress (which is an extremely
            // common use case).
            if (event.type === 'keydown') {
              SDL.canRequestFullscreen = true;
            } else if (event.type === 'keyup') {
              if (SDL.isRequestingFullscreen) {
                Module['requestFullScreen'](true, true);
                SDL.isRequestingFullscreen = false;
              }
              SDL.canRequestFullscreen = false;
            }
  
            // SDL expects a unicode character to be passed to its keydown events.
            // Unfortunately, the browser APIs only provide a charCode property on
            // keypress events, so we must backfill in keydown events with their
            // subsequent keypress event's charCode.
            if (event.type === 'keypress' && SDL.savedKeydown) {
              // charCode is read-only
              SDL.savedKeydown.keypressCharCode = event.charCode;
              SDL.savedKeydown = null;
            } else if (event.type === 'keydown') {
              SDL.savedKeydown = event;
            }
  
            // Don't push keypress events unless SDL_StartTextInput has been called.
            if (event.type !== 'keypress' || SDL.textInput) {
              SDL.events.push(event);
            }
            break;
          case 'mouseout':
            // Un-press all pressed mouse buttons, because we might miss the release outside of the canvas
            for (var i = 0; i < 3; i++) {
              if (SDL.DOMButtons[i]) {
                SDL.events.push({
                  type: 'mouseup',
                  button: i,
                  pageX: event.pageX,
                  pageY: event.pageY
                });
                SDL.DOMButtons[i] = 0;
              }
            }
            event.preventDefault();
            break;
          case 'blur':
          case 'visibilitychange': {
            // Un-press all pressed keys: TODO
            for (var code in SDL.keyboardMap) {
              SDL.events.push({
                type: 'keyup',
                keyCode: SDL.keyboardMap[code]
              });
            }
            event.preventDefault();
            break;
          }
          case 'unload':
            if (Browser.mainLoop.runner) {
              SDL.events.push(event);
              // Force-run a main event loop, since otherwise this event will never be caught!
              Browser.mainLoop.runner();
            }
            return;
          case 'resize':
            SDL.events.push(event);
            // manually triggered resize event doesn't have a preventDefault member
            if (event.preventDefault) {
              event.preventDefault();
            }
            break;
        }
        if (SDL.events.length >= 10000) {
          Module.printErr('SDL event queue full, dropping events');
          SDL.events = SDL.events.slice(0, 10000);
        }
        return;
      },handleEvent:function (event) {
        if (event.handled) return;
        event.handled = true;
  
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            var code = event.keyCode;
            if (code >= 65 && code <= 90) {
              code += 32; // make lowercase for SDL
            } else {
              code = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
  
            HEAP8[(((SDL.keyboardState)+(code))|0)]=down;
            // TODO: lmeta, rmeta, numlock, capslock, KMOD_MODE, KMOD_RESERVED
            SDL.modState = (HEAP8[(((SDL.keyboardState)+(1248))|0)] ? 0x0040 | 0x0080 : 0) | // KMOD_LCTRL & KMOD_RCTRL
              (HEAP8[(((SDL.keyboardState)+(1249))|0)] ? 0x0001 | 0x0002 : 0) | // KMOD_LSHIFT & KMOD_RSHIFT
              (HEAP8[(((SDL.keyboardState)+(1250))|0)] ? 0x0100 | 0x0200 : 0); // KMOD_LALT & KMOD_RALT
  
            if (down) {
              SDL.keyboardMap[code] = event.keyCode; // save the DOM input, which we can use to unpress it during blur
            } else {
              delete SDL.keyboardMap[code];
            }
  
            break;
          }
          case 'mousedown': case 'mouseup':
            if (event.type == 'mousedown') {
              // SDL_BUTTON(x) is defined as (1 << ((x)-1)).  SDL buttons are 1-3,
              // and DOM buttons are 0-2, so this means that the below formula is
              // correct.
              SDL.buttonState |= 1 << event.button;
            } else if (event.type == 'mouseup') {
              SDL.buttonState &= ~(1 << event.button);
            }
            // fall through
          case 'mousemove': {
            Browser.calculateMouseEvent(event);
            break;
          }
        }
      },makeCEvent:function (event, ptr) {
        if (typeof event === 'number') {
          // This is a pointer to a native C event that was SDL_PushEvent'ed
          _memcpy(ptr, event, 28); // XXX
          return;
        }
  
        SDL.handleEvent(event);
  
        switch (event.type) {
          case 'keydown': case 'keyup': {
            var down = event.type === 'keydown';
            //Module.print('Received key event: ' + event.keyCode);
            var key = event.keyCode;
            if (key >= 65 && key <= 90) {
              key += 32; // make lowercase for SDL
            } else {
              key = SDL.keyCodes[event.keyCode] || event.keyCode;
            }
            var scan;
            if (key >= 1024) {
              scan = key - 1024;
            } else {
              scan = SDL.scanCodes[key] || key;
            }
  
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(8))|0)]=down ? 1 : 0;
            HEAP8[(((ptr)+(9))|0)]=0; // TODO
            HEAP32[(((ptr)+(12))>>2)]=scan;
            HEAP32[(((ptr)+(16))>>2)]=key;
            HEAP16[(((ptr)+(20))>>1)]=SDL.modState;
            // some non-character keys (e.g. backspace and tab) won't have keypressCharCode set, fill in with the keyCode.
            HEAP32[(((ptr)+(24))>>2)]=event.keypressCharCode || key;
  
            break;
          }
          case 'keypress': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            // Not filling in windowID for now
            var cStr = intArrayFromString(String.fromCharCode(event.charCode));
            for (var i = 0; i < cStr.length; ++i) {
              HEAP8[(((ptr)+(8 + i))|0)]=cStr[i];
            }
            break;
          }
          case 'mousedown': case 'mouseup': case 'mousemove': {
            if (event.type != 'mousemove') {
              var down = event.type === 'mousedown';
              HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(8))|0)]=event.button+1; // DOM buttons are 0-2, SDL 1-3
              HEAP8[(((ptr)+(9))|0)]=down ? 1 : 0;
              HEAP32[(((ptr)+(12))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(16))>>2)]=Browser.mouseY;
            } else {
              HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
              HEAP8[(((ptr)+(8))|0)]=SDL.buttonState;
              HEAP32[(((ptr)+(12))>>2)]=Browser.mouseX;
              HEAP32[(((ptr)+(16))>>2)]=Browser.mouseY;
              HEAP32[(((ptr)+(20))>>2)]=Browser.mouseMovementX;
              HEAP32[(((ptr)+(24))>>2)]=Browser.mouseMovementY;
            }
            break;
          }
          case 'unload': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            break;
          }
          case 'resize': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP32[(((ptr)+(4))>>2)]=event.w;
            HEAP32[(((ptr)+(8))>>2)]=event.h;
            break;
          }
          case 'joystick_button_up': case 'joystick_button_down': {
            var state = event.type === 'joystick_button_up' ? 0 : 1;
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(4))|0)]=event.index;
            HEAP8[(((ptr)+(5))|0)]=event.button;
            HEAP8[(((ptr)+(6))|0)]=state;
            break;
          }
          case 'joystick_axis_motion': {
            HEAP32[((ptr)>>2)]=SDL.DOMEventToSDLEvent[event.type];
            HEAP8[(((ptr)+(4))|0)]=event.index;
            HEAP8[(((ptr)+(5))|0)]=event.axis;
            HEAP32[(((ptr)+(8))>>2)]=SDL.joystickAxisValueConversion(event.value);
            break;
          }
          default: throw 'Unhandled SDL event: ' + event.type;
        }
      },estimateTextWidth:function (fontData, text) {
        var h = fontData.size;
        var fontString = h + 'px ' + fontData.name;
        var tempCtx = SDL.ttfContext;
        assert(tempCtx, 'TTF_Init must have been called');
        tempCtx.save();
        tempCtx.font = fontString;
        var ret = tempCtx.measureText(text).width | 0;
        tempCtx.restore();
        return ret;
      },allocateChannels:function (num) { // called from Mix_AllocateChannels and init
        if (SDL.numChannels && SDL.numChannels >= num && num != 0) return;
        SDL.numChannels = num;
        SDL.channels = [];
        for (var i = 0; i < num; i++) {
          SDL.channels[i] = {
            audio: null,
            volume: 1.0
          };
        }
      },setGetVolume:function (info, volume) {
        if (!info) return 0;
        var ret = info.volume * 128; // MIX_MAX_VOLUME
        if (volume != -1) {
          info.volume = volume / 128;
          if (info.audio) info.audio.volume = info.volume;
        }
        return ret;
      },fillWebAudioBufferFromHeap:function (heapPtr, sizeSamplesPerChannel, dstAudioBuffer) {
        // The input audio data is interleaved across the channels, i.e. [L, R, L, R, L, R, ...] and is either 8-bit or 16-bit as
        // supported by the SDL API. The output audio wave data for Web Audio API must be in planar buffers of [-1,1]-normalized Float32 data,
        // so perform a buffer conversion for the data.
        var numChannels = SDL.audio.channels;
        for(var c = 0; c < numChannels; ++c) {
          var channelData = dstAudioBuffer['getChannelData'](c);
          if (channelData.length != sizeSamplesPerChannel) {
            throw 'Web Audio output buffer length mismatch! Destination size: ' + channelData.length + ' samples vs expected ' + sizeSamplesPerChannel + ' samples!';
          }
          if (SDL.audio.format == 0x8010 /*AUDIO_S16LSB*/) {
            for(var j = 0; j < sizeSamplesPerChannel; ++j) {
              channelData[j] = (HEAP16[(((heapPtr)+((j*numChannels + c)*2))>>1)]) / 0x8000;
            }
          } else if (SDL.audio.format == 0x0008 /*AUDIO_U8*/) {
            for(var j = 0; j < sizeSamplesPerChannel; ++j) {
              var v = (HEAP8[(((heapPtr)+(j*numChannels + c))|0)]);
              channelData[j] = ((v >= 0) ? v-128 : v+128) /128;
            }
          }
        }
      },debugSurface:function (surfData) {
        console.log('dumping surface ' + [surfData.surf, surfData.source, surfData.width, surfData.height]);
        var image = surfData.ctx.getImageData(0, 0, surfData.width, surfData.height);
        var data = image.data;
        var num = Math.min(surfData.width, surfData.height);
        for (var i = 0; i < num; i++) {
          console.log('   diagonal ' + i + ':' + [data[i*surfData.width*4 + i*4 + 0], data[i*surfData.width*4 + i*4 + 1], data[i*surfData.width*4 + i*4 + 2], data[i*surfData.width*4 + i*4 + 3]]);
        }
      },joystickEventState:1,lastJoystickState:{},joystickNamePool:{},recordJoystickState:function (joystick, state) {
        // Standardize button state.
        var buttons = new Array(state.buttons.length);
        for (var i = 0; i < state.buttons.length; i++) {
          buttons[i] = SDL.getJoystickButtonState(state.buttons[i]);
        }
  
        SDL.lastJoystickState[joystick] = {
          buttons: buttons,
          axes: state.axes.slice(0),
          timestamp: state.timestamp,
          index: state.index,
          id: state.id
        };
      },getJoystickButtonState:function (button) {
        if (typeof button === 'object') {
          // Current gamepad API editor's draft (Firefox Nightly)
          // https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#idl-def-GamepadButton
          return button.pressed;
        } else {
          // Current gamepad API working draft (Firefox / Chrome Stable)
          // http://www.w3.org/TR/2012/WD-gamepad-20120529/#gamepad-interface
          return button > 0;
        }
      },queryJoysticks:function () {
        for (var joystick in SDL.lastJoystickState) {
          var state = SDL.getGamepad(joystick - 1);
          var prevState = SDL.lastJoystickState[joystick];
          // Check only if the timestamp has differed.
          // NOTE: Timestamp is not available in Firefox.
          if (typeof state.timestamp !== 'number' || state.timestamp !== prevState.timestamp) {
            var i;
            for (i = 0; i < state.buttons.length; i++) {
              var buttonState = SDL.getJoystickButtonState(state.buttons[i]);
              // NOTE: The previous state already has a boolean representation of
              //       its button, so no need to standardize its button state here.
              if (buttonState !== prevState.buttons[i]) {
                // Insert button-press event.
                SDL.events.push({
                  type: buttonState ? 'joystick_button_down' : 'joystick_button_up',
                  joystick: joystick,
                  index: joystick - 1,
                  button: i
                });
              }
            }
            for (i = 0; i < state.axes.length; i++) {
              if (state.axes[i] !== prevState.axes[i]) {
                // Insert axes-change event.
                SDL.events.push({
                  type: 'joystick_axis_motion',
                  joystick: joystick,
                  index: joystick - 1,
                  axis: i,
                  value: state.axes[i]
                });
              }
            }
  
            SDL.recordJoystickState(joystick, state);
          }
        }
      },joystickAxisValueConversion:function (value) {
        // Ensures that 0 is 0, 1 is 32767, and -1 is 32768.
        return Math.ceil(((value+1) * 32767.5) - 32768);
      },getGamepads:function () {
        var fcn = navigator.getGamepads || navigator.webkitGamepads || navigator.mozGamepads || navigator.gamepads || navigator.webkitGetGamepads;
        if (fcn !== undefined) {
          // The function must be applied on the navigator object.
          return fcn.apply(navigator);
        } else {
          return [];
        }
      },getGamepad:function (deviceIndex) {
        var gamepads = SDL.getGamepads();
        if (gamepads.length > deviceIndex && deviceIndex >= 0) {
          return gamepads[deviceIndex];
        }
        return null;
      }};function _SDL_GetTicks() {
      return Math.floor(Date.now() - SDL.startTime);
    }

  
  var GLFW={keyFunc:null,charFunc:null,mouseButtonFunc:null,mousePosFunc:null,mouseWheelFunc:null,resizeFunc:null,closeFunc:null,refreshFunc:null,params:null,initTime:null,wheelPos:0,buttons:0,keys:0,initWindowWidth:640,initWindowHeight:480,windowX:0,windowY:0,windowWidth:0,windowHeight:0,DOMToGLFWKeyCode:function (keycode) {
        switch (keycode) {
          case 0x09: return 295 ; //DOM_VK_TAB -> GLFW_KEY_TAB
          case 0x1B: return 255 ; //DOM_VK_ESCAPE -> GLFW_KEY_ESC
          case 0x6A: return 313 ; //DOM_VK_MULTIPLY -> GLFW_KEY_KP_MULTIPLY
          case 0x6B: return 315 ; //DOM_VK_ADD -> GLFW_KEY_KP_ADD
          case 0x6D: return 314 ; //DOM_VK_SUBTRACT -> GLFW_KEY_KP_SUBTRACT
          case 0x6E: return 316 ; //DOM_VK_DECIMAL -> GLFW_KEY_KP_DECIMAL
          case 0x6F: return 312 ; //DOM_VK_DIVIDE -> GLFW_KEY_KP_DIVIDE
          case 0x70: return 258 ; //DOM_VK_F1 -> GLFW_KEY_F1
          case 0x71: return 259 ; //DOM_VK_F2 -> GLFW_KEY_F2
          case 0x72: return 260 ; //DOM_VK_F3 -> GLFW_KEY_F3
          case 0x73: return 261 ; //DOM_VK_F4 -> GLFW_KEY_F4
          case 0x74: return 262 ; //DOM_VK_F5 -> GLFW_KEY_F5
          case 0x75: return 263 ; //DOM_VK_F6 -> GLFW_KEY_F6
          case 0x76: return 264 ; //DOM_VK_F7 -> GLFW_KEY_F7
          case 0x77: return 265 ; //DOM_VK_F8 -> GLFW_KEY_F8
          case 0x78: return 266 ; //DOM_VK_F9 -> GLFW_KEY_F9
          case 0x79: return 267 ; //DOM_VK_F10 -> GLFW_KEY_F10
          case 0x7a: return 268 ; //DOM_VK_F11 -> GLFW_KEY_F11
          case 0x7b: return 269 ; //DOM_VK_F12 -> GLFW_KEY_F12
          case 0x25: return 285 ; //DOM_VK_LEFT -> GLFW_KEY_LEFT
          case 0x26: return 283 ; //DOM_VK_UP -> GLFW_KEY_UP
          case 0x27: return 286 ; //DOM_VK_RIGHT -> GLFW_KEY_RIGHT
          case 0x28: return 284 ; //DOM_VK_DOWN -> GLFW_KEY_DOWN
          case 0x21: return 298 ; //DOM_VK_PAGE_UP -> GLFW_KEY_PAGEUP
          case 0x22: return 299 ; //DOM_VK_PAGE_DOWN -> GLFW_KEY_PAGEDOWN
          case 0x24: return 300 ; //DOM_VK_HOME -> GLFW_KEY_HOME
          case 0x23: return 301 ; //DOM_VK_END -> GLFW_KEY_END
          case 0x2d: return 296 ; //DOM_VK_INSERT -> GLFW_KEY_INSERT
          case 16  : return 287 ; //DOM_VK_SHIFT -> GLFW_KEY_LSHIFT
          case 0x05: return 287 ; //DOM_VK_LEFT_SHIFT -> GLFW_KEY_LSHIFT
          case 0x06: return 288 ; //DOM_VK_RIGHT_SHIFT -> GLFW_KEY_RSHIFT
          case 17  : return 289 ; //DOM_VK_CONTROL -> GLFW_KEY_LCTRL
          case 0x03: return 289 ; //DOM_VK_LEFT_CONTROL -> GLFW_KEY_LCTRL
          case 0x04: return 290 ; //DOM_VK_RIGHT_CONTROL -> GLFW_KEY_RCTRL
          case 18  : return 291 ; //DOM_VK_ALT -> GLFW_KEY_LALT
          case 0x02: return 291 ; //DOM_VK_LEFT_ALT -> GLFW_KEY_LALT
          case 0x01: return 292 ; //DOM_VK_RIGHT_ALT -> GLFW_KEY_RALT
          case 96  : return 302 ; //GLFW_KEY_KP_0
          case 97  : return 303 ; //GLFW_KEY_KP_1
          case 98  : return 304 ; //GLFW_KEY_KP_2
          case 99  : return 305 ; //GLFW_KEY_KP_3
          case 100 : return 306 ; //GLFW_KEY_KP_4
          case 101 : return 307 ; //GLFW_KEY_KP_5
          case 102 : return 308 ; //GLFW_KEY_KP_6
          case 103 : return 309 ; //GLFW_KEY_KP_7
          case 104 : return 310 ; //GLFW_KEY_KP_8
          case 105 : return 311 ; //GLFW_KEY_KP_9
          default  : return keycode;
        };
      },getUnicodeChar:function (value) {
        var output = '';
        if (value > 0xFFFF) {
          value -= 0x10000;
          output += String.fromCharCode(value >>> 10 & 0x3FF | 0xD800);
          value = 0xDC00 | value & 0x3FF;
        }
        output += String.fromCharCode(value);
        return output;
      },onKeyPress:function (event) {
        //charCode is only available whith onKeyPress event
        var char = GLFW.getUnicodeChar(event.charCode);
  
        if (event.charCode) {
          var char = GLFW.getUnicodeChar(event.charCode);
          if (char !== null && GLFW.charFunc) {
            Runtime.dynCall('vii', GLFW.charFunc, [event.charCode, 1]);
          }
        }
      },onKeyChanged:function (event, status) {
        var key = GLFW.DOMToGLFWKeyCode(event.keyCode);
        if (key && GLFW.keyFunc) {
          GLFW.keys[key] = status;
          Runtime.dynCall('vii', GLFW.keyFunc, [key, status]);
        }
      },onKeydown:function (event) {
        GLFW.onKeyChanged(event, 1);//GLFW_PRESS
        // This logic comes directly from the sdl implementation. We cannot
        // call preventDefault on all keydown events otherwise onKeyPress will
        // not get called
        if (event.keyCode === 8 /* backspace */ || event.keyCode === 9 /* tab */) {
          event.preventDefault();
        }
      },onKeyup:function (event) {
        GLFW.onKeyChanged(event, 0);//GLFW_RELEASE
      },onMousemove:function (event) {
        /* Send motion event only if the motion changed, prevents
         * spamming our app with uncessary callback call. It does happen in
         * Chrome on Windows.
         */
        var lastX = Browser.mouseX;
        var lastY = Browser.mouseY;
        Browser.calculateMouseEvent(event);
        var newX = Browser.mouseX;
        var newY = Browser.mouseY;
  
        if (event.target == Module["canvas"] && GLFW.mousePosFunc) {
          event.preventDefault();
          Runtime.dynCall('vii', GLFW.mousePosFunc, [lastX, lastY]);
        }
      },onMouseButtonChanged:function (event, status) {
        if (GLFW.mouseButtonFunc == null) {
          return;
        }
  
        Browser.calculateMouseEvent(event);
  
        if (event.target != Module["canvas"]) {
          return;
        }
  
        if (status == 1) {//GLFW_PRESS
          try {
            event.target.setCapture();
          } catch (e) {}
        }
  
        event.preventDefault();
        //DOM and glfw have the same button codes
        Runtime.dynCall('vii', GLFW.mouseButtonFunc, [event['button'], status]);
      },onMouseButtonDown:function (event) {
        GLFW.buttons |= (1 << event['button']);
        GLFW.onMouseButtonChanged(event, 1);//GLFW_PRESS
      },onMouseButtonUp:function (event) {
        GLFW.buttons &= ~(1 << event['button']);
        GLFW.onMouseButtonChanged(event, 0);//GLFW_RELEASE
      },onMouseWheel:function (event) {
        GLFW.wheelPos += Browser.getMouseWheelDelta(event);
  
        if (GLFW.mouseWheelFunc && event.target == Module["canvas"]) {
          Runtime.dynCall('vi', GLFW.mouseWheelFunc, [GLFW.wheelPos]);
          event.preventDefault();
        }
      },onFullScreenEventChange:function (event) {
        var width;
        var height;
        if (document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
          width = screen["width"];
          height = screen["height"];
        }
        else {
          width = GLFW.windowWidth;
          height = GLFW.windowHeight;
          // TODO set position
          document.removeEventListener('fullscreenchange', GLFW.onFullScreenEventChange, true);
          document.removeEventListener('mozfullscreenchange', GLFW.onFullScreenEventChange, true);
          document.removeEventListener('webkitfullscreenchange', GLFW.onFullScreenEventChange, true);
        }
        Browser.setCanvasSize(width, height);
  
        if (GLFW.resizeFunc) {
          Runtime.dynCall('vii', GLFW.resizeFunc, [width, height]);
        }
      },requestFullScreen:function () {
        var RFS = Module["canvas"]['requestFullscreen'] ||
                  Module["canvas"]['requestFullScreen'] ||
                  Module["canvas"]['mozRequestFullScreen'] ||
                  Module["canvas"]['webkitRequestFullScreen'] ||
                  (function() {});
        RFS.apply(Module["canvas"], []);
      },cancelFullScreen:function () {
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['webkitCancelFullScreen'] ||
            (function() {});
        CFS.apply(document, []);
      }};function _glfwSetKeyCallback(cbfun) {
      GLFW.keyFunc = cbfun;
    }

  function _js_ascii_onMouseKeyEvent(functionName,el,ev,isDown) {
  	  if (functionName!=0) {
  	    var state;
  		if (ev.button==0)
  		  state = 1<<0;
  		else if (ev.button==2)
  		  state = 1<<1;
  		  console.log ("mouse key "+ev.button+" = "+isDown);
  		Module.ccall(functionName,'number',['number','number'],[state,isDown]);
  	  }
  	}

  function ___errno_location() {
      return ___errno_state;
    }

  function _glfwInit() {
      GLFW.initTime = Date.now() / 1000;
  
      window.addEventListener("keydown", GLFW.onKeydown, true);
      window.addEventListener("keypress", GLFW.onKeyPress, true);
      window.addEventListener("keyup", GLFW.onKeyup, true);
      window.addEventListener("mousemove", GLFW.onMousemove, true);
      window.addEventListener("mousedown", GLFW.onMouseButtonDown, true);
      window.addEventListener("mouseup", GLFW.onMouseButtonUp, true);
      window.addEventListener('DOMMouseScroll', GLFW.onMouseWheel, true);
      window.addEventListener('mousewheel', GLFW.onMouseWheel, true);
  
      __ATEXIT__.push({ func: function() {
        window.removeEventListener("keydown", GLFW.onKeydown, true);
        window.removeEventListener("keypress", GLFW.onKeyPress, true);
        window.removeEventListener("keyup", GLFW.onKeyup, true);
        window.removeEventListener("mousemove", GLFW.onMousemove, true);
        window.removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
        window.removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
        window.removeEventListener('DOMMouseScroll', GLFW.onMouseWheel, true);
        window.removeEventListener('mousewheel', GLFW.onMouseWheel, true);
        Module["canvas"].width = Module["canvas"].height = 1;
      }});
  
      //TODO: Init with correct values
      GLFW.params = new Array();
      GLFW.params[0x00030001] = true; //GLFW_MOUSE_CURSOR
      GLFW.params[0x00030002] = false; //GLFW_STICKY_KEYS
      GLFW.params[0x00030003] = true; //GLFW_STICKY_MOUSE_BUTTONS
      GLFW.params[0x00030004] = false; //GLFW_SYSTEM_KEYS
      GLFW.params[0x00030005] = false; //GLFW_KEY_REPEAT
      GLFW.params[0x00030006] = true; //GLFW_AUTO_POLL_EVENTS
      GLFW.params[0x00020001] = true; //GLFW_OPENED
      GLFW.params[0x00020002] = true; //GLFW_ACTIVE
      GLFW.params[0x00020003] = false; //GLFW_ICONIFIED
      GLFW.params[0x00020004] = true; //GLFW_ACCELERATED
      GLFW.params[0x00020005] = 0; //GLFW_RED_BITS
      GLFW.params[0x00020006] = 0; //GLFW_GREEN_BITS
      GLFW.params[0x00020007] = 0; //GLFW_BLUE_BITS
      GLFW.params[0x00020008] = 0; //GLFW_ALPHA_BITS
      GLFW.params[0x00020009] = 0; //GLFW_DEPTH_BITS
      GLFW.params[0x0002000A] = 0; //GLFW_STENCIL_BITS
      GLFW.params[0x0002000B] = 0; //GLFW_REFRESH_RATE
      GLFW.params[0x0002000C] = 0; //GLFW_ACCUM_RED_BITS
      GLFW.params[0x0002000D] = 0; //GLFW_ACCUM_GREEN_BITS
      GLFW.params[0x0002000E] = 0; //GLFW_ACCUM_BLUE_BITS
      GLFW.params[0x0002000F] = 0; //GLFW_ACCUM_ALPHA_BITS
      GLFW.params[0x00020010] = 0; //GLFW_AUX_BUFFERS
      GLFW.params[0x00020011] = 0; //GLFW_STEREO
      GLFW.params[0x00020012] = 0; //GLFW_WINDOW_NO_RESIZE
      GLFW.params[0x00020013] = 0; //GLFW_FSAA_SAMPLES
      GLFW.params[0x00020014] = 0; //GLFW_OPENGL_VERSION_MAJOR
      GLFW.params[0x00020015] = 0; //GLFW_OPENGL_VERSION_MINOR
      GLFW.params[0x00020016] = 0; //GLFW_OPENGL_FORWARD_COMPAT
      GLFW.params[0x00020017] = 0; //GLFW_OPENGL_DEBUG_CONTEXT
      GLFW.params[0x00020018] = 0; //GLFW_OPENGL_PROFILE
  
      GLFW.keys = new Array();
  
      return 1; //GL_TRUE
    }

  function _llvm_lifetime_start() {}

  function _abort() {
      Module['abort']();
    }


  
  
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _js_ascii_toggleEvents(toggle) {
  	  var console = document.getElementById('console');
  	  var mouseDown=function (ev) {_js_ascii_onMouseKeyEvent('_onjs_fireMouseKey',this,ev,1);return false};
  	  var mouseUp=function (ev) {_js_ascii_onMouseKeyEvent('_onjs_fireMouseKey',this,ev,0);return false;};
  	  var mouseMove=function (ev) {_js_ascii_onMouseMoveEvent('_onjs_fireMouseMove',this,ev);return false;};
  	  if (toggle>0) {
  	    console.addEventListener('mousedown',mouseDown,true); //Opera needs a special reminder to not select text
  	    console.addEventListener('mouseup',mouseUp,true);
  	    console.addEventListener('mousemove',mouseMove,true);
  	  }
  	  else {
  	    console.removeEventListener('mousedown',mouseDown,true);
  	    console.removeEventListener('mouseup',mouseUp,true);
  	    console.removeEventListener('mousemove',mouseMove,true);
  	  }
  	}

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  
  var ___rand_seed=allocate([0x0273459b, 0, 0, 0], "i32", ALLOC_STATIC);function _srand(seed) {
      HEAP32[((___rand_seed)>>2)]=seed
    }

  function _js_ascii_setTimeout(ms,id) {
  	  fireTimeout = Module.cwrap('_onjs_fireTimeout', 'number', ['number']);
  	  setTimeout (function () {fireTimeout(id);},ms);
  	}

  function _js_ascii_changeConsoleColors(backColor,foreColor) {
  	  var console=document.getElementById('console');
  	  console.style.backgroundColor='#'+Pointer_stringify(backColor);
  	  console.style.color='#'+Pointer_stringify(foreColor);
  	}
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info."); abort(x) }

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'almost asm';
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);

  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = +env.NaN, inf = +env.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var abort=env.abort;
  var assert=env.assert;
  var asmPrintInt=env.asmPrintInt;
  var asmPrintFloat=env.asmPrintFloat;
  var Math_min=env.min;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_v=env.nullFunc_v;
  var nullFunc_iii=env.nullFunc_iii;
  var invoke_iiii=env.invoke_iiii;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_viii=env.invoke_viii;
  var invoke_v=env.invoke_v;
  var invoke_iii=env.invoke_iii;
  var _llvm_lifetime_start=env._llvm_lifetime_start;
  var _glfwInit=env._glfwInit;
  var __reallyNegative=env.__reallyNegative;
  var _SDL_GetTicks=env._SDL_GetTicks;
  var _js_ascii_changeConsoleText=env._js_ascii_changeConsoleText;
  var _fflush=env._fflush;
  var ___setErrNo=env.___setErrNo;
  var _sbrk=env._sbrk;
  var _snprintf=env._snprintf;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _sysconf=env._sysconf;
  var _srand=env._srand;
  var _llvm_lifetime_end=env._llvm_lifetime_end;
  var _sprintf=env._sprintf;
  var _toupper=env._toupper;
  var ___errno_location=env.___errno_location;
  var _js_ascii_onMouseMoveEvent=env._js_ascii_onMouseMoveEvent;
  var _js_ascii_toggleEvents=env._js_ascii_toggleEvents;
  var _glfwSetKeyCallback=env._glfwSetKeyCallback;
  var _abort=env._abort;
  var _js_ascii_onMouseKeyEvent=env._js_ascii_onMouseKeyEvent;
  var _time=env._time;
  var __formatString=env.__formatString;
  var _js_ascii_setTimeout=env._js_ascii_setTimeout;
  var _js_ascii_setConsoleSize=env._js_ascii_setConsoleSize;
  var _js_ascii_changeConsoleColors=env._js_ascii_changeConsoleColors;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
STACKTOP = (STACKTOP + 7)&-8;
  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1|0] = HEAP8[ptr+1|0];
  HEAP8[tempDoublePtr+2|0] = HEAP8[ptr+2|0];
  HEAP8[tempDoublePtr+3|0] = HEAP8[ptr+3|0];
  HEAP8[tempDoublePtr+4|0] = HEAP8[ptr+4|0];
  HEAP8[tempDoublePtr+5|0] = HEAP8[ptr+5|0];
  HEAP8[tempDoublePtr+6|0] = HEAP8[ptr+6|0];
  HEAP8[tempDoublePtr+7|0] = HEAP8[ptr+7|0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}

function setTempRet1(value) {
  value = value|0;
  tempRet1 = value;
}

function setTempRet2(value) {
  value = value|0;
  tempRet2 = value;
}

function setTempRet3(value) {
  value = value|0;
  tempRet3 = value;
}

function setTempRet4(value) {
  value = value|0;
  tempRet4 = value;
}

function setTempRet5(value) {
  value = value|0;
  tempRet5 = value;
}

function setTempRet6(value) {
  value = value|0;
  tempRet6 = value;
}

function setTempRet7(value) {
  value = value|0;
  tempRet7 = value;
}

function setTempRet8(value) {
  value = value|0;
  tempRet8 = value;
}

function setTempRet9(value) {
  value = value|0;
  tempRet9 = value;
}

function _asciiInit($g,$w,$h) {
 $g = $g|0;
 $w = $w|0;
 $h = $h|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $7 = 0, $8 = 0, $9 = 0, $e = 0, $graphic = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 120|0;
 $$byval_copy = sp;
 $graphic = sp + 48|0;
 $5 = sp + 80|0;
 $6 = sp + 88|0;
 $2 = $g;
 $3 = $w;
 $4 = $h;
 $7 = $3;
 $8 = ($7|0)>(0);
 do {
  if ($8) {
   $9 = $4;
   $10 = ($9|0)>(0);
   if (!($10)) {
    break;
   }
   $11 = $2;
   $12 = $11&255;
   switch ($12|0) {
   case 1:  {
    $13 = $graphic;
    ;HEAP32[$13+0>>2]=HEAP32[(392)+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[(392)+4>>2]|0;HEAP32[$13+8>>2]=HEAP32[(392)+8>>2]|0;HEAP32[$13+12>>2]=HEAP32[(392)+12>>2]|0;HEAP32[$13+16>>2]=HEAP32[(392)+16>>2]|0;HEAP32[$13+20>>2]=HEAP32[(392)+20>>2]|0;HEAP32[$13+24>>2]=HEAP32[(392)+24>>2]|0;
    break;
   }
   case 2:  {
    $14 = $graphic;
    ;HEAP32[$14+0>>2]=HEAP32[(424)+0>>2]|0;HEAP32[$14+4>>2]=HEAP32[(424)+4>>2]|0;HEAP32[$14+8>>2]=HEAP32[(424)+8>>2]|0;HEAP32[$14+12>>2]=HEAP32[(424)+12>>2]|0;HEAP32[$14+16>>2]=HEAP32[(424)+16>>2]|0;HEAP32[$14+20>>2]=HEAP32[(424)+20>>2]|0;HEAP32[$14+24>>2]=HEAP32[(424)+24>>2]|0;
    break;
   }
   case 4:  {
    $15 = $graphic;
    ;HEAP32[$15+0>>2]=HEAP32[(888)+0>>2]|0;HEAP32[$15+4>>2]=HEAP32[(888)+4>>2]|0;HEAP32[$15+8>>2]=HEAP32[(888)+8>>2]|0;HEAP32[$15+12>>2]=HEAP32[(888)+12>>2]|0;HEAP32[$15+16>>2]=HEAP32[(888)+16>>2]|0;HEAP32[$15+20>>2]=HEAP32[(888)+20>>2]|0;HEAP32[$15+24>>2]=HEAP32[(888)+24>>2]|0;
    break;
   }
   case 8:  {
    $16 = $graphic;
    ;HEAP32[$16+0>>2]=HEAP32[(456)+0>>2]|0;HEAP32[$16+4>>2]=HEAP32[(456)+4>>2]|0;HEAP32[$16+8>>2]=HEAP32[(456)+8>>2]|0;HEAP32[$16+12>>2]=HEAP32[(456)+12>>2]|0;HEAP32[$16+16>>2]=HEAP32[(456)+16>>2]|0;HEAP32[$16+20>>2]=HEAP32[(456)+20>>2]|0;HEAP32[$16+24>>2]=HEAP32[(456)+24>>2]|0;
    break;
   }
   case 16:  {
    $17 = $graphic;
    ;HEAP32[$17+0>>2]=HEAP32[(488)+0>>2]|0;HEAP32[$17+4>>2]=HEAP32[(488)+4>>2]|0;HEAP32[$17+8>>2]=HEAP32[(488)+8>>2]|0;HEAP32[$17+12>>2]=HEAP32[(488)+12>>2]|0;HEAP32[$17+16>>2]=HEAP32[(488)+16>>2]|0;HEAP32[$17+20>>2]=HEAP32[(488)+20>>2]|0;HEAP32[$17+24>>2]=HEAP32[(488)+24>>2]|0;
    break;
   }
   case 5:  {
    $18 = $graphic;
    ;HEAP32[$18+0>>2]=HEAP32[(888)+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[(888)+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[(888)+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[(888)+12>>2]|0;HEAP32[$18+16>>2]=HEAP32[(888)+16>>2]|0;HEAP32[$18+20>>2]=HEAP32[(888)+20>>2]|0;HEAP32[$18+24>>2]=HEAP32[(888)+24>>2]|0;
    break;
   }
   default: {
    $1 = 0;
    $64 = $1;
    STACKTOP = sp;return ($64|0);
   }
   }
   $19 = ($graphic);
   $20 = $19;
   $21 = HEAP32[$20>>2]|0;
   $22 = ($21|0)!=(0|0);
   if (!($22)) {
    $1 = 0;
    $64 = $1;
    STACKTOP = sp;return ($64|0);
   }
   $23 = (_malloc(372)|0);
   $24 = $23;
   $e = $24;
   $25 = $e;
   $26 = $25;
   _memcpy(($26|0),((8)|0),372)|0;
   $27 = ($graphic);
   $28 = $27;
   $29 = HEAP32[$28>>2]|0;
   $30 = $e;
   $31 = $3;
   $32 = $4;
   $33 = (FUNCTION_TABLE_iiii[$29 & 1]($30,$31,$32)|0);
   $34 = ($33<<24>>24)!=(0);
   if (!($34)) {
    $35 = $e;
    $36 = $35;
    _free($36);
    $1 = 0;
    $64 = $1;
    STACKTOP = sp;return ($64|0);
   }
   $37 = $e;
   $38 = (($37) + 32|0);
   $39 = ($5);
   $40 = $3;
   HEAP32[$39>>2] = $40;
   $41 = (($5) + 4|0);
   $42 = $4;
   HEAP32[$41>>2] = $42;
   $43 = $$byval_copy;
   $44 = $$byval_copy;
   $45 = $5;
   ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;
   _asciiCreateColoredBitmap($6,$$byval_copy);
   $46 = $$byval_copy;
   $47 = $38;
   $48 = $6;
   ;HEAP32[$47+0>>2]=HEAP32[$48+0>>2]|0;HEAP32[$47+4>>2]=HEAP32[$48+4>>2]|0;HEAP32[$47+8>>2]=HEAP32[$48+8>>2]|0;HEAP32[$47+12>>2]=HEAP32[$48+12>>2]|0;HEAP32[$47+16>>2]=HEAP32[$48+16>>2]|0;HEAP32[$47+20>>2]=HEAP32[$48+20>>2]|0;HEAP32[$47+24>>2]=HEAP32[$48+24>>2]|0;HEAP32[$47+28>>2]=HEAP32[$48+28>>2]|0;
   $49 = $e;
   $50 = (($49) + 32|0);
   $51 = (($50) + 16|0);
   $52 = HEAP32[$51>>2]|0;
   $53 = ($52|0)!=(0|0);
   if ($53) {
    $59 = $e;
    $60 = ($59);
    $61 = $60;
    $62 = $graphic;
    ;HEAP32[$61+0>>2]=HEAP32[$62+0>>2]|0;HEAP32[$61+4>>2]=HEAP32[$62+4>>2]|0;HEAP32[$61+8>>2]=HEAP32[$62+8>>2]|0;HEAP32[$61+12>>2]=HEAP32[$62+12>>2]|0;HEAP32[$61+16>>2]=HEAP32[$62+16>>2]|0;HEAP32[$61+20>>2]=HEAP32[$62+20>>2]|0;HEAP32[$61+24>>2]=HEAP32[$62+24>>2]|0;
    $63 = $e;
    $1 = $63;
    $64 = $1;
    STACKTOP = sp;return ($64|0);
   } else {
    $54 = (($graphic) + 8|0);
    $55 = HEAP32[$54>>2]|0;
    $56 = $e;
    FUNCTION_TABLE_vi[$55 & 7]($56);
    $57 = $e;
    $58 = $57;
    _free($58);
    $1 = 0;
    $64 = $1;
    STACKTOP = sp;return ($64|0);
   }
  }
 } while(0);
 $1 = 0;
 $64 = $1;
 STACKTOP = sp;return ($64|0);
}
function _asciiCreateColoredBitmap($agg$result,$size) {
 $agg$result = $agg$result|0;
 $size = $size|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $asciiDefaultClearChar$byval_copy = 0, $size$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $asciiDefaultClearChar$byval_copy = sp;
 $size$byval_copy = sp + 8|0;
 $1 = $size$byval_copy;
 $2 = $size$byval_copy;
 $3 = $size;
 ;HEAP32[$2+0>>2]=HEAP32[$3+0>>2]|0;HEAP32[$2+4>>2]=HEAP32[$3+4>>2]|0;
 $4 = $asciiDefaultClearChar$byval_copy;
 $5 = $asciiDefaultClearChar$byval_copy;
 $6 = (384);
 ;HEAP8[$5+0|0]=HEAP8[$6+0|0]|0;HEAP8[$5+1|0]=HEAP8[$6+1|0]|0;HEAP8[$5+2|0]=HEAP8[$6+2|0]|0;HEAP8[$5+3|0]=HEAP8[$6+3|0]|0;
 _asciiCreateFilledColoredBitmap($agg$result,$size$byval_copy,$asciiDefaultClearChar$byval_copy);
 $7 = $asciiDefaultClearChar$byval_copy;
 $8 = $size$byval_copy;
 STACKTOP = sp;return;
}
function _asciiRun($e) {
 $e = $e|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $2 = $1;
 $3 = ($2|0)!=(0|0);
 if (!($3)) {
  STACKTOP = sp;return;
 }
 $4 = $1;
 $5 = ($4);
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = $1;
 FUNCTION_TABLE_vi[$7 & 7]($8);
 STACKTOP = sp;return;
}
function _asciiQuit($e) {
 $e = $e|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $2 = $1;
 $3 = ($2|0)!=(0|0);
 if (!($3)) {
  STACKTOP = sp;return;
 }
 $4 = $1;
 $5 = (($4) + 172|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($6|0)!=(0|0);
 if ($7) {
  $8 = $1;
  $9 = (($8) + 172|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = $1;
  $12 = (($11) + 176|0);
  $13 = HEAP32[$12>>2]|0;
  FUNCTION_TABLE_vi[$10 & 7]($13);
 }
 $14 = $1;
 $15 = ($14);
 $16 = (($15) + 8|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = $1;
 FUNCTION_TABLE_vi[$17 & 7]($18);
 $19 = $1;
 $20 = (($19) + 32|0);
 _asciiFreeColoredBitmap($20);
 $21 = $1;
 $22 = $21;
 _free($22);
 STACKTOP = sp;return;
}
function _asciiFreeColoredBitmap($bm) {
 $bm = $bm|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = sp + 8|0;
 $1 = $bm;
 $3 = $1;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  STACKTOP = sp;return;
 }
 $5 = $1;
 $6 = (($5) + 16|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)!=(0|0);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 $9 = $1;
 $10 = (($9) + 24|0);
 $11 = HEAP8[$10]|0;
 $12 = $11 << 24 >> 24;
 $13 = ($12|0)==(1);
 if ($13) {
  $14 = $1;
  $15 = (($14) + 16|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = $16;
  _free($17);
 }
 $18 = $1;
 $19 = (($18) + 16|0);
 HEAP32[$19>>2] = 0;
 $20 = $1;
 $21 = (($20) + 20|0);
 $22 = ($21);
 HEAP8[$22] = 0;
 $23 = $1;
 $24 = ($23);
 $25 = ($2);
 $26 = ($25);
 HEAP32[$26>>2] = 0;
 $27 = (($25) + 4|0);
 HEAP32[$27>>2] = 0;
 $28 = (($2) + 8|0);
 $29 = ($28);
 HEAP32[$29>>2] = 0;
 $30 = (($28) + 4|0);
 HEAP32[$30>>2] = 0;
 $31 = $24;
 $32 = $2;
 ;HEAP32[$31+0>>2]=HEAP32[$32+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$32+4>>2]|0;HEAP32[$31+8>>2]=HEAP32[$32+8>>2]|0;HEAP32[$31+12>>2]=HEAP32[$32+12>>2]|0;
 STACKTOP = sp;return;
}
function _asciiSetKeyEventCallback($e,$callback,$context) {
 $e = $e|0;
 $callback = $callback|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $callback;
 $3 = $context;
 $4 = $1;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $2;
 $7 = $1;
 $8 = (($7) + 148|0);
 HEAP32[$8>>2] = $6;
 $9 = $3;
 $10 = $1;
 $11 = (($10) + 152|0);
 HEAP32[$11>>2] = $9;
 $12 = $1;
 $13 = ($12);
 $14 = (($13) + 24|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = $1;
 FUNCTION_TABLE_vii[$15 & 15]($16,0);
 STACKTOP = sp;return;
}
function _asciiSetMouseKeyEventCallback($e,$callback,$context) {
 $e = $e|0;
 $callback = $callback|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $callback;
 $3 = $context;
 $4 = $1;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $2;
 $7 = $1;
 $8 = (($7) + 156|0);
 HEAP32[$8>>2] = $6;
 $9 = $3;
 $10 = $1;
 $11 = (($10) + 160|0);
 HEAP32[$11>>2] = $9;
 $12 = $1;
 $13 = ($12);
 $14 = (($13) + 24|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = $1;
 FUNCTION_TABLE_vii[$15 & 15]($16,2);
 STACKTOP = sp;return;
}
function _asciiSetMouseMoveEventCallback($e,$callback,$context) {
 $e = $e|0;
 $callback = $callback|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $callback;
 $3 = $context;
 $4 = $1;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $2;
 $7 = $1;
 $8 = (($7) + 164|0);
 HEAP32[$8>>2] = $6;
 $9 = $3;
 $10 = $1;
 $11 = (($10) + 168|0);
 HEAP32[$11>>2] = $9;
 $12 = $1;
 $13 = ($12);
 $14 = (($13) + 24|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = $1;
 FUNCTION_TABLE_vii[$15 & 15]($16,1);
 STACKTOP = sp;return;
}
function _asciiSetQuitCallback($e,$callback,$context) {
 $e = $e|0;
 $callback = $callback|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $callback;
 $3 = $context;
 $4 = $1;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $2;
 $7 = $1;
 $8 = (($7) + 172|0);
 HEAP32[$8>>2] = $6;
 $9 = $3;
 $10 = $1;
 $11 = (($10) + 176|0);
 HEAP32[$11>>2] = $9;
 $12 = $1;
 $13 = ($12);
 $14 = (($13) + 24|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = $1;
 FUNCTION_TABLE_vii[$15 & 15]($16,3);
 STACKTOP = sp;return;
}
function _asciiIsKeyPressed($e,$key) {
 $e = $e|0;
 $key = $key|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = $e;
 $3 = $key;
 $4 = $2;
 $5 = ($4|0)!=(0|0);
 do {
  if ($5) {
   $6 = $3;
   $7 = $6&255;
   $8 = ($7|0)<(60);
   if (!($8)) {
    break;
   }
   $9 = $3;
   $10 = $9&255;
   $11 = $2;
   $12 = (($11) + 76|0);
   $13 = (($12) + ($10)|0);
   $14 = HEAP8[$13]|0;
   $1 = $14;
   $15 = $1;
   STACKTOP = sp;return ($15|0);
  }
 } while(0);
 $1 = 0;
 $15 = $1;
 STACKTOP = sp;return ($15|0);
}
function _asciiToggle($e,$bit,$set) {
 $e = $e|0;
 $bit = $bit|0;
 $set = $set|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $bit;
 $3 = $set;
 $4 = $1;
 $5 = ($4|0)!=(0|0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $3;
 $7 = ($6<<24>>24)!=(0);
 if ($7) {
  $8 = $2;
  $9 = $1;
  $10 = (($9) + 72|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = $11 | $8;
  HEAP32[$10>>2] = $12;
 } else {
  $13 = $2;
  $14 = $13 ^ -1;
  $15 = $1;
  $16 = (($15) + 72|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17 & $14;
  HEAP32[$16>>2] = $18;
 }
 STACKTOP = sp;return;
}
function _asciiGetTargetSize($agg$result,$e) {
 $agg$result = $agg$result|0;
 $e = $e|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $2 = $1;
 $3 = (($2) + 72|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $4 & 8;
 $6 = ($5>>>0)>(0);
 if ($6) {
  $7 = $1;
  $8 = (($7) + 64|0);
  $9 = HEAP32[$8>>2]|0;
  $12 = $9;
 } else {
  $10 = $1;
  $11 = (($10) + 32|0);
  $12 = $11;
 }
 $13 = ($12);
 $14 = (($13) + 8|0);
 $15 = $agg$result;
 $16 = $14;
 ;HEAP32[$15+0>>2]=HEAP32[$16+0>>2]|0;HEAP32[$15+4>>2]=HEAP32[$16+4>>2]|0;
 STACKTOP = sp;return;
}
function _asciiCreateBitmap($agg$result,$size) {
 $agg$result = $agg$result|0;
 $size = $size|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $asciiDefaultClearChar$byval_copy = 0, $size$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $asciiDefaultClearChar$byval_copy = sp;
 $size$byval_copy = sp + 8|0;
 $1 = $size$byval_copy;
 $2 = $size$byval_copy;
 $3 = $size;
 ;HEAP32[$2+0>>2]=HEAP32[$3+0>>2]|0;HEAP32[$2+4>>2]=HEAP32[$3+4>>2]|0;
 $4 = $asciiDefaultClearChar$byval_copy;
 $5 = $asciiDefaultClearChar$byval_copy;
 $6 = (384);
 ;HEAP8[$5+0|0]=HEAP8[$6+0|0]|0;HEAP8[$5+1|0]=HEAP8[$6+1|0]|0;HEAP8[$5+2|0]=HEAP8[$6+2|0]|0;HEAP8[$5+3|0]=HEAP8[$6+3|0]|0;
 _asciiCreateFilledBitmapEx($agg$result,$size$byval_copy,$asciiDefaultClearChar$byval_copy);
 $7 = $asciiDefaultClearChar$byval_copy;
 $8 = $size$byval_copy;
 STACKTOP = sp;return;
}
function _asciiCreateFilledBitmapEx($agg$result,$size,$ch) {
 $agg$result = $agg$result|0;
 $size = $size|0;
 $ch = $ch|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $bitmap = 0, $memlen = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56|0;
 $bitmap = sp;
 $1 = sp + 40|0;
 $2 = ($size);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($size) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = Math_imul($3, $5)|0;
 $7 = $6;
 $memlen = $7;
 $8 = $memlen;
 $9 = (_malloc($8)|0);
 $10 = (($bitmap) + 16|0);
 HEAP32[$10>>2] = $9;
 $11 = (($bitmap) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = ($12|0)!=(0|0);
 if ($13) {
  $14 = (($bitmap) + 16|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = ($ch);
  $17 = HEAP8[$16]|0;
  $18 = $17 << 24 >> 24;
  $19 = $18&255;
  $20 = $memlen;
  _memset(($15|0),($19|0),($20|0))|0;
 }
 $21 = ($bitmap);
 $22 = ($1);
 $23 = ($22);
 HEAP32[$23>>2] = 0;
 $24 = (($22) + 4|0);
 HEAP32[$24>>2] = 0;
 $25 = (($1) + 8|0);
 $26 = ($25);
 $27 = ($size);
 $28 = HEAP32[$27>>2]|0;
 HEAP32[$26>>2] = $28;
 $29 = (($25) + 4|0);
 $30 = (($size) + 4|0);
 $31 = HEAP32[$30>>2]|0;
 HEAP32[$29>>2] = $31;
 $32 = $21;
 $33 = $1;
 ;HEAP32[$32+0>>2]=HEAP32[$33+0>>2]|0;HEAP32[$32+4>>2]=HEAP32[$33+4>>2]|0;HEAP32[$32+8>>2]=HEAP32[$33+8>>2]|0;HEAP32[$32+12>>2]=HEAP32[$33+12>>2]|0;
 $34 = (($bitmap) + 20|0);
 HEAP8[$34] = 0;
 $35 = (($bitmap) + 21|0);
 HEAP8[$35] = 1;
 $36 = ($bitmap);
 $37 = (($36) + 8|0);
 $38 = ($37);
 $39 = HEAP32[$38>>2]|0;
 $40 = (($bitmap) + 24|0);
 HEAP32[$40>>2] = $39;
 $41 = $agg$result;
 $42 = $bitmap;
 ;HEAP32[$41+0>>2]=HEAP32[$42+0>>2]|0;HEAP32[$41+4>>2]=HEAP32[$42+4>>2]|0;HEAP32[$41+8>>2]=HEAP32[$42+8>>2]|0;HEAP32[$41+12>>2]=HEAP32[$42+12>>2]|0;HEAP32[$41+16>>2]=HEAP32[$42+16>>2]|0;HEAP32[$41+20>>2]=HEAP32[$42+20>>2]|0;HEAP32[$41+24>>2]=HEAP32[$42+24>>2]|0;
 STACKTOP = sp;return;
}
function _asciiCreateFilledColoredBitmap($agg$result,$size,$fillChar) {
 $agg$result = $agg$result|0;
 $size = $size|0;
 $fillChar = $fillChar|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $bitmap = 0, $memlen = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $bitmap = sp;
 $1 = sp + 40|0;
 $2 = sp + 56|0;
 $3 = ($size);
 $4 = HEAP32[$3>>2]|0;
 $5 = (($size) + 4|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = Math_imul($4, $6)|0;
 $8 = $7<<2;
 $memlen = $8;
 $9 = $memlen;
 $10 = (_malloc($9)|0);
 $11 = $10;
 $12 = (($bitmap) + 16|0);
 HEAP32[$12>>2] = $11;
 $13 = (($bitmap) + 16|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = ($14|0)!=(0|0);
 if ($15) {
  $16 = (($bitmap) + 16|0);
  $17 = HEAP32[$16>>2]|0;
  $18 = $17;
  $19 = $memlen;
  _memset(($18|0),0,($19|0))|0;
 }
 $20 = ($bitmap);
 $21 = ($1);
 $22 = ($21);
 HEAP32[$22>>2] = 0;
 $23 = (($21) + 4|0);
 HEAP32[$23>>2] = 0;
 $24 = (($1) + 8|0);
 $25 = ($24);
 $26 = ($size);
 $27 = HEAP32[$26>>2]|0;
 HEAP32[$25>>2] = $27;
 $28 = (($24) + 4|0);
 $29 = (($size) + 4|0);
 $30 = HEAP32[$29>>2]|0;
 HEAP32[$28>>2] = $30;
 $31 = $20;
 $32 = $1;
 ;HEAP32[$31+0>>2]=HEAP32[$32+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$32+4>>2]|0;HEAP32[$31+8>>2]=HEAP32[$32+8>>2]|0;HEAP32[$31+12>>2]=HEAP32[$32+12>>2]|0;
 $33 = (($bitmap) + 20|0);
 $34 = ($2);
 HEAP8[$34] = 0;
 $35 = (($2) + 1|0);
 HEAP8[$35] = 0;
 $36 = (($2) + 2|0);
 HEAP8[$36] = 0;
 $37 = (($2) + 3|0);
 HEAP8[$37] = 0;
 $38 = $33;
 $39 = $2;
 ;HEAP8[$38+0|0]=HEAP8[$39+0|0]|0;HEAP8[$38+1|0]=HEAP8[$39+1|0]|0;HEAP8[$38+2|0]=HEAP8[$39+2|0]|0;HEAP8[$38+3|0]=HEAP8[$39+3|0]|0;
 $40 = (($bitmap) + 24|0);
 HEAP8[$40] = 1;
 $41 = ($bitmap);
 $42 = (($41) + 8|0);
 $43 = ($42);
 $44 = HEAP32[$43>>2]|0;
 $45 = (($bitmap) + 28|0);
 HEAP32[$45>>2] = $44;
 $46 = $agg$result;
 $47 = $bitmap;
 ;HEAP32[$46+0>>2]=HEAP32[$47+0>>2]|0;HEAP32[$46+4>>2]=HEAP32[$47+4>>2]|0;HEAP32[$46+8>>2]=HEAP32[$47+8>>2]|0;HEAP32[$46+12>>2]=HEAP32[$47+12>>2]|0;HEAP32[$46+16>>2]=HEAP32[$47+16>>2]|0;HEAP32[$46+20>>2]=HEAP32[$47+20>>2]|0;HEAP32[$46+24>>2]=HEAP32[$47+24>>2]|0;HEAP32[$46+28>>2]=HEAP32[$47+28>>2]|0;
 STACKTOP = sp;return;
}
function _asciiClipRect($agg$result,$toClip,$clipRect) {
 $agg$result = $agg$result|0;
 $toClip = $toClip|0;
 $clipRect = $clipRect|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0;
 var $96 = 0, $97 = 0, $98 = 0, $99 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($toClip);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($clipRect);
 $5 = ($4);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($3|0)<($6|0);
 if ($7) {
  $8 = ($clipRect);
  $9 = ($8);
  $10 = HEAP32[$9>>2]|0;
  $11 = ($toClip);
  $12 = ($11);
  $13 = HEAP32[$12>>2]|0;
  $14 = (($10) - ($13))|0;
  $15 = (($toClip) + 8|0);
  $16 = ($15);
  $17 = HEAP32[$16>>2]|0;
  $18 = (($17) - ($14))|0;
  HEAP32[$16>>2] = $18;
  $19 = ($clipRect);
  $20 = ($19);
  $21 = HEAP32[$20>>2]|0;
  $22 = ($toClip);
  $23 = ($22);
  HEAP32[$23>>2] = $21;
 }
 $24 = ($toClip);
 $25 = (($24) + 4|0);
 $26 = HEAP32[$25>>2]|0;
 $27 = ($clipRect);
 $28 = (($27) + 4|0);
 $29 = HEAP32[$28>>2]|0;
 $30 = ($26|0)<($29|0);
 if ($30) {
  $31 = ($clipRect);
  $32 = (($31) + 4|0);
  $33 = HEAP32[$32>>2]|0;
  $34 = ($toClip);
  $35 = (($34) + 4|0);
  $36 = HEAP32[$35>>2]|0;
  $37 = (($33) - ($36))|0;
  $38 = (($toClip) + 8|0);
  $39 = (($38) + 4|0);
  $40 = HEAP32[$39>>2]|0;
  $41 = (($40) - ($37))|0;
  HEAP32[$39>>2] = $41;
  $42 = ($clipRect);
  $43 = (($42) + 4|0);
  $44 = HEAP32[$43>>2]|0;
  $45 = ($toClip);
  $46 = (($45) + 4|0);
  HEAP32[$46>>2] = $44;
 }
 $47 = ($toClip);
 $48 = ($47);
 $49 = HEAP32[$48>>2]|0;
 $50 = (($toClip) + 8|0);
 $51 = ($50);
 $52 = HEAP32[$51>>2]|0;
 $53 = (($49) + ($52))|0;
 $54 = ($clipRect);
 $55 = ($54);
 $56 = HEAP32[$55>>2]|0;
 $57 = (($clipRect) + 8|0);
 $58 = ($57);
 $59 = HEAP32[$58>>2]|0;
 $60 = (($56) + ($59))|0;
 $61 = ($53|0)>($60|0);
 if ($61) {
  $62 = ($clipRect);
  $63 = ($62);
  $64 = HEAP32[$63>>2]|0;
  $65 = (($clipRect) + 8|0);
  $66 = ($65);
  $67 = HEAP32[$66>>2]|0;
  $68 = (($64) + ($67))|0;
  $69 = ($toClip);
  $70 = ($69);
  $71 = HEAP32[$70>>2]|0;
  $72 = (($68) - ($71))|0;
  $73 = (($toClip) + 8|0);
  $74 = ($73);
  HEAP32[$74>>2] = $72;
 }
 $75 = ($toClip);
 $76 = (($75) + 4|0);
 $77 = HEAP32[$76>>2]|0;
 $78 = (($toClip) + 8|0);
 $79 = (($78) + 4|0);
 $80 = HEAP32[$79>>2]|0;
 $81 = (($77) + ($80))|0;
 $82 = ($clipRect);
 $83 = (($82) + 4|0);
 $84 = HEAP32[$83>>2]|0;
 $85 = (($clipRect) + 8|0);
 $86 = (($85) + 4|0);
 $87 = HEAP32[$86>>2]|0;
 $88 = (($84) + ($87))|0;
 $89 = ($81|0)>($88|0);
 if (!($89)) {
  $103 = $agg$result;
  $104 = $toClip;
  ;HEAP32[$103+0>>2]=HEAP32[$104+0>>2]|0;HEAP32[$103+4>>2]=HEAP32[$104+4>>2]|0;HEAP32[$103+8>>2]=HEAP32[$104+8>>2]|0;HEAP32[$103+12>>2]=HEAP32[$104+12>>2]|0;
  STACKTOP = sp;return;
 }
 $90 = ($clipRect);
 $91 = (($90) + 4|0);
 $92 = HEAP32[$91>>2]|0;
 $93 = (($clipRect) + 8|0);
 $94 = (($93) + 4|0);
 $95 = HEAP32[$94>>2]|0;
 $96 = (($92) + ($95))|0;
 $97 = ($toClip);
 $98 = (($97) + 4|0);
 $99 = HEAP32[$98>>2]|0;
 $100 = (($96) - ($99))|0;
 $101 = (($toClip) + 8|0);
 $102 = (($101) + 4|0);
 HEAP32[$102>>2] = $100;
 $103 = $agg$result;
 $104 = $toClip;
 ;HEAP32[$103+0>>2]=HEAP32[$104+0>>2]|0;HEAP32[$103+4>>2]=HEAP32[$104+4>>2]|0;HEAP32[$103+8>>2]=HEAP32[$104+8>>2]|0;HEAP32[$103+12>>2]=HEAP32[$104+12>>2]|0;
 STACKTOP = sp;return;
}
function _asciiFreeBitmap($bm) {
 $bm = $bm|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = sp + 8|0;
 $1 = $bm;
 $3 = $1;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  STACKTOP = sp;return;
 }
 $5 = $1;
 $6 = (($5) + 16|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)!=(0|0);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 $9 = $1;
 $10 = (($9) + 21|0);
 $11 = HEAP8[$10]|0;
 $12 = $11 << 24 >> 24;
 $13 = ($12|0)==(1);
 if ($13) {
  $14 = $1;
  $15 = (($14) + 16|0);
  $16 = HEAP32[$15>>2]|0;
  _free($16);
 }
 $17 = $1;
 $18 = (($17) + 16|0);
 HEAP32[$18>>2] = 0;
 $19 = $1;
 $20 = (($19) + 20|0);
 HEAP8[$20] = 0;
 $21 = $1;
 $22 = ($21);
 $23 = ($2);
 $24 = ($23);
 HEAP32[$24>>2] = 0;
 $25 = (($23) + 4|0);
 HEAP32[$25>>2] = 0;
 $26 = (($2) + 8|0);
 $27 = ($26);
 HEAP32[$27>>2] = 0;
 $28 = (($26) + 4|0);
 HEAP32[$28>>2] = 0;
 $29 = $22;
 $30 = $2;
 ;HEAP32[$29+0>>2]=HEAP32[$30+0>>2]|0;HEAP32[$29+4>>2]=HEAP32[$30+4>>2]|0;HEAP32[$29+8>>2]=HEAP32[$30+8>>2]|0;HEAP32[$29+12>>2]=HEAP32[$30+12>>2]|0;
 STACKTOP = sp;return;
}
function _asciiSetTimeout($e,$ms,$callback,$context) {
 $e = $e|0;
 $ms = $ms|0;
 $callback = $callback|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $2 = $e;
 $3 = $ms;
 $4 = $callback;
 $5 = $context;
 $6 = $2;
 $7 = ($6|0)!=(0|0);
 do {
  if ($7) {
   $i = 0;
   while(1) {
    $8 = $i;
    $9 = $8 << 24 >> 24;
    $10 = ($9|0)<(16);
    if (!($10)) {
     label = 10;
     break;
    }
    $11 = $i;
    $12 = $11 << 24 >> 24;
    $13 = $2;
    $14 = (($13) + 180|0);
    $15 = (($14) + (($12*12)|0)|0);
    $16 = (($15) + 4|0);
    $17 = HEAP32[$16>>2]|0;
    $18 = ($17|0)==(0|0);
    if ($18) {
     break;
    }
    $55 = $i;
    $56 = (($55) + 1)<<24>>24;
    $i = $56;
   }
   if ((label|0) == 10) {
    break;
   }
   $19 = $4;
   $20 = $i;
   $21 = $20 << 24 >> 24;
   $22 = $2;
   $23 = (($22) + 180|0);
   $24 = (($23) + (($21*12)|0)|0);
   $25 = (($24) + 4|0);
   HEAP32[$25>>2] = $19;
   $26 = $5;
   $27 = $i;
   $28 = $27 << 24 >> 24;
   $29 = $2;
   $30 = (($29) + 180|0);
   $31 = (($30) + (($28*12)|0)|0);
   $32 = (($31) + 8|0);
   HEAP32[$32>>2] = $26;
   $33 = $3;
   $34 = $i;
   $35 = $34 << 24 >> 24;
   $36 = $2;
   $37 = (($36) + 180|0);
   $38 = (($37) + (($35*12)|0)|0);
   $39 = ($38);
   HEAP32[$39>>2] = $33;
   $40 = $2;
   $41 = ($40);
   $42 = (($41) + 16|0);
   $43 = HEAP32[$42>>2]|0;
   $44 = $2;
   $45 = $i;
   $46 = (FUNCTION_TABLE_iii[$43 & 1]($44,$45)|0);
   $47 = ($46<<24>>24)!=(0);
   if (!($47)) {
    $48 = $i;
    $49 = $48 << 24 >> 24;
    $50 = $2;
    $51 = (($50) + 180|0);
    $52 = (($51) + (($49*12)|0)|0);
    $53 = (($52) + 4|0);
    HEAP32[$53>>2] = 0;
    $i = -1;
   }
   $54 = $i;
   $1 = $54;
   $57 = $1;
   STACKTOP = sp;return ($57|0);
  }
 } while(0);
 $1 = -1;
 $57 = $1;
 STACKTOP = sp;return ($57|0);
}
function _asciiFlip($e) {
 $e = $e|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $2 = $1;
 $3 = ($2|0)!=(0|0);
 if (!($3)) {
  STACKTOP = sp;return 0;
 }
 $4 = $1;
 $5 = ($4);
 $6 = (($5) + 12|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = $1;
 (FUNCTION_TABLE_ii[$7 & 1]($8)|0);
 STACKTOP = sp;return 0;
}
function _asciiFillRect($e,$ch,$rect) {
 $e = $e|0;
 $ch = $ch|0;
 $rect = $rect|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, $ptr = 0, $rect$byval_copy = 0, $target = 0, $x = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104|0;
 $$byval_copy = sp;
 $rect$byval_copy = sp + 16|0;
 $2 = sp + 72|0;
 $3 = sp + 88|0;
 $1 = $e;
 $4 = $1;
 $5 = (($4) + 72|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = $6 & 8;
 $8 = ($7>>>0)>(0);
 if ($8) {
  $9 = $1;
  $10 = (($9) + 64|0);
  $11 = HEAP32[$10>>2]|0;
  $14 = $11;
 } else {
  $12 = $1;
  $13 = (($12) + 32|0);
  $14 = $13;
 }
 $target = $14;
 $15 = $1;
 $16 = ($15|0)!=(0|0);
 if (!($16)) {
  STACKTOP = sp;return;
 }
 $17 = ($rect);
 $18 = ($17);
 $19 = HEAP32[$18>>2]|0;
 $20 = $target;
 $21 = ($20);
 $22 = (($21) + 8|0);
 $23 = ($22);
 $24 = HEAP32[$23>>2]|0;
 $25 = ($19|0)<($24|0);
 if (!($25)) {
  STACKTOP = sp;return;
 }
 $26 = ($rect);
 $27 = (($26) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = $target;
 $30 = ($29);
 $31 = (($30) + 8|0);
 $32 = (($31) + 4|0);
 $33 = HEAP32[$32>>2]|0;
 $34 = ($28|0)<($33|0);
 if (!($34)) {
  STACKTOP = sp;return;
 }
 $35 = (($rect) + 8|0);
 $36 = ($35);
 $37 = HEAP32[$36>>2]|0;
 $38 = ($37|0)>(0);
 if (!($38)) {
  STACKTOP = sp;return;
 }
 $39 = (($rect) + 8|0);
 $40 = (($39) + 4|0);
 $41 = HEAP32[$40>>2]|0;
 $42 = ($41|0)>(0);
 if (!($42)) {
  STACKTOP = sp;return;
 }
 $43 = ($2);
 $44 = ($43);
 HEAP32[$44>>2] = 0;
 $45 = (($43) + 4|0);
 HEAP32[$45>>2] = 0;
 $46 = (($2) + 8|0);
 $47 = ($46);
 $48 = $target;
 $49 = ($48);
 $50 = (($49) + 8|0);
 $51 = ($50);
 $52 = HEAP32[$51>>2]|0;
 HEAP32[$47>>2] = $52;
 $53 = (($46) + 4|0);
 $54 = $target;
 $55 = ($54);
 $56 = (($55) + 8|0);
 $57 = (($56) + 4|0);
 $58 = HEAP32[$57>>2]|0;
 HEAP32[$53>>2] = $58;
 $59 = $rect$byval_copy;
 $60 = $rect$byval_copy;
 $61 = $rect;
 ;HEAP32[$60+0>>2]=HEAP32[$61+0>>2]|0;HEAP32[$60+4>>2]=HEAP32[$61+4>>2]|0;HEAP32[$60+8>>2]=HEAP32[$61+8>>2]|0;HEAP32[$60+12>>2]=HEAP32[$61+12>>2]|0;
 $62 = $$byval_copy;
 $63 = $$byval_copy;
 $64 = $2;
 ;HEAP32[$63+0>>2]=HEAP32[$64+0>>2]|0;HEAP32[$63+4>>2]=HEAP32[$64+4>>2]|0;HEAP32[$63+8>>2]=HEAP32[$64+8>>2]|0;HEAP32[$63+12>>2]=HEAP32[$64+12>>2]|0;
 _asciiClipRect($3,$rect$byval_copy,$$byval_copy);
 $65 = $$byval_copy;
 $66 = $rect$byval_copy;
 $67 = $rect;
 $68 = $3;
 ;HEAP32[$67+0>>2]=HEAP32[$68+0>>2]|0;HEAP32[$67+4>>2]=HEAP32[$68+4>>2]|0;HEAP32[$67+8>>2]=HEAP32[$68+8>>2]|0;HEAP32[$67+12>>2]=HEAP32[$68+12>>2]|0;
 $y = 0;
 while(1) {
  $69 = $y;
  $70 = (($rect) + 8|0);
  $71 = (($70) + 4|0);
  $72 = HEAP32[$71>>2]|0;
  $73 = ($69|0)<($72|0);
  if (!($73)) {
   break;
  }
  $74 = $target;
  $75 = (($74) + 16|0);
  $76 = HEAP32[$75>>2]|0;
  $77 = $target;
  $78 = ($77);
  $79 = ($78);
  $80 = (($79) + 4|0);
  $81 = HEAP32[$80>>2]|0;
  $82 = ($rect);
  $83 = (($82) + 4|0);
  $84 = HEAP32[$83>>2]|0;
  $85 = (($81) + ($84))|0;
  $86 = $y;
  $87 = (($85) + ($86))|0;
  $88 = $target;
  $89 = (($88) + 28|0);
  $90 = HEAP32[$89>>2]|0;
  $91 = Math_imul($87, $90)|0;
  $92 = (($76) + ($91<<2)|0);
  $93 = $target;
  $94 = ($93);
  $95 = ($94);
  $96 = ($95);
  $97 = HEAP32[$96>>2]|0;
  $98 = (($92) + ($97<<2)|0);
  $99 = ($rect);
  $100 = ($99);
  $101 = HEAP32[$100>>2]|0;
  $102 = (($98) + ($101<<2)|0);
  $ptr = $102;
  $x = 0;
  while(1) {
   $103 = $x;
   $104 = (($rect) + 8|0);
   $105 = ($104);
   $106 = HEAP32[$105>>2]|0;
   $107 = ($103|0)<($106|0);
   if (!($107)) {
    break;
   }
   $108 = $1;
   $109 = (($108) + 72|0);
   $110 = HEAP32[$109>>2]|0;
   $111 = $110 & 1;
   $112 = ($111>>>0)>(0);
   if (!($112)) {
    $113 = ($ch);
    $114 = HEAP8[$113]|0;
    $115 = $ptr;
    $116 = ($115);
    HEAP8[$116] = $114;
   }
   $117 = $1;
   $118 = (($117) + 72|0);
   $119 = HEAP32[$118>>2]|0;
   $120 = $119 & 2;
   $121 = ($120>>>0)>(0);
   if (!($121)) {
    $122 = (($ch) + 1|0);
    $123 = HEAP8[$122]|0;
    $124 = $ptr;
    $125 = (($124) + 1|0);
    HEAP8[$125] = $123;
   }
   $126 = $1;
   $127 = (($126) + 72|0);
   $128 = HEAP32[$127>>2]|0;
   $129 = $128 & 4;
   $130 = ($129>>>0)>(0);
   if (!($130)) {
    $131 = (($ch) + 2|0);
    $132 = HEAP8[$131]|0;
    $133 = $ptr;
    $134 = (($133) + 2|0);
    HEAP8[$134] = $132;
   }
   $135 = $ptr;
   $136 = (($135) + 4|0);
   $ptr = $136;
   $137 = $x;
   $138 = (($137) + 1)|0;
   $x = $138;
  }
  $139 = $y;
  $140 = (($139) + 1)|0;
  $y = $140;
 }
 STACKTOP = sp;return;
}
function _asciiClearRect($e,$rect) {
 $e = $e|0;
 $rect = $rect|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $rect$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $rect$byval_copy = sp;
 $$byval_copy = sp + 16|0;
 $1 = $e;
 $2 = $1;
 $3 = $1;
 $4 = (($3) + 68|0);
 $5 = $$byval_copy;
 $6 = $$byval_copy;
 $7 = $4;
 ;HEAP8[$6+0|0]=HEAP8[$7+0|0]|0;HEAP8[$6+1|0]=HEAP8[$7+1|0]|0;HEAP8[$6+2|0]=HEAP8[$7+2|0]|0;HEAP8[$6+3|0]=HEAP8[$7+3|0]|0;
 $8 = $rect$byval_copy;
 $9 = $rect$byval_copy;
 $10 = $rect;
 ;HEAP32[$9+0>>2]=HEAP32[$10+0>>2]|0;HEAP32[$9+4>>2]=HEAP32[$10+4>>2]|0;HEAP32[$9+8>>2]=HEAP32[$10+8>>2]|0;HEAP32[$9+12>>2]=HEAP32[$10+12>>2]|0;
 _asciiFillRect($2,$$byval_copy,$rect$byval_copy);
 $11 = $rect$byval_copy;
 $12 = $$byval_copy;
 STACKTOP = sp;return;
}
function _asciiDrawChar($e,$c,$offset) {
 $e = $e|0;
 $c = $c|0;
 $offset = $offset|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $target = 0, $targetPtr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $e;
 $2 = $1;
 $3 = (($2) + 72|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $4 & 8;
 $6 = ($5>>>0)>(0);
 if ($6) {
  $7 = $1;
  $8 = (($7) + 64|0);
  $9 = HEAP32[$8>>2]|0;
  $12 = $9;
 } else {
  $10 = $1;
  $11 = (($10) + 32|0);
  $12 = $11;
 }
 $target = $12;
 $13 = $1;
 $14 = ($13|0)!=(0|0);
 if (!($14)) {
  STACKTOP = sp;return;
 }
 $15 = ($offset);
 $16 = HEAP32[$15>>2]|0;
 $17 = ($16|0)>=(0);
 if (!($17)) {
  STACKTOP = sp;return;
 }
 $18 = (($offset) + 4|0);
 $19 = HEAP32[$18>>2]|0;
 $20 = ($19|0)>=(0);
 if (!($20)) {
  STACKTOP = sp;return;
 }
 $21 = ($offset);
 $22 = HEAP32[$21>>2]|0;
 $23 = $target;
 $24 = ($23);
 $25 = (($24) + 8|0);
 $26 = ($25);
 $27 = HEAP32[$26>>2]|0;
 $28 = ($22|0)<($27|0);
 if (!($28)) {
  STACKTOP = sp;return;
 }
 $29 = (($offset) + 4|0);
 $30 = HEAP32[$29>>2]|0;
 $31 = $target;
 $32 = ($31);
 $33 = (($32) + 8|0);
 $34 = (($33) + 4|0);
 $35 = HEAP32[$34>>2]|0;
 $36 = ($30|0)<($35|0);
 if (!($36)) {
  STACKTOP = sp;return;
 }
 $37 = $target;
 $38 = (($37) + 16|0);
 $39 = HEAP32[$38>>2]|0;
 $40 = $target;
 $41 = ($40);
 $42 = ($41);
 $43 = (($42) + 4|0);
 $44 = HEAP32[$43>>2]|0;
 $45 = (($offset) + 4|0);
 $46 = HEAP32[$45>>2]|0;
 $47 = (($44) + ($46))|0;
 $48 = $target;
 $49 = ($48);
 $50 = (($49) + 8|0);
 $51 = ($50);
 $52 = HEAP32[$51>>2]|0;
 $53 = Math_imul($47, $52)|0;
 $54 = (($39) + ($53<<2)|0);
 $55 = $target;
 $56 = ($55);
 $57 = ($56);
 $58 = ($57);
 $59 = HEAP32[$58>>2]|0;
 $60 = (($54) + ($59<<2)|0);
 $61 = ($offset);
 $62 = HEAP32[$61>>2]|0;
 $63 = (($60) + ($62<<2)|0);
 $targetPtr = $63;
 $64 = $1;
 $65 = (($64) + 72|0);
 $66 = HEAP32[$65>>2]|0;
 $67 = $66 & 1;
 $68 = ($67>>>0)>(0);
 if (!($68)) {
  $69 = ($c);
  $70 = HEAP8[$69]|0;
  $71 = $targetPtr;
  $72 = ($71);
  HEAP8[$72] = $70;
 }
 $73 = $1;
 $74 = (($73) + 72|0);
 $75 = HEAP32[$74>>2]|0;
 $76 = $75 & 2;
 $77 = ($76>>>0)>(0);
 if (!($77)) {
  $78 = (($c) + 1|0);
  $79 = HEAP8[$78]|0;
  $80 = $targetPtr;
  $81 = (($80) + 1|0);
  HEAP8[$81] = $79;
 }
 $82 = $1;
 $83 = (($82) + 72|0);
 $84 = HEAP32[$83>>2]|0;
 $85 = $84 & 4;
 $86 = ($85>>>0)>(0);
 if (!($86)) {
  $87 = (($c) + 2|0);
  $88 = HEAP8[$87]|0;
  $89 = $targetPtr;
  $90 = (($89) + 2|0);
  HEAP8[$90] = $88;
 }
 STACKTOP = sp;return;
}
function _asciiDrawText($e,$text,$offset) {
 $e = $e|0;
 $text = $text|0;
 $offset = $offset|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $offset$byval_copy = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $offset$byval_copy = sp;
 $1 = $e;
 $2 = $text;
 $3 = $1;
 $4 = $2;
 $5 = $2;
 $6 = (_strlen(($5|0))|0);
 $7 = $1;
 $8 = (($7) + 68|0);
 $9 = (($8) + 1|0);
 $10 = HEAP8[$9]|0;
 $11 = $1;
 $12 = (($11) + 68|0);
 $13 = (($12) + 2|0);
 $14 = HEAP8[$13]|0;
 $15 = $offset$byval_copy;
 $16 = $offset$byval_copy;
 $17 = $offset;
 ;HEAP32[$16+0>>2]=HEAP32[$17+0>>2]|0;HEAP32[$16+4>>2]=HEAP32[$17+4>>2]|0;
 _asciiDrawSizedTextColored($3,$4,$6,$offset$byval_copy,$10,$14);
 $18 = $offset$byval_copy;
 STACKTOP = sp;return;
}
function _asciiDrawSizedTextColored($e,$text,$len,$offset,$backColor,$foreColor) {
 $e = $e|0;
 $text = $text|0;
 $len = $len|0;
 $offset = $offset|0;
 $backColor = $backColor|0;
 $foreColor = $foreColor|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i = 0, $sourcePtr = 0, $target = 0, $targetPtr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 96|0;
 $6 = sp + 72|0;
 $7 = sp + 80|0;
 $8 = sp + 88|0;
 $1 = $e;
 $2 = $text;
 $3 = $len;
 $4 = $backColor;
 $5 = $foreColor;
 $9 = $1;
 $10 = (($9) + 72|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = $11 & 8;
 $13 = ($12>>>0)>(0);
 if ($13) {
  $14 = $1;
  $15 = (($14) + 64|0);
  $16 = HEAP32[$15>>2]|0;
  $19 = $16;
 } else {
  $17 = $1;
  $18 = (($17) + 32|0);
  $19 = $18;
 }
 $target = $19;
 $20 = $2;
 $sourcePtr = $20;
 $21 = $1;
 $22 = ($21|0)!=(0|0);
 if (!($22)) {
  STACKTOP = sp;return;
 }
 $23 = $2;
 $24 = ($23|0)!=(0|0);
 if (!($24)) {
  STACKTOP = sp;return;
 }
 $25 = $3;
 $26 = ($25|0)!=(0);
 if (!($26)) {
  STACKTOP = sp;return;
 }
 $27 = ($offset);
 $28 = HEAP32[$27>>2]|0;
 $29 = ($28|0)>=(0);
 if (!($29)) {
  STACKTOP = sp;return;
 }
 $30 = (($offset) + 4|0);
 $31 = HEAP32[$30>>2]|0;
 $32 = ($31|0)>=(0);
 if (!($32)) {
  STACKTOP = sp;return;
 }
 $33 = ($offset);
 $34 = HEAP32[$33>>2]|0;
 $35 = $target;
 $36 = ($35);
 $37 = (($36) + 8|0);
 $38 = ($37);
 $39 = HEAP32[$38>>2]|0;
 $40 = ($34|0)<($39|0);
 if (!($40)) {
  STACKTOP = sp;return;
 }
 $41 = (($offset) + 4|0);
 $42 = HEAP32[$41>>2]|0;
 $43 = $target;
 $44 = ($43);
 $45 = (($44) + 8|0);
 $46 = (($45) + 4|0);
 $47 = HEAP32[$46>>2]|0;
 $48 = ($42|0)<($47|0);
 if (!($48)) {
  STACKTOP = sp;return;
 }
 $49 = ($offset);
 $50 = HEAP32[$49>>2]|0;
 $51 = ($50|0)<(0);
 if ($51) {
  $52 = ($offset);
  $53 = HEAP32[$52>>2]|0;
  $54 = (0 - ($53))|0;
  $55 = $2;
  $56 = (($55) + ($54)|0);
  $2 = $56;
  $57 = ($offset);
  $58 = HEAP32[$57>>2]|0;
  $59 = $3;
  $60 = (($59) + ($58))|0;
  $3 = $60;
 }
 $61 = $target;
 $62 = (($61) + 16|0);
 $63 = HEAP32[$62>>2]|0;
 $64 = $target;
 $65 = ($64);
 $66 = ($65);
 $67 = (($66) + 4|0);
 $68 = HEAP32[$67>>2]|0;
 $69 = (($offset) + 4|0);
 $70 = HEAP32[$69>>2]|0;
 $71 = (($68) + ($70))|0;
 $72 = $target;
 $73 = (($72) + 28|0);
 $74 = HEAP32[$73>>2]|0;
 $75 = Math_imul($71, $74)|0;
 $76 = (($63) + ($75<<2)|0);
 $77 = $target;
 $78 = ($77);
 $79 = ($78);
 $80 = ($79);
 $81 = HEAP32[$80>>2]|0;
 $82 = (($76) + ($81<<2)|0);
 $83 = ($offset);
 $84 = HEAP32[$83>>2]|0;
 $85 = (($82) + ($84<<2)|0);
 $targetPtr = $85;
 $i = 0;
 while(1) {
  $86 = $i;
  $87 = $3;
  $88 = ($86>>>0)<($87>>>0);
  if (!($88)) {
   break;
  }
  $89 = $1;
  $90 = (($89) + 72|0);
  $91 = HEAP32[$90>>2]|0;
  $92 = $91 & 1;
  $93 = ($92>>>0)>(0);
  if (!($93)) {
   $94 = ($6);
   $95 = $sourcePtr;
   $96 = HEAP8[$95]|0;
   HEAP8[$94] = $96;
   $97 = (($6) + 1|0);
   $98 = $4;
   HEAP8[$97] = $98;
   $99 = (($6) + 2|0);
   $100 = $5;
   HEAP8[$99] = $100;
   $101 = (($6) + 3|0);
   HEAP8[$101] = 0;
   $102 = ($6);
   $103 = HEAP8[$102]|0;
   $104 = $targetPtr;
   $105 = ($104);
   HEAP8[$105] = $103;
  }
  $106 = $1;
  $107 = (($106) + 72|0);
  $108 = HEAP32[$107>>2]|0;
  $109 = $108 & 2;
  $110 = ($109>>>0)>(0);
  if (!($110)) {
   $111 = ($7);
   $112 = $sourcePtr;
   $113 = HEAP8[$112]|0;
   HEAP8[$111] = $113;
   $114 = (($7) + 1|0);
   $115 = $4;
   HEAP8[$114] = $115;
   $116 = (($7) + 2|0);
   $117 = $5;
   HEAP8[$116] = $117;
   $118 = (($7) + 3|0);
   HEAP8[$118] = 0;
   $119 = (($7) + 1|0);
   $120 = HEAP8[$119]|0;
   $121 = $targetPtr;
   $122 = (($121) + 1|0);
   HEAP8[$122] = $120;
  }
  $123 = $1;
  $124 = (($123) + 72|0);
  $125 = HEAP32[$124>>2]|0;
  $126 = $125 & 4;
  $127 = ($126>>>0)>(0);
  if (!($127)) {
   $128 = ($8);
   $129 = $sourcePtr;
   $130 = HEAP8[$129]|0;
   HEAP8[$128] = $130;
   $131 = (($8) + 1|0);
   $132 = $4;
   HEAP8[$131] = $132;
   $133 = (($8) + 2|0);
   $134 = $5;
   HEAP8[$133] = $134;
   $135 = (($8) + 3|0);
   HEAP8[$135] = 0;
   $136 = (($8) + 2|0);
   $137 = HEAP8[$136]|0;
   $138 = $targetPtr;
   $139 = (($138) + 2|0);
   HEAP8[$139] = $137;
  }
  $140 = $targetPtr;
  $141 = (($140) + 4|0);
  $targetPtr = $141;
  $142 = $sourcePtr;
  $143 = (($142) + 1|0);
  $sourcePtr = $143;
  $144 = $i;
  $145 = (($144) + 1)|0;
  $i = $145;
 }
 STACKTOP = sp;return;
}
function _asciiDrawTextColored($e,$text,$offset,$backColor,$foreColor) {
 $e = $e|0;
 $text = $text|0;
 $offset = $offset|0;
 $backColor = $backColor|0;
 $foreColor = $foreColor|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $offset$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $offset$byval_copy = sp;
 $1 = $e;
 $2 = $text;
 $3 = $backColor;
 $4 = $foreColor;
 $5 = $1;
 $6 = $2;
 $7 = $2;
 $8 = (_strlen(($7|0))|0);
 $9 = $3;
 $10 = $4;
 $11 = $offset$byval_copy;
 $12 = $offset$byval_copy;
 $13 = $offset;
 ;HEAP32[$12+0>>2]=HEAP32[$13+0>>2]|0;HEAP32[$12+4>>2]=HEAP32[$13+4>>2]|0;
 _asciiDrawSizedTextColored($5,$6,$8,$offset$byval_copy,$9,$10);
 $14 = $offset$byval_copy;
 STACKTOP = sp;return;
}
function _asciiDrawBitmapColored($e,$bitmap,$rect,$backColor,$foreColor) {
 $e = $e|0;
 $bitmap = $bitmap|0;
 $rect = $rect|0;
 $backColor = $backColor|0;
 $foreColor = $foreColor|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0;
 var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
 var $98 = 0, $99 = 0, $sourcePtr = 0, $sx = 0, $sy = 0, $target = 0, $targetPtr = 0, $x = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104|0;
 $4 = sp + 80|0;
 $5 = sp + 88|0;
 $6 = sp + 96|0;
 $1 = $e;
 $2 = $backColor;
 $3 = $foreColor;
 $7 = $1;
 $8 = (($7) + 72|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = $9 & 8;
 $11 = ($10>>>0)>(0);
 if ($11) {
  $12 = $1;
  $13 = (($12) + 64|0);
  $14 = HEAP32[$13>>2]|0;
  $17 = $14;
 } else {
  $15 = $1;
  $16 = (($15) + 32|0);
  $17 = $16;
 }
 $target = $17;
 $sx = 0;
 $sy = 0;
 $18 = (($rect) + 8|0);
 $19 = ($18);
 $20 = HEAP32[$19>>2]|0;
 $21 = ($20|0)==(0);
 if ($21) {
  $22 = ($bitmap);
  $23 = (($22) + 8|0);
  $24 = ($23);
  $25 = HEAP32[$24>>2]|0;
  $26 = (($rect) + 8|0);
  $27 = ($26);
  HEAP32[$27>>2] = $25;
 }
 $28 = (($rect) + 8|0);
 $29 = (($28) + 4|0);
 $30 = HEAP32[$29>>2]|0;
 $31 = ($30|0)==(0);
 if ($31) {
  $32 = ($bitmap);
  $33 = (($32) + 8|0);
  $34 = (($33) + 4|0);
  $35 = HEAP32[$34>>2]|0;
  $36 = (($rect) + 8|0);
  $37 = (($36) + 4|0);
  HEAP32[$37>>2] = $35;
 }
 $38 = $1;
 $39 = ($38|0)!=(0|0);
 if (!($39)) {
  STACKTOP = sp;return;
 }
 $40 = (($bitmap) + 16|0);
 $41 = HEAP32[$40>>2]|0;
 $42 = ($41|0)!=(0|0);
 if (!($42)) {
  STACKTOP = sp;return;
 }
 $43 = ($bitmap);
 $44 = (($43) + 8|0);
 $45 = ($44);
 $46 = HEAP32[$45>>2]|0;
 $47 = ($46|0)>(0);
 if (!($47)) {
  STACKTOP = sp;return;
 }
 $48 = ($bitmap);
 $49 = (($48) + 8|0);
 $50 = (($49) + 4|0);
 $51 = HEAP32[$50>>2]|0;
 $52 = ($51|0)!=(0);
 if (!($52)) {
  STACKTOP = sp;return;
 }
 $53 = ($rect);
 $54 = ($53);
 $55 = HEAP32[$54>>2]|0;
 $56 = $target;
 $57 = ($56);
 $58 = (($57) + 8|0);
 $59 = ($58);
 $60 = HEAP32[$59>>2]|0;
 $61 = ($55|0)<($60|0);
 if (!($61)) {
  STACKTOP = sp;return;
 }
 $62 = ($rect);
 $63 = (($62) + 4|0);
 $64 = HEAP32[$63>>2]|0;
 $65 = $target;
 $66 = ($65);
 $67 = (($66) + 8|0);
 $68 = (($67) + 4|0);
 $69 = HEAP32[$68>>2]|0;
 $70 = ($64|0)<($69|0);
 if (!($70)) {
  STACKTOP = sp;return;
 }
 $71 = ($rect);
 $72 = ($71);
 $73 = HEAP32[$72>>2]|0;
 $74 = (($rect) + 8|0);
 $75 = ($74);
 $76 = HEAP32[$75>>2]|0;
 $77 = (($73) + ($76))|0;
 $78 = ($77|0)>=(0);
 if (!($78)) {
  STACKTOP = sp;return;
 }
 $79 = ($rect);
 $80 = (($79) + 4|0);
 $81 = HEAP32[$80>>2]|0;
 $82 = (($rect) + 8|0);
 $83 = (($82) + 4|0);
 $84 = HEAP32[$83>>2]|0;
 $85 = (($81) + ($84))|0;
 $86 = ($85|0)>=(0);
 if (!($86)) {
  STACKTOP = sp;return;
 }
 $87 = ($rect);
 $88 = ($87);
 $89 = HEAP32[$88>>2]|0;
 $90 = ($89|0)<(0);
 if ($90) {
  $91 = ($rect);
  $92 = ($91);
  $93 = HEAP32[$92>>2]|0;
  $94 = (0 - ($93))|0;
  $sx = $94;
  $95 = ($rect);
  $96 = ($95);
  $97 = HEAP32[$96>>2]|0;
  $98 = (($rect) + 8|0);
  $99 = ($98);
  $100 = HEAP32[$99>>2]|0;
  $101 = (($100) + ($97))|0;
  HEAP32[$99>>2] = $101;
 }
 $102 = ($rect);
 $103 = (($102) + 4|0);
 $104 = HEAP32[$103>>2]|0;
 $105 = ($104|0)<(0);
 if ($105) {
  $106 = ($rect);
  $107 = (($106) + 4|0);
  $108 = HEAP32[$107>>2]|0;
  $109 = (0 - ($108))|0;
  $sy = $109;
  $110 = ($rect);
  $111 = (($110) + 4|0);
  $112 = HEAP32[$111>>2]|0;
  $113 = (($rect) + 8|0);
  $114 = (($113) + 4|0);
  $115 = HEAP32[$114>>2]|0;
  $116 = (($115) + ($112))|0;
  HEAP32[$114>>2] = $116;
 }
 $117 = ($rect);
 $118 = ($117);
 $119 = HEAP32[$118>>2]|0;
 $120 = (($rect) + 8|0);
 $121 = ($120);
 $122 = HEAP32[$121>>2]|0;
 $123 = (($119) + ($122))|0;
 $124 = $target;
 $125 = ($124);
 $126 = (($125) + 8|0);
 $127 = ($126);
 $128 = HEAP32[$127>>2]|0;
 $129 = ($123|0)>=($128|0);
 if ($129) {
  $130 = $target;
  $131 = ($130);
  $132 = (($131) + 8|0);
  $133 = ($132);
  $134 = HEAP32[$133>>2]|0;
  $135 = ($rect);
  $136 = ($135);
  $137 = HEAP32[$136>>2]|0;
  $138 = (($134) - ($137))|0;
  $139 = (($rect) + 8|0);
  $140 = ($139);
  HEAP32[$140>>2] = $138;
 }
 $141 = ($rect);
 $142 = (($141) + 4|0);
 $143 = HEAP32[$142>>2]|0;
 $144 = (($rect) + 8|0);
 $145 = (($144) + 4|0);
 $146 = HEAP32[$145>>2]|0;
 $147 = (($143) + ($146))|0;
 $148 = $target;
 $149 = ($148);
 $150 = (($149) + 8|0);
 $151 = (($150) + 4|0);
 $152 = HEAP32[$151>>2]|0;
 $153 = ($147|0)>=($152|0);
 if ($153) {
  $154 = $target;
  $155 = ($154);
  $156 = (($155) + 8|0);
  $157 = (($156) + 4|0);
  $158 = HEAP32[$157>>2]|0;
  $159 = ($rect);
  $160 = (($159) + 4|0);
  $161 = HEAP32[$160>>2]|0;
  $162 = (($158) - ($161))|0;
  $163 = (($rect) + 8|0);
  $164 = (($163) + 4|0);
  HEAP32[$164>>2] = $162;
 }
 $165 = $sy;
 $y = $165;
 while(1) {
  $166 = $y;
  $167 = $sy;
  $168 = (($rect) + 8|0);
  $169 = (($168) + 4|0);
  $170 = HEAP32[$169>>2]|0;
  $171 = (($167) + ($170))|0;
  $172 = ($166|0)<($171|0);
  if (!($172)) {
   break;
  }
  $173 = $target;
  $174 = (($173) + 16|0);
  $175 = HEAP32[$174>>2]|0;
  $176 = $target;
  $177 = ($176);
  $178 = ($177);
  $179 = ($178);
  $180 = HEAP32[$179>>2]|0;
  $181 = ($rect);
  $182 = (($181) + 4|0);
  $183 = HEAP32[$182>>2]|0;
  $184 = (($180) + ($183))|0;
  $185 = $y;
  $186 = (($184) + ($185))|0;
  $187 = $target;
  $188 = (($187) + 28|0);
  $189 = HEAP32[$188>>2]|0;
  $190 = Math_imul($186, $189)|0;
  $191 = (($175) + ($190<<2)|0);
  $192 = $target;
  $193 = ($192);
  $194 = ($193);
  $195 = ($194);
  $196 = HEAP32[$195>>2]|0;
  $197 = (($191) + ($196<<2)|0);
  $198 = ($rect);
  $199 = ($198);
  $200 = HEAP32[$199>>2]|0;
  $201 = (($197) + ($200<<2)|0);
  $targetPtr = $201;
  $202 = $sx;
  $x = $202;
  while(1) {
   $203 = $x;
   $204 = $sx;
   $205 = (($rect) + 8|0);
   $206 = ($205);
   $207 = HEAP32[$206>>2]|0;
   $208 = (($204) + ($207))|0;
   $209 = ($203|0)<($208|0);
   if (!($209)) {
    break;
   }
   $210 = (($bitmap) + 16|0);
   $211 = HEAP32[$210>>2]|0;
   $212 = $y;
   $213 = ($bitmap);
   $214 = (($213) + 8|0);
   $215 = (($214) + 4|0);
   $216 = HEAP32[$215>>2]|0;
   $217 = (($212|0) % ($216|0))&-1;
   $218 = ($bitmap);
   $219 = ($218);
   $220 = (($219) + 4|0);
   $221 = HEAP32[$220>>2]|0;
   $222 = (($217) + ($221))|0;
   $223 = (($bitmap) + 24|0);
   $224 = HEAP32[$223>>2]|0;
   $225 = Math_imul($222, $224)|0;
   $226 = (($211) + ($225)|0);
   $227 = $x;
   $228 = ($bitmap);
   $229 = (($228) + 8|0);
   $230 = ($229);
   $231 = HEAP32[$230>>2]|0;
   $232 = (($227|0) % ($231|0))&-1;
   $233 = ($bitmap);
   $234 = ($233);
   $235 = ($234);
   $236 = HEAP32[$235>>2]|0;
   $237 = (($232) + ($236))|0;
   $238 = (($226) + ($237)|0);
   $sourcePtr = $238;
   $239 = $sourcePtr;
   $240 = HEAP8[$239]|0;
   $241 = $240 << 24 >> 24;
   $242 = (($bitmap) + 20|0);
   $243 = HEAP8[$242]|0;
   $244 = $243 << 24 >> 24;
   $245 = ($241|0)!=($244|0);
   if ($245) {
    $246 = $1;
    $247 = (($246) + 72|0);
    $248 = HEAP32[$247>>2]|0;
    $249 = $248 & 1;
    $250 = ($249>>>0)>(0);
    if (!($250)) {
     $251 = ($4);
     $252 = $sourcePtr;
     $253 = HEAP8[$252]|0;
     HEAP8[$251] = $253;
     $254 = (($4) + 1|0);
     $255 = $2;
     HEAP8[$254] = $255;
     $256 = (($4) + 2|0);
     $257 = $3;
     HEAP8[$256] = $257;
     $258 = (($4) + 3|0);
     HEAP8[$258] = 0;
     $259 = ($4);
     $260 = HEAP8[$259]|0;
     $261 = $targetPtr;
     $262 = ($261);
     HEAP8[$262] = $260;
    }
    $263 = $1;
    $264 = (($263) + 72|0);
    $265 = HEAP32[$264>>2]|0;
    $266 = $265 & 2;
    $267 = ($266>>>0)>(0);
    if (!($267)) {
     $268 = ($5);
     $269 = $sourcePtr;
     $270 = HEAP8[$269]|0;
     HEAP8[$268] = $270;
     $271 = (($5) + 1|0);
     $272 = $2;
     HEAP8[$271] = $272;
     $273 = (($5) + 2|0);
     $274 = $3;
     HEAP8[$273] = $274;
     $275 = (($5) + 3|0);
     HEAP8[$275] = 0;
     $276 = (($5) + 1|0);
     $277 = HEAP8[$276]|0;
     $278 = $targetPtr;
     $279 = (($278) + 1|0);
     HEAP8[$279] = $277;
    }
    $280 = $1;
    $281 = (($280) + 72|0);
    $282 = HEAP32[$281>>2]|0;
    $283 = $282 & 4;
    $284 = ($283>>>0)>(0);
    if (!($284)) {
     $285 = ($6);
     $286 = $sourcePtr;
     $287 = HEAP8[$286]|0;
     HEAP8[$285] = $287;
     $288 = (($6) + 1|0);
     $289 = $2;
     HEAP8[$288] = $289;
     $290 = (($6) + 2|0);
     $291 = $3;
     HEAP8[$290] = $291;
     $292 = (($6) + 3|0);
     HEAP8[$292] = 0;
     $293 = (($6) + 2|0);
     $294 = HEAP8[$293]|0;
     $295 = $targetPtr;
     $296 = (($295) + 2|0);
     HEAP8[$296] = $294;
    }
   }
   $297 = $targetPtr;
   $298 = (($297) + 4|0);
   $targetPtr = $298;
   $299 = $x;
   $300 = (($299) + 1)|0;
   $x = $300;
  }
  $301 = $y;
  $302 = (($301) + 1)|0;
  $y = $302;
 }
 STACKTOP = sp;return;
}
function _asciiDrawRectangle($e,$rect) {
 $e = $e|0;
 $rect = $rect|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $rect$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $rect$byval_copy = sp;
 $1 = $e;
 $2 = $1;
 $3 = ($2|0)!=(0|0);
 if (!($3)) {
  STACKTOP = sp;return;
 }
 $4 = $1;
 $5 = $1;
 $6 = (($5) + 68|0);
 $7 = (($6) + 1|0);
 $8 = HEAP8[$7]|0;
 $9 = $1;
 $10 = (($9) + 68|0);
 $11 = (($10) + 2|0);
 $12 = HEAP8[$11]|0;
 $13 = $rect$byval_copy;
 $14 = $rect$byval_copy;
 $15 = $rect;
 ;HEAP32[$14+0>>2]=HEAP32[$15+0>>2]|0;HEAP32[$14+4>>2]=HEAP32[$15+4>>2]|0;HEAP32[$14+8>>2]=HEAP32[$15+8>>2]|0;HEAP32[$14+12>>2]=HEAP32[$15+12>>2]|0;
 _asciiDrawRectangleColored($4,$rect$byval_copy,$8,$12);
 $16 = $rect$byval_copy;
 STACKTOP = sp;return;
}
function _asciiDrawRectangleColored($e,$rect,$bg,$fg) {
 $e = $e|0;
 $rect = $rect|0;
 $bg = $bg|0;
 $fg = $fg|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy15 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0;
 var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 344|0;
 $$byval_copy15 = sp;
 $$byval_copy14 = sp + 8|0;
 $$byval_copy13 = sp + 16|0;
 $$byval_copy12 = sp + 24|0;
 $$byval_copy11 = sp + 32|0;
 $$byval_copy10 = sp + 40|0;
 $$byval_copy9 = sp + 48|0;
 $$byval_copy8 = sp + 56|0;
 $$byval_copy7 = sp + 64|0;
 $$byval_copy6 = sp + 80|0;
 $$byval_copy5 = sp + 88|0;
 $$byval_copy4 = sp + 104|0;
 $$byval_copy3 = sp + 112|0;
 $$byval_copy2 = sp + 128|0;
 $$byval_copy1 = sp + 136|0;
 $$byval_copy = sp + 152|0;
 $4 = sp + 184|0;
 $5 = sp + 192|0;
 $6 = sp + 208|0;
 $7 = sp + 216|0;
 $8 = sp + 232|0;
 $9 = sp + 240|0;
 $10 = sp + 256|0;
 $11 = sp + 264|0;
 $12 = sp + 280|0;
 $13 = sp + 288|0;
 $14 = sp + 296|0;
 $15 = sp + 304|0;
 $16 = sp + 312|0;
 $17 = sp + 320|0;
 $18 = sp + 328|0;
 $19 = sp + 336|0;
 $1 = $e;
 $2 = $bg;
 $3 = $fg;
 $20 = $1;
 $21 = ($20|0)!=(0|0);
 if (!($21)) {
  STACKTOP = sp;return;
 }
 $22 = (($rect) + 8|0);
 $23 = ($22);
 $24 = HEAP32[$23>>2]|0;
 $25 = ($24|0)>(2);
 if (!($25)) {
  STACKTOP = sp;return;
 }
 $26 = (($rect) + 8|0);
 $27 = (($26) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = ($28|0)>(2);
 if (!($29)) {
  STACKTOP = sp;return;
 }
 $30 = $2;
 $31 = $30&255;
 $32 = ($31|0)<(8);
 if (!($32)) {
  STACKTOP = sp;return;
 }
 $33 = $3;
 $34 = $33&255;
 $35 = ($34|0)<(8);
 if (!($35)) {
  STACKTOP = sp;return;
 }
 $36 = $1;
 $37 = ($4);
 HEAP8[$37] = 45;
 $38 = (($4) + 1|0);
 $39 = $2;
 HEAP8[$38] = $39;
 $40 = (($4) + 2|0);
 $41 = $3;
 HEAP8[$40] = $41;
 $42 = (($4) + 3|0);
 HEAP8[$42] = 0;
 $43 = ($5);
 $44 = ($43);
 $45 = ($rect);
 $46 = ($45);
 $47 = HEAP32[$46>>2]|0;
 $48 = (($47) + 1)|0;
 HEAP32[$44>>2] = $48;
 $49 = (($43) + 4|0);
 $50 = ($rect);
 $51 = (($50) + 4|0);
 $52 = HEAP32[$51>>2]|0;
 HEAP32[$49>>2] = $52;
 $53 = (($5) + 8|0);
 $54 = ($53);
 $55 = (($rect) + 8|0);
 $56 = ($55);
 $57 = HEAP32[$56>>2]|0;
 $58 = (($57) - 2)|0;
 HEAP32[$54>>2] = $58;
 $59 = (($53) + 4|0);
 HEAP32[$59>>2] = 1;
 $60 = $$byval_copy;
 $61 = $$byval_copy;
 $62 = $4;
 ;HEAP8[$61+0|0]=HEAP8[$62+0|0]|0;HEAP8[$61+1|0]=HEAP8[$62+1|0]|0;HEAP8[$61+2|0]=HEAP8[$62+2|0]|0;HEAP8[$61+3|0]=HEAP8[$62+3|0]|0;
 $63 = $$byval_copy1;
 $64 = $$byval_copy1;
 $65 = $5;
 ;HEAP32[$64+0>>2]=HEAP32[$65+0>>2]|0;HEAP32[$64+4>>2]=HEAP32[$65+4>>2]|0;HEAP32[$64+8>>2]=HEAP32[$65+8>>2]|0;HEAP32[$64+12>>2]=HEAP32[$65+12>>2]|0;
 _asciiFillRect($36,$$byval_copy,$$byval_copy1);
 $66 = $$byval_copy1;
 $67 = $$byval_copy;
 $68 = $1;
 $69 = ($6);
 HEAP8[$69] = 45;
 $70 = (($6) + 1|0);
 $71 = $2;
 HEAP8[$70] = $71;
 $72 = (($6) + 2|0);
 $73 = $3;
 HEAP8[$72] = $73;
 $74 = (($6) + 3|0);
 HEAP8[$74] = 0;
 $75 = ($7);
 $76 = ($75);
 $77 = ($rect);
 $78 = ($77);
 $79 = HEAP32[$78>>2]|0;
 $80 = (($79) + 1)|0;
 HEAP32[$76>>2] = $80;
 $81 = (($75) + 4|0);
 $82 = ($rect);
 $83 = (($82) + 4|0);
 $84 = HEAP32[$83>>2]|0;
 $85 = (($rect) + 8|0);
 $86 = (($85) + 4|0);
 $87 = HEAP32[$86>>2]|0;
 $88 = (($84) + ($87))|0;
 $89 = (($88) - 1)|0;
 HEAP32[$81>>2] = $89;
 $90 = (($7) + 8|0);
 $91 = ($90);
 $92 = (($rect) + 8|0);
 $93 = ($92);
 $94 = HEAP32[$93>>2]|0;
 $95 = (($94) - 2)|0;
 HEAP32[$91>>2] = $95;
 $96 = (($90) + 4|0);
 HEAP32[$96>>2] = 1;
 $97 = $$byval_copy2;
 $98 = $$byval_copy2;
 $99 = $6;
 ;HEAP8[$98+0|0]=HEAP8[$99+0|0]|0;HEAP8[$98+1|0]=HEAP8[$99+1|0]|0;HEAP8[$98+2|0]=HEAP8[$99+2|0]|0;HEAP8[$98+3|0]=HEAP8[$99+3|0]|0;
 $100 = $$byval_copy3;
 $101 = $$byval_copy3;
 $102 = $7;
 ;HEAP32[$101+0>>2]=HEAP32[$102+0>>2]|0;HEAP32[$101+4>>2]=HEAP32[$102+4>>2]|0;HEAP32[$101+8>>2]=HEAP32[$102+8>>2]|0;HEAP32[$101+12>>2]=HEAP32[$102+12>>2]|0;
 _asciiFillRect($68,$$byval_copy2,$$byval_copy3);
 $103 = $$byval_copy3;
 $104 = $$byval_copy2;
 $105 = $1;
 $106 = ($8);
 HEAP8[$106] = 124;
 $107 = (($8) + 1|0);
 $108 = $2;
 HEAP8[$107] = $108;
 $109 = (($8) + 2|0);
 $110 = $3;
 HEAP8[$109] = $110;
 $111 = (($8) + 3|0);
 HEAP8[$111] = 0;
 $112 = ($9);
 $113 = ($112);
 $114 = ($rect);
 $115 = ($114);
 $116 = HEAP32[$115>>2]|0;
 HEAP32[$113>>2] = $116;
 $117 = (($112) + 4|0);
 $118 = ($rect);
 $119 = (($118) + 4|0);
 $120 = HEAP32[$119>>2]|0;
 $121 = (($120) + 1)|0;
 HEAP32[$117>>2] = $121;
 $122 = (($9) + 8|0);
 $123 = ($122);
 HEAP32[$123>>2] = 1;
 $124 = (($122) + 4|0);
 $125 = (($rect) + 8|0);
 $126 = (($125) + 4|0);
 $127 = HEAP32[$126>>2]|0;
 $128 = (($127) - 2)|0;
 HEAP32[$124>>2] = $128;
 $129 = $$byval_copy4;
 $130 = $$byval_copy4;
 $131 = $8;
 ;HEAP8[$130+0|0]=HEAP8[$131+0|0]|0;HEAP8[$130+1|0]=HEAP8[$131+1|0]|0;HEAP8[$130+2|0]=HEAP8[$131+2|0]|0;HEAP8[$130+3|0]=HEAP8[$131+3|0]|0;
 $132 = $$byval_copy5;
 $133 = $$byval_copy5;
 $134 = $9;
 ;HEAP32[$133+0>>2]=HEAP32[$134+0>>2]|0;HEAP32[$133+4>>2]=HEAP32[$134+4>>2]|0;HEAP32[$133+8>>2]=HEAP32[$134+8>>2]|0;HEAP32[$133+12>>2]=HEAP32[$134+12>>2]|0;
 _asciiFillRect($105,$$byval_copy4,$$byval_copy5);
 $135 = $$byval_copy5;
 $136 = $$byval_copy4;
 $137 = $1;
 $138 = ($10);
 HEAP8[$138] = 124;
 $139 = (($10) + 1|0);
 $140 = $2;
 HEAP8[$139] = $140;
 $141 = (($10) + 2|0);
 $142 = $3;
 HEAP8[$141] = $142;
 $143 = (($10) + 3|0);
 HEAP8[$143] = 0;
 $144 = ($11);
 $145 = ($144);
 $146 = ($rect);
 $147 = ($146);
 $148 = HEAP32[$147>>2]|0;
 $149 = (($rect) + 8|0);
 $150 = ($149);
 $151 = HEAP32[$150>>2]|0;
 $152 = (($148) + ($151))|0;
 $153 = (($152) - 1)|0;
 HEAP32[$145>>2] = $153;
 $154 = (($144) + 4|0);
 $155 = ($rect);
 $156 = (($155) + 4|0);
 $157 = HEAP32[$156>>2]|0;
 $158 = (($157) + 1)|0;
 HEAP32[$154>>2] = $158;
 $159 = (($11) + 8|0);
 $160 = ($159);
 HEAP32[$160>>2] = 1;
 $161 = (($159) + 4|0);
 $162 = (($rect) + 8|0);
 $163 = (($162) + 4|0);
 $164 = HEAP32[$163>>2]|0;
 $165 = (($164) - 2)|0;
 HEAP32[$161>>2] = $165;
 $166 = $$byval_copy6;
 $167 = $$byval_copy6;
 $168 = $10;
 ;HEAP8[$167+0|0]=HEAP8[$168+0|0]|0;HEAP8[$167+1|0]=HEAP8[$168+1|0]|0;HEAP8[$167+2|0]=HEAP8[$168+2|0]|0;HEAP8[$167+3|0]=HEAP8[$168+3|0]|0;
 $169 = $$byval_copy7;
 $170 = $$byval_copy7;
 $171 = $11;
 ;HEAP32[$170+0>>2]=HEAP32[$171+0>>2]|0;HEAP32[$170+4>>2]=HEAP32[$171+4>>2]|0;HEAP32[$170+8>>2]=HEAP32[$171+8>>2]|0;HEAP32[$170+12>>2]=HEAP32[$171+12>>2]|0;
 _asciiFillRect($137,$$byval_copy6,$$byval_copy7);
 $172 = $$byval_copy7;
 $173 = $$byval_copy6;
 $174 = $1;
 $175 = ($12);
 HEAP8[$175] = 43;
 $176 = (($12) + 1|0);
 $177 = $2;
 HEAP8[$176] = $177;
 $178 = (($12) + 2|0);
 $179 = $3;
 HEAP8[$178] = $179;
 $180 = (($12) + 3|0);
 HEAP8[$180] = 0;
 $181 = ($13);
 $182 = ($rect);
 $183 = ($182);
 $184 = HEAP32[$183>>2]|0;
 HEAP32[$181>>2] = $184;
 $185 = (($13) + 4|0);
 $186 = ($rect);
 $187 = (($186) + 4|0);
 $188 = HEAP32[$187>>2]|0;
 HEAP32[$185>>2] = $188;
 $189 = $$byval_copy8;
 $190 = $$byval_copy8;
 $191 = $12;
 ;HEAP8[$190+0|0]=HEAP8[$191+0|0]|0;HEAP8[$190+1|0]=HEAP8[$191+1|0]|0;HEAP8[$190+2|0]=HEAP8[$191+2|0]|0;HEAP8[$190+3|0]=HEAP8[$191+3|0]|0;
 $192 = $$byval_copy9;
 $193 = $$byval_copy9;
 $194 = $13;
 ;HEAP32[$193+0>>2]=HEAP32[$194+0>>2]|0;HEAP32[$193+4>>2]=HEAP32[$194+4>>2]|0;
 _asciiDrawChar($174,$$byval_copy8,$$byval_copy9);
 $195 = $$byval_copy9;
 $196 = $$byval_copy8;
 $197 = $1;
 $198 = ($14);
 HEAP8[$198] = 43;
 $199 = (($14) + 1|0);
 $200 = $2;
 HEAP8[$199] = $200;
 $201 = (($14) + 2|0);
 $202 = $3;
 HEAP8[$201] = $202;
 $203 = (($14) + 3|0);
 HEAP8[$203] = 0;
 $204 = ($15);
 $205 = ($rect);
 $206 = ($205);
 $207 = HEAP32[$206>>2]|0;
 $208 = (($rect) + 8|0);
 $209 = ($208);
 $210 = HEAP32[$209>>2]|0;
 $211 = (($207) + ($210))|0;
 $212 = (($211) - 1)|0;
 HEAP32[$204>>2] = $212;
 $213 = (($15) + 4|0);
 $214 = ($rect);
 $215 = (($214) + 4|0);
 $216 = HEAP32[$215>>2]|0;
 HEAP32[$213>>2] = $216;
 $217 = $$byval_copy10;
 $218 = $$byval_copy10;
 $219 = $14;
 ;HEAP8[$218+0|0]=HEAP8[$219+0|0]|0;HEAP8[$218+1|0]=HEAP8[$219+1|0]|0;HEAP8[$218+2|0]=HEAP8[$219+2|0]|0;HEAP8[$218+3|0]=HEAP8[$219+3|0]|0;
 $220 = $$byval_copy11;
 $221 = $$byval_copy11;
 $222 = $15;
 ;HEAP32[$221+0>>2]=HEAP32[$222+0>>2]|0;HEAP32[$221+4>>2]=HEAP32[$222+4>>2]|0;
 _asciiDrawChar($197,$$byval_copy10,$$byval_copy11);
 $223 = $$byval_copy11;
 $224 = $$byval_copy10;
 $225 = $1;
 $226 = ($16);
 HEAP8[$226] = 43;
 $227 = (($16) + 1|0);
 $228 = $2;
 HEAP8[$227] = $228;
 $229 = (($16) + 2|0);
 $230 = $3;
 HEAP8[$229] = $230;
 $231 = (($16) + 3|0);
 HEAP8[$231] = 0;
 $232 = ($17);
 $233 = ($rect);
 $234 = ($233);
 $235 = HEAP32[$234>>2]|0;
 HEAP32[$232>>2] = $235;
 $236 = (($17) + 4|0);
 $237 = ($rect);
 $238 = (($237) + 4|0);
 $239 = HEAP32[$238>>2]|0;
 $240 = (($rect) + 8|0);
 $241 = (($240) + 4|0);
 $242 = HEAP32[$241>>2]|0;
 $243 = (($239) + ($242))|0;
 $244 = (($243) - 1)|0;
 HEAP32[$236>>2] = $244;
 $245 = $$byval_copy12;
 $246 = $$byval_copy12;
 $247 = $16;
 ;HEAP8[$246+0|0]=HEAP8[$247+0|0]|0;HEAP8[$246+1|0]=HEAP8[$247+1|0]|0;HEAP8[$246+2|0]=HEAP8[$247+2|0]|0;HEAP8[$246+3|0]=HEAP8[$247+3|0]|0;
 $248 = $$byval_copy13;
 $249 = $$byval_copy13;
 $250 = $17;
 ;HEAP32[$249+0>>2]=HEAP32[$250+0>>2]|0;HEAP32[$249+4>>2]=HEAP32[$250+4>>2]|0;
 _asciiDrawChar($225,$$byval_copy12,$$byval_copy13);
 $251 = $$byval_copy13;
 $252 = $$byval_copy12;
 $253 = $1;
 $254 = ($18);
 HEAP8[$254] = 43;
 $255 = (($18) + 1|0);
 $256 = $2;
 HEAP8[$255] = $256;
 $257 = (($18) + 2|0);
 $258 = $3;
 HEAP8[$257] = $258;
 $259 = (($18) + 3|0);
 HEAP8[$259] = 0;
 $260 = ($19);
 $261 = ($rect);
 $262 = ($261);
 $263 = HEAP32[$262>>2]|0;
 $264 = (($rect) + 8|0);
 $265 = ($264);
 $266 = HEAP32[$265>>2]|0;
 $267 = (($263) + ($266))|0;
 $268 = (($267) - 1)|0;
 HEAP32[$260>>2] = $268;
 $269 = (($19) + 4|0);
 $270 = ($rect);
 $271 = (($270) + 4|0);
 $272 = HEAP32[$271>>2]|0;
 $273 = (($rect) + 8|0);
 $274 = (($273) + 4|0);
 $275 = HEAP32[$274>>2]|0;
 $276 = (($272) + ($275))|0;
 $277 = (($276) - 1)|0;
 HEAP32[$269>>2] = $277;
 $278 = $$byval_copy14;
 $279 = $$byval_copy14;
 $280 = $18;
 ;HEAP8[$279+0|0]=HEAP8[$280+0|0]|0;HEAP8[$279+1|0]=HEAP8[$280+1|0]|0;HEAP8[$279+2|0]=HEAP8[$280+2|0]|0;HEAP8[$279+3|0]=HEAP8[$280+3|0]|0;
 $281 = $$byval_copy15;
 $282 = $$byval_copy15;
 $283 = $19;
 ;HEAP32[$282+0>>2]=HEAP32[$283+0>>2]|0;HEAP32[$282+4>>2]=HEAP32[$283+4>>2]|0;
 _asciiDrawChar($253,$$byval_copy14,$$byval_copy15);
 $284 = $$byval_copy15;
 $285 = $$byval_copy14;
 STACKTOP = sp;return;
}
function _asciiDrawFilledRectangleColored($e,$rect,$bg,$fg) {
 $e = $e|0;
 $rect = $rect|0;
 $bg = $bg|0;
 $fg = $fg|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0;
 var $62 = 0, $63 = 0, $64 = 0, $65 = 0, $7 = 0, $8 = 0, $9 = 0, $rect$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 88|0;
 $$byval_copy1 = sp;
 $$byval_copy = sp + 16|0;
 $rect$byval_copy = sp + 24|0;
 $4 = sp + 64|0;
 $5 = sp + 72|0;
 $1 = $e;
 $2 = $bg;
 $3 = $fg;
 $6 = $1;
 $7 = ($6|0)!=(0|0);
 if (!($7)) {
  STACKTOP = sp;return;
 }
 $8 = (($rect) + 8|0);
 $9 = ($8);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($10|0)>(2);
 if (!($11)) {
  STACKTOP = sp;return;
 }
 $12 = (($rect) + 8|0);
 $13 = (($12) + 4|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = ($14|0)>(2);
 if (!($15)) {
  STACKTOP = sp;return;
 }
 $16 = $2;
 $17 = $16&255;
 $18 = ($17|0)<(8);
 if (!($18)) {
  STACKTOP = sp;return;
 }
 $19 = $3;
 $20 = $19&255;
 $21 = ($20|0)<(8);
 if (!($21)) {
  STACKTOP = sp;return;
 }
 $22 = $1;
 $23 = $2;
 $24 = $3;
 $25 = $rect$byval_copy;
 $26 = $rect$byval_copy;
 $27 = $rect;
 ;HEAP32[$26+0>>2]=HEAP32[$27+0>>2]|0;HEAP32[$26+4>>2]=HEAP32[$27+4>>2]|0;HEAP32[$26+8>>2]=HEAP32[$27+8>>2]|0;HEAP32[$26+12>>2]=HEAP32[$27+12>>2]|0;
 _asciiDrawRectangleColored($22,$rect$byval_copy,$23,$24);
 $28 = $rect$byval_copy;
 $29 = $1;
 $30 = ($4);
 HEAP8[$30] = 32;
 $31 = (($4) + 1|0);
 $32 = $2;
 HEAP8[$31] = $32;
 $33 = (($4) + 2|0);
 $34 = $3;
 HEAP8[$33] = $34;
 $35 = (($4) + 3|0);
 HEAP8[$35] = 0;
 $36 = ($5);
 $37 = ($36);
 $38 = ($rect);
 $39 = ($38);
 $40 = HEAP32[$39>>2]|0;
 $41 = (($40) + 1)|0;
 HEAP32[$37>>2] = $41;
 $42 = (($36) + 4|0);
 $43 = ($rect);
 $44 = (($43) + 4|0);
 $45 = HEAP32[$44>>2]|0;
 $46 = (($45) + 1)|0;
 HEAP32[$42>>2] = $46;
 $47 = (($5) + 8|0);
 $48 = ($47);
 $49 = (($rect) + 8|0);
 $50 = ($49);
 $51 = HEAP32[$50>>2]|0;
 $52 = (($51) - 2)|0;
 HEAP32[$48>>2] = $52;
 $53 = (($47) + 4|0);
 $54 = (($rect) + 8|0);
 $55 = (($54) + 4|0);
 $56 = HEAP32[$55>>2]|0;
 $57 = (($56) - 2)|0;
 HEAP32[$53>>2] = $57;
 $58 = $$byval_copy;
 $59 = $$byval_copy;
 $60 = $4;
 ;HEAP8[$59+0|0]=HEAP8[$60+0|0]|0;HEAP8[$59+1|0]=HEAP8[$60+1|0]|0;HEAP8[$59+2|0]=HEAP8[$60+2|0]|0;HEAP8[$59+3|0]=HEAP8[$60+3|0]|0;
 $61 = $$byval_copy1;
 $62 = $$byval_copy1;
 $63 = $5;
 ;HEAP32[$62+0>>2]=HEAP32[$63+0>>2]|0;HEAP32[$62+4>>2]=HEAP32[$63+4>>2]|0;HEAP32[$62+8>>2]=HEAP32[$63+8>>2]|0;HEAP32[$62+12>>2]=HEAP32[$63+12>>2]|0;
 _asciiFillRect($29,$$byval_copy,$$byval_copy1);
 $64 = $$byval_copy1;
 $65 = $$byval_copy;
 STACKTOP = sp;return;
}
function _asciiOnMouseMove($e,$newPos) {
 $e = $e|0;
 $newPos = $newPos|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $newPos$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $newPos$byval_copy = sp;
 $1 = $e;
 $2 = $1;
 $3 = (($2) + 140|0);
 $4 = ($3);
 $5 = HEAP32[$4>>2]|0;
 $6 = ($newPos);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($5|0)!=($7|0);
 do {
  if (!($8)) {
   $9 = $1;
   $10 = (($9) + 140|0);
   $11 = (($10) + 4|0);
   $12 = HEAP32[$11>>2]|0;
   $13 = (($newPos) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = ($12|0)!=($14|0);
   if ($15) {
    break;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $16 = $1;
 $17 = (($16) + 140|0);
 $18 = $17;
 $19 = $newPos;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;
 $20 = $1;
 $21 = (($20) + 164|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = ($22|0)!=(0|0);
 if ($23) {
  $24 = $1;
  $25 = (($24) + 164|0);
  $26 = HEAP32[$25>>2]|0;
  $27 = $1;
  $28 = (($27) + 168|0);
  $29 = HEAP32[$28>>2]|0;
  $30 = $newPos$byval_copy;
  $31 = $newPos$byval_copy;
  $32 = $newPos;
  ;HEAP32[$31+0>>2]=HEAP32[$32+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$32+4>>2]|0;
  FUNCTION_TABLE_vii[$26 & 15]($newPos$byval_copy,$29);
  $33 = $newPos$byval_copy;
 }
 STACKTOP = sp;return;
}
function _asciiOnMouseDown($e,$key) {
 $e = $e|0;
 $key = $key|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $key;
 $3 = $1;
 $4 = (($3) + 136|0);
 $5 = HEAP8[$4]|0;
 $6 = $5&255;
 $7 = $2;
 $8 = $7&255;
 $9 = $6 & $8;
 $10 = ($9|0)==(0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = $2;
 $12 = $11&255;
 $13 = $1;
 $14 = (($13) + 136|0);
 $15 = HEAP8[$14]|0;
 $16 = $15&255;
 $17 = $16 | $12;
 $18 = $17&255;
 HEAP8[$14] = $18;
 $19 = $1;
 $20 = (($19) + 156|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = ($21|0)!=(0|0);
 if ($22) {
  $23 = $1;
  $24 = (($23) + 156|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = $2;
  $27 = $1;
  $28 = (($27) + 160|0);
  $29 = HEAP32[$28>>2]|0;
  FUNCTION_TABLE_viii[$25 & 31]($26,1,$29);
 }
 STACKTOP = sp;return;
}
function _asciiOnMouseUp($e,$key) {
 $e = $e|0;
 $key = $key|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $key;
 $3 = $1;
 $4 = (($3) + 136|0);
 $5 = HEAP8[$4]|0;
 $6 = $5&255;
 $7 = $2;
 $8 = $7&255;
 $9 = $6 & $8;
 $10 = ($9|0)>(0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = $2;
 $12 = $11&255;
 $13 = $12 ^ -1;
 $14 = $1;
 $15 = (($14) + 136|0);
 $16 = HEAP8[$15]|0;
 $17 = $16&255;
 $18 = $17 & $13;
 $19 = $18&255;
 HEAP8[$15] = $19;
 $20 = $1;
 $21 = (($20) + 156|0);
 $22 = HEAP32[$21>>2]|0;
 $23 = ($22|0)!=(0|0);
 if ($23) {
  $24 = $1;
  $25 = (($24) + 156|0);
  $26 = HEAP32[$25>>2]|0;
  $27 = $2;
  $28 = $1;
  $29 = (($28) + 160|0);
  $30 = HEAP32[$29>>2]|0;
  FUNCTION_TABLE_viii[$26 & 31]($27,0,$30);
 }
 STACKTOP = sp;return;
}
function _asciiOnKeyDown($e,$key) {
 $e = $e|0;
 $key = $key|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $key;
 $3 = $2;
 $4 = $3&255;
 $5 = $1;
 $6 = (($5) + 76|0);
 $7 = (($6) + ($4)|0);
 $8 = HEAP8[$7]|0;
 $9 = $8 << 24 >> 24;
 $10 = ($9|0)==(0);
 do {
  if (!($10)) {
   $11 = $1;
   $12 = (($11) + 72|0);
   $13 = HEAP32[$12>>2]|0;
   $14 = $13 & 16;
   $15 = ($14>>>0)>(0);
   if ($15) {
    break;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $16 = $2;
 $17 = $16&255;
 $18 = $1;
 $19 = (($18) + 76|0);
 $20 = (($19) + ($17)|0);
 HEAP8[$20] = 1;
 $21 = $1;
 $22 = (($21) + 148|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = ($23|0)!=(0|0);
 if ($24) {
  $25 = $1;
  $26 = (($25) + 148|0);
  $27 = HEAP32[$26>>2]|0;
  $28 = $2;
  $29 = $1;
  $30 = (($29) + 152|0);
  $31 = HEAP32[$30>>2]|0;
  FUNCTION_TABLE_viii[$27 & 31]($28,1,$31);
 }
 STACKTOP = sp;return;
}
function _asciiOnKeyUp($e,$key) {
 $e = $e|0;
 $key = $key|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $key;
 $3 = $2;
 $4 = $3&255;
 $5 = $1;
 $6 = (($5) + 76|0);
 $7 = (($6) + ($4)|0);
 $8 = HEAP8[$7]|0;
 $9 = $8 << 24 >> 24;
 $10 = ($9|0)==(1);
 do {
  if (!($10)) {
   $11 = $1;
   $12 = (($11) + 72|0);
   $13 = HEAP32[$12>>2]|0;
   $14 = $13 & 16;
   $15 = ($14>>>0)>(0);
   if ($15) {
    break;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $16 = $2;
 $17 = $16&255;
 $18 = $1;
 $19 = (($18) + 76|0);
 $20 = (($19) + ($17)|0);
 HEAP8[$20] = 0;
 $21 = $1;
 $22 = (($21) + 148|0);
 $23 = HEAP32[$22>>2]|0;
 $24 = ($23|0)!=(0|0);
 if ($24) {
  $25 = $1;
  $26 = (($25) + 148|0);
  $27 = HEAP32[$26>>2]|0;
  $28 = $2;
  $29 = $1;
  $30 = (($29) + 152|0);
  $31 = HEAP32[$30>>2]|0;
  FUNCTION_TABLE_viii[$27 & 31]($28,0,$31);
 }
 STACKTOP = sp;return;
}
function __ascii_initWeb($e,$w,$h) {
 $e = $e|0;
 $w = $w|0;
 $h = $h|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $2 = $e;
 $3 = $w;
 $4 = $h;
 _js_ascii_onMouseMoveEvent(0);
 _js_ascii_onMouseKeyEvent(0);
 $5 = $2;
 HEAP32[((520))>>2] = $5;
 $6 = $3;
 $7 = $4;
 $8 = Math_imul($6, $7)|0;
 HEAP32[(((520) + 8|0))>>2] = $8;
 HEAP32[(((520) + 12|0))>>2] = 0;
 $9 = $2;
 $10 = (($9) + 68|0);
 $11 = (($10) + 1|0);
 $12 = HEAP8[$11]|0;
 HEAP8[(((520) + 16|0))] = $12;
 $13 = $2;
 $14 = (($13) + 68|0);
 $15 = (($14) + 2|0);
 $16 = HEAP8[$15]|0;
 HEAP8[(((520) + 17|0))] = $16;
 $17 = HEAP32[(((520) + 8|0))>>2]|0;
 $18 = (($17) + 1)|0;
 $19 = (_malloc($18)|0);
 HEAP32[(((520) + 4|0))>>2] = $19;
 $20 = HEAP32[(((520) + 4|0))>>2]|0;
 $21 = ($20|0)!=(0|0);
 if ($21) {
  $22 = $3;
  $23 = $4;
  _js_ascii_setConsoleSize(($22|0),($23|0));
  (_glfwInit()|0);
  _glfwSetKeyCallback((11|0));
  _js_ascii_toggleEvents(1);
  $24 = (_SDL_GetTicks()|0);
  _srand(($24|0));
  $1 = 1;
  $25 = $1;
  STACKTOP = sp;return ($25|0);
 } else {
  $1 = 0;
  $25 = $1;
  STACKTOP = sp;return ($25|0);
 }
 return 0|0;
}
function __ascii_glfwKeyHandler($glKey,$glAction) {
 $glKey = $glKey|0;
 $glAction = $glAction|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $action = 0, $i = 0, $key = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $1 = $glKey;
 $2 = $glAction;
 $3 = HEAP32[((520))>>2]|0;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  STACKTOP = sp;return;
 }
 $5 = $2;
 $6 = ($5|0)==(1);
 do {
  if (!($6)) {
   $7 = $2;
   $8 = ($7|0)==(0);
   if ($8) {
    break;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $key = 60;
 $9 = $2;
 $10 = ($9|0)==(1);
 $11 = $10&1;
 $12 = $11&255;
 $action = $12;
 $13 = $1;
 $14 = ($13|0)>=(65);
 do {
  if ($14) {
   $15 = $1;
   $16 = ($15|0)<=(90);
   if (!($16)) {
    label = 7;
    break;
   }
   $17 = $1;
   $18 = (($17) - 65)|0;
   $19 = (34 + ($18))|0;
   $20 = $19&255;
   $key = $20;
  } else {
   label = 7;
  }
 } while(0);
 if ((label|0) == 7) {
  $21 = $1;
  $22 = ($21|0)>=(48);
  do {
   if ($22) {
    $23 = $1;
    $24 = ($23|0)<=(57);
    if (!($24)) {
     label = 10;
     break;
    }
    $25 = $1;
    $26 = (($25) - 48)|0;
    $27 = (24 + ($26))|0;
    $28 = $27&255;
    $key = $28;
   } else {
    label = 10;
   }
  } while(0);
  if ((label|0) == 10) {
   $29 = $1;
   $30 = ($29|0)>=(258);
   do {
    if ($30) {
     $31 = $1;
     $32 = ($31|0)<=(269);
     if (!($32)) {
      label = 13;
      break;
     }
     $33 = $1;
     $34 = (($33) - 258)|0;
     $35 = (12 + ($34))|0;
     $36 = $35&255;
     $key = $36;
    } else {
     label = 13;
    }
   } while(0);
   if ((label|0) == 13) {
    $i = 0;
    while(1) {
     $37 = $i;
     $38 = $37&255;
     $39 = ($38|0)<(18);
     if (!($39)) {
      break;
     }
     $40 = $i;
     $41 = $40&255;
     $42 = ((544) + ($41<<3)|0);
     $43 = ($42);
     $44 = HEAP32[$43>>2]|0;
     $45 = $1;
     $46 = ($44|0)==($45|0);
     if ($46) {
      label = 16;
      break;
     }
     $52 = $i;
     $53 = (($52) + 1)<<24>>24;
     $i = $53;
    }
    if ((label|0) == 16) {
     $47 = $i;
     $48 = $47&255;
     $49 = ((544) + ($48<<3)|0);
     $50 = (($49) + 4|0);
     $51 = HEAP8[$50]|0;
     $key = $51;
    }
   }
  }
 }
 $54 = $key;
 $55 = $54&255;
 $56 = ($55|0)<(60);
 if ($56) {
  $57 = $action;
  $58 = ($57<<24>>24)!=(0);
  if ($58) {
   $59 = HEAP32[((520))>>2]|0;
   $60 = $key;
   _asciiOnKeyDown($59,$60);
  } else {
   $61 = HEAP32[((520))>>2]|0;
   $62 = $key;
   _asciiOnKeyUp($61,$62);
  }
 }
 STACKTOP = sp;return;
}
function __ascii_runWeb($engine) {
 $engine = $engine|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $engine;
 STACKTOP = sp;return;
}
function __ascii_quitWeb($engine) {
 $engine = $engine|0;
 var $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $len = 0, $message = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $engine;
 $message = (688);
 $2 = $message;
 $3 = (_strlen(($2|0))|0);
 $4 = $3&255;
 $len = $4;
 _glfwSetKeyCallback((0|0));
 _js_ascii_toggleEvents(0);
 $5 = HEAP32[(((520) + 4|0))>>2]|0;
 _free($5);
 HEAP32[(((520) + 4|0))>>2] = 0;
 HEAP32[(((520) + 8|0))>>2] = 0;
 $6 = $len;
 $7 = $6&255;
 _js_ascii_setConsoleSize(($7|0),1);
 $8 = $message;
 $9 = $len;
 $10 = $9&255;
 _js_ascii_changeConsoleText(($8|0),($10|0));
 STACKTOP = sp;return;
}
function __ascii_signalQuitWeb($e) {
 $e = $e|0;
 var $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $2 = $1;
 _asciiQuit($2);
 STACKTOP = sp;return;
}
function __ascii_setTimeoutWeb($e,$id) {
 $e = $e|0;
 $id = $id|0;
 var $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $id;
 $3 = $2;
 $4 = $3 << 24 >> 24;
 $5 = $1;
 $6 = (($5) + 180|0);
 $7 = (($6) + (($4*12)|0)|0);
 $8 = ($7);
 $9 = HEAP32[$8>>2]|0;
 $10 = $2;
 $11 = $10 << 24 >> 24;
 _js_ascii_setTimeout(($9|0),($11|0));
 STACKTOP = sp;return 1;
}
function __onjs_fireTimeout($id) {
 $id = $id|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $id;
 $2 = $1;
 $3 = HEAP32[((520))>>2]|0;
 $4 = (($3) + 180|0);
 $5 = (($4) + (($2*12)|0)|0);
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)!=(0|0);
 if (!($8)) {
  STACKTOP = sp;return 0;
 }
 $9 = $1;
 $10 = HEAP32[((520))>>2]|0;
 $11 = (($10) + 180|0);
 $12 = (($11) + (($9*12)|0)|0);
 $13 = (($12) + 4|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = $1;
 $16 = HEAP32[((520))>>2]|0;
 $17 = (($16) + 180|0);
 $18 = (($17) + (($15*12)|0)|0);
 $19 = (($18) + 8|0);
 $20 = HEAP32[$19>>2]|0;
 FUNCTION_TABLE_vi[$14 & 7]($20);
 $21 = $1;
 $22 = HEAP32[((520))>>2]|0;
 $23 = (($22) + 180|0);
 $24 = (($23) + (($21*12)|0)|0);
 $25 = (($24) + 4|0);
 HEAP32[$25>>2] = 0;
 STACKTOP = sp;return 0;
}
function __onjs_fireMouseMove($X,$Y) {
 $X = $X|0;
 $Y = $Y|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $$byval_copy = sp;
 $3 = sp + 24|0;
 $1 = $X;
 $2 = $Y;
 $4 = HEAP32[((520))>>2]|0;
 $5 = ($3);
 $6 = $1;
 HEAP32[$5>>2] = $6;
 $7 = (($3) + 4|0);
 $8 = $2;
 HEAP32[$7>>2] = $8;
 $9 = $$byval_copy;
 $10 = $$byval_copy;
 $11 = $3;
 ;HEAP32[$10+0>>2]=HEAP32[$11+0>>2]|0;HEAP32[$10+4>>2]=HEAP32[$11+4>>2]|0;
 _asciiOnMouseMove($4,$$byval_copy);
 $12 = $$byval_copy;
 STACKTOP = sp;return 0;
}
function __onjs_fireMouseKey($buttonPressed,$isDown) {
 $buttonPressed = $buttonPressed|0;
 $isDown = $isDown|0;
 var $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $buttonPressed;
 $2 = $isDown;
 $3 = $2;
 $4 = ($3|0)!=(0);
 if ($4) {
  $5 = HEAP32[((520))>>2]|0;
  $6 = $1;
  $7 = $6&255;
  _asciiOnMouseDown($5,$7);
  STACKTOP = sp;return 0;
 } else {
  $8 = HEAP32[((520))>>2]|0;
  $9 = $1;
  $10 = $9&255;
  _asciiOnMouseUp($8,$10);
  STACKTOP = sp;return 0;
 }
 return 0|0;
}
function __ascii_getWebColorString($c) {
 $c = $c|0;
 var $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $c;
 $2 = $1;
 $3 = $2 << 24 >> 24;
 $4 = ($3|0)<(0);
 if ($4) {
  label = 3;
 } else {
  $5 = $1;
  $6 = $5 << 24 >> 24;
  $7 = ($6|0)>=(8);
  if ($7) {
   label = 3;
  }
 }
 if ((label|0) == 3) {
  $1 = 0;
 }
 $8 = $1;
 $9 = $8 << 24 >> 24;
 $10 = ((728) + ($9<<2)|0);
 $11 = HEAP32[$10>>2]|0;
 STACKTOP = sp;return ($11|0);
}
function __ascii_flipWeb($e) {
 $e = $e|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0;
 var $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $bc = 0, $c = 0, $consoleSize = 0, $curBc = 0, $curFc = 0, $fc = 0, $inSpan = 0, $newBuffer = 0, $newBuffer10 = 0, $newBuffer12 = 0, $newBuffer14 = 0, $newBuffer2 = 0, $newBuffer4 = 0, $newBuffer6 = 0;
 var $newBuffer8 = 0, $newLen = 0, $newLen1 = 0, $newLen11 = 0, $newLen13 = 0, $newLen3 = 0, $newLen5 = 0, $newLen7 = 0, $newLen9 = 0, $sourcePtr = 0, $spanStr = 0, $x = 0, $y = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0;
 $consoleSize = sp + 80|0;
 $spanStr = sp + 96|0;
 $2 = $e;
 $3 = HEAP8[(((520) + 16|0))]|0;
 $curBc = $3;
 $4 = HEAP8[(((520) + 17|0))]|0;
 $curFc = $4;
 $inSpan = 0;
 $5 = $2;
 $6 = (($5) + 32|0);
 $7 = ($6);
 $8 = (($7) + 8|0);
 $9 = $consoleSize;
 $10 = $8;
 ;HEAP32[$9+0>>2]=HEAP32[$10+0>>2]|0;HEAP32[$9+4>>2]=HEAP32[$10+4>>2]|0;
 $11 = $2;
 $12 = (($11) + 32|0);
 $13 = (($12) + 16|0);
 $14 = HEAP32[$13>>2]|0;
 $sourcePtr = $14;
 $15 = $spanStr;
 dest=$15+0|0; src=(824)+0|0; stop=dest+25|0; do { HEAP8[dest]=HEAP8[src]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));;
 HEAP32[(((520) + 12|0))>>2] = 0;
 $16 = $2;
 $17 = (($16) + 68|0);
 $18 = (($17) + 1|0);
 $19 = HEAP8[$18]|0;
 $20 = (__ascii_getWebColorString($19)|0);
 $21 = $2;
 $22 = (($21) + 68|0);
 $23 = (($22) + 2|0);
 $24 = HEAP8[$23]|0;
 $25 = (__ascii_getWebColorString($24)|0);
 _js_ascii_changeConsoleColors(($20|0),($25|0));
 $26 = HEAP32[(((520) + 12|0))>>2]|0;
 $27 = (($26) + 5)|0;
 $28 = HEAP32[(((520) + 8|0))>>2]|0;
 $29 = ($27>>>0)>($28>>>0);
 do {
  if ($29) {
   $30 = HEAP32[(((520) + 8|0))>>2]|0;
   $31 = (($30) + 4096)|0;
   $newLen = $31;
   while(1) {
    $32 = $newLen;
    $33 = HEAP32[(((520) + 12|0))>>2]|0;
    $34 = (($33) + 5)|0;
    $35 = ($32>>>0)<($34>>>0);
    if (!($35)) {
     break;
    }
    $36 = $newLen;
    $37 = (($36) + 4096)|0;
    $newLen = $37;
   }
   $38 = HEAP32[(((520) + 4|0))>>2]|0;
   $39 = $newLen;
   $40 = (($39) + 1)|0;
   $41 = (_realloc($38,$40)|0);
   $newBuffer = $41;
   $42 = $newBuffer;
   $43 = ($42|0)!=(0|0);
   if ($43) {
    $44 = $newBuffer;
    HEAP32[(((520) + 4|0))>>2] = $44;
    $45 = $newLen;
    HEAP32[(((520) + 8|0))>>2] = $45;
    break;
   }
   $1 = 0;
   $326 = $1;
   STACKTOP = sp;return ($326|0);
  }
 } while(0);
 $46 = HEAP32[(((520) + 4|0))>>2]|0;
 $47 = HEAP32[(((520) + 12|0))>>2]|0;
 $48 = (($46) + ($47)|0);
 ;HEAP8[$48+0|0]=HEAP8[(856)+0|0]|0;HEAP8[$48+1|0]=HEAP8[(856)+1|0]|0;HEAP8[$48+2|0]=HEAP8[(856)+2|0]|0;HEAP8[$48+3|0]=HEAP8[(856)+3|0]|0;HEAP8[$48+4|0]=HEAP8[(856)+4|0]|0;
 $49 = HEAP32[(((520) + 12|0))>>2]|0;
 $50 = (($49) + 5)|0;
 HEAP32[(((520) + 12|0))>>2] = $50;
 $y = 0;
 L14: while(1) {
  $51 = $y;
  $52 = (($consoleSize) + 4|0);
  $53 = HEAP32[$52>>2]|0;
  $54 = ($51|0)<($53|0);
  if (!($54)) {
   label = 85;
   break;
  }
  $x = 0;
  while(1) {
   $55 = $x;
   $56 = ($consoleSize);
   $57 = HEAP32[$56>>2]|0;
   $58 = ($55|0)<($57|0);
   if (!($58)) {
    break;
   }
   $59 = $sourcePtr;
   $60 = ($59);
   $61 = HEAP8[$60]|0;
   $c = $61;
   $62 = $sourcePtr;
   $63 = (($62) + 1|0);
   $64 = HEAP8[$63]|0;
   $bc = $64;
   $65 = $sourcePtr;
   $66 = (($65) + 2|0);
   $67 = HEAP8[$66]|0;
   $fc = $67;
   $68 = $sourcePtr;
   $69 = ($68);
   $70 = HEAP8[$69]|0;
   $71 = $70 << 24 >> 24;
   $72 = ($71|0)>=(32);
   if ($72) {
    $73 = $sourcePtr;
    $74 = ($73);
    $75 = HEAP8[$74]|0;
    $76 = $75 << 24 >> 24;
    $77 = ($76|0)<=(126);
    if (!($77)) {
     label = 16;
    }
   } else {
    label = 16;
   }
   if ((label|0) == 16) {
    label = 0;
    $c = 32;
   }
   $78 = $bc;
   $79 = $78 << 24 >> 24;
   $80 = $curBc;
   $81 = $80 << 24 >> 24;
   $82 = ($79|0)!=($81|0);
   do {
    if ($82) {
     label = 19;
    } else {
     $83 = $fc;
     $84 = $83 << 24 >> 24;
     $85 = $curFc;
     $86 = $85 << 24 >> 24;
     $87 = ($84|0)!=($86|0);
     if ($87) {
      label = 19;
      break;
     }
     $211 = HEAP32[(((520) + 12|0))>>2]|0;
     $212 = (($211) + 1)|0;
     $213 = HEAP32[(((520) + 8|0))>>2]|0;
     $214 = ($212>>>0)>($213>>>0);
     if ($214) {
      $215 = HEAP32[(((520) + 8|0))>>2]|0;
      $216 = (($215) + 4096)|0;
      $newLen7 = $216;
      while(1) {
       $217 = $newLen7;
       $218 = HEAP32[(((520) + 12|0))>>2]|0;
       $219 = (($218) + 1)|0;
       $220 = ($217>>>0)<($219>>>0);
       if (!($220)) {
        break;
       }
       $221 = $newLen7;
       $222 = (($221) + 4096)|0;
       $newLen7 = $222;
      }
      $223 = HEAP32[(((520) + 4|0))>>2]|0;
      $224 = $newLen7;
      $225 = (($224) + 1)|0;
      $226 = (_realloc($223,$225)|0);
      $newBuffer8 = $226;
      $227 = $newBuffer8;
      $228 = ($227|0)!=(0|0);
      if (!($228)) {
       label = 68;
       break L14;
      }
      $229 = $newBuffer8;
      HEAP32[(((520) + 4|0))>>2] = $229;
      $230 = $newLen7;
      HEAP32[(((520) + 8|0))>>2] = $230;
     }
     $231 = $c;
     $232 = HEAP32[(((520) + 12|0))>>2]|0;
     $233 = HEAP32[(((520) + 4|0))>>2]|0;
     $234 = (($233) + ($232)|0);
     HEAP8[$234] = $231;
     $235 = HEAP32[(((520) + 12|0))>>2]|0;
     $236 = (($235) + 1)|0;
     HEAP32[(((520) + 12|0))>>2] = $236;
    }
   } while(0);
   if ((label|0) == 19) {
    label = 0;
    $88 = $inSpan;
    $89 = $88 << 24 >> 24;
    $90 = ($89|0)==(1);
    if ($90) {
     $91 = HEAP32[(((520) + 12|0))>>2]|0;
     $92 = (($91) + 7)|0;
     $93 = HEAP32[(((520) + 8|0))>>2]|0;
     $94 = ($92>>>0)>($93>>>0);
     if ($94) {
      $95 = HEAP32[(((520) + 8|0))>>2]|0;
      $96 = (($95) + 4096)|0;
      $newLen1 = $96;
      while(1) {
       $97 = $newLen1;
       $98 = HEAP32[(((520) + 12|0))>>2]|0;
       $99 = (($98) + 7)|0;
       $100 = ($97>>>0)<($99>>>0);
       if (!($100)) {
        break;
       }
       $101 = $newLen1;
       $102 = (($101) + 4096)|0;
       $newLen1 = $102;
      }
      $103 = HEAP32[(((520) + 4|0))>>2]|0;
      $104 = $newLen1;
      $105 = (($104) + 1)|0;
      $106 = (_realloc($103,$105)|0);
      $newBuffer2 = $106;
      $107 = $newBuffer2;
      $108 = ($107|0)!=(0|0);
      if (!($108)) {
       label = 26;
       break L14;
      }
      $109 = $newBuffer2;
      HEAP32[(((520) + 4|0))>>2] = $109;
      $110 = $newLen1;
      HEAP32[(((520) + 8|0))>>2] = $110;
     }
     $111 = HEAP32[(((520) + 4|0))>>2]|0;
     $112 = HEAP32[(((520) + 12|0))>>2]|0;
     $113 = (($111) + ($112)|0);
     ;HEAP8[$113+0|0]=HEAP8[(864)+0|0]|0;HEAP8[$113+1|0]=HEAP8[(864)+1|0]|0;HEAP8[$113+2|0]=HEAP8[(864)+2|0]|0;HEAP8[$113+3|0]=HEAP8[(864)+3|0]|0;HEAP8[$113+4|0]=HEAP8[(864)+4|0]|0;HEAP8[$113+5|0]=HEAP8[(864)+5|0]|0;HEAP8[$113+6|0]=HEAP8[(864)+6|0]|0;
     $114 = HEAP32[(((520) + 12|0))>>2]|0;
     $115 = (($114) + 7)|0;
     HEAP32[(((520) + 12|0))>>2] = $115;
    }
    $116 = HEAP8[(((520) + 16|0))]|0;
    $117 = $116 << 24 >> 24;
    $118 = $bc;
    $119 = $118 << 24 >> 24;
    $120 = ($117|0)==($119|0);
    do {
     if ($120) {
      $121 = HEAP8[(((520) + 17|0))]|0;
      $122 = $121 << 24 >> 24;
      $123 = $fc;
      $124 = $123 << 24 >> 24;
      $125 = ($122|0)==($124|0);
      if (!($125)) {
       $126 = $c;
       $127 = $126 << 24 >> 24;
       $128 = ($127|0)==(32);
       if (!($128)) {
        label = 43;
        break;
       }
      }
      $inSpan = 0;
      $129 = HEAP8[(((520) + 16|0))]|0;
      $curBc = $129;
      $130 = HEAP8[(((520) + 17|0))]|0;
      $curFc = $130;
      $131 = HEAP32[(((520) + 12|0))>>2]|0;
      $132 = (($131) + 1)|0;
      $133 = HEAP32[(((520) + 8|0))>>2]|0;
      $134 = ($132>>>0)>($133>>>0);
      if ($134) {
       $135 = HEAP32[(((520) + 8|0))>>2]|0;
       $136 = (($135) + 4096)|0;
       $newLen3 = $136;
       while(1) {
        $137 = $newLen3;
        $138 = HEAP32[(((520) + 12|0))>>2]|0;
        $139 = (($138) + 1)|0;
        $140 = ($137>>>0)<($139>>>0);
        if (!($140)) {
         break;
        }
        $141 = $newLen3;
        $142 = (($141) + 4096)|0;
        $newLen3 = $142;
       }
       $143 = HEAP32[(((520) + 4|0))>>2]|0;
       $144 = $newLen3;
       $145 = (($144) + 1)|0;
       $146 = (_realloc($143,$145)|0);
       $newBuffer4 = $146;
       $147 = $newBuffer4;
       $148 = ($147|0)!=(0|0);
       if (!($148)) {
        label = 39;
        break L14;
       }
       $149 = $newBuffer4;
       HEAP32[(((520) + 4|0))>>2] = $149;
       $150 = $newLen3;
       HEAP32[(((520) + 8|0))>>2] = $150;
      }
      $151 = $c;
      $152 = HEAP32[(((520) + 12|0))>>2]|0;
      $153 = HEAP32[(((520) + 4|0))>>2]|0;
      $154 = (($153) + ($152)|0);
      HEAP8[$154] = $151;
      $155 = HEAP32[(((520) + 12|0))>>2]|0;
      $156 = (($155) + 1)|0;
      HEAP32[(((520) + 12|0))>>2] = $156;
     } else {
      label = 43;
     }
    } while(0);
    if ((label|0) == 43) {
     label = 0;
     $157 = $bc;
     $158 = $157 << 24 >> 24;
     $159 = ($158|0)<(0);
     do {
      if ($159) {
       label = 45;
      } else {
       $160 = $bc;
       $161 = $160 << 24 >> 24;
       $162 = ($161|0)>=(8);
       if ($162) {
        label = 45;
        break;
       }
       $163 = $bc;
       $164 = $163 << 24 >> 24;
       $165 = $164;
      }
     } while(0);
     if ((label|0) == 45) {
      label = 0;
      $165 = 0;
     }
     $166 = (($165) + 48)|0;
     $167 = $166&255;
     $168 = (($spanStr) + 15|0);
     HEAP8[$168] = $167;
     $169 = $fc;
     $170 = $169 << 24 >> 24;
     $171 = ($170|0)<(0);
     do {
      if ($171) {
       label = 49;
      } else {
       $172 = $fc;
       $173 = $172 << 24 >> 24;
       $174 = ($173|0)>=(8);
       if ($174) {
        label = 49;
        break;
       }
       $175 = $fc;
       $176 = $175 << 24 >> 24;
       $177 = $176;
      }
     } while(0);
     if ((label|0) == 49) {
      label = 0;
      $177 = 0;
     }
     $178 = (($177) + 48)|0;
     $179 = $178&255;
     $180 = (($spanStr) + 19|0);
     HEAP8[$180] = $179;
     $181 = $c;
     $182 = (($spanStr) + 23|0);
     HEAP8[$182] = $181;
     $183 = HEAP32[(((520) + 12|0))>>2]|0;
     $184 = (($183) + 24)|0;
     $185 = HEAP32[(((520) + 8|0))>>2]|0;
     $186 = ($184>>>0)>($185>>>0);
     if ($186) {
      $187 = HEAP32[(((520) + 8|0))>>2]|0;
      $188 = (($187) + 4096)|0;
      $newLen5 = $188;
      while(1) {
       $189 = $newLen5;
       $190 = HEAP32[(((520) + 12|0))>>2]|0;
       $191 = (($190) + 24)|0;
       $192 = ($189>>>0)<($191>>>0);
       if (!($192)) {
        break;
       }
       $193 = $newLen5;
       $194 = (($193) + 4096)|0;
       $newLen5 = $194;
      }
      $195 = HEAP32[(((520) + 4|0))>>2]|0;
      $196 = $newLen5;
      $197 = (($196) + 1)|0;
      $198 = (_realloc($195,$197)|0);
      $newBuffer6 = $198;
      $199 = $newBuffer6;
      $200 = ($199|0)!=(0|0);
      if (!($200)) {
       label = 57;
       break L14;
      }
      $201 = $newBuffer6;
      HEAP32[(((520) + 4|0))>>2] = $201;
      $202 = $newLen5;
      HEAP32[(((520) + 8|0))>>2] = $202;
     }
     $203 = HEAP32[(((520) + 4|0))>>2]|0;
     $204 = HEAP32[(((520) + 12|0))>>2]|0;
     $205 = (($203) + ($204)|0);
     $206 = $spanStr;
     dest=$205+0|0; src=$206+0|0; stop=dest+24|0; do { HEAP8[dest]=HEAP8[src]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));;
     $207 = HEAP32[(((520) + 12|0))>>2]|0;
     $208 = (($207) + 24)|0;
     HEAP32[(((520) + 12|0))>>2] = $208;
     $209 = $bc;
     $curBc = $209;
     $210 = $fc;
     $curFc = $210;
     $inSpan = 1;
    }
   }
   $237 = $sourcePtr;
   $238 = (($237) + 4|0);
   $sourcePtr = $238;
   $239 = $x;
   $240 = (($239) + 1)|0;
   $x = $240;
  }
  $241 = HEAP32[(((520) + 12|0))>>2]|0;
  $242 = (($241) + 4)|0;
  $243 = HEAP32[(((520) + 8|0))>>2]|0;
  $244 = ($242>>>0)>($243>>>0);
  if ($244) {
   $245 = HEAP32[(((520) + 8|0))>>2]|0;
   $246 = (($245) + 4096)|0;
   $newLen9 = $246;
   while(1) {
    $247 = $newLen9;
    $248 = HEAP32[(((520) + 12|0))>>2]|0;
    $249 = (($248) + 4)|0;
    $250 = ($247>>>0)<($249>>>0);
    if (!($250)) {
     break;
    }
    $251 = $newLen9;
    $252 = (($251) + 4096)|0;
    $newLen9 = $252;
   }
   $253 = HEAP32[(((520) + 4|0))>>2]|0;
   $254 = $newLen9;
   $255 = (($254) + 1)|0;
   $256 = (_realloc($253,$255)|0);
   $newBuffer10 = $256;
   $257 = $newBuffer10;
   $258 = ($257|0)!=(0|0);
   if (!($258)) {
    label = 80;
    break;
   }
   $259 = $newBuffer10;
   HEAP32[(((520) + 4|0))>>2] = $259;
   $260 = $newLen9;
   HEAP32[(((520) + 8|0))>>2] = $260;
  }
  $261 = HEAP32[(((520) + 4|0))>>2]|0;
  $262 = HEAP32[(((520) + 12|0))>>2]|0;
  $263 = (($261) + ($262)|0);
  ;HEAP8[$263+0|0]=HEAP8[(872)+0|0]|0;HEAP8[$263+1|0]=HEAP8[(872)+1|0]|0;HEAP8[$263+2|0]=HEAP8[(872)+2|0]|0;HEAP8[$263+3|0]=HEAP8[(872)+3|0]|0;
  $264 = HEAP32[(((520) + 12|0))>>2]|0;
  $265 = (($264) + 4)|0;
  HEAP32[(((520) + 12|0))>>2] = $265;
  $266 = $y;
  $267 = (($266) + 1)|0;
  $y = $267;
 }
 if ((label|0) == 26) {
  $1 = 0;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 else if ((label|0) == 39) {
  $1 = 0;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 else if ((label|0) == 57) {
  $1 = 0;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 else if ((label|0) == 68) {
  $1 = 0;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 else if ((label|0) == 80) {
  $1 = 0;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 else if ((label|0) == 85) {
  $268 = $inSpan;
  $269 = $268 << 24 >> 24;
  $270 = ($269|0)==(1);
  if ($270) {
   $271 = HEAP32[(((520) + 12|0))>>2]|0;
   $272 = (($271) + 7)|0;
   $273 = HEAP32[(((520) + 8|0))>>2]|0;
   $274 = ($272>>>0)>($273>>>0);
   do {
    if ($274) {
     $275 = HEAP32[(((520) + 8|0))>>2]|0;
     $276 = (($275) + 4096)|0;
     $newLen11 = $276;
     while(1) {
      $277 = $newLen11;
      $278 = HEAP32[(((520) + 12|0))>>2]|0;
      $279 = (($278) + 7)|0;
      $280 = ($277>>>0)<($279>>>0);
      if (!($280)) {
       break;
      }
      $281 = $newLen11;
      $282 = (($281) + 4096)|0;
      $newLen11 = $282;
     }
     $283 = HEAP32[(((520) + 4|0))>>2]|0;
     $284 = $newLen11;
     $285 = (($284) + 1)|0;
     $286 = (_realloc($283,$285)|0);
     $newBuffer12 = $286;
     $287 = $newBuffer12;
     $288 = ($287|0)!=(0|0);
     if ($288) {
      $289 = $newBuffer12;
      HEAP32[(((520) + 4|0))>>2] = $289;
      $290 = $newLen11;
      HEAP32[(((520) + 8|0))>>2] = $290;
      break;
     }
     $1 = 0;
     $326 = $1;
     STACKTOP = sp;return ($326|0);
    }
   } while(0);
   $291 = HEAP32[(((520) + 4|0))>>2]|0;
   $292 = HEAP32[(((520) + 12|0))>>2]|0;
   $293 = (($291) + ($292)|0);
   ;HEAP8[$293+0|0]=HEAP8[(864)+0|0]|0;HEAP8[$293+1|0]=HEAP8[(864)+1|0]|0;HEAP8[$293+2|0]=HEAP8[(864)+2|0]|0;HEAP8[$293+3|0]=HEAP8[(864)+3|0]|0;HEAP8[$293+4|0]=HEAP8[(864)+4|0]|0;HEAP8[$293+5|0]=HEAP8[(864)+5|0]|0;HEAP8[$293+6|0]=HEAP8[(864)+6|0]|0;
   $294 = HEAP32[(((520) + 12|0))>>2]|0;
   $295 = (($294) + 7)|0;
   HEAP32[(((520) + 12|0))>>2] = $295;
  }
  $296 = HEAP32[(((520) + 12|0))>>2]|0;
  $297 = (($296) + 6)|0;
  $298 = HEAP32[(((520) + 8|0))>>2]|0;
  $299 = ($297>>>0)>($298>>>0);
  do {
   if ($299) {
    $300 = HEAP32[(((520) + 8|0))>>2]|0;
    $301 = (($300) + 4096)|0;
    $newLen13 = $301;
    while(1) {
     $302 = $newLen13;
     $303 = HEAP32[(((520) + 12|0))>>2]|0;
     $304 = (($303) + 6)|0;
     $305 = ($302>>>0)<($304>>>0);
     if (!($305)) {
      break;
     }
     $306 = $newLen13;
     $307 = (($306) + 4096)|0;
     $newLen13 = $307;
    }
    $308 = HEAP32[(((520) + 4|0))>>2]|0;
    $309 = $newLen13;
    $310 = (($309) + 1)|0;
    $311 = (_realloc($308,$310)|0);
    $newBuffer14 = $311;
    $312 = $newBuffer14;
    $313 = ($312|0)!=(0|0);
    if ($313) {
     $314 = $newBuffer14;
     HEAP32[(((520) + 4|0))>>2] = $314;
     $315 = $newLen13;
     HEAP32[(((520) + 8|0))>>2] = $315;
     break;
    }
    $1 = 0;
    $326 = $1;
    STACKTOP = sp;return ($326|0);
   }
  } while(0);
  $316 = HEAP32[(((520) + 4|0))>>2]|0;
  $317 = HEAP32[(((520) + 12|0))>>2]|0;
  $318 = (($316) + ($317)|0);
  ;HEAP8[$318+0|0]=HEAP8[(880)+0|0]|0;HEAP8[$318+1|0]=HEAP8[(880)+1|0]|0;HEAP8[$318+2|0]=HEAP8[(880)+2|0]|0;HEAP8[$318+3|0]=HEAP8[(880)+3|0]|0;HEAP8[$318+4|0]=HEAP8[(880)+4|0]|0;HEAP8[$318+5|0]=HEAP8[(880)+5|0]|0;
  $319 = HEAP32[(((520) + 12|0))>>2]|0;
  $320 = (($319) + 6)|0;
  HEAP32[(((520) + 12|0))>>2] = $320;
  $321 = HEAP32[(((520) + 12|0))>>2]|0;
  $322 = HEAP32[(((520) + 4|0))>>2]|0;
  $323 = (($322) + ($321)|0);
  HEAP8[$323] = 0;
  $324 = HEAP32[(((520) + 4|0))>>2]|0;
  $325 = HEAP32[(((520) + 12|0))>>2]|0;
  _js_ascii_changeConsoleText(($324|0),($325|0));
  $1 = 1;
  $326 = $1;
  STACKTOP = sp;return ($326|0);
 }
 return 0|0;
}
function __ascii_eventChangedWeb($e,$ev) {
 $e = $e|0;
 $ev = $ev|0;
 var $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $e;
 $2 = $ev;
 STACKTOP = sp;return;
}
function _loadRandomArena($mayFlee) {
 $mayFlee = $mayFlee|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $gamePtr = 0, $i = 0, $mapPtr = 0, $textPtr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $$byval_copy = sp;
 $2 = sp + 48|0;
 $3 = sp + 56|0;
 $4 = sp + 88|0;
 $5 = sp + 96|0;
 $6 = sp + 104|0;
 $1 = $mayFlee;
 $7 = HEAP32[(((9832) + 356|0))>>2]|0;
 $8 = ($7|0)==(0|0);
 if ($8) {
  $9 = (_malloc(1500)|0);
  HEAP32[(((9832) + 356|0))>>2] = $9;
  $10 = ($2);
  HEAP32[$10>>2] = 60;
  $11 = (($2) + 4|0);
  HEAP32[$11>>2] = 25;
  $12 = $$byval_copy;
  $13 = $$byval_copy;
  $14 = $2;
  ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;
  _asciiCreateBitmap($3,$$byval_copy);
  $15 = $$byval_copy;
  $16 = $3;
  ;HEAP32[((((9832) + 360|0)))+0>>2]=HEAP32[$16+0>>2]|0;HEAP32[((((9832) + 360|0)))+4>>2]=HEAP32[$16+4>>2]|0;HEAP32[((((9832) + 360|0)))+8>>2]=HEAP32[$16+8>>2]|0;HEAP32[((((9832) + 360|0)))+12>>2]=HEAP32[$16+12>>2]|0;HEAP32[((((9832) + 360|0)))+16>>2]=HEAP32[$16+16>>2]|0;HEAP32[((((9832) + 360|0)))+20>>2]=HEAP32[$16+20>>2]|0;HEAP32[((((9832) + 360|0)))+24>>2]=HEAP32[$16+24>>2]|0;
  HEAP8[(((9832) + 388|0))] = 7;
  HEAP8[(((9832) + 389|0))] = 0;
 }
 $17 = HEAP32[(((9832) + 376|0))>>2]|0;
 $textPtr = $17;
 $18 = HEAP32[(((9832) + 356|0))>>2]|0;
 $gamePtr = $18;
 $19 = (_getRandom()|0);
 $20 = (($19|0) % 2)&-1;
 $21 = ((3928) + ($20<<2)|0);
 $22 = HEAP32[$21>>2]|0;
 $mapPtr = $22;
 $i = 0;
 while(1) {
  $23 = $i;
  $24 = ($23>>>0)<(1500);
  if (!($24)) {
   break;
  }
  $25 = $mapPtr;
  $26 = HEAP8[$25]|0;
  $27 = $26 << 24 >> 24;
  switch ($27|0) {
  case 46:  {
   $79 = $textPtr;
   HEAP8[$79] = 46;
   $80 = $gamePtr;
   HEAP8[$80] = 0;
   break;
  }
  case 33:  {
   $67 = $1;
   $68 = $67 << 24 >> 24;
   $69 = ($68|0)!=(0);
   $70 = $69 ? 46 : 124;
   $71 = $70&255;
   $72 = $textPtr;
   HEAP8[$72] = $71;
   $73 = $1;
   $74 = $73 << 24 >> 24;
   $75 = ($74|0)!=(0);
   $76 = $75 ? 0 : 1;
   $77 = $76&255;
   $78 = $gamePtr;
   HEAP8[$78] = $77;
   break;
  }
  case 126:  {
   $55 = $1;
   $56 = $55 << 24 >> 24;
   $57 = ($56|0)!=(0);
   $58 = $57 ? 46 : 45;
   $59 = $58&255;
   $60 = $textPtr;
   HEAP8[$60] = $59;
   $61 = $1;
   $62 = $61 << 24 >> 24;
   $63 = ($62|0)!=(0);
   $64 = $63 ? 0 : 1;
   $65 = $64&255;
   $66 = $gamePtr;
   HEAP8[$66] = $65;
   break;
  }
  case 42:  {
   $46 = $textPtr;
   HEAP8[$46] = 42;
   $47 = $gamePtr;
   HEAP8[$47] = 7;
   $48 = ($6);
   $49 = $i;
   $50 = (($49>>>0) % 60)&-1;
   HEAP32[$48>>2] = $50;
   $51 = (($6) + 4|0);
   $52 = $i;
   $53 = (($52>>>0) / 60)&-1;
   HEAP32[$51>>2] = $53;
   $54 = $6;
   ;HEAP32[((((9832) + 408|0)))+0>>2]=HEAP32[$54+0>>2]|0;HEAP32[((((9832) + 408|0)))+4>>2]=HEAP32[$54+4>>2]|0;
   break;
  }
  case 69:  {
   $37 = $textPtr;
   HEAP8[$37] = 46;
   $38 = $gamePtr;
   HEAP8[$38] = 0;
   $39 = ($5);
   $40 = $i;
   $41 = (($40>>>0) % 60)&-1;
   HEAP32[$39>>2] = $41;
   $42 = (($5) + 4|0);
   $43 = $i;
   $44 = (($43>>>0) / 60)&-1;
   HEAP32[$42>>2] = $44;
   $45 = $5;
   ;HEAP32[((((9832) + 400|0)))+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[((((9832) + 400|0)))+4>>2]=HEAP32[$45+4>>2]|0;
   break;
  }
  case 80:  {
   $28 = $textPtr;
   HEAP8[$28] = 46;
   $29 = $gamePtr;
   HEAP8[$29] = 0;
   $30 = ($4);
   $31 = $i;
   $32 = (($31>>>0) % 60)&-1;
   HEAP32[$30>>2] = $32;
   $33 = (($4) + 4|0);
   $34 = $i;
   $35 = (($34>>>0) / 60)&-1;
   HEAP32[$33>>2] = $35;
   $36 = $4;
   ;HEAP32[((((9832) + 392|0)))+0>>2]=HEAP32[$36+0>>2]|0;HEAP32[((((9832) + 392|0)))+4>>2]=HEAP32[$36+4>>2]|0;
   break;
  }
  default: {
   $81 = $mapPtr;
   $82 = HEAP8[$81]|0;
   $83 = $textPtr;
   HEAP8[$83] = $82;
   $84 = $gamePtr;
   HEAP8[$84] = 1;
  }
  }
  $85 = $mapPtr;
  $86 = (($85) + 1|0);
  $mapPtr = $86;
  $87 = $textPtr;
  $88 = (($87) + 1|0);
  $textPtr = $88;
  $89 = $gamePtr;
  $90 = (($89) + 1|0);
  $gamePtr = $90;
  $91 = $i;
  $92 = (($91) + 1)|0;
  $i = $92;
 }
 STACKTOP = sp;return;
}
function _encyclopedia_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _encyclopedia_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _encyclopedia_render() {
 var $$byval_copy = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0;
 var $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0;
 var $61 = 0, $7 = 0, $8 = 0, $9 = 0, $bm = 0, $bm$byval_copy = 0, $buffer = 0, $len = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $$byval_copy3 = sp;
 $bm$byval_copy = sp + 16|0;
 $$byval_copy2 = sp + 48|0;
 $$byval_copy = sp + 56|0;
 $vararg_buffer = sp + 72|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $bm = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $1 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $4 = ($bm);
 $5 = ($4);
 $6 = ($5);
 HEAP32[$6>>2] = 0;
 $7 = (($5) + 4|0);
 HEAP32[$7>>2] = 0;
 $8 = (($4) + 8|0);
 $9 = ($8);
 HEAP32[$9>>2] = 40;
 $10 = (($8) + 4|0);
 HEAP32[$10>>2] = 20;
 $11 = (($bm) + 16|0);
 $12 = HEAP8[(((9832) + 218|0))]|0;
 $13 = $12&255;
 $14 = ((3936) + (($13*801)|0)|0);
 $15 = ($14);
 HEAP32[$11>>2] = $15;
 $16 = (($bm) + 20|0);
 HEAP8[$16] = 0;
 $17 = (($bm) + 21|0);
 HEAP8[$17] = 0;
 $18 = (($bm) + 24|0);
 HEAP32[$18>>2] = 40;
 $19 = HEAP32[((9832))>>2]|0;
 $20 = ($1);
 $21 = ($20);
 HEAP32[$21>>2] = 18;
 $22 = (($20) + 4|0);
 HEAP32[$22>>2] = 1;
 $23 = (($1) + 8|0);
 $24 = ($23);
 HEAP32[$24>>2] = 43;
 $25 = (($23) + 4|0);
 HEAP32[$25>>2] = 22;
 $26 = $$byval_copy;
 $27 = $$byval_copy;
 $28 = $1;
 ;HEAP32[$27+0>>2]=HEAP32[$28+0>>2]|0;HEAP32[$27+4>>2]=HEAP32[$28+4>>2]|0;HEAP32[$27+8>>2]=HEAP32[$28+8>>2]|0;HEAP32[$27+12>>2]=HEAP32[$28+12>>2]|0;
 _asciiDrawFilledRectangleColored($19,$$byval_copy,7,0);
 $29 = $$byval_copy;
 $30 = ($buffer);
 $31 = HEAP8[(((9832) + 218|0))]|0;
 $32 = $31&255;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $32;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = 5;
 $33 = (_sprintf(($30|0),((8744)|0),($vararg_buffer|0))|0);
 $34 = $33&255;
 $len = $34;
 $35 = HEAP32[((9832))>>2]|0;
 $36 = ($buffer);
 $37 = ($2);
 $38 = $len;
 $39 = $38&255;
 $40 = (($39|0) / 2)&-1;
 $41 = (40 - ($40))|0;
 HEAP32[$37>>2] = $41;
 $42 = (($2) + 4|0);
 HEAP32[$42>>2] = 1;
 $43 = $$byval_copy2;
 $44 = $$byval_copy2;
 $45 = $2;
 ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;
 _asciiDrawTextColored($35,$36,$$byval_copy2,7,0);
 $46 = $$byval_copy2;
 $47 = HEAP32[((9832))>>2]|0;
 $48 = ($3);
 $49 = ($48);
 HEAP32[$49>>2] = 20;
 $50 = (($48) + 4|0);
 HEAP32[$50>>2] = 2;
 $51 = (($3) + 8|0);
 $52 = ($51);
 HEAP32[$52>>2] = 0;
 $53 = (($51) + 4|0);
 HEAP32[$53>>2] = 0;
 $54 = $bm$byval_copy;
 $55 = $bm$byval_copy;
 $56 = $bm;
 ;HEAP32[$55+0>>2]=HEAP32[$56+0>>2]|0;HEAP32[$55+4>>2]=HEAP32[$56+4>>2]|0;HEAP32[$55+8>>2]=HEAP32[$56+8>>2]|0;HEAP32[$55+12>>2]=HEAP32[$56+12>>2]|0;HEAP32[$55+16>>2]=HEAP32[$56+16>>2]|0;HEAP32[$55+20>>2]=HEAP32[$56+20>>2]|0;HEAP32[$55+24>>2]=HEAP32[$56+24>>2]|0;
 $57 = $$byval_copy3;
 $58 = $$byval_copy3;
 $59 = $3;
 ;HEAP32[$58+0>>2]=HEAP32[$59+0>>2]|0;HEAP32[$58+4>>2]=HEAP32[$59+4>>2]|0;HEAP32[$58+8>>2]=HEAP32[$59+8>>2]|0;HEAP32[$58+12>>2]=HEAP32[$59+12>>2]|0;
 _asciiDrawBitmapColored($47,$bm$byval_copy,$$byval_copy3,7,0);
 $60 = $$byval_copy3;
 $61 = $bm$byval_copy;
 STACKTOP = sp;return;
}
function _encyclopedia_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 if ((($7|0) == 8) | (($7|0) == 5)) {
  $8 = HEAP8[(((9832) + 218|0))]|0;
  $9 = $8&255;
  $10 = ($9|0)==(0);
  if ($10) {
   HEAP8[(((9832) + 218|0))] = 5;
  } else {
   $11 = HEAP8[(((9832) + 218|0))]|0;
   $12 = (($11) + -1)<<24>>24;
   HEAP8[(((9832) + 218|0))] = $12;
  }
  HEAP8[(((9832) + 4|0))] = 1;
 } else if ((($7|0) == 7) | (($7|0) == 6)) {
  $13 = HEAP8[(((9832) + 218|0))]|0;
  $14 = $13&255;
  $15 = (($14) + 1)|0;
  $16 = (($15|0) % 6)&-1;
  $17 = $16&255;
  HEAP8[(((9832) + 218|0))] = $17;
  HEAP8[(((9832) + 4|0))] = 1;
 }
 STACKTOP = sp;return;
}
function _encyclopedia_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _encyclopedia_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _fightGameScreen_switchPlayerElementity($i) {
 $i = $i|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $i;
 $2 = $1;
 HEAP8[(((9832) + 416|0))] = $2;
 $3 = $1;
 $4 = $3&255;
 $5 = ((((9832) + 220|0)) + (($4*24)|0)|0);
 HEAP32[(((9832) + 424|0))>>2] = $5;
 $6 = $1;
 $7 = $6&255;
 $8 = ((((9832) + 220|0)) + (($7*24)|0)|0);
 $9 = (($8) + 6|0);
 $10 = HEAP8[$9]|0;
 $11 = $10&255;
 $12 = ((((9832) + 3488|0)) + ($11<<6)|0);
 HEAP32[(((9832) + 432|0))>>2] = $12;
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _fightGameScreen_switchEnemyElementity($i) {
 $i = $i|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $i;
 $2 = $1;
 HEAP8[(((9832) + 417|0))] = $2;
 $3 = HEAP32[(((9832) + 76|0))>>2]|0;
 $4 = (($3) + 12|0);
 $5 = ($4);
 $6 = $1;
 $7 = $6&255;
 $8 = (($5) + (($7*24)|0)|0);
 HEAP32[(((9832) + 428|0))>>2] = $8;
 $9 = $1;
 $10 = $9&255;
 $11 = HEAP32[(((9832) + 76|0))>>2]|0;
 $12 = (($11) + 12|0);
 $13 = (($12) + (($10*24)|0)|0);
 $14 = (($13) + 6|0);
 $15 = HEAP8[$14]|0;
 $16 = $15&255;
 $17 = ((((9832) + 3488|0)) + ($16<<6)|0);
 HEAP32[(((9832) + 436|0))>>2] = $17;
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _fightGameScreen_movePlayer($dir) {
 $dir = $dir|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $gameTile = 0, $newPos = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $newPos = sp + 8|0;
 $1 = $dir;
 $2 = $newPos;
 ;HEAP32[$2+0>>2]=HEAP32[((((9832) + 392|0)))+0>>2]|0;HEAP32[$2+4>>2]=HEAP32[((((9832) + 392|0)))+4>>2]|0;
 $3 = $1;
 $4 = $3&255;
 if ((($4|0) == 3)) {
  $14 = ($newPos);
  $15 = HEAP32[$14>>2]|0;
  $16 = (($15) + 1)|0;
  HEAP32[$14>>2] = $16;
 } else if ((($4|0) == 2)) {
  $11 = ($newPos);
  $12 = HEAP32[$11>>2]|0;
  $13 = (($12) + -1)|0;
  HEAP32[$11>>2] = $13;
 } else if ((($4|0) == 1)) {
  $8 = (($newPos) + 4|0);
  $9 = HEAP32[$8>>2]|0;
  $10 = (($9) + 1)|0;
  HEAP32[$8>>2] = $10;
 } else if ((($4|0) == 0)) {
  $5 = (($newPos) + 4|0);
  $6 = HEAP32[$5>>2]|0;
  $7 = (($6) + -1)|0;
  HEAP32[$5>>2] = $7;
 }
 $17 = $1;
 HEAP8[(((9832) + 217|0))] = $17;
 HEAP8[(((9832) + 4|0))] = 1;
 $18 = ($newPos);
 $19 = HEAP32[$18>>2]|0;
 $20 = (($newPos) + 4|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = (_fightGameScreen_getGameTile($19,$21)|0);
 $gameTile = $22;
 $23 = ($newPos);
 $24 = HEAP32[$23>>2]|0;
 $25 = HEAP32[(((9832) + 400|0))>>2]|0;
 $26 = ($24|0)!=($25|0);
 do {
  if (!($26)) {
   $27 = (($newPos) + 4|0);
   $28 = HEAP32[$27>>2]|0;
   $29 = HEAP32[(((9832) + 404|0))>>2]|0;
   $30 = ($28|0)!=($29|0);
   if ($30) {
    break;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $31 = $gameTile;
 $32 = $31&255;
 $33 = ($32|0)!=(1);
 if (!($33)) {
  STACKTOP = sp;return;
 }
 $34 = $newPos;
 ;HEAP32[((((9832) + 392|0)))+0>>2]=HEAP32[$34+0>>2]|0;HEAP32[((((9832) + 392|0)))+4>>2]=HEAP32[$34+4>>2]|0;
 STACKTOP = sp;return;
}
function _fightGameScreen_getGameTile($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = $x;
 $3 = $y;
 $4 = $2;
 $5 = ($4|0)<(0);
 do {
  if (!($5)) {
   $6 = $3;
   $7 = ($6|0)<(0);
   if ($7) {
    break;
   }
   $8 = $2;
   $9 = ($8|0)>=(60);
   if ($9) {
    break;
   }
   $10 = $3;
   $11 = ($10|0)>=(25);
   if ($11) {
    break;
   }
   $12 = $3;
   $13 = ($12*60)|0;
   $14 = $2;
   $15 = (($13) + ($14))|0;
   $16 = HEAP32[(((9832) + 356|0))>>2]|0;
   $17 = (($16) + ($15)|0);
   $18 = HEAP8[$17]|0;
   $1 = $18;
   $19 = $1;
   STACKTOP = sp;return ($19|0);
  }
 } while(0);
 $1 = 1;
 $19 = $1;
 STACKTOP = sp;return ($19|0);
}
function _fightGameScreen_moveEnemy() {
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0;
 var $96 = 0, $97 = 0, $98 = 0, $99 = 0, $diff = 0, $dists = 0, $gameTile = 0, $halfLife = 0, $i = 0, $newDir = 0, $newPos = 0, $noChange = 0, $playerPos = 0, $randomMovement = 0, $randomShooting = 0, $shootAxe = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104|0;
 $newPos = sp + 40|0;
 $diff = sp + 48|0;
 $playerPos = sp + 56|0;
 $dists = sp + 88|0;
 $randomMovement = 0;
 $randomShooting = 0;
 $noChange = 0;
 $1 = $newPos;
 ;HEAP32[$1+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$1+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
 $2 = $playerPos;
 ;HEAP32[$2+0>>2]=HEAP32[((((9832) + 392|0)))+0>>2]|0;HEAP32[$2+4>>2]=HEAP32[((((9832) + 392|0)))+4>>2]|0;
 $3 = HEAP32[(((9832) + 428|0))>>2]|0;
 $4 = (($3) + 7|0);
 $5 = HEAP8[$4]|0;
 $6 = $5&255;
 $7 = ($6|0)<(3);
 if ($7) {
  $randomMovement = 1;
  $randomShooting = 1;
  $noChange = 1;
 } else {
  $8 = HEAP32[(((9832) + 428|0))>>2]|0;
  $9 = (($8) + 7|0);
  $10 = HEAP8[$9]|0;
  $11 = $10&255;
  $12 = ($11|0)<(4);
  if ($12) {
   $randomMovement = 1;
  }
 }
 $13 = $randomMovement;
 $14 = ($13<<24>>24)!=(0);
 if ($14) {
  $15 = (_getRandom()|0);
  $16 = (($15|0) % 5)&-1;
  $17 = ($16|0)==(0);
  if ($17) {
   $18 = (_getRandom()|0);
   $19 = (($18|0) % 4)&-1;
   $20 = $19&255;
   HEAP8[(((9832) + 216|0))] = $20;
  }
  $21 = HEAP8[(((9832) + 216|0))]|0;
  $22 = $21&255;
  if ((($22|0) == 1)) {
   $26 = (($newPos) + 4|0);
   $27 = HEAP32[$26>>2]|0;
   $28 = (($27) + 1)|0;
   HEAP32[$26>>2] = $28;
  } else if ((($22|0) == 2)) {
   $29 = ($newPos);
   $30 = HEAP32[$29>>2]|0;
   $31 = (($30) + -1)|0;
   HEAP32[$29>>2] = $31;
  } else if ((($22|0) == 3)) {
   $32 = ($newPos);
   $33 = HEAP32[$32>>2]|0;
   $34 = (($33) + 1)|0;
   HEAP32[$32>>2] = $34;
  } else if ((($22|0) == 0)) {
   $23 = (($newPos) + 4|0);
   $24 = HEAP32[$23>>2]|0;
   $25 = (($24) + -1)|0;
   HEAP32[$23>>2] = $25;
  }
  $35 = ($newPos);
  $36 = HEAP32[$35>>2]|0;
  $37 = (($newPos) + 4|0);
  $38 = HEAP32[$37>>2]|0;
  $39 = (_fightGameScreen_getGameTile($36,$38)|0);
  $gameTile = $39;
  $40 = ($newPos);
  $41 = HEAP32[$40>>2]|0;
  $42 = HEAP32[(((9832) + 392|0))>>2]|0;
  $43 = ($41|0)!=($42|0);
  if ($43) {
   label = 16;
  } else {
   $44 = (($newPos) + 4|0);
   $45 = HEAP32[$44>>2]|0;
   $46 = HEAP32[(((9832) + 396|0))>>2]|0;
   $47 = ($45|0)!=($46|0);
   if ($47) {
    label = 16;
   } else {
    label = 18;
   }
  }
  do {
   if ((label|0) == 16) {
    $48 = $gameTile;
    $49 = $48&255;
    $50 = ($49|0)!=(1);
    if (!($50)) {
     label = 18;
     break;
    }
    $51 = $newPos;
    ;HEAP32[((((9832) + 400|0)))+0>>2]=HEAP32[$51+0>>2]|0;HEAP32[((((9832) + 400|0)))+4>>2]=HEAP32[$51+4>>2]|0;
   }
  } while(0);
  if ((label|0) == 18) {
   while(1) {
    $52 = (_getRandom()|0);
    $53 = (($52|0) % 4)&-1;
    $54 = $53&255;
    $newDir = $54;
    $55 = $newDir;
    $56 = $55&255;
    $57 = HEAP8[(((9832) + 216|0))]|0;
    $58 = $57&255;
    $59 = ($56|0)==($58|0);
    if (!($59)) {
     break;
    }
   }
  }
 } else {
  $60 = HEAP32[(((9832) + 428|0))>>2]|0;
  $61 = (($60) + 8|0);
  $62 = HEAP8[$61]|0;
  $63 = $62&255;
  $64 = $63<<1;
  $65 = HEAP32[(((9832) + 428|0))>>2]|0;
  $66 = ($65);
  $67 = (($66) + 5|0);
  $68 = HEAP8[$67]|0;
  $69 = $68&255;
  $70 = ($64|0)<($69|0);
  $71 = $70&1;
  $72 = $71&255;
  $halfLife = $72;
  $73 = (_getRandom()|0);
  $74 = (($73|0) % 10)&-1;
  $75 = ($74|0)==(0);
  if ($75) {
   $76 = $halfLife;
   $77 = ($76<<24>>24)!=(0);
   $78 = $77 ^ 1;
   $79 = $78&1;
   $80 = $79&255;
   $halfLife = $80;
  }
  $i = 0;
  while(1) {
   $81 = $i;
   $82 = $81&255;
   $83 = ($82|0)<(4);
   if (!($83)) {
    break;
   }
   $84 = $newPos;
   ;HEAP32[$84+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$84+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
   $85 = $i;
   $86 = $85&255;
   if ((($86|0) == 3)) {
    $96 = ($newPos);
    $97 = HEAP32[$96>>2]|0;
    $98 = (($97) + 1)|0;
    HEAP32[$96>>2] = $98;
   } else if ((($86|0) == 2)) {
    $93 = ($newPos);
    $94 = HEAP32[$93>>2]|0;
    $95 = (($94) + -1)|0;
    HEAP32[$93>>2] = $95;
   } else if ((($86|0) == 1)) {
    $90 = (($newPos) + 4|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = (($91) + 1)|0;
    HEAP32[$90>>2] = $92;
   } else if ((($86|0) == 0)) {
    $87 = (($newPos) + 4|0);
    $88 = HEAP32[$87>>2]|0;
    $89 = (($88) + -1)|0;
    HEAP32[$87>>2] = $89;
   }
   $99 = ($newPos);
   $100 = HEAP32[$99>>2]|0;
   $101 = ($playerPos);
   $102 = HEAP32[$101>>2]|0;
   $103 = (($100) - ($102))|0;
   $104 = ($diff);
   HEAP32[$104>>2] = $103;
   $105 = (($newPos) + 4|0);
   $106 = HEAP32[$105>>2]|0;
   $107 = (($playerPos) + 4|0);
   $108 = HEAP32[$107>>2]|0;
   $109 = (($106) - ($108))|0;
   $110 = (($diff) + 4|0);
   HEAP32[$110>>2] = $109;
   $111 = ($diff);
   $112 = HEAP32[$111>>2]|0;
   $113 = ($diff);
   $114 = HEAP32[$113>>2]|0;
   $115 = Math_imul($112, $114)|0;
   $116 = (($diff) + 4|0);
   $117 = HEAP32[$116>>2]|0;
   $118 = (($diff) + 4|0);
   $119 = HEAP32[$118>>2]|0;
   $120 = Math_imul($117, $119)|0;
   $121 = (($115) + ($120))|0;
   $122 = $i;
   $123 = $122&255;
   $124 = (($dists) + ($123<<2)|0);
   HEAP32[$124>>2] = $121;
   $125 = $i;
   $126 = (($125) + 1)<<24>>24;
   $i = $126;
  }
  HEAP8[(((9832) + 216|0))] = 0;
  $i = 1;
  while(1) {
   $127 = $i;
   $128 = $127&255;
   $129 = ($128|0)<(4);
   if (!($129)) {
    break;
   }
   $130 = $halfLife;
   $131 = $130 << 24 >> 24;
   $132 = ($131|0)!=(0);
   do {
    if ($132) {
     $133 = $i;
     $134 = $133&255;
     $135 = (($dists) + ($134<<2)|0);
     $136 = HEAP32[$135>>2]|0;
     $137 = HEAP8[(((9832) + 216|0))]|0;
     $138 = $137&255;
     $139 = (($dists) + ($138<<2)|0);
     $140 = HEAP32[$139>>2]|0;
     $141 = ($136>>>0)>($140>>>0);
     if (!($141)) {
      break;
     }
     $142 = $i;
     $143 = $142&255;
     $144 = (($dists) + ($143<<2)|0);
     $145 = HEAP32[$144>>2]|0;
     $146 = ($145>>>0)>=(36);
     if (!($146)) {
      break;
     }
     $147 = $i;
     HEAP8[(((9832) + 216|0))] = $147;
    }
   } while(0);
   $148 = $halfLife;
   $149 = ($148<<24>>24)!=(0);
   do {
    if (!($149)) {
     $150 = $i;
     $151 = $150&255;
     $152 = (($dists) + ($151<<2)|0);
     $153 = HEAP32[$152>>2]|0;
     $154 = HEAP8[(((9832) + 216|0))]|0;
     $155 = $154&255;
     $156 = (($dists) + ($155<<2)|0);
     $157 = HEAP32[$156>>2]|0;
     $158 = ($153>>>0)<($157>>>0);
     if (!($158)) {
      break;
     }
     $159 = $i;
     $160 = $159&255;
     $161 = (($dists) + ($160<<2)|0);
     $162 = HEAP32[$161>>2]|0;
     $163 = ($162>>>0)>=(36);
     if (!($163)) {
      break;
     }
     $164 = $i;
     HEAP8[(((9832) + 216|0))] = $164;
    }
   } while(0);
   $165 = $i;
   $166 = (($165) + 1)<<24>>24;
   $i = $166;
  }
  $167 = $newPos;
  ;HEAP32[$167+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$167+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
  $168 = HEAP8[(((9832) + 216|0))]|0;
  $169 = $168&255;
  if ((($169|0) == 3)) {
   $179 = ($newPos);
   $180 = HEAP32[$179>>2]|0;
   $181 = (($180) + 1)|0;
   HEAP32[$179>>2] = $181;
  } else if ((($169|0) == 2)) {
   $176 = ($newPos);
   $177 = HEAP32[$176>>2]|0;
   $178 = (($177) + -1)|0;
   HEAP32[$176>>2] = $178;
  } else if ((($169|0) == 1)) {
   $173 = (($newPos) + 4|0);
   $174 = HEAP32[$173>>2]|0;
   $175 = (($174) + 1)|0;
   HEAP32[$173>>2] = $175;
  } else if ((($169|0) == 0)) {
   $170 = (($newPos) + 4|0);
   $171 = HEAP32[$170>>2]|0;
   $172 = (($171) + -1)|0;
   HEAP32[$170>>2] = $172;
  }
  $182 = ($newPos);
  $183 = HEAP32[$182>>2]|0;
  $184 = (($newPos) + 4|0);
  $185 = HEAP32[$184>>2]|0;
  $186 = (_fightGameScreen_getGameTile($183,$185)|0);
  $gameTile = $186;
  $187 = ($newPos);
  $188 = HEAP32[$187>>2]|0;
  $189 = HEAP32[(((9832) + 392|0))>>2]|0;
  $190 = ($188|0)!=($189|0);
  if ($190) {
   label = 53;
  } else {
   $191 = (($newPos) + 4|0);
   $192 = HEAP32[$191>>2]|0;
   $193 = HEAP32[(((9832) + 396|0))>>2]|0;
   $194 = ($192|0)!=($193|0);
   if ($194) {
    label = 53;
   } else {
    label = 55;
   }
  }
  do {
   if ((label|0) == 53) {
    $195 = $gameTile;
    $196 = $195&255;
    $197 = ($196|0)!=(1);
    if (!($197)) {
     label = 55;
     break;
    }
    $198 = $newPos;
    ;HEAP32[((((9832) + 400|0)))+0>>2]=HEAP32[$198+0>>2]|0;HEAP32[((((9832) + 400|0)))+4>>2]=HEAP32[$198+4>>2]|0;
   }
  } while(0);
  if ((label|0) == 55) {
   $199 = (_getRandom()|0);
   $200 = (($199|0) % 4)&-1;
   $201 = $200&255;
   HEAP8[(((9832) + 216|0))] = $201;
   $202 = $newPos;
   ;HEAP32[$202+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$202+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
   $203 = HEAP8[(((9832) + 216|0))]|0;
   $204 = $203&255;
   if ((($204|0) == 3)) {
    $214 = ($newPos);
    $215 = HEAP32[$214>>2]|0;
    $216 = (($215) + 1)|0;
    HEAP32[$214>>2] = $216;
   } else if ((($204|0) == 2)) {
    $211 = ($newPos);
    $212 = HEAP32[$211>>2]|0;
    $213 = (($212) + -1)|0;
    HEAP32[$211>>2] = $213;
   } else if ((($204|0) == 1)) {
    $208 = (($newPos) + 4|0);
    $209 = HEAP32[$208>>2]|0;
    $210 = (($209) + 1)|0;
    HEAP32[$208>>2] = $210;
   } else if ((($204|0) == 0)) {
    $205 = (($newPos) + 4|0);
    $206 = HEAP32[$205>>2]|0;
    $207 = (($206) + -1)|0;
    HEAP32[$205>>2] = $207;
   }
   $217 = ($newPos);
   $218 = HEAP32[$217>>2]|0;
   $219 = (($newPos) + 4|0);
   $220 = HEAP32[$219>>2]|0;
   $221 = (_fightGameScreen_getGameTile($218,$220)|0);
   $gameTile = $221;
   $222 = ($newPos);
   $223 = HEAP32[$222>>2]|0;
   $224 = HEAP32[(((9832) + 392|0))>>2]|0;
   $225 = ($223|0)!=($224|0);
   if ($225) {
    label = 62;
   } else {
    $226 = (($newPos) + 4|0);
    $227 = HEAP32[$226>>2]|0;
    $228 = HEAP32[(((9832) + 396|0))>>2]|0;
    $229 = ($227|0)!=($228|0);
    if ($229) {
     label = 62;
    }
   }
   do {
    if ((label|0) == 62) {
     $230 = $gameTile;
     $231 = $230&255;
     $232 = ($231|0)!=(1);
     if (!($232)) {
      break;
     }
     $233 = $newPos;
     ;HEAP32[((((9832) + 400|0)))+0>>2]=HEAP32[$233+0>>2]|0;HEAP32[((((9832) + 400|0)))+4>>2]=HEAP32[$233+4>>2]|0;
    }
   } while(0);
  }
 }
 $234 = $randomShooting;
 $235 = ($234<<24>>24)!=(0);
 if ($235) {
  $236 = (_getRandom()|0);
  $237 = (($236|0) % 4)&-1;
  $238 = ($237|0)==(0);
  if ($238) {
   $239 = (_getRandom()|0);
   $240 = (($239|0) % 4)&-1;
   $241 = $240&255;
   HEAP8[(((9832) + 419|0))] = $241;
  }
  $242 = (_getRandom()|0);
  $243 = (($242|0) % 4)&-1;
  $244 = ($243|0)==(0);
  if ($244) {
   $245 = HEAP8[(((9832) + 422|0))]|0;
   $246 = ($245<<24>>24)!=(0);
   $247 = $246 ^ 1;
   $248 = $247&1;
   $249 = $248&255;
   HEAP8[(((9832) + 422|0))] = $249;
  }
 } else {
  HEAP8[(((9832) + 422|0))] = 1;
  $250 = $newPos;
  ;HEAP32[$250+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$250+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
  $251 = ($newPos);
  $252 = HEAP32[$251>>2]|0;
  $253 = ($playerPos);
  $254 = HEAP32[$253>>2]|0;
  $255 = (($252) - ($254))|0;
  $256 = ($diff);
  HEAP32[$256>>2] = $255;
  $257 = (($newPos) + 4|0);
  $258 = HEAP32[$257>>2]|0;
  $259 = (($playerPos) + 4|0);
  $260 = HEAP32[$259>>2]|0;
  $261 = (($258) - ($260))|0;
  $262 = (($diff) + 4|0);
  HEAP32[$262>>2] = $261;
  $263 = ($diff);
  $264 = HEAP32[$263>>2]|0;
  $265 = ($diff);
  $266 = HEAP32[$265>>2]|0;
  $267 = Math_imul($264, $266)|0;
  $268 = (($diff) + 4|0);
  $269 = HEAP32[$268>>2]|0;
  $270 = (($diff) + 4|0);
  $271 = HEAP32[$270>>2]|0;
  $272 = Math_imul($269, $271)|0;
  $273 = ($267|0)<($272|0);
  $274 = $273&1;
  $275 = $274&255;
  $shootAxe = $275;
  $276 = $shootAxe;
  $277 = ($276<<24>>24)!=(0);
  if ($277) {
   $278 = (($newPos) + 4|0);
   $279 = HEAP32[$278>>2]|0;
   $280 = (($playerPos) + 4|0);
   $281 = HEAP32[$280>>2]|0;
   $282 = ($279|0)<($281|0);
   $283 = $282 ? 1 : 0;
   $284 = $283&255;
   HEAP8[(((9832) + 419|0))] = $284;
  } else {
   $285 = ($newPos);
   $286 = HEAP32[$285>>2]|0;
   $287 = ($playerPos);
   $288 = HEAP32[$287>>2]|0;
   $289 = ($286|0)<($288|0);
   $290 = $289 ? 3 : 2;
   $291 = $290&255;
   HEAP8[(((9832) + 419|0))] = $291;
  }
 }
 $292 = $noChange;
 $293 = ($292<<24>>24)!=(0);
 if ($293) {
  HEAP8[(((9832) + 4|0))] = 1;
  STACKTOP = sp;return;
 }
 $294 = HEAP32[(((9832) + 428|0))>>2]|0;
 $295 = (($294) + 8|0);
 $296 = HEAP8[$295]|0;
 $297 = $296&255;
 $298 = ($297*3)|0;
 $299 = HEAP32[(((9832) + 428|0))>>2]|0;
 $300 = ($299);
 $301 = (($300) + 5|0);
 $302 = HEAP8[$301]|0;
 $303 = $302&255;
 $304 = ($298|0)<($303|0);
 if (!($304)) {
  HEAP8[(((9832) + 4|0))] = 1;
  STACKTOP = sp;return;
 }
 $305 = (_getRandom()|0);
 $306 = (($305|0) % 30)&-1;
 $307 = ($306|0)==(0);
 if (!($307)) {
  HEAP8[(((9832) + 4|0))] = 1;
  STACKTOP = sp;return;
 }
 $308 = HEAP32[(((9832) + 56|0))>>2]|0;
 HEAP32[(((9832) + 456|0))>>2] = $308;
 while(1) {
  $309 = (_getRandom()|0);
  $310 = HEAP32[(((9832) + 76|0))>>2]|0;
  $311 = (($310) + 132|0);
  $312 = HEAP8[$311]|0;
  $313 = $312&255;
  $314 = (($309|0) % ($313|0))&-1;
  $315 = $314&255;
  HEAP8[(((9832) + 1257|0))] = $315;
  $316 = HEAP8[(((9832) + 1257|0))]|0;
  $317 = $316&255;
  $318 = HEAP32[(((9832) + 76|0))>>2]|0;
  $319 = (($318) + 12|0);
  $320 = (($319) + (($317*24)|0)|0);
  $321 = (($320) + 8|0);
  $322 = HEAP8[$321]|0;
  $323 = $322&255;
  $324 = ($323|0)==(0);
  if (!($324)) {
   break;
  }
 }
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _fightGameScreen_spawnProjectile($isPlayer) {
 $isPlayer = $isPlayer|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $p = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $p = sp + 8|0;
 $1 = $isPlayer;
 $2 = HEAP8[(((9832) + 1256|0))]|0;
 $3 = $2&255;
 $4 = ($3|0)==(32);
 if ($4) {
  _fightGameScreen_destroyProjectile(0);
 }
 $5 = $1;
 $6 = ($p);
 HEAP8[$6] = $5;
 $7 = $1;
 $8 = $7 << 24 >> 24;
 $9 = ($8|0)!=(0);
 if ($9) {
  $10 = HEAP8[(((9832) + 418|0))]|0;
  $11 = $10&255;
  $14 = $11;
 } else {
  $12 = HEAP8[(((9832) + 419|0))]|0;
  $13 = $12&255;
  $14 = $13;
 }
 $15 = $14&255;
 $16 = (($p) + 12|0);
 HEAP8[$16] = $15;
 $17 = $1;
 $18 = $17 << 24 >> 24;
 $19 = ($18|0)!=(0);
 if ($19) {
  $20 = HEAP32[(((9832) + 424|0))>>2]|0;
  $22 = $20;
 } else {
  $21 = HEAP32[(((9832) + 428|0))>>2]|0;
  $22 = $21;
 }
 $23 = (($p) + 20|0);
 HEAP32[$23>>2] = $22;
 $24 = (($p) + 4|0);
 $25 = $1;
 $26 = $25 << 24 >> 24;
 $27 = ($26|0)!=(0);
 if ($27) {
  $28 = $24;
  ;HEAP32[$28+0>>2]=HEAP32[((((9832) + 392|0)))+0>>2]|0;HEAP32[$28+4>>2]=HEAP32[((((9832) + 392|0)))+4>>2]|0;
 } else {
  $29 = $24;
  ;HEAP32[$29+0>>2]=HEAP32[((((9832) + 400|0)))+0>>2]|0;HEAP32[$29+4>>2]=HEAP32[((((9832) + 400|0)))+4>>2]|0;
 }
 $30 = HEAP32[(((9832) + 56|0))>>2]|0;
 $31 = (($p) + 16|0);
 HEAP32[$31>>2] = $30;
 $32 = HEAP8[(((9832) + 1256|0))]|0;
 $33 = (($32) + 1)<<24>>24;
 HEAP8[(((9832) + 1256|0))] = $33;
 $34 = $32&255;
 $35 = ((((9832) + 488|0)) + (($34*24)|0)|0);
 $36 = $35;
 $37 = $p;
 ;HEAP32[$36+0>>2]=HEAP32[$37+0>>2]|0;HEAP32[$36+4>>2]=HEAP32[$37+4>>2]|0;HEAP32[$36+8>>2]=HEAP32[$37+8>>2]|0;HEAP32[$36+12>>2]=HEAP32[$37+12>>2]|0;HEAP32[$36+16>>2]=HEAP32[$37+16>>2]|0;HEAP32[$36+20>>2]=HEAP32[$37+20>>2]|0;
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _fightGameScreen_destroyProjectile($id) {
 $id = $id|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $id;
 $2 = $1;
 $3 = $2&255;
 $4 = (($3) + 1)|0;
 $5 = HEAP8[(((9832) + 1256|0))]|0;
 $6 = $5&255;
 $7 = ($4|0)!=($6|0);
 if ($7) {
  $8 = $1;
  $9 = $8&255;
  $10 = ((((9832) + 488|0)) + (($9*24)|0)|0);
  $11 = $10;
  $12 = $1;
  $13 = $12&255;
  $14 = ((((9832) + 488|0)) + (($13*24)|0)|0);
  $15 = (($14) + 24|0);
  $16 = $15;
  $17 = HEAP8[(((9832) + 1256|0))]|0;
  $18 = $17&255;
  $19 = ($18*24)|0;
  $20 = $1;
  $21 = $20&255;
  $22 = (($19) - ($21))|0;
  $23 = (($22) - 1)|0;
  _memmove(($11|0),($16|0),($23|0))|0;
 }
 $24 = HEAP8[(((9832) + 1256|0))]|0;
 $25 = (($24) + -1)<<24>>24;
 HEAP8[(((9832) + 1256|0))] = $25;
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _fightGameScreen_init() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $i = 0;
 while(1) {
  $1 = $i;
  $2 = $1&255;
  $3 = ($2|0)<(5);
  if (!($3)) {
   break;
  }
  $4 = $i;
  $5 = $4&255;
  $6 = ((((9832) + 464|0)) + ($5<<2)|0);
  HEAP32[$6>>2] = 0;
  $7 = $i;
  $8 = (($7) + 1)<<24>>24;
  $i = $8;
 }
 HEAP32[(((9832) + 484|0))>>2] = 0;
 HEAP32[(((9832) + 56|0))>>2] = 0;
 HEAP8[(((9832) + 217|0))] = 0;
 HEAP8[(((9832) + 1256|0))] = 0;
 HEAP32[(((9832) + 452|0))>>2] = 0;
 HEAP32[(((9832) + 444|0))>>2] = 1;
 HEAP32[(((9832) + 456|0))>>2] = 0;
 HEAP8[(((9832) + 1257|0))] = 5;
 HEAP32[(((9832) + 448|0))>>2] = 0;
 HEAP32[(((9832) + 440|0))>>2] = 0;
 HEAP32[(((9832) + 460|0))>>2] = 0;
 HEAP8[(((9832) + 1258|0))] = 5;
 HEAP8[(((9832) + 420|0))] = 1;
 HEAP32[(((9832) + 1264|0))>>2] = 0;
 HEAP32[(((9832) + 1260|0))>>2] = 0;
 $9 = HEAP32[(((9832) + 76|0))>>2]|0;
 $10 = ($9|0)==((((9832) + 80|0))|0);
 $11 = $10&1;
 $12 = $11&255;
 _loadRandomArena($12);
 _fightGameScreen_switchPlayerElementity(0);
 _fightGameScreen_switchEnemyElementity(0);
 STACKTOP = sp;return;
}
function _fightGameScreen_update() {
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0;
 var $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0;
 var $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0;
 var $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0;
 var $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0;
 var $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0;
 var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0;
 var $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0;
 var $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0;
 var $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $enemyAttackTicks = 0, $expGain = 0, $fightLostScreen$byval_copy = 0, $fightWonScreen$byval_copy = 0, $gameTile = 0, $i = 0, $j = 0, $p = 0, $playerAttackTicks = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 104|0;
 $fightWonScreen$byval_copy = sp;
 $fightLostScreen$byval_copy = sp + 24|0;
 $1 = HEAP32[(((9832) + 424|0))>>2]|0;
 $2 = ($1);
 $3 = (($2) + 2|0);
 $4 = HEAP8[$3]|0;
 $5 = $4&255;
 $playerAttackTicks = $5;
 $6 = HEAP32[(((9832) + 428|0))>>2]|0;
 $7 = ($6);
 $8 = (($7) + 2|0);
 $9 = HEAP8[$8]|0;
 $10 = $9&255;
 $enemyAttackTicks = $10;
 $11 = $playerAttackTicks;
 $12 = $playerAttackTicks;
 $13 = Math_imul($11, $12)|0;
 $14 = (($13>>>0) / 2)&-1;
 $15 = (80 - ($14))|0;
 $16 = (1)>($15>>>0);
 if ($16) {
  $22 = 1;
 } else {
  $17 = $playerAttackTicks;
  $18 = $playerAttackTicks;
  $19 = Math_imul($17, $18)|0;
  $20 = (($19>>>0) / 2)&-1;
  $21 = (80 - ($20))|0;
  $22 = $21;
 }
 $playerAttackTicks = $22;
 $23 = $enemyAttackTicks;
 $24 = $enemyAttackTicks;
 $25 = Math_imul($23, $24)|0;
 $26 = (($25>>>0) / 2)&-1;
 $27 = (80 - ($26))|0;
 $28 = (1)>($27>>>0);
 if ($28) {
  $34 = 1;
 } else {
  $29 = $enemyAttackTicks;
  $30 = $enemyAttackTicks;
  $31 = Math_imul($29, $30)|0;
  $32 = (($31>>>0) / 2)&-1;
  $33 = (80 - ($32))|0;
  $34 = $33;
 }
 $enemyAttackTicks = $34;
 $35 = HEAP32[(((9832) + 440|0))>>2]|0;
 $36 = ($35|0)!=(0);
 do {
  if ($36) {
   $37 = HEAP32[(((9832) + 56|0))>>2]|0;
   $38 = HEAP32[(((9832) + 440|0))>>2]|0;
   $39 = (($37) - ($38))|0;
   $40 = HEAP32[(((9832) + 424|0))>>2]|0;
   $41 = ($40);
   $42 = (($41) + 4|0);
   $43 = HEAP8[$42]|0;
   $44 = $43&255;
   $45 = (7 - ($44))|0;
   $46 = ($39>>>0)>($45>>>0);
   if (!($46)) {
    break;
   }
   $47 = HEAP8[(((9832) + 217|0))]|0;
   _fightGameScreen_movePlayer($47);
   $48 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 440|0))>>2] = $48;
  }
 } while(0);
 $49 = HEAP32[(((9832) + 56|0))>>2]|0;
 $50 = HEAP32[(((9832) + 444|0))>>2]|0;
 $51 = (($49) - ($50))|0;
 $52 = HEAP32[(((9832) + 428|0))>>2]|0;
 $53 = ($52);
 $54 = (($53) + 4|0);
 $55 = HEAP8[$54]|0;
 $56 = $55&255;
 $57 = (7 - ($56))|0;
 $58 = ($51>>>0)>($57>>>0);
 if ($58) {
  _fightGameScreen_moveEnemy();
  $59 = HEAP32[(((9832) + 56|0))>>2]|0;
  HEAP32[(((9832) + 444|0))>>2] = $59;
 }
 $60 = HEAP8[(((9832) + 421|0))]|0;
 $61 = $60 << 24 >> 24;
 $62 = ($61|0)!=(0);
 do {
  if ($62) {
   $63 = HEAP32[(((9832) + 56|0))>>2]|0;
   $64 = HEAP32[(((9832) + 448|0))>>2]|0;
   $65 = (($63) - ($64))|0;
   $66 = $playerAttackTicks;
   $67 = ($65>>>0)>($66>>>0);
   if (!($67)) {
    break;
   }
   $68 = HEAP32[(((9832) + 424|0))>>2]|0;
   $69 = (($68) + 8|0);
   $70 = HEAP8[$69]|0;
   $71 = $70&255;
   $72 = ($71|0)>(0);
   if (!($72)) {
    break;
   }
   $73 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 448|0))>>2] = $73;
   _fightGameScreen_spawnProjectile(1);
  }
 } while(0);
 $74 = HEAP8[(((9832) + 422|0))]|0;
 $75 = $74 << 24 >> 24;
 $76 = ($75|0)!=(0);
 do {
  if ($76) {
   $77 = HEAP32[(((9832) + 56|0))>>2]|0;
   $78 = HEAP32[(((9832) + 452|0))>>2]|0;
   $79 = (($77) - ($78))|0;
   $80 = $enemyAttackTicks;
   $81 = ($79>>>0)>($80>>>0);
   if (!($81)) {
    break;
   }
   $82 = HEAP32[(((9832) + 428|0))>>2]|0;
   $83 = (($82) + 8|0);
   $84 = HEAP8[$83]|0;
   $85 = $84&255;
   $86 = ($85|0)>(0);
   if (!($86)) {
    break;
   }
   $87 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 452|0))>>2] = $87;
   _fightGameScreen_spawnProjectile(0);
  }
 } while(0);
 $88 = HEAP8[(((9832) + 1258|0))]|0;
 $89 = $88&255;
 $90 = ($89|0)!=(5);
 do {
  if ($90) {
   $91 = HEAP32[(((9832) + 56|0))>>2]|0;
   $92 = HEAP32[(((9832) + 460|0))>>2]|0;
   $93 = (($91) - ($92))|0;
   $94 = ($93>>>0)>(50);
   if (!($94)) {
    break;
   }
   $95 = HEAP8[(((9832) + 1258|0))]|0;
   $96 = $95&255;
   $97 = ($96|0)!=(6);
   if ($97) {
    $98 = HEAP8[(((9832) + 1258|0))]|0;
    _fightGameScreen_switchPlayerElementity($98);
   } else {
    $99 = $fightLostScreen$byval_copy;
    $100 = $fightLostScreen$byval_copy;
    $101 = (9616);
    ;HEAP32[$100+0>>2]=HEAP32[$101+0>>2]|0;HEAP32[$100+4>>2]=HEAP32[$101+4>>2]|0;HEAP32[$100+8>>2]=HEAP32[$101+8>>2]|0;HEAP32[$100+12>>2]=HEAP32[$101+12>>2]|0;HEAP32[$100+16>>2]=HEAP32[$101+16>>2]|0;HEAP32[$100+20>>2]=HEAP32[$101+20>>2]|0;
    _switchToScreen($fightLostScreen$byval_copy);
    $102 = $fightLostScreen$byval_copy;
   }
   HEAP8[(((9832) + 1258|0))] = 5;
   HEAP32[(((9832) + 460|0))>>2] = 0;
  }
 } while(0);
 $103 = HEAP8[(((9832) + 1257|0))]|0;
 $104 = $103&255;
 $105 = ($104|0)!=(5);
 do {
  if ($105) {
   $106 = HEAP32[(((9832) + 56|0))>>2]|0;
   $107 = HEAP32[(((9832) + 456|0))>>2]|0;
   $108 = (($106) - ($107))|0;
   $109 = ($108>>>0)>(50);
   if (!($109)) {
    break;
   }
   $110 = HEAP8[(((9832) + 1257|0))]|0;
   $111 = $110&255;
   $112 = ($111|0)!=(6);
   if ($112) {
    $113 = HEAP8[(((9832) + 1257|0))]|0;
    _fightGameScreen_switchEnemyElementity($113);
   } else {
    $114 = $fightWonScreen$byval_copy;
    $115 = $fightWonScreen$byval_copy;
    $116 = (9808);
    ;HEAP32[$115+0>>2]=HEAP32[$116+0>>2]|0;HEAP32[$115+4>>2]=HEAP32[$116+4>>2]|0;HEAP32[$115+8>>2]=HEAP32[$116+8>>2]|0;HEAP32[$115+12>>2]=HEAP32[$116+12>>2]|0;HEAP32[$115+16>>2]=HEAP32[$116+16>>2]|0;HEAP32[$115+20>>2]=HEAP32[$116+20>>2]|0;
    _switchToScreen($fightWonScreen$byval_copy);
    $117 = $fightWonScreen$byval_copy;
   }
   HEAP8[(((9832) + 1257|0))] = 5;
   HEAP32[(((9832) + 456|0))>>2] = 0;
  }
 } while(0);
 $i = 0;
 while(1) {
  $118 = $i;
  $119 = $118&255;
  $120 = HEAP8[(((9832) + 1256|0))]|0;
  $121 = $120&255;
  $122 = ($119|0)<($121|0);
  if (!($122)) {
   break;
  }
  $123 = $i;
  $124 = $123&255;
  $125 = ((((9832) + 488|0)) + (($124*24)|0)|0);
  $p = $125;
  $126 = HEAP32[(((9832) + 56|0))>>2]|0;
  $127 = $p;
  $128 = (($127) + 16|0);
  $129 = HEAP32[$128>>2]|0;
  $130 = (($126) - ($129))|0;
  $131 = ($130>>>0)>(1);
  if ($131) {
   $132 = HEAP32[(((9832) + 56|0))>>2]|0;
   $133 = $p;
   $134 = (($133) + 16|0);
   HEAP32[$134>>2] = $132;
   $135 = $p;
   $136 = (($135) + 12|0);
   $137 = HEAP8[$136]|0;
   $138 = $137&255;
   if ((($138|0) == 0)) {
    $139 = $p;
    $140 = (($139) + 4|0);
    $141 = (($140) + 4|0);
    $142 = HEAP32[$141>>2]|0;
    $143 = (($142) + -1)|0;
    HEAP32[$141>>2] = $143;
   } else if ((($138|0) == 1)) {
    $144 = $p;
    $145 = (($144) + 4|0);
    $146 = (($145) + 4|0);
    $147 = HEAP32[$146>>2]|0;
    $148 = (($147) + 1)|0;
    HEAP32[$146>>2] = $148;
   } else if ((($138|0) == 2)) {
    $149 = $p;
    $150 = (($149) + 4|0);
    $151 = ($150);
    $152 = HEAP32[$151>>2]|0;
    $153 = (($152) + -1)|0;
    HEAP32[$151>>2] = $153;
   } else if ((($138|0) == 3)) {
    $154 = $p;
    $155 = (($154) + 4|0);
    $156 = ($155);
    $157 = HEAP32[$156>>2]|0;
    $158 = (($157) + 1)|0;
    HEAP32[$156>>2] = $158;
   }
   HEAP8[(((9832) + 4|0))] = 1;
   $159 = $p;
   $160 = ($159);
   $161 = HEAP8[$160]|0;
   $162 = $161 << 24 >> 24;
   $163 = ($162|0)!=(0);
   do {
    if ($163) {
     $164 = $p;
     $165 = (($164) + 4|0);
     $166 = ($165);
     $167 = HEAP32[$166>>2]|0;
     $168 = HEAP32[(((9832) + 400|0))>>2]|0;
     $169 = ($167|0)==($168|0);
     if (!($169)) {
      label = 54;
      break;
     }
     $170 = $p;
     $171 = (($170) + 4|0);
     $172 = (($171) + 4|0);
     $173 = HEAP32[$172>>2]|0;
     $174 = HEAP32[(((9832) + 404|0))>>2]|0;
     $175 = ($173|0)==($174|0);
     if (!($175)) {
      label = 54;
      break;
     }
     $176 = $p;
     $177 = (($176) + 20|0);
     $178 = HEAP32[$177>>2]|0;
     $179 = HEAP32[(((9832) + 428|0))>>2]|0;
     _damageElementity($178,$179);
     $180 = HEAP32[(((9832) + 432|0))>>2]|0;
     $181 = (($180) + 10|0);
     $182 = HEAP8[$181]|0;
     $183 = HEAP32[(((9832) + 436|0))>>2]|0;
     $184 = (($183) + 10|0);
     $185 = HEAP8[$184]|0;
     $186 = (_getEffect($182,$185)|0);
     HEAP8[(((9832) + 420|0))] = $186;
     $187 = HEAP32[(((9832) + 428|0))>>2]|0;
     $188 = (($187) + 8|0);
     $189 = HEAP8[$188]|0;
     $190 = $189&255;
     $191 = ($190|0)==(0);
     if ($191) {
      $192 = $p;
      $193 = (($192) + 20|0);
      $194 = HEAP32[$193>>2]|0;
      $195 = (($194) + 6|0);
      $196 = HEAP8[$195]|0;
      $197 = $196&255;
      $198 = ((((9832) + 3488|0)) + ($197<<6)|0);
      $199 = ($198);
      $200 = ($199);
      HEAP32[(((9832) + 1260|0))>>2] = $200;
      $201 = HEAP32[(((9832) + 436|0))>>2]|0;
      $202 = ($201);
      $203 = ($202);
      HEAP32[(((9832) + 1264|0))>>2] = $203;
      HEAP8[(((9832) + 1268|0))] = 1;
      $204 = HEAP32[(((9832) + 436|0))>>2]|0;
      $205 = HEAP32[(((9832) + 428|0))>>2]|0;
      $206 = (($205) + 7|0);
      $207 = HEAP8[$206]|0;
      $208 = (_getKillExperience($204,$207)|0);
      $expGain = $208;
      $209 = $expGain;
      $210 = HEAP8[(((9832) + 416|0))]|0;
      $211 = $210&255;
      $212 = ((((9832) + 464|0)) + ($211<<2)|0);
      $213 = HEAP32[$212>>2]|0;
      $214 = (($213) + ($209))|0;
      HEAP32[$212>>2] = $214;
      $215 = $expGain;
      $216 = HEAP32[(((9832) + 484|0))>>2]|0;
      $217 = (($216) + ($215))|0;
      HEAP32[(((9832) + 484|0))>>2] = $217;
      $218 = $expGain;
      $219 = HEAP32[(((9832) + 344|0))>>2]|0;
      $220 = (($219) + ($218))|0;
      HEAP32[(((9832) + 344|0))>>2] = $220;
      $j = 0;
      while(1) {
       $221 = $j;
       $222 = $221&255;
       $223 = HEAP32[(((9832) + 76|0))>>2]|0;
       $224 = (($223) + 132|0);
       $225 = HEAP8[$224]|0;
       $226 = $225&255;
       $227 = ($222|0)<($226|0);
       if (!($227)) {
        break;
       }
       $228 = $j;
       $229 = $228&255;
       $230 = HEAP32[(((9832) + 76|0))>>2]|0;
       $231 = (($230) + 12|0);
       $232 = (($231) + (($229*24)|0)|0);
       $233 = (($232) + 8|0);
       $234 = HEAP8[$233]|0;
       $235 = $234&255;
       $236 = ($235|0)>(0);
       if ($236) {
        label = 47;
        break;
       }
       $238 = $j;
       $239 = (($238) + 1)<<24>>24;
       $j = $239;
      }
      if ((label|0) == 47) {
       label = 0;
       $237 = $j;
       HEAP8[(((9832) + 1257|0))] = $237;
      }
      $240 = $j;
      $241 = $240&255;
      $242 = HEAP32[(((9832) + 76|0))>>2]|0;
      $243 = (($242) + 132|0);
      $244 = HEAP8[$243]|0;
      $245 = $244&255;
      $246 = ($241|0)>=($245|0);
      if ($246) {
       HEAP8[(((9832) + 1257|0))] = 6;
      }
      $247 = HEAP32[(((9832) + 56|0))>>2]|0;
      HEAP32[(((9832) + 456|0))>>2] = $247;
     }
     $248 = $i;
     $249 = (($248) + -1)<<24>>24;
     $i = $249;
     _fightGameScreen_destroyProjectile($248);
    } else {
     label = 54;
    }
   } while(0);
   if ((label|0) == 54) {
    label = 0;
    $250 = $p;
    $251 = ($250);
    $252 = HEAP8[$251]|0;
    $253 = ($252<<24>>24)!=(0);
    do {
     if ($253) {
      label = 68;
     } else {
      $254 = $p;
      $255 = (($254) + 4|0);
      $256 = ($255);
      $257 = HEAP32[$256>>2]|0;
      $258 = HEAP32[(((9832) + 392|0))>>2]|0;
      $259 = ($257|0)==($258|0);
      if (!($259)) {
       label = 68;
       break;
      }
      $260 = $p;
      $261 = (($260) + 4|0);
      $262 = (($261) + 4|0);
      $263 = HEAP32[$262>>2]|0;
      $264 = HEAP32[(((9832) + 396|0))>>2]|0;
      $265 = ($263|0)==($264|0);
      if (!($265)) {
       label = 68;
       break;
      }
      $266 = $p;
      $267 = (($266) + 20|0);
      $268 = HEAP32[$267>>2]|0;
      $269 = HEAP32[(((9832) + 424|0))>>2]|0;
      _damageElementity($268,$269);
      $270 = HEAP32[(((9832) + 424|0))>>2]|0;
      $271 = (($270) + 8|0);
      $272 = HEAP8[$271]|0;
      $273 = $272&255;
      $274 = ($273|0)==(0);
      if ($274) {
       $275 = $p;
       $276 = (($275) + 20|0);
       $277 = HEAP32[$276>>2]|0;
       $278 = (($277) + 6|0);
       $279 = HEAP8[$278]|0;
       $280 = $279&255;
       $281 = ((((9832) + 3488|0)) + ($280<<6)|0);
       $282 = ($281);
       $283 = ($282);
       HEAP32[(((9832) + 1260|0))>>2] = $283;
       $284 = HEAP32[(((9832) + 432|0))>>2]|0;
       $285 = ($284);
       $286 = ($285);
       HEAP32[(((9832) + 1264|0))>>2] = $286;
       HEAP8[(((9832) + 1268|0))] = 0;
       $j = 0;
       while(1) {
        $287 = $j;
        $288 = $287&255;
        $289 = HEAP8[(((9832) + 340|0))]|0;
        $290 = $289&255;
        $291 = ($288|0)<($290|0);
        if (!($291)) {
         break;
        }
        $292 = $j;
        $293 = $292&255;
        $294 = ((((9832) + 220|0)) + (($293*24)|0)|0);
        $295 = (($294) + 8|0);
        $296 = HEAP8[$295]|0;
        $297 = $296&255;
        $298 = ($297|0)>(0);
        if ($298) {
         label = 61;
         break;
        }
        $300 = $j;
        $301 = (($300) + 1)<<24>>24;
        $j = $301;
       }
       if ((label|0) == 61) {
        label = 0;
        $299 = $j;
        HEAP8[(((9832) + 1258|0))] = $299;
       }
       $302 = $j;
       $303 = $302&255;
       $304 = HEAP8[(((9832) + 340|0))]|0;
       $305 = $304&255;
       $306 = ($303|0)>=($305|0);
       if ($306) {
        HEAP8[(((9832) + 1258|0))] = 6;
       }
       $307 = HEAP32[(((9832) + 56|0))>>2]|0;
       HEAP32[(((9832) + 460|0))>>2] = $307;
      }
      $308 = $i;
      $309 = (($308) + -1)<<24>>24;
      $i = $309;
      _fightGameScreen_destroyProjectile($308);
     }
    } while(0);
    if ((label|0) == 68) {
     label = 0;
     $310 = $p;
     $311 = (($310) + 4|0);
     $312 = ($311);
     $313 = HEAP32[$312>>2]|0;
     $314 = $p;
     $315 = (($314) + 4|0);
     $316 = (($315) + 4|0);
     $317 = HEAP32[$316>>2]|0;
     $318 = (_fightGameScreen_getGameTile($313,$317)|0);
     $gameTile = $318;
     $319 = $gameTile;
     $320 = $319&255;
     $321 = ($320|0)==(1);
     if ($321) {
      $322 = $i;
      $323 = (($322) + -1)<<24>>24;
      $i = $323;
      _fightGameScreen_destroyProjectile($322);
     }
    }
   }
  }
  $324 = $i;
  $325 = (($324) + 1)<<24>>24;
  $i = $325;
 }
 $326 = HEAP32[(((9832) + 56|0))>>2]|0;
 $327 = (($326) + 1)|0;
 HEAP32[(((9832) + 56|0))>>2] = $327;
 STACKTOP = sp;return;
}
function _fightGameScreen_render() {
 var $$byval_copy = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy15 = 0, $$byval_copy16 = 0, $$byval_copy17 = 0, $$byval_copy18 = 0, $$byval_copy19 = 0, $$byval_copy2 = 0, $$byval_copy20 = 0, $$byval_copy21 = 0, $$byval_copy22 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0;
 var $$byval_copy8 = 0, $$byval_copy9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0;
 var $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0;
 var $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0;
 var $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0;
 var $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0;
 var $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0;
 var $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0;
 var $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0;
 var $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0;
 var $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0;
 var $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0;
 var $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
 var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
 var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buffer = 0, $element = 0, $i = 0, $j = 0, $len = 0, $strNotEffective = 0;
 var $strVeryEffective = 0, $strYouDefeated = 0, $strYoureDefeated = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 240|0;
 $$byval_copy22 = sp;
 $$byval_copy21 = sp + 8|0;
 $$byval_copy20 = sp + 16|0;
 $$byval_copy19 = sp + 24|0;
 $$byval_copy18 = sp + 32|0;
 $$byval_copy17 = sp + 40|0;
 $$byval_copy16 = sp + 48|0;
 $$byval_copy15 = sp + 64|0;
 $$byval_copy14 = sp + 72|0;
 $$byval_copy13 = sp + 80|0;
 $$byval_copy12 = sp + 88|0;
 $$byval_copy11 = sp + 96|0;
 $$byval_copy10 = sp + 104|0;
 $$byval_copy9 = sp + 120|0;
 $$byval_copy8 = sp + 128|0;
 $$byval_copy7 = sp + 136|0;
 $$byval_copy6 = sp + 144|0;
 $$byval_copy5 = sp + 152|0;
 $$byval_copy4 = sp + 160|0;
 $$byval_copy3 = sp + 168|0;
 $$byval_copy2 = sp + 208|0;
 $$byval_copy = sp + 224|0;
 $vararg_buffer = sp + 232|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 64|0;
 $1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $9 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $11 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $12 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $13 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $14 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $15 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $16 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $17 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $18 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $strNotEffective = (8808);
 $strVeryEffective = (8824);
 $strYouDefeated = (8840);
 $strYoureDefeated = (8864);
 $19 = HEAP32[((9832))>>2]|0;
 _asciiClearScreen($19);
 $20 = HEAP32[((9832))>>2]|0;
 $21 = ($1);
 HEAP8[$21] = 32;
 $22 = (($1) + 1|0);
 HEAP8[$22] = 7;
 $23 = (($1) + 2|0);
 HEAP8[$23] = 0;
 $24 = (($1) + 3|0);
 HEAP8[$24] = 0;
 $25 = ($2);
 $26 = ($25);
 HEAP32[$26>>2] = 60;
 $27 = (($25) + 4|0);
 HEAP32[$27>>2] = 0;
 $28 = (($2) + 8|0);
 $29 = ($28);
 HEAP32[$29>>2] = 20;
 $30 = (($28) + 4|0);
 HEAP32[$30>>2] = 25;
 $31 = $$byval_copy;
 $32 = $$byval_copy;
 $33 = $1;
 ;HEAP8[$32+0|0]=HEAP8[$33+0|0]|0;HEAP8[$32+1|0]=HEAP8[$33+1|0]|0;HEAP8[$32+2|0]=HEAP8[$33+2|0]|0;HEAP8[$32+3|0]=HEAP8[$33+3|0]|0;
 $34 = $$byval_copy2;
 $35 = $$byval_copy2;
 $36 = $2;
 ;HEAP32[$35+0>>2]=HEAP32[$36+0>>2]|0;HEAP32[$35+4>>2]=HEAP32[$36+4>>2]|0;HEAP32[$35+8>>2]=HEAP32[$36+8>>2]|0;HEAP32[$35+12>>2]=HEAP32[$36+12>>2]|0;
 _asciiFillRect($20,$$byval_copy,$$byval_copy2);
 $37 = $$byval_copy2;
 $38 = $$byval_copy;
 $39 = $$byval_copy3;
 $40 = $$byval_copy3;
 $41 = (((9832) + 356|0));
 dest=$40+0|0; src=$41+0|0; stop=dest+36|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
 _renderWorld($$byval_copy3);
 $42 = $$byval_copy3;
 $i = 0;
 while(1) {
  $43 = $i;
  $44 = $43&255;
  $45 = HEAP8[(((9832) + 1256|0))]|0;
  $46 = $45&255;
  $47 = ($44|0)<($46|0);
  if (!($47)) {
   break;
  }
  $48 = $i;
  $49 = $48&255;
  $50 = ((((9832) + 488|0)) + (($49*24)|0)|0);
  $51 = (($50) + 20|0);
  $52 = HEAP32[$51>>2]|0;
  $53 = (($52) + 6|0);
  $54 = HEAP8[$53]|0;
  $55 = $54&255;
  $56 = ((((9832) + 3488|0)) + ($55<<6)|0);
  $57 = (($56) + 10|0);
  $58 = HEAP8[$57]|0;
  $element = $58;
  $59 = HEAP32[((9832))>>2]|0;
  $60 = ($3);
  HEAP8[$60] = 111;
  $61 = (($3) + 1|0);
  $62 = $element;
  $63 = (_getElementColor($62)|0);
  HEAP8[$61] = $63;
  $64 = (($3) + 2|0);
  HEAP8[$64] = 0;
  $65 = (($3) + 3|0);
  HEAP8[$65] = 0;
  $66 = $i;
  $67 = $66&255;
  $68 = ((((9832) + 488|0)) + (($67*24)|0)|0);
  $69 = (($68) + 4|0);
  $70 = $$byval_copy4;
  $71 = $$byval_copy4;
  $72 = $3;
  ;HEAP8[$71+0|0]=HEAP8[$72+0|0]|0;HEAP8[$71+1|0]=HEAP8[$72+1|0]|0;HEAP8[$71+2|0]=HEAP8[$72+2|0]|0;HEAP8[$71+3|0]=HEAP8[$72+3|0]|0;
  $73 = $$byval_copy5;
  $74 = $$byval_copy5;
  $75 = $69;
  ;HEAP32[$74+0>>2]=HEAP32[$75+0>>2]|0;HEAP32[$74+4>>2]=HEAP32[$75+4>>2]|0;
  _asciiDrawChar($59,$$byval_copy4,$$byval_copy5);
  $76 = $$byval_copy5;
  $77 = $$byval_copy4;
  $78 = $i;
  $79 = (($78) + 1)<<24>>24;
  $i = $79;
 }
 $80 = HEAP32[(((9832) + 428|0))>>2]|0;
 $81 = (($80) + 8|0);
 $82 = HEAP8[$81]|0;
 $83 = $82&255;
 $84 = ($83|0)>(0);
 if ($84) {
  $85 = HEAP32[(((9832) + 428|0))>>2]|0;
  $86 = $$byval_copy6;
  $87 = $$byval_copy6;
  $88 = (((9832) + 400|0));
  ;HEAP32[$87+0>>2]=HEAP32[$88+0>>2]|0;HEAP32[$87+4>>2]=HEAP32[$88+4>>2]|0;
  _drawElementity($85,$$byval_copy6);
  $89 = $$byval_copy6;
 }
 $90 = HEAP32[(((9832) + 424|0))>>2]|0;
 $91 = (($90) + 8|0);
 $92 = HEAP8[$91]|0;
 $93 = $92&255;
 $94 = ($93|0)>(0);
 if ($94) {
  $95 = HEAP32[((9832))>>2]|0;
  $96 = ($4);
  $97 = HEAP8[(((9832) + 217|0))]|0;
  $98 = $97&255;
  $99 = (8800 + ($98)|0);
  $100 = HEAP8[$99]|0;
  HEAP8[$96] = $100;
  $101 = (($4) + 1|0);
  $102 = HEAP32[(((9832) + 432|0))>>2]|0;
  $103 = (($102) + 10|0);
  $104 = HEAP8[$103]|0;
  $105 = (_getElementColor($104)|0);
  HEAP8[$101] = $105;
  $106 = (($4) + 2|0);
  $107 = HEAP32[(((9832) + 432|0))>>2]|0;
  $108 = (($107) + 10|0);
  $109 = HEAP8[$108]|0;
  $110 = (_getElementForeColor($109)|0);
  HEAP8[$106] = $110;
  $111 = (($4) + 3|0);
  HEAP8[$111] = 0;
  $112 = $$byval_copy7;
  $113 = $$byval_copy7;
  $114 = $4;
  ;HEAP8[$113+0|0]=HEAP8[$114+0|0]|0;HEAP8[$113+1|0]=HEAP8[$114+1|0]|0;HEAP8[$113+2|0]=HEAP8[$114+2|0]|0;HEAP8[$113+3|0]=HEAP8[$114+3|0]|0;
  $115 = $$byval_copy8;
  $116 = $$byval_copy8;
  $117 = (((9832) + 392|0));
  ;HEAP32[$116+0>>2]=HEAP32[$117+0>>2]|0;HEAP32[$116+4>>2]=HEAP32[$117+4>>2]|0;
  _asciiDrawChar($95,$$byval_copy7,$$byval_copy8);
  $118 = $$byval_copy8;
  $119 = $$byval_copy7;
 }
 $120 = HEAP8[(((9832) + 420|0))]|0;
 $121 = $120&255;
 $122 = ($121|0)!=(1);
 if ($122) {
  $123 = HEAP32[((9832))>>2]|0;
  $124 = HEAP8[(((9832) + 420|0))]|0;
  $125 = $124&255;
  $126 = ($125|0)==(0);
  if ($126) {
   $127 = $strNotEffective;
   $129 = $127;
  } else {
   $128 = $strVeryEffective;
   $129 = $128;
  }
  $130 = ($5);
  HEAP32[$130>>2] = 23;
  $131 = (($5) + 4|0);
  HEAP32[$131>>2] = 0;
  $132 = $$byval_copy9;
  $133 = $$byval_copy9;
  $134 = $5;
  ;HEAP32[$133+0>>2]=HEAP32[$134+0>>2]|0;HEAP32[$133+4>>2]=HEAP32[$134+4>>2]|0;
  _asciiDrawText($123,$129,$$byval_copy9);
  $135 = $$byval_copy9;
 }
 $136 = HEAP32[((9832))>>2]|0;
 $137 = ($6);
 $138 = ($137);
 HEAP32[$138>>2] = 61;
 $139 = (($137) + 4|0);
 HEAP32[$139>>2] = 1;
 $140 = (($6) + 8|0);
 $141 = ($140);
 HEAP32[$141>>2] = 3;
 $142 = (($140) + 4|0);
 HEAP32[$142>>2] = 3;
 $143 = $$byval_copy10;
 $144 = $$byval_copy10;
 $145 = $6;
 ;HEAP32[$144+0>>2]=HEAP32[$145+0>>2]|0;HEAP32[$144+4>>2]=HEAP32[$145+4>>2]|0;HEAP32[$144+8>>2]=HEAP32[$145+8>>2]|0;HEAP32[$144+12>>2]=HEAP32[$145+12>>2]|0;
 _asciiDrawRectangleColored($136,$$byval_copy10,7,0);
 $146 = $$byval_copy10;
 $147 = HEAP32[(((9832) + 428|0))>>2]|0;
 $148 = ($7);
 HEAP32[$148>>2] = 62;
 $149 = (($7) + 4|0);
 HEAP32[$149>>2] = 2;
 $150 = $$byval_copy11;
 $151 = $$byval_copy11;
 $152 = $7;
 ;HEAP32[$151+0>>2]=HEAP32[$152+0>>2]|0;HEAP32[$151+4>>2]=HEAP32[$152+4>>2]|0;
 _drawElementity($147,$$byval_copy11);
 $153 = $$byval_copy11;
 $154 = HEAP32[(((9832) + 428|0))>>2]|0;
 $155 = ($8);
 HEAP32[$155>>2] = 66;
 $156 = (($8) + 4|0);
 HEAP32[$156>>2] = 1;
 $157 = $$byval_copy12;
 $158 = $$byval_copy12;
 $159 = $8;
 ;HEAP32[$158+0>>2]=HEAP32[$159+0>>2]|0;HEAP32[$158+4>>2]=HEAP32[$159+4>>2]|0;
 _drawElementityName($154,$$byval_copy12);
 $160 = $$byval_copy12;
 $161 = HEAP32[(((9832) + 428|0))>>2]|0;
 $162 = ($9);
 HEAP32[$162>>2] = 65;
 $163 = (($9) + 4|0);
 HEAP32[$163>>2] = 2;
 $164 = $$byval_copy13;
 $165 = $$byval_copy13;
 $166 = $9;
 ;HEAP32[$165+0>>2]=HEAP32[$166+0>>2]|0;HEAP32[$165+4>>2]=HEAP32[$166+4>>2]|0;
 _drawElementityHP($161,$$byval_copy13);
 $167 = $$byval_copy13;
 $j = 0;
 $i = 0;
 while(1) {
  $168 = $i;
  $169 = $168&255;
  $170 = HEAP32[(((9832) + 76|0))>>2]|0;
  $171 = (($170) + 132|0);
  $172 = HEAP8[$171]|0;
  $173 = $172&255;
  $174 = ($169|0)<($173|0);
  if (!($174)) {
   break;
  }
  $175 = $i;
  $176 = $175&255;
  $177 = HEAP8[(((9832) + 417|0))]|0;
  $178 = $177&255;
  $179 = ($176|0)!=($178|0);
  if ($179) {
   $180 = HEAP32[(((9832) + 76|0))>>2]|0;
   $181 = (($180) + 12|0);
   $182 = ($181);
   $183 = $i;
   $184 = $183&255;
   $185 = (($182) + (($184*24)|0)|0);
   $186 = ($10);
   HEAP32[$186>>2] = 66;
   $187 = (($10) + 4|0);
   $188 = $j;
   $189 = $188&255;
   $190 = $189<<1;
   $191 = (3 + ($190))|0;
   HEAP32[$187>>2] = $191;
   $192 = $$byval_copy14;
   $193 = $$byval_copy14;
   $194 = $10;
   ;HEAP32[$193+0>>2]=HEAP32[$194+0>>2]|0;HEAP32[$193+4>>2]=HEAP32[$194+4>>2]|0;
   _drawElementityName($185,$$byval_copy14);
   $195 = $$byval_copy14;
   $196 = HEAP32[(((9832) + 76|0))>>2]|0;
   $197 = (($196) + 12|0);
   $198 = ($197);
   $199 = $i;
   $200 = $199&255;
   $201 = (($198) + (($200*24)|0)|0);
   $202 = ($11);
   HEAP32[$202>>2] = 65;
   $203 = (($11) + 4|0);
   $204 = $j;
   $205 = $204&255;
   $206 = $205<<1;
   $207 = (4 + ($206))|0;
   HEAP32[$203>>2] = $207;
   $208 = $$byval_copy15;
   $209 = $$byval_copy15;
   $210 = $11;
   ;HEAP32[$209+0>>2]=HEAP32[$210+0>>2]|0;HEAP32[$209+4>>2]=HEAP32[$210+4>>2]|0;
   _drawElementityHP($201,$$byval_copy15);
   $211 = $$byval_copy15;
   $212 = $j;
   $213 = (($212) + 1)<<24>>24;
   $j = $213;
  }
  $214 = $i;
  $215 = (($214) + 1)<<24>>24;
  $i = $215;
 }
 $216 = HEAP32[((9832))>>2]|0;
 $217 = ($12);
 $218 = ($217);
 HEAP32[$218>>2] = 61;
 $219 = (($217) + 4|0);
 HEAP32[$219>>2] = 21;
 $220 = (($12) + 8|0);
 $221 = ($220);
 HEAP32[$221>>2] = 3;
 $222 = (($220) + 4|0);
 HEAP32[$222>>2] = 3;
 $223 = $$byval_copy16;
 $224 = $$byval_copy16;
 $225 = $12;
 ;HEAP32[$224+0>>2]=HEAP32[$225+0>>2]|0;HEAP32[$224+4>>2]=HEAP32[$225+4>>2]|0;HEAP32[$224+8>>2]=HEAP32[$225+8>>2]|0;HEAP32[$224+12>>2]=HEAP32[$225+12>>2]|0;
 _asciiDrawRectangleColored($216,$$byval_copy16,7,0);
 $226 = $$byval_copy16;
 $227 = HEAP32[(((9832) + 424|0))>>2]|0;
 $228 = ($13);
 HEAP32[$228>>2] = 62;
 $229 = (($13) + 4|0);
 HEAP32[$229>>2] = 22;
 $230 = $$byval_copy17;
 $231 = $$byval_copy17;
 $232 = $13;
 ;HEAP32[$231+0>>2]=HEAP32[$232+0>>2]|0;HEAP32[$231+4>>2]=HEAP32[$232+4>>2]|0;
 _drawElementity($227,$$byval_copy17);
 $233 = $$byval_copy17;
 $234 = HEAP32[(((9832) + 424|0))>>2]|0;
 $235 = ($14);
 HEAP32[$235>>2] = 66;
 $236 = (($14) + 4|0);
 HEAP32[$236>>2] = 21;
 $237 = $$byval_copy18;
 $238 = $$byval_copy18;
 $239 = $14;
 ;HEAP32[$238+0>>2]=HEAP32[$239+0>>2]|0;HEAP32[$238+4>>2]=HEAP32[$239+4>>2]|0;
 _drawElementityName($234,$$byval_copy18);
 $240 = $$byval_copy18;
 $241 = HEAP32[(((9832) + 424|0))>>2]|0;
 $242 = ($15);
 HEAP32[$242>>2] = 65;
 $243 = (($15) + 4|0);
 HEAP32[$243>>2] = 22;
 $244 = $$byval_copy19;
 $245 = $$byval_copy19;
 $246 = $15;
 ;HEAP32[$245+0>>2]=HEAP32[$246+0>>2]|0;HEAP32[$245+4>>2]=HEAP32[$246+4>>2]|0;
 _drawElementityHP($241,$$byval_copy19);
 $247 = $$byval_copy19;
 $j = 0;
 $i = 0;
 while(1) {
  $248 = $i;
  $249 = $248&255;
  $250 = HEAP8[(((9832) + 340|0))]|0;
  $251 = $250&255;
  $252 = ($249|0)<($251|0);
  if (!($252)) {
   break;
  }
  $253 = $i;
  $254 = $253&255;
  $255 = HEAP8[(((9832) + 416|0))]|0;
  $256 = $255&255;
  $257 = ($254|0)!=($256|0);
  if ($257) {
   $258 = $i;
   $259 = $258&255;
   $260 = ((((9832) + 220|0)) + (($259*24)|0)|0);
   $261 = ($16);
   HEAP32[$261>>2] = 66;
   $262 = (($16) + 4|0);
   $263 = $j;
   $264 = $263&255;
   $265 = $264<<1;
   $266 = (19 - ($265))|0;
   HEAP32[$262>>2] = $266;
   $267 = $$byval_copy20;
   $268 = $$byval_copy20;
   $269 = $16;
   ;HEAP32[$268+0>>2]=HEAP32[$269+0>>2]|0;HEAP32[$268+4>>2]=HEAP32[$269+4>>2]|0;
   _drawElementityName($260,$$byval_copy20);
   $270 = $$byval_copy20;
   $271 = $i;
   $272 = $271&255;
   $273 = ((((9832) + 220|0)) + (($272*24)|0)|0);
   $274 = ($17);
   HEAP32[$274>>2] = 65;
   $275 = (($17) + 4|0);
   $276 = $j;
   $277 = $276&255;
   $278 = $277<<1;
   $279 = (20 - ($278))|0;
   HEAP32[$275>>2] = $279;
   $280 = $$byval_copy21;
   $281 = $$byval_copy21;
   $282 = $17;
   ;HEAP32[$281+0>>2]=HEAP32[$282+0>>2]|0;HEAP32[$281+4>>2]=HEAP32[$282+4>>2]|0;
   _drawElementityHP($273,$$byval_copy21);
   $283 = $$byval_copy21;
   $284 = $j;
   $285 = (($284) + 1)<<24>>24;
   $j = $285;
  }
  $286 = $i;
  $287 = (($286) + 1)<<24>>24;
  $i = $287;
 }
 $288 = HEAP32[(((9832) + 1264|0))>>2]|0;
 $289 = ($288|0)!=(0|0);
 if (!($289)) {
  STACKTOP = sp;return;
 }
 $290 = ($buffer);
 $291 = HEAP8[(((9832) + 1268|0))]|0;
 $292 = $291 << 24 >> 24;
 $293 = ($292|0)!=(0);
 if ($293) {
  $294 = $strYouDefeated;
  $296 = $294;
 } else {
  $295 = $strYoureDefeated;
  $296 = $295;
 }
 $297 = HEAP32[(((9832) + 1260|0))>>2]|0;
 $298 = HEAP32[(((9832) + 1264|0))>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $297;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $298;
 $299 = (_sprintf(($290|0),($296|0),($vararg_buffer|0))|0);
 $300 = $299&255;
 $len = $300;
 $301 = HEAP32[((9832))>>2]|0;
 $302 = ($buffer);
 $303 = ($18);
 $304 = $len;
 $305 = $304&255;
 $306 = (($305|0) / 2)&-1;
 $307 = (30 - ($306))|0;
 HEAP32[$303>>2] = $307;
 $308 = (($18) + 4|0);
 HEAP32[$308>>2] = 24;
 $309 = $$byval_copy22;
 $310 = $$byval_copy22;
 $311 = $18;
 ;HEAP32[$310+0>>2]=HEAP32[$311+0>>2]|0;HEAP32[$310+4>>2]=HEAP32[$311+4>>2]|0;
 _asciiDrawText($301,$302,$$byval_copy22);
 $312 = $$byval_copy22;
 STACKTOP = sp;return;
}
function _fightGameScreen_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  $6 = $1;
  $7 = $6&255;
  switch ($7|0) {
  case 5:  {
   HEAP8[(((9832) + 217|0))] = 0;
   $8 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 440|0))>>2] = $8;
   break;
  }
  case 6:  {
   HEAP8[(((9832) + 217|0))] = 1;
   $9 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 440|0))>>2] = $9;
   break;
  }
  case 8:  {
   HEAP8[(((9832) + 217|0))] = 2;
   $10 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 440|0))>>2] = $10;
   break;
  }
  case 7:  {
   HEAP8[(((9832) + 217|0))] = 3;
   $11 = HEAP32[(((9832) + 56|0))>>2]|0;
   HEAP32[(((9832) + 440|0))>>2] = $11;
   break;
  }
  case 29: case 28: case 27: case 26: case 25:  {
   $13 = $1;
   $14 = $13&255;
   $15 = (($14) - 25)|0;
   $16 = $15&255;
   $i = $16;
   $17 = HEAP8[(((9832) + 340|0))]|0;
   $18 = $17&255;
   $19 = $i;
   $20 = $19&255;
   $21 = ($18|0)>($20|0);
   do {
    if ($21) {
     $22 = $i;
     $23 = $22&255;
     $24 = ((((9832) + 220|0)) + (($23*24)|0)|0);
     $25 = (($24) + 8|0);
     $26 = HEAP8[$25]|0;
     $27 = $26&255;
     $28 = ($27|0)>(0);
     if (!($28)) {
      break;
     }
     $29 = HEAP8[(((9832) + 1258|0))]|0;
     $30 = $29&255;
     $31 = ($30|0)!=(6);
     if (!($31)) {
      break;
     }
     $32 = HEAP32[(((9832) + 460|0))>>2]|0;
     $33 = ($32|0)==(0);
     if ($33) {
      $34 = HEAP32[(((9832) + 56|0))>>2]|0;
      HEAP32[(((9832) + 460|0))>>2] = $34;
     }
     $35 = $i;
     HEAP8[(((9832) + 1258|0))] = $35;
    }
   } while(0);
   break;
  }
  case 4:  {
   $12 = HEAP8[(((9832) + 217|0))]|0;
   HEAP8[(((9832) + 418|0))] = $12;
   HEAP8[(((9832) + 421|0))] = 1;
   break;
  }
  default: {
  }
  }
  STACKTOP = sp;return;
 }
 $36 = $1;
 $37 = $36&255;
 switch ($37|0) {
 case 7: case 8: case 6: case 5:  {
  $38 = HEAP32[((9832))>>2]|0;
  $39 = (_asciiIsKeyPressed($38,5)|0);
  $40 = ($39<<24>>24)!=(0);
  if ($40) {
   HEAP8[(((9832) + 217|0))] = 0;
  } else {
   $41 = HEAP32[((9832))>>2]|0;
   $42 = (_asciiIsKeyPressed($41,6)|0);
   $43 = ($42<<24>>24)!=(0);
   if ($43) {
    HEAP8[(((9832) + 217|0))] = 1;
   } else {
    $44 = HEAP32[((9832))>>2]|0;
    $45 = (_asciiIsKeyPressed($44,8)|0);
    $46 = ($45<<24>>24)!=(0);
    if ($46) {
     HEAP8[(((9832) + 217|0))] = 2;
    } else {
     $47 = HEAP32[((9832))>>2]|0;
     $48 = (_asciiIsKeyPressed($47,7)|0);
     $49 = ($48<<24>>24)!=(0);
     if ($49) {
      HEAP8[(((9832) + 217|0))] = 3;
     } else {
      HEAP32[(((9832) + 440|0))>>2] = 0;
     }
    }
   }
  }
  break;
 }
 case 4:  {
  HEAP8[(((9832) + 421|0))] = 0;
  break;
 }
 default: {
 }
 }
 STACKTOP = sp;return;
}
function _fightGameScreen_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _fightGameScreen_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _fightLost_init() {
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = HEAP32[(9576)>>2]|0;
 HEAP32[(((9584) + 16|0))>>2] = $1;
 STACKTOP = sp;return;
}
function _fightLost_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _fightLost_render() {
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $fightLostImage$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy = sp;
 $fightLostImage$byval_copy = sp + 16|0;
 $1 = sp + 48|0;
 $2 = HEAP32[((9832))>>2]|0;
 $3 = ($1);
 $4 = ($3);
 HEAP32[$4>>2] = 17;
 $5 = (($3) + 4|0);
 HEAP32[$5>>2] = 5;
 $6 = (($1) + 8|0);
 $7 = ($6);
 HEAP32[$7>>2] = 0;
 $8 = (($6) + 4|0);
 HEAP32[$8>>2] = 0;
 $9 = $fightLostImage$byval_copy;
 $10 = $fightLostImage$byval_copy;
 $11 = (9584);
 ;HEAP32[$10+0>>2]=HEAP32[$11+0>>2]|0;HEAP32[$10+4>>2]=HEAP32[$11+4>>2]|0;HEAP32[$10+8>>2]=HEAP32[$11+8>>2]|0;HEAP32[$10+12>>2]=HEAP32[$11+12>>2]|0;HEAP32[$10+16>>2]=HEAP32[$11+16>>2]|0;HEAP32[$10+20>>2]=HEAP32[$11+20>>2]|0;HEAP32[$10+24>>2]=HEAP32[$11+24>>2]|0;
 $12 = $$byval_copy;
 $13 = $$byval_copy;
 $14 = $1;
 ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;HEAP32[$13+8>>2]=HEAP32[$14+8>>2]|0;HEAP32[$13+12>>2]=HEAP32[$14+12>>2]|0;
 _asciiDrawBitmapColored($2,$fightLostImage$byval_copy,$$byval_copy,7,0);
 $15 = $$byval_copy;
 $16 = $fightLostImage$byval_copy;
 STACKTOP = sp;return;
}
function _fightLost_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mainMenuScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $mainMenuScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 $8 = ($7|0)==(2);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 _freeGame();
 $9 = $mainMenuScreen$byval_copy;
 $10 = $mainMenuScreen$byval_copy;
 $11 = (17848);
 ;HEAP32[$10+0>>2]=HEAP32[$11+0>>2]|0;HEAP32[$10+4>>2]=HEAP32[$11+4>>2]|0;HEAP32[$10+8>>2]=HEAP32[$11+8>>2]|0;HEAP32[$10+12>>2]=HEAP32[$11+12>>2]|0;HEAP32[$10+16>>2]=HEAP32[$11+16>>2]|0;HEAP32[$10+20>>2]=HEAP32[$11+20>>2]|0;
 _switchToScreen($mainMenuScreen$byval_copy);
 $12 = $mainMenuScreen$byval_copy;
 STACKTOP = sp;return;
}
function _fightLost_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _fightLost_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _fightPre_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _fightPre_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _fightPre_render() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0;
 var $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0;
 var $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0;
 var $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0;
 var $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0;
 var $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0;
 var $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i = 0, $strPressEnter = 0, $strVersus = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 216|0;
 $$byval_copy8 = sp;
 $$byval_copy7 = sp + 16|0;
 $$byval_copy6 = sp + 24|0;
 $$byval_copy5 = sp + 40|0;
 $$byval_copy4 = sp + 48|0;
 $$byval_copy3 = sp + 56|0;
 $$byval_copy2 = sp + 64|0;
 $$byval_copy1 = sp + 72|0;
 $$byval_copy = sp + 80|0;
 $1 = sp + 120|0;
 $2 = sp + 136|0;
 $3 = sp + 144|0;
 $4 = sp + 152|0;
 $5 = sp + 160|0;
 $6 = sp + 168|0;
 $7 = sp + 176|0;
 $8 = sp + 192|0;
 $9 = sp + 200|0;
 $strVersus = (9640);
 $strPressEnter = (9648);
 $10 = HEAP32[((9832))>>2]|0;
 $11 = ($1);
 $12 = ($11);
 HEAP32[$12>>2] = 17;
 $13 = (($11) + 4|0);
 HEAP32[$13>>2] = 0;
 $14 = (($1) + 8|0);
 $15 = ($14);
 HEAP32[$15>>2] = 46;
 $16 = (($14) + 4|0);
 HEAP32[$16>>2] = 25;
 $17 = $$byval_copy;
 $18 = $$byval_copy;
 $19 = $1;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[$19+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[$19+12>>2]|0;
 _asciiDrawFilledRectangleColored($10,$$byval_copy,7,0);
 $20 = $$byval_copy;
 $21 = HEAP32[((9832))>>2]|0;
 $22 = $strVersus;
 $23 = ($2);
 HEAP32[$23>>2] = 37;
 $24 = (($2) + 4|0);
 HEAP32[$24>>2] = 12;
 $25 = $$byval_copy1;
 $26 = $$byval_copy1;
 $27 = $2;
 ;HEAP32[$26+0>>2]=HEAP32[$27+0>>2]|0;HEAP32[$26+4>>2]=HEAP32[$27+4>>2]|0;
 _asciiDrawTextColored($21,$22,$$byval_copy1,7,0);
 $28 = $$byval_copy1;
 $29 = HEAP32[((9832))>>2]|0;
 $30 = $strPressEnter;
 $31 = ($3);
 HEAP32[$31>>2] = 28;
 $32 = (($3) + 4|0);
 HEAP32[$32>>2] = 22;
 $33 = $$byval_copy2;
 $34 = $$byval_copy2;
 $35 = $3;
 ;HEAP32[$34+0>>2]=HEAP32[$35+0>>2]|0;HEAP32[$34+4>>2]=HEAP32[$35+4>>2]|0;
 _asciiDrawTextColored($29,$30,$$byval_copy2,7,0);
 $36 = $$byval_copy2;
 $37 = HEAP32[((9832))>>2]|0;
 $38 = ($4);
 HEAP32[$38>>2] = 28;
 $39 = (($4) + 4|0);
 HEAP32[$39>>2] = 1;
 $40 = $$byval_copy3;
 $41 = $$byval_copy3;
 $42 = $4;
 ;HEAP32[$41+0>>2]=HEAP32[$42+0>>2]|0;HEAP32[$41+4>>2]=HEAP32[$42+4>>2]|0;
 _asciiDrawTextColored($37,(9680),$$byval_copy3,7,0);
 $43 = $$byval_copy3;
 $44 = HEAP32[((9832))>>2]|0;
 $45 = ($5);
 HEAP32[$45>>2] = 48;
 $46 = (($5) + 4|0);
 HEAP32[$46>>2] = 1;
 $47 = $$byval_copy4;
 $48 = $$byval_copy4;
 $49 = $5;
 ;HEAP32[$48+0>>2]=HEAP32[$49+0>>2]|0;HEAP32[$48+4>>2]=HEAP32[$49+4>>2]|0;
 _asciiDrawTextColored($44,(9688),$$byval_copy4,7,0);
 $50 = $$byval_copy4;
 $i = 0;
 while(1) {
  $51 = $i;
  $52 = $51&255;
  $53 = ($52|0)<(5);
  if (!($53)) {
   break;
  }
  $54 = $i;
  $55 = $54&255;
  $56 = HEAP8[(((9832) + 340|0))]|0;
  $57 = $56&255;
  $58 = ($55|0)<($57|0);
  if ($58) {
   $59 = $i;
   $60 = $59&255;
   $61 = ((((9832) + 220|0)) + (($60*24)|0)|0);
   $62 = ($6);
   HEAP32[$62>>2] = 22;
   $63 = (($6) + 4|0);
   $64 = $i;
   $65 = $64&255;
   $66 = $65<<2;
   $67 = (2 + ($66))|0;
   HEAP32[$63>>2] = $67;
   $68 = $$byval_copy5;
   $69 = $$byval_copy5;
   $70 = $6;
   ;HEAP32[$69+0>>2]=HEAP32[$70+0>>2]|0;HEAP32[$69+4>>2]=HEAP32[$70+4>>2]|0;
   _drawElementitySmallProfile($61,$$byval_copy5);
   $71 = $$byval_copy5;
  } else {
   $72 = HEAP32[((9832))>>2]|0;
   $73 = ($7);
   $74 = ($73);
   HEAP32[$74>>2] = 22;
   $75 = (($73) + 4|0);
   $76 = $i;
   $77 = $76&255;
   $78 = $77<<2;
   $79 = (2 + ($78))|0;
   HEAP32[$75>>2] = $79;
   $80 = (($7) + 8|0);
   $81 = ($80);
   HEAP32[$81>>2] = 3;
   $82 = (($80) + 4|0);
   HEAP32[$82>>2] = 3;
   $83 = $$byval_copy6;
   $84 = $$byval_copy6;
   $85 = $7;
   ;HEAP32[$84+0>>2]=HEAP32[$85+0>>2]|0;HEAP32[$84+4>>2]=HEAP32[$85+4>>2]|0;HEAP32[$84+8>>2]=HEAP32[$85+8>>2]|0;HEAP32[$84+12>>2]=HEAP32[$85+12>>2]|0;
   _asciiDrawFilledRectangleColored($72,$$byval_copy6,7,0);
   $86 = $$byval_copy6;
  }
  $87 = $i;
  $88 = $87&255;
  $89 = HEAP32[(((9832) + 76|0))>>2]|0;
  $90 = (($89) + 132|0);
  $91 = HEAP8[$90]|0;
  $92 = $91&255;
  $93 = ($88|0)<($92|0);
  if ($93) {
   $94 = HEAP32[(((9832) + 76|0))>>2]|0;
   $95 = (($94) + 12|0);
   $96 = ($95);
   $97 = $i;
   $98 = $97&255;
   $99 = (($96) + (($98*24)|0)|0);
   $100 = ($8);
   HEAP32[$100>>2] = 45;
   $101 = (($8) + 4|0);
   $102 = $i;
   $103 = $102&255;
   $104 = $103<<2;
   $105 = (2 + ($104))|0;
   HEAP32[$101>>2] = $105;
   $106 = $$byval_copy7;
   $107 = $$byval_copy7;
   $108 = $8;
   ;HEAP32[$107+0>>2]=HEAP32[$108+0>>2]|0;HEAP32[$107+4>>2]=HEAP32[$108+4>>2]|0;
   _drawElementitySmallProfile($99,$$byval_copy7);
   $109 = $$byval_copy7;
  } else {
   $110 = HEAP32[((9832))>>2]|0;
   $111 = ($9);
   $112 = ($111);
   HEAP32[$112>>2] = 45;
   $113 = (($111) + 4|0);
   $114 = $i;
   $115 = $114&255;
   $116 = $115<<2;
   $117 = (2 + ($116))|0;
   HEAP32[$113>>2] = $117;
   $118 = (($9) + 8|0);
   $119 = ($118);
   HEAP32[$119>>2] = 3;
   $120 = (($118) + 4|0);
   HEAP32[$120>>2] = 3;
   $121 = $$byval_copy8;
   $122 = $$byval_copy8;
   $123 = $9;
   ;HEAP32[$122+0>>2]=HEAP32[$123+0>>2]|0;HEAP32[$122+4>>2]=HEAP32[$123+4>>2]|0;HEAP32[$122+8>>2]=HEAP32[$123+8>>2]|0;HEAP32[$122+12>>2]=HEAP32[$123+12>>2]|0;
   _asciiDrawFilledRectangleColored($110,$$byval_copy8,7,0);
   $124 = $$byval_copy8;
  }
  $125 = $i;
  $126 = (($125) + 1)<<24>>24;
  $i = $126;
 }
 STACKTOP = sp;return;
}
function _fightPre_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $fightGameScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $fightGameScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 $8 = ($7|0)==(2);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 $9 = $fightGameScreen$byval_copy;
 $10 = $fightGameScreen$byval_copy;
 $11 = (8888);
 ;HEAP32[$10+0>>2]=HEAP32[$11+0>>2]|0;HEAP32[$10+4>>2]=HEAP32[$11+4>>2]|0;HEAP32[$10+8>>2]=HEAP32[$11+8>>2]|0;HEAP32[$10+12>>2]=HEAP32[$11+12>>2]|0;HEAP32[$10+16>>2]=HEAP32[$11+16>>2]|0;HEAP32[$10+20>>2]=HEAP32[$11+20>>2]|0;
 _switchToScreen($fightGameScreen$byval_copy);
 $12 = $fightGameScreen$byval_copy;
 STACKTOP = sp;return;
}
function _fightPre_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _fightPre_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _fightWon_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP8[(((9832) + 416|0))] = 0;
 HEAP32[(((9832) + 56|0))>>2] = 90;
 HEAP32[(((9832) + 60|0))>>2] = 0;
 STACKTOP = sp;return;
}
function _fightWon_update() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = HEAP32[(((9832) + 60|0))>>2]|0;
 if ((($1|0) == 2)) {
  $47 = HEAP32[(((9832) + 56|0))>>2]|0;
  $48 = ($47|0)==(0);
  if ($48) {
   HEAP32[(((9832) + 60|0))>>2] = 1;
  } else {
   $49 = HEAP32[(((9832) + 56|0))>>2]|0;
   $50 = (($49) + -1)|0;
   HEAP32[(((9832) + 56|0))>>2] = $50;
  }
  STACKTOP = sp;return;
 } else if ((($1|0) == 1)) {
  $6 = HEAP32[(((9832) + 56|0))>>2]|0;
  $7 = ($6|0)==(0);
  if ($7) {
   HEAP32[(((9832) + 56|0))>>2] = 2;
   $8 = HEAP8[(((9832) + 416|0))]|0;
   $9 = $8&255;
   $10 = ((((9832) + 464|0)) + ($9<<2)|0);
   $11 = HEAP32[$10>>2]|0;
   $12 = ($11|0)==(0);
   if ($12) {
    $13 = HEAP8[(((9832) + 416|0))]|0;
    $14 = (($13) + 1)<<24>>24;
    HEAP8[(((9832) + 416|0))] = $14;
    $15 = HEAP8[(((9832) + 416|0))]|0;
    $16 = $15&255;
    $17 = HEAP8[(((9832) + 340|0))]|0;
    $18 = $17&255;
    $19 = ($16|0)>=($18|0);
    if ($19) {
     HEAP32[(((9832) + 60|0))>>2] = 255;
    } else {
     HEAP32[(((9832) + 60|0))>>2] = 0;
     HEAP32[(((9832) + 56|0))>>2] = 90;
    }
   } else {
    $20 = HEAP8[(((9832) + 416|0))]|0;
    $21 = $20&255;
    $22 = ((((9832) + 464|0)) + ($21<<2)|0);
    $23 = HEAP32[$22>>2]|0;
    $24 = (($23) + -1)|0;
    HEAP32[$22>>2] = $24;
    $25 = HEAP8[(((9832) + 416|0))]|0;
    $26 = $25&255;
    $27 = ((((9832) + 220|0)) + (($26*24)|0)|0);
    $28 = (($27) + 12|0);
    $29 = HEAP32[$28>>2]|0;
    $30 = (($29) + 1)|0;
    HEAP32[$28>>2] = $30;
    $31 = HEAP8[(((9832) + 416|0))]|0;
    $32 = $31&255;
    $33 = ((((9832) + 220|0)) + (($32*24)|0)|0);
    $34 = (($33) + 12|0);
    $35 = HEAP32[$34>>2]|0;
    $36 = HEAP8[(((9832) + 416|0))]|0;
    $37 = $36&255;
    $38 = ((((9832) + 220|0)) + (($37*24)|0)|0);
    $39 = (($38) + 16|0);
    $40 = HEAP32[$39>>2]|0;
    $41 = ($35|0)==($40|0);
    if ($41) {
     $42 = HEAP8[(((9832) + 416|0))]|0;
     $43 = $42&255;
     $44 = ((((9832) + 220|0)) + (($43*24)|0)|0);
     _levelUpElementity($44);
     HEAP32[(((9832) + 60|0))>>2] = 2;
     HEAP32[(((9832) + 56|0))>>2] = 45;
    }
   }
   HEAP8[(((9832) + 4|0))] = 1;
  } else {
   $45 = HEAP32[(((9832) + 56|0))>>2]|0;
   $46 = (($45) + -1)|0;
   HEAP32[(((9832) + 56|0))>>2] = $46;
  }
  STACKTOP = sp;return;
 } else if ((($1|0) == 0)) {
  $2 = HEAP32[(((9832) + 56|0))>>2]|0;
  $3 = ($2|0)==(0);
  if ($3) {
   HEAP32[(((9832) + 60|0))>>2] = 1;
  } else {
   $4 = HEAP32[(((9832) + 56|0))>>2]|0;
   $5 = (($4) + -1)|0;
   HEAP32[(((9832) + 56|0))>>2] = $5;
  }
  STACKTOP = sp;return;
 } else {
  STACKTOP = sp;return;
 }
}
function _fightWon_render() {
 var $$byval_copy = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0;
 var $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0;
 var $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0;
 var $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0;
 var $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0;
 var $97 = 0, $98 = 0, $99 = 0, $buffer = 0, $i = 0, $strPressEnter = 0, $strYouWon = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0;
 $$byval_copy12 = sp;
 $$byval_copy11 = sp + 16|0;
 $$byval_copy10 = sp + 24|0;
 $$byval_copy9 = sp + 32|0;
 $$byval_copy8 = sp + 40|0;
 $$byval_copy7 = sp + 48|0;
 $$byval_copy6 = sp + 56|0;
 $$byval_copy5 = sp + 64|0;
 $$byval_copy4 = sp + 72|0;
 $$byval_copy3 = sp + 80|0;
 $$byval_copy2 = sp + 96|0;
 $$byval_copy = sp + 104|0;
 $vararg_buffer = sp + 120|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $1 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $9 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $11 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $12 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $strYouWon = (9720);
 $strPressEnter = (9744);
 $13 = HEAP32[((9832))>>2]|0;
 $14 = ($1);
 $15 = ($14);
 HEAP32[$15>>2] = 21;
 $16 = (($14) + 4|0);
 HEAP32[$16>>2] = 0;
 $17 = (($1) + 8|0);
 $18 = ($17);
 HEAP32[$18>>2] = 38;
 $19 = (($17) + 4|0);
 HEAP32[$19>>2] = 25;
 $20 = $$byval_copy;
 $21 = $$byval_copy;
 $22 = $1;
 ;HEAP32[$21+0>>2]=HEAP32[$22+0>>2]|0;HEAP32[$21+4>>2]=HEAP32[$22+4>>2]|0;HEAP32[$21+8>>2]=HEAP32[$22+8>>2]|0;HEAP32[$21+12>>2]=HEAP32[$22+12>>2]|0;
 _asciiDrawRectangle($13,$$byval_copy);
 $23 = $$byval_copy;
 $24 = HEAP32[((9832))>>2]|0;
 $25 = ($2);
 HEAP8[$25] = 32;
 $26 = (($2) + 1|0);
 HEAP8[$26] = 7;
 $27 = (($2) + 2|0);
 HEAP8[$27] = 0;
 $28 = (($2) + 3|0);
 HEAP8[$28] = 0;
 $29 = ($3);
 $30 = ($29);
 HEAP32[$30>>2] = 22;
 $31 = (($29) + 4|0);
 HEAP32[$31>>2] = 1;
 $32 = (($3) + 8|0);
 $33 = ($32);
 HEAP32[$33>>2] = 36;
 $34 = (($32) + 4|0);
 HEAP32[$34>>2] = 23;
 $35 = $$byval_copy2;
 $36 = $$byval_copy2;
 $37 = $2;
 ;HEAP8[$36+0|0]=HEAP8[$37+0|0]|0;HEAP8[$36+1|0]=HEAP8[$37+1|0]|0;HEAP8[$36+2|0]=HEAP8[$37+2|0]|0;HEAP8[$36+3|0]=HEAP8[$37+3|0]|0;
 $38 = $$byval_copy3;
 $39 = $$byval_copy3;
 $40 = $3;
 ;HEAP32[$39+0>>2]=HEAP32[$40+0>>2]|0;HEAP32[$39+4>>2]=HEAP32[$40+4>>2]|0;HEAP32[$39+8>>2]=HEAP32[$40+8>>2]|0;HEAP32[$39+12>>2]=HEAP32[$40+12>>2]|0;
 _asciiFillRect($24,$$byval_copy2,$$byval_copy3);
 $41 = $$byval_copy3;
 $42 = $$byval_copy2;
 $43 = HEAP32[((9832))>>2]|0;
 $44 = $strYouWon;
 $45 = ($4);
 HEAP32[$45>>2] = 31;
 $46 = (($4) + 4|0);
 HEAP32[$46>>2] = 0;
 $47 = $$byval_copy4;
 $48 = $$byval_copy4;
 $49 = $4;
 ;HEAP32[$48+0>>2]=HEAP32[$49+0>>2]|0;HEAP32[$48+4>>2]=HEAP32[$49+4>>2]|0;
 _asciiDrawText($43,$44,$$byval_copy4);
 $50 = $$byval_copy4;
 $51 = HEAP32[((9832))>>2]|0;
 $52 = $strPressEnter;
 $53 = ($5);
 HEAP32[$53>>2] = 28;
 $54 = (($5) + 4|0);
 HEAP32[$54>>2] = 22;
 $55 = $$byval_copy5;
 $56 = $$byval_copy5;
 $57 = $5;
 ;HEAP32[$56+0>>2]=HEAP32[$57+0>>2]|0;HEAP32[$56+4>>2]=HEAP32[$57+4>>2]|0;
 _asciiDrawText($51,$52,$$byval_copy5);
 $58 = $$byval_copy5;
 $59 = ($buffer);
 $60 = HEAP32[(((9832) + 484|0))>>2]|0;
 $61 = HEAP32[(((9832) + 344|0))>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $60;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $61;
 (_sprintf(($59|0),((9776)|0),($vararg_buffer|0))|0);
 $62 = HEAP32[((9832))>>2]|0;
 $63 = ($buffer);
 $64 = ($6);
 HEAP32[$64>>2] = 23;
 $65 = (($6) + 4|0);
 HEAP32[$65>>2] = 1;
 $66 = $$byval_copy6;
 $67 = $$byval_copy6;
 $68 = $6;
 ;HEAP32[$67+0>>2]=HEAP32[$68+0>>2]|0;HEAP32[$67+4>>2]=HEAP32[$68+4>>2]|0;
 _asciiDrawTextColored($62,$63,$$byval_copy6,7,0);
 $69 = $$byval_copy6;
 $70 = HEAP8[(((9832) + 416|0))]|0;
 $i = $70;
 $71 = $i;
 $72 = $71&255;
 $73 = HEAP8[(((9832) + 340|0))]|0;
 $74 = $73&255;
 $75 = ($72|0)<($74|0);
 if ($75) {
  $76 = HEAP32[((9832))>>2]|0;
  $77 = ($7);
  HEAP8[$77] = 62;
  $78 = (($7) + 1|0);
  HEAP8[$78] = 7;
  $79 = (($7) + 2|0);
  HEAP8[$79] = 0;
  $80 = (($7) + 3|0);
  HEAP8[$80] = 0;
  $81 = ($8);
  HEAP32[$81>>2] = 23;
  $82 = (($8) + 4|0);
  $83 = $i;
  $84 = $83&255;
  $85 = $84<<2;
  $86 = (3 + ($85))|0;
  HEAP32[$82>>2] = $86;
  $87 = $$byval_copy7;
  $88 = $$byval_copy7;
  $89 = $7;
  ;HEAP8[$88+0|0]=HEAP8[$89+0|0]|0;HEAP8[$88+1|0]=HEAP8[$89+1|0]|0;HEAP8[$88+2|0]=HEAP8[$89+2|0]|0;HEAP8[$88+3|0]=HEAP8[$89+3|0]|0;
  $90 = $$byval_copy8;
  $91 = $$byval_copy8;
  $92 = $8;
  ;HEAP32[$91+0>>2]=HEAP32[$92+0>>2]|0;HEAP32[$91+4>>2]=HEAP32[$92+4>>2]|0;
  _asciiDrawChar($76,$$byval_copy7,$$byval_copy8);
  $93 = $$byval_copy8;
  $94 = $$byval_copy7;
  $95 = HEAP32[((9832))>>2]|0;
  $96 = ($9);
  HEAP8[$96] = 60;
  $97 = (($9) + 1|0);
  HEAP8[$97] = 7;
  $98 = (($9) + 2|0);
  HEAP8[$98] = 0;
  $99 = (($9) + 3|0);
  HEAP8[$99] = 0;
  $100 = ($10);
  HEAP32[$100>>2] = 57;
  $101 = (($10) + 4|0);
  $102 = $i;
  $103 = $102&255;
  $104 = $103<<2;
  $105 = (3 + ($104))|0;
  HEAP32[$101>>2] = $105;
  $106 = $$byval_copy9;
  $107 = $$byval_copy9;
  $108 = $9;
  ;HEAP8[$107+0|0]=HEAP8[$108+0|0]|0;HEAP8[$107+1|0]=HEAP8[$108+1|0]|0;HEAP8[$107+2|0]=HEAP8[$108+2|0]|0;HEAP8[$107+3|0]=HEAP8[$108+3|0]|0;
  $109 = $$byval_copy10;
  $110 = $$byval_copy10;
  $111 = $10;
  ;HEAP32[$110+0>>2]=HEAP32[$111+0>>2]|0;HEAP32[$110+4>>2]=HEAP32[$111+4>>2]|0;
  _asciiDrawChar($95,$$byval_copy9,$$byval_copy10);
  $112 = $$byval_copy10;
  $113 = $$byval_copy9;
 }
 $i = 0;
 while(1) {
  $114 = $i;
  $115 = $114&255;
  $116 = ($115|0)<(5);
  if (!($116)) {
   break;
  }
  $117 = $i;
  $118 = $117&255;
  $119 = HEAP8[(((9832) + 340|0))]|0;
  $120 = $119&255;
  $121 = ($118|0)<($120|0);
  if ($121) {
   $122 = $i;
   $123 = $122&255;
   $124 = ((((9832) + 220|0)) + (($123*24)|0)|0);
   $125 = ($11);
   HEAP32[$125>>2] = 24;
   $126 = (($11) + 4|0);
   $127 = $i;
   $128 = $127&255;
   $129 = $128<<2;
   $130 = (2 + ($129))|0;
   HEAP32[$126>>2] = $130;
   $131 = $$byval_copy11;
   $132 = $$byval_copy11;
   $133 = $11;
   ;HEAP32[$132+0>>2]=HEAP32[$133+0>>2]|0;HEAP32[$132+4>>2]=HEAP32[$133+4>>2]|0;
   _drawElementityProfile($124,$$byval_copy11);
   $134 = $$byval_copy11;
  } else {
   $135 = HEAP32[((9832))>>2]|0;
   $136 = ($12);
   $137 = ($136);
   HEAP32[$137>>2] = 24;
   $138 = (($136) + 4|0);
   $139 = $i;
   $140 = $139&255;
   $141 = $140<<2;
   $142 = (2 + ($141))|0;
   HEAP32[$138>>2] = $142;
   $143 = (($12) + 8|0);
   $144 = ($143);
   HEAP32[$144>>2] = 3;
   $145 = (($143) + 4|0);
   HEAP32[$145>>2] = 3;
   $146 = $$byval_copy12;
   $147 = $$byval_copy12;
   $148 = $12;
   ;HEAP32[$147+0>>2]=HEAP32[$148+0>>2]|0;HEAP32[$147+4>>2]=HEAP32[$148+4>>2]|0;HEAP32[$147+8>>2]=HEAP32[$148+8>>2]|0;HEAP32[$147+12>>2]=HEAP32[$148+12>>2]|0;
   _asciiDrawFilledRectangleColored($135,$$byval_copy12,7,0);
   $149 = $$byval_copy12;
  }
  $150 = $i;
  $151 = (($150) + 1)<<24>>24;
  $i = $151;
 }
 STACKTOP = sp;return;
}
function _fightWon_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $overGameScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $overGameScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = HEAP32[(((9832) + 60|0))>>2]|0;
 $5 = ($4|0)==(255);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $2;
 $7 = ($6<<24>>24)!=(0);
 if ($7) {
  STACKTOP = sp;return;
 }
 $8 = $1;
 $9 = $8&255;
 $10 = ($9|0)==(2);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 HEAP32[(((9832) + 76|0))>>2] = 0;
 $11 = $overGameScreen$byval_copy;
 $12 = $overGameScreen$byval_copy;
 $13 = (18016);
 ;HEAP32[$12+0>>2]=HEAP32[$13+0>>2]|0;HEAP32[$12+4>>2]=HEAP32[$13+4>>2]|0;HEAP32[$12+8>>2]=HEAP32[$13+8>>2]|0;HEAP32[$12+12>>2]=HEAP32[$13+12>>2]|0;HEAP32[$12+16>>2]=HEAP32[$13+16>>2]|0;HEAP32[$12+20>>2]=HEAP32[$13+20>>2]|0;
 _switchToScreen($overGameScreen$byval_copy);
 $14 = $overGameScreen$byval_copy;
 STACKTOP = sp;return;
}
function _fightWon_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _fightWon_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _initGame($seed) {
 $seed = $seed|0;
 var $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $tmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $seed;
 $2 = HEAP32[((9832))>>2]|0;
 $tmp = $2;
 _memset(((9832)|0),0,5024)|0;
 $3 = $tmp;
 HEAP32[((9832))>>2] = $3;
 HEAP8[(((9832) + 3480|0))] = 0;
 $4 = $1;
 HEAP32[(((9832) + 3484|0))>>2] = $4;
 _generateElementities();
 HEAP8[(((9832) + 340|0))] = 1;
 HEAP32[(((9832) + 344|0))>>2] = 20;
 $5 = (_getRandom()|0);
 $6 = (($5|0) % 24)&-1;
 $7 = ((((9832) + 3488|0)) + ($6<<6)|0);
 $8 = (($7) + 40|0);
 $9 = $8;
 ;HEAP32[(((9832) + 220|0))+0>>2]=HEAP32[$9+0>>2]|0;HEAP32[(((9832) + 220|0))+4>>2]=HEAP32[$9+4>>2]|0;HEAP32[(((9832) + 220|0))+8>>2]=HEAP32[$9+8>>2]|0;HEAP32[(((9832) + 220|0))+12>>2]=HEAP32[$9+12>>2]|0;HEAP32[(((9832) + 220|0))+16>>2]=HEAP32[$9+16>>2]|0;HEAP32[(((9832) + 220|0))+20>>2]=HEAP32[$9+20>>2]|0;
 $10 = HEAP32[(((9832) + 236|0))>>2]|0;
 HEAP32[(((9832) + 232|0))>>2] = $10;
 _levelUpElementity((((9832) + 220|0)));
 _goToLevel(0);
 STACKTOP = sp;return;
}
function _levelUpElementity($e) {
 $e = $e|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0.0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0, $50 = 0.0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $8 = 0, $9 = 0, $i = 0, $info = 0, $minStat = 0, $range = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $1 = $e;
 $2 = $1;
 $3 = (($2) + 6|0);
 $4 = HEAP8[$3]|0;
 $5 = $4&255;
 $6 = ((((9832) + 3488|0)) + ($5<<6)|0);
 $info = $6;
 $7 = $1;
 $8 = (($7) + 7|0);
 $9 = HEAP8[$8]|0;
 $10 = (($9) + 1)<<24>>24;
 HEAP8[$8] = $10;
 $i = 0;
 while(1) {
  $11 = $i;
  $12 = $11&255;
  $13 = ($12|0)<(6);
  if (!($13)) {
   break;
  }
  $14 = $i;
  $15 = $14&255;
  $16 = ((15144) + ($15<<1)|0);
  $17 = ($16);
  $18 = HEAP8[$17]|0;
  $minStat = $18;
  $19 = $i;
  $20 = $19&255;
  $21 = ((15144) + ($20<<1)|0);
  $22 = (($21) + 1|0);
  $23 = HEAP8[$22]|0;
  $24 = $23&255;
  $25 = $minStat;
  $26 = $25&255;
  $27 = (($24) - ($26))|0;
  $28 = (($27) + 1)|0;
  $29 = $28&255;
  $range = $29;
  $30 = $minStat;
  $31 = $30&255;
  $32 = (+($31|0));
  $33 = $i;
  $34 = $33&255;
  $35 = $info;
  $36 = (($35) + 16|0);
  $37 = (($36) + ($34<<2)|0);
  $38 = +HEAPF32[$37>>2];
  $39 = $range;
  $40 = $39&255;
  $41 = (+($40|0));
  $42 = $38 * $41;
  $43 = $1;
  $44 = (($43) + 7|0);
  $45 = HEAP8[$44]|0;
  $46 = $45&255;
  $47 = (+($46|0));
  $48 = $42 * $47;
  $49 = $48 * 0.400000005960464477539;
  $50 = $32 + $49;
  $51 = (~~(($50))&255);
  $52 = $i;
  $53 = $52&255;
  $54 = $1;
  $55 = ($54);
  $56 = (($55) + ($53)|0);
  HEAP8[$56] = $51;
  $57 = $i;
  $58 = (($57) + 1)<<24>>24;
  $i = $58;
 }
 $59 = $1;
 $60 = ($59);
 $61 = (($60) + 5|0);
 $62 = HEAP8[$61]|0;
 $63 = $1;
 $64 = (($63) + 8|0);
 HEAP8[$64] = $62;
 $65 = $info;
 $66 = $1;
 $67 = (($66) + 7|0);
 $68 = HEAP8[$67]|0;
 $69 = $68&255;
 $70 = (($69) + 1)|0;
 $71 = $70&255;
 $72 = (_getNextLevelExperience($65,$71)|0);
 $73 = $1;
 $74 = (($73) + 16|0);
 HEAP32[$74>>2] = $72;
 STACKTOP = sp;return;
}
function _goToLevel($levelID) {
 $levelID = $levelID|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 296|0;
 $2 = sp + 16|0;
 $1 = $levelID;
 $i = 0;
 while(1) {
  $3 = $i;
  $4 = $3&255;
  $5 = $1;
  $6 = $5&255;
  $7 = ($4|0)<=($6|0);
  if (!($7)) {
   break;
  }
  $8 = HEAP8[(((9832) + 3480|0))]|0;
  $9 = $8&255;
  $10 = $i;
  $11 = $10&255;
  $12 = ($9|0)<=($11|0);
  if ($12) {
   $13 = $i;
   $14 = $13&255;
   $15 = ((((9832) + 1272|0)) + (($14*276)|0)|0);
   $16 = HEAP32[(((9832) + 3484|0))>>2]|0;
   $17 = $i;
   $18 = $17&255;
   $19 = ($18*234)|0;
   $20 = (($16) + ($19))|0;
   $21 = $i;
   $22 = $i;
   $23 = $22&255;
   $24 = ((14944) + (($23*20)|0)|0);
   $25 = ($24);
   $26 = HEAP32[$25>>2]|0;
   $27 = $i;
   $28 = $27&255;
   $29 = ((14944) + (($28*20)|0)|0);
   $30 = (($29) + 4|0);
   $31 = HEAP8[$30]|0;
   $32 = $i;
   $33 = $32&255;
   $34 = ((14944) + (($33*20)|0)|0);
   $35 = (($34) + 5|0);
   $36 = HEAP8[$35]|0;
   $37 = $i;
   $38 = $37&255;
   $39 = ((14944) + (($38*20)|0)|0);
   $40 = (($39) + 8|0);
   $41 = HEAP32[$40>>2]|0;
   $42 = $i;
   $43 = $42&255;
   $44 = ((14944) + (($43*20)|0)|0);
   $45 = (($44) + 12|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = $i;
   $48 = $47&255;
   $49 = ((14944) + (($48*20)|0)|0);
   $50 = (($49) + 16|0);
   $51 = HEAP8[$50]|0;
   _generateWorld($2,$20,$21,$26,$31,$36,$41,$46,$51);
   $52 = $15;
   $53 = $2;
   _memcpy(($52|0),($53|0),276)|0;
  }
  $54 = $i;
  $55 = (($54) + 1)<<24>>24;
  $i = $55;
 }
 $56 = $1;
 $57 = $56&255;
 $58 = (($57) + 1)|0;
 $59 = HEAP8[(((9832) + 3480|0))]|0;
 $60 = $59&255;
 $61 = ($58|0)>=($60|0);
 if (!($61)) {
  $66 = $1;
  $67 = $66&255;
  $68 = ((((9832) + 1272|0)) + (($67*276)|0)|0);
  HEAP32[(((9832) + 348|0))>>2] = $68;
  $69 = $1;
  HEAP8[(((9832) + 352|0))] = $69;
  HEAP8[(((9832) + 4|0))] = 1;
  STACKTOP = sp;return;
 }
 $62 = $1;
 $63 = $62&255;
 $64 = (($63) + 1)|0;
 $65 = $64&255;
 HEAP8[(((9832) + 3480|0))] = $65;
 $66 = $1;
 $67 = $66&255;
 $68 = ((((9832) + 1272|0)) + (($67*276)|0)|0);
 HEAP32[(((9832) + 348|0))>>2] = $68;
 $69 = $1;
 HEAP8[(((9832) + 352|0))] = $69;
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _freeGame() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0;
 var $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1208|0;
 $$byval_copy1 = sp;
 $$byval_copy = sp + 280|0;
 $1 = $$byval_copy;
 $2 = $$byval_copy;
 $3 = (((9832) + 356|0));
 _memcpy(($2|0),($3|0),916)|0;
 _freeArenaWorld($$byval_copy);
 $4 = $$byval_copy;
 $i = 0;
 while(1) {
  $5 = $i;
  $6 = $5&255;
  $7 = HEAP8[(((9832) + 3480|0))]|0;
  $8 = $7&255;
  $9 = ($6|0)<($8|0);
  if (!($9)) {
   break;
  }
  $10 = $i;
  $11 = $10&255;
  $12 = ((((9832) + 1272|0)) + (($11*276)|0)|0);
  $13 = $$byval_copy1;
  $14 = $$byval_copy1;
  $15 = $12;
  _memcpy(($14|0),($15|0),276)|0;
  _freeOverWorld($$byval_copy1);
  $16 = $$byval_copy1;
  $17 = $i;
  $18 = (($17) + 1)<<24>>24;
  $i = $18;
 }
 STACKTOP = sp;return;
}
function _generateName($name) {
 $name = $name|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $8 = 0, $9 = 0, $c = 0, $i = 0, $j = 0;
 var $lastConsonant = 0, $len = 0, $r = 0, $v = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $1 = $name;
 $v = (15104);
 $c = (15112);
 $r = (15136);
 $2 = (_getRandom()|0);
 $3 = (($2|0) % 6)&-1;
 $4 = (3 + ($3))|0;
 $5 = $4&255;
 $len = $5;
 $lastConsonant = 0;
 $i = 0;
 while(1) {
  $6 = $i;
  $7 = $6&255;
  $8 = $len;
  $9 = $8&255;
  $10 = ($7|0)<($9|0);
  if (!($10)) {
   break;
  }
  $11 = $lastConsonant;
  $12 = $11 << 24 >> 24;
  $13 = ($12|0)!=(0);
  if ($13) {
   $14 = (_getRandom()|0);
   $15 = (($14|0) % 10)&-1;
   $16 = ($15|0)>(0);
   if ($16) {
    label = 6;
   } else {
    label = 7;
   }
  } else {
   $17 = (_getRandom()|0);
   $18 = (($17|0) % 15)&-1;
   $19 = ($18|0)==(0);
   if ($19) {
    label = 6;
   } else {
    label = 7;
   }
  }
  if ((label|0) == 6) {
   label = 0;
   $20 = (_getRandom()|0);
   $21 = (($20|0) % 5)&-1;
   $22 = $v;
   $23 = (($22) + ($21)|0);
   $24 = HEAP8[$23]|0;
   $25 = $i;
   $26 = $25&255;
   $27 = $1;
   $28 = (($27) + ($26)|0);
   HEAP8[$28] = $24;
   $lastConsonant = 0;
  }
  else if ((label|0) == 7) {
   label = 0;
   $29 = (_getRandom()|0);
   $30 = (($29|0) % 21)&-1;
   $31 = $c;
   $32 = (($31) + ($30)|0);
   $33 = HEAP8[$32]|0;
   $34 = $i;
   $35 = $34&255;
   $36 = $1;
   $37 = (($36) + ($35)|0);
   HEAP8[$37] = $33;
   $38 = (_getRandom()|0);
   $39 = (($38|0) % 4)&-1;
   $40 = ($39|0)>(0);
   if ($40) {
    $j = 0;
    while(1) {
     $41 = $j;
     $42 = $41&255;
     $43 = ($42|0)<(5);
     if (!($43)) {
      break;
     }
     $44 = $i;
     $45 = $44&255;
     $46 = $1;
     $47 = (($46) + ($45)|0);
     $48 = HEAP8[$47]|0;
     $49 = $48 << 24 >> 24;
     $50 = $j;
     $51 = $50&255;
     $52 = $r;
     $53 = (($52) + ($51)|0);
     $54 = HEAP8[$53]|0;
     $55 = $54 << 24 >> 24;
     $56 = ($49|0)==($55|0);
     if ($56) {
      $57 = $i;
      $58 = (($57) + -1)<<24>>24;
      $i = $58;
     }
     $59 = $j;
     $60 = (($59) + 1)<<24>>24;
     $j = $60;
    }
    $61 = $j;
    $62 = $61&255;
    $63 = ($62|0)==(5);
    if ($63) {
     $lastConsonant = 1;
    }
   } else {
    $lastConsonant = 1;
   }
  }
  $64 = $i;
  $65 = (($64) + 1)<<24>>24;
  $i = $65;
 }
 $66 = $len;
 $67 = $66&255;
 $68 = $1;
 $69 = (($68) + ($67)|0);
 HEAP8[$69] = 0;
 $70 = $1;
 $71 = ($70);
 $72 = HEAP8[$71]|0;
 $73 = $72 << 24 >> 24;
 $74 = (_toupper(($73|0))|0);
 $75 = $74&255;
 $76 = $1;
 $77 = ($76);
 HEAP8[$77] = $75;
 STACKTOP = sp;return;
}
function _getNextLevelExperience($info,$level) {
 $info = $info|0;
 $level = $level|0;
 var $1 = 0, $10 = 0, $11 = 0.0, $12 = 0, $13 = 0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $info;
 $2 = $level;
 $3 = $2;
 $4 = $3&255;
 $5 = $2;
 $6 = $5&255;
 $7 = Math_imul($4, $6)|0;
 $8 = $2;
 $9 = $8&255;
 $10 = (($7) + ($9))|0;
 $11 = (+($10|0));
 $12 = $1;
 $13 = (($12) + 12|0);
 $14 = +HEAPF32[$13>>2];
 $15 = $11 * $14;
 $16 = $15;
 $17 = $16 * 0.699999999999999955591;
 $18 = 20.0 + $17;
 $19 = (~~(($18))>>>0);
 STACKTOP = sp;return ($19|0);
}
function _getKillExperience($info,$level) {
 $info = $info|0;
 $level = $level|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $1 = $info;
 $2 = $level;
 $3 = $1;
 $4 = $2;
 $5 = (_getNextLevelExperience($3,$4)|0);
 $6 = (+($5>>>0));
 $7 = $6 * 0.300000011920928955078;
 $8 = (~~(($7))>>>0);
 STACKTOP = sp;return ($8|0);
}
function _generateElementity($agg$result,$id,$element) {
 $agg$result = $agg$result|0;
 $id = $id|0;
 $element = $element|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0.0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0.0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0.0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0.0, $168 = 0, $169 = 0, $17 = 0, $170 = 0.0;
 var $171 = 0.0, $172 = 0, $173 = 0.0, $174 = 0.0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0.0, $184 = 0, $185 = 0.0, $186 = 0.0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0.0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0.0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0.0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0.0;
 var $94 = 0, $95 = 0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $change = 0, $changes = 0, $i = 0, $info = 0, $minStat = 0, $newStat1 = 0, $newStat2 = 0, $range = 0, $stat1 = 0, $stat2 = 0, $stats = 0, dest = 0, label = 0, sp = 0;
 var src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 176|0;
 $info = sp + 16|0;
 $stats = sp + 80|0;
 $1 = $id;
 $2 = $element;
 $3 = ($info);
 $4 = ($3);
 _generateName($4);
 $5 = (_getRandom()|0);
 $6 = (($5|0) % 2)&-1;
 $7 = ($6|0)!=(0);
 $8 = $7 ? 97 : 65;
 $9 = (_getRandom()|0);
 $10 = (($9|0) % 26)&-1;
 $11 = (($8) + ($10))|0;
 $12 = $11&255;
 $13 = (($info) + 9|0);
 HEAP8[$13] = $12;
 $14 = $2;
 $15 = (($info) + 10|0);
 HEAP8[$15] = $14;
 $i = 0;
 while(1) {
  $16 = $i;
  $17 = $16&255;
  $18 = ($17|0)<(6);
  if (!($18)) {
   break;
  }
  $19 = $i;
  $20 = $19&255;
  $21 = ((15144) + ($20<<1)|0);
  $22 = ($21);
  $23 = HEAP8[$22]|0;
  $24 = $23&255;
  $25 = $i;
  $26 = $25&255;
  $27 = ((15144) + ($26<<1)|0);
  $28 = (($27) + 1|0);
  $29 = HEAP8[$28]|0;
  $30 = $29&255;
  $31 = $i;
  $32 = $31&255;
  $33 = ((15144) + ($32<<1)|0);
  $34 = ($33);
  $35 = HEAP8[$34]|0;
  $36 = $35&255;
  $37 = (($30) - ($36))|0;
  $38 = (($37) + 1)|0;
  $39 = (($38|0) / 2)&-1;
  $40 = (($24) + ($39))|0;
  $41 = (+($40|0));
  $42 = $i;
  $43 = $42&255;
  $44 = (($stats) + ($43<<2)|0);
  HEAPF32[$44>>2] = $41;
  $45 = $i;
  $46 = (($45) + 1)<<24>>24;
  $i = $46;
 }
 $47 = (_getRandom()|0);
 $48 = (($47|0) % 10)&-1;
 $49 = $48&255;
 $changes = $49;
 $i = 0;
 while(1) {
  $50 = $i;
  $51 = $50&255;
  $52 = $changes;
  $53 = $52&255;
  $54 = ($51|0)<($53|0);
  if (!($54)) {
   break;
  }
  $55 = (_getRandom()|0);
  $56 = (($55|0) % 3)&-1;
  $57 = ($56|0)>(0);
  $58 = $57 ? 20 : 30;
  $59 = $58&255;
  $change = $59;
  $60 = (_getRandom()|0);
  $61 = (($60|0) % 6)&-1;
  $62 = $61&255;
  $stat1 = $62;
  $63 = $stat1;
  $64 = $63&255;
  $65 = (($64) + 1)|0;
  $66 = (_getRandom()|0);
  $67 = (($66|0) % 5)&-1;
  $68 = (($65) + ($67))|0;
  $69 = (($68|0) % 6)&-1;
  $70 = $69&255;
  $stat2 = $70;
  $71 = $stat1;
  $72 = $71&255;
  $73 = (($stats) + ($72<<2)|0);
  $74 = +HEAPF32[$73>>2];
  $75 = $stat1;
  $76 = $75&255;
  $77 = (($stats) + ($76<<2)|0);
  $78 = +HEAPF32[$77>>2];
  $79 = $change;
  $80 = $79&255;
  $81 = (+($80|0));
  $82 = $81 / 100.0;
  $83 = $78 * $82;
  $84 = $74 + $83;
  $85 = (~~(($84))&255);
  $newStat1 = $85;
  $86 = $stat2;
  $87 = $86&255;
  $88 = (($stats) + ($87<<2)|0);
  $89 = +HEAPF32[$88>>2];
  $90 = $stat2;
  $91 = $90&255;
  $92 = (($stats) + ($91<<2)|0);
  $93 = +HEAPF32[$92>>2];
  $94 = $change;
  $95 = $94&255;
  $96 = (+($95|0));
  $97 = $96 / 100.0;
  $98 = $93 * $97;
  $99 = $89 - $98;
  $100 = (~~(($99))&255);
  $newStat2 = $100;
  $101 = $newStat1;
  $102 = $101&255;
  $103 = $stat1;
  $104 = $103&255;
  $105 = ((15144) + ($104<<1)|0);
  $106 = (($105) + 1|0);
  $107 = HEAP8[$106]|0;
  $108 = $107&255;
  $109 = ($102|0)<=($108|0);
  do {
   if ($109) {
    $110 = $newStat2;
    $111 = $110&255;
    $112 = $stat2;
    $113 = $112&255;
    $114 = ((15144) + ($113<<1)|0);
    $115 = ($114);
    $116 = HEAP8[$115]|0;
    $117 = $116&255;
    $118 = ($111|0)>=($117|0);
    if (!($118)) {
     break;
    }
    $119 = $newStat1;
    $120 = (+($119&255));
    $121 = $stat1;
    $122 = $121&255;
    $123 = (($stats) + ($122<<2)|0);
    HEAPF32[$123>>2] = $120;
    $124 = $newStat2;
    $125 = (+($124&255));
    $126 = $stat2;
    $127 = $126&255;
    $128 = (($stats) + ($127<<2)|0);
    HEAPF32[$128>>2] = $125;
   }
  } while(0);
  $129 = $i;
  $130 = (($129) + 1)<<24>>24;
  $i = $130;
 }
 $131 = (($info) + 12|0);
 HEAPF32[$131>>2] = 0.0;
 $i = 0;
 while(1) {
  $132 = $i;
  $133 = $132&255;
  $134 = ($133|0)<(6);
  if (!($134)) {
   break;
  }
  $135 = $i;
  $136 = $135&255;
  $137 = (($stats) + ($136<<2)|0);
  $138 = +HEAPF32[$137>>2];
  $139 = (~~(($138))&255);
  $140 = $i;
  $141 = $140&255;
  $142 = (($info) + 40|0);
  $143 = ($142);
  $144 = (($143) + ($141)|0);
  HEAP8[$144] = $139;
  $145 = $i;
  $146 = $145&255;
  $147 = ((15144) + ($146<<1)|0);
  $148 = ($147);
  $149 = HEAP8[$148]|0;
  $minStat = $149;
  $150 = $i;
  $151 = $150&255;
  $152 = ((15144) + ($151<<1)|0);
  $153 = (($152) + 1|0);
  $154 = HEAP8[$153]|0;
  $155 = $154&255;
  $156 = $minStat;
  $157 = $156&255;
  $158 = (($155) - ($157))|0;
  $159 = (($158) + 1)|0;
  $160 = $159&255;
  $range = $160;
  $161 = $i;
  $162 = $161&255;
  $163 = (($info) + 40|0);
  $164 = ($163);
  $165 = (($164) + ($162)|0);
  $166 = HEAP8[$165]|0;
  $167 = (+($166&255));
  $168 = $minStat;
  $169 = $168&255;
  $170 = (+($169|0));
  $171 = $167 - $170;
  $172 = $range;
  $173 = (+($172&255));
  $174 = $171 / $173;
  $175 = $i;
  $176 = $175&255;
  $177 = (($info) + 16|0);
  $178 = (($177) + ($176<<2)|0);
  HEAPF32[$178>>2] = $174;
  $179 = $i;
  $180 = $179&255;
  $181 = (($info) + 16|0);
  $182 = (($181) + ($180<<2)|0);
  $183 = +HEAPF32[$182>>2];
  $184 = (($info) + 12|0);
  $185 = +HEAPF32[$184>>2];
  $186 = $185 + $183;
  HEAPF32[$184>>2] = $186;
  $187 = $i;
  $188 = (($187) + 1)<<24>>24;
  $i = $188;
 }
 $189 = $1;
 $190 = (($info) + 40|0);
 $191 = (($190) + 6|0);
 HEAP8[$191] = $189;
 $192 = (($info) + 40|0);
 $193 = (($192) + 12|0);
 HEAP32[$193>>2] = 0;
 $194 = (($info) + 40|0);
 $195 = ($194);
 $196 = (($195) + 5|0);
 $197 = HEAP8[$196]|0;
 $198 = (($info) + 40|0);
 $199 = (($198) + 8|0);
 HEAP8[$199] = $197;
 $200 = (($info) + 40|0);
 $201 = (($200) + 7|0);
 HEAP8[$201] = -1;
 $202 = (($info) + 40|0);
 $203 = (($202) + 20|0);
 HEAP32[$203>>2] = 0;
 $204 = (($info) + 40|0);
 _levelUpElementity($204);
 $205 = $agg$result;
 $206 = $info;
 dest=$205+0|0; src=$206+0|0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
 STACKTOP = sp;return;
}
function _generateElementities() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, dest = 0, label = 0, sp = 0;
 var src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 72|0;
 $1 = sp + 8|0;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = $2&255;
  $4 = ($3|0)<(24);
  if (!($4)) {
   break;
  }
  $5 = $i;
  $6 = $5&255;
  $7 = ((((9832) + 3488|0)) + ($6<<6)|0);
  $8 = $i;
  $9 = $i;
  $10 = $9&255;
  $11 = (($10|0) / 4)&-1;
  $12 = $11&255;
  _generateElementity($1,$8,$12);
  $13 = $7;
  $14 = $1;
  dest=$13+0|0; src=$14+0|0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
  $15 = $i;
  $16 = (($15) + 1)<<24>>24;
  $i = $16;
 }
 STACKTOP = sp;return;
}
function _getEffect($attackElement,$victimElement) {
 $attackElement = $attackElement|0;
 $victimElement = $victimElement|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = $attackElement;
 $3 = $victimElement;
 $4 = $2;
 $5 = $4&255;
 $6 = ($5*6)|0;
 $7 = $3;
 $8 = $7&255;
 $9 = (($6) + ($8))|0;
 $10 = (15160 + ($9)|0);
 $11 = HEAP8[$10]|0;
 $12 = $11 << 24 >> 24;
 if ((($12|0) == 35)) {
  $1 = 1;
 } else if ((($12|0) == 89)) {
  $1 = 2;
 } else if ((($12|0) == 78)) {
  $1 = 0;
 } else {
  $1 = 0;
 }
 $13 = $1;
 STACKTOP = sp;return ($13|0);
}
function _damageElementity($attacker,$victim) {
 $attacker = $attacker|0;
 $victim = $victim|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0.0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0.0, $45 = 0.0;
 var $46 = 0.0, $47 = 0.0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0.0, $52 = 0.0, $53 = 0, $54 = 0, $55 = 0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0, $6 = 0, $60 = 0.0, $61 = 0, $62 = 0.0, $63 = 0.0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $9 = 0, $damage = 0.0, $effect = 0, $iDamage = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $1 = $attacker;
 $2 = $victim;
 $3 = $1;
 $4 = ($3);
 $5 = ($4);
 $6 = HEAP8[$5]|0;
 $7 = $6&255;
 $8 = (_getRandom()|0);
 $9 = $1;
 $10 = ($9);
 $11 = (($10) + 1|0);
 $12 = HEAP8[$11]|0;
 $13 = $12&255;
 $14 = (1)>($13|0);
 if ($14) {
  $20 = 1;
 } else {
  $15 = $1;
  $16 = ($15);
  $17 = (($16) + 1|0);
  $18 = HEAP8[$17]|0;
  $19 = $18&255;
  $20 = $19;
 }
 $21 = (($8|0) % ($20|0))&-1;
 $22 = (($7) + ($21))|0;
 $23 = (+($22|0));
 $damage = $23;
 $24 = $1;
 $25 = (($24) + 6|0);
 $26 = HEAP8[$25]|0;
 $27 = $26&255;
 $28 = ((((9832) + 3488|0)) + ($27<<6)|0);
 $29 = (($28) + 10|0);
 $30 = HEAP8[$29]|0;
 $31 = $2;
 $32 = (($31) + 6|0);
 $33 = HEAP8[$32]|0;
 $34 = $33&255;
 $35 = ((((9832) + 3488|0)) + ($34<<6)|0);
 $36 = (($35) + 10|0);
 $37 = HEAP8[$36]|0;
 $38 = (_getEffect($30,$37)|0);
 $effect = $38;
 $39 = $2;
 $40 = ($39);
 $41 = (($40) + 3|0);
 $42 = HEAP8[$41]|0;
 $43 = $42&255;
 $44 = (+($43|0));
 $45 = $44 / 2.0;
 $46 = $damage;
 $47 = $46 - $45;
 $damage = $47;
 $48 = $effect;
 $49 = $48&255;
 $50 = ($49|0)==(0);
 if ($50) {
  $51 = $damage;
  $52 = $51 * 0.5;
  $damage = $52;
 } else {
  $53 = $effect;
  $54 = $53&255;
  $55 = ($54|0)==(2);
  if ($55) {
   $56 = $damage;
   $57 = $56 * 1.5;
   $damage = $57;
  }
 }
 $58 = $damage;
 $59 = (~~(($58))&255);
 $iDamage = $59;
 $60 = $damage;
 $61 = $iDamage;
 $62 = (+($61&255));
 $63 = $60 - $62;
 $64 = $63 >= 0.5;
 if ($64) {
  $65 = $iDamage;
  $66 = (($65) + 1)<<24>>24;
  $iDamage = $66;
 }
 $67 = $iDamage;
 $68 = $67&255;
 $69 = ($68|0)==(0);
 if ($69) {
  $iDamage = 1;
 }
 $70 = $iDamage;
 $71 = $70&255;
 $72 = $2;
 $73 = (($72) + 8|0);
 $74 = HEAP8[$73]|0;
 $75 = $74&255;
 $76 = ($71|0)>($75|0);
 if ($76) {
  $77 = $2;
  $78 = (($77) + 8|0);
  HEAP8[$78] = 0;
  STACKTOP = sp;return;
 } else {
  $79 = $iDamage;
  $80 = $79&255;
  $81 = $2;
  $82 = (($81) + 8|0);
  $83 = HEAP8[$82]|0;
  $84 = $83&255;
  $85 = (($84) - ($80))|0;
  $86 = $85&255;
  HEAP8[$82] = $86;
  STACKTOP = sp;return;
 }
}
function _getElementColor($element) {
 $element = $element|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $element;
 $2 = $1;
 $3 = $2&255;
 $4 = (15200 + ($3)|0);
 $5 = HEAP8[$4]|0;
 STACKTOP = sp;return ($5|0);
}
function _getElementForeColor($element) {
 $element = $element|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $element;
 $2 = $1;
 $3 = $2&255;
 $4 = (15208 + ($3)|0);
 $5 = HEAP8[$4]|0;
 STACKTOP = sp;return ($5|0);
}
function _drawElementity($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $info = 0, $pos$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $pos$byval_copy = sp;
 $$byval_copy = sp + 8|0;
 $2 = sp + 32|0;
 $1 = $e;
 $3 = $1;
 $4 = (($3) + 6|0);
 $5 = HEAP8[$4]|0;
 $6 = $5&255;
 $7 = ((((9832) + 3488|0)) + ($6<<6)|0);
 $info = $7;
 $8 = HEAP32[((9832))>>2]|0;
 $9 = ($2);
 $10 = $info;
 $11 = (($10) + 9|0);
 $12 = HEAP8[$11]|0;
 HEAP8[$9] = $12;
 $13 = (($2) + 1|0);
 $14 = $info;
 $15 = (($14) + 10|0);
 $16 = HEAP8[$15]|0;
 $17 = (_getElementColor($16)|0);
 HEAP8[$13] = $17;
 $18 = (($2) + 2|0);
 $19 = $info;
 $20 = (($19) + 10|0);
 $21 = HEAP8[$20]|0;
 $22 = (_getElementForeColor($21)|0);
 HEAP8[$18] = $22;
 $23 = (($2) + 3|0);
 HEAP8[$23] = 0;
 $24 = $$byval_copy;
 $25 = $$byval_copy;
 $26 = $2;
 ;HEAP8[$25+0|0]=HEAP8[$26+0|0]|0;HEAP8[$25+1|0]=HEAP8[$26+1|0]|0;HEAP8[$25+2|0]=HEAP8[$26+2|0]|0;HEAP8[$25+3|0]=HEAP8[$26+3|0]|0;
 $27 = $pos$byval_copy;
 $28 = $pos$byval_copy;
 $29 = $pos;
 ;HEAP32[$28+0>>2]=HEAP32[$29+0>>2]|0;HEAP32[$28+4>>2]=HEAP32[$29+4>>2]|0;
 _asciiDrawChar($8,$$byval_copy,$pos$byval_copy);
 $30 = $pos$byval_copy;
 $31 = $$byval_copy;
 STACKTOP = sp;return;
}
function _drawElementityHP($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0;
 var $115 = 0, $116 = 0, $117 = 0, $118 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0.0, $74 = 0, $75 = 0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
 var $buffer = 0, $chars = 0, $hp = 0, $i = 0, $maxHP = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 88|0;
 $$byval_copy1 = sp;
 $$byval_copy = sp + 8|0;
 $buffer = sp + 24|0;
 $2 = sp + 72|0;
 $3 = sp + 80|0;
 $1 = $e;
 $4 = $buffer;
 dest=$4+0|0; src=(15224)+0|0; stop=dest+10|0; do { HEAP8[dest]=HEAP8[src]|0; dest=dest+1|0; src=src+1|0; } while ((dest|0) < (stop|0));;
 $5 = $1;
 $6 = (($5) + 8|0);
 $7 = HEAP8[$6]|0;
 $hp = $7;
 $8 = $1;
 $9 = ($8);
 $10 = (($9) + 5|0);
 $11 = HEAP8[$10]|0;
 $maxHP = $11;
 $12 = $hp;
 $13 = $12&255;
 $14 = (($13|0) / 100)&-1;
 $15 = (($14|0) % 10)&-1;
 $16 = (48 + ($15))|0;
 $17 = $16&255;
 $18 = (($buffer) + 1|0);
 HEAP8[$18] = $17;
 $19 = $hp;
 $20 = $19&255;
 $21 = (($20|0) / 10)&-1;
 $22 = (($21|0) % 10)&-1;
 $23 = (48 + ($22))|0;
 $24 = $23&255;
 $25 = (($buffer) + 2|0);
 HEAP8[$25] = $24;
 $26 = $hp;
 $27 = $26&255;
 $28 = (($27|0) % 10)&-1;
 $29 = (48 + ($28))|0;
 $30 = $29&255;
 $31 = (($buffer) + 3|0);
 HEAP8[$31] = $30;
 $32 = $maxHP;
 $33 = $32&255;
 $34 = (($33|0) / 100)&-1;
 $35 = (($34|0) % 10)&-1;
 $36 = (48 + ($35))|0;
 $37 = $36&255;
 $38 = (($buffer) + 5|0);
 HEAP8[$38] = $37;
 $39 = $maxHP;
 $40 = $39&255;
 $41 = (($40|0) / 10)&-1;
 $42 = (($41|0) % 10)&-1;
 $43 = (48 + ($42))|0;
 $44 = $43&255;
 $45 = (($buffer) + 6|0);
 HEAP8[$45] = $44;
 $46 = $maxHP;
 $47 = $46&255;
 $48 = (($47|0) % 10)&-1;
 $49 = (48 + ($48))|0;
 $50 = $49&255;
 $51 = (($buffer) + 7|0);
 HEAP8[$51] = $50;
 $52 = (($buffer) + 1|0);
 $53 = HEAP8[$52]|0;
 $54 = $53 << 24 >> 24;
 $55 = ($54|0)==(48);
 if ($55) {
  $56 = (($buffer) + 1|0);
  HEAP8[$56] = 32;
  $57 = (($buffer) + 2|0);
  $58 = HEAP8[$57]|0;
  $59 = $58 << 24 >> 24;
  $60 = ($59|0)==(48);
  if ($60) {
   $61 = (($buffer) + 2|0);
   HEAP8[$61] = 32;
  }
 }
 $62 = (($buffer) + 5|0);
 $63 = HEAP8[$62]|0;
 $64 = $63 << 24 >> 24;
 $65 = ($64|0)==(48);
 if ($65) {
  $66 = (($buffer) + 5|0);
  HEAP8[$66] = 32;
  $67 = (($buffer) + 6|0);
  $68 = HEAP8[$67]|0;
  $69 = $68 << 24 >> 24;
  $70 = ($69|0)==(48);
  if ($70) {
   $71 = (($buffer) + 6|0);
   HEAP8[$71] = 32;
  }
 }
 $72 = $hp;
 $73 = (+($72&255));
 $74 = $maxHP;
 $75 = $74&255;
 $76 = (+($75|0));
 $77 = $73 / $76;
 $78 = $77 * 9.0;
 $79 = (~~(($78))&255);
 $chars = $79;
 $i = 0;
 while(1) {
  $80 = $i;
  $81 = $80&255;
  $82 = ($81|0)<(9);
  if (!($82)) {
   break;
  }
  $83 = HEAP32[((9832))>>2]|0;
  $84 = ($2);
  $85 = $i;
  $86 = $85&255;
  $87 = (($buffer) + ($86)|0);
  $88 = HEAP8[$87]|0;
  HEAP8[$84] = $88;
  $89 = (($2) + 1|0);
  $90 = $i;
  $91 = $90&255;
  $92 = $chars;
  $93 = $92&255;
  $94 = ($91|0)<($93|0);
  $95 = $94&1;
  $96 = (15216 + ($95)|0);
  $97 = HEAP8[$96]|0;
  HEAP8[$89] = $97;
  $98 = (($2) + 2|0);
  HEAP8[$98] = 0;
  $99 = (($2) + 3|0);
  HEAP8[$99] = 0;
  $100 = ($3);
  $101 = ($pos);
  $102 = HEAP32[$101>>2]|0;
  $103 = $i;
  $104 = $103&255;
  $105 = (($102) + ($104))|0;
  HEAP32[$100>>2] = $105;
  $106 = (($3) + 4|0);
  $107 = (($pos) + 4|0);
  $108 = HEAP32[$107>>2]|0;
  HEAP32[$106>>2] = $108;
  $109 = $$byval_copy;
  $110 = $$byval_copy;
  $111 = $2;
  ;HEAP8[$110+0|0]=HEAP8[$111+0|0]|0;HEAP8[$110+1|0]=HEAP8[$111+1|0]|0;HEAP8[$110+2|0]=HEAP8[$111+2|0]|0;HEAP8[$110+3|0]=HEAP8[$111+3|0]|0;
  $112 = $$byval_copy1;
  $113 = $$byval_copy1;
  $114 = $3;
  ;HEAP32[$113+0>>2]=HEAP32[$114+0>>2]|0;HEAP32[$113+4>>2]=HEAP32[$114+4>>2]|0;
  _asciiDrawChar($83,$$byval_copy,$$byval_copy1);
  $115 = $$byval_copy1;
  $116 = $$byval_copy;
  $117 = $i;
  $118 = (($117) + 1)<<24>>24;
  $i = $118;
 }
 STACKTOP = sp;return;
}
function _drawElementityName($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $info = 0, $len = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $$byval_copy = sp;
 $2 = sp + 32|0;
 $1 = $e;
 $3 = $1;
 $4 = (($3) + 6|0);
 $5 = HEAP8[$4]|0;
 $6 = $5&255;
 $7 = ((((9832) + 3488|0)) + ($6<<6)|0);
 $info = $7;
 $8 = $info;
 $9 = ($8);
 $10 = ($9);
 $11 = (_strlen(($10|0))|0);
 $len = $11;
 $12 = HEAP32[((9832))>>2]|0;
 $13 = $info;
 $14 = ($13);
 $15 = ($14);
 $16 = ($2);
 $17 = ($pos);
 $18 = HEAP32[$17>>2]|0;
 $19 = (($18) + 8)|0;
 $20 = $len;
 $21 = (($19) - ($20))|0;
 HEAP32[$16>>2] = $21;
 $22 = (($2) + 4|0);
 $23 = (($pos) + 4|0);
 $24 = HEAP32[$23>>2]|0;
 HEAP32[$22>>2] = $24;
 $25 = $info;
 $26 = (($25) + 10|0);
 $27 = HEAP8[$26]|0;
 $28 = (_getElementColor($27)|0);
 $29 = $info;
 $30 = (($29) + 10|0);
 $31 = HEAP8[$30]|0;
 $32 = (_getElementForeColor($31)|0);
 $33 = $$byval_copy;
 $34 = $$byval_copy;
 $35 = $2;
 ;HEAP32[$34+0>>2]=HEAP32[$35+0>>2]|0;HEAP32[$34+4>>2]=HEAP32[$35+4>>2]|0;
 _asciiDrawTextColored($12,$15,$$byval_copy,$28,$32);
 $36 = $$byval_copy;
 STACKTOP = sp;return;
}
function _drawElementityProfile($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0;
 var $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0;
 var $13 = 0, $130 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buffer = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_lifetime_bitcast = 0;
 var $vararg_lifetime_bitcast4 = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr5 = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, $vararg_ptr8 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0;
 $$byval_copy14 = sp;
 $$byval_copy13 = sp + 8|0;
 $$byval_copy12 = sp + 16|0;
 $$byval_copy11 = sp + 24|0;
 $$byval_copy10 = sp + 32|0;
 $$byval_copy = sp + 40|0;
 $vararg_buffer3 = sp + 56|0;
 $vararg_lifetime_bitcast4 = $vararg_buffer3;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $8 = HEAP32[((9832))>>2]|0;
 $9 = ($2);
 $10 = ($9);
 $11 = ($pos);
 $12 = HEAP32[$11>>2]|0;
 HEAP32[$10>>2] = $12;
 $13 = (($9) + 4|0);
 $14 = (($pos) + 4|0);
 $15 = HEAP32[$14>>2]|0;
 HEAP32[$13>>2] = $15;
 $16 = (($2) + 8|0);
 $17 = ($16);
 HEAP32[$17>>2] = 3;
 $18 = (($16) + 4|0);
 HEAP32[$18>>2] = 3;
 $19 = $$byval_copy;
 $20 = $$byval_copy;
 $21 = $2;
 ;HEAP32[$20+0>>2]=HEAP32[$21+0>>2]|0;HEAP32[$20+4>>2]=HEAP32[$21+4>>2]|0;HEAP32[$20+8>>2]=HEAP32[$21+8>>2]|0;HEAP32[$20+12>>2]=HEAP32[$21+12>>2]|0;
 _asciiDrawRectangleColored($8,$$byval_copy,7,0);
 $22 = $$byval_copy;
 $23 = $1;
 $24 = ($3);
 $25 = ($pos);
 $26 = HEAP32[$25>>2]|0;
 $27 = (($26) + 1)|0;
 HEAP32[$24>>2] = $27;
 $28 = (($3) + 4|0);
 $29 = (($pos) + 4|0);
 $30 = HEAP32[$29>>2]|0;
 $31 = (($30) + 1)|0;
 HEAP32[$28>>2] = $31;
 $32 = $$byval_copy10;
 $33 = $$byval_copy10;
 $34 = $3;
 ;HEAP32[$33+0>>2]=HEAP32[$34+0>>2]|0;HEAP32[$33+4>>2]=HEAP32[$34+4>>2]|0;
 _drawElementity($23,$$byval_copy10);
 $35 = $$byval_copy10;
 $36 = $1;
 $37 = ($4);
 $38 = ($pos);
 $39 = HEAP32[$38>>2]|0;
 $40 = (($39) + 5)|0;
 HEAP32[$37>>2] = $40;
 $41 = (($4) + 4|0);
 $42 = (($pos) + 4|0);
 $43 = HEAP32[$42>>2]|0;
 HEAP32[$41>>2] = $43;
 $44 = $$byval_copy11;
 $45 = $$byval_copy11;
 $46 = $4;
 ;HEAP32[$45+0>>2]=HEAP32[$46+0>>2]|0;HEAP32[$45+4>>2]=HEAP32[$46+4>>2]|0;
 _drawElementityName($36,$$byval_copy11);
 $47 = $$byval_copy11;
 $48 = $1;
 $49 = ($5);
 $50 = ($pos);
 $51 = HEAP32[$50>>2]|0;
 $52 = (($51) + 14)|0;
 HEAP32[$49>>2] = $52;
 $53 = (($5) + 4|0);
 $54 = (($pos) + 4|0);
 $55 = HEAP32[$54>>2]|0;
 HEAP32[$53>>2] = $55;
 $56 = $$byval_copy12;
 $57 = $$byval_copy12;
 $58 = $5;
 ;HEAP32[$57+0>>2]=HEAP32[$58+0>>2]|0;HEAP32[$57+4>>2]=HEAP32[$58+4>>2]|0;
 _drawElementityHP($48,$$byval_copy12);
 $59 = $$byval_copy12;
 $60 = ($buffer);
 $61 = $1;
 $62 = (($61) + 7|0);
 $63 = HEAP8[$62]|0;
 $64 = $63&255;
 $65 = $1;
 $66 = (($65) + 12|0);
 $67 = HEAP32[$66>>2]|0;
 $68 = $1;
 $69 = (($68) + 16|0);
 $70 = HEAP32[$69>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $64;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $67;
 $vararg_ptr2 = (($vararg_buffer) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $70;
 (_sprintf(($60|0),((15240)|0),($vararg_buffer|0))|0);
 $71 = HEAP32[((9832))>>2]|0;
 $72 = ($buffer);
 $73 = ($6);
 $74 = ($pos);
 $75 = HEAP32[$74>>2]|0;
 $76 = (($75) + 5)|0;
 HEAP32[$73>>2] = $76;
 $77 = (($6) + 4|0);
 $78 = (($pos) + 4|0);
 $79 = HEAP32[$78>>2]|0;
 $80 = (($79) + 1)|0;
 HEAP32[$77>>2] = $80;
 $81 = $$byval_copy13;
 $82 = $$byval_copy13;
 $83 = $6;
 ;HEAP32[$82+0>>2]=HEAP32[$83+0>>2]|0;HEAP32[$82+4>>2]=HEAP32[$83+4>>2]|0;
 _asciiDrawTextColored($71,$72,$$byval_copy13,7,0);
 $84 = $$byval_copy13;
 $85 = ($buffer);
 $86 = $1;
 $87 = ($86);
 $88 = ($87);
 $89 = HEAP8[$88]|0;
 $90 = $89&255;
 $91 = $1;
 $92 = ($91);
 $93 = ($92);
 $94 = HEAP8[$93]|0;
 $95 = $94&255;
 $96 = $1;
 $97 = ($96);
 $98 = (($97) + 1|0);
 $99 = HEAP8[$98]|0;
 $100 = $99&255;
 $101 = (($95) + ($100))|0;
 $102 = $1;
 $103 = ($102);
 $104 = (($103) + 2|0);
 $105 = HEAP8[$104]|0;
 $106 = $105&255;
 $107 = $1;
 $108 = ($107);
 $109 = (($108) + 3|0);
 $110 = HEAP8[$109]|0;
 $111 = $110&255;
 $112 = $1;
 $113 = ($112);
 $114 = (($113) + 4|0);
 $115 = HEAP8[$114]|0;
 $116 = $115&255;
 $vararg_ptr5 = ($vararg_buffer3);
 HEAP32[$vararg_ptr5>>2] = $90;
 $vararg_ptr6 = (($vararg_buffer3) + 4|0);
 HEAP32[$vararg_ptr6>>2] = $101;
 $vararg_ptr7 = (($vararg_buffer3) + 8|0);
 HEAP32[$vararg_ptr7>>2] = $106;
 $vararg_ptr8 = (($vararg_buffer3) + 12|0);
 HEAP32[$vararg_ptr8>>2] = $111;
 $vararg_ptr9 = (($vararg_buffer3) + 16|0);
 HEAP32[$vararg_ptr9>>2] = $116;
 (_sprintf(($85|0),((15264)|0),($vararg_buffer3|0))|0);
 $117 = HEAP32[((9832))>>2]|0;
 $118 = ($buffer);
 $119 = ($7);
 $120 = ($pos);
 $121 = HEAP32[$120>>2]|0;
 $122 = (($121) + 5)|0;
 HEAP32[$119>>2] = $122;
 $123 = (($7) + 4|0);
 $124 = (($pos) + 4|0);
 $125 = HEAP32[$124>>2]|0;
 $126 = (($125) + 2)|0;
 HEAP32[$123>>2] = $126;
 $127 = $$byval_copy14;
 $128 = $$byval_copy14;
 $129 = $7;
 ;HEAP32[$128+0>>2]=HEAP32[$129+0>>2]|0;HEAP32[$128+4>>2]=HEAP32[$129+4>>2]|0;
 _asciiDrawTextColored($117,$118,$$byval_copy14,7,0);
 $130 = $$byval_copy14;
 STACKTOP = sp;return;
}
function _drawElementitySmallProfile($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $8 = 0, $9 = 0, $buffer = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56|0;
 $$byval_copy5 = sp;
 $$byval_copy4 = sp + 8|0;
 $$byval_copy3 = sp + 16|0;
 $$byval_copy = sp + 24|0;
 $vararg_buffer = sp + 40|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $6 = HEAP32[((9832))>>2]|0;
 $7 = ($2);
 $8 = ($7);
 $9 = ($pos);
 $10 = HEAP32[$9>>2]|0;
 HEAP32[$8>>2] = $10;
 $11 = (($7) + 4|0);
 $12 = (($pos) + 4|0);
 $13 = HEAP32[$12>>2]|0;
 HEAP32[$11>>2] = $13;
 $14 = (($2) + 8|0);
 $15 = ($14);
 HEAP32[$15>>2] = 3;
 $16 = (($14) + 4|0);
 HEAP32[$16>>2] = 3;
 $17 = $$byval_copy;
 $18 = $$byval_copy;
 $19 = $2;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[$19+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[$19+12>>2]|0;
 _asciiDrawRectangleColored($6,$$byval_copy,7,0);
 $20 = $$byval_copy;
 $21 = $1;
 $22 = ($3);
 $23 = ($pos);
 $24 = HEAP32[$23>>2]|0;
 $25 = (($24) + 1)|0;
 HEAP32[$22>>2] = $25;
 $26 = (($3) + 4|0);
 $27 = (($pos) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = (($28) + 1)|0;
 HEAP32[$26>>2] = $29;
 $30 = $$byval_copy3;
 $31 = $$byval_copy3;
 $32 = $3;
 ;HEAP32[$31+0>>2]=HEAP32[$32+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$32+4>>2]|0;
 _drawElementity($21,$$byval_copy3);
 $33 = $$byval_copy3;
 $34 = $1;
 $35 = ($4);
 $36 = ($pos);
 $37 = HEAP32[$36>>2]|0;
 $38 = (($37) + 5)|0;
 HEAP32[$35>>2] = $38;
 $39 = (($4) + 4|0);
 $40 = (($pos) + 4|0);
 $41 = HEAP32[$40>>2]|0;
 HEAP32[$39>>2] = $41;
 $42 = $$byval_copy4;
 $43 = $$byval_copy4;
 $44 = $4;
 ;HEAP32[$43+0>>2]=HEAP32[$44+0>>2]|0;HEAP32[$43+4>>2]=HEAP32[$44+4>>2]|0;
 _drawElementityName($34,$$byval_copy4);
 $45 = $$byval_copy4;
 $46 = ($buffer);
 $47 = $1;
 $48 = (($47) + 7|0);
 $49 = HEAP8[$48]|0;
 $50 = $49&255;
 $51 = $1;
 $52 = (($51) + 12|0);
 $53 = HEAP32[$52>>2]|0;
 $54 = $1;
 $55 = (($54) + 16|0);
 $56 = HEAP32[$55>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $50;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $53;
 $vararg_ptr2 = (($vararg_buffer) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $56;
 (_sprintf(($46|0),((15304)|0),($vararg_buffer|0))|0);
 $57 = HEAP32[((9832))>>2]|0;
 $58 = ($buffer);
 $59 = ($5);
 $60 = ($pos);
 $61 = HEAP32[$60>>2]|0;
 $62 = (($61) + 5)|0;
 HEAP32[$59>>2] = $62;
 $63 = (($5) + 4|0);
 $64 = (($pos) + 4|0);
 $65 = HEAP32[$64>>2]|0;
 $66 = (($65) + 1)|0;
 HEAP32[$63>>2] = $66;
 $67 = $$byval_copy5;
 $68 = $$byval_copy5;
 $69 = $5;
 ;HEAP32[$68+0>>2]=HEAP32[$69+0>>2]|0;HEAP32[$68+4>>2]=HEAP32[$69+4>>2]|0;
 _asciiDrawTextColored($57,$58,$$byval_copy5,7,0);
 $70 = $$byval_copy5;
 STACKTOP = sp;return;
}
function _drawElementityHPProfile($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 88|0;
 $$byval_copy3 = sp;
 $$byval_copy2 = sp + 8|0;
 $$byval_copy1 = sp + 16|0;
 $$byval_copy = sp + 24|0;
 $2 = sp + 48|0;
 $3 = sp + 64|0;
 $4 = sp + 72|0;
 $5 = sp + 80|0;
 $1 = $e;
 $6 = HEAP32[((9832))>>2]|0;
 $7 = ($2);
 $8 = ($7);
 $9 = ($pos);
 $10 = HEAP32[$9>>2]|0;
 HEAP32[$8>>2] = $10;
 $11 = (($7) + 4|0);
 $12 = (($pos) + 4|0);
 $13 = HEAP32[$12>>2]|0;
 HEAP32[$11>>2] = $13;
 $14 = (($2) + 8|0);
 $15 = ($14);
 HEAP32[$15>>2] = 3;
 $16 = (($14) + 4|0);
 HEAP32[$16>>2] = 3;
 $17 = $$byval_copy;
 $18 = $$byval_copy;
 $19 = $2;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[$19+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[$19+12>>2]|0;
 _asciiDrawRectangleColored($6,$$byval_copy,7,0);
 $20 = $$byval_copy;
 $21 = $1;
 $22 = ($3);
 $23 = ($pos);
 $24 = HEAP32[$23>>2]|0;
 $25 = (($24) + 1)|0;
 HEAP32[$22>>2] = $25;
 $26 = (($3) + 4|0);
 $27 = (($pos) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = (($28) + 1)|0;
 HEAP32[$26>>2] = $29;
 $30 = $$byval_copy1;
 $31 = $$byval_copy1;
 $32 = $3;
 ;HEAP32[$31+0>>2]=HEAP32[$32+0>>2]|0;HEAP32[$31+4>>2]=HEAP32[$32+4>>2]|0;
 _drawElementity($21,$$byval_copy1);
 $33 = $$byval_copy1;
 $34 = $1;
 $35 = ($4);
 $36 = ($pos);
 $37 = HEAP32[$36>>2]|0;
 $38 = (($37) + 5)|0;
 HEAP32[$35>>2] = $38;
 $39 = (($4) + 4|0);
 $40 = (($pos) + 4|0);
 $41 = HEAP32[$40>>2]|0;
 HEAP32[$39>>2] = $41;
 $42 = $$byval_copy2;
 $43 = $$byval_copy2;
 $44 = $4;
 ;HEAP32[$43+0>>2]=HEAP32[$44+0>>2]|0;HEAP32[$43+4>>2]=HEAP32[$44+4>>2]|0;
 _drawElementityName($34,$$byval_copy2);
 $45 = $$byval_copy2;
 $46 = $1;
 $47 = ($5);
 $48 = ($pos);
 $49 = HEAP32[$48>>2]|0;
 $50 = (($49) + 5)|0;
 HEAP32[$47>>2] = $50;
 $51 = (($5) + 4|0);
 $52 = (($pos) + 4|0);
 $53 = HEAP32[$52>>2]|0;
 $54 = (($53) + 1)|0;
 HEAP32[$51>>2] = $54;
 $55 = $$byval_copy3;
 $56 = $$byval_copy3;
 $57 = $5;
 ;HEAP32[$56+0>>2]=HEAP32[$57+0>>2]|0;HEAP32[$56+4>>2]=HEAP32[$57+4>>2]|0;
 _drawElementityHP($46,$$byval_copy3);
 $58 = $$byval_copy3;
 STACKTOP = sp;return;
}
function _drawElementityBasicProfile($e,$pos) {
 $e = $e|0;
 $pos = $pos|0;
 var $$byval_copy = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0;
 var $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $9 = 0, $buffer = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy6 = sp;
 $$byval_copy5 = sp + 8|0;
 $$byval_copy4 = sp + 16|0;
 $$byval_copy3 = sp + 24|0;
 $$byval_copy = sp + 32|0;
 $vararg_buffer = sp + 48|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $1 = $e;
 $7 = HEAP32[((9832))>>2]|0;
 $8 = ($2);
 $9 = ($8);
 $10 = ($pos);
 $11 = HEAP32[$10>>2]|0;
 HEAP32[$9>>2] = $11;
 $12 = (($8) + 4|0);
 $13 = (($pos) + 4|0);
 $14 = HEAP32[$13>>2]|0;
 HEAP32[$12>>2] = $14;
 $15 = (($2) + 8|0);
 $16 = ($15);
 HEAP32[$16>>2] = 3;
 $17 = (($15) + 4|0);
 HEAP32[$17>>2] = 3;
 $18 = $$byval_copy;
 $19 = $$byval_copy;
 $20 = $2;
 ;HEAP32[$19+0>>2]=HEAP32[$20+0>>2]|0;HEAP32[$19+4>>2]=HEAP32[$20+4>>2]|0;HEAP32[$19+8>>2]=HEAP32[$20+8>>2]|0;HEAP32[$19+12>>2]=HEAP32[$20+12>>2]|0;
 _asciiDrawRectangleColored($7,$$byval_copy,7,0);
 $21 = $$byval_copy;
 $22 = $1;
 $23 = ($3);
 $24 = ($pos);
 $25 = HEAP32[$24>>2]|0;
 $26 = (($25) + 1)|0;
 HEAP32[$23>>2] = $26;
 $27 = (($3) + 4|0);
 $28 = (($pos) + 4|0);
 $29 = HEAP32[$28>>2]|0;
 $30 = (($29) + 1)|0;
 HEAP32[$27>>2] = $30;
 $31 = $$byval_copy3;
 $32 = $$byval_copy3;
 $33 = $3;
 ;HEAP32[$32+0>>2]=HEAP32[$33+0>>2]|0;HEAP32[$32+4>>2]=HEAP32[$33+4>>2]|0;
 _drawElementity($22,$$byval_copy3);
 $34 = $$byval_copy3;
 $35 = $1;
 $36 = ($4);
 $37 = ($pos);
 $38 = HEAP32[$37>>2]|0;
 $39 = (($38) + 5)|0;
 HEAP32[$36>>2] = $39;
 $40 = (($4) + 4|0);
 $41 = (($pos) + 4|0);
 $42 = HEAP32[$41>>2]|0;
 HEAP32[$40>>2] = $42;
 $43 = $$byval_copy4;
 $44 = $$byval_copy4;
 $45 = $4;
 ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;
 _drawElementityName($35,$$byval_copy4);
 $46 = $$byval_copy4;
 $47 = $1;
 $48 = ($5);
 $49 = ($pos);
 $50 = HEAP32[$49>>2]|0;
 $51 = (($50) + 5)|0;
 HEAP32[$48>>2] = $51;
 $52 = (($5) + 4|0);
 $53 = (($pos) + 4|0);
 $54 = HEAP32[$53>>2]|0;
 $55 = (($54) + 1)|0;
 HEAP32[$52>>2] = $55;
 $56 = $$byval_copy5;
 $57 = $$byval_copy5;
 $58 = $5;
 ;HEAP32[$57+0>>2]=HEAP32[$58+0>>2]|0;HEAP32[$57+4>>2]=HEAP32[$58+4>>2]|0;
 _drawElementityHP($47,$$byval_copy5);
 $59 = $$byval_copy5;
 $60 = ($buffer);
 $61 = $1;
 $62 = (($61) + 7|0);
 $63 = HEAP8[$62]|0;
 $64 = $63&255;
 $65 = $1;
 $66 = (($65) + 12|0);
 $67 = HEAP32[$66>>2]|0;
 $68 = $1;
 $69 = (($68) + 16|0);
 $70 = HEAP32[$69>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $64;
 $vararg_ptr1 = (($vararg_buffer) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $67;
 $vararg_ptr2 = (($vararg_buffer) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $70;
 (_sprintf(($60|0),((15312)|0),($vararg_buffer|0))|0);
 $71 = HEAP32[((9832))>>2]|0;
 $72 = ($buffer);
 $73 = ($6);
 $74 = ($pos);
 $75 = HEAP32[$74>>2]|0;
 $76 = (($75) + 5)|0;
 HEAP32[$73>>2] = $76;
 $77 = (($6) + 4|0);
 $78 = (($pos) + 4|0);
 $79 = HEAP32[$78>>2]|0;
 $80 = (($79) + 2)|0;
 HEAP32[$77>>2] = $80;
 $81 = $$byval_copy6;
 $82 = $$byval_copy6;
 $83 = $6;
 ;HEAP32[$82+0>>2]=HEAP32[$83+0>>2]|0;HEAP32[$82+4>>2]=HEAP32[$83+4>>2]|0;
 _asciiDrawTextColored($71,$72,$$byval_copy6,7,0);
 $84 = $$byval_copy6;
 STACKTOP = sp;return;
}
function _getRandom() {
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = HEAP32[(15336)>>2]|0;
 $2 = Math_imul($1, 1103515245)|0;
 $3 = (($2) + 12345)|0;
 HEAP32[(15336)>>2] = $3;
 $4 = HEAP32[(15336)>>2]|0;
 $5 = (($4>>>0) / 65536)&-1;
 $6 = (($5>>>0) % 32768)&-1;
 STACKTOP = sp;return ($6|0);
}
function _initRandom($seed) {
 $seed = $seed|0;
 var $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $seed;
 $2 = $1;
 HEAP32[(15336)>>2] = $2;
 STACKTOP = sp;return;
}
function _switchToScreen($screen) {
 $screen = $screen|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP8[(((9832) + 4|0))] = 1;
 $1 = ($screen);
 $2 = HEAP32[$1>>2]|0;
 FUNCTION_TABLE_v[$2 & 31]();
 ;HEAP32[((((9832) + 32|0)))+0>>2]=HEAP32[((((9832) + 8|0)))+0>>2]|0;HEAP32[((((9832) + 32|0)))+4>>2]=HEAP32[((((9832) + 8|0)))+4>>2]|0;HEAP32[((((9832) + 32|0)))+8>>2]=HEAP32[((((9832) + 8|0)))+8>>2]|0;HEAP32[((((9832) + 32|0)))+12>>2]=HEAP32[((((9832) + 8|0)))+12>>2]|0;HEAP32[((((9832) + 32|0)))+16>>2]=HEAP32[((((9832) + 8|0)))+16>>2]|0;HEAP32[((((9832) + 32|0)))+20>>2]=HEAP32[((((9832) + 8|0)))+20>>2]|0;
 $3 = $screen;
 ;HEAP32[((((9832) + 8|0)))+0>>2]=HEAP32[$3+0>>2]|0;HEAP32[((((9832) + 8|0)))+4>>2]=HEAP32[$3+4>>2]|0;HEAP32[((((9832) + 8|0)))+8>>2]=HEAP32[$3+8>>2]|0;HEAP32[((((9832) + 8|0)))+12>>2]=HEAP32[$3+12>>2]|0;HEAP32[((((9832) + 8|0)))+16>>2]=HEAP32[$3+16>>2]|0;HEAP32[((((9832) + 8|0)))+20>>2]=HEAP32[$3+20>>2]|0;
 STACKTOP = sp;return;
}
function _switchToLastScreen() {
 var $$byval_copy = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $$byval_copy = sp;
 $1 = $$byval_copy;
 $2 = $$byval_copy;
 $3 = (((9832) + 32|0));
 ;HEAP32[$2+0>>2]=HEAP32[$3+0>>2]|0;HEAP32[$2+4>>2]=HEAP32[$3+4>>2]|0;HEAP32[$2+8>>2]=HEAP32[$3+8>>2]|0;HEAP32[$2+12>>2]=HEAP32[$3+12>>2]|0;HEAP32[$2+16>>2]=HEAP32[$3+16>>2]|0;HEAP32[$2+20>>2]=HEAP32[$3+20>>2]|0;
 _switchToScreen($$byval_copy);
 $4 = $$byval_copy;
 STACKTOP = sp;return;
}
function _showMessageBox($title,$text) {
 $title = $title|0;
 $text = $text|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $messageBoxScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $messageBoxScreen$byval_copy = sp;
 $1 = $title;
 $2 = $text;
 $3 = $1;
 HEAP32[(((9832) + 68|0))>>2] = $3;
 $4 = $2;
 HEAP32[(((9832) + 72|0))>>2] = $4;
 $5 = $messageBoxScreen$byval_copy;
 $6 = $messageBoxScreen$byval_copy;
 $7 = (17904);
 ;HEAP32[$6+0>>2]=HEAP32[$7+0>>2]|0;HEAP32[$6+4>>2]=HEAP32[$7+4>>2]|0;HEAP32[$6+8>>2]=HEAP32[$7+8>>2]|0;HEAP32[$6+12>>2]=HEAP32[$7+12>>2]|0;HEAP32[$6+16>>2]=HEAP32[$7+16>>2]|0;HEAP32[$6+20>>2]=HEAP32[$7+20>>2]|0;
 _switchToScreen($messageBoxScreen$byval_copy);
 $8 = $messageBoxScreen$byval_copy;
 STACKTOP = sp;return;
}
function _asciiClearScreen($e) {
 $e = $e|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $size = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $$byval_copy = sp;
 $size = sp + 24|0;
 $2 = sp + 32|0;
 $1 = $e;
 $3 = $1;
 _asciiGetTargetSize($size,$3);
 $4 = $1;
 $5 = ($2);
 $6 = ($5);
 HEAP32[$6>>2] = 0;
 $7 = (($5) + 4|0);
 HEAP32[$7>>2] = 0;
 $8 = (($2) + 8|0);
 $9 = ($8);
 $10 = ($size);
 $11 = HEAP32[$10>>2]|0;
 HEAP32[$9>>2] = $11;
 $12 = (($8) + 4|0);
 $13 = (($size) + 4|0);
 $14 = HEAP32[$13>>2]|0;
 HEAP32[$12>>2] = $14;
 $15 = $$byval_copy;
 $16 = $$byval_copy;
 $17 = $2;
 ;HEAP32[$16+0>>2]=HEAP32[$17+0>>2]|0;HEAP32[$16+4>>2]=HEAP32[$17+4>>2]|0;HEAP32[$16+8>>2]=HEAP32[$17+8>>2]|0;HEAP32[$16+12>>2]=HEAP32[$17+12>>2]|0;
 _asciiClearRect($4,$$byval_copy);
 $18 = $$byval_copy;
 STACKTOP = sp;return;
}
function _asciiRectCollides($r1,$r2) {
 $r1 = $r1|0;
 $r2 = $r2|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($r1);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($r1) + 8|0);
 $5 = ($4);
 $6 = HEAP32[$5>>2]|0;
 $7 = (($3) + ($6))|0;
 $8 = ($r2);
 $9 = ($8);
 $10 = HEAP32[$9>>2]|0;
 $11 = ($7|0)>($10|0);
 if (!($11)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $12 = ($r1);
 $13 = ($12);
 $14 = HEAP32[$13>>2]|0;
 $15 = ($r2);
 $16 = ($15);
 $17 = HEAP32[$16>>2]|0;
 $18 = (($r2) + 8|0);
 $19 = ($18);
 $20 = HEAP32[$19>>2]|0;
 $21 = (($17) + ($20))|0;
 $22 = ($14|0)<($21|0);
 if (!($22)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $23 = ($r1);
 $24 = (($23) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = (($r1) + 8|0);
 $27 = (($26) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = (($25) + ($28))|0;
 $30 = ($r2);
 $31 = (($30) + 4|0);
 $32 = HEAP32[$31>>2]|0;
 $33 = ($29|0)>($32|0);
 if (!($33)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $34 = ($r1);
 $35 = (($34) + 4|0);
 $36 = HEAP32[$35>>2]|0;
 $37 = ($r2);
 $38 = (($37) + 4|0);
 $39 = HEAP32[$38>>2]|0;
 $40 = (($r2) + 8|0);
 $41 = (($40) + 4|0);
 $42 = HEAP32[$41>>2]|0;
 $43 = (($39) + ($42))|0;
 $44 = ($36|0)<($43|0);
 $45 = $44;
 $46 = $45&1;
 $47 = $46&255;
 STACKTOP = sp;return ($47|0);
}
function _asciiRectFullyContains($r1,$r2) {
 $r1 = $r1|0;
 $r2 = $r2|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($r1);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($r2);
 $5 = ($4);
 $6 = HEAP32[$5>>2]|0;
 $7 = ($3|0)<=($6|0);
 if (!($7)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $8 = ($r1);
 $9 = ($8);
 $10 = HEAP32[$9>>2]|0;
 $11 = (($r1) + 8|0);
 $12 = ($11);
 $13 = HEAP32[$12>>2]|0;
 $14 = (($10) + ($13))|0;
 $15 = ($r2);
 $16 = ($15);
 $17 = HEAP32[$16>>2]|0;
 $18 = (($r2) + 8|0);
 $19 = ($18);
 $20 = HEAP32[$19>>2]|0;
 $21 = (($17) + ($20))|0;
 $22 = ($14|0)>=($21|0);
 if (!($22)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $23 = ($r1);
 $24 = (($23) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = ($r2);
 $27 = (($26) + 4|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = ($25|0)<=($28|0);
 if (!($29)) {
  $45 = 0;
  $46 = $45&1;
  $47 = $46&255;
  STACKTOP = sp;return ($47|0);
 }
 $30 = ($r1);
 $31 = (($30) + 4|0);
 $32 = HEAP32[$31>>2]|0;
 $33 = (($r1) + 8|0);
 $34 = (($33) + 4|0);
 $35 = HEAP32[$34>>2]|0;
 $36 = (($32) + ($35))|0;
 $37 = ($r2);
 $38 = (($37) + 4|0);
 $39 = HEAP32[$38>>2]|0;
 $40 = (($r2) + 8|0);
 $41 = (($40) + 4|0);
 $42 = HEAP32[$41>>2]|0;
 $43 = (($39) + ($42))|0;
 $44 = ($36|0)>=($43|0);
 $45 = $44;
 $46 = $45&1;
 $47 = $46&255;
 STACKTOP = sp;return ($47|0);
}
function _keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $encyclopediaScreen$byval_copy = 0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $encyclopediaScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 do {
  if (!($5)) {
   $6 = $1;
   $7 = $6&255;
   $8 = ($7|0)==(41);
   if (!($8)) {
    break;
   }
   $9 = HEAP32[(((9832) + 16|0))>>2]|0;
   $10 = HEAP32[(((8776) + 8|0))>>2]|0;
   $11 = ($9|0)==($10|0);
   if ($11) {
    _switchToLastScreen();
   } else {
    $12 = $encyclopediaScreen$byval_copy;
    $13 = $encyclopediaScreen$byval_copy;
    $14 = (8776);
    ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;HEAP32[$13+8>>2]=HEAP32[$14+8>>2]|0;HEAP32[$13+12>>2]=HEAP32[$14+12>>2]|0;HEAP32[$13+16>>2]=HEAP32[$14+16>>2]|0;HEAP32[$13+20>>2]=HEAP32[$14+20>>2]|0;
    _switchToScreen($encyclopediaScreen$byval_copy);
    $15 = $encyclopediaScreen$byval_copy;
   }
   STACKTOP = sp;return;
  }
 } while(0);
 $16 = HEAP32[(((9832) + 20|0))>>2]|0;
 $17 = $1;
 $18 = $2;
 $19 = $3;
 FUNCTION_TABLE_viii[$16 & 31]($17,$18,$19);
 STACKTOP = sp;return;
}
function _mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = HEAP32[(((9832) + 24|0))>>2]|0;
 $5 = $1;
 $6 = $2;
 $7 = $3;
 FUNCTION_TABLE_viii[$4 & 31]($5,$6,$7);
 STACKTOP = sp;return;
}
function _mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $mousePos$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $mousePos$byval_copy = sp;
 $1 = $context;
 $2 = HEAP32[(((9832) + 28|0))>>2]|0;
 $3 = $1;
 $4 = $mousePos$byval_copy;
 $5 = $mousePos$byval_copy;
 $6 = $mousePos;
 ;HEAP32[$5+0>>2]=HEAP32[$6+0>>2]|0;HEAP32[$5+4>>2]=HEAP32[$6+4>>2]|0;
 FUNCTION_TABLE_vii[$2 & 15]($mousePos$byval_copy,$3);
 $7 = $mousePos$byval_copy;
 STACKTOP = sp;return;
}
function _quitHandler($context) {
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 _freeGame();
 STACKTOP = sp;return;
}
function _tickHandler($context) {
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 $2 = HEAP8[(((9832) + 4|0))]|0;
 $3 = ($2<<24>>24)!=(0);
 if ($3) {
  HEAP8[(((9832) + 4|0))] = 0;
  $4 = HEAP32[(((9832) + 16|0))>>2]|0;
  FUNCTION_TABLE_v[$4 & 31]();
  $5 = HEAP32[((9832))>>2]|0;
  (_asciiFlip($5)|0);
 }
 $6 = HEAP32[(((9832) + 12|0))>>2]|0;
 FUNCTION_TABLE_v[$6 & 31]();
 $7 = HEAP32[((9832))>>2]|0;
 (_asciiSetTimeout($7,15,4,0)|0);
 STACKTOP = sp;return;
}
function _main($argc,$argv) {
 $argc = $argc|0;
 $argv = $argv|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mainMenuScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $mainMenuScreen$byval_copy = sp;
 $1 = 0;
 $2 = $argc;
 $3 = $argv;
 $4 = (_asciiInit(5,80,25)|0);
 HEAP32[((9832))>>2] = $4;
 $5 = HEAP32[((9832))>>2]|0;
 $6 = ($5|0)!=(0|0);
 if (!($6)) {
  $17 = $1;
  STACKTOP = sp;return ($17|0);
 }
 $7 = HEAP32[((9832))>>2]|0;
 _asciiSetKeyEventCallback($7,19,0);
 $8 = HEAP32[((9832))>>2]|0;
 _asciiSetMouseKeyEventCallback($8,20,0);
 $9 = HEAP32[((9832))>>2]|0;
 _asciiSetMouseMoveEventCallback($9,12,0);
 $10 = HEAP32[((9832))>>2]|0;
 _asciiSetQuitCallback($10,5,0);
 $11 = HEAP32[((9832))>>2]|0;
 _asciiToggle($11,16,0);
 $12 = $mainMenuScreen$byval_copy;
 $13 = $mainMenuScreen$byval_copy;
 $14 = (17848);
 ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;HEAP32[$13+8>>2]=HEAP32[$14+8>>2]|0;HEAP32[$13+12>>2]=HEAP32[$14+12>>2]|0;HEAP32[$13+16>>2]=HEAP32[$14+16>>2]|0;HEAP32[$13+20>>2]=HEAP32[$14+20>>2]|0;
 _switchToScreen($mainMenuScreen$byval_copy);
 $15 = $mainMenuScreen$byval_copy;
 _tickHandler(0);
 $16 = HEAP32[((9832))>>2]|0;
 _asciiRun($16);
 $17 = $1;
 STACKTOP = sp;return ($17|0);
}
function _mainMenu_init() {
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[(((9832) + 60|0))>>2] = 0;
 $1 = HEAP32[(17752)>>2]|0;
 HEAP32[(((17792) + 16|0))>>2] = $1;
 STACKTOP = sp;return;
}
function _mainMenu_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _mainMenu_render() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0;
 var $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $7 = 0, $8 = 0, $9 = 0, $mainMenuControl$byval_copy = 0, $mainMenuLetter$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 192|0;
 $$byval_copy4 = sp;
 $$byval_copy3 = sp + 8|0;
 $mainMenuControl$byval_copy = sp + 24|0;
 $$byval_copy2 = sp + 56|0;
 $mainMenuLetter$byval_copy = sp + 72|0;
 $$byval_copy1 = sp + 104|0;
 $$byval_copy = sp + 120|0;
 $1 = sp + 128|0;
 $2 = sp + 136|0;
 $3 = sp + 152|0;
 $4 = sp + 168|0;
 $5 = sp + 184|0;
 $6 = HEAP8[(((9832) + 64|0))]|0;
 $7 = $6 << 24 >> 24;
 $8 = ($7|0)!=(0);
 if ($8) {
  $9 = HEAP32[(17528)>>2]|0;
  $11 = $9;
 } else {
  $10 = HEAP32[(16432)>>2]|0;
  $11 = $10;
 }
 HEAP32[(((17760) + 16|0))>>2] = $11;
 $12 = HEAP32[((9832))>>2]|0;
 $13 = ($1);
 HEAP8[$13] = 32;
 $14 = (($1) + 1|0);
 HEAP8[$14] = 7;
 $15 = (($1) + 2|0);
 HEAP8[$15] = 0;
 $16 = (($1) + 3|0);
 HEAP8[$16] = 0;
 $17 = ($2);
 $18 = ($17);
 HEAP32[$18>>2] = 0;
 $19 = (($17) + 4|0);
 HEAP32[$19>>2] = 0;
 $20 = (($2) + 8|0);
 $21 = ($20);
 HEAP32[$21>>2] = 80;
 $22 = (($20) + 4|0);
 HEAP32[$22>>2] = 25;
 $23 = $$byval_copy;
 $24 = $$byval_copy;
 $25 = $1;
 ;HEAP8[$24+0|0]=HEAP8[$25+0|0]|0;HEAP8[$24+1|0]=HEAP8[$25+1|0]|0;HEAP8[$24+2|0]=HEAP8[$25+2|0]|0;HEAP8[$24+3|0]=HEAP8[$25+3|0]|0;
 $26 = $$byval_copy1;
 $27 = $$byval_copy1;
 $28 = $2;
 ;HEAP32[$27+0>>2]=HEAP32[$28+0>>2]|0;HEAP32[$27+4>>2]=HEAP32[$28+4>>2]|0;HEAP32[$27+8>>2]=HEAP32[$28+8>>2]|0;HEAP32[$27+12>>2]=HEAP32[$28+12>>2]|0;
 _asciiFillRect($12,$$byval_copy,$$byval_copy1);
 $29 = $$byval_copy1;
 $30 = $$byval_copy;
 $31 = HEAP32[((9832))>>2]|0;
 $32 = ($3);
 $33 = ($32);
 HEAP32[$33>>2] = 0;
 $34 = (($32) + 4|0);
 HEAP32[$34>>2] = 0;
 $35 = (($3) + 8|0);
 $36 = ($35);
 HEAP32[$36>>2] = 0;
 $37 = (($35) + 4|0);
 HEAP32[$37>>2] = 0;
 $38 = $mainMenuLetter$byval_copy;
 $39 = $mainMenuLetter$byval_copy;
 $40 = (17760);
 ;HEAP32[$39+0>>2]=HEAP32[$40+0>>2]|0;HEAP32[$39+4>>2]=HEAP32[$40+4>>2]|0;HEAP32[$39+8>>2]=HEAP32[$40+8>>2]|0;HEAP32[$39+12>>2]=HEAP32[$40+12>>2]|0;HEAP32[$39+16>>2]=HEAP32[$40+16>>2]|0;HEAP32[$39+20>>2]=HEAP32[$40+20>>2]|0;HEAP32[$39+24>>2]=HEAP32[$40+24>>2]|0;
 $41 = $$byval_copy2;
 $42 = $$byval_copy2;
 $43 = $3;
 ;HEAP32[$42+0>>2]=HEAP32[$43+0>>2]|0;HEAP32[$42+4>>2]=HEAP32[$43+4>>2]|0;HEAP32[$42+8>>2]=HEAP32[$43+8>>2]|0;HEAP32[$42+12>>2]=HEAP32[$43+12>>2]|0;
 _asciiDrawBitmapColored($31,$mainMenuLetter$byval_copy,$$byval_copy2,7,0);
 $44 = $$byval_copy2;
 $45 = $mainMenuLetter$byval_copy;
 $46 = HEAP32[((9832))>>2]|0;
 $47 = ($4);
 $48 = ($47);
 HEAP32[$48>>2] = 47;
 $49 = (($47) + 4|0);
 HEAP32[$49>>2] = 6;
 $50 = (($4) + 8|0);
 $51 = ($50);
 HEAP32[$51>>2] = 0;
 $52 = (($50) + 4|0);
 HEAP32[$52>>2] = 0;
 $53 = $mainMenuControl$byval_copy;
 $54 = $mainMenuControl$byval_copy;
 $55 = (17792);
 ;HEAP32[$54+0>>2]=HEAP32[$55+0>>2]|0;HEAP32[$54+4>>2]=HEAP32[$55+4>>2]|0;HEAP32[$54+8>>2]=HEAP32[$55+8>>2]|0;HEAP32[$54+12>>2]=HEAP32[$55+12>>2]|0;HEAP32[$54+16>>2]=HEAP32[$55+16>>2]|0;HEAP32[$54+20>>2]=HEAP32[$55+20>>2]|0;HEAP32[$54+24>>2]=HEAP32[$55+24>>2]|0;
 $56 = $$byval_copy3;
 $57 = $$byval_copy3;
 $58 = $4;
 ;HEAP32[$57+0>>2]=HEAP32[$58+0>>2]|0;HEAP32[$57+4>>2]=HEAP32[$58+4>>2]|0;HEAP32[$57+8>>2]=HEAP32[$58+8>>2]|0;HEAP32[$57+12>>2]=HEAP32[$58+12>>2]|0;
 _asciiDrawBitmapColored($46,$mainMenuControl$byval_copy,$$byval_copy3,7,0);
 $59 = $$byval_copy3;
 $60 = $mainMenuControl$byval_copy;
 $61 = HEAP32[((9832))>>2]|0;
 $62 = ($5);
 HEAP32[$62>>2] = 51;
 $63 = (($5) + 4|0);
 HEAP32[$63>>2] = 18;
 $64 = $$byval_copy4;
 $65 = $$byval_copy4;
 $66 = $5;
 ;HEAP32[$65+0>>2]=HEAP32[$66+0>>2]|0;HEAP32[$65+4>>2]=HEAP32[$66+4>>2]|0;
 _asciiDrawTextColored($61,(17824),$$byval_copy4,7,0);
 $67 = $$byval_copy4;
 STACKTOP = sp;return;
}
function _mainMenu_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $overGameScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0;
 $overGameScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 $8 = ($7|0)==(2);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 $9 = (_time((0|0))|0);
 _initGame($9);
 $10 = $overGameScreen$byval_copy;
 $11 = $overGameScreen$byval_copy;
 $12 = (18016);
 ;HEAP32[$11+0>>2]=HEAP32[$12+0>>2]|0;HEAP32[$11+4>>2]=HEAP32[$12+4>>2]|0;HEAP32[$11+8>>2]=HEAP32[$12+8>>2]|0;HEAP32[$11+12>>2]=HEAP32[$12+12>>2]|0;HEAP32[$11+16>>2]=HEAP32[$12+16>>2]|0;HEAP32[$11+20>>2]=HEAP32[$12+20>>2]|0;
 _switchToScreen($overGameScreen$byval_copy);
 $13 = $overGameScreen$byval_copy;
 STACKTOP = sp;return;
}
function _mainMenu_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _mainMenu_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _messageBox_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _messageBox_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _messageBox_render() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $7 = 0, $8 = 0, $9 = 0, $strPressEnter = 0, $textLen = 0, $titleLen = 0, $width = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $$byval_copy3 = sp;
 $$byval_copy2 = sp + 8|0;
 $$byval_copy1 = sp + 16|0;
 $$byval_copy = sp + 24|0;
 $1 = sp + 72|0;
 $2 = sp + 88|0;
 $3 = sp + 96|0;
 $4 = sp + 104|0;
 $strPressEnter = (17872);
 $5 = HEAP32[(((9832) + 68|0))>>2]|0;
 $6 = (_strlen(($5|0))|0);
 $titleLen = $6;
 $7 = HEAP32[(((9832) + 72|0))>>2]|0;
 $8 = (_strlen(($7|0))|0);
 $textLen = $8;
 $9 = $titleLen;
 $10 = $textLen;
 $11 = ($9>>>0)>($10>>>0);
 if ($11) {
  $12 = $titleLen;
  $14 = $12;
 } else {
  $13 = $textLen;
  $14 = $13;
 }
 $width = $14;
 $15 = $width;
 $16 = ($15>>>0)>(24);
 if ($16) {
  $17 = $width;
  $18 = $17;
 } else {
  $18 = 24;
 }
 $width = $18;
 $19 = $width;
 $20 = (($19) + 4)|0;
 $width = $20;
 $21 = HEAP32[((9832))>>2]|0;
 $22 = ($1);
 $23 = ($22);
 $24 = $width;
 $25 = (($24>>>0) / 2)&-1;
 $26 = (40 - ($25))|0;
 HEAP32[$23>>2] = $26;
 $27 = (($22) + 4|0);
 HEAP32[$27>>2] = 9;
 $28 = (($1) + 8|0);
 $29 = ($28);
 $30 = $width;
 HEAP32[$29>>2] = $30;
 $31 = (($28) + 4|0);
 HEAP32[$31>>2] = 6;
 $32 = $$byval_copy;
 $33 = $$byval_copy;
 $34 = $1;
 ;HEAP32[$33+0>>2]=HEAP32[$34+0>>2]|0;HEAP32[$33+4>>2]=HEAP32[$34+4>>2]|0;HEAP32[$33+8>>2]=HEAP32[$34+8>>2]|0;HEAP32[$33+12>>2]=HEAP32[$34+12>>2]|0;
 _asciiDrawFilledRectangleColored($21,$$byval_copy,7,0);
 $35 = $$byval_copy;
 $36 = HEAP32[((9832))>>2]|0;
 $37 = HEAP32[(((9832) + 68|0))>>2]|0;
 $38 = ($2);
 $39 = $titleLen;
 $40 = (($39>>>0) / 2)&-1;
 $41 = (40 - ($40))|0;
 HEAP32[$38>>2] = $41;
 $42 = (($2) + 4|0);
 HEAP32[$42>>2] = 9;
 $43 = $$byval_copy1;
 $44 = $$byval_copy1;
 $45 = $2;
 ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;
 _asciiDrawTextColored($36,$37,$$byval_copy1,7,0);
 $46 = $$byval_copy1;
 $47 = HEAP32[((9832))>>2]|0;
 $48 = HEAP32[(((9832) + 72|0))>>2]|0;
 $49 = ($3);
 $50 = $textLen;
 $51 = (($50>>>0) / 2)&-1;
 $52 = (40 - ($51))|0;
 HEAP32[$49>>2] = $52;
 $53 = (($3) + 4|0);
 HEAP32[$53>>2] = 11;
 $54 = $$byval_copy2;
 $55 = $$byval_copy2;
 $56 = $3;
 ;HEAP32[$55+0>>2]=HEAP32[$56+0>>2]|0;HEAP32[$55+4>>2]=HEAP32[$56+4>>2]|0;
 _asciiDrawTextColored($47,$48,$$byval_copy2,7,0);
 $57 = $$byval_copy2;
 $58 = HEAP32[((9832))>>2]|0;
 $59 = $strPressEnter;
 $60 = ($4);
 HEAP32[$60>>2] = 28;
 $61 = (($4) + 4|0);
 HEAP32[$61>>2] = 13;
 $62 = $$byval_copy3;
 $63 = $$byval_copy3;
 $64 = $4;
 ;HEAP32[$63+0>>2]=HEAP32[$64+0>>2]|0;HEAP32[$63+4>>2]=HEAP32[$64+4>>2]|0;
 _asciiDrawTextColored($58,$59,$$byval_copy3,7,0);
 $65 = $$byval_copy3;
 STACKTOP = sp;return;
}
function _messageBox_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 do {
  if (!($5)) {
   $6 = $1;
   $7 = $6&255;
   $8 = ($7|0)==(2);
   if (!($8)) {
    break;
   }
   _switchToLastScreen();
  }
 } while(0);
 STACKTOP = sp;return;
}
function _messageBox_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _messageBox_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _overGame_movePlayer($dir) {
 $dir = $dir|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $newPos = 0, $newPos$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $newPos$byval_copy = sp;
 $newPos = sp + 16|0;
 $1 = $dir;
 $2 = HEAP32[(((9832) + 348|0))>>2]|0;
 $3 = (($2) + 76|0);
 $4 = $newPos;
 $5 = $3;
 ;HEAP32[$4+0>>2]=HEAP32[$5+0>>2]|0;HEAP32[$4+4>>2]=HEAP32[$5+4>>2]|0;
 $6 = HEAP8[(((9832) + 219|0))]|0;
 $7 = ($6<<24>>24)!=(0);
 if ($7) {
  STACKTOP = sp;return;
 }
 $8 = $1;
 $9 = $8&255;
 if ((($9|0) == 3)) {
  $19 = ($newPos);
  $20 = HEAP32[$19>>2]|0;
  $21 = (($20) + 1)|0;
  HEAP32[$19>>2] = $21;
 } else if ((($9|0) == 2)) {
  $16 = ($newPos);
  $17 = HEAP32[$16>>2]|0;
  $18 = (($17) + -1)|0;
  HEAP32[$16>>2] = $18;
 } else if ((($9|0) == 0)) {
  $10 = (($newPos) + 4|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + -1)|0;
  HEAP32[$10>>2] = $12;
 } else if ((($9|0) == 1)) {
  $13 = (($newPos) + 4|0);
  $14 = HEAP32[$13>>2]|0;
  $15 = (($14) + 1)|0;
  HEAP32[$13>>2] = $15;
 }
 $22 = $newPos$byval_copy;
 $23 = $newPos$byval_copy;
 $24 = $newPos;
 ;HEAP32[$23+0>>2]=HEAP32[$24+0>>2]|0;HEAP32[$23+4>>2]=HEAP32[$24+4>>2]|0;
 _overGame_movePlayerTo($newPos$byval_copy);
 $25 = $newPos$byval_copy;
 STACKTOP = sp;return;
}
function _overGame_movePlayerTo($pos) {
 $pos = $pos|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $gameTile = 0, $mainMenuScreen$byval_copy = 0, $nextRoomPos = 0, $nextRoomPos$byval_copy = 0;
 var $shopScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 352|0;
 $shopScreen$byval_copy = sp;
 $mainMenuScreen$byval_copy = sp + 24|0;
 $nextRoomPos$byval_copy = sp + 48|0;
 $$byval_copy = sp + 56|0;
 $nextRoomPos = sp + 344|0;
 $1 = ($pos);
 $2 = HEAP32[$1>>2]|0;
 $3 = (($pos) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (_overGame_getGameTile($2,$4)|0);
 $gameTile = $5;
 $6 = $gameTile;
 $7 = $6&255;
 $8 = ($7|0)==(2);
 if ($8) {
  $9 = ($pos);
  $10 = HEAP32[$9>>2]|0;
  $11 = ($pos);
  $12 = HEAP32[$11>>2]|0;
  $13 = HEAP32[(((9832) + 348|0))>>2]|0;
  $14 = (($13) + 76|0);
  $15 = ($14);
  $16 = HEAP32[$15>>2]|0;
  $17 = (($12) - ($16))|0;
  $18 = (($10) + ($17))|0;
  $19 = ($nextRoomPos);
  HEAP32[$19>>2] = $18;
  $20 = (($pos) + 4|0);
  $21 = HEAP32[$20>>2]|0;
  $22 = (($pos) + 4|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = HEAP32[(((9832) + 348|0))>>2]|0;
  $25 = (($24) + 76|0);
  $26 = (($25) + 4|0);
  $27 = HEAP32[$26>>2]|0;
  $28 = (($23) - ($27))|0;
  $29 = (($21) + ($28))|0;
  $30 = (($nextRoomPos) + 4|0);
  HEAP32[$30>>2] = $29;
  $31 = HEAP32[(((9832) + 348|0))>>2]|0;
  $32 = $$byval_copy;
  $33 = $$byval_copy;
  $34 = $31;
  _memcpy(($33|0),($34|0),276)|0;
  $35 = $nextRoomPos$byval_copy;
  $36 = $nextRoomPos$byval_copy;
  $37 = $nextRoomPos;
  ;HEAP32[$36+0>>2]=HEAP32[$37+0>>2]|0;HEAP32[$36+4>>2]=HEAP32[$37+4>>2]|0;
  _showUpWorldRoomAt($$byval_copy,$nextRoomPos$byval_copy);
  $38 = $nextRoomPos$byval_copy;
  $39 = $$byval_copy;
 }
 $40 = $gameTile;
 $41 = $40&255;
 $42 = ($41|0)!=(1);
 if ($42) {
  $43 = HEAP32[(((9832) + 348|0))>>2]|0;
  $44 = (($43) + 76|0);
  $45 = $44;
  $46 = $pos;
  ;HEAP32[$45+0>>2]=HEAP32[$46+0>>2]|0;HEAP32[$45+4>>2]=HEAP32[$46+4>>2]|0;
 }
 $47 = (_overGame_handleEnemiesSight()|0);
 $48 = ($47<<24>>24)!=(0);
 if ($48) {
  HEAP8[(((9832) + 4|0))] = 1;
  STACKTOP = sp;return;
 }
 $49 = $gameTile;
 $50 = $49&255;
 if ((($50|0) == 2)) {
  $73 = (($pos) + 4|0);
  $74 = HEAP32[$73>>2]|0;
  $75 = ($74*60)|0;
  $76 = ($pos);
  $77 = HEAP32[$76>>2]|0;
  $78 = (($75) + ($77))|0;
  $79 = HEAP32[(((9832) + 348|0))>>2]|0;
  $80 = (($79) + 4|0);
  $81 = ($80);
  $82 = HEAP32[$81>>2]|0;
  $83 = (($82) + ($78)|0);
  HEAP8[$83] = 0;
  $84 = (($pos) + 4|0);
  $85 = HEAP32[$84>>2]|0;
  $86 = ($85*60)|0;
  $87 = ($pos);
  $88 = HEAP32[$87>>2]|0;
  $89 = (($86) + ($88))|0;
  $90 = HEAP32[(((9832) + 348|0))>>2]|0;
  $91 = (($90) + 4|0);
  $92 = (($91) + 4|0);
  $93 = (($92) + 16|0);
  $94 = HEAP32[$93>>2]|0;
  $95 = (($94) + ($89)|0);
  HEAP8[$95] = 46;
 } else if ((($50|0) == 4)) {
  $58 = HEAP8[(((9832) + 352|0))]|0;
  $59 = $58&255;
  $60 = ($59|0)!=(7);
  if ($60) {
   $61 = HEAP8[(((9832) + 352|0))]|0;
   $62 = $61&255;
   $63 = (($62) + 1)|0;
   $64 = $63&255;
   _goToLevel($64);
  } else {
   HEAP8[(((9832) + 64|0))] = 1;
   $65 = $mainMenuScreen$byval_copy;
   $66 = $mainMenuScreen$byval_copy;
   $67 = (17848);
   ;HEAP32[$66+0>>2]=HEAP32[$67+0>>2]|0;HEAP32[$66+4>>2]=HEAP32[$67+4>>2]|0;HEAP32[$66+8>>2]=HEAP32[$67+8>>2]|0;HEAP32[$66+12>>2]=HEAP32[$67+12>>2]|0;HEAP32[$66+16>>2]=HEAP32[$67+16>>2]|0;HEAP32[$66+20>>2]=HEAP32[$67+20>>2]|0;
   _switchToScreen($mainMenuScreen$byval_copy);
   $68 = $mainMenuScreen$byval_copy;
   _showMessageBox((17928),(17944));
  }
 } else if ((($50|0) == 6)) {
  $69 = $shopScreen$byval_copy;
  $70 = $shopScreen$byval_copy;
  $71 = (18136);
  ;HEAP32[$70+0>>2]=HEAP32[$71+0>>2]|0;HEAP32[$70+4>>2]=HEAP32[$71+4>>2]|0;HEAP32[$70+8>>2]=HEAP32[$71+8>>2]|0;HEAP32[$70+12>>2]=HEAP32[$71+12>>2]|0;HEAP32[$70+16>>2]=HEAP32[$71+16>>2]|0;HEAP32[$70+20>>2]=HEAP32[$71+20>>2]|0;
  _switchToScreen($shopScreen$byval_copy);
  $72 = $shopScreen$byval_copy;
 } else if ((($50|0) == 3)) {
  $51 = HEAP8[(((9832) + 352|0))]|0;
  $52 = $51&255;
  $53 = ($52|0)!=(0);
  if ($53) {
   $54 = HEAP8[(((9832) + 352|0))]|0;
   $55 = $54&255;
   $56 = (($55) - 1)|0;
   $57 = $56&255;
   _goToLevel($57);
  }
 }
 HEAP8[(((9832) + 4|0))] = 1;
 STACKTOP = sp;return;
}
function _overGame_getGameTile($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $2 = $x;
 $3 = $y;
 $4 = $2;
 $5 = ($4|0)<(0);
 do {
  if (!($5)) {
   $6 = $3;
   $7 = ($6|0)<(0);
   if ($7) {
    break;
   }
   $8 = $2;
   $9 = ($8|0)>=(60);
   if ($9) {
    break;
   }
   $10 = $3;
   $11 = ($10|0)>=(25);
   if ($11) {
    break;
   }
   $12 = $3;
   $13 = ($12*60)|0;
   $14 = $2;
   $15 = (($13) + ($14))|0;
   $16 = HEAP32[(((9832) + 348|0))>>2]|0;
   $17 = (($16) + 4|0);
   $18 = ($17);
   $19 = HEAP32[$18>>2]|0;
   $20 = (($19) + ($15)|0);
   $21 = HEAP8[$20]|0;
   $1 = $21;
   $22 = $1;
   STACKTOP = sp;return ($22|0);
  }
 } while(0);
 $1 = 1;
 $22 = $1;
 STACKTOP = sp;return ($22|0);
}
function _overGame_handleEnemySight($e) {
 $e = $e|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0;
 var $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0;
 var $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0;
 var $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0;
 var $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0;
 var $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0;
 var $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $gameTile = 0, $len = 0, $player = 0, $x = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 184|0;
 $$byval_copy3 = sp;
 $$byval_copy2 = sp + 16|0;
 $$byval_copy1 = sp + 32|0;
 $$byval_copy = sp + 48|0;
 $player = sp + 112|0;
 $3 = sp + 120|0;
 $4 = sp + 136|0;
 $5 = sp + 152|0;
 $6 = sp + 168|0;
 $2 = $e;
 $7 = HEAP32[(((9832) + 348|0))>>2]|0;
 $8 = (($7) + 105|0);
 $9 = HEAP8[$8]|0;
 $10 = $9&255;
 $len = $10;
 $11 = HEAP32[(((9832) + 348|0))>>2]|0;
 $12 = (($11) + 76|0);
 $13 = $player;
 $14 = $12;
 ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;
 $15 = ($3);
 $16 = ($15);
 $17 = ($player);
 $18 = HEAP32[$17>>2]|0;
 HEAP32[$16>>2] = $18;
 $19 = (($15) + 4|0);
 $20 = (($player) + 4|0);
 $21 = HEAP32[$20>>2]|0;
 HEAP32[$19>>2] = $21;
 $22 = (($3) + 8|0);
 $23 = ($22);
 HEAP32[$23>>2] = 1;
 $24 = (($22) + 4|0);
 HEAP32[$24>>2] = 1;
 $25 = ($4);
 $26 = ($25);
 $27 = $2;
 $28 = (($27) + 4|0);
 $29 = ($28);
 $30 = HEAP32[$29>>2]|0;
 $31 = $len;
 $32 = (($30) - ($31))|0;
 HEAP32[$26>>2] = $32;
 $33 = (($25) + 4|0);
 $34 = $2;
 $35 = (($34) + 4|0);
 $36 = (($35) + 4|0);
 $37 = HEAP32[$36>>2]|0;
 HEAP32[$33>>2] = $37;
 $38 = (($4) + 8|0);
 $39 = ($38);
 $40 = $len;
 $41 = $40<<1;
 HEAP32[$39>>2] = $41;
 $42 = (($38) + 4|0);
 HEAP32[$42>>2] = 1;
 $43 = $$byval_copy;
 $44 = $$byval_copy;
 $45 = $3;
 ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;HEAP32[$44+8>>2]=HEAP32[$45+8>>2]|0;HEAP32[$44+12>>2]=HEAP32[$45+12>>2]|0;
 $46 = $$byval_copy1;
 $47 = $$byval_copy1;
 $48 = $4;
 ;HEAP32[$47+0>>2]=HEAP32[$48+0>>2]|0;HEAP32[$47+4>>2]=HEAP32[$48+4>>2]|0;HEAP32[$47+8>>2]=HEAP32[$48+8>>2]|0;HEAP32[$47+12>>2]=HEAP32[$48+12>>2]|0;
 $49 = (_asciiRectCollides($$byval_copy,$$byval_copy1)|0);
 $50 = $$byval_copy1;
 $51 = $$byval_copy;
 $52 = ($49<<24>>24)!=(0);
 if ($52) {
  $53 = $2;
  $54 = (($53) + 4|0);
  $55 = (($54) + 4|0);
  $56 = HEAP32[$55>>2]|0;
  $y = $56;
  $57 = $2;
  $58 = (($57) + 4|0);
  $59 = ($58);
  $60 = HEAP32[$59>>2]|0;
  $61 = ($player);
  $62 = HEAP32[$61>>2]|0;
  $63 = ($60|0)<($62|0);
  if ($63) {
   $64 = $2;
   $65 = (($64) + 4|0);
   $66 = ($65);
   $67 = HEAP32[$66>>2]|0;
   $70 = $67;
  } else {
   $68 = ($player);
   $69 = HEAP32[$68>>2]|0;
   $70 = $69;
  }
  $x = $70;
  while(1) {
   $71 = $x;
   $72 = $2;
   $73 = (($72) + 4|0);
   $74 = ($73);
   $75 = HEAP32[$74>>2]|0;
   $76 = ($player);
   $77 = HEAP32[$76>>2]|0;
   $78 = ($75|0)>($77|0);
   if ($78) {
    $79 = $2;
    $80 = (($79) + 4|0);
    $81 = ($80);
    $82 = HEAP32[$81>>2]|0;
    $85 = $82;
   } else {
    $83 = ($player);
    $84 = HEAP32[$83>>2]|0;
    $85 = $84;
   }
   $86 = ($71|0)<($85|0);
   if (!($86)) {
    label = 15;
    break;
   }
   $87 = $x;
   $88 = $y;
   $89 = (_overGame_getGameTile($87,$88)|0);
   $gameTile = $89;
   $90 = $gameTile;
   $91 = $90&255;
   $92 = ($91|0)==(1);
   if ($92) {
    label = 12;
    break;
   }
   $93 = $gameTile;
   $94 = $93&255;
   $95 = ($94|0)==(2);
   if ($95) {
    label = 12;
    break;
   }
   $96 = $x;
   $97 = (($96) + 1)|0;
   $x = $97;
  }
  if ((label|0) == 12) {
   $1 = 0;
   $201 = $1;
   STACKTOP = sp;return ($201|0);
  }
  else if ((label|0) == 15) {
   HEAP8[(((9832) + 219|0))] = 1;
   $98 = $2;
   HEAP32[(((9832) + 76|0))>>2] = $98;
   $99 = $2;
   $100 = (($99) + 4|0);
   $101 = ($100);
   $102 = HEAP32[$101>>2]|0;
   $103 = ($player);
   $104 = HEAP32[$103>>2]|0;
   $105 = ($102|0)<($104|0);
   $106 = $105 ? 3 : 2;
   $107 = $106&255;
   HEAP8[(((9832) + 216|0))] = $107;
   HEAP32[(((9832) + 56|0))>>2] = 60;
   $1 = 1;
   $201 = $1;
   STACKTOP = sp;return ($201|0);
  }
 }
 $108 = ($5);
 $109 = ($108);
 $110 = ($player);
 $111 = HEAP32[$110>>2]|0;
 HEAP32[$109>>2] = $111;
 $112 = (($108) + 4|0);
 $113 = (($player) + 4|0);
 $114 = HEAP32[$113>>2]|0;
 HEAP32[$112>>2] = $114;
 $115 = (($5) + 8|0);
 $116 = ($115);
 HEAP32[$116>>2] = 1;
 $117 = (($115) + 4|0);
 HEAP32[$117>>2] = 1;
 $118 = ($6);
 $119 = ($118);
 $120 = $2;
 $121 = (($120) + 4|0);
 $122 = ($121);
 $123 = HEAP32[$122>>2]|0;
 HEAP32[$119>>2] = $123;
 $124 = (($118) + 4|0);
 $125 = $2;
 $126 = (($125) + 4|0);
 $127 = (($126) + 4|0);
 $128 = HEAP32[$127>>2]|0;
 $129 = $len;
 $130 = (($128) - ($129))|0;
 HEAP32[$124>>2] = $130;
 $131 = (($6) + 8|0);
 $132 = ($131);
 HEAP32[$132>>2] = 1;
 $133 = (($131) + 4|0);
 $134 = $len;
 $135 = $134<<1;
 HEAP32[$133>>2] = $135;
 $136 = $$byval_copy2;
 $137 = $$byval_copy2;
 $138 = $5;
 ;HEAP32[$137+0>>2]=HEAP32[$138+0>>2]|0;HEAP32[$137+4>>2]=HEAP32[$138+4>>2]|0;HEAP32[$137+8>>2]=HEAP32[$138+8>>2]|0;HEAP32[$137+12>>2]=HEAP32[$138+12>>2]|0;
 $139 = $$byval_copy3;
 $140 = $$byval_copy3;
 $141 = $6;
 ;HEAP32[$140+0>>2]=HEAP32[$141+0>>2]|0;HEAP32[$140+4>>2]=HEAP32[$141+4>>2]|0;HEAP32[$140+8>>2]=HEAP32[$141+8>>2]|0;HEAP32[$140+12>>2]=HEAP32[$141+12>>2]|0;
 $142 = (_asciiRectCollides($$byval_copy2,$$byval_copy3)|0);
 $143 = $$byval_copy3;
 $144 = $$byval_copy2;
 $145 = ($142<<24>>24)!=(0);
 if (!($145)) {
  $1 = 0;
  $201 = $1;
  STACKTOP = sp;return ($201|0);
 }
 $146 = $2;
 $147 = (($146) + 4|0);
 $148 = ($147);
 $149 = HEAP32[$148>>2]|0;
 $x = $149;
 $150 = $2;
 $151 = (($150) + 4|0);
 $152 = (($151) + 4|0);
 $153 = HEAP32[$152>>2]|0;
 $154 = (($player) + 4|0);
 $155 = HEAP32[$154>>2]|0;
 $156 = ($153|0)<($155|0);
 if ($156) {
  $157 = $2;
  $158 = (($157) + 4|0);
  $159 = (($158) + 4|0);
  $160 = HEAP32[$159>>2]|0;
  $163 = $160;
 } else {
  $161 = (($player) + 4|0);
  $162 = HEAP32[$161>>2]|0;
  $163 = $162;
 }
 $y = $163;
 while(1) {
  $164 = $y;
  $165 = $2;
  $166 = (($165) + 4|0);
  $167 = (($166) + 4|0);
  $168 = HEAP32[$167>>2]|0;
  $169 = (($player) + 4|0);
  $170 = HEAP32[$169>>2]|0;
  $171 = ($168|0)>($170|0);
  if ($171) {
   $172 = $2;
   $173 = (($172) + 4|0);
   $174 = (($173) + 4|0);
   $175 = HEAP32[$174>>2]|0;
   $178 = $175;
  } else {
   $176 = (($player) + 4|0);
   $177 = HEAP32[$176>>2]|0;
   $178 = $177;
  }
  $179 = ($164|0)<($178|0);
  if (!($179)) {
   label = 30;
   break;
  }
  $180 = $x;
  $181 = $y;
  $182 = (_overGame_getGameTile($180,$181)|0);
  $gameTile = $182;
  $183 = $gameTile;
  $184 = $183&255;
  $185 = ($184|0)==(1);
  if ($185) {
   label = 27;
   break;
  }
  $186 = $gameTile;
  $187 = $186&255;
  $188 = ($187|0)==(2);
  if ($188) {
   label = 27;
   break;
  }
  $189 = $y;
  $190 = (($189) + 1)|0;
  $y = $190;
 }
 if ((label|0) == 27) {
  $1 = 0;
  $201 = $1;
  STACKTOP = sp;return ($201|0);
 }
 else if ((label|0) == 30) {
  HEAP8[(((9832) + 219|0))] = 1;
  $191 = $2;
  HEAP32[(((9832) + 76|0))>>2] = $191;
  $192 = $2;
  $193 = (($192) + 4|0);
  $194 = (($193) + 4|0);
  $195 = HEAP32[$194>>2]|0;
  $196 = (($player) + 4|0);
  $197 = HEAP32[$196>>2]|0;
  $198 = ($195|0)<($197|0);
  $199 = $198 ? 1 : 0;
  $200 = $199&255;
  HEAP8[(((9832) + 216|0))] = $200;
  HEAP32[(((9832) + 56|0))>>2] = 60;
  $1 = 1;
  $201 = $1;
  STACKTOP = sp;return ($201|0);
 }
 return 0|0;
}
function _overGame_handleEnemiesSight() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = $2&255;
  $4 = HEAP32[(((9832) + 348|0))>>2]|0;
  $5 = (($4) + 104|0);
  $6 = HEAP8[$5]|0;
  $7 = $6&255;
  $8 = ($3|0)<($7|0);
  if (!($8)) {
   label = 8;
   break;
  }
  $9 = $i;
  $10 = $9&255;
  $11 = HEAP32[(((9832) + 348|0))>>2]|0;
  $12 = (($11) + 100|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = (($13) + (($10*136)|0)|0);
  $15 = ($14);
  $16 = HEAP8[$15]|0;
  $17 = $16 << 24 >> 24;
  $18 = ($17|0)!=(0);
  if ($18) {
   $19 = HEAP32[(((9832) + 348|0))>>2]|0;
   $20 = (($19) + 100|0);
   $21 = HEAP32[$20>>2]|0;
   $22 = $i;
   $23 = $22&255;
   $24 = (($21) + (($23*136)|0)|0);
   $25 = (_overGame_handleEnemySight($24)|0);
   $26 = $25 << 24 >> 24;
   $27 = ($26|0)!=(0);
   if ($27) {
    label = 5;
    break;
   }
  }
  $28 = $i;
  $29 = (($28) + 1)<<24>>24;
  $i = $29;
 }
 if ((label|0) == 5) {
  $1 = 1;
  $30 = $1;
  STACKTOP = sp;return ($30|0);
 }
 else if ((label|0) == 8) {
  $1 = 0;
  $30 = $1;
  STACKTOP = sp;return ($30|0);
 }
 return 0|0;
}
function _overGame_init() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _overGame_update() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $fightPreScreen$byval_copy = 0, $newPos = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $fightPreScreen$byval_copy = sp;
 $newPos = sp + 24|0;
 $1 = HEAP32[(((9832) + 76|0))>>2]|0;
 $2 = ($1|0)!=(0|0);
 if (!($2)) {
  STACKTOP = sp;return;
 }
 $3 = HEAP32[(((9832) + 56|0))>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[(((9832) + 56|0))>>2] = $4;
 $5 = HEAP32[(((9832) + 56|0))>>2]|0;
 $6 = ($5|0)==(0);
 if ($6) {
  $7 = HEAP32[(((9832) + 76|0))>>2]|0;
  $8 = (($7) + 4|0);
  $9 = $newPos;
  $10 = $8;
  ;HEAP32[$9+0>>2]=HEAP32[$10+0>>2]|0;HEAP32[$9+4>>2]=HEAP32[$10+4>>2]|0;
  $11 = HEAP8[(((9832) + 216|0))]|0;
  $12 = $11&255;
  if ((($12|0) == 3)) {
   $22 = ($newPos);
   $23 = HEAP32[$22>>2]|0;
   $24 = (($23) + 1)|0;
   HEAP32[$22>>2] = $24;
  } else if ((($12|0) == 2)) {
   $19 = ($newPos);
   $20 = HEAP32[$19>>2]|0;
   $21 = (($20) + -1)|0;
   HEAP32[$19>>2] = $21;
  } else if ((($12|0) == 1)) {
   $16 = (($newPos) + 4|0);
   $17 = HEAP32[$16>>2]|0;
   $18 = (($17) + 1)|0;
   HEAP32[$16>>2] = $18;
  } else if ((($12|0) == 0)) {
   $13 = (($newPos) + 4|0);
   $14 = HEAP32[$13>>2]|0;
   $15 = (($14) + -1)|0;
   HEAP32[$13>>2] = $15;
  }
  $25 = ($newPos);
  $26 = HEAP32[$25>>2]|0;
  $27 = HEAP32[(((9832) + 348|0))>>2]|0;
  $28 = (($27) + 76|0);
  $29 = ($28);
  $30 = HEAP32[$29>>2]|0;
  $31 = ($26|0)==($30|0);
  do {
   if ($31) {
    $32 = (($newPos) + 4|0);
    $33 = HEAP32[$32>>2]|0;
    $34 = HEAP32[(((9832) + 348|0))>>2]|0;
    $35 = (($34) + 76|0);
    $36 = (($35) + 4|0);
    $37 = HEAP32[$36>>2]|0;
    $38 = ($33|0)==($37|0);
    if (!($38)) {
     label = 11;
     break;
    }
    $39 = HEAP32[(((9832) + 76|0))>>2]|0;
    $40 = ($39);
    HEAP8[$40] = 0;
    HEAP8[(((9832) + 219|0))] = 0;
    $41 = $fightPreScreen$byval_copy;
    $42 = $fightPreScreen$byval_copy;
    $43 = (9696);
    ;HEAP32[$42+0>>2]=HEAP32[$43+0>>2]|0;HEAP32[$42+4>>2]=HEAP32[$43+4>>2]|0;HEAP32[$42+8>>2]=HEAP32[$43+8>>2]|0;HEAP32[$42+12>>2]=HEAP32[$43+12>>2]|0;HEAP32[$42+16>>2]=HEAP32[$43+16>>2]|0;HEAP32[$42+20>>2]=HEAP32[$43+20>>2]|0;
    _switchToScreen($fightPreScreen$byval_copy);
    $44 = $fightPreScreen$byval_copy;
   } else {
    label = 11;
   }
  } while(0);
  if ((label|0) == 11) {
   $45 = HEAP32[(((9832) + 76|0))>>2]|0;
   $46 = (($45) + 4|0);
   $47 = $46;
   $48 = $newPos;
   ;HEAP32[$47+0>>2]=HEAP32[$48+0>>2]|0;HEAP32[$47+4>>2]=HEAP32[$48+4>>2]|0;
   HEAP32[(((9832) + 56|0))>>2] = 6;
   HEAP8[(((9832) + 4|0))] = 1;
  }
 }
 STACKTOP = sp;return;
}
function _overGame_render() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0;
 var $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0;
 var $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buffer = 0;
 var $i = 0, $vararg_buffer = 0, $vararg_lifetime_bitcast = 0, $vararg_ptr = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 368|0;
 $$byval_copy8 = sp;
 $$byval_copy7 = sp + 16|0;
 $$byval_copy6 = sp + 24|0;
 $$byval_copy5 = sp + 40|0;
 $$byval_copy4 = sp + 48|0;
 $$byval_copy3 = sp + 56|0;
 $$byval_copy2 = sp + 64|0;
 $$byval_copy1 = sp + 72|0;
 $$byval_copy = sp + 80|0;
 $vararg_buffer = sp + 360|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $8 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $9 = HEAP32[((9832))>>2]|0;
 _asciiClearScreen($9);
 $10 = HEAP32[(((9832) + 348|0))>>2]|0;
 $11 = $$byval_copy;
 $12 = $$byval_copy;
 $13 = $10;
 _memcpy(($12|0),($13|0),276)|0;
 _renderOverWorld($$byval_copy);
 $14 = $$byval_copy;
 $15 = HEAP32[(((9832) + 76|0))>>2]|0;
 $16 = ($15|0)!=(0|0);
 if ($16) {
  $17 = HEAP32[((9832))>>2]|0;
  $18 = ($1);
  HEAP8[$18] = 33;
  $19 = (($1) + 1|0);
  HEAP8[$19] = 1;
  $20 = (($1) + 2|0);
  HEAP8[$20] = 0;
  $21 = (($1) + 3|0);
  HEAP8[$21] = 0;
  $22 = ($2);
  $23 = HEAP32[(((9832) + 76|0))>>2]|0;
  $24 = (($23) + 4|0);
  $25 = ($24);
  $26 = HEAP32[$25>>2]|0;
  HEAP32[$22>>2] = $26;
  $27 = (($2) + 4|0);
  $28 = HEAP32[(((9832) + 76|0))>>2]|0;
  $29 = (($28) + 4|0);
  $30 = (($29) + 4|0);
  $31 = HEAP32[$30>>2]|0;
  $32 = (($31) - 1)|0;
  HEAP32[$27>>2] = $32;
  $33 = $$byval_copy1;
  $34 = $$byval_copy1;
  $35 = $1;
  ;HEAP8[$34+0|0]=HEAP8[$35+0|0]|0;HEAP8[$34+1|0]=HEAP8[$35+1|0]|0;HEAP8[$34+2|0]=HEAP8[$35+2|0]|0;HEAP8[$34+3|0]=HEAP8[$35+3|0]|0;
  $36 = $$byval_copy2;
  $37 = $$byval_copy2;
  $38 = $2;
  ;HEAP32[$37+0>>2]=HEAP32[$38+0>>2]|0;HEAP32[$37+4>>2]=HEAP32[$38+4>>2]|0;
  _asciiDrawChar($17,$$byval_copy1,$$byval_copy2);
  $39 = $$byval_copy2;
  $40 = $$byval_copy1;
 }
 $41 = HEAP32[(((9832) + 348|0))>>2]|0;
 $42 = ($41);
 $43 = HEAP32[$42>>2]|0;
 $44 = (_strlen(($43|0))|0);
 $45 = $44&255;
 $i = $45;
 $46 = HEAP32[((9832))>>2]|0;
 $47 = HEAP32[(((9832) + 348|0))>>2]|0;
 $48 = ($47);
 $49 = HEAP32[$48>>2]|0;
 $50 = ($3);
 $51 = $i;
 $52 = $51&255;
 $53 = (80 - ($52))|0;
 HEAP32[$50>>2] = $53;
 $54 = (($3) + 4|0);
 HEAP32[$54>>2] = 24;
 $55 = $$byval_copy3;
 $56 = $$byval_copy3;
 $57 = $3;
 ;HEAP32[$56+0>>2]=HEAP32[$57+0>>2]|0;HEAP32[$56+4>>2]=HEAP32[$57+4>>2]|0;
 _asciiDrawTextColored($46,$49,$$byval_copy3,7,0);
 $58 = $$byval_copy3;
 $59 = ($buffer);
 $60 = HEAP32[(((9832) + 344|0))>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $60;
 $61 = (_sprintf(($59|0),((18000)|0),($vararg_buffer|0))|0);
 $62 = $61&255;
 $i = $62;
 $63 = HEAP32[((9832))>>2]|0;
 $64 = ($buffer);
 $65 = ($4);
 $66 = $i;
 $67 = $66&255;
 $68 = (80 - ($67))|0;
 HEAP32[$65>>2] = $68;
 $69 = (($4) + 4|0);
 HEAP32[$69>>2] = 0;
 $70 = $$byval_copy4;
 $71 = $$byval_copy4;
 $72 = $4;
 ;HEAP32[$71+0>>2]=HEAP32[$72+0>>2]|0;HEAP32[$71+4>>2]=HEAP32[$72+4>>2]|0;
 _asciiDrawTextColored($63,$64,$$byval_copy4,7,0);
 $73 = $$byval_copy4;
 $74 = HEAP32[((9832))>>2]|0;
 $75 = ($5);
 HEAP8[$75] = 32;
 $76 = (($5) + 1|0);
 HEAP8[$76] = 7;
 $77 = (($5) + 2|0);
 HEAP8[$77] = 0;
 $78 = (($5) + 3|0);
 HEAP8[$78] = 0;
 $79 = ($6);
 $80 = ($79);
 HEAP32[$80>>2] = 61;
 $81 = (($79) + 4|0);
 HEAP32[$81>>2] = 2;
 $82 = (($6) + 8|0);
 $83 = ($82);
 HEAP32[$83>>2] = 19;
 $84 = (($82) + 4|0);
 HEAP32[$84>>2] = 21;
 $85 = $$byval_copy5;
 $86 = $$byval_copy5;
 $87 = $5;
 ;HEAP8[$86+0|0]=HEAP8[$87+0|0]|0;HEAP8[$86+1|0]=HEAP8[$87+1|0]|0;HEAP8[$86+2|0]=HEAP8[$87+2|0]|0;HEAP8[$86+3|0]=HEAP8[$87+3|0]|0;
 $88 = $$byval_copy6;
 $89 = $$byval_copy6;
 $90 = $6;
 ;HEAP32[$89+0>>2]=HEAP32[$90+0>>2]|0;HEAP32[$89+4>>2]=HEAP32[$90+4>>2]|0;HEAP32[$89+8>>2]=HEAP32[$90+8>>2]|0;HEAP32[$89+12>>2]=HEAP32[$90+12>>2]|0;
 _asciiFillRect($74,$$byval_copy5,$$byval_copy6);
 $91 = $$byval_copy6;
 $92 = $$byval_copy5;
 $i = 0;
 while(1) {
  $93 = $i;
  $94 = $93&255;
  $95 = ($94|0)<(5);
  if (!($95)) {
   break;
  }
  $96 = $i;
  $97 = $96&255;
  $98 = HEAP8[(((9832) + 340|0))]|0;
  $99 = $98&255;
  $100 = ($97|0)<($99|0);
  if ($100) {
   $101 = $i;
   $102 = $101&255;
   $103 = ((((9832) + 220|0)) + (($102*24)|0)|0);
   $104 = ($7);
   HEAP32[$104>>2] = 61;
   $105 = (($7) + 4|0);
   $106 = $i;
   $107 = $106&255;
   $108 = $107<<2;
   $109 = (3 + ($108))|0;
   HEAP32[$105>>2] = $109;
   $110 = $$byval_copy7;
   $111 = $$byval_copy7;
   $112 = $7;
   ;HEAP32[$111+0>>2]=HEAP32[$112+0>>2]|0;HEAP32[$111+4>>2]=HEAP32[$112+4>>2]|0;
   _drawElementityBasicProfile($103,$$byval_copy7);
   $113 = $$byval_copy7;
  } else {
   $114 = HEAP32[((9832))>>2]|0;
   $115 = ($8);
   $116 = ($115);
   HEAP32[$116>>2] = 61;
   $117 = (($115) + 4|0);
   $118 = $i;
   $119 = $118&255;
   $120 = $119<<2;
   $121 = (3 + ($120))|0;
   HEAP32[$117>>2] = $121;
   $122 = (($8) + 8|0);
   $123 = ($122);
   HEAP32[$123>>2] = 3;
   $124 = (($122) + 4|0);
   HEAP32[$124>>2] = 3;
   $125 = $$byval_copy8;
   $126 = $$byval_copy8;
   $127 = $8;
   ;HEAP32[$126+0>>2]=HEAP32[$127+0>>2]|0;HEAP32[$126+4>>2]=HEAP32[$127+4>>2]|0;HEAP32[$126+8>>2]=HEAP32[$127+8>>2]|0;HEAP32[$126+12>>2]=HEAP32[$127+12>>2]|0;
   _asciiDrawFilledRectangleColored($114,$$byval_copy8,7,0);
   $128 = $$byval_copy8;
  }
  $129 = $i;
  $130 = (($129) + 1)<<24>>24;
  $i = $130;
 }
 STACKTOP = sp;return;
}
function _overGame_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if (!($5)) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 if ((($7|0) == 6)) {
  _overGame_movePlayer(1);
 } else if ((($7|0) == 5)) {
  _overGame_movePlayer(0);
 } else if ((($7|0) == 8)) {
  _overGame_movePlayer(2);
 } else if ((($7|0) == 7)) {
  _overGame_movePlayer(3);
 }
 STACKTOP = sp;return;
}
function _overGame_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _overGame_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _shop_init() {
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $7 = 0, $8 = 0, $9 = 0, $i = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 HEAP32[(((9832) + 60|0))>>2] = 0;
 $1 = HEAP32[(((9832) + 348|0))>>2]|0;
 $2 = (($1) + 232|0);
 $3 = $2;
 dest=$3+0|0; stop=dest+44|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));;
 $i = 0;
 while(1) {
  $4 = $i;
  $5 = $4&255;
  $6 = HEAP8[(((9832) + 340|0))]|0;
  $7 = $6&255;
  $8 = ($5|0)<($7|0);
  if (!($8)) {
   break;
  }
  $9 = $i;
  $10 = $9&255;
  $11 = ((((9832) + 220|0)) + (($10*24)|0)|0);
  $12 = ($11);
  $13 = (($12) + 5|0);
  $14 = HEAP8[$13]|0;
  $15 = $14&255;
  $16 = $i;
  $17 = $16&255;
  $18 = ((((9832) + 220|0)) + (($17*24)|0)|0);
  $19 = (($18) + 8|0);
  $20 = HEAP8[$19]|0;
  $21 = $20&255;
  $22 = (($15) - ($21))|0;
  $23 = $i;
  $24 = $23&255;
  $25 = (($24) + 1)|0;
  $26 = HEAP32[(((9832) + 348|0))>>2]|0;
  $27 = (($26) + 232|0);
  $28 = (($27) + ($25<<2)|0);
  HEAP32[$28>>2] = $22;
  $29 = $i;
  $30 = $29&255;
  $31 = (($30) + 1)|0;
  $32 = HEAP32[(((9832) + 348|0))>>2]|0;
  $33 = (($32) + 232|0);
  $34 = (($33) + ($31<<2)|0);
  $35 = HEAP32[$34>>2]|0;
  $36 = HEAP32[(((9832) + 348|0))>>2]|0;
  $37 = (($36) + 232|0);
  $38 = ($37);
  $39 = HEAP32[$38>>2]|0;
  $40 = (($39) + ($35))|0;
  HEAP32[$38>>2] = $40;
  $41 = $i;
  $42 = (($41) + 1)<<24>>24;
  $i = $42;
 }
 $i = 0;
 while(1) {
  $43 = $i;
  $44 = $43&255;
  $45 = HEAP32[(((9832) + 348|0))>>2]|0;
  $46 = (($45) + 228|0);
  $47 = HEAP8[$46]|0;
  $48 = $47&255;
  $49 = ($44|0)<($48|0);
  if (!($49)) {
   break;
  }
  $50 = $i;
  $51 = $50&255;
  $52 = HEAP32[(((9832) + 348|0))>>2]|0;
  $53 = (($52) + 108|0);
  $54 = (($53) + (($51*24)|0)|0);
  $55 = (($54) + 12|0);
  $56 = HEAP32[$55>>2]|0;
  $57 = $i;
  $58 = $57&255;
  $59 = (($58) + 6)|0;
  $60 = HEAP32[(((9832) + 348|0))>>2]|0;
  $61 = (($60) + 232|0);
  $62 = (($61) + ($59<<2)|0);
  HEAP32[$62>>2] = $56;
  $63 = $i;
  $64 = (($63) + 1)<<24>>24;
  $i = $64;
 }
 STACKTOP = sp;return;
}
function _shop_update() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = sp;return;
}
function _shop_render() {
 var $$byval_copy = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy15 = 0, $$byval_copy16 = 0, $$byval_copy17 = 0, $$byval_copy18 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0;
 var $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0;
 var $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0;
 var $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0;
 var $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0;
 var $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0;
 var $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0;
 var $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $buffer = 0, $i = 0, $len = 0, $strLeave = 0;
 var $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, $vararg_lifetime_bitcast = 0, $vararg_lifetime_bitcast2 = 0, $vararg_lifetime_bitcast5 = 0, $vararg_lifetime_bitcast8 = 0, $vararg_ptr = 0, $vararg_ptr3 = 0, $vararg_ptr6 = 0, $vararg_ptr9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0;
 $$byval_copy18 = sp;
 $$byval_copy17 = sp + 8|0;
 $$byval_copy16 = sp + 24|0;
 $$byval_copy15 = sp + 32|0;
 $$byval_copy14 = sp + 40|0;
 $$byval_copy13 = sp + 56|0;
 $$byval_copy12 = sp + 64|0;
 $$byval_copy11 = sp + 72|0;
 $$byval_copy10 = sp + 80|0;
 $$byval_copy = sp + 88|0;
 $vararg_buffer7 = sp + 104|0;
 $vararg_lifetime_bitcast8 = $vararg_buffer7;
 $vararg_buffer4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast5 = $vararg_buffer4;
 $vararg_buffer1 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast2 = $vararg_buffer1;
 $vararg_buffer = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $vararg_lifetime_bitcast = $vararg_buffer;
 $buffer = STACKTOP; STACKTOP = STACKTOP + 32|0;
 $1 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $2 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $3 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $4 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $5 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $6 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $7 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $8 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $9 = STACKTOP; STACKTOP = STACKTOP + 16|0;
 $10 = STACKTOP; STACKTOP = STACKTOP + 8|0;
 $strLeave = (18056);
 $11 = HEAP32[((9832))>>2]|0;
 $12 = ($1);
 $13 = ($12);
 HEAP32[$13>>2] = 18;
 $14 = (($12) + 4|0);
 HEAP32[$14>>2] = 0;
 $15 = (($1) + 8|0);
 $16 = ($15);
 HEAP32[$16>>2] = 44;
 $17 = (($15) + 4|0);
 HEAP32[$17>>2] = 25;
 $18 = $$byval_copy;
 $19 = $$byval_copy;
 $20 = $1;
 ;HEAP32[$19+0>>2]=HEAP32[$20+0>>2]|0;HEAP32[$19+4>>2]=HEAP32[$20+4>>2]|0;HEAP32[$19+8>>2]=HEAP32[$20+8>>2]|0;HEAP32[$19+12>>2]=HEAP32[$20+12>>2]|0;
 _asciiDrawFilledRectangleColored($11,$$byval_copy,7,0);
 $21 = $$byval_copy;
 $22 = ($buffer);
 $23 = HEAP32[(((9832) + 344|0))>>2]|0;
 $vararg_ptr = ($vararg_buffer);
 HEAP32[$vararg_ptr>>2] = $23;
 $24 = (_sprintf(($22|0),((18072)|0),($vararg_buffer|0))|0);
 $25 = $24&255;
 $len = $25;
 $26 = HEAP32[((9832))>>2]|0;
 $27 = ($buffer);
 $28 = ($2);
 $29 = $len;
 $30 = $29&255;
 $31 = (($30|0) / 2)&-1;
 $32 = (40 - ($31))|0;
 HEAP32[$28>>2] = $32;
 $33 = (($2) + 4|0);
 HEAP32[$33>>2] = 0;
 $34 = $$byval_copy10;
 $35 = $$byval_copy10;
 $36 = $2;
 ;HEAP32[$35+0>>2]=HEAP32[$36+0>>2]|0;HEAP32[$35+4>>2]=HEAP32[$36+4>>2]|0;
 _asciiDrawTextColored($26,$27,$$byval_copy10,7,0);
 $37 = $$byval_copy10;
 $38 = ($buffer);
 $39 = HEAP32[(((9832) + 348|0))>>2]|0;
 $40 = (($39) + 232|0);
 $41 = ($40);
 $42 = HEAP32[$41>>2]|0;
 $vararg_ptr3 = ($vararg_buffer1);
 HEAP32[$vararg_ptr3>>2] = $42;
 (_sprintf(($38|0),((18088)|0),($vararg_buffer1|0))|0);
 $43 = HEAP32[((9832))>>2]|0;
 $44 = ($buffer);
 $45 = ($3);
 HEAP32[$45>>2] = 21;
 $46 = (($3) + 4|0);
 HEAP32[$46>>2] = 1;
 $47 = HEAP32[(((9832) + 60|0))>>2]|0;
 $48 = ($47|0)==(0);
 $49 = $48&1;
 $50 = (18040 + ($49)|0);
 $51 = HEAP8[$50]|0;
 $52 = HEAP32[(((9832) + 60|0))>>2]|0;
 $53 = ($52|0)==(0);
 $54 = $53&1;
 $55 = (18048 + ($54)|0);
 $56 = HEAP8[$55]|0;
 $57 = $$byval_copy11;
 $58 = $$byval_copy11;
 $59 = $3;
 ;HEAP32[$58+0>>2]=HEAP32[$59+0>>2]|0;HEAP32[$58+4>>2]=HEAP32[$59+4>>2]|0;
 _asciiDrawTextColored($43,$44,$$byval_copy11,$51,$56);
 $60 = $$byval_copy11;
 $61 = HEAP32[((9832))>>2]|0;
 $62 = $strLeave;
 $63 = ($4);
 HEAP32[$63>>2] = 34;
 $64 = (($4) + 4|0);
 HEAP32[$64>>2] = 22;
 $65 = HEAP32[(((9832) + 60|0))>>2]|0;
 $66 = ($65|0)==(11);
 $67 = $66&1;
 $68 = (18040 + ($67)|0);
 $69 = HEAP8[$68]|0;
 $70 = HEAP32[(((9832) + 60|0))>>2]|0;
 $71 = ($70|0)==(11);
 $72 = $71&1;
 $73 = (18048 + ($72)|0);
 $74 = HEAP8[$73]|0;
 $75 = $$byval_copy12;
 $76 = $$byval_copy12;
 $77 = $4;
 ;HEAP32[$76+0>>2]=HEAP32[$77+0>>2]|0;HEAP32[$76+4>>2]=HEAP32[$77+4>>2]|0;
 _asciiDrawTextColored($61,$62,$$byval_copy12,$69,$74);
 $78 = $$byval_copy12;
 $i = 0;
 while(1) {
  $79 = $i;
  $80 = $79&255;
  $81 = ($80|0)<(5);
  if (!($81)) {
   break;
  }
  $82 = $i;
  $83 = $82&255;
  $84 = HEAP8[(((9832) + 340|0))]|0;
  $85 = $84&255;
  $86 = ($83|0)<($85|0);
  if ($86) {
   $87 = $i;
   $88 = $87&255;
   $89 = ((((9832) + 220|0)) + (($88*24)|0)|0);
   $90 = ($5);
   HEAP32[$90>>2] = 21;
   $91 = (($5) + 4|0);
   $92 = $i;
   $93 = $92&255;
   $94 = $93<<2;
   $95 = (2 + ($94))|0;
   HEAP32[$91>>2] = $95;
   $96 = $$byval_copy13;
   $97 = $$byval_copy13;
   $98 = $5;
   ;HEAP32[$97+0>>2]=HEAP32[$98+0>>2]|0;HEAP32[$97+4>>2]=HEAP32[$98+4>>2]|0;
   _drawElementityHPProfile($89,$$byval_copy13);
   $99 = $$byval_copy13;
  } else {
   $100 = HEAP32[((9832))>>2]|0;
   $101 = ($6);
   $102 = ($101);
   HEAP32[$102>>2] = 21;
   $103 = (($101) + 4|0);
   $104 = $i;
   $105 = $104&255;
   $106 = $105<<2;
   $107 = (2 + ($106))|0;
   HEAP32[$103>>2] = $107;
   $108 = (($6) + 8|0);
   $109 = ($108);
   HEAP32[$109>>2] = 3;
   $110 = (($108) + 4|0);
   HEAP32[$110>>2] = 3;
   $111 = $$byval_copy14;
   $112 = $$byval_copy14;
   $113 = $6;
   ;HEAP32[$112+0>>2]=HEAP32[$113+0>>2]|0;HEAP32[$112+4>>2]=HEAP32[$113+4>>2]|0;HEAP32[$112+8>>2]=HEAP32[$113+8>>2]|0;HEAP32[$112+12>>2]=HEAP32[$113+12>>2]|0;
   _asciiDrawFilledRectangleColored($100,$$byval_copy14,7,0);
   $114 = $$byval_copy14;
  }
  $115 = ($buffer);
  $116 = $i;
  $117 = $116&255;
  $118 = (($117) + 1)|0;
  $119 = HEAP32[(((9832) + 348|0))>>2]|0;
  $120 = (($119) + 232|0);
  $121 = (($120) + ($118<<2)|0);
  $122 = HEAP32[$121>>2]|0;
  $vararg_ptr6 = ($vararg_buffer4);
  HEAP32[$vararg_ptr6>>2] = $122;
  (_sprintf(($115|0),((18104)|0),($vararg_buffer4|0))|0);
  $123 = HEAP32[((9832))>>2]|0;
  $124 = ($buffer);
  $125 = ($7);
  HEAP32[$125>>2] = 25;
  $126 = (($7) + 4|0);
  $127 = $i;
  $128 = $127&255;
  $129 = $128<<2;
  $130 = (4 + ($129))|0;
  HEAP32[$126>>2] = $130;
  $131 = HEAP32[(((9832) + 60|0))>>2]|0;
  $132 = $i;
  $133 = $132&255;
  $134 = (($133) + 1)|0;
  $135 = ($131|0)==($134|0);
  $136 = $135&1;
  $137 = (18040 + ($136)|0);
  $138 = HEAP8[$137]|0;
  $139 = HEAP32[(((9832) + 60|0))>>2]|0;
  $140 = $i;
  $141 = $140&255;
  $142 = (($141) + 1)|0;
  $143 = ($139|0)==($142|0);
  $144 = $143&1;
  $145 = (18048 + ($144)|0);
  $146 = HEAP8[$145]|0;
  $147 = $$byval_copy15;
  $148 = $$byval_copy15;
  $149 = $7;
  ;HEAP32[$148+0>>2]=HEAP32[$149+0>>2]|0;HEAP32[$148+4>>2]=HEAP32[$149+4>>2]|0;
  _asciiDrawTextColored($123,$124,$$byval_copy15,$138,$146);
  $150 = $$byval_copy15;
  $151 = $i;
  $152 = $151&255;
  $153 = HEAP32[(((9832) + 348|0))>>2]|0;
  $154 = (($153) + 228|0);
  $155 = HEAP8[$154]|0;
  $156 = $155&255;
  $157 = ($152|0)<($156|0);
  if ($157) {
   $158 = HEAP32[(((9832) + 348|0))>>2]|0;
   $159 = (($158) + 108|0);
   $160 = ($159);
   $161 = $i;
   $162 = $161&255;
   $163 = (($160) + (($162*24)|0)|0);
   $164 = ($8);
   HEAP32[$164>>2] = 43;
   $165 = (($8) + 4|0);
   $166 = $i;
   $167 = $166&255;
   $168 = $167<<2;
   $169 = (2 + ($168))|0;
   HEAP32[$165>>2] = $169;
   $170 = $$byval_copy16;
   $171 = $$byval_copy16;
   $172 = $8;
   ;HEAP32[$171+0>>2]=HEAP32[$172+0>>2]|0;HEAP32[$171+4>>2]=HEAP32[$172+4>>2]|0;
   _drawElementitySmallProfile($163,$$byval_copy16);
   $173 = $$byval_copy16;
  } else {
   $174 = HEAP32[((9832))>>2]|0;
   $175 = ($9);
   $176 = ($175);
   HEAP32[$176>>2] = 43;
   $177 = (($175) + 4|0);
   $178 = $i;
   $179 = $178&255;
   $180 = $179<<2;
   $181 = (2 + ($180))|0;
   HEAP32[$177>>2] = $181;
   $182 = (($9) + 8|0);
   $183 = ($182);
   HEAP32[$183>>2] = 3;
   $184 = (($182) + 4|0);
   HEAP32[$184>>2] = 3;
   $185 = $$byval_copy17;
   $186 = $$byval_copy17;
   $187 = $9;
   ;HEAP32[$186+0>>2]=HEAP32[$187+0>>2]|0;HEAP32[$186+4>>2]=HEAP32[$187+4>>2]|0;HEAP32[$186+8>>2]=HEAP32[$187+8>>2]|0;HEAP32[$186+12>>2]=HEAP32[$187+12>>2]|0;
   _asciiDrawFilledRectangleColored($174,$$byval_copy17,7,0);
   $188 = $$byval_copy17;
  }
  $189 = ($buffer);
  $190 = $i;
  $191 = $190&255;
  $192 = (($191) + 6)|0;
  $193 = HEAP32[(((9832) + 348|0))>>2]|0;
  $194 = (($193) + 232|0);
  $195 = (($194) + ($192<<2)|0);
  $196 = HEAP32[$195>>2]|0;
  $vararg_ptr9 = ($vararg_buffer7);
  HEAP32[$vararg_ptr9>>2] = $196;
  (_sprintf(($189|0),((18120)|0),($vararg_buffer7|0))|0);
  $197 = HEAP32[((9832))>>2]|0;
  $198 = ($buffer);
  $199 = ($10);
  HEAP32[$199>>2] = 47;
  $200 = (($10) + 4|0);
  $201 = $i;
  $202 = $201&255;
  $203 = $202<<2;
  $204 = (4 + ($203))|0;
  HEAP32[$200>>2] = $204;
  $205 = HEAP32[(((9832) + 60|0))>>2]|0;
  $206 = $i;
  $207 = $206&255;
  $208 = (($207) + 6)|0;
  $209 = ($205|0)==($208|0);
  $210 = $209&1;
  $211 = (18040 + ($210)|0);
  $212 = HEAP8[$211]|0;
  $213 = HEAP32[(((9832) + 60|0))>>2]|0;
  $214 = $i;
  $215 = $214&255;
  $216 = (($215) + 6)|0;
  $217 = ($213|0)==($216|0);
  $218 = $217&1;
  $219 = (18048 + ($218)|0);
  $220 = HEAP8[$219]|0;
  $221 = $$byval_copy18;
  $222 = $$byval_copy18;
  $223 = $10;
  ;HEAP32[$222+0>>2]=HEAP32[$223+0>>2]|0;HEAP32[$222+4>>2]=HEAP32[$223+4>>2]|0;
  _asciiDrawTextColored($197,$198,$$byval_copy18,$212,$220);
  $224 = $$byval_copy18;
  $225 = $i;
  $226 = (($225) + 1)<<24>>24;
  $i = $226;
 }
 STACKTOP = sp;return;
}
function _shop_keyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0;
 var $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0;
 var $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0;
 var $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0;
 var $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $i = 0, $overGameScreen$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 56|0;
 $overGameScreen$byval_copy = sp;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 $4 = $2;
 $5 = ($4<<24>>24)!=(0);
 if ($5) {
  STACKTOP = sp;return;
 }
 $6 = $1;
 $7 = $6&255;
 if ((($7|0) == 6)) {
  $12 = HEAP32[(((9832) + 60|0))>>2]|0;
  $13 = (($12) + 1)|0;
  $14 = (($13>>>0) % 12)&-1;
  HEAP32[(((9832) + 60|0))>>2] = $14;
  HEAP8[(((9832) + 4|0))] = 1;
 } else if ((($7|0) == 5)) {
  $8 = HEAP32[(((9832) + 60|0))>>2]|0;
  $9 = ($8|0)==(0);
  if ($9) {
   HEAP32[(((9832) + 60|0))>>2] = 11;
  } else {
   $10 = HEAP32[(((9832) + 60|0))>>2]|0;
   $11 = (($10) + -1)|0;
   HEAP32[(((9832) + 60|0))>>2] = $11;
  }
  HEAP8[(((9832) + 4|0))] = 1;
 } else if ((($7|0) == 2)) {
  $15 = HEAP32[(((9832) + 60|0))>>2]|0;
  switch ($15|0) {
  case 10: case 9: case 8: case 7: case 6:  {
   $105 = HEAP32[(((9832) + 60|0))>>2]|0;
   $106 = (($105) - 6)|0;
   $107 = $106&255;
   $i = $107;
   $108 = $i;
   $109 = $108&255;
   $110 = HEAP32[(((9832) + 348|0))>>2]|0;
   $111 = (($110) + 228|0);
   $112 = HEAP8[$111]|0;
   $113 = $112&255;
   $114 = ($109|0)<($113|0);
   do {
    if ($114) {
     $115 = HEAP32[(((9832) + 344|0))>>2]|0;
     $116 = HEAP32[(((9832) + 60|0))>>2]|0;
     $117 = HEAP32[(((9832) + 348|0))>>2]|0;
     $118 = (($117) + 232|0);
     $119 = (($118) + ($116<<2)|0);
     $120 = HEAP32[$119>>2]|0;
     $121 = ($115>>>0)>=($120>>>0);
     if (!($121)) {
      break;
     }
     $122 = HEAP8[(((9832) + 340|0))]|0;
     $123 = $122&255;
     $124 = ($123|0)<(5);
     if (!($124)) {
      break;
     }
     $125 = HEAP32[(((9832) + 60|0))>>2]|0;
     $126 = HEAP32[(((9832) + 348|0))>>2]|0;
     $127 = (($126) + 232|0);
     $128 = (($127) + ($125<<2)|0);
     $129 = HEAP32[$128>>2]|0;
     $130 = HEAP32[(((9832) + 344|0))>>2]|0;
     $131 = (($130) - ($129))|0;
     HEAP32[(((9832) + 344|0))>>2] = $131;
     $132 = HEAP8[(((9832) + 340|0))]|0;
     $133 = (($132) + 1)<<24>>24;
     HEAP8[(((9832) + 340|0))] = $133;
     $134 = $132&255;
     $135 = ((((9832) + 220|0)) + (($134*24)|0)|0);
     $136 = $i;
     $137 = $136&255;
     $138 = HEAP32[(((9832) + 348|0))>>2]|0;
     $139 = (($138) + 108|0);
     $140 = (($139) + (($137*24)|0)|0);
     $141 = $135;
     $142 = $140;
     ;HEAP32[$141+0>>2]=HEAP32[$142+0>>2]|0;HEAP32[$141+4>>2]=HEAP32[$142+4>>2]|0;HEAP32[$141+8>>2]=HEAP32[$142+8>>2]|0;HEAP32[$141+12>>2]=HEAP32[$142+12>>2]|0;HEAP32[$141+16>>2]=HEAP32[$142+16>>2]|0;HEAP32[$141+20>>2]=HEAP32[$142+20>>2]|0;
     $143 = $i;
     $144 = $143&255;
     $145 = (($144) + 1)|0;
     $146 = HEAP32[(((9832) + 348|0))>>2]|0;
     $147 = (($146) + 228|0);
     $148 = HEAP8[$147]|0;
     $149 = $148&255;
     $150 = ($145|0)!=($149|0);
     if ($150) {
      $151 = HEAP32[(((9832) + 348|0))>>2]|0;
      $152 = (($151) + 108|0);
      $153 = ($152);
      $154 = $i;
      $155 = $154&255;
      $156 = (($153) + (($155*24)|0)|0);
      $157 = $156;
      $158 = HEAP32[(((9832) + 348|0))>>2]|0;
      $159 = (($158) + 108|0);
      $160 = ($159);
      $161 = $i;
      $162 = $161&255;
      $163 = (($160) + (($162*24)|0)|0);
      $164 = (($163) + 24|0);
      $165 = $164;
      $166 = HEAP32[(((9832) + 348|0))>>2]|0;
      $167 = (($166) + 228|0);
      $168 = HEAP8[$167]|0;
      $169 = $168&255;
      $170 = $i;
      $171 = $170&255;
      $172 = (($169) - ($171))|0;
      $173 = (($172) - 1)|0;
      $174 = ($173*24)|0;
      _memmove(($157|0),($165|0),($174|0))|0;
      $175 = HEAP32[(((9832) + 348|0))>>2]|0;
      $176 = (($175) + 232|0);
      $177 = ($176);
      $178 = $i;
      $179 = $178&255;
      $180 = (($177) + ($179<<2)|0);
      $181 = $180;
      $182 = HEAP32[(((9832) + 348|0))>>2]|0;
      $183 = (($182) + 232|0);
      $184 = ($183);
      $185 = $i;
      $186 = $185&255;
      $187 = (($184) + ($186<<2)|0);
      $188 = (($187) + 4|0);
      $189 = $188;
      $190 = HEAP32[(((9832) + 348|0))>>2]|0;
      $191 = (($190) + 228|0);
      $192 = HEAP8[$191]|0;
      $193 = $192&255;
      $194 = $i;
      $195 = $194&255;
      $196 = (($193) - ($195))|0;
      $197 = (($196) - 1)|0;
      $198 = $197<<2;
      _memmove(($181|0),($189|0),($198|0))|0;
      $199 = HEAP32[(((9832) + 348|0))>>2]|0;
      $200 = (($199) + 228|0);
      $201 = HEAP8[$200]|0;
      $202 = $201&255;
      $203 = (($202) - 1)|0;
      $204 = HEAP32[(((9832) + 348|0))>>2]|0;
      $205 = (($204) + 232|0);
      $206 = (($205) + ($203<<2)|0);
      HEAP32[$206>>2] = 0;
     }
     $207 = HEAP32[(((9832) + 348|0))>>2]|0;
     $208 = (($207) + 228|0);
     $209 = HEAP8[$208]|0;
     $210 = (($209) + -1)<<24>>24;
     HEAP8[$208] = $210;
    }
   } while(0);
   break;
  }
  case 5: case 4: case 3: case 2: case 1:  {
   $59 = HEAP32[(((9832) + 60|0))>>2]|0;
   $60 = (($59) - 1)|0;
   $61 = $60&255;
   $i = $61;
   $62 = $i;
   $63 = $62&255;
   $64 = HEAP8[(((9832) + 340|0))]|0;
   $65 = $64&255;
   $66 = ($63|0)<($65|0);
   do {
    if ($66) {
     $67 = HEAP32[(((9832) + 344|0))>>2]|0;
     $68 = HEAP32[(((9832) + 60|0))>>2]|0;
     $69 = HEAP32[(((9832) + 348|0))>>2]|0;
     $70 = (($69) + 232|0);
     $71 = (($70) + ($68<<2)|0);
     $72 = HEAP32[$71>>2]|0;
     $73 = ($67>>>0)>=($72>>>0);
     if (!($73)) {
      break;
     }
     $74 = HEAP32[(((9832) + 60|0))>>2]|0;
     $75 = HEAP32[(((9832) + 348|0))>>2]|0;
     $76 = (($75) + 232|0);
     $77 = (($76) + ($74<<2)|0);
     $78 = HEAP32[$77>>2]|0;
     $79 = HEAP32[(((9832) + 344|0))>>2]|0;
     $80 = (($79) - ($78))|0;
     HEAP32[(((9832) + 344|0))>>2] = $80;
     $81 = $i;
     $82 = $81&255;
     $83 = ((((9832) + 220|0)) + (($82*24)|0)|0);
     $84 = ($83);
     $85 = (($84) + 5|0);
     $86 = HEAP8[$85]|0;
     $87 = $i;
     $88 = $87&255;
     $89 = ((((9832) + 220|0)) + (($88*24)|0)|0);
     $90 = (($89) + 8|0);
     HEAP8[$90] = $86;
     $91 = HEAP32[(((9832) + 60|0))>>2]|0;
     $92 = HEAP32[(((9832) + 348|0))>>2]|0;
     $93 = (($92) + 232|0);
     $94 = (($93) + ($91<<2)|0);
     $95 = HEAP32[$94>>2]|0;
     $96 = HEAP32[(((9832) + 348|0))>>2]|0;
     $97 = (($96) + 232|0);
     $98 = ($97);
     $99 = HEAP32[$98>>2]|0;
     $100 = (($99) - ($95))|0;
     HEAP32[$98>>2] = $100;
     $101 = HEAP32[(((9832) + 60|0))>>2]|0;
     $102 = HEAP32[(((9832) + 348|0))>>2]|0;
     $103 = (($102) + 232|0);
     $104 = (($103) + ($101<<2)|0);
     HEAP32[$104>>2] = 0;
    }
   } while(0);
   break;
  }
  case 11:  {
   $55 = $overGameScreen$byval_copy;
   $56 = $overGameScreen$byval_copy;
   $57 = (18016);
   ;HEAP32[$56+0>>2]=HEAP32[$57+0>>2]|0;HEAP32[$56+4>>2]=HEAP32[$57+4>>2]|0;HEAP32[$56+8>>2]=HEAP32[$57+8>>2]|0;HEAP32[$56+12>>2]=HEAP32[$57+12>>2]|0;HEAP32[$56+16>>2]=HEAP32[$57+16>>2]|0;HEAP32[$56+20>>2]=HEAP32[$57+20>>2]|0;
   _switchToScreen($overGameScreen$byval_copy);
   $58 = $overGameScreen$byval_copy;
   break;
  }
  case 0:  {
   $16 = HEAP32[(((9832) + 344|0))>>2]|0;
   $17 = HEAP32[(((9832) + 348|0))>>2]|0;
   $18 = (($17) + 232|0);
   $19 = ($18);
   $20 = HEAP32[$19>>2]|0;
   $21 = ($16>>>0)>=($20>>>0);
   if ($21) {
    $22 = HEAP32[(((9832) + 348|0))>>2]|0;
    $23 = (($22) + 232|0);
    $24 = ($23);
    $25 = HEAP32[$24>>2]|0;
    $26 = HEAP32[(((9832) + 344|0))>>2]|0;
    $27 = (($26) - ($25))|0;
    HEAP32[(((9832) + 344|0))>>2] = $27;
    $i = 0;
    while(1) {
     $28 = $i;
     $29 = $28&255;
     $30 = HEAP8[(((9832) + 340|0))]|0;
     $31 = $30&255;
     $32 = ($29|0)<($31|0);
     if (!($32)) {
      break;
     }
     $33 = $i;
     $34 = $33&255;
     $35 = ((((9832) + 220|0)) + (($34*24)|0)|0);
     $36 = ($35);
     $37 = (($36) + 5|0);
     $38 = HEAP8[$37]|0;
     $39 = $i;
     $40 = $39&255;
     $41 = ((((9832) + 220|0)) + (($40*24)|0)|0);
     $42 = (($41) + 8|0);
     HEAP8[$42] = $38;
     $43 = $i;
     $44 = (($43) + 1)<<24>>24;
     $i = $44;
    }
    $i = 0;
    while(1) {
     $45 = $i;
     $46 = $45&255;
     $47 = ($46|0)<(6);
     if (!($47)) {
      break;
     }
     $48 = $i;
     $49 = $48&255;
     $50 = HEAP32[(((9832) + 348|0))>>2]|0;
     $51 = (($50) + 232|0);
     $52 = (($51) + ($49<<2)|0);
     HEAP32[$52>>2] = 0;
     $53 = $i;
     $54 = (($53) + 1)<<24>>24;
     $i = $54;
    }
   }
   break;
  }
  default: {
  }
  }
  HEAP8[(((9832) + 4|0))] = 1;
 }
 STACKTOP = sp;return;
}
function _shop_mouseKeyHandler($key,$isDown,$context) {
 $key = $key|0;
 $isDown = $isDown|0;
 $context = $context|0;
 var $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $key;
 $2 = $isDown;
 $3 = $context;
 STACKTOP = sp;return;
}
function _shop_mouseMoveHandler($mousePos,$context) {
 $mousePos = $mousePos|0;
 $context = $context|0;
 var $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $1 = $context;
 STACKTOP = sp;return;
}
function _renderWorld($w) {
 $w = $w|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0;
 $$byval_copy1 = sp;
 $$byval_copy = sp + 16|0;
 $1 = sp + 48|0;
 $2 = HEAP32[((9832))>>2]|0;
 $3 = (($w) + 4|0);
 $4 = ($1);
 $5 = ($4);
 HEAP32[$5>>2] = 0;
 $6 = (($4) + 4|0);
 HEAP32[$6>>2] = 0;
 $7 = (($1) + 8|0);
 $8 = ($7);
 HEAP32[$8>>2] = 0;
 $9 = (($7) + 4|0);
 HEAP32[$9>>2] = 0;
 $10 = (($w) + 32|0);
 $11 = HEAP8[$10]|0;
 $12 = (($w) + 33|0);
 $13 = HEAP8[$12]|0;
 $14 = $$byval_copy;
 $15 = $$byval_copy;
 $16 = $3;
 ;HEAP32[$15+0>>2]=HEAP32[$16+0>>2]|0;HEAP32[$15+4>>2]=HEAP32[$16+4>>2]|0;HEAP32[$15+8>>2]=HEAP32[$16+8>>2]|0;HEAP32[$15+12>>2]=HEAP32[$16+12>>2]|0;HEAP32[$15+16>>2]=HEAP32[$16+16>>2]|0;HEAP32[$15+20>>2]=HEAP32[$16+20>>2]|0;HEAP32[$15+24>>2]=HEAP32[$16+24>>2]|0;
 $17 = $$byval_copy1;
 $18 = $$byval_copy1;
 $19 = $1;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[$19+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[$19+12>>2]|0;
 _asciiDrawBitmapColored($2,$$byval_copy,$$byval_copy1,$11,$13);
 $20 = $$byval_copy1;
 $21 = $$byval_copy;
 STACKTOP = sp;return;
}
function _renderOverWorld($w) {
 $w = $w|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy6 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0;
 var $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0;
 var $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0;
 var $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $9 = 0, $i = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 160|0;
 $$byval_copy6 = sp;
 $$byval_copy5 = sp + 16|0;
 $$byval_copy4 = sp + 48|0;
 $$byval_copy3 = sp + 56|0;
 $$byval_copy2 = sp + 64|0;
 $$byval_copy1 = sp + 72|0;
 $$byval_copy = sp + 80|0;
 $1 = sp + 128|0;
 $2 = sp + 136|0;
 $3 = sp + 144|0;
 $4 = (($w) + 4|0);
 $5 = $$byval_copy;
 $6 = $$byval_copy;
 $7 = $4;
 dest=$6+0|0; src=$7+0|0; stop=dest+36|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
 _renderWorld($$byval_copy);
 $8 = $$byval_copy;
 $i = 0;
 while(1) {
  $9 = $i;
  $10 = $9&255;
  $11 = (($w) + 104|0);
  $12 = HEAP8[$11]|0;
  $13 = $12&255;
  $14 = ($10|0)<($13|0);
  if (!($14)) {
   break;
  }
  $15 = $i;
  $16 = $15&255;
  $17 = (($w) + 100|0);
  $18 = HEAP32[$17>>2]|0;
  $19 = (($18) + (($16*136)|0)|0);
  $20 = ($19);
  $21 = HEAP8[$20]|0;
  $22 = ($21<<24>>24)!=(0);
  if ($22) {
   $23 = HEAP32[((9832))>>2]|0;
   $24 = ($1);
   HEAP8[$24] = 64;
   $25 = (($1) + 1|0);
   HEAP8[$25] = 1;
   $26 = (($1) + 2|0);
   HEAP8[$26] = 7;
   $27 = (($1) + 3|0);
   HEAP8[$27] = 0;
   $28 = $i;
   $29 = $28&255;
   $30 = (($w) + 100|0);
   $31 = HEAP32[$30>>2]|0;
   $32 = (($31) + (($29*136)|0)|0);
   $33 = (($32) + 4|0);
   $34 = $$byval_copy1;
   $35 = $$byval_copy1;
   $36 = $1;
   ;HEAP8[$35+0|0]=HEAP8[$36+0|0]|0;HEAP8[$35+1|0]=HEAP8[$36+1|0]|0;HEAP8[$35+2|0]=HEAP8[$36+2|0]|0;HEAP8[$35+3|0]=HEAP8[$36+3|0]|0;
   $37 = $$byval_copy2;
   $38 = $$byval_copy2;
   $39 = $33;
   ;HEAP32[$38+0>>2]=HEAP32[$39+0>>2]|0;HEAP32[$38+4>>2]=HEAP32[$39+4>>2]|0;
   _asciiDrawChar($23,$$byval_copy1,$$byval_copy2);
   $40 = $$byval_copy2;
   $41 = $$byval_copy1;
  }
  $42 = $i;
  $43 = (($42) + 1)<<24>>24;
  $i = $43;
 }
 $44 = HEAP32[((9832))>>2]|0;
 $45 = ($2);
 HEAP8[$45] = 64;
 $46 = (($2) + 1|0);
 HEAP8[$46] = 2;
 $47 = (($2) + 2|0);
 HEAP8[$47] = 0;
 $48 = (($2) + 3|0);
 HEAP8[$48] = 0;
 $49 = (($w) + 76|0);
 $50 = $$byval_copy3;
 $51 = $$byval_copy3;
 $52 = $2;
 ;HEAP8[$51+0|0]=HEAP8[$52+0|0]|0;HEAP8[$51+1|0]=HEAP8[$52+1|0]|0;HEAP8[$51+2|0]=HEAP8[$52+2|0]|0;HEAP8[$51+3|0]=HEAP8[$52+3|0]|0;
 $53 = $$byval_copy4;
 $54 = $$byval_copy4;
 $55 = $49;
 ;HEAP32[$54+0>>2]=HEAP32[$55+0>>2]|0;HEAP32[$54+4>>2]=HEAP32[$55+4>>2]|0;
 _asciiDrawChar($44,$$byval_copy3,$$byval_copy4);
 $56 = $$byval_copy4;
 $57 = $$byval_copy3;
 $58 = HEAP32[((9832))>>2]|0;
 $59 = (($w) + 40|0);
 $60 = ($3);
 $61 = ($60);
 HEAP32[$61>>2] = 0;
 $62 = (($60) + 4|0);
 HEAP32[$62>>2] = 0;
 $63 = (($3) + 8|0);
 $64 = ($63);
 HEAP32[$64>>2] = 0;
 $65 = (($63) + 4|0);
 HEAP32[$65>>2] = 0;
 $66 = (($w) + 4|0);
 $67 = (($66) + 32|0);
 $68 = HEAP8[$67]|0;
 $69 = (($w) + 4|0);
 $70 = (($69) + 33|0);
 $71 = HEAP8[$70]|0;
 $72 = $$byval_copy5;
 $73 = $$byval_copy5;
 $74 = $59;
 ;HEAP32[$73+0>>2]=HEAP32[$74+0>>2]|0;HEAP32[$73+4>>2]=HEAP32[$74+4>>2]|0;HEAP32[$73+8>>2]=HEAP32[$74+8>>2]|0;HEAP32[$73+12>>2]=HEAP32[$74+12>>2]|0;HEAP32[$73+16>>2]=HEAP32[$74+16>>2]|0;HEAP32[$73+20>>2]=HEAP32[$74+20>>2]|0;HEAP32[$73+24>>2]=HEAP32[$74+24>>2]|0;
 $75 = $$byval_copy6;
 $76 = $$byval_copy6;
 $77 = $3;
 ;HEAP32[$76+0>>2]=HEAP32[$77+0>>2]|0;HEAP32[$76+4>>2]=HEAP32[$77+4>>2]|0;HEAP32[$76+8>>2]=HEAP32[$77+8>>2]|0;HEAP32[$76+12>>2]=HEAP32[$77+12>>2]|0;
 _asciiDrawBitmapColored($58,$$byval_copy5,$$byval_copy6,$68,$71);
 $78 = $$byval_copy6;
 $79 = $$byval_copy5;
 STACKTOP = sp;return;
}
function _showUpWorldRoomAt($w,$at) {
 $w = $w|0;
 $at = $at|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, $i = 0, $w$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 336|0;
 $w$byval_copy = sp;
 $$byval_copy1 = sp + 280|0;
 $$byval_copy = sp + 296|0;
 $1 = sp + 320|0;
 $i = 0;
 while(1) {
  $2 = $i;
  $3 = $2&255;
  $4 = (($w) + 72|0);
  $5 = HEAP8[$4]|0;
  $6 = $5&255;
  $7 = ($3|0)<($6|0);
  if (!($7)) {
   label = 7;
   break;
  }
  $8 = $i;
  $9 = $8&255;
  $10 = (($w) + 68|0);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + ($9<<4)|0);
  $13 = ($1);
  $14 = ($13);
  $15 = ($at);
  $16 = HEAP32[$15>>2]|0;
  HEAP32[$14>>2] = $16;
  $17 = (($13) + 4|0);
  $18 = (($at) + 4|0);
  $19 = HEAP32[$18>>2]|0;
  HEAP32[$17>>2] = $19;
  $20 = (($1) + 8|0);
  $21 = ($20);
  HEAP32[$21>>2] = 1;
  $22 = (($20) + 4|0);
  HEAP32[$22>>2] = 1;
  $23 = $$byval_copy;
  $24 = $$byval_copy;
  $25 = $12;
  ;HEAP32[$24+0>>2]=HEAP32[$25+0>>2]|0;HEAP32[$24+4>>2]=HEAP32[$25+4>>2]|0;HEAP32[$24+8>>2]=HEAP32[$25+8>>2]|0;HEAP32[$24+12>>2]=HEAP32[$25+12>>2]|0;
  $26 = $$byval_copy1;
  $27 = $$byval_copy1;
  $28 = $1;
  ;HEAP32[$27+0>>2]=HEAP32[$28+0>>2]|0;HEAP32[$27+4>>2]=HEAP32[$28+4>>2]|0;HEAP32[$27+8>>2]=HEAP32[$28+8>>2]|0;HEAP32[$27+12>>2]=HEAP32[$28+12>>2]|0;
  $29 = (_asciiRectCollides($$byval_copy,$$byval_copy1)|0);
  $30 = $$byval_copy1;
  $31 = $$byval_copy;
  $32 = ($29<<24>>24)!=(0);
  if ($32) {
   break;
  }
  $38 = $i;
  $39 = (($38) + 1)<<24>>24;
  $i = $39;
 }
 if ((label|0) == 7) {
  STACKTOP = sp;return;
 }
 $33 = $i;
 $34 = $w$byval_copy;
 $35 = $w$byval_copy;
 $36 = $w;
 _memcpy(($35|0),($36|0),276)|0;
 _showUpWorldRoom($w$byval_copy,$33);
 $37 = $w$byval_copy;
 STACKTOP = sp;return;
}
function _showUpWorldRoom($w,$i) {
 $w = $w|0;
 $i = $i|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0;
 var $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0;
 var $82 = 0, $83 = 0, $84 = 0, $85 = 0, $9 = 0, $x = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $i;
 $2 = $1;
 $3 = $2&255;
 $4 = (($w) + 68|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = (($5) + ($3<<4)|0);
 $7 = ($6);
 $8 = (($7) + 4|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = (($9) - 1)|0;
 $y = $10;
 while(1) {
  $11 = $y;
  $12 = $1;
  $13 = $12&255;
  $14 = (($w) + 68|0);
  $15 = HEAP32[$14>>2]|0;
  $16 = (($15) + ($13<<4)|0);
  $17 = ($16);
  $18 = (($17) + 4|0);
  $19 = HEAP32[$18>>2]|0;
  $20 = $1;
  $21 = $20&255;
  $22 = (($w) + 68|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = (($23) + ($21<<4)|0);
  $25 = (($24) + 8|0);
  $26 = (($25) + 4|0);
  $27 = HEAP32[$26>>2]|0;
  $28 = (($19) + ($27))|0;
  $29 = (($28) + 1)|0;
  $30 = ($11>>>0)<($29>>>0);
  if (!($30)) {
   break;
  }
  $31 = $1;
  $32 = $31&255;
  $33 = (($w) + 68|0);
  $34 = HEAP32[$33>>2]|0;
  $35 = (($34) + ($32<<4)|0);
  $36 = ($35);
  $37 = ($36);
  $38 = HEAP32[$37>>2]|0;
  $39 = (($38) - 1)|0;
  $x = $39;
  while(1) {
   $40 = $x;
   $41 = $1;
   $42 = $41&255;
   $43 = (($w) + 68|0);
   $44 = HEAP32[$43>>2]|0;
   $45 = (($44) + ($42<<4)|0);
   $46 = ($45);
   $47 = ($46);
   $48 = HEAP32[$47>>2]|0;
   $49 = $1;
   $50 = $49&255;
   $51 = (($w) + 68|0);
   $52 = HEAP32[$51>>2]|0;
   $53 = (($52) + ($50<<4)|0);
   $54 = (($53) + 8|0);
   $55 = ($54);
   $56 = HEAP32[$55>>2]|0;
   $57 = (($48) + ($56))|0;
   $58 = (($57) + 1)|0;
   $59 = ($40>>>0)<($58>>>0);
   if (!($59)) {
    break;
   }
   $60 = $y;
   $61 = ($60*80)|0;
   $62 = $x;
   $63 = (($61) + ($62))|0;
   $64 = (($w) + 40|0);
   $65 = (($64) + 16|0);
   $66 = HEAP32[$65>>2]|0;
   $67 = (($66) + ($63)|0);
   HEAP8[$67] = 0;
   $68 = $x;
   $69 = (($68) + 1)|0;
   $x = $69;
  }
  $70 = $y;
  $71 = (($70) + 1)|0;
  $y = $71;
 }
 $72 = $1;
 $73 = $72&255;
 $74 = (($w) + 68|0);
 $75 = HEAP32[$74>>2]|0;
 $76 = (($75) + ($73<<4)|0);
 $77 = (($76) + 8|0);
 $78 = ($77);
 HEAP32[$78>>2] = 0;
 $79 = $1;
 $80 = $79&255;
 $81 = (($w) + 68|0);
 $82 = HEAP32[$81>>2]|0;
 $83 = (($82) + ($80<<4)|0);
 $84 = (($83) + 8|0);
 $85 = (($84) + 4|0);
 HEAP32[$85>>2] = 0;
 STACKTOP = sp;return;
}
function _freeWorld($w) {
 $w = $w|0;
 var $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($w);
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)!=(0|0);
 if (!($3)) {
  STACKTOP = sp;return;
 }
 $4 = ($w);
 $5 = HEAP32[$4>>2]|0;
 _free($5);
 $6 = (($w) + 4|0);
 _asciiFreeBitmap($6);
 STACKTOP = sp;return;
}
function _freeOverWorld($w) {
 $w = $w|0;
 var $$byval_copy = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, dest = 0, label = 0, sp = 0;
 var src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $$byval_copy = sp;
 $1 = (($w) + 4|0);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  STACKTOP = sp;return;
 }
 $5 = (($w) + 4|0);
 $6 = $$byval_copy;
 $7 = $$byval_copy;
 $8 = $5;
 dest=$7+0|0; src=$8+0|0; stop=dest+36|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
 _freeWorld($$byval_copy);
 $9 = $$byval_copy;
 $10 = (($w) + 40|0);
 _asciiFreeBitmap($10);
 $11 = (($w) + 68|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $12;
 _free($13);
 $14 = (($w) + 100|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = $15;
 _free($16);
 STACKTOP = sp;return;
}
function _freeArenaWorld($w) {
 $w = $w|0;
 var $$byval_copy = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $$byval_copy = sp;
 $1 = ($w);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($3|0)!=(0|0);
 if (!($4)) {
  STACKTOP = sp;return;
 }
 $5 = ($w);
 $6 = $$byval_copy;
 $7 = $$byval_copy;
 $8 = $5;
 dest=$7+0|0; src=$8+0|0; stop=dest+36|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));;
 _freeWorld($$byval_copy);
 $9 = $$byval_copy;
 STACKTOP = sp;return;
}
function _generateRoomSize($agg$result) {
 $agg$result = $agg$result|0;
 var $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $s = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 8|0;
 $s = sp;
 $1 = (_getRandom()|0);
 $2 = (($1|0) % 6)&-1;
 $3 = (5 + ($2))|0;
 $4 = ($s);
 HEAP32[$4>>2] = $3;
 $5 = (_getRandom()|0);
 $6 = (($5|0) % 6)&-1;
 $7 = (5 + ($6))|0;
 $8 = (($s) + 4|0);
 HEAP32[$8>>2] = $7;
 $9 = $agg$result;
 $10 = $s;
 ;HEAP32[$9+0>>2]=HEAP32[$10+0>>2]|0;HEAP32[$9+4>>2]=HEAP32[$10+4>>2]|0;
 STACKTOP = sp;return;
}
function _generateNewRoom($agg$result,$from,$direction,$doorPos) {
 $agg$result = $agg$result|0;
 $from = $from|0;
 $direction = $direction|0;
 $doorPos = $doorPos|0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
 var $atFrom = 0, $atTo = 0, $to = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 120|0;
 $to = sp + 16|0;
 $3 = sp + 48|0;
 $4 = sp + 56|0;
 $5 = sp + 64|0;
 $6 = sp + 72|0;
 $7 = sp + 80|0;
 $8 = sp + 88|0;
 $9 = sp + 96|0;
 $10 = sp + 104|0;
 $11 = sp + 112|0;
 $1 = $direction;
 $2 = $doorPos;
 $12 = (($to) + 8|0);
 _generateRoomSize($3);
 $13 = $12;
 $14 = $3;
 ;HEAP32[$13+0>>2]=HEAP32[$14+0>>2]|0;HEAP32[$13+4>>2]=HEAP32[$14+4>>2]|0;
 $15 = $1;
 $16 = $15&255;
 $17 = ($16|0)==(0);
 do {
  if ($17) {
   label = 3;
  } else {
   $18 = $1;
   $19 = $18&255;
   $20 = ($19|0)==(1);
   if ($20) {
    label = 3;
    break;
   }
   $33 = (_getRandom()|0);
   $34 = (($from) + 8|0);
   $35 = (($34) + 4|0);
   $36 = HEAP32[$35>>2]|0;
   $37 = (($33|0) % ($36|0))&-1;
   $38 = $37&255;
   $atFrom = $38;
   $39 = (_getRandom()|0);
   $40 = (($to) + 8|0);
   $41 = (($40) + 4|0);
   $42 = HEAP32[$41>>2]|0;
   $43 = (($39|0) % ($42|0))&-1;
   $44 = $43&255;
   $atTo = $44;
  }
 } while(0);
 if ((label|0) == 3) {
  $21 = (_getRandom()|0);
  $22 = (($from) + 8|0);
  $23 = ($22);
  $24 = HEAP32[$23>>2]|0;
  $25 = (($21|0) % ($24|0))&-1;
  $26 = $25&255;
  $atFrom = $26;
  $27 = (_getRandom()|0);
  $28 = (($to) + 8|0);
  $29 = ($28);
  $30 = HEAP32[$29>>2]|0;
  $31 = (($27|0) % ($30|0))&-1;
  $32 = $31&255;
  $atTo = $32;
 }
 $45 = $1;
 $46 = $45&255;
 if ((($46|0) == 3)) {
  $146 = $2;
  $147 = ($10);
  $148 = ($from);
  $149 = ($148);
  $150 = HEAP32[$149>>2]|0;
  $151 = (($from) + 8|0);
  $152 = ($151);
  $153 = HEAP32[$152>>2]|0;
  $154 = (($150) + ($153))|0;
  HEAP32[$147>>2] = $154;
  $155 = (($10) + 4|0);
  $156 = ($from);
  $157 = (($156) + 4|0);
  $158 = HEAP32[$157>>2]|0;
  $159 = $atFrom;
  $160 = $159&255;
  $161 = (($158) + ($160))|0;
  HEAP32[$155>>2] = $161;
  $162 = $146;
  $163 = $10;
  ;HEAP32[$162+0>>2]=HEAP32[$163+0>>2]|0;HEAP32[$162+4>>2]=HEAP32[$163+4>>2]|0;
  $164 = ($to);
  $165 = ($11);
  $166 = $2;
  $167 = ($166);
  $168 = HEAP32[$167>>2]|0;
  $169 = (($168) + 1)|0;
  HEAP32[$165>>2] = $169;
  $170 = (($11) + 4|0);
  $171 = $2;
  $172 = (($171) + 4|0);
  $173 = HEAP32[$172>>2]|0;
  $174 = $atTo;
  $175 = $174&255;
  $176 = (($173) - ($175))|0;
  HEAP32[$170>>2] = $176;
  $177 = $164;
  $178 = $11;
  ;HEAP32[$177+0>>2]=HEAP32[$178+0>>2]|0;HEAP32[$177+4>>2]=HEAP32[$178+4>>2]|0;
  $179 = $agg$result;
  $180 = $to;
  ;HEAP32[$179+0>>2]=HEAP32[$180+0>>2]|0;HEAP32[$179+4>>2]=HEAP32[$180+4>>2]|0;HEAP32[$179+8>>2]=HEAP32[$180+8>>2]|0;HEAP32[$179+12>>2]=HEAP32[$180+12>>2]|0;
  STACKTOP = sp;return;
 } else if ((($46|0) == 2)) {
  $113 = $2;
  $114 = ($8);
  $115 = ($from);
  $116 = ($115);
  $117 = HEAP32[$116>>2]|0;
  $118 = (($117) - 1)|0;
  HEAP32[$114>>2] = $118;
  $119 = (($8) + 4|0);
  $120 = ($from);
  $121 = (($120) + 4|0);
  $122 = HEAP32[$121>>2]|0;
  $123 = $atFrom;
  $124 = $123&255;
  $125 = (($122) + ($124))|0;
  HEAP32[$119>>2] = $125;
  $126 = $113;
  $127 = $8;
  ;HEAP32[$126+0>>2]=HEAP32[$127+0>>2]|0;HEAP32[$126+4>>2]=HEAP32[$127+4>>2]|0;
  $128 = ($to);
  $129 = ($9);
  $130 = $2;
  $131 = ($130);
  $132 = HEAP32[$131>>2]|0;
  $133 = (($to) + 8|0);
  $134 = ($133);
  $135 = HEAP32[$134>>2]|0;
  $136 = (($132) - ($135))|0;
  HEAP32[$129>>2] = $136;
  $137 = (($9) + 4|0);
  $138 = $2;
  $139 = (($138) + 4|0);
  $140 = HEAP32[$139>>2]|0;
  $141 = $atTo;
  $142 = $141&255;
  $143 = (($140) - ($142))|0;
  HEAP32[$137>>2] = $143;
  $144 = $128;
  $145 = $9;
  ;HEAP32[$144+0>>2]=HEAP32[$145+0>>2]|0;HEAP32[$144+4>>2]=HEAP32[$145+4>>2]|0;
  $179 = $agg$result;
  $180 = $to;
  ;HEAP32[$179+0>>2]=HEAP32[$180+0>>2]|0;HEAP32[$179+4>>2]=HEAP32[$180+4>>2]|0;HEAP32[$179+8>>2]=HEAP32[$180+8>>2]|0;HEAP32[$179+12>>2]=HEAP32[$180+12>>2]|0;
  STACKTOP = sp;return;
 } else if ((($46|0) == 0)) {
  $47 = $2;
  $48 = ($4);
  $49 = ($from);
  $50 = ($49);
  $51 = HEAP32[$50>>2]|0;
  $52 = $atFrom;
  $53 = $52&255;
  $54 = (($51) + ($53))|0;
  HEAP32[$48>>2] = $54;
  $55 = (($4) + 4|0);
  $56 = ($from);
  $57 = (($56) + 4|0);
  $58 = HEAP32[$57>>2]|0;
  $59 = (($58) - 1)|0;
  HEAP32[$55>>2] = $59;
  $60 = $47;
  $61 = $4;
  ;HEAP32[$60+0>>2]=HEAP32[$61+0>>2]|0;HEAP32[$60+4>>2]=HEAP32[$61+4>>2]|0;
  $62 = ($to);
  $63 = ($5);
  $64 = $2;
  $65 = ($64);
  $66 = HEAP32[$65>>2]|0;
  $67 = $atTo;
  $68 = $67&255;
  $69 = (($66) - ($68))|0;
  HEAP32[$63>>2] = $69;
  $70 = (($5) + 4|0);
  $71 = $2;
  $72 = (($71) + 4|0);
  $73 = HEAP32[$72>>2]|0;
  $74 = (($to) + 8|0);
  $75 = (($74) + 4|0);
  $76 = HEAP32[$75>>2]|0;
  $77 = (($73) - ($76))|0;
  HEAP32[$70>>2] = $77;
  $78 = $62;
  $79 = $5;
  ;HEAP32[$78+0>>2]=HEAP32[$79+0>>2]|0;HEAP32[$78+4>>2]=HEAP32[$79+4>>2]|0;
  $179 = $agg$result;
  $180 = $to;
  ;HEAP32[$179+0>>2]=HEAP32[$180+0>>2]|0;HEAP32[$179+4>>2]=HEAP32[$180+4>>2]|0;HEAP32[$179+8>>2]=HEAP32[$180+8>>2]|0;HEAP32[$179+12>>2]=HEAP32[$180+12>>2]|0;
  STACKTOP = sp;return;
 } else if ((($46|0) == 1)) {
  $80 = $2;
  $81 = ($6);
  $82 = ($from);
  $83 = ($82);
  $84 = HEAP32[$83>>2]|0;
  $85 = $atFrom;
  $86 = $85&255;
  $87 = (($84) + ($86))|0;
  HEAP32[$81>>2] = $87;
  $88 = (($6) + 4|0);
  $89 = ($from);
  $90 = (($89) + 4|0);
  $91 = HEAP32[$90>>2]|0;
  $92 = (($from) + 8|0);
  $93 = (($92) + 4|0);
  $94 = HEAP32[$93>>2]|0;
  $95 = (($91) + ($94))|0;
  HEAP32[$88>>2] = $95;
  $96 = $80;
  $97 = $6;
  ;HEAP32[$96+0>>2]=HEAP32[$97+0>>2]|0;HEAP32[$96+4>>2]=HEAP32[$97+4>>2]|0;
  $98 = ($to);
  $99 = ($7);
  $100 = $2;
  $101 = ($100);
  $102 = HEAP32[$101>>2]|0;
  $103 = $atTo;
  $104 = $103&255;
  $105 = (($102) - ($104))|0;
  HEAP32[$99>>2] = $105;
  $106 = (($7) + 4|0);
  $107 = $2;
  $108 = (($107) + 4|0);
  $109 = HEAP32[$108>>2]|0;
  $110 = (($109) + 1)|0;
  HEAP32[$106>>2] = $110;
  $111 = $98;
  $112 = $7;
  ;HEAP32[$111+0>>2]=HEAP32[$112+0>>2]|0;HEAP32[$111+4>>2]=HEAP32[$112+4>>2]|0;
  $179 = $agg$result;
  $180 = $to;
  ;HEAP32[$179+0>>2]=HEAP32[$180+0>>2]|0;HEAP32[$179+4>>2]=HEAP32[$180+4>>2]|0;HEAP32[$179+8>>2]=HEAP32[$180+8>>2]|0;HEAP32[$179+12>>2]=HEAP32[$180+12>>2]|0;
  STACKTOP = sp;return;
 } else {
  $179 = $agg$result;
  $180 = $to;
  ;HEAP32[$179+0>>2]=HEAP32[$180+0>>2]|0;HEAP32[$179+4>>2]=HEAP32[$180+4>>2]|0;HEAP32[$179+8>>2]=HEAP32[$180+8>>2]|0;HEAP32[$179+12>>2]=HEAP32[$180+12>>2]|0;
  STACKTOP = sp;return;
 }
}
function _roomCollides($r1,$r2) {
 $r1 = $r1|0;
 $r2 = $r2|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $3 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $r1$byval_copy = 0, $r2$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $r2$byval_copy = sp;
 $r1$byval_copy = sp + 16|0;
 $1 = ($r1);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3) + -1)|0;
 HEAP32[$2>>2] = $4;
 $5 = ($r1);
 $6 = (($5) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($7) + -1)|0;
 HEAP32[$6>>2] = $8;
 $9 = (($r1) + 8|0);
 $10 = ($9);
 $11 = HEAP32[$10>>2]|0;
 $12 = (($11) + 2)|0;
 HEAP32[$10>>2] = $12;
 $13 = (($r1) + 8|0);
 $14 = (($13) + 4|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = (($15) + 2)|0;
 HEAP32[$14>>2] = $16;
 $17 = $r1$byval_copy;
 $18 = $r1$byval_copy;
 $19 = $r1;
 ;HEAP32[$18+0>>2]=HEAP32[$19+0>>2]|0;HEAP32[$18+4>>2]=HEAP32[$19+4>>2]|0;HEAP32[$18+8>>2]=HEAP32[$19+8>>2]|0;HEAP32[$18+12>>2]=HEAP32[$19+12>>2]|0;
 $20 = $r2$byval_copy;
 $21 = $r2$byval_copy;
 $22 = $r2;
 ;HEAP32[$21+0>>2]=HEAP32[$22+0>>2]|0;HEAP32[$21+4>>2]=HEAP32[$22+4>>2]|0;HEAP32[$21+8>>2]=HEAP32[$22+8>>2]|0;HEAP32[$21+12>>2]=HEAP32[$22+12>>2]|0;
 $23 = (_asciiRectCollides($r1$byval_copy,$r2$byval_copy)|0);
 $24 = $r2$byval_copy;
 $25 = $r1$byval_copy;
 STACKTOP = sp;return ($23|0);
}
function _isFree($w,$x,$y) {
 $w = $w|0;
 $x = $x|0;
 $y = $y|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 24|0;
 $1 = $w;
 $2 = $x;
 $3 = $y;
 $4 = $3;
 $5 = ($4*60)|0;
 $6 = $2;
 $7 = (($5) + ($6))|0;
 $8 = $1;
 $9 = ($8);
 $10 = HEAP32[$9>>2]|0;
 $11 = (($10) + ($7)|0);
 $12 = HEAP8[$11]|0;
 $13 = $12&255;
 $14 = ($13|0)==(0);
 $15 = $14&1;
 $16 = $15&255;
 STACKTOP = sp;return ($16|0);
}
function _drawTile($w,$x,$y,$c) {
 $w = $w|0;
 $x = $x|0;
 $y = $y|0;
 $c = $c|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $index = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $1 = $w;
 $2 = $x;
 $3 = $y;
 $4 = $c;
 $5 = $3;
 $6 = ($5*60)|0;
 $7 = $2;
 $8 = (($6) + ($7))|0;
 $index = $8;
 $9 = $4;
 $10 = $index;
 $11 = $1;
 $12 = (($11) + 4|0);
 $13 = (($12) + 16|0);
 $14 = HEAP32[$13>>2]|0;
 $15 = (($14) + ($10)|0);
 HEAP8[$15] = $9;
 $16 = $4;
 $17 = $16 << 24 >> 24;
 if ((($17|0) == 36)) {
  $33 = $index;
  $34 = $1;
  $35 = ($34);
  $36 = HEAP32[$35>>2]|0;
  $37 = (($36) + ($33)|0);
  HEAP8[$37] = 6;
  STACKTOP = sp;return;
 } else if ((($17|0) == 79)) {
  $28 = $index;
  $29 = $1;
  $30 = ($29);
  $31 = HEAP32[$30>>2]|0;
  $32 = (($31) + ($28)|0);
  HEAP8[$32] = 4;
  STACKTOP = sp;return;
 } else if ((($17|0) == 72)) {
  $23 = $index;
  $24 = $1;
  $25 = ($24);
  $26 = HEAP32[$25>>2]|0;
  $27 = (($26) + ($23)|0);
  HEAP8[$27] = 3;
  STACKTOP = sp;return;
 } else if ((($17|0) == 35)) {
  $18 = $index;
  $19 = $1;
  $20 = ($19);
  $21 = HEAP32[$20>>2]|0;
  $22 = (($21) + ($18)|0);
  HEAP8[$22] = 2;
  STACKTOP = sp;return;
 } else {
  $38 = $index;
  $39 = $1;
  $40 = ($39);
  $41 = HEAP32[$40>>2]|0;
  $42 = (($41) + ($38)|0);
  HEAP8[$42] = 1;
  STACKTOP = sp;return;
 }
}
function _setTile($w,$x,$y,$game) {
 $w = $w|0;
 $x = $x|0;
 $y = $y|0;
 $game = $game|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0;
 $1 = $w;
 $2 = $x;
 $3 = $y;
 $4 = $game;
 $5 = $4;
 $6 = $3;
 $7 = ($6*60)|0;
 $8 = $2;
 $9 = (($7) + ($8))|0;
 $10 = $1;
 $11 = ($10);
 $12 = HEAP32[$11>>2]|0;
 $13 = (($12) + ($9)|0);
 HEAP8[$13] = $5;
 STACKTOP = sp;return;
}
function _getRandomFreeTile($agg$result,$w,$rect) {
 $agg$result = $agg$result|0;
 $w = $w|0;
 $rect = $rect|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $pos = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0;
 $pos = sp + 8|0;
 $1 = $w;
 while(1) {
  $2 = ($rect);
  $3 = $pos;
  $4 = $2;
  ;HEAP32[$3+0>>2]=HEAP32[$4+0>>2]|0;HEAP32[$3+4>>2]=HEAP32[$4+4>>2]|0;
  $5 = (_getRandom()|0);
  $6 = (($rect) + 8|0);
  $7 = ($6);
  $8 = HEAP32[$7>>2]|0;
  $9 = (($5|0) % ($8|0))&-1;
  $10 = ($pos);
  $11 = HEAP32[$10>>2]|0;
  $12 = (($11) + ($9))|0;
  HEAP32[$10>>2] = $12;
  $13 = (_getRandom()|0);
  $14 = (($rect) + 8|0);
  $15 = (($14) + 4|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = (($13|0) % ($16|0))&-1;
  $18 = (($pos) + 4|0);
  $19 = HEAP32[$18>>2]|0;
  $20 = (($19) + ($17))|0;
  HEAP32[$18>>2] = $20;
  $21 = $1;
  $22 = ($pos);
  $23 = HEAP32[$22>>2]|0;
  $24 = (($pos) + 4|0);
  $25 = HEAP32[$24>>2]|0;
  $26 = (_isFree($21,$23,$25)|0);
  $27 = ($26<<24>>24)!=(0);
  $28 = $27 ^ 1;
  if (!($28)) {
   break;
  }
 }
 $29 = $agg$result;
 $30 = $pos;
 ;HEAP32[$29+0>>2]=HEAP32[$30+0>>2]|0;HEAP32[$29+4>>2]=HEAP32[$30+4>>2]|0;
 STACKTOP = sp;return;
}
function _setTileRandom($agg$result,$w,$rect,$game) {
 $agg$result = $agg$result|0;
 $w = $w|0;
 $rect = $rect|0;
 $game = $game|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $pos = 0, $rect$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $rect$byval_copy = sp;
 $pos = sp + 32|0;
 $1 = $w;
 $2 = $game;
 $3 = $1;
 $4 = $rect$byval_copy;
 $5 = $rect$byval_copy;
 $6 = $rect;
 ;HEAP32[$5+0>>2]=HEAP32[$6+0>>2]|0;HEAP32[$5+4>>2]=HEAP32[$6+4>>2]|0;HEAP32[$5+8>>2]=HEAP32[$6+8>>2]|0;HEAP32[$5+12>>2]=HEAP32[$6+12>>2]|0;
 _getRandomFreeTile($pos,$3,$rect$byval_copy);
 $7 = $rect$byval_copy;
 $8 = $1;
 $9 = ($pos);
 $10 = HEAP32[$9>>2]|0;
 $11 = (($pos) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $2;
 _setTile($8,$10,$12,$13);
 $14 = $agg$result;
 $15 = $pos;
 ;HEAP32[$14+0>>2]=HEAP32[$15+0>>2]|0;HEAP32[$14+4>>2]=HEAP32[$15+4>>2]|0;
 STACKTOP = sp;return;
}
function _drawTileRandom($agg$result,$w,$rect,$c) {
 $agg$result = $agg$result|0;
 $w = $w|0;
 $rect = $rect|0;
 $c = $c|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $pos = 0, $rect$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 40|0;
 $rect$byval_copy = sp;
 $pos = sp + 32|0;
 $1 = $w;
 $2 = $c;
 $3 = $1;
 $4 = $rect$byval_copy;
 $5 = $rect$byval_copy;
 $6 = $rect;
 ;HEAP32[$5+0>>2]=HEAP32[$6+0>>2]|0;HEAP32[$5+4>>2]=HEAP32[$6+4>>2]|0;HEAP32[$5+8>>2]=HEAP32[$6+8>>2]|0;HEAP32[$5+12>>2]=HEAP32[$6+12>>2]|0;
 _getRandomFreeTile($pos,$3,$rect$byval_copy);
 $7 = $rect$byval_copy;
 $8 = $1;
 $9 = ($pos);
 $10 = HEAP32[$9>>2]|0;
 $11 = (($pos) + 4|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = $2;
 _drawTile($8,$10,$12,$13);
 $14 = $agg$result;
 $15 = $pos;
 ;HEAP32[$14+0>>2]=HEAP32[$15+0>>2]|0;HEAP32[$14+4>>2]=HEAP32[$15+4>>2]|0;
 STACKTOP = sp;return;
}
function _getRoomDistance($r1,$r2) {
 $r1 = $r1|0;
 $r2 = $r2|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0;
 var $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0;
 var $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = (($r1) + 8|0);
 $2 = ($1);
 $3 = HEAP32[$2>>2]|0;
 $4 = (($3|0) / 2)&-1;
 $5 = ($r1);
 $6 = ($5);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($7) + ($4))|0;
 HEAP32[$6>>2] = $8;
 $9 = (($r1) + 8|0);
 $10 = (($9) + 4|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = (($11|0) / 2)&-1;
 $13 = ($r1);
 $14 = (($13) + 4|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = (($15) + ($12))|0;
 HEAP32[$14>>2] = $16;
 $17 = (($r2) + 8|0);
 $18 = ($17);
 $19 = HEAP32[$18>>2]|0;
 $20 = (($19|0) / 2)&-1;
 $21 = ($r2);
 $22 = ($21);
 $23 = HEAP32[$22>>2]|0;
 $24 = (($23) + ($20))|0;
 HEAP32[$22>>2] = $24;
 $25 = (($r2) + 8|0);
 $26 = (($25) + 4|0);
 $27 = HEAP32[$26>>2]|0;
 $28 = (($27|0) / 2)&-1;
 $29 = ($r2);
 $30 = (($29) + 4|0);
 $31 = HEAP32[$30>>2]|0;
 $32 = (($31) + ($28))|0;
 HEAP32[$30>>2] = $32;
 $33 = ($r2);
 $34 = ($33);
 $35 = HEAP32[$34>>2]|0;
 $36 = ($r1);
 $37 = ($36);
 $38 = HEAP32[$37>>2]|0;
 $39 = (($38) - ($35))|0;
 HEAP32[$37>>2] = $39;
 $40 = ($r2);
 $41 = (($40) + 4|0);
 $42 = HEAP32[$41>>2]|0;
 $43 = ($r1);
 $44 = (($43) + 4|0);
 $45 = HEAP32[$44>>2]|0;
 $46 = (($45) - ($42))|0;
 HEAP32[$44>>2] = $46;
 $47 = ($r1);
 $48 = ($47);
 $49 = HEAP32[$48>>2]|0;
 $50 = ($r1);
 $51 = ($50);
 $52 = HEAP32[$51>>2]|0;
 $53 = Math_imul($49, $52)|0;
 $54 = ($r1);
 $55 = (($54) + 4|0);
 $56 = HEAP32[$55>>2]|0;
 $57 = ($r1);
 $58 = (($57) + 4|0);
 $59 = HEAP32[$58>>2]|0;
 $60 = Math_imul($56, $59)|0;
 $61 = (($53) + ($60))|0;
 STACKTOP = sp;return ($61|0);
}
function _getRoomEnemyCount($size) {
 $size = $size|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = (_getRandom()|0);
 $2 = (($1|0) % 8)&-1;
 $3 = ($2|0)>(0);
 $4 = $3&1;
 $5 = (_getRandom()|0);
 $6 = ($size);
 $7 = HEAP32[$6>>2]|0;
 $8 = (($size) + 4|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = Math_imul($7, $9)|0;
 $11 = (($10|0) / 32)&-1;
 $12 = (1)>($11|0);
 if ($12) {
  $19 = 1;
 } else {
  $13 = ($size);
  $14 = HEAP32[$13>>2]|0;
  $15 = (($size) + 4|0);
  $16 = HEAP32[$15>>2]|0;
  $17 = Math_imul($14, $16)|0;
  $18 = (($17|0) / 32)&-1;
  $19 = $18;
 }
 $20 = (($5|0) % ($19|0))&-1;
 $21 = (($4) + ($20))|0;
 $22 = $21&255;
 STACKTOP = sp;return ($22|0);
}
function _generateWorld($agg$result,$seed,$levelID,$name,$backColor,$foreColor,$minRooms,$maxRooms,$enemySight) {
 $agg$result = $agg$result|0;
 $seed = $seed|0;
 $levelID = $levelID|0;
 $name = $name|0;
 $backColor = $backColor|0;
 $foreColor = $foreColor|0;
 $minRooms = $minRooms|0;
 $maxRooms = $maxRooms|0;
 $enemySight = $enemySight|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy10 = 0, $$byval_copy11 = 0, $$byval_copy12 = 0, $$byval_copy13 = 0, $$byval_copy14 = 0, $$byval_copy2 = 0, $$byval_copy3 = 0, $$byval_copy4 = 0, $$byval_copy5 = 0, $$byval_copy7 = 0, $$byval_copy8 = 0, $$byval_copy9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0;
 var $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0;
 var $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0;
 var $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0;
 var $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0;
 var $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0;
 var $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0;
 var $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0;
 var $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0;
 var $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0;
 var $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0;
 var $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0;
 var $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0;
 var $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0;
 var $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0;
 var $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0;
 var $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0;
 var $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0;
 var $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0;
 var $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0;
 var $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0;
 var $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0;
 var $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0;
 var $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0;
 var $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0;
 var $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0;
 var $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0;
 var $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0;
 var $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0;
 var $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0;
 var $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0;
 var $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0;
 var $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0;
 var $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0;
 var $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0;
 var $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0;
 var $99 = 0, $darkMapStuff = 0, $darkMapStuffCount = 0, $dist = 0, $doors = 0, $enemyCount = 0, $i = 0, $itCount = 0, $j = 0, $level = 0, $maxRoom1 = 0, $maxRoom2 = 0, $maxRoomDistance = 0, $newRoom = 0, $newRoom$byval_copy = 0, $newRoom$byval_copy6 = 0, $roomCount = 0, $roomEnemies = 0, $rooms = 0, $w = 0;
 var $w$byval_copy = 0, $x = 0, $y = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1632|0;
 $$byval_copy14 = sp;
 $w$byval_copy = sp + 16|0;
 $$byval_copy13 = sp + 296|0;
 $$byval_copy12 = sp + 312|0;
 $$byval_copy11 = sp + 328|0;
 $$byval_copy10 = sp + 344|0;
 $$byval_copy9 = sp + 360|0;
 $$byval_copy8 = sp + 376|0;
 $$byval_copy7 = sp + 384|0;
 $newRoom$byval_copy6 = sp + 392|0;
 $$byval_copy5 = sp + 408|0;
 $newRoom$byval_copy = sp + 424|0;
 $$byval_copy4 = sp + 440|0;
 $$byval_copy3 = sp + 456|0;
 $$byval_copy2 = sp + 472|0;
 $$byval_copy1 = sp + 480|0;
 $$byval_copy = sp + 488|0;
 $w = sp + 576|0;
 $rooms = sp + 856|0;
 $newRoom = sp + 1176|0;
 $doors = sp + 1192|0;
 $roomEnemies = sp + 1352|0;
 $9 = sp + 1472|0;
 $10 = sp + 1480|0;
 $11 = sp + 1512|0;
 $12 = sp + 1520|0;
 $13 = sp + 1552|0;
 $14 = sp + 1560|0;
 $15 = sp + 1576|0;
 $16 = sp + 1592|0;
 $17 = sp + 1600|0;
 $18 = sp + 1608|0;
 $19 = sp + 1616|0;
 $20 = sp + 1624|0;
 $1 = $seed;
 $2 = $levelID;
 $3 = $name;
 $4 = $backColor;
 $5 = $foreColor;
 $6 = $minRooms;
 $7 = $maxRooms;
 $8 = $enemySight;
 $darkMapStuffCount = 8;
 $darkMapStuff = (18160);
 $roomCount = 1;
 $itCount = 0;
 $maxRoomDistance = 0;
 $maxRoom1 = 0;
 $maxRoom2 = 1;
 $enemyCount = 0;
 $21 = (_malloc(1500)|0);
 $22 = (($w) + 4|0);
 $23 = ($22);
 HEAP32[$23>>2] = $21;
 $24 = (($w) + 4|0);
 $25 = ($24);
 $26 = HEAP32[$25>>2]|0;
 _memset(($26|0),0,1500)|0;
 $27 = (($w) + 4|0);
 $28 = (($27) + 4|0);
 $29 = ($9);
 HEAP32[$29>>2] = 60;
 $30 = (($9) + 4|0);
 HEAP32[$30>>2] = 25;
 $31 = $$byval_copy;
 $32 = $$byval_copy;
 $33 = $9;
 ;HEAP32[$32+0>>2]=HEAP32[$33+0>>2]|0;HEAP32[$32+4>>2]=HEAP32[$33+4>>2]|0;
 _asciiCreateBitmap($10,$$byval_copy);
 $34 = $$byval_copy;
 $35 = $28;
 $36 = $10;
 ;HEAP32[$35+0>>2]=HEAP32[$36+0>>2]|0;HEAP32[$35+4>>2]=HEAP32[$36+4>>2]|0;HEAP32[$35+8>>2]=HEAP32[$36+8>>2]|0;HEAP32[$35+12>>2]=HEAP32[$36+12>>2]|0;HEAP32[$35+16>>2]=HEAP32[$36+16>>2]|0;HEAP32[$35+20>>2]=HEAP32[$36+20>>2]|0;HEAP32[$35+24>>2]=HEAP32[$36+24>>2]|0;
 $37 = (($w) + 40|0);
 $38 = ($11);
 HEAP32[$38>>2] = 80;
 $39 = (($11) + 4|0);
 HEAP32[$39>>2] = 25;
 $40 = $$byval_copy1;
 $41 = $$byval_copy1;
 $42 = $11;
 ;HEAP32[$41+0>>2]=HEAP32[$42+0>>2]|0;HEAP32[$41+4>>2]=HEAP32[$42+4>>2]|0;
 _asciiCreateBitmap($12,$$byval_copy1);
 $43 = $$byval_copy1;
 $44 = $37;
 $45 = $12;
 ;HEAP32[$44+0>>2]=HEAP32[$45+0>>2]|0;HEAP32[$44+4>>2]=HEAP32[$45+4>>2]|0;HEAP32[$44+8>>2]=HEAP32[$45+8>>2]|0;HEAP32[$44+12>>2]=HEAP32[$45+12>>2]|0;HEAP32[$44+16>>2]=HEAP32[$45+16>>2]|0;HEAP32[$44+20>>2]=HEAP32[$45+20>>2]|0;HEAP32[$44+24>>2]=HEAP32[$45+24>>2]|0;
 $46 = (($w) + 40|0);
 $47 = (($46) + 20|0);
 HEAP8[$47] = 0;
 $48 = $4;
 $49 = (($w) + 4|0);
 $50 = (($49) + 32|0);
 HEAP8[$50] = $48;
 $51 = $5;
 $52 = (($w) + 4|0);
 $53 = (($52) + 33|0);
 HEAP8[$53] = $51;
 $54 = $3;
 $55 = ($w);
 HEAP32[$55>>2] = $54;
 $56 = $8;
 $57 = (($w) + 105|0);
 HEAP8[$57] = $56;
 $58 = $1;
 _initRandom($58);
 $i = 0;
 while(1) {
  $59 = $i;
  $60 = ($59>>>0)<(2000);
  if (!($60)) {
   break;
  }
  $61 = (_getRandom()|0);
  $62 = (($61|0) % 25)&-1;
  $63 = ($62|0)==(0);
  if ($63) {
   $64 = (_getRandom()|0);
   $65 = (($64>>>0) % 8)&-1;
   $66 = $darkMapStuff;
   $67 = (($66) + ($65)|0);
   $68 = HEAP8[$67]|0;
   $69 = $i;
   $70 = (($w) + 40|0);
   $71 = (($70) + 16|0);
   $72 = HEAP32[$71>>2]|0;
   $73 = (($72) + ($69)|0);
   HEAP8[$73] = $68;
  }
  $74 = $i;
  $75 = (($74) + 1)|0;
  $i = $75;
 }
 $76 = $1;
 _initRandom($76);
 $77 = ($rooms);
 $78 = (($77) + 8|0);
 _generateRoomSize($13);
 $79 = $78;
 $80 = $13;
 ;HEAP32[$79+0>>2]=HEAP32[$80+0>>2]|0;HEAP32[$79+4>>2]=HEAP32[$80+4>>2]|0;
 $81 = ($rooms);
 $82 = (($81) + 8|0);
 $83 = ($82);
 $84 = HEAP32[$83>>2]|0;
 $85 = (($84|0) / 2)&-1;
 $86 = (30 - ($85))|0;
 $87 = ($rooms);
 $88 = ($87);
 $89 = ($88);
 HEAP32[$89>>2] = $86;
 $90 = ($rooms);
 $91 = (($90) + 8|0);
 $92 = (($91) + 4|0);
 $93 = HEAP32[$92>>2]|0;
 $94 = (($93|0) / 2)&-1;
 $95 = (12 - ($94))|0;
 $96 = ($rooms);
 $97 = ($96);
 $98 = (($97) + 4|0);
 HEAP32[$98>>2] = $95;
 $99 = ($rooms);
 $100 = (($99) + 8|0);
 $101 = $$byval_copy2;
 $102 = $$byval_copy2;
 $103 = $100;
 ;HEAP32[$102+0>>2]=HEAP32[$103+0>>2]|0;HEAP32[$102+4>>2]=HEAP32[$103+4>>2]|0;
 $104 = (_getRoomEnemyCount($$byval_copy2)|0);
 $105 = $$byval_copy2;
 $106 = ($roomEnemies);
 HEAP8[$106] = $104;
 $107 = ($roomEnemies);
 $108 = HEAP8[$107]|0;
 $109 = $108&255;
 $enemyCount = $109;
 while(1) {
  $110 = $roomCount;
  $111 = $6;
  $112 = ($110>>>0)<($111>>>0);
  if ($112) {
   $116 = 1;
  } else {
   $113 = $roomCount;
   $114 = $7;
   $115 = ($113|0)!=($114|0);
   $116 = $115;
  }
  if (!($116)) {
   break;
  }
  $117 = (_getRandom()|0);
  $118 = $roomCount;
  $119 = (($117>>>0) % ($118>>>0))&-1;
  $120 = (($rooms) + ($119<<4)|0);
  $121 = (_getRandom()|0);
  $122 = (($121|0) % 4)&-1;
  $123 = $122&255;
  $124 = ($doors);
  $125 = $roomCount;
  $126 = (($124) + ($125<<3)|0);
  $127 = (($126) + -8|0);
  $128 = $$byval_copy3;
  $129 = $$byval_copy3;
  $130 = $120;
  ;HEAP32[$129+0>>2]=HEAP32[$130+0>>2]|0;HEAP32[$129+4>>2]=HEAP32[$130+4>>2]|0;HEAP32[$129+8>>2]=HEAP32[$130+8>>2]|0;HEAP32[$129+12>>2]=HEAP32[$130+12>>2]|0;
  _generateNewRoom($14,$$byval_copy3,$123,$127);
  $131 = $$byval_copy3;
  $132 = $newRoom;
  $133 = $14;
  ;HEAP32[$132+0>>2]=HEAP32[$133+0>>2]|0;HEAP32[$132+4>>2]=HEAP32[$133+4>>2]|0;HEAP32[$132+8>>2]=HEAP32[$133+8>>2]|0;HEAP32[$132+12>>2]=HEAP32[$133+12>>2]|0;
  $134 = ($15);
  $135 = ($134);
  HEAP32[$135>>2] = 1;
  $136 = (($134) + 4|0);
  HEAP32[$136>>2] = 1;
  $137 = (($15) + 8|0);
  $138 = ($137);
  HEAP32[$138>>2] = 58;
  $139 = (($137) + 4|0);
  HEAP32[$139>>2] = 23;
  $140 = $$byval_copy4;
  $141 = $$byval_copy4;
  $142 = $15;
  ;HEAP32[$141+0>>2]=HEAP32[$142+0>>2]|0;HEAP32[$141+4>>2]=HEAP32[$142+4>>2]|0;HEAP32[$141+8>>2]=HEAP32[$142+8>>2]|0;HEAP32[$141+12>>2]=HEAP32[$142+12>>2]|0;
  $143 = $newRoom$byval_copy;
  $144 = $newRoom$byval_copy;
  $145 = $newRoom;
  ;HEAP32[$144+0>>2]=HEAP32[$145+0>>2]|0;HEAP32[$144+4>>2]=HEAP32[$145+4>>2]|0;HEAP32[$144+8>>2]=HEAP32[$145+8>>2]|0;HEAP32[$144+12>>2]=HEAP32[$145+12>>2]|0;
  $146 = (_asciiRectFullyContains($$byval_copy4,$newRoom$byval_copy)|0);
  $147 = $newRoom$byval_copy;
  $148 = $$byval_copy4;
  $149 = ($146<<24>>24)!=(0);
  if ($149) {
   $i = 0;
   while(1) {
    $150 = $i;
    $151 = $roomCount;
    $152 = ($150>>>0)<($151>>>0);
    if (!($152)) {
     break;
    }
    $153 = $i;
    $154 = (($rooms) + ($153<<4)|0);
    $155 = $$byval_copy5;
    $156 = $$byval_copy5;
    $157 = $154;
    ;HEAP32[$156+0>>2]=HEAP32[$157+0>>2]|0;HEAP32[$156+4>>2]=HEAP32[$157+4>>2]|0;HEAP32[$156+8>>2]=HEAP32[$157+8>>2]|0;HEAP32[$156+12>>2]=HEAP32[$157+12>>2]|0;
    $158 = $newRoom$byval_copy6;
    $159 = $newRoom$byval_copy6;
    $160 = $newRoom;
    ;HEAP32[$159+0>>2]=HEAP32[$160+0>>2]|0;HEAP32[$159+4>>2]=HEAP32[$160+4>>2]|0;HEAP32[$159+8>>2]=HEAP32[$160+8>>2]|0;HEAP32[$159+12>>2]=HEAP32[$160+12>>2]|0;
    $161 = (_roomCollides($$byval_copy5,$newRoom$byval_copy6)|0);
    $162 = $newRoom$byval_copy6;
    $163 = $$byval_copy5;
    $164 = ($161<<24>>24)!=(0);
    if ($164) {
     label = 15;
     break;
    }
    $165 = $i;
    $166 = (($165) + 1)|0;
    $i = $166;
   }
   if ((label|0) == 15) {
    label = 0;
   }
   $167 = $i;
   $168 = $roomCount;
   $169 = ($167>>>0)>=($168>>>0);
   if ($169) {
    $170 = $roomCount;
    $171 = (($rooms) + ($170<<4)|0);
    $172 = $171;
    $173 = $newRoom;
    ;HEAP32[$172+0>>2]=HEAP32[$173+0>>2]|0;HEAP32[$172+4>>2]=HEAP32[$173+4>>2]|0;HEAP32[$172+8>>2]=HEAP32[$173+8>>2]|0;HEAP32[$172+12>>2]=HEAP32[$173+12>>2]|0;
    $174 = $roomCount;
    $175 = (($rooms) + ($174<<4)|0);
    $176 = (($175) + 8|0);
    $177 = $$byval_copy7;
    $178 = $$byval_copy7;
    $179 = $176;
    ;HEAP32[$178+0>>2]=HEAP32[$179+0>>2]|0;HEAP32[$178+4>>2]=HEAP32[$179+4>>2]|0;
    $180 = (_getRoomEnemyCount($$byval_copy7)|0);
    $181 = $$byval_copy7;
    $182 = $roomCount;
    $183 = (($roomEnemies) + ($182)|0);
    HEAP8[$183] = $180;
    $184 = $roomCount;
    $185 = (($roomEnemies) + ($184)|0);
    $186 = HEAP8[$185]|0;
    $187 = $186&255;
    $188 = $enemyCount;
    $189 = (($188) + ($187))|0;
    $enemyCount = $189;
    $190 = $roomCount;
    $191 = (($190) + 1)|0;
    $roomCount = $191;
    $192 = $roomCount;
    $193 = $6;
    $194 = ($192>>>0)>=($193>>>0);
    if ($194) {
     $195 = (_getRandom()|0);
     $196 = $7;
     $197 = $roomCount;
     $198 = (($196) - ($197))|0;
     $199 = (($195>>>0) % ($198>>>0))&-1;
     $200 = ($199|0)==(0);
     if ($200) {
      label = 21;
      break;
     }
    }
   }
  }
  $201 = $itCount;
  $202 = (($201) + 1)|0;
  $itCount = $202;
  $203 = $itCount;
  $204 = ($203>>>0)>=(3000);
  if ($204) {
   $roomCount = 1;
   $itCount = 0;
   $205 = ($rooms);
   $206 = (($205) + 8|0);
   _generateRoomSize($16);
   $207 = $206;
   $208 = $16;
   ;HEAP32[$207+0>>2]=HEAP32[$208+0>>2]|0;HEAP32[$207+4>>2]=HEAP32[$208+4>>2]|0;
   $209 = ($rooms);
   $210 = (($209) + 8|0);
   $211 = ($210);
   $212 = HEAP32[$211>>2]|0;
   $213 = (($212|0) / 2)&-1;
   $214 = (30 - ($213))|0;
   $215 = ($rooms);
   $216 = ($215);
   $217 = ($216);
   HEAP32[$217>>2] = $214;
   $218 = ($rooms);
   $219 = (($218) + 8|0);
   $220 = (($219) + 4|0);
   $221 = HEAP32[$220>>2]|0;
   $222 = (($221|0) / 2)&-1;
   $223 = (12 - ($222))|0;
   $224 = ($rooms);
   $225 = ($224);
   $226 = (($225) + 4|0);
   HEAP32[$226>>2] = $223;
   $227 = ($rooms);
   $228 = (($227) + 8|0);
   $229 = $$byval_copy8;
   $230 = $$byval_copy8;
   $231 = $228;
   ;HEAP32[$230+0>>2]=HEAP32[$231+0>>2]|0;HEAP32[$230+4>>2]=HEAP32[$231+4>>2]|0;
   $232 = (_getRoomEnemyCount($$byval_copy8)|0);
   $233 = $$byval_copy8;
   $234 = ($roomEnemies);
   HEAP8[$234] = $232;
   $235 = ($roomEnemies);
   $236 = HEAP8[$235]|0;
   $237 = $236&255;
   $enemyCount = $237;
  }
 }
 if ((label|0) == 21) {
 }
 $238 = $roomCount;
 $239 = $238&255;
 $240 = (($w) + 72|0);
 HEAP8[$240] = $239;
 $241 = $roomCount;
 $242 = $241<<4;
 $243 = (_malloc($242)|0);
 $244 = $243;
 $245 = (($w) + 68|0);
 HEAP32[$245>>2] = $244;
 $246 = (($w) + 68|0);
 $247 = HEAP32[$246>>2]|0;
 $248 = $247;
 $249 = $rooms;
 $250 = $roomCount;
 $251 = $250<<4;
 _memcpy(($248|0),($249|0),($251|0))|0;
 $252 = (($w) + 104|0);
 HEAP8[$252] = 0;
 $253 = $enemyCount;
 $254 = ($253*136)|0;
 $255 = (_malloc($254)|0);
 $256 = $255;
 $257 = (($w) + 100|0);
 HEAP32[$257>>2] = $256;
 $258 = (($w) + 100|0);
 $259 = HEAP32[$258>>2]|0;
 $260 = $259;
 $261 = $enemyCount;
 $262 = ($261*136)|0;
 _memset(($260|0),0,($262|0))|0;
 $i = 0;
 while(1) {
  $263 = $i;
  $264 = $roomCount;
  $265 = ($263>>>0)<($264>>>0);
  if (!($265)) {
   break;
  }
  $266 = $i;
  $267 = (($rooms) + ($266<<4)|0);
  $268 = ($267);
  $269 = (($268) + 4|0);
  $270 = HEAP32[$269>>2]|0;
  $y = $270;
  while(1) {
   $271 = $y;
   $272 = $i;
   $273 = (($rooms) + ($272<<4)|0);
   $274 = ($273);
   $275 = (($274) + 4|0);
   $276 = HEAP32[$275>>2]|0;
   $277 = $i;
   $278 = (($rooms) + ($277<<4)|0);
   $279 = (($278) + 8|0);
   $280 = (($279) + 4|0);
   $281 = HEAP32[$280>>2]|0;
   $282 = (($276) + ($281))|0;
   $283 = ($271>>>0)<($282>>>0);
   if (!($283)) {
    break;
   }
   $284 = $i;
   $285 = (($rooms) + ($284<<4)|0);
   $286 = ($285);
   $287 = ($286);
   $288 = HEAP32[$287>>2]|0;
   $x = $288;
   while(1) {
    $289 = $x;
    $290 = $i;
    $291 = (($rooms) + ($290<<4)|0);
    $292 = ($291);
    $293 = ($292);
    $294 = HEAP32[$293>>2]|0;
    $295 = $i;
    $296 = (($rooms) + ($295<<4)|0);
    $297 = (($296) + 8|0);
    $298 = ($297);
    $299 = HEAP32[$298>>2]|0;
    $300 = (($294) + ($299))|0;
    $301 = ($289>>>0)<($300>>>0);
    if (!($301)) {
     break;
    }
    $302 = $y;
    $303 = ($302*60)|0;
    $304 = $x;
    $305 = (($303) + ($304))|0;
    $306 = (($w) + 4|0);
    $307 = (($306) + 4|0);
    $308 = (($307) + 16|0);
    $309 = HEAP32[$308>>2]|0;
    $310 = (($309) + ($305)|0);
    HEAP8[$310] = 46;
    $311 = $x;
    $312 = (($311) + 1)|0;
    $x = $312;
   }
   $313 = (($w) + 4|0);
   $314 = $i;
   $315 = (($rooms) + ($314<<4)|0);
   $316 = ($315);
   $317 = ($316);
   $318 = HEAP32[$317>>2]|0;
   $319 = (($318) - 1)|0;
   $320 = $y;
   _drawTile($313,$319,$320,124);
   $321 = (($w) + 4|0);
   $322 = $i;
   $323 = (($rooms) + ($322<<4)|0);
   $324 = ($323);
   $325 = ($324);
   $326 = HEAP32[$325>>2]|0;
   $327 = $i;
   $328 = (($rooms) + ($327<<4)|0);
   $329 = (($328) + 8|0);
   $330 = ($329);
   $331 = HEAP32[$330>>2]|0;
   $332 = (($326) + ($331))|0;
   $333 = $y;
   _drawTile($321,$332,$333,124);
   $334 = $y;
   $335 = (($334) + 1)|0;
   $y = $335;
  }
  $336 = $i;
  $337 = (($rooms) + ($336<<4)|0);
  $338 = ($337);
  $339 = ($338);
  $340 = HEAP32[$339>>2]|0;
  $x = $340;
  while(1) {
   $341 = $x;
   $342 = $i;
   $343 = (($rooms) + ($342<<4)|0);
   $344 = ($343);
   $345 = ($344);
   $346 = HEAP32[$345>>2]|0;
   $347 = $i;
   $348 = (($rooms) + ($347<<4)|0);
   $349 = (($348) + 8|0);
   $350 = ($349);
   $351 = HEAP32[$350>>2]|0;
   $352 = (($346) + ($351))|0;
   $353 = ($341>>>0)<($352>>>0);
   if (!($353)) {
    break;
   }
   $354 = (($w) + 4|0);
   $355 = $x;
   $356 = $i;
   $357 = (($rooms) + ($356<<4)|0);
   $358 = ($357);
   $359 = (($358) + 4|0);
   $360 = HEAP32[$359>>2]|0;
   $361 = (($360) - 1)|0;
   _drawTile($354,$355,$361,45);
   $362 = (($w) + 4|0);
   $363 = $x;
   $364 = $i;
   $365 = (($rooms) + ($364<<4)|0);
   $366 = ($365);
   $367 = (($366) + 4|0);
   $368 = HEAP32[$367>>2]|0;
   $369 = $i;
   $370 = (($rooms) + ($369<<4)|0);
   $371 = (($370) + 8|0);
   $372 = (($371) + 4|0);
   $373 = HEAP32[$372>>2]|0;
   $374 = (($368) + ($373))|0;
   _drawTile($362,$363,$374,45);
   $375 = $x;
   $376 = (($375) + 1)|0;
   $x = $376;
  }
  $377 = $i;
  $378 = (($377) + 1)|0;
  $j = $378;
  while(1) {
   $379 = $j;
   $380 = $roomCount;
   $381 = ($379>>>0)<($380>>>0);
   if (!($381)) {
    break;
   }
   $382 = $i;
   $383 = (($rooms) + ($382<<4)|0);
   $384 = $j;
   $385 = (($rooms) + ($384<<4)|0);
   $386 = $$byval_copy9;
   $387 = $$byval_copy9;
   $388 = $383;
   ;HEAP32[$387+0>>2]=HEAP32[$388+0>>2]|0;HEAP32[$387+4>>2]=HEAP32[$388+4>>2]|0;HEAP32[$387+8>>2]=HEAP32[$388+8>>2]|0;HEAP32[$387+12>>2]=HEAP32[$388+12>>2]|0;
   $389 = $$byval_copy10;
   $390 = $$byval_copy10;
   $391 = $385;
   ;HEAP32[$390+0>>2]=HEAP32[$391+0>>2]|0;HEAP32[$390+4>>2]=HEAP32[$391+4>>2]|0;HEAP32[$390+8>>2]=HEAP32[$391+8>>2]|0;HEAP32[$390+12>>2]=HEAP32[$391+12>>2]|0;
   $392 = (_getRoomDistance($$byval_copy9,$$byval_copy10)|0);
   $393 = $$byval_copy10;
   $394 = $$byval_copy9;
   $dist = $392;
   $395 = $dist;
   $396 = $maxRoomDistance;
   $397 = ($395>>>0)>($396>>>0);
   if ($397) {
    $398 = $dist;
    $maxRoomDistance = $398;
    $399 = $i;
    $maxRoom1 = $399;
    $400 = $j;
    $maxRoom2 = $400;
   }
   $401 = $j;
   $402 = (($401) + 1)|0;
   $j = $402;
  }
  $403 = $i;
  $404 = (($403) + 1)|0;
  $i = $404;
 }
 $i = 0;
 while(1) {
  $405 = $i;
  $406 = $roomCount;
  $407 = ($405>>>0)<($406>>>0);
  if (!($407)) {
   break;
  }
  $408 = (($w) + 4|0);
  $409 = $i;
  $410 = (($rooms) + ($409<<4)|0);
  $411 = ($410);
  $412 = ($411);
  $413 = HEAP32[$412>>2]|0;
  $414 = (($413) - 1)|0;
  $415 = $i;
  $416 = (($rooms) + ($415<<4)|0);
  $417 = ($416);
  $418 = (($417) + 4|0);
  $419 = HEAP32[$418>>2]|0;
  $420 = (($419) - 1)|0;
  _drawTile($408,$414,$420,43);
  $421 = (($w) + 4|0);
  $422 = $i;
  $423 = (($rooms) + ($422<<4)|0);
  $424 = ($423);
  $425 = ($424);
  $426 = HEAP32[$425>>2]|0;
  $427 = $i;
  $428 = (($rooms) + ($427<<4)|0);
  $429 = (($428) + 8|0);
  $430 = ($429);
  $431 = HEAP32[$430>>2]|0;
  $432 = (($426) + ($431))|0;
  $433 = $i;
  $434 = (($rooms) + ($433<<4)|0);
  $435 = ($434);
  $436 = (($435) + 4|0);
  $437 = HEAP32[$436>>2]|0;
  $438 = (($437) - 1)|0;
  _drawTile($421,$432,$438,43);
  $439 = (($w) + 4|0);
  $440 = $i;
  $441 = (($rooms) + ($440<<4)|0);
  $442 = ($441);
  $443 = ($442);
  $444 = HEAP32[$443>>2]|0;
  $445 = $i;
  $446 = (($rooms) + ($445<<4)|0);
  $447 = (($446) + 8|0);
  $448 = ($447);
  $449 = HEAP32[$448>>2]|0;
  $450 = (($444) + ($449))|0;
  $451 = $i;
  $452 = (($rooms) + ($451<<4)|0);
  $453 = ($452);
  $454 = (($453) + 4|0);
  $455 = HEAP32[$454>>2]|0;
  $456 = $i;
  $457 = (($rooms) + ($456<<4)|0);
  $458 = (($457) + 8|0);
  $459 = (($458) + 4|0);
  $460 = HEAP32[$459>>2]|0;
  $461 = (($455) + ($460))|0;
  _drawTile($439,$450,$461,43);
  $462 = (($w) + 4|0);
  $463 = $i;
  $464 = (($rooms) + ($463<<4)|0);
  $465 = ($464);
  $466 = ($465);
  $467 = HEAP32[$466>>2]|0;
  $468 = (($467) - 1)|0;
  $469 = $i;
  $470 = (($rooms) + ($469<<4)|0);
  $471 = ($470);
  $472 = (($471) + 4|0);
  $473 = HEAP32[$472>>2]|0;
  $474 = $i;
  $475 = (($rooms) + ($474<<4)|0);
  $476 = (($475) + 8|0);
  $477 = (($476) + 4|0);
  $478 = HEAP32[$477>>2]|0;
  $479 = (($473) + ($478))|0;
  _drawTile($462,$468,$479,43);
  $480 = $i;
  $481 = $roomCount;
  $482 = (($481) - 1)|0;
  $483 = ($480>>>0)<($482>>>0);
  if ($483) {
   $484 = (($w) + 4|0);
   $485 = $i;
   $486 = (($doors) + ($485<<3)|0);
   $487 = ($486);
   $488 = HEAP32[$487>>2]|0;
   $489 = $i;
   $490 = (($doors) + ($489<<3)|0);
   $491 = (($490) + 4|0);
   $492 = HEAP32[$491>>2]|0;
   _drawTile($484,$488,$492,35);
  }
  $493 = $i;
  $494 = $maxRoom1;
  $495 = ($493|0)!=($494|0);
  if ($495) {
   $j = 0;
   while(1) {
    $496 = $j;
    $497 = $i;
    $498 = (($roomEnemies) + ($497)|0);
    $499 = HEAP8[$498]|0;
    $500 = $499&255;
    $501 = ($496>>>0)<($500>>>0);
    if (!($501)) {
     break;
    }
    $502 = (($w) + 104|0);
    $503 = HEAP8[$502]|0;
    $504 = (($503) + 1)<<24>>24;
    HEAP8[$502] = $504;
    $505 = $503&255;
    $506 = (($w) + 100|0);
    $507 = HEAP32[$506>>2]|0;
    $508 = (($507) + (($505*136)|0)|0);
    $509 = (($508) + 4|0);
    $510 = (($w) + 4|0);
    $511 = $i;
    $512 = (($rooms) + ($511<<4)|0);
    $513 = $$byval_copy11;
    $514 = $$byval_copy11;
    $515 = $512;
    ;HEAP32[$514+0>>2]=HEAP32[$515+0>>2]|0;HEAP32[$514+4>>2]=HEAP32[$515+4>>2]|0;HEAP32[$514+8>>2]=HEAP32[$515+8>>2]|0;HEAP32[$514+12>>2]=HEAP32[$515+12>>2]|0;
    _setTileRandom($17,$510,$$byval_copy11,5);
    $516 = $$byval_copy11;
    $517 = $509;
    $518 = $17;
    ;HEAP32[$517+0>>2]=HEAP32[$518+0>>2]|0;HEAP32[$517+4>>2]=HEAP32[$518+4>>2]|0;
    $519 = $j;
    $520 = (($519) + 1)|0;
    $j = $520;
   }
  }
  $521 = $i;
  $522 = (($521) + 1)|0;
  $i = $522;
 }
 $523 = (($w) + 76|0);
 $524 = (($w) + 84|0);
 $525 = (($w) + 4|0);
 $526 = $maxRoom1;
 $527 = (($rooms) + ($526<<4)|0);
 $528 = $$byval_copy12;
 $529 = $$byval_copy12;
 $530 = $527;
 ;HEAP32[$529+0>>2]=HEAP32[$530+0>>2]|0;HEAP32[$529+4>>2]=HEAP32[$530+4>>2]|0;HEAP32[$529+8>>2]=HEAP32[$530+8>>2]|0;HEAP32[$529+12>>2]=HEAP32[$530+12>>2]|0;
 _drawTileRandom($18,$525,$$byval_copy12,72);
 $531 = $$byval_copy12;
 $532 = $524;
 $533 = $18;
 ;HEAP32[$532+0>>2]=HEAP32[$533+0>>2]|0;HEAP32[$532+4>>2]=HEAP32[$533+4>>2]|0;
 $534 = $523;
 $535 = $524;
 ;HEAP32[$534+0>>2]=HEAP32[$535+0>>2]|0;HEAP32[$534+4>>2]=HEAP32[$535+4>>2]|0;
 $536 = (($w) + 4|0);
 $537 = $maxRoom1;
 $538 = (($rooms) + ($537<<4)|0);
 $539 = $$byval_copy13;
 $540 = $$byval_copy13;
 $541 = $538;
 ;HEAP32[$540+0>>2]=HEAP32[$541+0>>2]|0;HEAP32[$540+4>>2]=HEAP32[$541+4>>2]|0;HEAP32[$540+8>>2]=HEAP32[$541+8>>2]|0;HEAP32[$540+12>>2]=HEAP32[$541+12>>2]|0;
 _drawTileRandom($19,$536,$$byval_copy13,36);
 $542 = $$byval_copy13;
 $543 = $maxRoom1;
 $544 = $543&255;
 $545 = $w$byval_copy;
 $546 = $w$byval_copy;
 $547 = $w;
 _memcpy(($546|0),($547|0),276)|0;
 _showUpWorldRoom($w$byval_copy,$544);
 $548 = $w$byval_copy;
 $549 = (($w) + 92|0);
 $550 = (($w) + 4|0);
 $551 = $maxRoom2;
 $552 = (($rooms) + ($551<<4)|0);
 $553 = $$byval_copy14;
 $554 = $$byval_copy14;
 $555 = $552;
 ;HEAP32[$554+0>>2]=HEAP32[$555+0>>2]|0;HEAP32[$554+4>>2]=HEAP32[$555+4>>2]|0;HEAP32[$554+8>>2]=HEAP32[$555+8>>2]|0;HEAP32[$554+12>>2]=HEAP32[$555+12>>2]|0;
 _drawTileRandom($20,$550,$$byval_copy14,79);
 $556 = $$byval_copy14;
 $557 = $549;
 $558 = $20;
 ;HEAP32[$557+0>>2]=HEAP32[$558+0>>2]|0;HEAP32[$557+4>>2]=HEAP32[$558+4>>2]|0;
 $i = 0;
 while(1) {
  $559 = $i;
  $560 = $enemyCount;
  $561 = ($559>>>0)<($560>>>0);
  if (!($561)) {
   break;
  }
  $562 = $i;
  $563 = (($w) + 100|0);
  $564 = HEAP32[$563>>2]|0;
  $565 = (($564) + (($562*136)|0)|0);
  $566 = ($565);
  HEAP8[$566] = 1;
  $567 = $2;
  $568 = $567&255;
  $569 = (($568) + 1)|0;
  $570 = (_getRandom()|0);
  $571 = (($570|0) % 8)&-1;
  $572 = ($571|0)==(0);
  $573 = $572&1;
  $574 = (($569) + ($573))|0;
  $575 = $574&255;
  $576 = $i;
  $577 = (($w) + 100|0);
  $578 = HEAP32[$577>>2]|0;
  $579 = (($578) + (($576*136)|0)|0);
  $580 = (($579) + 132|0);
  HEAP8[$580] = $575;
  $j = 0;
  while(1) {
   $581 = $j;
   $582 = $i;
   $583 = (($w) + 100|0);
   $584 = HEAP32[$583>>2]|0;
   $585 = (($584) + (($582*136)|0)|0);
   $586 = (($585) + 132|0);
   $587 = HEAP8[$586]|0;
   $588 = $587&255;
   $589 = ($581>>>0)<($588>>>0);
   if (!($589)) {
    break;
   }
   $590 = $2;
   $591 = $590&255;
   $592 = $591<<1;
   $593 = (_getRandom()|0);
   $594 = (($593|0) % 3)&-1;
   $595 = (($592) + ($594))|0;
   $596 = (0)>($595|0);
   if ($596) {
    $603 = 0;
   } else {
    $597 = $2;
    $598 = $597&255;
    $599 = $598<<1;
    $600 = (_getRandom()|0);
    $601 = (($600|0) % 3)&-1;
    $602 = (($599) + ($601))|0;
    $603 = $602;
   }
   $level = $603;
   $604 = $j;
   $605 = $i;
   $606 = (($w) + 100|0);
   $607 = HEAP32[$606>>2]|0;
   $608 = (($607) + (($605*136)|0)|0);
   $609 = (($608) + 12|0);
   $610 = (($609) + (($604*24)|0)|0);
   $611 = (_getRandom()|0);
   $612 = (($611|0) % 24)&-1;
   $613 = ((((9832) + 3488|0)) + ($612<<6)|0);
   $614 = (($613) + 40|0);
   $615 = $610;
   $616 = $614;
   ;HEAP32[$615+0>>2]=HEAP32[$616+0>>2]|0;HEAP32[$615+4>>2]=HEAP32[$616+4>>2]|0;HEAP32[$615+8>>2]=HEAP32[$616+8>>2]|0;HEAP32[$615+12>>2]=HEAP32[$616+12>>2]|0;HEAP32[$615+16>>2]=HEAP32[$616+16>>2]|0;HEAP32[$615+20>>2]=HEAP32[$616+20>>2]|0;
   while(1) {
    $617 = $j;
    $618 = $i;
    $619 = (($w) + 100|0);
    $620 = HEAP32[$619>>2]|0;
    $621 = (($620) + (($618*136)|0)|0);
    $622 = (($621) + 12|0);
    $623 = (($622) + (($617*24)|0)|0);
    $624 = (($623) + 7|0);
    $625 = HEAP8[$624]|0;
    $626 = $625&255;
    $627 = $level;
    $628 = ($626|0)!=($627|0);
    if (!($628)) {
     break;
    }
    $629 = $i;
    $630 = (($w) + 100|0);
    $631 = HEAP32[$630>>2]|0;
    $632 = (($631) + (($629*136)|0)|0);
    $633 = (($632) + 12|0);
    $634 = ($633);
    $635 = $j;
    $636 = (($634) + (($635*24)|0)|0);
    _levelUpElementity($636);
   }
   $637 = $j;
   $638 = (($637) + 1)|0;
   $j = $638;
  }
  $639 = $i;
  $640 = (($639) + 1)|0;
  $i = $640;
 }
 $641 = (_getRandom()|0);
 $642 = (($641|0) % 6)&-1;
 $643 = $642&255;
 $644 = (($w) + 228|0);
 HEAP8[$644] = $643;
 $i = 0;
 while(1) {
  $645 = $i;
  $646 = (($w) + 228|0);
  $647 = HEAP8[$646]|0;
  $648 = $647&255;
  $649 = ($645>>>0)<($648>>>0);
  if (!($649)) {
   break;
  }
  $650 = $2;
  $651 = $650&255;
  $652 = $651<<1;
  $653 = (_getRandom()|0);
  $654 = (($653|0) % 3)&-1;
  $655 = (($652) + ($654))|0;
  $656 = (0)>($655|0);
  if ($656) {
   $663 = 0;
  } else {
   $657 = $2;
   $658 = $657&255;
   $659 = $658<<1;
   $660 = (_getRandom()|0);
   $661 = (($660|0) % 3)&-1;
   $662 = (($659) + ($661))|0;
   $663 = $662;
  }
  $level = $663;
  $664 = $i;
  $665 = (($w) + 108|0);
  $666 = (($665) + (($664*24)|0)|0);
  $667 = (_getRandom()|0);
  $668 = (($667|0) % 24)&-1;
  $669 = ((((9832) + 3488|0)) + ($668<<6)|0);
  $670 = (($669) + 40|0);
  $671 = $666;
  $672 = $670;
  ;HEAP32[$671+0>>2]=HEAP32[$672+0>>2]|0;HEAP32[$671+4>>2]=HEAP32[$672+4>>2]|0;HEAP32[$671+8>>2]=HEAP32[$672+8>>2]|0;HEAP32[$671+12>>2]=HEAP32[$672+12>>2]|0;HEAP32[$671+16>>2]=HEAP32[$672+16>>2]|0;HEAP32[$671+20>>2]=HEAP32[$672+20>>2]|0;
  while(1) {
   $673 = $i;
   $674 = (($w) + 108|0);
   $675 = (($674) + (($673*24)|0)|0);
   $676 = (($675) + 7|0);
   $677 = HEAP8[$676]|0;
   $678 = $677&255;
   $679 = $level;
   $680 = ($678|0)!=($679|0);
   if (!($680)) {
    break;
   }
   $681 = (($w) + 108|0);
   $682 = ($681);
   $683 = $i;
   $684 = (($682) + (($683*24)|0)|0);
   _levelUpElementity($684);
  }
  $685 = $i;
  $686 = (($w) + 108|0);
  $687 = (($686) + (($685*24)|0)|0);
  $688 = (($687) + 6|0);
  $689 = HEAP8[$688]|0;
  $690 = $689&255;
  $691 = ((((9832) + 3488|0)) + ($690<<6)|0);
  $692 = $level;
  $693 = (($692) - 1)|0;
  $694 = (0)>($693|0);
  if ($694) {
   $697 = 0;
  } else {
   $695 = $level;
   $696 = (($695) - 1)|0;
   $697 = $696;
  }
  $698 = $697&255;
  $699 = (_getNextLevelExperience($691,$698)|0);
  $700 = $i;
  $701 = (($w) + 108|0);
  $702 = (($701) + (($700*24)|0)|0);
  $703 = (($702) + 12|0);
  HEAP32[$703>>2] = $699;
  $704 = $i;
  $705 = (($704) + 1)|0;
  $i = $705;
 }
 $706 = $agg$result;
 $707 = $w;
 _memcpy(($706|0),($707|0),276)|0;
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$$i = 0, $$3$i = 0, $$4$i = 0, $$c$i$i = 0, $$c6$i$i = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i25 = 0, $$pre$i25$i = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i26$iZ2D = 0, $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre57$i$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0;
 var $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i14$i = 0, $$sum$i15$i = 0, $$sum$i18$i = 0, $$sum$i21$i = 0, $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i16$i = 0, $$sum1$i22$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum10$pre$i$i = 0, $$sum107$i = 0;
 var $$sum108$i = 0, $$sum109$i = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum11$i24$i = 0, $$sum110$i = 0, $$sum111$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0, $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum13$i = 0;
 var $$sum13$i$i = 0, $$sum14$i$i = 0, $$sum14$pre$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0, $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i17$i = 0, $$sum2$i19$i = 0, $$sum2$i23$i = 0, $$sum2$pre$i = 0, $$sum20$i$i = 0;
 var $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum26$pre$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i$i = 0, $$sum3$i27 = 0, $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0;
 var $$sum4$i28 = 0, $$sum40$i$i = 0, $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0, $$sum8$pre = 0, $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $1 = 0, $10 = 0, $100 = 0;
 var $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0, $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0;
 var $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0, $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0;
 var $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0, $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0;
 var $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0, $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $1071 = 0, $1072 = 0;
 var $1073 = 0, $1074 = 0, $1075 = 0, $1076 = 0, $1077 = 0, $1078 = 0, $1079 = 0, $108 = 0, $1080 = 0, $1081 = 0, $1082 = 0, $1083 = 0, $1084 = 0, $1085 = 0, $1086 = 0, $1087 = 0, $1088 = 0, $1089 = 0, $109 = 0, $1090 = 0;
 var $1091 = 0, $1092 = 0, $1093 = 0, $1094 = 0, $1095 = 0, $1096 = 0, $1097 = 0, $1098 = 0, $1099 = 0, $11 = 0, $110 = 0, $1100 = 0, $1101 = 0, $1102 = 0, $1103 = 0, $1104 = 0, $1105 = 0, $1106 = 0, $1107 = 0, $1108 = 0;
 var $1109 = 0, $111 = 0, $1110 = 0, $1111 = 0, $1112 = 0, $1113 = 0, $1114 = 0, $1114$phi = 0, $1115 = 0, $1116 = 0, $1117 = 0, $1118 = 0, $1119 = 0, $112 = 0, $1120 = 0, $1121 = 0, $1122 = 0, $1123 = 0, $1124 = 0, $1125 = 0;
 var $1126 = 0, $1127 = 0, $1128 = 0, $1129 = 0, $113 = 0, $1130 = 0, $1131 = 0, $1132 = 0, $1133 = 0, $1134 = 0, $1135 = 0, $1136 = 0, $1137 = 0, $1138 = 0, $1139 = 0, $114 = 0, $1140 = 0, $1141 = 0, $1142 = 0, $1143 = 0;
 var $1144 = 0, $1145 = 0, $1146 = 0, $1147 = 0, $1148 = 0, $1149 = 0, $115 = 0, $1150 = 0, $1151 = 0, $1152 = 0, $1153 = 0, $1154 = 0, $1155 = 0, $1156 = 0, $1157 = 0, $1158 = 0, $1159 = 0, $116 = 0, $1160 = 0, $1161 = 0;
 var $1162 = 0, $1163 = 0, $1164 = 0, $1165 = 0, $1166 = 0, $1167 = 0, $1168 = 0, $1169 = 0, $117 = 0, $1170 = 0, $1171 = 0, $1172 = 0, $1173 = 0, $1174 = 0, $1175 = 0, $1176 = 0, $1177 = 0, $1178 = 0, $1179 = 0, $118 = 0;
 var $1180 = 0, $1181 = 0, $1182 = 0, $1183 = 0, $1184 = 0, $1185 = 0, $1186 = 0, $1187 = 0, $1188 = 0, $1189 = 0, $119 = 0, $1190 = 0, $1191 = 0, $1192 = 0, $1193 = 0, $1194 = 0, $1195 = 0, $1196 = 0, $1197 = 0, $1198 = 0;
 var $1199 = 0, $12 = 0, $120 = 0, $1200 = 0, $1201 = 0, $1202 = 0, $1203 = 0, $1204 = 0, $1205 = 0, $1206 = 0, $1207 = 0, $1208 = 0, $1209 = 0, $121 = 0, $1210 = 0, $1211 = 0, $1212 = 0, $1213 = 0, $1214 = 0, $1215 = 0;
 var $1216 = 0, $1217 = 0, $1218 = 0, $1219 = 0, $122 = 0, $1220 = 0, $1221 = 0, $1222 = 0, $1223 = 0, $1224 = 0, $1225 = 0, $1226 = 0, $1227 = 0, $1228 = 0, $1229 = 0, $123 = 0, $1230 = 0, $1231 = 0, $1232 = 0, $1233 = 0;
 var $1234 = 0, $1235 = 0, $1236 = 0, $1237 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0;
 var $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0;
 var $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0;
 var $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0;
 var $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0;
 var $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0;
 var $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0;
 var $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0;
 var $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0;
 var $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0;
 var $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0;
 var $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0;
 var $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0;
 var $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0;
 var $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0;
 var $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0;
 var $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0;
 var $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0;
 var $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0;
 var $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0;
 var $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0;
 var $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0;
 var $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0;
 var $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0;
 var $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0, $804 = 0;
 var $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0, $822 = 0;
 var $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0, $840 = 0;
 var $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0, $859 = 0;
 var $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0, $877 = 0;
 var $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0, $895 = 0;
 var $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0, $912 = 0;
 var $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0, $930 = 0;
 var $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0, $949 = 0;
 var $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0, $967 = 0;
 var $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0, $985 = 0;
 var $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0, $F5$0$i = 0;
 var $I1$0$c$i$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$025$i = 0, $K2$014$i$i = 0, $K8$052$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$phi = 0, $R$0$i$phi = 0, $R$0$i18 = 0, $R$0$i18$phi = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$phi = 0, $RP$0$i$phi = 0;
 var $RP$0$i17 = 0, $RP$0$i17$phi = 0, $T$0$c$i$i = 0, $T$0$c7$i$i = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i28$i = 0, $T$013$i$i = 0, $T$013$i$i$phi = 0, $T$024$i = 0, $T$024$i$phi = 0, $T$051$i$i = 0, $T$051$i$i$phi = 0, $br$0$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $i$02$i$i$phi = 0;
 var $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0, $notlhs$i = 0, $notrhs$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i29 = 0, $or$cond1$i = 0, $or$cond10$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond49$i = 0, $or$cond5$i = 0, $or$cond6$i = 0, $or$cond8$not$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i15 = 0;
 var $rsize$1$i = 0, $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$329$i = 0, $rsize$329$i$phi = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$075$i = 0, $sp$168$i = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0;
 var $t$2$v$3$i = 0, $t$228$i = 0, $t$228$i$phi = 0, $tbase$0$i = 0, $tbase$247$i = 0, $tsize$0$i = 0, $tsize$0323841$i = 0, $tsize$1$i = 0, $tsize$246$i = 0, $v$0$i = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$330$i = 0, $v$330$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($bytes>>>0)<(245);
 do {
  if ($1) {
   $2 = ($bytes>>>0)<(11);
   if ($2) {
    $5 = 16;
   } else {
    $3 = (($bytes) + 11)|0;
    $4 = $3 & -8;
    $5 = $4;
   }
   $6 = $5 >>> 3;
   $7 = HEAP32[((18176))>>2]|0;
   $8 = $7 >>> $6;
   $9 = $8 & 3;
   $10 = ($9|0)==(0);
   if (!($10)) {
    $11 = $8 & 1;
    $12 = $11 ^ 1;
    $13 = (($12) + ($6))|0;
    $14 = $13 << 1;
    $15 = (((18176) + ($14<<2)|0) + 40|0);
    $16 = $15;
    $$sum10 = (($14) + 2)|0;
    $17 = (((18176) + ($$sum10<<2)|0) + 40|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = (($18) + 8|0);
    $20 = HEAP32[$19>>2]|0;
    $21 = ($16|0)==($20|0);
    do {
     if ($21) {
      $22 = 1 << $13;
      $23 = $22 ^ -1;
      $24 = $7 & $23;
      HEAP32[((18176))>>2] = $24;
     } else {
      $25 = $20;
      $26 = HEAP32[(((18176) + 16|0))>>2]|0;
      $27 = ($25>>>0)<($26>>>0);
      if ($27) {
       _abort();
       // unreachable;
      }
      $28 = (($20) + 12|0);
      $29 = HEAP32[$28>>2]|0;
      $30 = ($29|0)==($18|0);
      if ($30) {
       HEAP32[$28>>2] = $16;
       HEAP32[$17>>2] = $20;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $31 = $13 << 3;
    $32 = $31 | 3;
    $33 = (($18) + 4|0);
    HEAP32[$33>>2] = $32;
    $34 = $18;
    $$sum1112 = $31 | 4;
    $35 = (($34) + ($$sum1112)|0);
    $36 = $35;
    $37 = HEAP32[$36>>2]|0;
    $38 = $37 | 1;
    HEAP32[$36>>2] = $38;
    $39 = $19;
    $mem$0 = $39;
    STACKTOP = sp;return ($mem$0|0);
   }
   $40 = HEAP32[(((18176) + 8|0))>>2]|0;
   $41 = ($5>>>0)>($40>>>0);
   if (!($41)) {
    $nb$0 = $5;
    break;
   }
   $42 = ($8|0)==(0);
   if (!($42)) {
    $43 = $8 << $6;
    $44 = 2 << $6;
    $45 = (0 - ($44))|0;
    $46 = $44 | $45;
    $47 = $43 & $46;
    $48 = (0 - ($47))|0;
    $49 = $47 & $48;
    $50 = (($49) + -1)|0;
    $51 = $50 >>> 12;
    $52 = $51 & 16;
    $53 = $50 >>> $52;
    $54 = $53 >>> 5;
    $55 = $54 & 8;
    $56 = $55 | $52;
    $57 = $53 >>> $55;
    $58 = $57 >>> 2;
    $59 = $58 & 4;
    $60 = $56 | $59;
    $61 = $57 >>> $59;
    $62 = $61 >>> 1;
    $63 = $62 & 2;
    $64 = $60 | $63;
    $65 = $61 >>> $63;
    $66 = $65 >>> 1;
    $67 = $66 & 1;
    $68 = $64 | $67;
    $69 = $65 >>> $67;
    $70 = (($68) + ($69))|0;
    $71 = $70 << 1;
    $72 = (((18176) + ($71<<2)|0) + 40|0);
    $73 = $72;
    $$sum4 = (($71) + 2)|0;
    $74 = (((18176) + ($$sum4<<2)|0) + 40|0);
    $75 = HEAP32[$74>>2]|0;
    $76 = (($75) + 8|0);
    $77 = HEAP32[$76>>2]|0;
    $78 = ($73|0)==($77|0);
    do {
     if ($78) {
      $79 = 1 << $70;
      $80 = $79 ^ -1;
      $81 = $7 & $80;
      HEAP32[((18176))>>2] = $81;
     } else {
      $82 = $77;
      $83 = HEAP32[(((18176) + 16|0))>>2]|0;
      $84 = ($82>>>0)<($83>>>0);
      if ($84) {
       _abort();
       // unreachable;
      }
      $85 = (($77) + 12|0);
      $86 = HEAP32[$85>>2]|0;
      $87 = ($86|0)==($75|0);
      if ($87) {
       HEAP32[$85>>2] = $73;
       HEAP32[$74>>2] = $77;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $88 = $70 << 3;
    $89 = (($88) - ($5))|0;
    $90 = $5 | 3;
    $91 = (($75) + 4|0);
    HEAP32[$91>>2] = $90;
    $92 = $75;
    $93 = (($92) + ($5)|0);
    $94 = $93;
    $95 = $89 | 1;
    $$sum56 = $5 | 4;
    $96 = (($92) + ($$sum56)|0);
    $97 = $96;
    HEAP32[$97>>2] = $95;
    $98 = (($92) + ($88)|0);
    $99 = $98;
    HEAP32[$99>>2] = $89;
    $100 = HEAP32[(((18176) + 8|0))>>2]|0;
    $101 = ($100|0)==(0);
    if (!($101)) {
     $102 = HEAP32[(((18176) + 20|0))>>2]|0;
     $103 = $100 >>> 3;
     $104 = $103 << 1;
     $105 = (((18176) + ($104<<2)|0) + 40|0);
     $106 = $105;
     $107 = HEAP32[((18176))>>2]|0;
     $108 = 1 << $103;
     $109 = $107 & $108;
     $110 = ($109|0)==(0);
     do {
      if ($110) {
       $111 = $107 | $108;
       HEAP32[((18176))>>2] = $111;
       $$sum8$pre = (($104) + 2)|0;
       $$pre = (((18176) + ($$sum8$pre<<2)|0) + 40|0);
       $$pre$phiZ2D = $$pre;$F4$0 = $106;
      } else {
       $$sum9 = (($104) + 2)|0;
       $112 = (((18176) + ($$sum9<<2)|0) + 40|0);
       $113 = HEAP32[$112>>2]|0;
       $114 = $113;
       $115 = HEAP32[(((18176) + 16|0))>>2]|0;
       $116 = ($114>>>0)<($115>>>0);
       if (!($116)) {
        $$pre$phiZ2D = $112;$F4$0 = $113;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     HEAP32[$$pre$phiZ2D>>2] = $102;
     $117 = (($F4$0) + 12|0);
     HEAP32[$117>>2] = $102;
     $118 = (($102) + 8|0);
     HEAP32[$118>>2] = $F4$0;
     $119 = (($102) + 12|0);
     HEAP32[$119>>2] = $106;
    }
    HEAP32[(((18176) + 8|0))>>2] = $89;
    HEAP32[(((18176) + 20|0))>>2] = $94;
    $120 = $76;
    $mem$0 = $120;
    STACKTOP = sp;return ($mem$0|0);
   }
   $121 = HEAP32[(((18176) + 4|0))>>2]|0;
   $122 = ($121|0)==(0);
   if ($122) {
    $nb$0 = $5;
    break;
   }
   $123 = (0 - ($121))|0;
   $124 = $121 & $123;
   $125 = (($124) + -1)|0;
   $126 = $125 >>> 12;
   $127 = $126 & 16;
   $128 = $125 >>> $127;
   $129 = $128 >>> 5;
   $130 = $129 & 8;
   $131 = $130 | $127;
   $132 = $128 >>> $130;
   $133 = $132 >>> 2;
   $134 = $133 & 4;
   $135 = $131 | $134;
   $136 = $132 >>> $134;
   $137 = $136 >>> 1;
   $138 = $137 & 2;
   $139 = $135 | $138;
   $140 = $136 >>> $138;
   $141 = $140 >>> 1;
   $142 = $141 & 1;
   $143 = $139 | $142;
   $144 = $140 >>> $142;
   $145 = (($143) + ($144))|0;
   $146 = (((18176) + ($145<<2)|0) + 304|0);
   $147 = HEAP32[$146>>2]|0;
   $148 = (($147) + 4|0);
   $149 = HEAP32[$148>>2]|0;
   $150 = $149 & -8;
   $151 = (($150) - ($5))|0;
   $rsize$0$i = $151;$t$0$i = $147;$v$0$i = $147;
   while(1) {
    $152 = (($t$0$i) + 16|0);
    $153 = HEAP32[$152>>2]|0;
    $154 = ($153|0)==(0|0);
    if ($154) {
     $155 = (($t$0$i) + 20|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==(0|0);
     if ($157) {
      break;
     } else {
      $158 = $156;
     }
    } else {
     $158 = $153;
    }
    $159 = (($158) + 4|0);
    $160 = HEAP32[$159>>2]|0;
    $161 = $160 & -8;
    $162 = (($161) - ($5))|0;
    $163 = ($162>>>0)<($rsize$0$i>>>0);
    $$rsize$0$i = $163 ? $162 : $rsize$0$i;
    $$v$0$i = $163 ? $158 : $v$0$i;
    $rsize$0$i = $$rsize$0$i;$t$0$i = $158;$v$0$i = $$v$0$i;
   }
   $164 = $v$0$i;
   $165 = HEAP32[(((18176) + 16|0))>>2]|0;
   $166 = ($164>>>0)<($165>>>0);
   if ($166) {
    _abort();
    // unreachable;
   }
   $167 = (($164) + ($5)|0);
   $168 = $167;
   $169 = ($164>>>0)<($167>>>0);
   if (!($169)) {
    _abort();
    // unreachable;
   }
   $170 = (($v$0$i) + 24|0);
   $171 = HEAP32[$170>>2]|0;
   $172 = (($v$0$i) + 12|0);
   $173 = HEAP32[$172>>2]|0;
   $174 = ($173|0)==($v$0$i|0);
   do {
    if ($174) {
     $185 = (($v$0$i) + 20|0);
     $186 = HEAP32[$185>>2]|0;
     $187 = ($186|0)==(0|0);
     if ($187) {
      $188 = (($v$0$i) + 16|0);
      $189 = HEAP32[$188>>2]|0;
      $190 = ($189|0)==(0|0);
      if ($190) {
       $R$1$i = 0;
       break;
      } else {
       $R$0$i = $189;$RP$0$i = $188;
      }
     } else {
      $R$0$i = $186;$RP$0$i = $185;
     }
     while(1) {
      $191 = (($R$0$i) + 20|0);
      $192 = HEAP32[$191>>2]|0;
      $193 = ($192|0)==(0|0);
      if (!($193)) {
       $RP$0$i$phi = $191;$R$0$i$phi = $192;$RP$0$i = $RP$0$i$phi;$R$0$i = $R$0$i$phi;
       continue;
      }
      $194 = (($R$0$i) + 16|0);
      $195 = HEAP32[$194>>2]|0;
      $196 = ($195|0)==(0|0);
      if ($196) {
       break;
      } else {
       $R$0$i = $195;$RP$0$i = $194;
      }
     }
     $197 = $RP$0$i;
     $198 = ($197>>>0)<($165>>>0);
     if ($198) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0$i>>2] = 0;
      $R$1$i = $R$0$i;
      break;
     }
    } else {
     $175 = (($v$0$i) + 8|0);
     $176 = HEAP32[$175>>2]|0;
     $177 = $176;
     $178 = ($177>>>0)<($165>>>0);
     if ($178) {
      _abort();
      // unreachable;
     }
     $179 = (($176) + 12|0);
     $180 = HEAP32[$179>>2]|0;
     $181 = ($180|0)==($v$0$i|0);
     if (!($181)) {
      _abort();
      // unreachable;
     }
     $182 = (($173) + 8|0);
     $183 = HEAP32[$182>>2]|0;
     $184 = ($183|0)==($v$0$i|0);
     if ($184) {
      HEAP32[$179>>2] = $173;
      HEAP32[$182>>2] = $176;
      $R$1$i = $173;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $199 = ($171|0)==(0|0);
   L78: do {
    if (!($199)) {
     $200 = (($v$0$i) + 28|0);
     $201 = HEAP32[$200>>2]|0;
     $202 = (((18176) + ($201<<2)|0) + 304|0);
     $203 = HEAP32[$202>>2]|0;
     $204 = ($v$0$i|0)==($203|0);
     do {
      if ($204) {
       HEAP32[$202>>2] = $R$1$i;
       $cond$i = ($R$1$i|0)==(0|0);
       if (!($cond$i)) {
        break;
       }
       $205 = 1 << $201;
       $206 = $205 ^ -1;
       $207 = HEAP32[(((18176) + 4|0))>>2]|0;
       $208 = $207 & $206;
       HEAP32[(((18176) + 4|0))>>2] = $208;
       break L78;
      } else {
       $209 = $171;
       $210 = HEAP32[(((18176) + 16|0))>>2]|0;
       $211 = ($209>>>0)<($210>>>0);
       if ($211) {
        _abort();
        // unreachable;
       }
       $212 = (($171) + 16|0);
       $213 = HEAP32[$212>>2]|0;
       $214 = ($213|0)==($v$0$i|0);
       if ($214) {
        HEAP32[$212>>2] = $R$1$i;
       } else {
        $215 = (($171) + 20|0);
        HEAP32[$215>>2] = $R$1$i;
       }
       $216 = ($R$1$i|0)==(0|0);
       if ($216) {
        break L78;
       }
      }
     } while(0);
     $217 = $R$1$i;
     $218 = HEAP32[(((18176) + 16|0))>>2]|0;
     $219 = ($217>>>0)<($218>>>0);
     if ($219) {
      _abort();
      // unreachable;
     }
     $220 = (($R$1$i) + 24|0);
     HEAP32[$220>>2] = $171;
     $221 = (($v$0$i) + 16|0);
     $222 = HEAP32[$221>>2]|0;
     $223 = ($222|0)==(0|0);
     do {
      if (!($223)) {
       $224 = $222;
       $225 = HEAP32[(((18176) + 16|0))>>2]|0;
       $226 = ($224>>>0)<($225>>>0);
       if ($226) {
        _abort();
        // unreachable;
       } else {
        $227 = (($R$1$i) + 16|0);
        HEAP32[$227>>2] = $222;
        $228 = (($222) + 24|0);
        HEAP32[$228>>2] = $R$1$i;
        break;
       }
      }
     } while(0);
     $229 = (($v$0$i) + 20|0);
     $230 = HEAP32[$229>>2]|0;
     $231 = ($230|0)==(0|0);
     if ($231) {
      break;
     }
     $232 = $230;
     $233 = HEAP32[(((18176) + 16|0))>>2]|0;
     $234 = ($232>>>0)<($233>>>0);
     if ($234) {
      _abort();
      // unreachable;
     } else {
      $235 = (($R$1$i) + 20|0);
      HEAP32[$235>>2] = $230;
      $236 = (($230) + 24|0);
      HEAP32[$236>>2] = $R$1$i;
      break;
     }
    }
   } while(0);
   $237 = ($rsize$0$i>>>0)<(16);
   if ($237) {
    $238 = (($rsize$0$i) + ($5))|0;
    $239 = $238 | 3;
    $240 = (($v$0$i) + 4|0);
    HEAP32[$240>>2] = $239;
    $$sum4$i = (($238) + 4)|0;
    $241 = (($164) + ($$sum4$i)|0);
    $242 = $241;
    $243 = HEAP32[$242>>2]|0;
    $244 = $243 | 1;
    HEAP32[$242>>2] = $244;
   } else {
    $245 = $5 | 3;
    $246 = (($v$0$i) + 4|0);
    HEAP32[$246>>2] = $245;
    $247 = $rsize$0$i | 1;
    $$sum$i35 = $5 | 4;
    $248 = (($164) + ($$sum$i35)|0);
    $249 = $248;
    HEAP32[$249>>2] = $247;
    $$sum1$i = (($rsize$0$i) + ($5))|0;
    $250 = (($164) + ($$sum1$i)|0);
    $251 = $250;
    HEAP32[$251>>2] = $rsize$0$i;
    $252 = HEAP32[(((18176) + 8|0))>>2]|0;
    $253 = ($252|0)==(0);
    if (!($253)) {
     $254 = HEAP32[(((18176) + 20|0))>>2]|0;
     $255 = $252 >>> 3;
     $256 = $255 << 1;
     $257 = (((18176) + ($256<<2)|0) + 40|0);
     $258 = $257;
     $259 = HEAP32[((18176))>>2]|0;
     $260 = 1 << $255;
     $261 = $259 & $260;
     $262 = ($261|0)==(0);
     do {
      if ($262) {
       $263 = $259 | $260;
       HEAP32[((18176))>>2] = $263;
       $$sum2$pre$i = (($256) + 2)|0;
       $$pre$i = (((18176) + ($$sum2$pre$i<<2)|0) + 40|0);
       $$pre$phi$iZ2D = $$pre$i;$F1$0$i = $258;
      } else {
       $$sum3$i = (($256) + 2)|0;
       $264 = (((18176) + ($$sum3$i<<2)|0) + 40|0);
       $265 = HEAP32[$264>>2]|0;
       $266 = $265;
       $267 = HEAP32[(((18176) + 16|0))>>2]|0;
       $268 = ($266>>>0)<($267>>>0);
       if (!($268)) {
        $$pre$phi$iZ2D = $264;$F1$0$i = $265;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     HEAP32[$$pre$phi$iZ2D>>2] = $254;
     $269 = (($F1$0$i) + 12|0);
     HEAP32[$269>>2] = $254;
     $270 = (($254) + 8|0);
     HEAP32[$270>>2] = $F1$0$i;
     $271 = (($254) + 12|0);
     HEAP32[$271>>2] = $258;
    }
    HEAP32[(((18176) + 8|0))>>2] = $rsize$0$i;
    HEAP32[(((18176) + 20|0))>>2] = $168;
   }
   $272 = (($v$0$i) + 8|0);
   $273 = $272;
   $mem$0 = $273;
   STACKTOP = sp;return ($mem$0|0);
  } else {
   $274 = ($bytes>>>0)>(4294967231);
   if ($274) {
    $nb$0 = -1;
    break;
   }
   $275 = (($bytes) + 11)|0;
   $276 = $275 & -8;
   $277 = HEAP32[(((18176) + 4|0))>>2]|0;
   $278 = ($277|0)==(0);
   if ($278) {
    $nb$0 = $276;
    break;
   }
   $279 = (0 - ($276))|0;
   $280 = $275 >>> 8;
   $281 = ($280|0)==(0);
   do {
    if ($281) {
     $idx$0$i = 0;
    } else {
     $282 = ($276>>>0)>(16777215);
     if ($282) {
      $idx$0$i = 31;
      break;
     }
     $283 = (($280) + 1048320)|0;
     $284 = $283 >>> 16;
     $285 = $284 & 8;
     $286 = $280 << $285;
     $287 = (($286) + 520192)|0;
     $288 = $287 >>> 16;
     $289 = $288 & 4;
     $290 = $289 | $285;
     $291 = $286 << $289;
     $292 = (($291) + 245760)|0;
     $293 = $292 >>> 16;
     $294 = $293 & 2;
     $295 = $290 | $294;
     $296 = (14 - ($295))|0;
     $297 = $291 << $294;
     $298 = $297 >>> 15;
     $299 = (($296) + ($298))|0;
     $300 = $299 << 1;
     $301 = (($299) + 7)|0;
     $302 = $276 >>> $301;
     $303 = $302 & 1;
     $304 = $303 | $300;
     $idx$0$i = $304;
    }
   } while(0);
   $305 = (((18176) + ($idx$0$i<<2)|0) + 304|0);
   $306 = HEAP32[$305>>2]|0;
   $307 = ($306|0)==(0|0);
   L126: do {
    if ($307) {
     $rsize$2$i = $279;$t$1$i = 0;$v$2$i = 0;
    } else {
     $308 = ($idx$0$i|0)==(31);
     if ($308) {
      $311 = 0;
     } else {
      $309 = $idx$0$i >>> 1;
      $310 = (25 - ($309))|0;
      $311 = $310;
     }
     $312 = $276 << $311;
     $rsize$0$i15 = $279;$rst$0$i = 0;$sizebits$0$i = $312;$t$0$i14 = $306;$v$0$i16 = 0;
     while(1) {
      $313 = (($t$0$i14) + 4|0);
      $314 = HEAP32[$313>>2]|0;
      $315 = $314 & -8;
      $316 = (($315) - ($276))|0;
      $317 = ($316>>>0)<($rsize$0$i15>>>0);
      if ($317) {
       $318 = ($315|0)==($276|0);
       if ($318) {
        $rsize$2$i = $316;$t$1$i = $t$0$i14;$v$2$i = $t$0$i14;
        break L126;
       } else {
        $rsize$1$i = $316;$v$1$i = $t$0$i14;
       }
      } else {
       $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
      }
      $319 = (($t$0$i14) + 20|0);
      $320 = HEAP32[$319>>2]|0;
      $321 = $sizebits$0$i >>> 31;
      $322 = ((($t$0$i14) + ($321<<2)|0) + 16|0);
      $323 = HEAP32[$322>>2]|0;
      $324 = ($320|0)==(0|0);
      $325 = ($320|0)==($323|0);
      $or$cond$i = $324 | $325;
      $rst$1$i = $or$cond$i ? $rst$0$i : $320;
      $326 = ($323|0)==(0|0);
      $327 = $sizebits$0$i << 1;
      if ($326) {
       $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
       break;
      } else {
       $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $327;$t$0$i14 = $323;$v$0$i16 = $v$1$i;
      }
     }
    }
   } while(0);
   $328 = ($t$1$i|0)==(0|0);
   $329 = ($v$2$i|0)==(0|0);
   $or$cond19$i = $328 & $329;
   if ($or$cond19$i) {
    $330 = 2 << $idx$0$i;
    $331 = (0 - ($330))|0;
    $332 = $330 | $331;
    $333 = $277 & $332;
    $334 = ($333|0)==(0);
    if ($334) {
     $nb$0 = $276;
     break;
    }
    $335 = (0 - ($333))|0;
    $336 = $333 & $335;
    $337 = (($336) + -1)|0;
    $338 = $337 >>> 12;
    $339 = $338 & 16;
    $340 = $337 >>> $339;
    $341 = $340 >>> 5;
    $342 = $341 & 8;
    $343 = $342 | $339;
    $344 = $340 >>> $342;
    $345 = $344 >>> 2;
    $346 = $345 & 4;
    $347 = $343 | $346;
    $348 = $344 >>> $346;
    $349 = $348 >>> 1;
    $350 = $349 & 2;
    $351 = $347 | $350;
    $352 = $348 >>> $350;
    $353 = $352 >>> 1;
    $354 = $353 & 1;
    $355 = $351 | $354;
    $356 = $352 >>> $354;
    $357 = (($355) + ($356))|0;
    $358 = (((18176) + ($357<<2)|0) + 304|0);
    $359 = HEAP32[$358>>2]|0;
    $t$2$ph$i = $359;
   } else {
    $t$2$ph$i = $t$1$i;
   }
   $360 = ($t$2$ph$i|0)==(0|0);
   if ($360) {
    $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$2$i;
   } else {
    $rsize$329$i = $rsize$2$i;$t$228$i = $t$2$ph$i;$v$330$i = $v$2$i;
    while(1) {
     $361 = (($t$228$i) + 4|0);
     $362 = HEAP32[$361>>2]|0;
     $363 = $362 & -8;
     $364 = (($363) - ($276))|0;
     $365 = ($364>>>0)<($rsize$329$i>>>0);
     $$rsize$3$i = $365 ? $364 : $rsize$329$i;
     $t$2$v$3$i = $365 ? $t$228$i : $v$330$i;
     $366 = (($t$228$i) + 16|0);
     $367 = HEAP32[$366>>2]|0;
     $368 = ($367|0)==(0|0);
     if (!($368)) {
      $v$330$i$phi = $t$2$v$3$i;$t$228$i$phi = $367;$rsize$329$i$phi = $$rsize$3$i;$v$330$i = $v$330$i$phi;$t$228$i = $t$228$i$phi;$rsize$329$i = $rsize$329$i$phi;
      continue;
     }
     $369 = (($t$228$i) + 20|0);
     $370 = HEAP32[$369>>2]|0;
     $371 = ($370|0)==(0|0);
     if ($371) {
      $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
      break;
     } else {
      $v$330$i$phi = $t$2$v$3$i;$rsize$329$i$phi = $$rsize$3$i;$t$228$i = $370;$v$330$i = $v$330$i$phi;$rsize$329$i = $rsize$329$i$phi;
     }
    }
   }
   $372 = ($v$3$lcssa$i|0)==(0|0);
   if ($372) {
    $nb$0 = $276;
    break;
   }
   $373 = HEAP32[(((18176) + 8|0))>>2]|0;
   $374 = (($373) - ($276))|0;
   $375 = ($rsize$3$lcssa$i>>>0)<($374>>>0);
   if (!($375)) {
    $nb$0 = $276;
    break;
   }
   $376 = $v$3$lcssa$i;
   $377 = HEAP32[(((18176) + 16|0))>>2]|0;
   $378 = ($376>>>0)<($377>>>0);
   if ($378) {
    _abort();
    // unreachable;
   }
   $379 = (($376) + ($276)|0);
   $380 = $379;
   $381 = ($376>>>0)<($379>>>0);
   if (!($381)) {
    _abort();
    // unreachable;
   }
   $382 = (($v$3$lcssa$i) + 24|0);
   $383 = HEAP32[$382>>2]|0;
   $384 = (($v$3$lcssa$i) + 12|0);
   $385 = HEAP32[$384>>2]|0;
   $386 = ($385|0)==($v$3$lcssa$i|0);
   do {
    if ($386) {
     $397 = (($v$3$lcssa$i) + 20|0);
     $398 = HEAP32[$397>>2]|0;
     $399 = ($398|0)==(0|0);
     if ($399) {
      $400 = (($v$3$lcssa$i) + 16|0);
      $401 = HEAP32[$400>>2]|0;
      $402 = ($401|0)==(0|0);
      if ($402) {
       $R$1$i20 = 0;
       break;
      } else {
       $R$0$i18 = $401;$RP$0$i17 = $400;
      }
     } else {
      $R$0$i18 = $398;$RP$0$i17 = $397;
     }
     while(1) {
      $403 = (($R$0$i18) + 20|0);
      $404 = HEAP32[$403>>2]|0;
      $405 = ($404|0)==(0|0);
      if (!($405)) {
       $RP$0$i17$phi = $403;$R$0$i18$phi = $404;$RP$0$i17 = $RP$0$i17$phi;$R$0$i18 = $R$0$i18$phi;
       continue;
      }
      $406 = (($R$0$i18) + 16|0);
      $407 = HEAP32[$406>>2]|0;
      $408 = ($407|0)==(0|0);
      if ($408) {
       break;
      } else {
       $R$0$i18 = $407;$RP$0$i17 = $406;
      }
     }
     $409 = $RP$0$i17;
     $410 = ($409>>>0)<($377>>>0);
     if ($410) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0$i17>>2] = 0;
      $R$1$i20 = $R$0$i18;
      break;
     }
    } else {
     $387 = (($v$3$lcssa$i) + 8|0);
     $388 = HEAP32[$387>>2]|0;
     $389 = $388;
     $390 = ($389>>>0)<($377>>>0);
     if ($390) {
      _abort();
      // unreachable;
     }
     $391 = (($388) + 12|0);
     $392 = HEAP32[$391>>2]|0;
     $393 = ($392|0)==($v$3$lcssa$i|0);
     if (!($393)) {
      _abort();
      // unreachable;
     }
     $394 = (($385) + 8|0);
     $395 = HEAP32[$394>>2]|0;
     $396 = ($395|0)==($v$3$lcssa$i|0);
     if ($396) {
      HEAP32[$391>>2] = $385;
      HEAP32[$394>>2] = $388;
      $R$1$i20 = $385;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $411 = ($383|0)==(0|0);
   L176: do {
    if (!($411)) {
     $412 = (($v$3$lcssa$i) + 28|0);
     $413 = HEAP32[$412>>2]|0;
     $414 = (((18176) + ($413<<2)|0) + 304|0);
     $415 = HEAP32[$414>>2]|0;
     $416 = ($v$3$lcssa$i|0)==($415|0);
     do {
      if ($416) {
       HEAP32[$414>>2] = $R$1$i20;
       $cond$i21 = ($R$1$i20|0)==(0|0);
       if (!($cond$i21)) {
        break;
       }
       $417 = 1 << $413;
       $418 = $417 ^ -1;
       $419 = HEAP32[(((18176) + 4|0))>>2]|0;
       $420 = $419 & $418;
       HEAP32[(((18176) + 4|0))>>2] = $420;
       break L176;
      } else {
       $421 = $383;
       $422 = HEAP32[(((18176) + 16|0))>>2]|0;
       $423 = ($421>>>0)<($422>>>0);
       if ($423) {
        _abort();
        // unreachable;
       }
       $424 = (($383) + 16|0);
       $425 = HEAP32[$424>>2]|0;
       $426 = ($425|0)==($v$3$lcssa$i|0);
       if ($426) {
        HEAP32[$424>>2] = $R$1$i20;
       } else {
        $427 = (($383) + 20|0);
        HEAP32[$427>>2] = $R$1$i20;
       }
       $428 = ($R$1$i20|0)==(0|0);
       if ($428) {
        break L176;
       }
      }
     } while(0);
     $429 = $R$1$i20;
     $430 = HEAP32[(((18176) + 16|0))>>2]|0;
     $431 = ($429>>>0)<($430>>>0);
     if ($431) {
      _abort();
      // unreachable;
     }
     $432 = (($R$1$i20) + 24|0);
     HEAP32[$432>>2] = $383;
     $433 = (($v$3$lcssa$i) + 16|0);
     $434 = HEAP32[$433>>2]|0;
     $435 = ($434|0)==(0|0);
     do {
      if (!($435)) {
       $436 = $434;
       $437 = HEAP32[(((18176) + 16|0))>>2]|0;
       $438 = ($436>>>0)<($437>>>0);
       if ($438) {
        _abort();
        // unreachable;
       } else {
        $439 = (($R$1$i20) + 16|0);
        HEAP32[$439>>2] = $434;
        $440 = (($434) + 24|0);
        HEAP32[$440>>2] = $R$1$i20;
        break;
       }
      }
     } while(0);
     $441 = (($v$3$lcssa$i) + 20|0);
     $442 = HEAP32[$441>>2]|0;
     $443 = ($442|0)==(0|0);
     if ($443) {
      break;
     }
     $444 = $442;
     $445 = HEAP32[(((18176) + 16|0))>>2]|0;
     $446 = ($444>>>0)<($445>>>0);
     if ($446) {
      _abort();
      // unreachable;
     } else {
      $447 = (($R$1$i20) + 20|0);
      HEAP32[$447>>2] = $442;
      $448 = (($442) + 24|0);
      HEAP32[$448>>2] = $R$1$i20;
      break;
     }
    }
   } while(0);
   $449 = ($rsize$3$lcssa$i>>>0)<(16);
   L204: do {
    if ($449) {
     $450 = (($rsize$3$lcssa$i) + ($276))|0;
     $451 = $450 | 3;
     $452 = (($v$3$lcssa$i) + 4|0);
     HEAP32[$452>>2] = $451;
     $$sum18$i = (($450) + 4)|0;
     $453 = (($376) + ($$sum18$i)|0);
     $454 = $453;
     $455 = HEAP32[$454>>2]|0;
     $456 = $455 | 1;
     HEAP32[$454>>2] = $456;
    } else {
     $457 = $276 | 3;
     $458 = (($v$3$lcssa$i) + 4|0);
     HEAP32[$458>>2] = $457;
     $459 = $rsize$3$lcssa$i | 1;
     $$sum$i2334 = $276 | 4;
     $460 = (($376) + ($$sum$i2334)|0);
     $461 = $460;
     HEAP32[$461>>2] = $459;
     $$sum1$i24 = (($rsize$3$lcssa$i) + ($276))|0;
     $462 = (($376) + ($$sum1$i24)|0);
     $463 = $462;
     HEAP32[$463>>2] = $rsize$3$lcssa$i;
     $464 = $rsize$3$lcssa$i >>> 3;
     $465 = ($rsize$3$lcssa$i>>>0)<(256);
     if ($465) {
      $466 = $464 << 1;
      $467 = (((18176) + ($466<<2)|0) + 40|0);
      $468 = $467;
      $469 = HEAP32[((18176))>>2]|0;
      $470 = 1 << $464;
      $471 = $469 & $470;
      $472 = ($471|0)==(0);
      do {
       if ($472) {
        $473 = $469 | $470;
        HEAP32[((18176))>>2] = $473;
        $$sum14$pre$i = (($466) + 2)|0;
        $$pre$i25 = (((18176) + ($$sum14$pre$i<<2)|0) + 40|0);
        $$pre$phi$i26Z2D = $$pre$i25;$F5$0$i = $468;
       } else {
        $$sum17$i = (($466) + 2)|0;
        $474 = (((18176) + ($$sum17$i<<2)|0) + 40|0);
        $475 = HEAP32[$474>>2]|0;
        $476 = $475;
        $477 = HEAP32[(((18176) + 16|0))>>2]|0;
        $478 = ($476>>>0)<($477>>>0);
        if (!($478)) {
         $$pre$phi$i26Z2D = $474;$F5$0$i = $475;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i26Z2D>>2] = $380;
      $479 = (($F5$0$i) + 12|0);
      HEAP32[$479>>2] = $380;
      $$sum15$i = (($276) + 8)|0;
      $480 = (($376) + ($$sum15$i)|0);
      $481 = $480;
      HEAP32[$481>>2] = $F5$0$i;
      $$sum16$i = (($276) + 12)|0;
      $482 = (($376) + ($$sum16$i)|0);
      $483 = $482;
      HEAP32[$483>>2] = $468;
      break;
     }
     $484 = $379;
     $485 = $rsize$3$lcssa$i >>> 8;
     $486 = ($485|0)==(0);
     do {
      if ($486) {
       $I7$0$i = 0;
      } else {
       $487 = ($rsize$3$lcssa$i>>>0)>(16777215);
       if ($487) {
        $I7$0$i = 31;
        break;
       }
       $488 = (($485) + 1048320)|0;
       $489 = $488 >>> 16;
       $490 = $489 & 8;
       $491 = $485 << $490;
       $492 = (($491) + 520192)|0;
       $493 = $492 >>> 16;
       $494 = $493 & 4;
       $495 = $494 | $490;
       $496 = $491 << $494;
       $497 = (($496) + 245760)|0;
       $498 = $497 >>> 16;
       $499 = $498 & 2;
       $500 = $495 | $499;
       $501 = (14 - ($500))|0;
       $502 = $496 << $499;
       $503 = $502 >>> 15;
       $504 = (($501) + ($503))|0;
       $505 = $504 << 1;
       $506 = (($504) + 7)|0;
       $507 = $rsize$3$lcssa$i >>> $506;
       $508 = $507 & 1;
       $509 = $508 | $505;
       $I7$0$i = $509;
      }
     } while(0);
     $510 = (((18176) + ($I7$0$i<<2)|0) + 304|0);
     $$sum2$i = (($276) + 28)|0;
     $511 = (($376) + ($$sum2$i)|0);
     $512 = $511;
     HEAP32[$512>>2] = $I7$0$i;
     $$sum3$i27 = (($276) + 16)|0;
     $513 = (($376) + ($$sum3$i27)|0);
     $$sum4$i28 = (($276) + 20)|0;
     $514 = (($376) + ($$sum4$i28)|0);
     $515 = $514;
     HEAP32[$515>>2] = 0;
     $516 = $513;
     HEAP32[$516>>2] = 0;
     $517 = HEAP32[(((18176) + 4|0))>>2]|0;
     $518 = 1 << $I7$0$i;
     $519 = $517 & $518;
     $520 = ($519|0)==(0);
     if ($520) {
      $521 = $517 | $518;
      HEAP32[(((18176) + 4|0))>>2] = $521;
      HEAP32[$510>>2] = $484;
      $522 = $510;
      $$sum5$i = (($276) + 24)|0;
      $523 = (($376) + ($$sum5$i)|0);
      $524 = $523;
      HEAP32[$524>>2] = $522;
      $$sum6$i = (($276) + 12)|0;
      $525 = (($376) + ($$sum6$i)|0);
      $526 = $525;
      HEAP32[$526>>2] = $484;
      $$sum7$i = (($276) + 8)|0;
      $527 = (($376) + ($$sum7$i)|0);
      $528 = $527;
      HEAP32[$528>>2] = $484;
      break;
     }
     $529 = HEAP32[$510>>2]|0;
     $530 = ($I7$0$i|0)==(31);
     if ($530) {
      $533 = 0;
     } else {
      $531 = $I7$0$i >>> 1;
      $532 = (25 - ($531))|0;
      $533 = $532;
     }
     $534 = (($529) + 4|0);
     $535 = HEAP32[$534>>2]|0;
     $536 = $535 & -8;
     $537 = ($536|0)==($rsize$3$lcssa$i|0);
     L225: do {
      if ($537) {
       $T$0$lcssa$i = $529;
      } else {
       $538 = $rsize$3$lcssa$i << $533;
       $K12$025$i = $538;$T$024$i = $529;
       while(1) {
        $544 = $K12$025$i >>> 31;
        $545 = ((($T$024$i) + ($544<<2)|0) + 16|0);
        $546 = HEAP32[$545>>2]|0;
        $547 = ($546|0)==(0|0);
        if ($547) {
         break;
        }
        $539 = $K12$025$i << 1;
        $540 = (($546) + 4|0);
        $541 = HEAP32[$540>>2]|0;
        $542 = $541 & -8;
        $543 = ($542|0)==($rsize$3$lcssa$i|0);
        if ($543) {
         $T$0$lcssa$i = $546;
         break L225;
        } else {
         $T$024$i$phi = $546;$K12$025$i = $539;$T$024$i = $T$024$i$phi;
        }
       }
       $548 = $545;
       $549 = HEAP32[(((18176) + 16|0))>>2]|0;
       $550 = ($548>>>0)<($549>>>0);
       if ($550) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$545>>2] = $484;
        $$sum11$i = (($276) + 24)|0;
        $551 = (($376) + ($$sum11$i)|0);
        $552 = $551;
        HEAP32[$552>>2] = $T$024$i;
        $$sum12$i = (($276) + 12)|0;
        $553 = (($376) + ($$sum12$i)|0);
        $554 = $553;
        HEAP32[$554>>2] = $484;
        $$sum13$i = (($276) + 8)|0;
        $555 = (($376) + ($$sum13$i)|0);
        $556 = $555;
        HEAP32[$556>>2] = $484;
        break L204;
       }
      }
     } while(0);
     $557 = (($T$0$lcssa$i) + 8|0);
     $558 = HEAP32[$557>>2]|0;
     $559 = $T$0$lcssa$i;
     $560 = HEAP32[(((18176) + 16|0))>>2]|0;
     $561 = ($559>>>0)<($560>>>0);
     if ($561) {
      _abort();
      // unreachable;
     }
     $562 = $558;
     $563 = ($562>>>0)<($560>>>0);
     if ($563) {
      _abort();
      // unreachable;
     } else {
      $564 = (($558) + 12|0);
      HEAP32[$564>>2] = $484;
      HEAP32[$557>>2] = $484;
      $$sum8$i = (($276) + 8)|0;
      $565 = (($376) + ($$sum8$i)|0);
      $566 = $565;
      HEAP32[$566>>2] = $558;
      $$sum9$i = (($276) + 12)|0;
      $567 = (($376) + ($$sum9$i)|0);
      $568 = $567;
      HEAP32[$568>>2] = $T$0$lcssa$i;
      $$sum10$i = (($276) + 24)|0;
      $569 = (($376) + ($$sum10$i)|0);
      $570 = $569;
      HEAP32[$570>>2] = 0;
      break;
     }
    }
   } while(0);
   $571 = (($v$3$lcssa$i) + 8|0);
   $572 = $571;
   $mem$0 = $572;
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $573 = HEAP32[(((18176) + 8|0))>>2]|0;
 $574 = ($nb$0>>>0)>($573>>>0);
 if (!($574)) {
  $575 = (($573) - ($nb$0))|0;
  $576 = HEAP32[(((18176) + 20|0))>>2]|0;
  $577 = ($575>>>0)>(15);
  if ($577) {
   $578 = $576;
   $579 = (($578) + ($nb$0)|0);
   $580 = $579;
   HEAP32[(((18176) + 20|0))>>2] = $580;
   HEAP32[(((18176) + 8|0))>>2] = $575;
   $581 = $575 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $582 = (($578) + ($$sum2)|0);
   $583 = $582;
   HEAP32[$583>>2] = $581;
   $584 = (($578) + ($573)|0);
   $585 = $584;
   HEAP32[$585>>2] = $575;
   $586 = $nb$0 | 3;
   $587 = (($576) + 4|0);
   HEAP32[$587>>2] = $586;
  } else {
   HEAP32[(((18176) + 8|0))>>2] = 0;
   HEAP32[(((18176) + 20|0))>>2] = 0;
   $588 = $573 | 3;
   $589 = (($576) + 4|0);
   HEAP32[$589>>2] = $588;
   $590 = $576;
   $$sum1 = (($573) + 4)|0;
   $591 = (($590) + ($$sum1)|0);
   $592 = $591;
   $593 = HEAP32[$592>>2]|0;
   $594 = $593 | 1;
   HEAP32[$592>>2] = $594;
  }
  $595 = (($576) + 8|0);
  $596 = $595;
  $mem$0 = $596;
  STACKTOP = sp;return ($mem$0|0);
 }
 $597 = HEAP32[(((18176) + 12|0))>>2]|0;
 $598 = ($nb$0>>>0)<($597>>>0);
 if ($598) {
  $599 = (($597) - ($nb$0))|0;
  HEAP32[(((18176) + 12|0))>>2] = $599;
  $600 = HEAP32[(((18176) + 24|0))>>2]|0;
  $601 = $600;
  $602 = (($601) + ($nb$0)|0);
  $603 = $602;
  HEAP32[(((18176) + 24|0))>>2] = $603;
  $604 = $599 | 1;
  $$sum = (($nb$0) + 4)|0;
  $605 = (($601) + ($$sum)|0);
  $606 = $605;
  HEAP32[$606>>2] = $604;
  $607 = $nb$0 | 3;
  $608 = (($600) + 4|0);
  HEAP32[$608>>2] = $607;
  $609 = (($600) + 8|0);
  $610 = $609;
  $mem$0 = $610;
  STACKTOP = sp;return ($mem$0|0);
 }
 $611 = HEAP32[((18648))>>2]|0;
 $612 = ($611|0)==(0);
 do {
  if ($612) {
   $613 = (_sysconf(30)|0);
   $614 = (($613) + -1)|0;
   $615 = $614 & $613;
   $616 = ($615|0)==(0);
   if ($616) {
    HEAP32[(((18648) + 8|0))>>2] = $613;
    HEAP32[(((18648) + 4|0))>>2] = $613;
    HEAP32[(((18648) + 12|0))>>2] = -1;
    HEAP32[(((18648) + 16|0))>>2] = -1;
    HEAP32[(((18648) + 20|0))>>2] = 0;
    HEAP32[(((18176) + 444|0))>>2] = 0;
    $617 = (_time((0|0))|0);
    $618 = $617 & -16;
    $619 = $618 ^ 1431655768;
    HEAP32[((18648))>>2] = $619;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $620 = (($nb$0) + 48)|0;
 $621 = HEAP32[(((18648) + 8|0))>>2]|0;
 $622 = (($nb$0) + 47)|0;
 $623 = (($621) + ($622))|0;
 $624 = (0 - ($621))|0;
 $625 = $623 & $624;
 $626 = ($625>>>0)>($nb$0>>>0);
 if (!($626)) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $627 = HEAP32[(((18176) + 440|0))>>2]|0;
 $628 = ($627|0)==(0);
 do {
  if (!($628)) {
   $629 = HEAP32[(((18176) + 432|0))>>2]|0;
   $630 = (($629) + ($625))|0;
   $631 = ($630>>>0)<=($629>>>0);
   $632 = ($630>>>0)>($627>>>0);
   $or$cond1$i = $631 | $632;
   if ($or$cond1$i) {
    $mem$0 = 0;
   } else {
    break;
   }
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $633 = HEAP32[(((18176) + 444|0))>>2]|0;
 $634 = $633 & 4;
 $635 = ($634|0)==(0);
 L269: do {
  if ($635) {
   $636 = HEAP32[(((18176) + 24|0))>>2]|0;
   $637 = ($636|0)==(0|0);
   L271: do {
    if ($637) {
     label = 182;
    } else {
     $638 = $636;
     $sp$0$i$i = (((18176) + 448|0));
     while(1) {
      $639 = ($sp$0$i$i);
      $640 = HEAP32[$639>>2]|0;
      $641 = ($640>>>0)>($638>>>0);
      if (!($641)) {
       $642 = (($sp$0$i$i) + 4|0);
       $643 = HEAP32[$642>>2]|0;
       $644 = (($640) + ($643)|0);
       $645 = ($644>>>0)>($638>>>0);
       if ($645) {
        break;
       }
      }
      $646 = (($sp$0$i$i) + 8|0);
      $647 = HEAP32[$646>>2]|0;
      $648 = ($647|0)==(0|0);
      if ($648) {
       label = 182;
       break L271;
      } else {
       $sp$0$i$i = $647;
      }
     }
     $649 = ($sp$0$i$i|0)==(0|0);
     if ($649) {
      label = 182;
      break;
     }
     $672 = HEAP32[(((18176) + 12|0))>>2]|0;
     $673 = (($623) - ($672))|0;
     $674 = $673 & $624;
     $675 = ($674>>>0)<(2147483647);
     if (!($675)) {
      $tsize$0323841$i = 0;
      break;
     }
     $676 = (_sbrk(($674|0))|0);
     $677 = HEAP32[$639>>2]|0;
     $678 = HEAP32[$642>>2]|0;
     $679 = (($677) + ($678)|0);
     $680 = ($676|0)==($679|0);
     $$3$i = $680 ? $674 : 0;
     $$4$i = $680 ? $676 : (-1);
     $br$0$i = $676;$ssize$1$i = $674;$tbase$0$i = $$4$i;$tsize$0$i = $$3$i;
     label = 191;
    }
   } while(0);
   do {
    if ((label|0) == 182) {
     $650 = (_sbrk(0)|0);
     $651 = ($650|0)==((-1)|0);
     if ($651) {
      $tsize$0323841$i = 0;
      break;
     }
     $652 = $650;
     $653 = HEAP32[(((18648) + 4|0))>>2]|0;
     $654 = (($653) + -1)|0;
     $655 = $654 & $652;
     $656 = ($655|0)==(0);
     if ($656) {
      $ssize$0$i = $625;
     } else {
      $657 = (($654) + ($652))|0;
      $658 = (0 - ($653))|0;
      $659 = $657 & $658;
      $660 = (($625) - ($652))|0;
      $661 = (($660) + ($659))|0;
      $ssize$0$i = $661;
     }
     $662 = HEAP32[(((18176) + 432|0))>>2]|0;
     $663 = (($662) + ($ssize$0$i))|0;
     $664 = ($ssize$0$i>>>0)>($nb$0>>>0);
     $665 = ($ssize$0$i>>>0)<(2147483647);
     $or$cond$i29 = $664 & $665;
     if (!($or$cond$i29)) {
      $tsize$0323841$i = 0;
      break;
     }
     $666 = HEAP32[(((18176) + 440|0))>>2]|0;
     $667 = ($666|0)==(0);
     if (!($667)) {
      $668 = ($663>>>0)<=($662>>>0);
      $669 = ($663>>>0)>($666>>>0);
      $or$cond2$i = $668 | $669;
      if ($or$cond2$i) {
       $tsize$0323841$i = 0;
       break;
      }
     }
     $670 = (_sbrk(($ssize$0$i|0))|0);
     $671 = ($670|0)==($650|0);
     $ssize$0$$i = $671 ? $ssize$0$i : 0;
     $$$i = $671 ? $650 : (-1);
     $br$0$i = $670;$ssize$1$i = $ssize$0$i;$tbase$0$i = $$$i;$tsize$0$i = $ssize$0$$i;
     label = 191;
    }
   } while(0);
   L291: do {
    if ((label|0) == 191) {
     $681 = (0 - ($ssize$1$i))|0;
     $682 = ($tbase$0$i|0)==((-1)|0);
     if (!($682)) {
      $tbase$247$i = $tbase$0$i;$tsize$246$i = $tsize$0$i;
      label = 202;
      break L269;
     }
     $683 = ($br$0$i|0)!=((-1)|0);
     $684 = ($ssize$1$i>>>0)<(2147483647);
     $or$cond5$i = $683 & $684;
     $685 = ($ssize$1$i>>>0)<($620>>>0);
     $or$cond6$i = $or$cond5$i & $685;
     do {
      if ($or$cond6$i) {
       $686 = HEAP32[(((18648) + 8|0))>>2]|0;
       $687 = (($622) - ($ssize$1$i))|0;
       $688 = (($687) + ($686))|0;
       $689 = (0 - ($686))|0;
       $690 = $688 & $689;
       $691 = ($690>>>0)<(2147483647);
       if (!($691)) {
        $ssize$2$i = $ssize$1$i;
        break;
       }
       $692 = (_sbrk(($690|0))|0);
       $693 = ($692|0)==((-1)|0);
       if ($693) {
        (_sbrk(($681|0))|0);
        $tsize$0323841$i = $tsize$0$i;
        break L291;
       } else {
        $694 = (($690) + ($ssize$1$i))|0;
        $ssize$2$i = $694;
        break;
       }
      } else {
       $ssize$2$i = $ssize$1$i;
      }
     } while(0);
     $695 = ($br$0$i|0)==((-1)|0);
     if ($695) {
      $tsize$0323841$i = $tsize$0$i;
     } else {
      $tbase$247$i = $br$0$i;$tsize$246$i = $ssize$2$i;
      label = 202;
      break L269;
     }
    }
   } while(0);
   $696 = HEAP32[(((18176) + 444|0))>>2]|0;
   $697 = $696 | 4;
   HEAP32[(((18176) + 444|0))>>2] = $697;
   $tsize$1$i = $tsize$0323841$i;
   label = 199;
  } else {
   $tsize$1$i = 0;
   label = 199;
  }
 } while(0);
 do {
  if ((label|0) == 199) {
   $698 = ($625>>>0)<(2147483647);
   if (!($698)) {
    break;
   }
   $699 = (_sbrk(($625|0))|0);
   $700 = (_sbrk(0)|0);
   $notlhs$i = ($699|0)!=((-1)|0);
   $notrhs$i = ($700|0)!=((-1)|0);
   $or$cond8$not$i = $notrhs$i & $notlhs$i;
   $701 = ($699>>>0)<($700>>>0);
   $or$cond9$i = $or$cond8$not$i & $701;
   if (!($or$cond9$i)) {
    break;
   }
   $702 = $700;
   $703 = $699;
   $704 = (($702) - ($703))|0;
   $705 = (($nb$0) + 40)|0;
   $706 = ($704>>>0)>($705>>>0);
   $$tsize$1$i = $706 ? $704 : $tsize$1$i;
   if ($706) {
    $tbase$247$i = $699;$tsize$246$i = $$tsize$1$i;
    label = 202;
   }
  }
 } while(0);
 do {
  if ((label|0) == 202) {
   $707 = HEAP32[(((18176) + 432|0))>>2]|0;
   $708 = (($707) + ($tsize$246$i))|0;
   HEAP32[(((18176) + 432|0))>>2] = $708;
   $709 = HEAP32[(((18176) + 436|0))>>2]|0;
   $710 = ($708>>>0)>($709>>>0);
   if ($710) {
    HEAP32[(((18176) + 436|0))>>2] = $708;
   }
   $711 = HEAP32[(((18176) + 24|0))>>2]|0;
   $712 = ($711|0)==(0|0);
   L311: do {
    if ($712) {
     $713 = HEAP32[(((18176) + 16|0))>>2]|0;
     $714 = ($713|0)==(0|0);
     $715 = ($tbase$247$i>>>0)<($713>>>0);
     $or$cond10$i = $714 | $715;
     if ($or$cond10$i) {
      HEAP32[(((18176) + 16|0))>>2] = $tbase$247$i;
     }
     HEAP32[(((18176) + 448|0))>>2] = $tbase$247$i;
     HEAP32[(((18176) + 452|0))>>2] = $tsize$246$i;
     HEAP32[(((18176) + 460|0))>>2] = 0;
     $716 = HEAP32[((18648))>>2]|0;
     HEAP32[(((18176) + 36|0))>>2] = $716;
     HEAP32[(((18176) + 32|0))>>2] = -1;
     $i$02$i$i = 0;
     while(1) {
      $717 = $i$02$i$i << 1;
      $718 = (((18176) + ($717<<2)|0) + 40|0);
      $719 = $718;
      $$sum$i$i = (($717) + 3)|0;
      $720 = (((18176) + ($$sum$i$i<<2)|0) + 40|0);
      HEAP32[$720>>2] = $719;
      $$sum1$i$i = (($717) + 2)|0;
      $721 = (((18176) + ($$sum1$i$i<<2)|0) + 40|0);
      HEAP32[$721>>2] = $719;
      $722 = (($i$02$i$i) + 1)|0;
      $exitcond$i$i = ($722|0)==(32);
      if ($exitcond$i$i) {
       break;
      } else {
       $i$02$i$i$phi = $722;$i$02$i$i = $i$02$i$i$phi;
      }
     }
     $723 = (($tsize$246$i) + -40)|0;
     $724 = (($tbase$247$i) + 8|0);
     $725 = $724;
     $726 = $725 & 7;
     $727 = ($726|0)==(0);
     if ($727) {
      $730 = 0;
     } else {
      $728 = (0 - ($725))|0;
      $729 = $728 & 7;
      $730 = $729;
     }
     $731 = (($tbase$247$i) + ($730)|0);
     $732 = $731;
     $733 = (($723) - ($730))|0;
     HEAP32[(((18176) + 24|0))>>2] = $732;
     HEAP32[(((18176) + 12|0))>>2] = $733;
     $734 = $733 | 1;
     $$sum$i14$i = (($730) + 4)|0;
     $735 = (($tbase$247$i) + ($$sum$i14$i)|0);
     $736 = $735;
     HEAP32[$736>>2] = $734;
     $$sum2$i$i = (($tsize$246$i) + -36)|0;
     $737 = (($tbase$247$i) + ($$sum2$i$i)|0);
     $738 = $737;
     HEAP32[$738>>2] = 40;
     $739 = HEAP32[(((18648) + 16|0))>>2]|0;
     HEAP32[(((18176) + 28|0))>>2] = $739;
    } else {
     $sp$075$i = (((18176) + 448|0));
     while(1) {
      $740 = ($sp$075$i);
      $741 = HEAP32[$740>>2]|0;
      $742 = (($sp$075$i) + 4|0);
      $743 = HEAP32[$742>>2]|0;
      $744 = (($741) + ($743)|0);
      $745 = ($tbase$247$i|0)==($744|0);
      if ($745) {
       label = 214;
       break;
      }
      $746 = (($sp$075$i) + 8|0);
      $747 = HEAP32[$746>>2]|0;
      $748 = ($747|0)==(0|0);
      if ($748) {
       break;
      } else {
       $sp$075$i = $747;
      }
     }
     do {
      if ((label|0) == 214) {
       $749 = (($sp$075$i) + 12|0);
       $750 = HEAP32[$749>>2]|0;
       $751 = $750 & 8;
       $752 = ($751|0)==(0);
       if (!($752)) {
        break;
       }
       $753 = $711;
       $754 = ($753>>>0)>=($741>>>0);
       $755 = ($753>>>0)<($tbase$247$i>>>0);
       $or$cond49$i = $754 & $755;
       if (!($or$cond49$i)) {
        break;
       }
       $756 = (($743) + ($tsize$246$i))|0;
       HEAP32[$742>>2] = $756;
       $757 = HEAP32[(((18176) + 12|0))>>2]|0;
       $758 = (($757) + ($tsize$246$i))|0;
       $759 = (($711) + 8|0);
       $760 = $759;
       $761 = $760 & 7;
       $762 = ($761|0)==(0);
       if ($762) {
        $765 = 0;
       } else {
        $763 = (0 - ($760))|0;
        $764 = $763 & 7;
        $765 = $764;
       }
       $766 = (($753) + ($765)|0);
       $767 = $766;
       $768 = (($758) - ($765))|0;
       HEAP32[(((18176) + 24|0))>>2] = $767;
       HEAP32[(((18176) + 12|0))>>2] = $768;
       $769 = $768 | 1;
       $$sum$i18$i = (($765) + 4)|0;
       $770 = (($753) + ($$sum$i18$i)|0);
       $771 = $770;
       HEAP32[$771>>2] = $769;
       $$sum2$i19$i = (($758) + 4)|0;
       $772 = (($753) + ($$sum2$i19$i)|0);
       $773 = $772;
       HEAP32[$773>>2] = 40;
       $774 = HEAP32[(((18648) + 16|0))>>2]|0;
       HEAP32[(((18176) + 28|0))>>2] = $774;
       break L311;
      }
     } while(0);
     $775 = HEAP32[(((18176) + 16|0))>>2]|0;
     $776 = ($tbase$247$i>>>0)<($775>>>0);
     if ($776) {
      HEAP32[(((18176) + 16|0))>>2] = $tbase$247$i;
     }
     $777 = (($tbase$247$i) + ($tsize$246$i)|0);
     $sp$168$i = (((18176) + 448|0));
     while(1) {
      $778 = ($sp$168$i);
      $779 = HEAP32[$778>>2]|0;
      $780 = ($779|0)==($777|0);
      if ($780) {
       label = 224;
       break;
      }
      $781 = (($sp$168$i) + 8|0);
      $782 = HEAP32[$781>>2]|0;
      $783 = ($782|0)==(0|0);
      if ($783) {
       break;
      } else {
       $sp$168$i = $782;
      }
     }
     do {
      if ((label|0) == 224) {
       $784 = (($sp$168$i) + 12|0);
       $785 = HEAP32[$784>>2]|0;
       $786 = $785 & 8;
       $787 = ($786|0)==(0);
       if (!($787)) {
        break;
       }
       HEAP32[$778>>2] = $tbase$247$i;
       $788 = (($sp$168$i) + 4|0);
       $789 = HEAP32[$788>>2]|0;
       $790 = (($789) + ($tsize$246$i))|0;
       HEAP32[$788>>2] = $790;
       $791 = (($tbase$247$i) + 8|0);
       $792 = $791;
       $793 = $792 & 7;
       $794 = ($793|0)==(0);
       if ($794) {
        $797 = 0;
       } else {
        $795 = (0 - ($792))|0;
        $796 = $795 & 7;
        $797 = $796;
       }
       $798 = (($tbase$247$i) + ($797)|0);
       $$sum107$i = (($tsize$246$i) + 8)|0;
       $799 = (($tbase$247$i) + ($$sum107$i)|0);
       $800 = $799;
       $801 = $800 & 7;
       $802 = ($801|0)==(0);
       if ($802) {
        $805 = 0;
       } else {
        $803 = (0 - ($800))|0;
        $804 = $803 & 7;
        $805 = $804;
       }
       $$sum108$i = (($805) + ($tsize$246$i))|0;
       $806 = (($tbase$247$i) + ($$sum108$i)|0);
       $807 = $806;
       $808 = $806;
       $809 = $798;
       $810 = (($808) - ($809))|0;
       $$sum$i21$i = (($797) + ($nb$0))|0;
       $811 = (($tbase$247$i) + ($$sum$i21$i)|0);
       $812 = $811;
       $813 = (($810) - ($nb$0))|0;
       $814 = $nb$0 | 3;
       $$sum1$i22$i = (($797) + 4)|0;
       $815 = (($tbase$247$i) + ($$sum1$i22$i)|0);
       $816 = $815;
       HEAP32[$816>>2] = $814;
       $817 = HEAP32[(((18176) + 24|0))>>2]|0;
       $818 = ($807|0)==($817|0);
       L348: do {
        if ($818) {
         $819 = HEAP32[(((18176) + 12|0))>>2]|0;
         $820 = (($819) + ($813))|0;
         HEAP32[(((18176) + 12|0))>>2] = $820;
         HEAP32[(((18176) + 24|0))>>2] = $812;
         $821 = $820 | 1;
         $$sum42$i$i = (($$sum$i21$i) + 4)|0;
         $822 = (($tbase$247$i) + ($$sum42$i$i)|0);
         $823 = $822;
         HEAP32[$823>>2] = $821;
        } else {
         $824 = HEAP32[(((18176) + 20|0))>>2]|0;
         $825 = ($807|0)==($824|0);
         if ($825) {
          $826 = HEAP32[(((18176) + 8|0))>>2]|0;
          $827 = (($826) + ($813))|0;
          HEAP32[(((18176) + 8|0))>>2] = $827;
          HEAP32[(((18176) + 20|0))>>2] = $812;
          $828 = $827 | 1;
          $$sum40$i$i = (($$sum$i21$i) + 4)|0;
          $829 = (($tbase$247$i) + ($$sum40$i$i)|0);
          $830 = $829;
          HEAP32[$830>>2] = $828;
          $$sum41$i$i = (($827) + ($$sum$i21$i))|0;
          $831 = (($tbase$247$i) + ($$sum41$i$i)|0);
          $832 = $831;
          HEAP32[$832>>2] = $827;
          break;
         }
         $$sum2$i23$i = (($tsize$246$i) + 4)|0;
         $$sum109$i = (($$sum2$i23$i) + ($805))|0;
         $833 = (($tbase$247$i) + ($$sum109$i)|0);
         $834 = $833;
         $835 = HEAP32[$834>>2]|0;
         $836 = $835 & 3;
         $837 = ($836|0)==(1);
         if ($837) {
          $838 = $835 & -8;
          $839 = $835 >>> 3;
          $840 = ($835>>>0)<(256);
          L356: do {
           if ($840) {
            $$sum3738$i$i = $805 | 8;
            $$sum119$i = (($$sum3738$i$i) + ($tsize$246$i))|0;
            $841 = (($tbase$247$i) + ($$sum119$i)|0);
            $842 = $841;
            $843 = HEAP32[$842>>2]|0;
            $$sum39$i$i = (($tsize$246$i) + 12)|0;
            $$sum120$i = (($$sum39$i$i) + ($805))|0;
            $844 = (($tbase$247$i) + ($$sum120$i)|0);
            $845 = $844;
            $846 = HEAP32[$845>>2]|0;
            $847 = $839 << 1;
            $848 = (((18176) + ($847<<2)|0) + 40|0);
            $849 = $848;
            $850 = ($843|0)==($849|0);
            do {
             if (!($850)) {
              $851 = $843;
              $852 = HEAP32[(((18176) + 16|0))>>2]|0;
              $853 = ($851>>>0)<($852>>>0);
              if ($853) {
               _abort();
               // unreachable;
              }
              $854 = (($843) + 12|0);
              $855 = HEAP32[$854>>2]|0;
              $856 = ($855|0)==($807|0);
              if ($856) {
               break;
              }
              _abort();
              // unreachable;
             }
            } while(0);
            $857 = ($846|0)==($843|0);
            if ($857) {
             $858 = 1 << $839;
             $859 = $858 ^ -1;
             $860 = HEAP32[((18176))>>2]|0;
             $861 = $860 & $859;
             HEAP32[((18176))>>2] = $861;
             break;
            }
            $862 = ($846|0)==($849|0);
            do {
             if ($862) {
              $$pre57$i$i = (($846) + 8|0);
              $$pre$phi58$i$iZ2D = $$pre57$i$i;
             } else {
              $863 = $846;
              $864 = HEAP32[(((18176) + 16|0))>>2]|0;
              $865 = ($863>>>0)<($864>>>0);
              if ($865) {
               _abort();
               // unreachable;
              }
              $866 = (($846) + 8|0);
              $867 = HEAP32[$866>>2]|0;
              $868 = ($867|0)==($807|0);
              if ($868) {
               $$pre$phi58$i$iZ2D = $866;
               break;
              }
              _abort();
              // unreachable;
             }
            } while(0);
            $869 = (($843) + 12|0);
            HEAP32[$869>>2] = $846;
            HEAP32[$$pre$phi58$i$iZ2D>>2] = $843;
           } else {
            $870 = $806;
            $$sum34$i$i = $805 | 24;
            $$sum110$i = (($$sum34$i$i) + ($tsize$246$i))|0;
            $871 = (($tbase$247$i) + ($$sum110$i)|0);
            $872 = $871;
            $873 = HEAP32[$872>>2]|0;
            $$sum5$i$i = (($tsize$246$i) + 12)|0;
            $$sum111$i = (($$sum5$i$i) + ($805))|0;
            $874 = (($tbase$247$i) + ($$sum111$i)|0);
            $875 = $874;
            $876 = HEAP32[$875>>2]|0;
            $877 = ($876|0)==($870|0);
            do {
             if ($877) {
              $$sum67$i$i = $805 | 16;
              $$sum117$i = (($$sum2$i23$i) + ($$sum67$i$i))|0;
              $890 = (($tbase$247$i) + ($$sum117$i)|0);
              $891 = $890;
              $892 = HEAP32[$891>>2]|0;
              $893 = ($892|0)==(0|0);
              if ($893) {
               $$sum118$i = (($$sum67$i$i) + ($tsize$246$i))|0;
               $894 = (($tbase$247$i) + ($$sum118$i)|0);
               $895 = $894;
               $896 = HEAP32[$895>>2]|0;
               $897 = ($896|0)==(0|0);
               if ($897) {
                $R$1$i$i = 0;
                break;
               } else {
                $R$0$i$i = $896;$RP$0$i$i = $895;
               }
              } else {
               $R$0$i$i = $892;$RP$0$i$i = $891;
              }
              while(1) {
               $898 = (($R$0$i$i) + 20|0);
               $899 = HEAP32[$898>>2]|0;
               $900 = ($899|0)==(0|0);
               if (!($900)) {
                $RP$0$i$i$phi = $898;$R$0$i$i$phi = $899;$RP$0$i$i = $RP$0$i$i$phi;$R$0$i$i = $R$0$i$i$phi;
                continue;
               }
               $901 = (($R$0$i$i) + 16|0);
               $902 = HEAP32[$901>>2]|0;
               $903 = ($902|0)==(0|0);
               if ($903) {
                break;
               } else {
                $R$0$i$i = $902;$RP$0$i$i = $901;
               }
              }
              $904 = $RP$0$i$i;
              $905 = HEAP32[(((18176) + 16|0))>>2]|0;
              $906 = ($904>>>0)<($905>>>0);
              if ($906) {
               _abort();
               // unreachable;
              } else {
               HEAP32[$RP$0$i$i>>2] = 0;
               $R$1$i$i = $R$0$i$i;
               break;
              }
             } else {
              $$sum3536$i$i = $805 | 8;
              $$sum112$i = (($$sum3536$i$i) + ($tsize$246$i))|0;
              $878 = (($tbase$247$i) + ($$sum112$i)|0);
              $879 = $878;
              $880 = HEAP32[$879>>2]|0;
              $881 = $880;
              $882 = HEAP32[(((18176) + 16|0))>>2]|0;
              $883 = ($881>>>0)<($882>>>0);
              if ($883) {
               _abort();
               // unreachable;
              }
              $884 = (($880) + 12|0);
              $885 = HEAP32[$884>>2]|0;
              $886 = ($885|0)==($870|0);
              if (!($886)) {
               _abort();
               // unreachable;
              }
              $887 = (($876) + 8|0);
              $888 = HEAP32[$887>>2]|0;
              $889 = ($888|0)==($870|0);
              if ($889) {
               HEAP32[$884>>2] = $876;
               HEAP32[$887>>2] = $880;
               $R$1$i$i = $876;
               break;
              } else {
               _abort();
               // unreachable;
              }
             }
            } while(0);
            $907 = ($873|0)==(0|0);
            if ($907) {
             break;
            }
            $$sum30$i$i = (($tsize$246$i) + 28)|0;
            $$sum113$i = (($$sum30$i$i) + ($805))|0;
            $908 = (($tbase$247$i) + ($$sum113$i)|0);
            $909 = $908;
            $910 = HEAP32[$909>>2]|0;
            $911 = (((18176) + ($910<<2)|0) + 304|0);
            $912 = HEAP32[$911>>2]|0;
            $913 = ($870|0)==($912|0);
            do {
             if ($913) {
              HEAP32[$911>>2] = $R$1$i$i;
              $cond$i$i = ($R$1$i$i|0)==(0|0);
              if (!($cond$i$i)) {
               break;
              }
              $914 = 1 << $910;
              $915 = $914 ^ -1;
              $916 = HEAP32[(((18176) + 4|0))>>2]|0;
              $917 = $916 & $915;
              HEAP32[(((18176) + 4|0))>>2] = $917;
              break L356;
             } else {
              $918 = $873;
              $919 = HEAP32[(((18176) + 16|0))>>2]|0;
              $920 = ($918>>>0)<($919>>>0);
              if ($920) {
               _abort();
               // unreachable;
              }
              $921 = (($873) + 16|0);
              $922 = HEAP32[$921>>2]|0;
              $923 = ($922|0)==($870|0);
              if ($923) {
               HEAP32[$921>>2] = $R$1$i$i;
              } else {
               $924 = (($873) + 20|0);
               HEAP32[$924>>2] = $R$1$i$i;
              }
              $925 = ($R$1$i$i|0)==(0|0);
              if ($925) {
               break L356;
              }
             }
            } while(0);
            $926 = $R$1$i$i;
            $927 = HEAP32[(((18176) + 16|0))>>2]|0;
            $928 = ($926>>>0)<($927>>>0);
            if ($928) {
             _abort();
             // unreachable;
            }
            $929 = (($R$1$i$i) + 24|0);
            HEAP32[$929>>2] = $873;
            $$sum3132$i$i = $805 | 16;
            $$sum114$i = (($$sum3132$i$i) + ($tsize$246$i))|0;
            $930 = (($tbase$247$i) + ($$sum114$i)|0);
            $931 = $930;
            $932 = HEAP32[$931>>2]|0;
            $933 = ($932|0)==(0|0);
            do {
             if (!($933)) {
              $934 = $932;
              $935 = HEAP32[(((18176) + 16|0))>>2]|0;
              $936 = ($934>>>0)<($935>>>0);
              if ($936) {
               _abort();
               // unreachable;
              } else {
               $937 = (($R$1$i$i) + 16|0);
               HEAP32[$937>>2] = $932;
               $938 = (($932) + 24|0);
               HEAP32[$938>>2] = $R$1$i$i;
               break;
              }
             }
            } while(0);
            $$sum115$i = (($$sum2$i23$i) + ($$sum3132$i$i))|0;
            $939 = (($tbase$247$i) + ($$sum115$i)|0);
            $940 = $939;
            $941 = HEAP32[$940>>2]|0;
            $942 = ($941|0)==(0|0);
            if ($942) {
             break;
            }
            $943 = $941;
            $944 = HEAP32[(((18176) + 16|0))>>2]|0;
            $945 = ($943>>>0)<($944>>>0);
            if ($945) {
             _abort();
             // unreachable;
            } else {
             $946 = (($R$1$i$i) + 20|0);
             HEAP32[$946>>2] = $941;
             $947 = (($941) + 24|0);
             HEAP32[$947>>2] = $R$1$i$i;
             break;
            }
           }
          } while(0);
          $$sum9$i$i = $838 | $805;
          $$sum116$i = (($$sum9$i$i) + ($tsize$246$i))|0;
          $948 = (($tbase$247$i) + ($$sum116$i)|0);
          $949 = $948;
          $950 = (($838) + ($813))|0;
          $oldfirst$0$i$i = $949;$qsize$0$i$i = $950;
         } else {
          $oldfirst$0$i$i = $807;$qsize$0$i$i = $813;
         }
         $951 = (($oldfirst$0$i$i) + 4|0);
         $952 = HEAP32[$951>>2]|0;
         $953 = $952 & -2;
         HEAP32[$951>>2] = $953;
         $954 = $qsize$0$i$i | 1;
         $$sum10$i$i = (($$sum$i21$i) + 4)|0;
         $955 = (($tbase$247$i) + ($$sum10$i$i)|0);
         $956 = $955;
         HEAP32[$956>>2] = $954;
         $$sum11$i24$i = (($qsize$0$i$i) + ($$sum$i21$i))|0;
         $957 = (($tbase$247$i) + ($$sum11$i24$i)|0);
         $958 = $957;
         HEAP32[$958>>2] = $qsize$0$i$i;
         $959 = $qsize$0$i$i >>> 3;
         $960 = ($qsize$0$i$i>>>0)<(256);
         if ($960) {
          $961 = $959 << 1;
          $962 = (((18176) + ($961<<2)|0) + 40|0);
          $963 = $962;
          $964 = HEAP32[((18176))>>2]|0;
          $965 = 1 << $959;
          $966 = $964 & $965;
          $967 = ($966|0)==(0);
          do {
           if ($967) {
            $968 = $964 | $965;
            HEAP32[((18176))>>2] = $968;
            $$sum26$pre$i$i = (($961) + 2)|0;
            $$pre$i25$i = (((18176) + ($$sum26$pre$i$i<<2)|0) + 40|0);
            $$pre$phi$i26$iZ2D = $$pre$i25$i;$F4$0$i$i = $963;
           } else {
            $$sum29$i$i = (($961) + 2)|0;
            $969 = (((18176) + ($$sum29$i$i<<2)|0) + 40|0);
            $970 = HEAP32[$969>>2]|0;
            $971 = $970;
            $972 = HEAP32[(((18176) + 16|0))>>2]|0;
            $973 = ($971>>>0)<($972>>>0);
            if (!($973)) {
             $$pre$phi$i26$iZ2D = $969;$F4$0$i$i = $970;
             break;
            }
            _abort();
            // unreachable;
           }
          } while(0);
          HEAP32[$$pre$phi$i26$iZ2D>>2] = $812;
          $974 = (($F4$0$i$i) + 12|0);
          HEAP32[$974>>2] = $812;
          $$sum27$i$i = (($$sum$i21$i) + 8)|0;
          $975 = (($tbase$247$i) + ($$sum27$i$i)|0);
          $976 = $975;
          HEAP32[$976>>2] = $F4$0$i$i;
          $$sum28$i$i = (($$sum$i21$i) + 12)|0;
          $977 = (($tbase$247$i) + ($$sum28$i$i)|0);
          $978 = $977;
          HEAP32[$978>>2] = $963;
          break;
         }
         $979 = $811;
         $980 = $qsize$0$i$i >>> 8;
         $981 = ($980|0)==(0);
         do {
          if ($981) {
           $I7$0$i$i = 0;
          } else {
           $982 = ($qsize$0$i$i>>>0)>(16777215);
           if ($982) {
            $I7$0$i$i = 31;
            break;
           }
           $983 = (($980) + 1048320)|0;
           $984 = $983 >>> 16;
           $985 = $984 & 8;
           $986 = $980 << $985;
           $987 = (($986) + 520192)|0;
           $988 = $987 >>> 16;
           $989 = $988 & 4;
           $990 = $989 | $985;
           $991 = $986 << $989;
           $992 = (($991) + 245760)|0;
           $993 = $992 >>> 16;
           $994 = $993 & 2;
           $995 = $990 | $994;
           $996 = (14 - ($995))|0;
           $997 = $991 << $994;
           $998 = $997 >>> 15;
           $999 = (($996) + ($998))|0;
           $1000 = $999 << 1;
           $1001 = (($999) + 7)|0;
           $1002 = $qsize$0$i$i >>> $1001;
           $1003 = $1002 & 1;
           $1004 = $1003 | $1000;
           $I7$0$i$i = $1004;
          }
         } while(0);
         $1005 = (((18176) + ($I7$0$i$i<<2)|0) + 304|0);
         $$sum12$i$i = (($$sum$i21$i) + 28)|0;
         $1006 = (($tbase$247$i) + ($$sum12$i$i)|0);
         $1007 = $1006;
         HEAP32[$1007>>2] = $I7$0$i$i;
         $$sum13$i$i = (($$sum$i21$i) + 16)|0;
         $1008 = (($tbase$247$i) + ($$sum13$i$i)|0);
         $$sum14$i$i = (($$sum$i21$i) + 20)|0;
         $1009 = (($tbase$247$i) + ($$sum14$i$i)|0);
         $1010 = $1009;
         HEAP32[$1010>>2] = 0;
         $1011 = $1008;
         HEAP32[$1011>>2] = 0;
         $1012 = HEAP32[(((18176) + 4|0))>>2]|0;
         $1013 = 1 << $I7$0$i$i;
         $1014 = $1012 & $1013;
         $1015 = ($1014|0)==(0);
         if ($1015) {
          $1016 = $1012 | $1013;
          HEAP32[(((18176) + 4|0))>>2] = $1016;
          HEAP32[$1005>>2] = $979;
          $1017 = $1005;
          $$sum15$i$i = (($$sum$i21$i) + 24)|0;
          $1018 = (($tbase$247$i) + ($$sum15$i$i)|0);
          $1019 = $1018;
          HEAP32[$1019>>2] = $1017;
          $$sum16$i$i = (($$sum$i21$i) + 12)|0;
          $1020 = (($tbase$247$i) + ($$sum16$i$i)|0);
          $1021 = $1020;
          HEAP32[$1021>>2] = $979;
          $$sum17$i$i = (($$sum$i21$i) + 8)|0;
          $1022 = (($tbase$247$i) + ($$sum17$i$i)|0);
          $1023 = $1022;
          HEAP32[$1023>>2] = $979;
          break;
         }
         $1024 = HEAP32[$1005>>2]|0;
         $1025 = ($I7$0$i$i|0)==(31);
         if ($1025) {
          $1028 = 0;
         } else {
          $1026 = $I7$0$i$i >>> 1;
          $1027 = (25 - ($1026))|0;
          $1028 = $1027;
         }
         $1029 = (($1024) + 4|0);
         $1030 = HEAP32[$1029>>2]|0;
         $1031 = $1030 & -8;
         $1032 = ($1031|0)==($qsize$0$i$i|0);
         L445: do {
          if ($1032) {
           $T$0$lcssa$i28$i = $1024;
          } else {
           $1033 = $qsize$0$i$i << $1028;
           $K8$052$i$i = $1033;$T$051$i$i = $1024;
           while(1) {
            $1039 = $K8$052$i$i >>> 31;
            $1040 = ((($T$051$i$i) + ($1039<<2)|0) + 16|0);
            $1041 = HEAP32[$1040>>2]|0;
            $1042 = ($1041|0)==(0|0);
            if ($1042) {
             break;
            }
            $1034 = $K8$052$i$i << 1;
            $1035 = (($1041) + 4|0);
            $1036 = HEAP32[$1035>>2]|0;
            $1037 = $1036 & -8;
            $1038 = ($1037|0)==($qsize$0$i$i|0);
            if ($1038) {
             $T$0$lcssa$i28$i = $1041;
             break L445;
            } else {
             $T$051$i$i$phi = $1041;$K8$052$i$i = $1034;$T$051$i$i = $T$051$i$i$phi;
            }
           }
           $1043 = $1040;
           $1044 = HEAP32[(((18176) + 16|0))>>2]|0;
           $1045 = ($1043>>>0)<($1044>>>0);
           if ($1045) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$1040>>2] = $979;
            $$sum23$i$i = (($$sum$i21$i) + 24)|0;
            $1046 = (($tbase$247$i) + ($$sum23$i$i)|0);
            $1047 = $1046;
            HEAP32[$1047>>2] = $T$051$i$i;
            $$sum24$i$i = (($$sum$i21$i) + 12)|0;
            $1048 = (($tbase$247$i) + ($$sum24$i$i)|0);
            $1049 = $1048;
            HEAP32[$1049>>2] = $979;
            $$sum25$i$i = (($$sum$i21$i) + 8)|0;
            $1050 = (($tbase$247$i) + ($$sum25$i$i)|0);
            $1051 = $1050;
            HEAP32[$1051>>2] = $979;
            break L348;
           }
          }
         } while(0);
         $1052 = (($T$0$lcssa$i28$i) + 8|0);
         $1053 = HEAP32[$1052>>2]|0;
         $1054 = $T$0$lcssa$i28$i;
         $1055 = HEAP32[(((18176) + 16|0))>>2]|0;
         $1056 = ($1054>>>0)<($1055>>>0);
         if ($1056) {
          _abort();
          // unreachable;
         }
         $1057 = $1053;
         $1058 = ($1057>>>0)<($1055>>>0);
         if ($1058) {
          _abort();
          // unreachable;
         } else {
          $1059 = (($1053) + 12|0);
          HEAP32[$1059>>2] = $979;
          HEAP32[$1052>>2] = $979;
          $$sum20$i$i = (($$sum$i21$i) + 8)|0;
          $1060 = (($tbase$247$i) + ($$sum20$i$i)|0);
          $1061 = $1060;
          HEAP32[$1061>>2] = $1053;
          $$sum21$i$i = (($$sum$i21$i) + 12)|0;
          $1062 = (($tbase$247$i) + ($$sum21$i$i)|0);
          $1063 = $1062;
          HEAP32[$1063>>2] = $T$0$lcssa$i28$i;
          $$sum22$i$i = (($$sum$i21$i) + 24)|0;
          $1064 = (($tbase$247$i) + ($$sum22$i$i)|0);
          $1065 = $1064;
          HEAP32[$1065>>2] = 0;
          break;
         }
        }
       } while(0);
       $$sum1819$i$i = $797 | 8;
       $1066 = (($tbase$247$i) + ($$sum1819$i$i)|0);
       $mem$0 = $1066;
       STACKTOP = sp;return ($mem$0|0);
      }
     } while(0);
     $1067 = $711;
     $sp$0$i$i$i = (((18176) + 448|0));
     while(1) {
      $1068 = ($sp$0$i$i$i);
      $1069 = HEAP32[$1068>>2]|0;
      $1070 = ($1069>>>0)>($1067>>>0);
      if (!($1070)) {
       $1071 = (($sp$0$i$i$i) + 4|0);
       $1072 = HEAP32[$1071>>2]|0;
       $1073 = (($1069) + ($1072)|0);
       $1074 = ($1073>>>0)>($1067>>>0);
       if ($1074) {
        break;
       }
      }
      $1075 = (($sp$0$i$i$i) + 8|0);
      $1076 = HEAP32[$1075>>2]|0;
      $sp$0$i$i$i = $1076;
     }
     $$sum$i15$i = (($1072) + -47)|0;
     $$sum1$i16$i = (($1072) + -39)|0;
     $1077 = (($1069) + ($$sum1$i16$i)|0);
     $1078 = $1077;
     $1079 = $1078 & 7;
     $1080 = ($1079|0)==(0);
     if ($1080) {
      $1083 = 0;
     } else {
      $1081 = (0 - ($1078))|0;
      $1082 = $1081 & 7;
      $1083 = $1082;
     }
     $$sum2$i17$i = (($$sum$i15$i) + ($1083))|0;
     $1084 = (($1069) + ($$sum2$i17$i)|0);
     $1085 = (($711) + 16|0);
     $1086 = $1085;
     $1087 = ($1084>>>0)<($1086>>>0);
     $1088 = $1087 ? $1067 : $1084;
     $1089 = (($1088) + 8|0);
     $1090 = $1089;
     $1091 = (($tsize$246$i) + -40)|0;
     $1092 = (($tbase$247$i) + 8|0);
     $1093 = $1092;
     $1094 = $1093 & 7;
     $1095 = ($1094|0)==(0);
     if ($1095) {
      $1098 = 0;
     } else {
      $1096 = (0 - ($1093))|0;
      $1097 = $1096 & 7;
      $1098 = $1097;
     }
     $1099 = (($tbase$247$i) + ($1098)|0);
     $1100 = $1099;
     $1101 = (($1091) - ($1098))|0;
     HEAP32[(((18176) + 24|0))>>2] = $1100;
     HEAP32[(((18176) + 12|0))>>2] = $1101;
     $1102 = $1101 | 1;
     $$sum$i$i$i = (($1098) + 4)|0;
     $1103 = (($tbase$247$i) + ($$sum$i$i$i)|0);
     $1104 = $1103;
     HEAP32[$1104>>2] = $1102;
     $$sum2$i$i$i = (($tsize$246$i) + -36)|0;
     $1105 = (($tbase$247$i) + ($$sum2$i$i$i)|0);
     $1106 = $1105;
     HEAP32[$1106>>2] = 40;
     $1107 = HEAP32[(((18648) + 16|0))>>2]|0;
     HEAP32[(((18176) + 28|0))>>2] = $1107;
     $1108 = (($1088) + 4|0);
     $1109 = $1108;
     HEAP32[$1109>>2] = 27;
     ;HEAP32[$1089+0>>2]=HEAP32[((((18176) + 448|0)))+0>>2]|0;HEAP32[$1089+4>>2]=HEAP32[((((18176) + 448|0)))+4>>2]|0;HEAP32[$1089+8>>2]=HEAP32[((((18176) + 448|0)))+8>>2]|0;HEAP32[$1089+12>>2]=HEAP32[((((18176) + 448|0)))+12>>2]|0;
     HEAP32[(((18176) + 448|0))>>2] = $tbase$247$i;
     HEAP32[(((18176) + 452|0))>>2] = $tsize$246$i;
     HEAP32[(((18176) + 460|0))>>2] = 0;
     HEAP32[(((18176) + 456|0))>>2] = $1090;
     $1110 = (($1088) + 28|0);
     $1111 = $1110;
     HEAP32[$1111>>2] = 7;
     $1112 = (($1088) + 32|0);
     $1113 = ($1112>>>0)<($1073>>>0);
     if ($1113) {
      $1114 = $1111;
      while(1) {
       $1115 = (($1114) + 4|0);
       HEAP32[$1115>>2] = 7;
       $1116 = (($1114) + 8|0);
       $1117 = $1116;
       $1118 = ($1117>>>0)<($1073>>>0);
       if ($1118) {
        $1114$phi = $1115;$1114 = $1114$phi;
       } else {
        break;
       }
      }
     }
     $1119 = ($1088|0)==($1067|0);
     if ($1119) {
      break;
     }
     $1120 = $1088;
     $1121 = $711;
     $1122 = (($1120) - ($1121))|0;
     $1123 = (($1067) + ($1122)|0);
     $$sum3$i$i = (($1122) + 4)|0;
     $1124 = (($1067) + ($$sum3$i$i)|0);
     $1125 = $1124;
     $1126 = HEAP32[$1125>>2]|0;
     $1127 = $1126 & -2;
     HEAP32[$1125>>2] = $1127;
     $1128 = $1122 | 1;
     $1129 = (($711) + 4|0);
     HEAP32[$1129>>2] = $1128;
     $1130 = $1123;
     HEAP32[$1130>>2] = $1122;
     $1131 = $1122 >>> 3;
     $1132 = ($1122>>>0)<(256);
     if ($1132) {
      $1133 = $1131 << 1;
      $1134 = (((18176) + ($1133<<2)|0) + 40|0);
      $1135 = $1134;
      $1136 = HEAP32[((18176))>>2]|0;
      $1137 = 1 << $1131;
      $1138 = $1136 & $1137;
      $1139 = ($1138|0)==(0);
      do {
       if ($1139) {
        $1140 = $1136 | $1137;
        HEAP32[((18176))>>2] = $1140;
        $$sum10$pre$i$i = (($1133) + 2)|0;
        $$pre$i$i = (((18176) + ($$sum10$pre$i$i<<2)|0) + 40|0);
        $$pre$phi$i$iZ2D = $$pre$i$i;$F$0$i$i = $1135;
       } else {
        $$sum11$i$i = (($1133) + 2)|0;
        $1141 = (((18176) + ($$sum11$i$i<<2)|0) + 40|0);
        $1142 = HEAP32[$1141>>2]|0;
        $1143 = $1142;
        $1144 = HEAP32[(((18176) + 16|0))>>2]|0;
        $1145 = ($1143>>>0)<($1144>>>0);
        if (!($1145)) {
         $$pre$phi$i$iZ2D = $1141;$F$0$i$i = $1142;
         break;
        }
        _abort();
        // unreachable;
       }
      } while(0);
      HEAP32[$$pre$phi$i$iZ2D>>2] = $711;
      $1146 = (($F$0$i$i) + 12|0);
      HEAP32[$1146>>2] = $711;
      $1147 = (($711) + 8|0);
      HEAP32[$1147>>2] = $F$0$i$i;
      $1148 = (($711) + 12|0);
      HEAP32[$1148>>2] = $1135;
      break;
     }
     $1149 = $711;
     $1150 = $1122 >>> 8;
     $1151 = ($1150|0)==(0);
     do {
      if ($1151) {
       $I1$0$i$i = 0;
      } else {
       $1152 = ($1122>>>0)>(16777215);
       if ($1152) {
        $I1$0$i$i = 31;
        break;
       }
       $1153 = (($1150) + 1048320)|0;
       $1154 = $1153 >>> 16;
       $1155 = $1154 & 8;
       $1156 = $1150 << $1155;
       $1157 = (($1156) + 520192)|0;
       $1158 = $1157 >>> 16;
       $1159 = $1158 & 4;
       $1160 = $1159 | $1155;
       $1161 = $1156 << $1159;
       $1162 = (($1161) + 245760)|0;
       $1163 = $1162 >>> 16;
       $1164 = $1163 & 2;
       $1165 = $1160 | $1164;
       $1166 = (14 - ($1165))|0;
       $1167 = $1161 << $1164;
       $1168 = $1167 >>> 15;
       $1169 = (($1166) + ($1168))|0;
       $1170 = $1169 << 1;
       $1171 = (($1169) + 7)|0;
       $1172 = $1122 >>> $1171;
       $1173 = $1172 & 1;
       $1174 = $1173 | $1170;
       $I1$0$i$i = $1174;
      }
     } while(0);
     $1175 = (((18176) + ($I1$0$i$i<<2)|0) + 304|0);
     $1176 = (($711) + 28|0);
     $I1$0$c$i$i = $I1$0$i$i;
     HEAP32[$1176>>2] = $I1$0$c$i$i;
     $1177 = (($711) + 20|0);
     HEAP32[$1177>>2] = 0;
     $1178 = (($711) + 16|0);
     HEAP32[$1178>>2] = 0;
     $1179 = HEAP32[(((18176) + 4|0))>>2]|0;
     $1180 = 1 << $I1$0$i$i;
     $1181 = $1179 & $1180;
     $1182 = ($1181|0)==(0);
     if ($1182) {
      $1183 = $1179 | $1180;
      HEAP32[(((18176) + 4|0))>>2] = $1183;
      HEAP32[$1175>>2] = $1149;
      $1184 = (($711) + 24|0);
      $$c$i$i = $1175;
      HEAP32[$1184>>2] = $$c$i$i;
      $1185 = (($711) + 12|0);
      HEAP32[$1185>>2] = $711;
      $1186 = (($711) + 8|0);
      HEAP32[$1186>>2] = $711;
      break;
     }
     $1187 = HEAP32[$1175>>2]|0;
     $1188 = ($I1$0$i$i|0)==(31);
     if ($1188) {
      $1191 = 0;
     } else {
      $1189 = $I1$0$i$i >>> 1;
      $1190 = (25 - ($1189))|0;
      $1191 = $1190;
     }
     $1192 = (($1187) + 4|0);
     $1193 = HEAP32[$1192>>2]|0;
     $1194 = $1193 & -8;
     $1195 = ($1194|0)==($1122|0);
     L499: do {
      if ($1195) {
       $T$0$lcssa$i$i = $1187;
      } else {
       $1196 = $1122 << $1191;
       $K2$014$i$i = $1196;$T$013$i$i = $1187;
       while(1) {
        $1202 = $K2$014$i$i >>> 31;
        $1203 = ((($T$013$i$i) + ($1202<<2)|0) + 16|0);
        $1204 = HEAP32[$1203>>2]|0;
        $1205 = ($1204|0)==(0|0);
        if ($1205) {
         break;
        }
        $1197 = $K2$014$i$i << 1;
        $1198 = (($1204) + 4|0);
        $1199 = HEAP32[$1198>>2]|0;
        $1200 = $1199 & -8;
        $1201 = ($1200|0)==($1122|0);
        if ($1201) {
         $T$0$lcssa$i$i = $1204;
         break L499;
        } else {
         $T$013$i$i$phi = $1204;$K2$014$i$i = $1197;$T$013$i$i = $T$013$i$i$phi;
        }
       }
       $1206 = $1203;
       $1207 = HEAP32[(((18176) + 16|0))>>2]|0;
       $1208 = ($1206>>>0)<($1207>>>0);
       if ($1208) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$1203>>2] = $1149;
        $1209 = (($711) + 24|0);
        $T$0$c7$i$i = $T$013$i$i;
        HEAP32[$1209>>2] = $T$0$c7$i$i;
        $1210 = (($711) + 12|0);
        HEAP32[$1210>>2] = $711;
        $1211 = (($711) + 8|0);
        HEAP32[$1211>>2] = $711;
        break L311;
       }
      }
     } while(0);
     $1212 = (($T$0$lcssa$i$i) + 8|0);
     $1213 = HEAP32[$1212>>2]|0;
     $1214 = $T$0$lcssa$i$i;
     $1215 = HEAP32[(((18176) + 16|0))>>2]|0;
     $1216 = ($1214>>>0)<($1215>>>0);
     if ($1216) {
      _abort();
      // unreachable;
     }
     $1217 = $1213;
     $1218 = ($1217>>>0)<($1215>>>0);
     if ($1218) {
      _abort();
      // unreachable;
     } else {
      $1219 = (($1213) + 12|0);
      HEAP32[$1219>>2] = $1149;
      HEAP32[$1212>>2] = $1149;
      $1220 = (($711) + 8|0);
      $$c6$i$i = $1213;
      HEAP32[$1220>>2] = $$c6$i$i;
      $1221 = (($711) + 12|0);
      $T$0$c$i$i = $T$0$lcssa$i$i;
      HEAP32[$1221>>2] = $T$0$c$i$i;
      $1222 = (($711) + 24|0);
      HEAP32[$1222>>2] = 0;
      break;
     }
    }
   } while(0);
   $1223 = HEAP32[(((18176) + 12|0))>>2]|0;
   $1224 = ($1223>>>0)>($nb$0>>>0);
   if (!($1224)) {
    break;
   }
   $1225 = (($1223) - ($nb$0))|0;
   HEAP32[(((18176) + 12|0))>>2] = $1225;
   $1226 = HEAP32[(((18176) + 24|0))>>2]|0;
   $1227 = $1226;
   $1228 = (($1227) + ($nb$0)|0);
   $1229 = $1228;
   HEAP32[(((18176) + 24|0))>>2] = $1229;
   $1230 = $1225 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1231 = (($1227) + ($$sum$i32)|0);
   $1232 = $1231;
   HEAP32[$1232>>2] = $1230;
   $1233 = $nb$0 | 3;
   $1234 = (($1226) + 4|0);
   HEAP32[$1234>>2] = $1233;
   $1235 = (($1226) + 8|0);
   $1236 = $1235;
   $mem$0 = $1236;
   STACKTOP = sp;return ($mem$0|0);
  }
 } while(0);
 $1237 = (___errno_location()|0);
 HEAP32[$1237>>2] = 12;
 $mem$0 = 0;
 STACKTOP = sp;return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$c = 0, $$c12 = 0, $$pre = 0, $$pre$phi68Z2D = 0, $$pre$phi70Z2D = 0, $$pre$phiZ2D = 0, $$pre67 = 0, $$pre69 = 0, $$sum = 0, $$sum16$pre = 0, $$sum17 = 0, $$sum18 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum2324 = 0, $$sum25 = 0, $$sum26 = 0, $$sum28 = 0, $$sum29 = 0;
 var $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum32 = 0, $$sum33 = 0, $$sum34 = 0, $$sum35 = 0, $$sum36 = 0, $$sum37 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0;
 var $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0;
 var $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0;
 var $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0;
 var $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0;
 var $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0;
 var $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $I18$0$c = 0;
 var $K19$057 = 0, $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $R7$0 = 0, $R7$0$phi = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $RP9$0 = 0, $RP9$0$phi = 0, $T$0$c = 0, $T$0$c13 = 0, $T$0$lcssa = 0, $T$056 = 0, $T$056$phi = 0, $cond = 0, $cond54 = 0, $p$0 = 0, $psize$0 = 0;
 var $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, $sp$0$in$i$phi = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($mem|0)==(0|0);
 if ($1) {
  STACKTOP = sp;return;
 }
 $2 = (($mem) + -8|0);
 $3 = $2;
 $4 = HEAP32[(((18176) + 16|0))>>2]|0;
 $5 = ($2>>>0)<($4>>>0);
 if ($5) {
  _abort();
  // unreachable;
 }
 $6 = (($mem) + -4|0);
 $7 = $6;
 $8 = HEAP32[$7>>2]|0;
 $9 = $8 & 3;
 $10 = ($9|0)==(1);
 if ($10) {
  _abort();
  // unreachable;
 }
 $11 = $8 & -8;
 $$sum = (($11) + -8)|0;
 $12 = (($mem) + ($$sum)|0);
 $13 = $12;
 $14 = $8 & 1;
 $15 = ($14|0)==(0);
 L10: do {
  if ($15) {
   $16 = $2;
   $17 = HEAP32[$16>>2]|0;
   $18 = ($9|0)==(0);
   if ($18) {
    STACKTOP = sp;return;
   }
   $$sum2 = (-8 - ($17))|0;
   $19 = (($mem) + ($$sum2)|0);
   $20 = $19;
   $21 = (($17) + ($11))|0;
   $22 = ($19>>>0)<($4>>>0);
   if ($22) {
    _abort();
    // unreachable;
   }
   $23 = HEAP32[(((18176) + 20|0))>>2]|0;
   $24 = ($20|0)==($23|0);
   if ($24) {
    $$sum3 = (($11) + -4)|0;
    $130 = (($mem) + ($$sum3)|0);
    $131 = $130;
    $132 = HEAP32[$131>>2]|0;
    $133 = $132 & 3;
    $134 = ($133|0)==(3);
    if (!($134)) {
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    HEAP32[(((18176) + 8|0))>>2] = $21;
    $135 = HEAP32[$131>>2]|0;
    $136 = $135 & -2;
    HEAP32[$131>>2] = $136;
    $137 = $21 | 1;
    $$sum26 = (($$sum2) + 4)|0;
    $138 = (($mem) + ($$sum26)|0);
    $139 = $138;
    HEAP32[$139>>2] = $137;
    $140 = $12;
    HEAP32[$140>>2] = $21;
    STACKTOP = sp;return;
   }
   $25 = $17 >>> 3;
   $26 = ($17>>>0)<(256);
   if ($26) {
    $$sum36 = (($$sum2) + 8)|0;
    $27 = (($mem) + ($$sum36)|0);
    $28 = $27;
    $29 = HEAP32[$28>>2]|0;
    $$sum37 = (($$sum2) + 12)|0;
    $30 = (($mem) + ($$sum37)|0);
    $31 = $30;
    $32 = HEAP32[$31>>2]|0;
    $33 = $25 << 1;
    $34 = (((18176) + ($33<<2)|0) + 40|0);
    $35 = $34;
    $36 = ($29|0)==($35|0);
    do {
     if (!($36)) {
      $37 = $29;
      $38 = ($37>>>0)<($4>>>0);
      if ($38) {
       _abort();
       // unreachable;
      }
      $39 = (($29) + 12|0);
      $40 = HEAP32[$39>>2]|0;
      $41 = ($40|0)==($20|0);
      if ($41) {
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $42 = ($32|0)==($29|0);
    if ($42) {
     $43 = 1 << $25;
     $44 = $43 ^ -1;
     $45 = HEAP32[((18176))>>2]|0;
     $46 = $45 & $44;
     HEAP32[((18176))>>2] = $46;
     $p$0 = $20;$psize$0 = $21;
     break;
    }
    $47 = ($32|0)==($35|0);
    do {
     if ($47) {
      $$pre69 = (($32) + 8|0);
      $$pre$phi70Z2D = $$pre69;
     } else {
      $48 = $32;
      $49 = ($48>>>0)<($4>>>0);
      if ($49) {
       _abort();
       // unreachable;
      }
      $50 = (($32) + 8|0);
      $51 = HEAP32[$50>>2]|0;
      $52 = ($51|0)==($20|0);
      if ($52) {
       $$pre$phi70Z2D = $50;
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $53 = (($29) + 12|0);
    HEAP32[$53>>2] = $32;
    HEAP32[$$pre$phi70Z2D>>2] = $29;
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $54 = $19;
   $$sum28 = (($$sum2) + 24)|0;
   $55 = (($mem) + ($$sum28)|0);
   $56 = $55;
   $57 = HEAP32[$56>>2]|0;
   $$sum29 = (($$sum2) + 12)|0;
   $58 = (($mem) + ($$sum29)|0);
   $59 = $58;
   $60 = HEAP32[$59>>2]|0;
   $61 = ($60|0)==($54|0);
   do {
    if ($61) {
     $$sum31 = (($$sum2) + 20)|0;
     $73 = (($mem) + ($$sum31)|0);
     $74 = $73;
     $75 = HEAP32[$74>>2]|0;
     $76 = ($75|0)==(0|0);
     if ($76) {
      $$sum30 = (($$sum2) + 16)|0;
      $77 = (($mem) + ($$sum30)|0);
      $78 = $77;
      $79 = HEAP32[$78>>2]|0;
      $80 = ($79|0)==(0|0);
      if ($80) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $79;$RP$0 = $78;
      }
     } else {
      $R$0 = $75;$RP$0 = $74;
     }
     while(1) {
      $81 = (($R$0) + 20|0);
      $82 = HEAP32[$81>>2]|0;
      $83 = ($82|0)==(0|0);
      if (!($83)) {
       $RP$0$phi = $81;$R$0$phi = $82;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $84 = (($R$0) + 16|0);
      $85 = HEAP32[$84>>2]|0;
      $86 = ($85|0)==(0|0);
      if ($86) {
       break;
      } else {
       $R$0 = $85;$RP$0 = $84;
      }
     }
     $87 = $RP$0;
     $88 = ($87>>>0)<($4>>>0);
     if ($88) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum35 = (($$sum2) + 8)|0;
     $62 = (($mem) + ($$sum35)|0);
     $63 = $62;
     $64 = HEAP32[$63>>2]|0;
     $65 = $64;
     $66 = ($65>>>0)<($4>>>0);
     if ($66) {
      _abort();
      // unreachable;
     }
     $67 = (($64) + 12|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = ($68|0)==($54|0);
     if (!($69)) {
      _abort();
      // unreachable;
     }
     $70 = (($60) + 8|0);
     $71 = HEAP32[$70>>2]|0;
     $72 = ($71|0)==($54|0);
     if ($72) {
      HEAP32[$67>>2] = $60;
      HEAP32[$70>>2] = $64;
      $R$1 = $60;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $89 = ($57|0)==(0|0);
   if ($89) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $$sum32 = (($$sum2) + 28)|0;
   $90 = (($mem) + ($$sum32)|0);
   $91 = $90;
   $92 = HEAP32[$91>>2]|0;
   $93 = (((18176) + ($92<<2)|0) + 304|0);
   $94 = HEAP32[$93>>2]|0;
   $95 = ($54|0)==($94|0);
   do {
    if ($95) {
     HEAP32[$93>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if (!($cond)) {
      break;
     }
     $96 = 1 << $92;
     $97 = $96 ^ -1;
     $98 = HEAP32[(((18176) + 4|0))>>2]|0;
     $99 = $98 & $97;
     HEAP32[(((18176) + 4|0))>>2] = $99;
     $p$0 = $20;$psize$0 = $21;
     break L10;
    } else {
     $100 = $57;
     $101 = HEAP32[(((18176) + 16|0))>>2]|0;
     $102 = ($100>>>0)<($101>>>0);
     if ($102) {
      _abort();
      // unreachable;
     }
     $103 = (($57) + 16|0);
     $104 = HEAP32[$103>>2]|0;
     $105 = ($104|0)==($54|0);
     if ($105) {
      HEAP32[$103>>2] = $R$1;
     } else {
      $106 = (($57) + 20|0);
      HEAP32[$106>>2] = $R$1;
     }
     $107 = ($R$1|0)==(0|0);
     if ($107) {
      $p$0 = $20;$psize$0 = $21;
      break L10;
     }
    }
   } while(0);
   $108 = $R$1;
   $109 = HEAP32[(((18176) + 16|0))>>2]|0;
   $110 = ($108>>>0)<($109>>>0);
   if ($110) {
    _abort();
    // unreachable;
   }
   $111 = (($R$1) + 24|0);
   HEAP32[$111>>2] = $57;
   $$sum33 = (($$sum2) + 16)|0;
   $112 = (($mem) + ($$sum33)|0);
   $113 = $112;
   $114 = HEAP32[$113>>2]|0;
   $115 = ($114|0)==(0|0);
   do {
    if (!($115)) {
     $116 = $114;
     $117 = HEAP32[(((18176) + 16|0))>>2]|0;
     $118 = ($116>>>0)<($117>>>0);
     if ($118) {
      _abort();
      // unreachable;
     } else {
      $119 = (($R$1) + 16|0);
      HEAP32[$119>>2] = $114;
      $120 = (($114) + 24|0);
      HEAP32[$120>>2] = $R$1;
      break;
     }
    }
   } while(0);
   $$sum34 = (($$sum2) + 20)|0;
   $121 = (($mem) + ($$sum34)|0);
   $122 = $121;
   $123 = HEAP32[$122>>2]|0;
   $124 = ($123|0)==(0|0);
   if ($124) {
    $p$0 = $20;$psize$0 = $21;
    break;
   }
   $125 = $123;
   $126 = HEAP32[(((18176) + 16|0))>>2]|0;
   $127 = ($125>>>0)<($126>>>0);
   if ($127) {
    _abort();
    // unreachable;
   } else {
    $128 = (($R$1) + 20|0);
    HEAP32[$128>>2] = $123;
    $129 = (($123) + 24|0);
    HEAP32[$129>>2] = $R$1;
    $p$0 = $20;$psize$0 = $21;
    break;
   }
  } else {
   $p$0 = $3;$psize$0 = $11;
  }
 } while(0);
 $141 = $p$0;
 $142 = ($141>>>0)<($12>>>0);
 if (!($142)) {
  _abort();
  // unreachable;
 }
 $$sum25 = (($11) + -4)|0;
 $143 = (($mem) + ($$sum25)|0);
 $144 = $143;
 $145 = HEAP32[$144>>2]|0;
 $146 = $145 & 1;
 $147 = ($146|0)==(0);
 if ($147) {
  _abort();
  // unreachable;
 }
 $148 = $145 & 2;
 $149 = ($148|0)==(0);
 do {
  if ($149) {
   $150 = HEAP32[(((18176) + 24|0))>>2]|0;
   $151 = ($13|0)==($150|0);
   if ($151) {
    $152 = HEAP32[(((18176) + 12|0))>>2]|0;
    $153 = (($152) + ($psize$0))|0;
    HEAP32[(((18176) + 12|0))>>2] = $153;
    HEAP32[(((18176) + 24|0))>>2] = $p$0;
    $154 = $153 | 1;
    $155 = (($p$0) + 4|0);
    HEAP32[$155>>2] = $154;
    $156 = HEAP32[(((18176) + 20|0))>>2]|0;
    $157 = ($p$0|0)==($156|0);
    if (!($157)) {
     STACKTOP = sp;return;
    }
    HEAP32[(((18176) + 20|0))>>2] = 0;
    HEAP32[(((18176) + 8|0))>>2] = 0;
    STACKTOP = sp;return;
   }
   $158 = HEAP32[(((18176) + 20|0))>>2]|0;
   $159 = ($13|0)==($158|0);
   if ($159) {
    $160 = HEAP32[(((18176) + 8|0))>>2]|0;
    $161 = (($160) + ($psize$0))|0;
    HEAP32[(((18176) + 8|0))>>2] = $161;
    HEAP32[(((18176) + 20|0))>>2] = $p$0;
    $162 = $161 | 1;
    $163 = (($p$0) + 4|0);
    HEAP32[$163>>2] = $162;
    $164 = (($141) + ($161)|0);
    $165 = $164;
    HEAP32[$165>>2] = $161;
    STACKTOP = sp;return;
   }
   $166 = $145 & -8;
   $167 = (($166) + ($psize$0))|0;
   $168 = $145 >>> 3;
   $169 = ($145>>>0)<(256);
   L113: do {
    if ($169) {
     $170 = (($mem) + ($11)|0);
     $171 = $170;
     $172 = HEAP32[$171>>2]|0;
     $$sum2324 = $11 | 4;
     $173 = (($mem) + ($$sum2324)|0);
     $174 = $173;
     $175 = HEAP32[$174>>2]|0;
     $176 = $168 << 1;
     $177 = (((18176) + ($176<<2)|0) + 40|0);
     $178 = $177;
     $179 = ($172|0)==($178|0);
     do {
      if (!($179)) {
       $180 = $172;
       $181 = HEAP32[(((18176) + 16|0))>>2]|0;
       $182 = ($180>>>0)<($181>>>0);
       if ($182) {
        _abort();
        // unreachable;
       }
       $183 = (($172) + 12|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($184|0)==($13|0);
       if ($185) {
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $186 = ($175|0)==($172|0);
     if ($186) {
      $187 = 1 << $168;
      $188 = $187 ^ -1;
      $189 = HEAP32[((18176))>>2]|0;
      $190 = $189 & $188;
      HEAP32[((18176))>>2] = $190;
      break;
     }
     $191 = ($175|0)==($178|0);
     do {
      if ($191) {
       $$pre67 = (($175) + 8|0);
       $$pre$phi68Z2D = $$pre67;
      } else {
       $192 = $175;
       $193 = HEAP32[(((18176) + 16|0))>>2]|0;
       $194 = ($192>>>0)<($193>>>0);
       if ($194) {
        _abort();
        // unreachable;
       }
       $195 = (($175) + 8|0);
       $196 = HEAP32[$195>>2]|0;
       $197 = ($196|0)==($13|0);
       if ($197) {
        $$pre$phi68Z2D = $195;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $198 = (($172) + 12|0);
     HEAP32[$198>>2] = $175;
     HEAP32[$$pre$phi68Z2D>>2] = $172;
    } else {
     $199 = $12;
     $$sum5 = (($11) + 16)|0;
     $200 = (($mem) + ($$sum5)|0);
     $201 = $200;
     $202 = HEAP32[$201>>2]|0;
     $$sum67 = $11 | 4;
     $203 = (($mem) + ($$sum67)|0);
     $204 = $203;
     $205 = HEAP32[$204>>2]|0;
     $206 = ($205|0)==($199|0);
     do {
      if ($206) {
       $$sum9 = (($11) + 12)|0;
       $219 = (($mem) + ($$sum9)|0);
       $220 = $219;
       $221 = HEAP32[$220>>2]|0;
       $222 = ($221|0)==(0|0);
       if ($222) {
        $$sum8 = (($11) + 8)|0;
        $223 = (($mem) + ($$sum8)|0);
        $224 = $223;
        $225 = HEAP32[$224>>2]|0;
        $226 = ($225|0)==(0|0);
        if ($226) {
         $R7$1 = 0;
         break;
        } else {
         $R7$0 = $225;$RP9$0 = $224;
        }
       } else {
        $R7$0 = $221;$RP9$0 = $220;
       }
       while(1) {
        $227 = (($R7$0) + 20|0);
        $228 = HEAP32[$227>>2]|0;
        $229 = ($228|0)==(0|0);
        if (!($229)) {
         $RP9$0$phi = $227;$R7$0$phi = $228;$RP9$0 = $RP9$0$phi;$R7$0 = $R7$0$phi;
         continue;
        }
        $230 = (($R7$0) + 16|0);
        $231 = HEAP32[$230>>2]|0;
        $232 = ($231|0)==(0|0);
        if ($232) {
         break;
        } else {
         $R7$0 = $231;$RP9$0 = $230;
        }
       }
       $233 = $RP9$0;
       $234 = HEAP32[(((18176) + 16|0))>>2]|0;
       $235 = ($233>>>0)<($234>>>0);
       if ($235) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP9$0>>2] = 0;
        $R7$1 = $R7$0;
        break;
       }
      } else {
       $207 = (($mem) + ($11)|0);
       $208 = $207;
       $209 = HEAP32[$208>>2]|0;
       $210 = $209;
       $211 = HEAP32[(((18176) + 16|0))>>2]|0;
       $212 = ($210>>>0)<($211>>>0);
       if ($212) {
        _abort();
        // unreachable;
       }
       $213 = (($209) + 12|0);
       $214 = HEAP32[$213>>2]|0;
       $215 = ($214|0)==($199|0);
       if (!($215)) {
        _abort();
        // unreachable;
       }
       $216 = (($205) + 8|0);
       $217 = HEAP32[$216>>2]|0;
       $218 = ($217|0)==($199|0);
       if ($218) {
        HEAP32[$213>>2] = $205;
        HEAP32[$216>>2] = $209;
        $R7$1 = $205;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $236 = ($202|0)==(0|0);
     if ($236) {
      break;
     }
     $$sum18 = (($11) + 20)|0;
     $237 = (($mem) + ($$sum18)|0);
     $238 = $237;
     $239 = HEAP32[$238>>2]|0;
     $240 = (((18176) + ($239<<2)|0) + 304|0);
     $241 = HEAP32[$240>>2]|0;
     $242 = ($199|0)==($241|0);
     do {
      if ($242) {
       HEAP32[$240>>2] = $R7$1;
       $cond54 = ($R7$1|0)==(0|0);
       if (!($cond54)) {
        break;
       }
       $243 = 1 << $239;
       $244 = $243 ^ -1;
       $245 = HEAP32[(((18176) + 4|0))>>2]|0;
       $246 = $245 & $244;
       HEAP32[(((18176) + 4|0))>>2] = $246;
       break L113;
      } else {
       $247 = $202;
       $248 = HEAP32[(((18176) + 16|0))>>2]|0;
       $249 = ($247>>>0)<($248>>>0);
       if ($249) {
        _abort();
        // unreachable;
       }
       $250 = (($202) + 16|0);
       $251 = HEAP32[$250>>2]|0;
       $252 = ($251|0)==($199|0);
       if ($252) {
        HEAP32[$250>>2] = $R7$1;
       } else {
        $253 = (($202) + 20|0);
        HEAP32[$253>>2] = $R7$1;
       }
       $254 = ($R7$1|0)==(0|0);
       if ($254) {
        break L113;
       }
      }
     } while(0);
     $255 = $R7$1;
     $256 = HEAP32[(((18176) + 16|0))>>2]|0;
     $257 = ($255>>>0)<($256>>>0);
     if ($257) {
      _abort();
      // unreachable;
     }
     $258 = (($R7$1) + 24|0);
     HEAP32[$258>>2] = $202;
     $$sum19 = (($11) + 8)|0;
     $259 = (($mem) + ($$sum19)|0);
     $260 = $259;
     $261 = HEAP32[$260>>2]|0;
     $262 = ($261|0)==(0|0);
     do {
      if (!($262)) {
       $263 = $261;
       $264 = HEAP32[(((18176) + 16|0))>>2]|0;
       $265 = ($263>>>0)<($264>>>0);
       if ($265) {
        _abort();
        // unreachable;
       } else {
        $266 = (($R7$1) + 16|0);
        HEAP32[$266>>2] = $261;
        $267 = (($261) + 24|0);
        HEAP32[$267>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum20 = (($11) + 12)|0;
     $268 = (($mem) + ($$sum20)|0);
     $269 = $268;
     $270 = HEAP32[$269>>2]|0;
     $271 = ($270|0)==(0|0);
     if ($271) {
      break;
     }
     $272 = $270;
     $273 = HEAP32[(((18176) + 16|0))>>2]|0;
     $274 = ($272>>>0)<($273>>>0);
     if ($274) {
      _abort();
      // unreachable;
     } else {
      $275 = (($R7$1) + 20|0);
      HEAP32[$275>>2] = $270;
      $276 = (($270) + 24|0);
      HEAP32[$276>>2] = $R7$1;
      break;
     }
    }
   } while(0);
   $277 = $167 | 1;
   $278 = (($p$0) + 4|0);
   HEAP32[$278>>2] = $277;
   $279 = (($141) + ($167)|0);
   $280 = $279;
   HEAP32[$280>>2] = $167;
   $281 = HEAP32[(((18176) + 20|0))>>2]|0;
   $282 = ($p$0|0)==($281|0);
   if (!($282)) {
    $psize$1 = $167;
    break;
   }
   HEAP32[(((18176) + 8|0))>>2] = $167;
   STACKTOP = sp;return;
  } else {
   $283 = $145 & -2;
   HEAP32[$144>>2] = $283;
   $284 = $psize$0 | 1;
   $285 = (($p$0) + 4|0);
   HEAP32[$285>>2] = $284;
   $286 = (($141) + ($psize$0)|0);
   $287 = $286;
   HEAP32[$287>>2] = $psize$0;
   $psize$1 = $psize$0;
  }
 } while(0);
 $288 = $psize$1 >>> 3;
 $289 = ($psize$1>>>0)<(256);
 if ($289) {
  $290 = $288 << 1;
  $291 = (((18176) + ($290<<2)|0) + 40|0);
  $292 = $291;
  $293 = HEAP32[((18176))>>2]|0;
  $294 = 1 << $288;
  $295 = $293 & $294;
  $296 = ($295|0)==(0);
  do {
   if ($296) {
    $297 = $293 | $294;
    HEAP32[((18176))>>2] = $297;
    $$sum16$pre = (($290) + 2)|0;
    $$pre = (((18176) + ($$sum16$pre<<2)|0) + 40|0);
    $$pre$phiZ2D = $$pre;$F16$0 = $292;
   } else {
    $$sum17 = (($290) + 2)|0;
    $298 = (((18176) + ($$sum17<<2)|0) + 40|0);
    $299 = HEAP32[$298>>2]|0;
    $300 = $299;
    $301 = HEAP32[(((18176) + 16|0))>>2]|0;
    $302 = ($300>>>0)<($301>>>0);
    if (!($302)) {
     $$pre$phiZ2D = $298;$F16$0 = $299;
     break;
    }
    _abort();
    // unreachable;
   }
  } while(0);
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $303 = (($F16$0) + 12|0);
  HEAP32[$303>>2] = $p$0;
  $304 = (($p$0) + 8|0);
  HEAP32[$304>>2] = $F16$0;
  $305 = (($p$0) + 12|0);
  HEAP32[$305>>2] = $292;
  STACKTOP = sp;return;
 }
 $306 = $p$0;
 $307 = $psize$1 >>> 8;
 $308 = ($307|0)==(0);
 do {
  if ($308) {
   $I18$0 = 0;
  } else {
   $309 = ($psize$1>>>0)>(16777215);
   if ($309) {
    $I18$0 = 31;
    break;
   }
   $310 = (($307) + 1048320)|0;
   $311 = $310 >>> 16;
   $312 = $311 & 8;
   $313 = $307 << $312;
   $314 = (($313) + 520192)|0;
   $315 = $314 >>> 16;
   $316 = $315 & 4;
   $317 = $316 | $312;
   $318 = $313 << $316;
   $319 = (($318) + 245760)|0;
   $320 = $319 >>> 16;
   $321 = $320 & 2;
   $322 = $317 | $321;
   $323 = (14 - ($322))|0;
   $324 = $318 << $321;
   $325 = $324 >>> 15;
   $326 = (($323) + ($325))|0;
   $327 = $326 << 1;
   $328 = (($326) + 7)|0;
   $329 = $psize$1 >>> $328;
   $330 = $329 & 1;
   $331 = $330 | $327;
   $I18$0 = $331;
  }
 } while(0);
 $332 = (((18176) + ($I18$0<<2)|0) + 304|0);
 $333 = (($p$0) + 28|0);
 $I18$0$c = $I18$0;
 HEAP32[$333>>2] = $I18$0$c;
 $334 = (($p$0) + 20|0);
 HEAP32[$334>>2] = 0;
 $335 = (($p$0) + 16|0);
 HEAP32[$335>>2] = 0;
 $336 = HEAP32[(((18176) + 4|0))>>2]|0;
 $337 = 1 << $I18$0;
 $338 = $336 & $337;
 $339 = ($338|0)==(0);
 L199: do {
  if ($339) {
   $340 = $336 | $337;
   HEAP32[(((18176) + 4|0))>>2] = $340;
   HEAP32[$332>>2] = $306;
   $341 = (($p$0) + 24|0);
   $$c = $332;
   HEAP32[$341>>2] = $$c;
   $342 = (($p$0) + 12|0);
   HEAP32[$342>>2] = $p$0;
   $343 = (($p$0) + 8|0);
   HEAP32[$343>>2] = $p$0;
  } else {
   $344 = HEAP32[$332>>2]|0;
   $345 = ($I18$0|0)==(31);
   if ($345) {
    $348 = 0;
   } else {
    $346 = $I18$0 >>> 1;
    $347 = (25 - ($346))|0;
    $348 = $347;
   }
   $349 = (($344) + 4|0);
   $350 = HEAP32[$349>>2]|0;
   $351 = $350 & -8;
   $352 = ($351|0)==($psize$1|0);
   L204: do {
    if ($352) {
     $T$0$lcssa = $344;
    } else {
     $353 = $psize$1 << $348;
     $K19$057 = $353;$T$056 = $344;
     while(1) {
      $359 = $K19$057 >>> 31;
      $360 = ((($T$056) + ($359<<2)|0) + 16|0);
      $361 = HEAP32[$360>>2]|0;
      $362 = ($361|0)==(0|0);
      if ($362) {
       break;
      }
      $354 = $K19$057 << 1;
      $355 = (($361) + 4|0);
      $356 = HEAP32[$355>>2]|0;
      $357 = $356 & -8;
      $358 = ($357|0)==($psize$1|0);
      if ($358) {
       $T$0$lcssa = $361;
       break L204;
      } else {
       $T$056$phi = $361;$K19$057 = $354;$T$056 = $T$056$phi;
      }
     }
     $363 = $360;
     $364 = HEAP32[(((18176) + 16|0))>>2]|0;
     $365 = ($363>>>0)<($364>>>0);
     if ($365) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$360>>2] = $306;
      $366 = (($p$0) + 24|0);
      $T$0$c13 = $T$056;
      HEAP32[$366>>2] = $T$0$c13;
      $367 = (($p$0) + 12|0);
      HEAP32[$367>>2] = $p$0;
      $368 = (($p$0) + 8|0);
      HEAP32[$368>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $369 = (($T$0$lcssa) + 8|0);
   $370 = HEAP32[$369>>2]|0;
   $371 = $T$0$lcssa;
   $372 = HEAP32[(((18176) + 16|0))>>2]|0;
   $373 = ($371>>>0)<($372>>>0);
   if ($373) {
    _abort();
    // unreachable;
   }
   $374 = $370;
   $375 = ($374>>>0)<($372>>>0);
   if ($375) {
    _abort();
    // unreachable;
   } else {
    $376 = (($370) + 12|0);
    HEAP32[$376>>2] = $306;
    HEAP32[$369>>2] = $306;
    $377 = (($p$0) + 8|0);
    $$c12 = $370;
    HEAP32[$377>>2] = $$c12;
    $378 = (($p$0) + 12|0);
    $T$0$c = $T$0$lcssa;
    HEAP32[$378>>2] = $T$0$c;
    $379 = (($p$0) + 24|0);
    HEAP32[$379>>2] = 0;
    break;
   }
  }
 } while(0);
 $380 = HEAP32[(((18176) + 32|0))>>2]|0;
 $381 = (($380) + -1)|0;
 HEAP32[(((18176) + 32|0))>>2] = $381;
 $382 = ($381|0)==(0);
 if ($382) {
  $sp$0$in$i = (((18176) + 456|0));
 } else {
  STACKTOP = sp;return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $383 = ($sp$0$i|0)==(0|0);
  $384 = (($sp$0$i) + 8|0);
  if ($383) {
   break;
  } else {
   $sp$0$in$i$phi = $384;$sp$0$in$i = $sp$0$in$i$phi;
  }
 }
 HEAP32[(((18176) + 32|0))>>2] = -1;
 STACKTOP = sp;return;
}
function _realloc($oldmem,$bytes) {
 $oldmem = $oldmem|0;
 $bytes = $bytes|0;
 var $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $3 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mem$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = ($oldmem|0)==(0|0);
 if ($1) {
  $2 = (_malloc($bytes)|0);
  $mem$0 = $2;
  STACKTOP = sp;return ($mem$0|0);
 }
 $3 = ($bytes>>>0)>(4294967231);
 if ($3) {
  $4 = (___errno_location()|0);
  HEAP32[$4>>2] = 12;
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $5 = ($bytes>>>0)<(11);
 if ($5) {
  $8 = 16;
 } else {
  $6 = (($bytes) + 11)|0;
  $7 = $6 & -8;
  $8 = $7;
 }
 $9 = (($oldmem) + -8|0);
 $10 = $9;
 $11 = (_try_realloc_chunk($10,$8)|0);
 $12 = ($11|0)==(0|0);
 if (!($12)) {
  $13 = (($11) + 8|0);
  $14 = $13;
  $mem$0 = $14;
  STACKTOP = sp;return ($mem$0|0);
 }
 $15 = (_malloc($bytes)|0);
 $16 = ($15|0)==(0|0);
 if ($16) {
  $mem$0 = 0;
  STACKTOP = sp;return ($mem$0|0);
 }
 $17 = (($oldmem) + -4|0);
 $18 = $17;
 $19 = HEAP32[$18>>2]|0;
 $20 = $19 & -8;
 $21 = $19 & 3;
 $22 = ($21|0)==(0);
 $23 = $22 ? 8 : 4;
 $24 = (($20) - ($23))|0;
 $25 = ($24>>>0)<($bytes>>>0);
 $26 = $25 ? $24 : $bytes;
 _memcpy(($15|0),($oldmem|0),($26|0))|0;
 _free($oldmem);
 $mem$0 = $15;
 STACKTOP = sp;return ($mem$0|0);
}
function _try_realloc_chunk($p,$nb) {
 $p = $p|0;
 $nb = $nb|0;
 var $$pre = 0, $$pre$phiZ2D = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum2728 = 0, $$sum3 = 0, $$sum4 = 0, $$sum5 = 0, $$sum78 = 0;
 var $$sum910 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $cond = 0, $newp$0 = 0;
 var $or$cond = 0, $storemerge = 0, $storemerge21 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = (($p) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = $2 & -8;
 $4 = $p;
 $5 = (($4) + ($3)|0);
 $6 = $5;
 $7 = HEAP32[(((18176) + 16|0))>>2]|0;
 $8 = ($4>>>0)<($7>>>0);
 if ($8) {
  _abort();
  // unreachable;
 }
 $9 = $2 & 3;
 $10 = ($9|0)!=(1);
 $11 = ($4>>>0)<($5>>>0);
 $or$cond = $10 & $11;
 if (!($or$cond)) {
  _abort();
  // unreachable;
 }
 $$sum2728 = $3 | 4;
 $12 = (($4) + ($$sum2728)|0);
 $13 = $12;
 $14 = HEAP32[$13>>2]|0;
 $15 = $14 & 1;
 $16 = ($15|0)==(0);
 if ($16) {
  _abort();
  // unreachable;
 }
 $17 = ($9|0)==(0);
 if ($17) {
  $18 = ($nb>>>0)<(256);
  if ($18) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $19 = (($nb) + 4)|0;
  $20 = ($3>>>0)<($19>>>0);
  do {
   if (!($20)) {
    $21 = (($3) - ($nb))|0;
    $22 = HEAP32[(((18648) + 8|0))>>2]|0;
    $23 = $22 << 1;
    $24 = ($21>>>0)>($23>>>0);
    if ($24) {
     break;
    } else {
     $newp$0 = $p;
    }
    STACKTOP = sp;return ($newp$0|0);
   }
  } while(0);
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $25 = ($3>>>0)<($nb>>>0);
 if (!($25)) {
  $26 = (($3) - ($nb))|0;
  $27 = ($26>>>0)>(15);
  if (!($27)) {
   $newp$0 = $p;
   STACKTOP = sp;return ($newp$0|0);
  }
  $28 = (($4) + ($nb)|0);
  $29 = $28;
  $30 = $2 & 1;
  $31 = $30 | $nb;
  $32 = $31 | 2;
  HEAP32[$1>>2] = $32;
  $$sum23 = (($nb) + 4)|0;
  $33 = (($4) + ($$sum23)|0);
  $34 = $33;
  $35 = $26 | 3;
  HEAP32[$34>>2] = $35;
  $36 = HEAP32[$13>>2]|0;
  $37 = $36 | 1;
  HEAP32[$13>>2] = $37;
  _dispose_chunk($29,$26);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $38 = HEAP32[(((18176) + 24|0))>>2]|0;
 $39 = ($6|0)==($38|0);
 if ($39) {
  $40 = HEAP32[(((18176) + 12|0))>>2]|0;
  $41 = (($40) + ($3))|0;
  $42 = ($41>>>0)>($nb>>>0);
  if (!($42)) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $43 = (($41) - ($nb))|0;
  $44 = (($4) + ($nb)|0);
  $45 = $44;
  $46 = $2 & 1;
  $47 = $46 | $nb;
  $48 = $47 | 2;
  HEAP32[$1>>2] = $48;
  $$sum22 = (($nb) + 4)|0;
  $49 = (($4) + ($$sum22)|0);
  $50 = $49;
  $51 = $43 | 1;
  HEAP32[$50>>2] = $51;
  HEAP32[(((18176) + 24|0))>>2] = $45;
  HEAP32[(((18176) + 12|0))>>2] = $43;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $52 = HEAP32[(((18176) + 20|0))>>2]|0;
 $53 = ($6|0)==($52|0);
 if ($53) {
  $54 = HEAP32[(((18176) + 8|0))>>2]|0;
  $55 = (($54) + ($3))|0;
  $56 = ($55>>>0)<($nb>>>0);
  if ($56) {
   $newp$0 = 0;
   STACKTOP = sp;return ($newp$0|0);
  }
  $57 = (($55) - ($nb))|0;
  $58 = ($57>>>0)>(15);
  if ($58) {
   $59 = (($4) + ($nb)|0);
   $60 = $59;
   $61 = (($4) + ($55)|0);
   $62 = $2 & 1;
   $63 = $62 | $nb;
   $64 = $63 | 2;
   HEAP32[$1>>2] = $64;
   $$sum19 = (($nb) + 4)|0;
   $65 = (($4) + ($$sum19)|0);
   $66 = $65;
   $67 = $57 | 1;
   HEAP32[$66>>2] = $67;
   $68 = $61;
   HEAP32[$68>>2] = $57;
   $$sum20 = (($55) + 4)|0;
   $69 = (($4) + ($$sum20)|0);
   $70 = $69;
   $71 = HEAP32[$70>>2]|0;
   $72 = $71 & -2;
   HEAP32[$70>>2] = $72;
   $storemerge = $60;$storemerge21 = $57;
  } else {
   $73 = $2 & 1;
   $74 = $73 | $55;
   $75 = $74 | 2;
   HEAP32[$1>>2] = $75;
   $$sum17 = (($55) + 4)|0;
   $76 = (($4) + ($$sum17)|0);
   $77 = $76;
   $78 = HEAP32[$77>>2]|0;
   $79 = $78 | 1;
   HEAP32[$77>>2] = $79;
   $storemerge = 0;$storemerge21 = 0;
  }
  HEAP32[(((18176) + 8|0))>>2] = $storemerge21;
  HEAP32[(((18176) + 20|0))>>2] = $storemerge;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 $80 = $14 & 2;
 $81 = ($80|0)==(0);
 if (!($81)) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $82 = $14 & -8;
 $83 = (($82) + ($3))|0;
 $84 = ($83>>>0)<($nb>>>0);
 if ($84) {
  $newp$0 = 0;
  STACKTOP = sp;return ($newp$0|0);
 }
 $85 = (($83) - ($nb))|0;
 $86 = $14 >>> 3;
 $87 = ($14>>>0)<(256);
 L52: do {
  if ($87) {
   $$sum15 = (($3) + 8)|0;
   $88 = (($4) + ($$sum15)|0);
   $89 = $88;
   $90 = HEAP32[$89>>2]|0;
   $$sum16 = (($3) + 12)|0;
   $91 = (($4) + ($$sum16)|0);
   $92 = $91;
   $93 = HEAP32[$92>>2]|0;
   $94 = $86 << 1;
   $95 = (((18176) + ($94<<2)|0) + 40|0);
   $96 = $95;
   $97 = ($90|0)==($96|0);
   do {
    if (!($97)) {
     $98 = $90;
     $99 = ($98>>>0)<($7>>>0);
     if ($99) {
      _abort();
      // unreachable;
     }
     $100 = (($90) + 12|0);
     $101 = HEAP32[$100>>2]|0;
     $102 = ($101|0)==($6|0);
     if ($102) {
      break;
     }
     _abort();
     // unreachable;
    }
   } while(0);
   $103 = ($93|0)==($90|0);
   if ($103) {
    $104 = 1 << $86;
    $105 = $104 ^ -1;
    $106 = HEAP32[((18176))>>2]|0;
    $107 = $106 & $105;
    HEAP32[((18176))>>2] = $107;
    break;
   }
   $108 = ($93|0)==($96|0);
   do {
    if ($108) {
     $$pre = (($93) + 8|0);
     $$pre$phiZ2D = $$pre;
    } else {
     $109 = $93;
     $110 = ($109>>>0)<($7>>>0);
     if ($110) {
      _abort();
      // unreachable;
     }
     $111 = (($93) + 8|0);
     $112 = HEAP32[$111>>2]|0;
     $113 = ($112|0)==($6|0);
     if ($113) {
      $$pre$phiZ2D = $111;
      break;
     }
     _abort();
     // unreachable;
    }
   } while(0);
   $114 = (($90) + 12|0);
   HEAP32[$114>>2] = $93;
   HEAP32[$$pre$phiZ2D>>2] = $90;
  } else {
   $115 = $5;
   $$sum = (($3) + 24)|0;
   $116 = (($4) + ($$sum)|0);
   $117 = $116;
   $118 = HEAP32[$117>>2]|0;
   $$sum2 = (($3) + 12)|0;
   $119 = (($4) + ($$sum2)|0);
   $120 = $119;
   $121 = HEAP32[$120>>2]|0;
   $122 = ($121|0)==($115|0);
   do {
    if ($122) {
     $$sum4 = (($3) + 20)|0;
     $134 = (($4) + ($$sum4)|0);
     $135 = $134;
     $136 = HEAP32[$135>>2]|0;
     $137 = ($136|0)==(0|0);
     if ($137) {
      $$sum3 = (($3) + 16)|0;
      $138 = (($4) + ($$sum3)|0);
      $139 = $138;
      $140 = HEAP32[$139>>2]|0;
      $141 = ($140|0)==(0|0);
      if ($141) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $140;$RP$0 = $139;
      }
     } else {
      $R$0 = $136;$RP$0 = $135;
     }
     while(1) {
      $142 = (($R$0) + 20|0);
      $143 = HEAP32[$142>>2]|0;
      $144 = ($143|0)==(0|0);
      if (!($144)) {
       $RP$0$phi = $142;$R$0$phi = $143;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $145 = (($R$0) + 16|0);
      $146 = HEAP32[$145>>2]|0;
      $147 = ($146|0)==(0|0);
      if ($147) {
       break;
      } else {
       $R$0 = $146;$RP$0 = $145;
      }
     }
     $148 = $RP$0;
     $149 = ($148>>>0)<($7>>>0);
     if ($149) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum14 = (($3) + 8)|0;
     $123 = (($4) + ($$sum14)|0);
     $124 = $123;
     $125 = HEAP32[$124>>2]|0;
     $126 = $125;
     $127 = ($126>>>0)<($7>>>0);
     if ($127) {
      _abort();
      // unreachable;
     }
     $128 = (($125) + 12|0);
     $129 = HEAP32[$128>>2]|0;
     $130 = ($129|0)==($115|0);
     if (!($130)) {
      _abort();
      // unreachable;
     }
     $131 = (($121) + 8|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = ($132|0)==($115|0);
     if ($133) {
      HEAP32[$128>>2] = $121;
      HEAP32[$131>>2] = $125;
      $R$1 = $121;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $150 = ($118|0)==(0|0);
   if ($150) {
    break;
   }
   $$sum11 = (($3) + 28)|0;
   $151 = (($4) + ($$sum11)|0);
   $152 = $151;
   $153 = HEAP32[$152>>2]|0;
   $154 = (((18176) + ($153<<2)|0) + 304|0);
   $155 = HEAP32[$154>>2]|0;
   $156 = ($115|0)==($155|0);
   do {
    if ($156) {
     HEAP32[$154>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if (!($cond)) {
      break;
     }
     $157 = 1 << $153;
     $158 = $157 ^ -1;
     $159 = HEAP32[(((18176) + 4|0))>>2]|0;
     $160 = $159 & $158;
     HEAP32[(((18176) + 4|0))>>2] = $160;
     break L52;
    } else {
     $161 = $118;
     $162 = HEAP32[(((18176) + 16|0))>>2]|0;
     $163 = ($161>>>0)<($162>>>0);
     if ($163) {
      _abort();
      // unreachable;
     }
     $164 = (($118) + 16|0);
     $165 = HEAP32[$164>>2]|0;
     $166 = ($165|0)==($115|0);
     if ($166) {
      HEAP32[$164>>2] = $R$1;
     } else {
      $167 = (($118) + 20|0);
      HEAP32[$167>>2] = $R$1;
     }
     $168 = ($R$1|0)==(0|0);
     if ($168) {
      break L52;
     }
    }
   } while(0);
   $169 = $R$1;
   $170 = HEAP32[(((18176) + 16|0))>>2]|0;
   $171 = ($169>>>0)<($170>>>0);
   if ($171) {
    _abort();
    // unreachable;
   }
   $172 = (($R$1) + 24|0);
   HEAP32[$172>>2] = $118;
   $$sum12 = (($3) + 16)|0;
   $173 = (($4) + ($$sum12)|0);
   $174 = $173;
   $175 = HEAP32[$174>>2]|0;
   $176 = ($175|0)==(0|0);
   do {
    if (!($176)) {
     $177 = $175;
     $178 = HEAP32[(((18176) + 16|0))>>2]|0;
     $179 = ($177>>>0)<($178>>>0);
     if ($179) {
      _abort();
      // unreachable;
     } else {
      $180 = (($R$1) + 16|0);
      HEAP32[$180>>2] = $175;
      $181 = (($175) + 24|0);
      HEAP32[$181>>2] = $R$1;
      break;
     }
    }
   } while(0);
   $$sum13 = (($3) + 20)|0;
   $182 = (($4) + ($$sum13)|0);
   $183 = $182;
   $184 = HEAP32[$183>>2]|0;
   $185 = ($184|0)==(0|0);
   if ($185) {
    break;
   }
   $186 = $184;
   $187 = HEAP32[(((18176) + 16|0))>>2]|0;
   $188 = ($186>>>0)<($187>>>0);
   if ($188) {
    _abort();
    // unreachable;
   } else {
    $189 = (($R$1) + 20|0);
    HEAP32[$189>>2] = $184;
    $190 = (($184) + 24|0);
    HEAP32[$190>>2] = $R$1;
    break;
   }
  }
 } while(0);
 $191 = ($85>>>0)<(16);
 if ($191) {
  $192 = HEAP32[$1>>2]|0;
  $193 = $192 & 1;
  $194 = $83 | $193;
  $195 = $194 | 2;
  HEAP32[$1>>2] = $195;
  $$sum910 = $83 | 4;
  $196 = (($4) + ($$sum910)|0);
  $197 = $196;
  $198 = HEAP32[$197>>2]|0;
  $199 = $198 | 1;
  HEAP32[$197>>2] = $199;
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 } else {
  $200 = (($4) + ($nb)|0);
  $201 = $200;
  $202 = HEAP32[$1>>2]|0;
  $203 = $202 & 1;
  $204 = $203 | $nb;
  $205 = $204 | 2;
  HEAP32[$1>>2] = $205;
  $$sum5 = (($nb) + 4)|0;
  $206 = (($4) + ($$sum5)|0);
  $207 = $206;
  $208 = $85 | 3;
  HEAP32[$207>>2] = $208;
  $$sum78 = $83 | 4;
  $209 = (($4) + ($$sum78)|0);
  $210 = $209;
  $211 = HEAP32[$210>>2]|0;
  $212 = $211 | 1;
  HEAP32[$210>>2] = $212;
  _dispose_chunk($201,$85);
  $newp$0 = $p;
  STACKTOP = sp;return ($newp$0|0);
 }
 return 0|0;
}
function _dispose_chunk($p,$psize) {
 $p = $p|0;
 $psize = $psize|0;
 var $$0 = 0, $$02 = 0, $$1 = 0, $$c = 0, $$c8 = 0, $$pre = 0, $$pre$phi63Z2D = 0, $$pre$phi65Z2D = 0, $$pre$phiZ2D = 0, $$pre62 = 0, $$pre64 = 0, $$sum = 0, $$sum1 = 0, $$sum12$pre = 0, $$sum13 = 0, $$sum14 = 0, $$sum15 = 0, $$sum16 = 0, $$sum17 = 0, $$sum18 = 0;
 var $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0, $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum4 = 0, $$sum5 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0;
 var $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0;
 var $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0;
 var $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0;
 var $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0;
 var $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0;
 var $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0;
 var $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0;
 var $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0;
 var $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0;
 var $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0;
 var $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0;
 var $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0;
 var $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0;
 var $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0;
 var $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $38 = 0;
 var $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0;
 var $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0;
 var $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0;
 var $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I19$0 = 0, $I19$0$c = 0, $K20$049 = 0, $R$0 = 0, $R$0$phi = 0, $R$1 = 0, $R7$0 = 0, $R7$0$phi = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$phi = 0, $RP9$0 = 0;
 var $RP9$0$phi = 0, $T$0$c = 0, $T$0$c9 = 0, $T$0$lcssa = 0, $T$048 = 0, $T$048$phi = 0, $cond = 0, $cond46 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $1 = $p;
 $2 = (($1) + ($psize)|0);
 $3 = $2;
 $4 = (($p) + 4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 1;
 $7 = ($6|0)==(0);
 L1: do {
  if ($7) {
   $8 = ($p);
   $9 = HEAP32[$8>>2]|0;
   $10 = $5 & 3;
   $11 = ($10|0)==(0);
   if ($11) {
    STACKTOP = sp;return;
   }
   $12 = (0 - ($9))|0;
   $13 = (($1) + ($12)|0);
   $14 = $13;
   $15 = (($9) + ($psize))|0;
   $16 = HEAP32[(((18176) + 16|0))>>2]|0;
   $17 = ($13>>>0)<($16>>>0);
   if ($17) {
    _abort();
    // unreachable;
   }
   $18 = HEAP32[(((18176) + 20|0))>>2]|0;
   $19 = ($14|0)==($18|0);
   if ($19) {
    $$sum = (($psize) + 4)|0;
    $125 = (($1) + ($$sum)|0);
    $126 = $125;
    $127 = HEAP32[$126>>2]|0;
    $128 = $127 & 3;
    $129 = ($128|0)==(3);
    if (!($129)) {
     $$0 = $14;$$02 = $15;
     break;
    }
    HEAP32[(((18176) + 8|0))>>2] = $15;
    $130 = HEAP32[$126>>2]|0;
    $131 = $130 & -2;
    HEAP32[$126>>2] = $131;
    $132 = $15 | 1;
    $$sum20 = (4 - ($9))|0;
    $133 = (($1) + ($$sum20)|0);
    $134 = $133;
    HEAP32[$134>>2] = $132;
    $135 = $2;
    HEAP32[$135>>2] = $15;
    STACKTOP = sp;return;
   }
   $20 = $9 >>> 3;
   $21 = ($9>>>0)<(256);
   if ($21) {
    $$sum30 = (8 - ($9))|0;
    $22 = (($1) + ($$sum30)|0);
    $23 = $22;
    $24 = HEAP32[$23>>2]|0;
    $$sum31 = (12 - ($9))|0;
    $25 = (($1) + ($$sum31)|0);
    $26 = $25;
    $27 = HEAP32[$26>>2]|0;
    $28 = $20 << 1;
    $29 = (((18176) + ($28<<2)|0) + 40|0);
    $30 = $29;
    $31 = ($24|0)==($30|0);
    do {
     if (!($31)) {
      $32 = $24;
      $33 = ($32>>>0)<($16>>>0);
      if ($33) {
       _abort();
       // unreachable;
      }
      $34 = (($24) + 12|0);
      $35 = HEAP32[$34>>2]|0;
      $36 = ($35|0)==($14|0);
      if ($36) {
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $37 = ($27|0)==($24|0);
    if ($37) {
     $38 = 1 << $20;
     $39 = $38 ^ -1;
     $40 = HEAP32[((18176))>>2]|0;
     $41 = $40 & $39;
     HEAP32[((18176))>>2] = $41;
     $$0 = $14;$$02 = $15;
     break;
    }
    $42 = ($27|0)==($30|0);
    do {
     if ($42) {
      $$pre64 = (($27) + 8|0);
      $$pre$phi65Z2D = $$pre64;
     } else {
      $43 = $27;
      $44 = ($43>>>0)<($16>>>0);
      if ($44) {
       _abort();
       // unreachable;
      }
      $45 = (($27) + 8|0);
      $46 = HEAP32[$45>>2]|0;
      $47 = ($46|0)==($14|0);
      if ($47) {
       $$pre$phi65Z2D = $45;
       break;
      }
      _abort();
      // unreachable;
     }
    } while(0);
    $48 = (($24) + 12|0);
    HEAP32[$48>>2] = $27;
    HEAP32[$$pre$phi65Z2D>>2] = $24;
    $$0 = $14;$$02 = $15;
    break;
   }
   $49 = $13;
   $$sum22 = (24 - ($9))|0;
   $50 = (($1) + ($$sum22)|0);
   $51 = $50;
   $52 = HEAP32[$51>>2]|0;
   $$sum23 = (12 - ($9))|0;
   $53 = (($1) + ($$sum23)|0);
   $54 = $53;
   $55 = HEAP32[$54>>2]|0;
   $56 = ($55|0)==($49|0);
   do {
    if ($56) {
     $$sum24 = (16 - ($9))|0;
     $$sum25 = (($$sum24) + 4)|0;
     $68 = (($1) + ($$sum25)|0);
     $69 = $68;
     $70 = HEAP32[$69>>2]|0;
     $71 = ($70|0)==(0|0);
     if ($71) {
      $72 = (($1) + ($$sum24)|0);
      $73 = $72;
      $74 = HEAP32[$73>>2]|0;
      $75 = ($74|0)==(0|0);
      if ($75) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $74;$RP$0 = $73;
      }
     } else {
      $R$0 = $70;$RP$0 = $69;
     }
     while(1) {
      $76 = (($R$0) + 20|0);
      $77 = HEAP32[$76>>2]|0;
      $78 = ($77|0)==(0|0);
      if (!($78)) {
       $RP$0$phi = $76;$R$0$phi = $77;$RP$0 = $RP$0$phi;$R$0 = $R$0$phi;
       continue;
      }
      $79 = (($R$0) + 16|0);
      $80 = HEAP32[$79>>2]|0;
      $81 = ($80|0)==(0|0);
      if ($81) {
       break;
      } else {
       $R$0 = $80;$RP$0 = $79;
      }
     }
     $82 = $RP$0;
     $83 = ($82>>>0)<($16>>>0);
     if ($83) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0>>2] = 0;
      $R$1 = $R$0;
      break;
     }
    } else {
     $$sum29 = (8 - ($9))|0;
     $57 = (($1) + ($$sum29)|0);
     $58 = $57;
     $59 = HEAP32[$58>>2]|0;
     $60 = $59;
     $61 = ($60>>>0)<($16>>>0);
     if ($61) {
      _abort();
      // unreachable;
     }
     $62 = (($59) + 12|0);
     $63 = HEAP32[$62>>2]|0;
     $64 = ($63|0)==($49|0);
     if (!($64)) {
      _abort();
      // unreachable;
     }
     $65 = (($55) + 8|0);
     $66 = HEAP32[$65>>2]|0;
     $67 = ($66|0)==($49|0);
     if ($67) {
      HEAP32[$62>>2] = $55;
      HEAP32[$65>>2] = $59;
      $R$1 = $55;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $84 = ($52|0)==(0|0);
   if ($84) {
    $$0 = $14;$$02 = $15;
    break;
   }
   $$sum26 = (28 - ($9))|0;
   $85 = (($1) + ($$sum26)|0);
   $86 = $85;
   $87 = HEAP32[$86>>2]|0;
   $88 = (((18176) + ($87<<2)|0) + 304|0);
   $89 = HEAP32[$88>>2]|0;
   $90 = ($49|0)==($89|0);
   do {
    if ($90) {
     HEAP32[$88>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if (!($cond)) {
      break;
     }
     $91 = 1 << $87;
     $92 = $91 ^ -1;
     $93 = HEAP32[(((18176) + 4|0))>>2]|0;
     $94 = $93 & $92;
     HEAP32[(((18176) + 4|0))>>2] = $94;
     $$0 = $14;$$02 = $15;
     break L1;
    } else {
     $95 = $52;
     $96 = HEAP32[(((18176) + 16|0))>>2]|0;
     $97 = ($95>>>0)<($96>>>0);
     if ($97) {
      _abort();
      // unreachable;
     }
     $98 = (($52) + 16|0);
     $99 = HEAP32[$98>>2]|0;
     $100 = ($99|0)==($49|0);
     if ($100) {
      HEAP32[$98>>2] = $R$1;
     } else {
      $101 = (($52) + 20|0);
      HEAP32[$101>>2] = $R$1;
     }
     $102 = ($R$1|0)==(0|0);
     if ($102) {
      $$0 = $14;$$02 = $15;
      break L1;
     }
    }
   } while(0);
   $103 = $R$1;
   $104 = HEAP32[(((18176) + 16|0))>>2]|0;
   $105 = ($103>>>0)<($104>>>0);
   if ($105) {
    _abort();
    // unreachable;
   }
   $106 = (($R$1) + 24|0);
   HEAP32[$106>>2] = $52;
   $$sum27 = (16 - ($9))|0;
   $107 = (($1) + ($$sum27)|0);
   $108 = $107;
   $109 = HEAP32[$108>>2]|0;
   $110 = ($109|0)==(0|0);
   do {
    if (!($110)) {
     $111 = $109;
     $112 = HEAP32[(((18176) + 16|0))>>2]|0;
     $113 = ($111>>>0)<($112>>>0);
     if ($113) {
      _abort();
      // unreachable;
     } else {
      $114 = (($R$1) + 16|0);
      HEAP32[$114>>2] = $109;
      $115 = (($109) + 24|0);
      HEAP32[$115>>2] = $R$1;
      break;
     }
    }
   } while(0);
   $$sum28 = (($$sum27) + 4)|0;
   $116 = (($1) + ($$sum28)|0);
   $117 = $116;
   $118 = HEAP32[$117>>2]|0;
   $119 = ($118|0)==(0|0);
   if ($119) {
    $$0 = $14;$$02 = $15;
    break;
   }
   $120 = $118;
   $121 = HEAP32[(((18176) + 16|0))>>2]|0;
   $122 = ($120>>>0)<($121>>>0);
   if ($122) {
    _abort();
    // unreachable;
   } else {
    $123 = (($R$1) + 20|0);
    HEAP32[$123>>2] = $118;
    $124 = (($118) + 24|0);
    HEAP32[$124>>2] = $R$1;
    $$0 = $14;$$02 = $15;
    break;
   }
  } else {
   $$0 = $p;$$02 = $psize;
  }
 } while(0);
 $136 = HEAP32[(((18176) + 16|0))>>2]|0;
 $137 = ($2>>>0)<($136>>>0);
 if ($137) {
  _abort();
  // unreachable;
 }
 $$sum1 = (($psize) + 4)|0;
 $138 = (($1) + ($$sum1)|0);
 $139 = $138;
 $140 = HEAP32[$139>>2]|0;
 $141 = $140 & 2;
 $142 = ($141|0)==(0);
 do {
  if ($142) {
   $143 = HEAP32[(((18176) + 24|0))>>2]|0;
   $144 = ($3|0)==($143|0);
   if ($144) {
    $145 = HEAP32[(((18176) + 12|0))>>2]|0;
    $146 = (($145) + ($$02))|0;
    HEAP32[(((18176) + 12|0))>>2] = $146;
    HEAP32[(((18176) + 24|0))>>2] = $$0;
    $147 = $146 | 1;
    $148 = (($$0) + 4|0);
    HEAP32[$148>>2] = $147;
    $149 = HEAP32[(((18176) + 20|0))>>2]|0;
    $150 = ($$0|0)==($149|0);
    if (!($150)) {
     STACKTOP = sp;return;
    }
    HEAP32[(((18176) + 20|0))>>2] = 0;
    HEAP32[(((18176) + 8|0))>>2] = 0;
    STACKTOP = sp;return;
   }
   $151 = HEAP32[(((18176) + 20|0))>>2]|0;
   $152 = ($3|0)==($151|0);
   if ($152) {
    $153 = HEAP32[(((18176) + 8|0))>>2]|0;
    $154 = (($153) + ($$02))|0;
    HEAP32[(((18176) + 8|0))>>2] = $154;
    HEAP32[(((18176) + 20|0))>>2] = $$0;
    $155 = $154 | 1;
    $156 = (($$0) + 4|0);
    HEAP32[$156>>2] = $155;
    $157 = $$0;
    $158 = (($157) + ($154)|0);
    $159 = $158;
    HEAP32[$159>>2] = $154;
    STACKTOP = sp;return;
   }
   $160 = $140 & -8;
   $161 = (($160) + ($$02))|0;
   $162 = $140 >>> 3;
   $163 = ($140>>>0)<(256);
   L100: do {
    if ($163) {
     $$sum18 = (($psize) + 8)|0;
     $164 = (($1) + ($$sum18)|0);
     $165 = $164;
     $166 = HEAP32[$165>>2]|0;
     $$sum19 = (($psize) + 12)|0;
     $167 = (($1) + ($$sum19)|0);
     $168 = $167;
     $169 = HEAP32[$168>>2]|0;
     $170 = $162 << 1;
     $171 = (((18176) + ($170<<2)|0) + 40|0);
     $172 = $171;
     $173 = ($166|0)==($172|0);
     do {
      if (!($173)) {
       $174 = $166;
       $175 = ($174>>>0)<($136>>>0);
       if ($175) {
        _abort();
        // unreachable;
       }
       $176 = (($166) + 12|0);
       $177 = HEAP32[$176>>2]|0;
       $178 = ($177|0)==($3|0);
       if ($178) {
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $179 = ($169|0)==($166|0);
     if ($179) {
      $180 = 1 << $162;
      $181 = $180 ^ -1;
      $182 = HEAP32[((18176))>>2]|0;
      $183 = $182 & $181;
      HEAP32[((18176))>>2] = $183;
      break;
     }
     $184 = ($169|0)==($172|0);
     do {
      if ($184) {
       $$pre62 = (($169) + 8|0);
       $$pre$phi63Z2D = $$pre62;
      } else {
       $185 = $169;
       $186 = ($185>>>0)<($136>>>0);
       if ($186) {
        _abort();
        // unreachable;
       }
       $187 = (($169) + 8|0);
       $188 = HEAP32[$187>>2]|0;
       $189 = ($188|0)==($3|0);
       if ($189) {
        $$pre$phi63Z2D = $187;
        break;
       }
       _abort();
       // unreachable;
      }
     } while(0);
     $190 = (($166) + 12|0);
     HEAP32[$190>>2] = $169;
     HEAP32[$$pre$phi63Z2D>>2] = $166;
    } else {
     $191 = $2;
     $$sum2 = (($psize) + 24)|0;
     $192 = (($1) + ($$sum2)|0);
     $193 = $192;
     $194 = HEAP32[$193>>2]|0;
     $$sum3 = (($psize) + 12)|0;
     $195 = (($1) + ($$sum3)|0);
     $196 = $195;
     $197 = HEAP32[$196>>2]|0;
     $198 = ($197|0)==($191|0);
     do {
      if ($198) {
       $$sum5 = (($psize) + 20)|0;
       $210 = (($1) + ($$sum5)|0);
       $211 = $210;
       $212 = HEAP32[$211>>2]|0;
       $213 = ($212|0)==(0|0);
       if ($213) {
        $$sum4 = (($psize) + 16)|0;
        $214 = (($1) + ($$sum4)|0);
        $215 = $214;
        $216 = HEAP32[$215>>2]|0;
        $217 = ($216|0)==(0|0);
        if ($217) {
         $R7$1 = 0;
         break;
        } else {
         $R7$0 = $216;$RP9$0 = $215;
        }
       } else {
        $R7$0 = $212;$RP9$0 = $211;
       }
       while(1) {
        $218 = (($R7$0) + 20|0);
        $219 = HEAP32[$218>>2]|0;
        $220 = ($219|0)==(0|0);
        if (!($220)) {
         $RP9$0$phi = $218;$R7$0$phi = $219;$RP9$0 = $RP9$0$phi;$R7$0 = $R7$0$phi;
         continue;
        }
        $221 = (($R7$0) + 16|0);
        $222 = HEAP32[$221>>2]|0;
        $223 = ($222|0)==(0|0);
        if ($223) {
         break;
        } else {
         $R7$0 = $222;$RP9$0 = $221;
        }
       }
       $224 = $RP9$0;
       $225 = ($224>>>0)<($136>>>0);
       if ($225) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP9$0>>2] = 0;
        $R7$1 = $R7$0;
        break;
       }
      } else {
       $$sum17 = (($psize) + 8)|0;
       $199 = (($1) + ($$sum17)|0);
       $200 = $199;
       $201 = HEAP32[$200>>2]|0;
       $202 = $201;
       $203 = ($202>>>0)<($136>>>0);
       if ($203) {
        _abort();
        // unreachable;
       }
       $204 = (($201) + 12|0);
       $205 = HEAP32[$204>>2]|0;
       $206 = ($205|0)==($191|0);
       if (!($206)) {
        _abort();
        // unreachable;
       }
       $207 = (($197) + 8|0);
       $208 = HEAP32[$207>>2]|0;
       $209 = ($208|0)==($191|0);
       if ($209) {
        HEAP32[$204>>2] = $197;
        HEAP32[$207>>2] = $201;
        $R7$1 = $197;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $226 = ($194|0)==(0|0);
     if ($226) {
      break;
     }
     $$sum14 = (($psize) + 28)|0;
     $227 = (($1) + ($$sum14)|0);
     $228 = $227;
     $229 = HEAP32[$228>>2]|0;
     $230 = (((18176) + ($229<<2)|0) + 304|0);
     $231 = HEAP32[$230>>2]|0;
     $232 = ($191|0)==($231|0);
     do {
      if ($232) {
       HEAP32[$230>>2] = $R7$1;
       $cond46 = ($R7$1|0)==(0|0);
       if (!($cond46)) {
        break;
       }
       $233 = 1 << $229;
       $234 = $233 ^ -1;
       $235 = HEAP32[(((18176) + 4|0))>>2]|0;
       $236 = $235 & $234;
       HEAP32[(((18176) + 4|0))>>2] = $236;
       break L100;
      } else {
       $237 = $194;
       $238 = HEAP32[(((18176) + 16|0))>>2]|0;
       $239 = ($237>>>0)<($238>>>0);
       if ($239) {
        _abort();
        // unreachable;
       }
       $240 = (($194) + 16|0);
       $241 = HEAP32[$240>>2]|0;
       $242 = ($241|0)==($191|0);
       if ($242) {
        HEAP32[$240>>2] = $R7$1;
       } else {
        $243 = (($194) + 20|0);
        HEAP32[$243>>2] = $R7$1;
       }
       $244 = ($R7$1|0)==(0|0);
       if ($244) {
        break L100;
       }
      }
     } while(0);
     $245 = $R7$1;
     $246 = HEAP32[(((18176) + 16|0))>>2]|0;
     $247 = ($245>>>0)<($246>>>0);
     if ($247) {
      _abort();
      // unreachable;
     }
     $248 = (($R7$1) + 24|0);
     HEAP32[$248>>2] = $194;
     $$sum15 = (($psize) + 16)|0;
     $249 = (($1) + ($$sum15)|0);
     $250 = $249;
     $251 = HEAP32[$250>>2]|0;
     $252 = ($251|0)==(0|0);
     do {
      if (!($252)) {
       $253 = $251;
       $254 = HEAP32[(((18176) + 16|0))>>2]|0;
       $255 = ($253>>>0)<($254>>>0);
       if ($255) {
        _abort();
        // unreachable;
       } else {
        $256 = (($R7$1) + 16|0);
        HEAP32[$256>>2] = $251;
        $257 = (($251) + 24|0);
        HEAP32[$257>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum16 = (($psize) + 20)|0;
     $258 = (($1) + ($$sum16)|0);
     $259 = $258;
     $260 = HEAP32[$259>>2]|0;
     $261 = ($260|0)==(0|0);
     if ($261) {
      break;
     }
     $262 = $260;
     $263 = HEAP32[(((18176) + 16|0))>>2]|0;
     $264 = ($262>>>0)<($263>>>0);
     if ($264) {
      _abort();
      // unreachable;
     } else {
      $265 = (($R7$1) + 20|0);
      HEAP32[$265>>2] = $260;
      $266 = (($260) + 24|0);
      HEAP32[$266>>2] = $R7$1;
      break;
     }
    }
   } while(0);
   $267 = $161 | 1;
   $268 = (($$0) + 4|0);
   HEAP32[$268>>2] = $267;
   $269 = $$0;
   $270 = (($269) + ($161)|0);
   $271 = $270;
   HEAP32[$271>>2] = $161;
   $272 = HEAP32[(((18176) + 20|0))>>2]|0;
   $273 = ($$0|0)==($272|0);
   if (!($273)) {
    $$1 = $161;
    break;
   }
   HEAP32[(((18176) + 8|0))>>2] = $161;
   STACKTOP = sp;return;
  } else {
   $274 = $140 & -2;
   HEAP32[$139>>2] = $274;
   $275 = $$02 | 1;
   $276 = (($$0) + 4|0);
   HEAP32[$276>>2] = $275;
   $277 = $$0;
   $278 = (($277) + ($$02)|0);
   $279 = $278;
   HEAP32[$279>>2] = $$02;
   $$1 = $$02;
  }
 } while(0);
 $280 = $$1 >>> 3;
 $281 = ($$1>>>0)<(256);
 if ($281) {
  $282 = $280 << 1;
  $283 = (((18176) + ($282<<2)|0) + 40|0);
  $284 = $283;
  $285 = HEAP32[((18176))>>2]|0;
  $286 = 1 << $280;
  $287 = $285 & $286;
  $288 = ($287|0)==(0);
  do {
   if ($288) {
    $289 = $285 | $286;
    HEAP32[((18176))>>2] = $289;
    $$sum12$pre = (($282) + 2)|0;
    $$pre = (((18176) + ($$sum12$pre<<2)|0) + 40|0);
    $$pre$phiZ2D = $$pre;$F16$0 = $284;
   } else {
    $$sum13 = (($282) + 2)|0;
    $290 = (((18176) + ($$sum13<<2)|0) + 40|0);
    $291 = HEAP32[$290>>2]|0;
    $292 = $291;
    $293 = HEAP32[(((18176) + 16|0))>>2]|0;
    $294 = ($292>>>0)<($293>>>0);
    if (!($294)) {
     $$pre$phiZ2D = $290;$F16$0 = $291;
     break;
    }
    _abort();
    // unreachable;
   }
  } while(0);
  HEAP32[$$pre$phiZ2D>>2] = $$0;
  $295 = (($F16$0) + 12|0);
  HEAP32[$295>>2] = $$0;
  $296 = (($$0) + 8|0);
  HEAP32[$296>>2] = $F16$0;
  $297 = (($$0) + 12|0);
  HEAP32[$297>>2] = $284;
  STACKTOP = sp;return;
 }
 $298 = $$0;
 $299 = $$1 >>> 8;
 $300 = ($299|0)==(0);
 do {
  if ($300) {
   $I19$0 = 0;
  } else {
   $301 = ($$1>>>0)>(16777215);
   if ($301) {
    $I19$0 = 31;
    break;
   }
   $302 = (($299) + 1048320)|0;
   $303 = $302 >>> 16;
   $304 = $303 & 8;
   $305 = $299 << $304;
   $306 = (($305) + 520192)|0;
   $307 = $306 >>> 16;
   $308 = $307 & 4;
   $309 = $308 | $304;
   $310 = $305 << $308;
   $311 = (($310) + 245760)|0;
   $312 = $311 >>> 16;
   $313 = $312 & 2;
   $314 = $309 | $313;
   $315 = (14 - ($314))|0;
   $316 = $310 << $313;
   $317 = $316 >>> 15;
   $318 = (($315) + ($317))|0;
   $319 = $318 << 1;
   $320 = (($318) + 7)|0;
   $321 = $$1 >>> $320;
   $322 = $321 & 1;
   $323 = $322 | $319;
   $I19$0 = $323;
  }
 } while(0);
 $324 = (((18176) + ($I19$0<<2)|0) + 304|0);
 $325 = (($$0) + 28|0);
 $I19$0$c = $I19$0;
 HEAP32[$325>>2] = $I19$0$c;
 $326 = (($$0) + 20|0);
 HEAP32[$326>>2] = 0;
 $327 = (($$0) + 16|0);
 HEAP32[$327>>2] = 0;
 $328 = HEAP32[(((18176) + 4|0))>>2]|0;
 $329 = 1 << $I19$0;
 $330 = $328 & $329;
 $331 = ($330|0)==(0);
 if ($331) {
  $332 = $328 | $329;
  HEAP32[(((18176) + 4|0))>>2] = $332;
  HEAP32[$324>>2] = $298;
  $333 = (($$0) + 24|0);
  $$c = $324;
  HEAP32[$333>>2] = $$c;
  $334 = (($$0) + 12|0);
  HEAP32[$334>>2] = $$0;
  $335 = (($$0) + 8|0);
  HEAP32[$335>>2] = $$0;
  STACKTOP = sp;return;
 }
 $336 = HEAP32[$324>>2]|0;
 $337 = ($I19$0|0)==(31);
 if ($337) {
  $340 = 0;
 } else {
  $338 = $I19$0 >>> 1;
  $339 = (25 - ($338))|0;
  $340 = $339;
 }
 $341 = (($336) + 4|0);
 $342 = HEAP32[$341>>2]|0;
 $343 = $342 & -8;
 $344 = ($343|0)==($$1|0);
 L194: do {
  if ($344) {
   $T$0$lcssa = $336;
  } else {
   $345 = $$1 << $340;
   $K20$049 = $345;$T$048 = $336;
   while(1) {
    $351 = $K20$049 >>> 31;
    $352 = ((($T$048) + ($351<<2)|0) + 16|0);
    $353 = HEAP32[$352>>2]|0;
    $354 = ($353|0)==(0|0);
    if ($354) {
     break;
    }
    $346 = $K20$049 << 1;
    $347 = (($353) + 4|0);
    $348 = HEAP32[$347>>2]|0;
    $349 = $348 & -8;
    $350 = ($349|0)==($$1|0);
    if ($350) {
     $T$0$lcssa = $353;
     break L194;
    } else {
     $T$048$phi = $353;$K20$049 = $346;$T$048 = $T$048$phi;
    }
   }
   $355 = $352;
   $356 = HEAP32[(((18176) + 16|0))>>2]|0;
   $357 = ($355>>>0)<($356>>>0);
   if ($357) {
    _abort();
    // unreachable;
   }
   HEAP32[$352>>2] = $298;
   $358 = (($$0) + 24|0);
   $T$0$c9 = $T$048;
   HEAP32[$358>>2] = $T$0$c9;
   $359 = (($$0) + 12|0);
   HEAP32[$359>>2] = $$0;
   $360 = (($$0) + 8|0);
   HEAP32[$360>>2] = $$0;
   STACKTOP = sp;return;
  }
 } while(0);
 $361 = (($T$0$lcssa) + 8|0);
 $362 = HEAP32[$361>>2]|0;
 $363 = $T$0$lcssa;
 $364 = HEAP32[(((18176) + 16|0))>>2]|0;
 $365 = ($363>>>0)<($364>>>0);
 if ($365) {
  _abort();
  // unreachable;
 }
 $366 = $362;
 $367 = ($366>>>0)<($364>>>0);
 if ($367) {
  _abort();
  // unreachable;
 }
 $368 = (($362) + 12|0);
 HEAP32[$368>>2] = $298;
 HEAP32[$361>>2] = $298;
 $369 = (($$0) + 8|0);
 $$c8 = $362;
 HEAP32[$369>>2] = $$c8;
 $370 = (($$0) + 12|0);
 $T$0$c = $T$0$lcssa;
 HEAP32[$370>>2] = $T$0$c;
 $371 = (($$0) + 24|0);
 HEAP32[$371>>2] = 0;
 STACKTOP = sp;return;
}
function runPostSets() {
 
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[(ptr)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[(ptr)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[(dest)]=((HEAP8[(src)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _memmove(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
      // Unlikely case: Copy backwards in a safe manner
      ret = dest;
      src = (src + num)|0;
      dest = (dest + num)|0;
      while ((num|0) > 0) {
        dest = (dest - 1)|0;
        src = (src - 1)|0;
        num = (num - 1)|0;
        HEAP8[(dest)]=((HEAP8[(src)])|0);
      }
      dest = ret;
    } else {
      _memcpy(dest, src, num) | 0;
    }
    return dest | 0;
}
function _strlen(ptr) {
    ptr = ptr|0;
    var curr = 0;
    curr = ptr;
    while (((HEAP8[(curr)])|0)) {
      curr = (curr + 1)|0;
    }
    return (curr - ptr)|0;
}

// EMSCRIPTEN_END_FUNCS

  
  function dynCall_iiii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    return FUNCTION_TABLE_iiii[index&1](a1|0,a2|0,a3|0)|0;
  }


  function dynCall_vi(index,a1) {
    index = index|0;
    a1=a1|0;
    FUNCTION_TABLE_vi[index&7](a1|0);
  }


  function dynCall_vii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    FUNCTION_TABLE_vii[index&15](a1|0,a2|0);
  }


  function dynCall_ii(index,a1) {
    index = index|0;
    a1=a1|0;
    return FUNCTION_TABLE_ii[index&1](a1|0)|0;
  }


  function dynCall_viii(index,a1,a2,a3) {
    index = index|0;
    a1=a1|0; a2=a2|0; a3=a3|0;
    FUNCTION_TABLE_viii[index&31](a1|0,a2|0,a3|0);
  }


  function dynCall_v(index) {
    index = index|0;
    
    FUNCTION_TABLE_v[index&31]();
  }


  function dynCall_iii(index,a1,a2) {
    index = index|0;
    a1=a1|0; a2=a2|0;
    return FUNCTION_TABLE_iii[index&1](a1|0,a2|0)|0;
  }

function b0(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(0);return 0; }
  function b1(p0) { p0 = p0|0; nullFunc_vi(1); }
  function b2(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_vii(2); }
  function b3(p0) { p0 = p0|0; nullFunc_ii(3);return 0; }
  function b4(p0,p1,p2) { p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(4); }
  function b5() { ; nullFunc_v(5); }
  function b6(p0,p1) { p0 = p0|0;p1 = p1|0; nullFunc_iii(6);return 0; }
  // EMSCRIPTEN_END_FUNCS
  var FUNCTION_TABLE_iiii = [b0,__ascii_initWeb];
  var FUNCTION_TABLE_vi = [b1,__ascii_runWeb,__ascii_quitWeb,__ascii_signalQuitWeb,_tickHandler,_quitHandler,b1,b1];
  var FUNCTION_TABLE_vii = [b2,__ascii_eventChangedWeb,_encyclopedia_mouseMoveHandler,_fightGameScreen_mouseMoveHandler,_fightLost_mouseMoveHandler,_fightPre_mouseMoveHandler,_fightWon_mouseMoveHandler,_mainMenu_mouseMoveHandler,_messageBox_mouseMoveHandler,_overGame_mouseMoveHandler,_shop_mouseMoveHandler,__ascii_glfwKeyHandler,_mouseMoveHandler,b2,b2,b2];
  var FUNCTION_TABLE_ii = [b3,__ascii_flipWeb];
  var FUNCTION_TABLE_viii = [b4,_encyclopedia_keyHandler,_encyclopedia_mouseKeyHandler,_fightGameScreen_keyHandler,_fightGameScreen_mouseKeyHandler,_fightLost_keyHandler,_fightLost_mouseKeyHandler,_fightPre_keyHandler,_fightPre_mouseKeyHandler,_fightWon_keyHandler,_fightWon_mouseKeyHandler,_mainMenu_keyHandler,_mainMenu_mouseKeyHandler,_messageBox_keyHandler,_messageBox_mouseKeyHandler,_overGame_keyHandler,_overGame_mouseKeyHandler,_shop_keyHandler,_shop_mouseKeyHandler,_keyHandler,_mouseKeyHandler,b4,b4,b4,b4,b4,b4,b4,b4
  ,b4,b4,b4];
  var FUNCTION_TABLE_v = [b5,_encyclopedia_init,_encyclopedia_update,_encyclopedia_render,_fightGameScreen_init,_fightGameScreen_update,_fightGameScreen_render,_fightLost_init,_fightLost_update,_fightLost_render,_fightPre_init,_fightPre_update,_fightPre_render,_fightWon_init,_fightWon_update,_fightWon_render,_mainMenu_init,_mainMenu_update,_mainMenu_render,_messageBox_init,_messageBox_update,_messageBox_render,_overGame_init,_overGame_update,_overGame_render,_shop_init,_shop_update,_shop_render,b5
  ,b5,b5,b5];
  var FUNCTION_TABLE_iii = [b6,__ascii_setTimeoutWeb];

  return { __onjs_fireMouseKey: __onjs_fireMouseKey, _free: _free, _main: _main, _realloc: _realloc, _memmove: _memmove, __onjs_fireTimeout: __onjs_fireTimeout, _strlen: _strlen, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, __onjs_fireMouseMove: __onjs_fireMouseMove, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, setThrew: setThrew, setTempRet0: setTempRet0, setTempRet1: setTempRet1, setTempRet2: setTempRet2, setTempRet3: setTempRet3, setTempRet4: setTempRet4, setTempRet5: setTempRet5, setTempRet6: setTempRet6, setTempRet7: setTempRet7, setTempRet8: setTempRet8, setTempRet9: setTempRet9, dynCall_iiii: dynCall_iiii, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_ii: dynCall_ii, dynCall_viii: dynCall_viii, dynCall_v: dynCall_v, dynCall_iii: dynCall_iii };
})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "nullFunc_iiii": nullFunc_iiii, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_ii": nullFunc_ii, "nullFunc_viii": nullFunc_viii, "nullFunc_v": nullFunc_v, "nullFunc_iii": nullFunc_iii, "invoke_iiii": invoke_iiii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "_llvm_lifetime_start": _llvm_lifetime_start, "_glfwInit": _glfwInit, "__reallyNegative": __reallyNegative, "_SDL_GetTicks": _SDL_GetTicks, "_js_ascii_changeConsoleText": _js_ascii_changeConsoleText, "_fflush": _fflush, "___setErrNo": ___setErrNo, "_sbrk": _sbrk, "_snprintf": _snprintf, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_srand": _srand, "_llvm_lifetime_end": _llvm_lifetime_end, "_sprintf": _sprintf, "_toupper": _toupper, "___errno_location": ___errno_location, "_js_ascii_onMouseMoveEvent": _js_ascii_onMouseMoveEvent, "_js_ascii_toggleEvents": _js_ascii_toggleEvents, "_glfwSetKeyCallback": _glfwSetKeyCallback, "_abort": _abort, "_js_ascii_onMouseKeyEvent": _js_ascii_onMouseKeyEvent, "_time": _time, "__formatString": __formatString, "_js_ascii_setTimeout": _js_ascii_setTimeout, "_js_ascii_setConsoleSize": _js_ascii_setConsoleSize, "_js_ascii_changeConsoleColors": _js_ascii_changeConsoleColors, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var __onjs_fireMouseKey = Module["__onjs_fireMouseKey"] = asm["__onjs_fireMouseKey"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var __onjs_fireTimeout = Module["__onjs_fireTimeout"] = asm["__onjs_fireTimeout"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var __onjs_fireMouseMove = Module["__onjs_fireMouseMove"] = asm["__onjs_fireMouseMove"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



