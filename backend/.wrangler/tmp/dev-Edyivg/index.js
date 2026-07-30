var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-e61MTd/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-e61MTd/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// ../node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");

// ../node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// ../node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = /* @__PURE__ */ __name((input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}, "encodeBase64");
var encode = /* @__PURE__ */ __name((input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}, "encode");
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// ../node_modules/jose/dist/browser/util/errors.js
var JOSEError = class extends Error {
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
__name(JOSEError, "JOSEError");
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
__name(JWTClaimValidationFailed, "JWTClaimValidationFailed");
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
__name(JWTExpired, "JWTExpired");
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
__name(JOSEAlgNotAllowed, "JOSEAlgNotAllowed");
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
__name(JOSENotSupported, "JOSENotSupported");
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
__name(JWEDecryptionFailed, "JWEDecryptionFailed");
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
__name(JWEInvalid, "JWEInvalid");
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
__name(JWSInvalid, "JWSInvalid");
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
__name(JWTInvalid, "JWTInvalid");
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
__name(JWKInvalid, "JWKInvalid");
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
__name(JWKSInvalid, "JWKSInvalid");
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
__name(JWKSNoMatchingKey, "JWKSNoMatchingKey");
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
__name(JWKSMultipleMatchingKeys, "JWKSMultipleMatchingKeys");
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
__name(JWKSTimeout, "JWKSTimeout");
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
__name(JWSSignatureVerificationFailed, "JWSSignatureVerificationFailed");
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// ../node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg2) {
  switch (alg2) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg2, ...usages) {
  switch (alg2) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg2.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg2.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg2.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg2);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// ../node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
}, "default");
function withAlg(alg2, actual, ...types2) {
  return message(`Key for the ${alg2} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");

// ../node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "default");
var types = ["CryptoKey"];

// ../node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;

// ../node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");

// ../node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default = /* @__PURE__ */ __name((alg2, key) => {
  if (alg2.startsWith("RS") || alg2.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg2} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// ../node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// ../node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;

// ../node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg2, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg2]) {
    return cached[alg2];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg: alg2 });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg2]: cryptoKey });
  } else {
    cached[alg2] = cryptoKey;
  }
  return cryptoKey;
}, "importAndCache");
var normalizePublicKey = /* @__PURE__ */ __name((key, alg2) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg2);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg2, true);
    return cryptoKey;
  }
  return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg2) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg2);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg2, true);
    return cryptoKey;
  }
  return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// ../node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg2) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg2 || (alg2 = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg: alg2 });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
__name(importJWK, "importJWK");

// ../node_modules/jose/dist/browser/lib/check_key_type.js
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg2, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg2) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg2}`);
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg2, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg2, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg2, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg2, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg2, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg2, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg2, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
}, "asymmetricTypeCheck");
function checkKeyType(allowJwk, alg2, key, usage) {
  const symmetric = alg2.startsWith("HS") || alg2 === "dir" || alg2.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg2);
  if (symmetric) {
    symmetricTypeCheck(alg2, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg2, key, usage, allowJwk);
  }
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// ../node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;

// ../node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;

// ../node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg2, algorithm) {
  const hash = `SHA-${alg2.slice(-3)}`;
  switch (alg2) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg2.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg2} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleDsa, "subtleDsa");

// ../node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg2, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg2);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg2);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg2, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg2.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg2.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
__name(getCryptoKey, "getCryptoKey");

// ../node_modules/jose/dist/browser/runtime/verify.js
var verify = /* @__PURE__ */ __name(async (alg2, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg2, key, "verify");
  check_key_length_default(alg2, cryptoKey);
  const algorithm = subtleDsa(alg2, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}, "verify");
var verify_default = verify;

// ../node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg: alg2 } = joseHeader;
  if (typeof alg2 !== "string" || !alg2) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg2)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg2, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg2);
    }
  } else {
    checkKeyTypeWithJwk(alg2, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg2, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// ../node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// ../node_modules/jose/dist/browser/lib/epoch.js
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// ../node_modules/jose/dist/browser/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// ../node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}, "default");

// ../node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// ../node_modules/jose/dist/browser/runtime/sign.js
var sign = /* @__PURE__ */ __name(async (alg2, key, data) => {
  const cryptoKey = await getCryptoKey(alg2, key, "sign");
  check_key_length_default(alg2, cryptoKey);
  const signature = await webcrypto_default.subtle.sign(subtleDsa(alg2, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}, "sign");
var sign_default = sign;

// ../node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign = class {
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this._payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this._protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg: alg2 } = joseHeader;
    if (typeof alg2 !== "string" || !alg2) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyTypeWithJwk(alg2, key, "sign");
    let payload = this._payload;
    if (b64) {
      payload = encoder.encode(encode(payload));
    }
    let protectedHeader;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const signature = await sign_default(alg2, key, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this._unprotectedHeader) {
      jws.header = this._unprotectedHeader;
    }
    if (this._protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
};
__name(FlattenedSign, "FlattenedSign");

// ../node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign = class {
  constructor(payload) {
    this._flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this._flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};
__name(CompactSign, "CompactSign");

// ../node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var ProduceJWT = class {
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};
__name(ProduceJWT, "ProduceJWT");

// ../node_modules/jose/dist/browser/jwt/sign.js
var SignJWT = class extends ProduceJWT {
  setProtectedHeader(protectedHeader) {
    this._protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
    sig.setProtectedHeader(this._protectedHeader);
    if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};
__name(SignJWT, "SignJWT");

// src/auth.js
var alg = "HS256";
async function createJWT(payload, secret) {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload).setProtectedHeader({ alg }).setIssuedAt().setExpirationTime("24h").sign(secretKey);
}
__name(createJWT, "createJWT");
async function verifyJWT(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}
__name(verifyJWT, "verifyJWT");
async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 1e5,
      hash: "SHA-256"
    },
    baseKey,
    256
    // 32 bytes
  );
  const hashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2_sha256$100000$${saltHex}$${hashHex}`;
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, storedHash) {
  if (!password || !storedHash)
    return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha256") {
    return false;
  }
  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const originalHashHex = parts[3];
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    baseKey,
    256
  );
  const verifyHashHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return verifyHashHex === originalHashHex;
}
__name(verifyPassword, "verifyPassword");
async function authMiddleware(request, env) {
  const authHeader = request.headers.get("Authorization");
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const tokenCookie = cookieHeader.split(";").find((c) => c.trim().startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.split("=")[1].trim();
      }
    }
  }
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  request.user = payload;
  return null;
}
__name(authMiddleware, "authMiddleware");

// src/db.js
var Database = class {
  constructor(d1) {
    if (!d1) {
      throw new Error("D1 binding is required. Check wrangler.toml.");
    }
    this.d1 = d1;
  }
  async query(sql, params = []) {
    return this.d1.prepare(sql).bind(...params).all();
  }
  async get(sql, params = []) {
    return this.d1.prepare(sql).bind(...params).first();
  }
  async run(sql, params = []) {
    return this.d1.prepare(sql).bind(...params).run();
  }
  async batch(statements) {
    return this.d1.batch(statements);
  }
  // Helper for generating UUID in JS if needed (or we can use standard crypto.randomUUID() which is built-in)
  generateUUID() {
    return crypto.randomUUID();
  }
};
__name(Database, "Database");

// src/routes/auth.js
async function handleAuthRoutes(request, env, url) {
  const db = new Database(env.DB);
  const path = url.pathname;
  if (request.method === "POST" && path === "/api/auth/setup") {
    try {
      const existingUser = await db.get("SELECT id FROM users LIMIT 1");
      if (existingUser) {
        return new Response(JSON.stringify({ error: "Setup already completed" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const body = await request.json();
      const { username, password, email } = body;
      if (!username || !password || !email) {
        return new Response(JSON.stringify({ error: "Username, password, and email are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const id = db.generateUUID();
      const passHash = await hashPassword(password);
      await db.run(
        "INSERT INTO users (id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)",
        [id, username, passHash, email, "admin"]
      );
      return new Response(JSON.stringify({ success: true, message: "Admin user created successfully" }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (request.method === "POST" && path === "/api/auth/login") {
    try {
      const body = await request.json();
      const { username, password } = body;
      if (!username || !password) {
        return new Response(JSON.stringify({ error: "Username and password are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const user = await db.get("SELECT * FROM users WHERE username = ? AND deleted_at IS NULL", [username]);
      if (!user) {
        return new Response(JSON.stringify({ error: "Invalid username or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const isValid = await verifyPassword(password, user.password_hash);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid username or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      const token = await createJWT({ id: user.id, username: user.username, role: user.role }, env.JWT_SECRET);
      return new Response(JSON.stringify({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  if (request.method === "GET" && path === "/api/auth/me") {
    if (!request.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ user: request.user }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" }
  });
}
__name(handleAuthRoutes, "handleAuthRoutes");

// src/routes/public.js
async function handlePublicRoutes(request, env, url) {
  const db = new Database(env.DB);
  const path = url.pathname;
  const method = request.method;
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (method === "GET" && path === "/api/public/settings") {
    try {
      const rows = await db.query("SELECT key, value, category FROM settings");
      const settings = {};
      rows.results.forEach((row) => {
        if (!settings[row.category]) {
          settings[row.category] = {};
        }
        let val = row.value;
        if (val.startsWith("{") && val.endsWith("}") || val.startsWith("[") && val.endsWith("]")) {
          try {
            val = JSON.parse(val);
          } catch (e) {
          }
        }
        settings[row.category][row.key] = val;
      });
      return new Response(JSON.stringify(settings), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/homepage") {
    try {
      const sections = await db.query("SELECT * FROM homepage_sections WHERE is_enabled = 1 ORDER BY display_order ASC");
      const payload = {
        sections: sections.results.map((s) => {
          try {
            s.settings_json = JSON.parse(s.settings_json || "{}");
          } catch (e) {
            s.settings_json = {};
          }
          return s;
        }),
        services: [],
        projects: [],
        testimonials: [],
        clients: [],
        news: []
      };
      const activeKeys = sections.results.map((s) => s.section_key);
      if (activeKeys.includes("services")) {
        const res = await db.query(
          `SELECT s.*, m.path as image_path FROM services s 
           LEFT JOIN media m ON s.image_media_id = m.id 
           WHERE s.status = 'published' AND s.deleted_at IS NULL 
           ORDER BY s.display_order ASC LIMIT 3`
        );
        payload.services = res.results;
      }
      if (activeKeys.includes("projects")) {
        const res = await db.query(
          `SELECT p.*, m.path as primary_image_path FROM projects p 
           LEFT JOIN project_images pi ON pi.project_id = p.id AND pi.is_primary = 1 
           LEFT JOIN media m ON pi.media_id = m.id 
           WHERE p.status = 'published' AND p.deleted_at IS NULL 
           ORDER BY p.display_order ASC LIMIT 3`
        );
        payload.projects = res.results;
      }
      if (activeKeys.includes("testimonials")) {
        const res = await db.query(
          `SELECT t.*, m.path as avatar_path FROM testimonials t 
           LEFT JOIN media m ON t.avatar_media_id = m.id 
           WHERE t.status = 'published' AND t.deleted_at IS NULL 
           ORDER BY t.display_order ASC LIMIT 5`
        );
        payload.testimonials = res.results;
      }
      if (activeKeys.includes("logos")) {
        const res = await db.query(
          `SELECT c.*, m.path as logo_path FROM clients c 
           LEFT JOIN media m ON c.logo_media_id = m.id 
           WHERE c.status = 'published' AND c.deleted_at IS NULL 
           ORDER BY c.display_order ASC`
        );
        payload.clients = res.results;
      }
      if (activeKeys.includes("news")) {
        const res = await db.query(
          `SELECT b.id, b.title, b.content, b.seo_url, b.created_at, m.path as featured_image_path, cat.name as category_name 
           FROM blogs b 
           LEFT JOIN media m ON b.featured_image_media_id = m.id 
           LEFT JOIN categories cat ON b.category_id = cat.id 
           WHERE b.status = 'published' AND b.deleted_at IS NULL 
           ORDER BY b.created_at DESC LIMIT 3`
        );
        payload.news = res.results.map((item) => {
          let text = item.content.replace(/<[^>]*>/g, "");
          if (text.length > 150)
            text = text.substring(0, 150) + "...";
          item.excerpt = text;
          delete item.content;
          return item;
        });
      }
      return new Response(JSON.stringify(payload), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/services") {
    try {
      const res = await db.query(
        `SELECT s.*, m.path as image_path, m2.path as brochure_path FROM services s 
         LEFT JOIN media m ON s.image_media_id = m.id 
         LEFT JOIN media m2 ON s.brochure_media_id = m2.id 
         WHERE s.status = 'published' AND s.deleted_at IS NULL 
         ORDER BY s.display_order ASC`
      );
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/projects") {
    try {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search");
      let queryStr = `
        SELECT p.*, m.path as primary_image_path FROM projects p 
        LEFT JOIN project_images pi ON pi.project_id = p.id AND pi.is_primary = 1 
        LEFT JOIN media m ON pi.media_id = m.id 
        WHERE p.status = 'published' AND p.deleted_at IS NULL
      `;
      const params = [];
      if (category) {
        queryStr += ` AND p.category = ?`;
        params.push(category);
      }
      if (search) {
        queryStr += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.client LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }
      queryStr += ` ORDER BY p.display_order ASC`;
      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path.startsWith("/api/public/projects/")) {
    try {
      const slug = path.substring("/api/public/projects/".length);
      const project = await db.get('SELECT * FROM projects WHERE seo_slug = ? AND status = "published" AND deleted_at IS NULL', [slug]);
      if (!project) {
        return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers: corsHeaders });
      }
      const images = await db.query(
        `SELECT pi.*, m.path, m.alt_text, m.caption FROM project_images pi 
         JOIN media m ON pi.media_id = m.id 
         WHERE pi.project_id = ? 
         ORDER BY pi.display_order ASC`,
        [project.id]
      );
      const docs = await db.query(
        `SELECT pd.*, m.name, m.path, m.size FROM project_documents pd 
         JOIN media m ON pd.media_id = m.id 
         WHERE pd.project_id = ? 
         ORDER BY pd.display_order ASC`,
        [project.id]
      );
      project.images = images.results;
      project.documents = docs.results;
      return new Response(JSON.stringify(project), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/credentials") {
    try {
      const globalCerts = await db.query(
        `SELECT gc.*, m1.path as org_logo_path, m2.path as certificate_image_path 
         FROM global_certifications gc 
         LEFT JOIN media m1 ON gc.org_logo_media_id = m1.id 
         JOIN media m2 ON gc.certificate_image_media_id = m2.id 
         WHERE gc.active_status = 1 AND gc.deleted_at IS NULL 
         ORDER BY gc.display_order ASC`
      );
      const otherCerts = await db.query(
        `SELECT oc.*, m.path as certificate_image_path 
         FROM other_certificates oc 
         JOIN media m ON oc.certificate_image_media_id = m.id 
         WHERE oc.active_status = 1 AND oc.deleted_at IS NULL 
         ORDER BY oc.display_order ASC`
      );
      return new Response(JSON.stringify({
        global_certifications: globalCerts.results,
        other_certificates: otherCerts.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/gallery") {
    try {
      const category = url.searchParams.get("category_id");
      const search = url.searchParams.get("search");
      const albums = await db.query('SELECT a.*, m.path as cover_path FROM gallery_albums a LEFT JOIN media m ON a.cover_media_id = m.id WHERE a.status = "published" AND a.deleted_at IS NULL ORDER BY a.display_order ASC');
      let queryStr = `
        SELECT g.*, m.path, m.name, m.alt_text, m.caption, m.size, c.name as category_name 
        FROM gallery g 
        JOIN media m ON g.media_id = m.id 
        LEFT JOIN categories c ON g.category_id = c.id 
        WHERE g.deleted_at IS NULL
      `;
      const params = [];
      if (category) {
        queryStr += ` AND g.category_id = ?`;
        params.push(category);
      }
      if (search) {
        queryStr += ` AND (m.name LIKE ? OR m.alt_text LIKE ? OR m.caption LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }
      queryStr += ` ORDER BY g.display_order ASC`;
      const images = await db.query(queryStr, params);
      return new Response(JSON.stringify({
        albums: albums.results,
        images: images.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/careers") {
    try {
      const res = await db.query('SELECT * FROM careers WHERE status = "published" AND deleted_at IS NULL ORDER BY display_order ASC');
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "POST" && path === "/api/public/careers/apply") {
    try {
      const formData = await request.formData();
      const career_id = formData.get("career_id");
      const applicant_name = formData.get("applicant_name");
      const applicant_email = formData.get("applicant_email");
      const cover_letter = formData.get("cover_letter") || "";
      const resumeFile = formData.get("resume");
      if (!career_id || !applicant_name || !applicant_email || !resumeFile) {
        return new Response(JSON.stringify({ error: "Missing required application fields or resume file" }), { status: 400, headers: corsHeaders });
      }
      const mediaId = db.generateUUID();
      const cleanFileName = `${mediaId}-${resumeFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const r2Path = `resumes/${cleanFileName}`;
      if (env.MEDIA_BUCKET) {
        await env.MEDIA_BUCKET.put(r2Path, resumeFile.stream(), {
          httpMetadata: { contentType: resumeFile.type }
        });
      } else {
        return new Response(JSON.stringify({ error: "R2 storage not bound" }), { status: 500, headers: corsHeaders });
      }
      await db.run(
        `INSERT INTO media (id, name, path, size, mime_type, folder) 
         VALUES (?, ?, ?, ?, ?, '/resumes')`,
        [mediaId, resumeFile.name, r2Path, resumeFile.size, resumeFile.type]
      );
      const id = db.generateUUID();
      await db.run(
        `INSERT INTO applications (id, career_id, applicant_name, applicant_email, resume_media_id, cover_letter, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, career_id, applicant_name, applicant_email, mediaId, cover_letter, "pending"]
      );
      return new Response(JSON.stringify({ success: true, message: "Application submitted successfully" }), { status: 201, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "POST" && path === "/api/public/contact") {
    try {
      const body = await request.json();
      const { name, email, phone, subject, message: message2 } = body;
      if (!name || !email || !subject || !message2) {
        return new Response(JSON.stringify({ error: "Missing required contact fields" }), { status: 400, headers: corsHeaders });
      }
      const id = db.generateUUID();
      await db.run(
        `INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read) 
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [id, name, email, phone || "", subject, message2]
      );
      return new Response(JSON.stringify({ success: true, message: "Message sent successfully" }), { status: 201, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/news") {
    try {
      const category = url.searchParams.get("category");
      const tag2 = url.searchParams.get("tag");
      const search = url.searchParams.get("search");
      let queryStr = `
        SELECT b.*, m.path as featured_image_path, c.name as category_name, u.username as author_name 
        FROM blogs b 
        LEFT JOIN media m ON b.featured_image_media_id = m.id 
        LEFT JOIN categories c ON b.category_id = c.id 
        LEFT JOIN users u ON b.author_id = u.id 
        WHERE b.status = 'published' AND b.deleted_at IS NULL
      `;
      const params = [];
      if (category) {
        queryStr += ` AND c.slug = ?`;
        params.push(category);
      }
      if (tag2) {
        queryStr += ` AND b.id IN (SELECT blog_id FROM blog_tags bt JOIN tags t ON bt.tag_id = t.id WHERE t.slug = ?)`;
        params.push(tag2);
      }
      if (search) {
        queryStr += ` AND (b.title LIKE ? OR b.content LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild);
      }
      queryStr += ` ORDER BY b.created_at DESC`;
      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path.startsWith("/api/public/news/")) {
    try {
      const slug = path.substring("/api/public/news/".length);
      const blog = await db.get(
        `SELECT b.*, m.path as featured_image_path, c.name as category_name, u.username as author_name 
         FROM blogs b 
         LEFT JOIN media m ON b.featured_image_media_id = m.id 
         LEFT JOIN categories c ON b.category_id = c.id 
         LEFT JOIN users u ON b.author_id = u.id 
         WHERE b.seo_url = ? AND b.status = 'published' AND b.deleted_at IS NULL`,
        [slug]
      );
      if (!blog) {
        return new Response(JSON.stringify({ error: "Post not found" }), { status: 404, headers: corsHeaders });
      }
      const tags = await db.query(
        `SELECT t.* FROM tags t 
         JOIN blog_tags bt ON bt.tag_id = t.id 
         WHERE bt.blog_id = ?`,
        [blog.id]
      );
      blog.tags = tags.results;
      return new Response(JSON.stringify(blog), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/public/seo") {
    try {
      const type = url.searchParams.get("type");
      const id = url.searchParams.get("id");
      let seo = null;
      if (id) {
        seo = await db.get("SELECT * FROM seo WHERE entity_type = ? AND entity_id = ?", [type, id]);
      } else {
        seo = await db.get("SELECT * FROM seo WHERE entity_type = ? AND entity_id IS NULL", [type]);
      }
      if (!seo) {
        const defTitle = await db.get('SELECT value FROM settings WHERE key = "seo_default_title"');
        const defDesc = await db.get('SELECT value FROM settings WHERE key = "seo_default_description"');
        return new Response(JSON.stringify({
          meta_title: defTitle?.value || "Josmar Consulting Engineers",
          meta_description: defDesc?.value || "Professional engineering consulting services."
        }), { status: 200, headers: corsHeaders });
      }
      return new Response(JSON.stringify(seo), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
}
__name(handlePublicRoutes, "handlePublicRoutes");

// src/routes/admin.js
var ALLOWED_TABLES = [
  "users",
  "media",
  "homepage_sections",
  "settings",
  "services",
  "projects",
  "project_images",
  "project_documents",
  "global_certifications",
  "other_certificates",
  "gallery_albums",
  "gallery",
  "testimonials",
  "clients",
  "categories",
  "tags",
  "blogs",
  "blog_tags",
  "careers",
  "applications",
  "contact_messages",
  "seo",
  "audit_logs"
];
async function handleAdminRoutes(request, env, url) {
  const db = new Database(env.DB);
  const path = url.pathname;
  const method = request.method;
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (!request.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  if (method === "GET" && path === "/api/admin/overview") {
    try {
      const projectsCount = await db.get("SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL");
      const servicesCount = await db.get("SELECT COUNT(*) as count FROM services WHERE deleted_at IS NULL");
      const messagesCount = await db.get("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
      const applicationsCount = await db.get('SELECT COUNT(*) as count FROM applications WHERE status = "pending"');
      const mediaCount = await db.get("SELECT COUNT(*) as count FROM media WHERE deleted_at IS NULL");
      const recentMessages = await db.query("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5");
      const recentLogs = await db.query(
        `SELECT a.*, u.username FROM audit_logs a 
         LEFT JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC LIMIT 5`
      );
      return new Response(JSON.stringify({
        counts: {
          projects: projectsCount.count,
          services: servicesCount.count,
          unread_messages: messagesCount.count,
          pending_applications: applicationsCount.count,
          media_files: mediaCount.count
        },
        recent_messages: recentMessages.results,
        recent_logs: recentLogs.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "PUT" && path === "/api/admin/settings") {
    try {
      const body = await request.json();
      const statements = [];
      for (const item of body) {
        let val = item.value;
        if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        statements.push(
          env.DB.prepare("UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?").bind(String(val), item.key)
        );
      }
      await db.batch(statements);
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "BULK_UPDATE", "settings", "bulk", `Updated ${body.length} settings`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  const parts = path.split("/").filter(Boolean);
  const tableName = parts[2];
  const recordId = parts[3];
  if (!tableName || !ALLOWED_TABLES.includes(tableName)) {
    return new Response(JSON.stringify({ error: "Invalid or restricted table name" }), { status: 400, headers: corsHeaders });
  }
  if (method === "GET" && !recordId) {
    try {
      let queryStr = `SELECT * FROM ${tableName}`;
      const params = [];
      if (tableName !== "settings" && tableName !== "homepage_sections" && tableName !== "contact_messages" && tableName !== "applications" && tableName !== "seo" && tableName !== "audit_logs" && tableName !== "project_images" && tableName !== "project_documents" && tableName !== "blog_tags") {
        queryStr += ` WHERE deleted_at IS NULL`;
      } else {
        queryStr += ` WHERE 1=1`;
      }
      const search = url.searchParams.get("search");
      if (search) {
        if (tableName === "projects") {
          queryStr += ` AND (name LIKE ? OR client LIKE ?)`;
          params.push(`%${search}%`, `%${search}%`);
        } else if (tableName === "services") {
          queryStr += ` AND title LIKE ?`;
          params.push(`%${search}%`);
        } else if (tableName === "blogs") {
          queryStr += ` AND title LIKE ?`;
          params.push(`%${search}%`);
        }
      }
      const category = url.searchParams.get("category");
      if (category && tableName === "projects") {
        queryStr += ` AND category = ?`;
        params.push(category);
      }
      const displayOrder = url.searchParams.get("sort_order");
      if (displayOrder && (tableName === "projects" || tableName === "services" || tableName === "global_certifications" || tableName === "other_certificates" || tableName === "homepage_sections")) {
        queryStr += ` ORDER BY display_order ASC`;
      } else if (tableName === "contact_messages" || tableName === "applications" || tableName === "audit_logs") {
        queryStr += ` ORDER BY created_at DESC`;
      }
      const rows = await db.query(queryStr, params);
      return new Response(JSON.stringify(rows.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && recordId) {
    try {
      const row = await db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [recordId]);
      if (!row) {
        return new Response(JSON.stringify({ error: "Record not found" }), { status: 404, headers: corsHeaders });
      }
      if (tableName === "projects") {
        const images = await db.query("SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC", [recordId]);
        const documents = await db.query("SELECT * FROM project_documents WHERE project_id = ? ORDER BY display_order ASC", [recordId]);
        row.images = images.results;
        row.documents = documents.results;
      }
      if (tableName === "blogs") {
        const tags = await db.query(
          `SELECT t.* FROM tags t 
           JOIN blog_tags bt ON bt.tag_id = t.id 
           WHERE bt.blog_id = ?`,
          [recordId]
        );
        row.tags = tags.results;
      }
      return new Response(JSON.stringify(row), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "POST") {
    try {
      const body = await request.json();
      const id = body.id || db.generateUUID();
      body.id = id;
      const projectImages = body.images;
      const projectDocs = body.documents;
      const blogTags = body.tags;
      delete body.images;
      delete body.documents;
      delete body.tags;
      const keys = Object.keys(body);
      const placeholders = keys.map(() => "?").join(", ");
      const sql = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
      const params = keys.map((k) => {
        let val = body[k];
        if (typeof val === "object" && val !== null)
          val = JSON.stringify(val);
        return val;
      });
      await db.run(sql, params);
      if (tableName === "projects" && (projectImages || projectDocs)) {
        if (projectImages && Array.isArray(projectImages)) {
          for (const img of projectImages) {
            await db.run(
              "INSERT INTO project_images (id, project_id, media_id, is_primary, display_order) VALUES (?, ?, ?, ?, ?)",
              [db.generateUUID(), id, img.media_id, img.is_primary ? 1 : 0, img.display_order || 0]
            );
          }
        }
        if (projectDocs && Array.isArray(projectDocs)) {
          for (const doc of projectDocs) {
            await db.run(
              "INSERT INTO project_documents (id, project_id, media_id, display_order) VALUES (?, ?, ?, ?)",
              [db.generateUUID(), id, doc.media_id, doc.display_order || 0]
            );
          }
        }
      }
      if (tableName === "blogs" && blogTags && Array.isArray(blogTags)) {
        for (const tagId of blogTags) {
          await db.run("INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)", [id, tagId]);
        }
      }
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "CREATE", tableName, id, `Created record in ${tableName}`]
      );
      return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "PUT" && recordId) {
    try {
      const body = await request.json();
      delete body.id;
      delete body.created_at;
      const projectImages = body.images;
      const projectDocs = body.documents;
      const blogTags = body.tags;
      delete body.images;
      delete body.documents;
      delete body.tags;
      const keys = Object.keys(body);
      const assignments = keys.map((k) => `${k} = ?`).join(", ");
      const sql = `UPDATE ${tableName} SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const params = keys.map((k) => {
        let val = body[k];
        if (typeof val === "object" && val !== null)
          val = JSON.stringify(val);
        return val;
      });
      params.push(recordId);
      await db.run(sql, params);
      if (tableName === "projects") {
        if (projectImages && Array.isArray(projectImages)) {
          await db.run("DELETE FROM project_images WHERE project_id = ?", [recordId]);
          for (const img of projectImages) {
            await db.run(
              "INSERT INTO project_images (id, project_id, media_id, is_primary, display_order) VALUES (?, ?, ?, ?, ?)",
              [db.generateUUID(), recordId, img.media_id, img.is_primary ? 1 : 0, img.display_order || 0]
            );
          }
        }
        if (projectDocs && Array.isArray(projectDocs)) {
          await db.run("DELETE FROM project_documents WHERE project_id = ?", [recordId]);
          for (const doc of projectDocs) {
            await db.run(
              "INSERT INTO project_documents (id, project_id, media_id, display_order) VALUES (?, ?, ?, ?)",
              [db.generateUUID(), recordId, doc.media_id, doc.display_order || 0]
            );
          }
        }
      }
      if (tableName === "blogs" && blogTags && Array.isArray(blogTags)) {
        await db.run("DELETE FROM blog_tags WHERE blog_id = ?", [recordId]);
        for (const tagId of blogTags) {
          await db.run("INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)", [recordId, tagId]);
        }
      }
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "UPDATE", tableName, recordId, `Updated record in ${tableName}`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "DELETE" && recordId) {
    try {
      const softDeleteTables = ["services", "projects", "global_certifications", "other_certificates", "gallery_albums", "gallery", "testimonials", "clients", "categories", "tags", "blogs", "careers", "media", "users"];
      if (softDeleteTables.includes(tableName)) {
        await db.run(`UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [recordId]);
      } else {
        await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [recordId]);
      }
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "DELETE", tableName, recordId, `Deleted record in ${tableName}`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "POST" && path === "/api/admin/bulk-operation") {
    try {
      const body = await request.json();
      const { action, table, ids } = body;
      if (!table || !ALLOWED_TABLES.includes(table) || !ids || !Array.isArray(ids) || ids.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid parameters" }), { status: 400, headers: corsHeaders });
      }
      const statements = [];
      const softDeleteTables = ["services", "projects", "global_certifications", "other_certificates", "gallery_albums", "gallery", "testimonials", "clients", "categories", "tags", "blogs", "careers", "media", "users"];
      for (const id of ids) {
        if (action === "delete") {
          if (softDeleteTables.includes(table)) {
            statements.push(env.DB.prepare(`UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id));
          } else {
            statements.push(env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id));
          }
        } else if (action === "publish") {
          statements.push(env.DB.prepare(`UPDATE ${table} SET status = 'published' WHERE id = ?`).bind(id));
        } else if (action === "draft") {
          statements.push(env.DB.prepare(`UPDATE ${table} SET status = 'draft' WHERE id = ?`).bind(id));
        }
      }
      await db.batch(statements);
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, `BULK_${action.toUpperCase()}`, table, "bulk", `Bulk action on ${ids.length} records in ${table}`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
}
__name(handleAdminRoutes, "handleAdminRoutes");

// src/routes/media.js
async function handleMediaRoutes(request, env, url) {
  const db = new Database(env.DB);
  const path = url.pathname;
  const method = request.method;
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (!request.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }
  if (method === "GET" && path === "/api/admin/media") {
    try {
      const folder = url.searchParams.get("folder") || "/";
      const search = url.searchParams.get("search");
      let queryStr = "SELECT * FROM media WHERE deleted_at IS NULL";
      const params = [];
      if (folder) {
        queryStr += " AND folder = ?";
        params.push(folder);
      }
      if (search) {
        queryStr += " AND (name LIKE ? OR alt_text LIKE ? OR caption LIKE ?)";
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }
      queryStr += " ORDER BY created_at DESC";
      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "GET" && path === "/api/admin/media/folders") {
    try {
      const res = await db.query("SELECT DISTINCT folder FROM media WHERE deleted_at IS NULL");
      const folders = res.results.map((r) => r.folder);
      if (!folders.includes("/")) {
        folders.unshift("/");
      }
      return new Response(JSON.stringify(folders), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "POST" && path === "/api/admin/media/upload") {
    try {
      if (!env.MEDIA_BUCKET) {
        return new Response(JSON.stringify({ error: "R2 bucket binding MEDIA_BUCKET not found" }), { status: 500, headers: corsHeaders });
      }
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400, headers: corsHeaders });
      }
      const name = formData.get("name") || file.name;
      const folder = formData.get("folder") || "/";
      const altText = formData.get("alt_text") || "";
      const caption = formData.get("caption") || "";
      const width = formData.get("width") ? parseInt(formData.get("width"), 10) : null;
      const height = formData.get("height") ? parseInt(formData.get("height"), 10) : null;
      const thumbnailFile = formData.get("thumbnail");
      const mediaId = db.generateUUID();
      const cleanFolderName = folder === "/" ? "" : folder.replace(/^\/+|\/+$/g, "") + "/";
      const cleanFileName = `${mediaId}-${name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const r2Path = `${cleanFolderName}${cleanFileName}`;
      await env.MEDIA_BUCKET.put(r2Path, file.stream(), {
        httpMetadata: { contentType: file.type }
      });
      let thumbnailPath = null;
      if (thumbnailFile) {
        thumbnailPath = `thumbnails/${mediaId}-thumb-${name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        await env.MEDIA_BUCKET.put(thumbnailPath, thumbnailFile.stream(), {
          httpMetadata: { contentType: thumbnailFile.type }
        });
      }
      await db.run(
        `INSERT INTO media (id, name, path, size, mime_type, alt_text, caption, folder, thumbnail_path, width, height) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mediaId, name, r2Path, file.size, file.type, altText, caption, folder, thumbnailPath, width, height]
      );
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "UPLOAD_MEDIA", "media", mediaId, `Uploaded media: ${name} to ${folder}`]
      );
      return new Response(JSON.stringify({
        success: true,
        media: {
          id: mediaId,
          name,
          path: r2Path,
          size: file.size,
          mime_type: file.type,
          alt_text: altText,
          caption,
          folder,
          thumbnail_path: thumbnailPath
        }
      }), { status: 201, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "PUT" && path.startsWith("/api/admin/media/rename/")) {
    try {
      const mediaId = path.substring("/api/admin/media/rename/".length);
      const body = await request.json();
      const { name, alt_text, caption, folder } = body;
      if (!name) {
        return new Response(JSON.stringify({ error: "Name is required" }), { status: 400, headers: corsHeaders });
      }
      const media = await db.get("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL", [mediaId]);
      if (!media) {
        return new Response(JSON.stringify({ error: "Media not found" }), { status: 404, headers: corsHeaders });
      }
      await db.run(
        `UPDATE media SET name = ?, alt_text = ?, caption = ?, folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, alt_text || "", caption || "", folder || "/", mediaId]
      );
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "RENAME_MEDIA", "media", mediaId, `Renamed media id ${mediaId} to ${name}`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  if (method === "DELETE" && path.startsWith("/api/admin/media/delete/")) {
    try {
      const mediaId = path.substring("/api/admin/media/delete/".length);
      const media = await db.get("SELECT * FROM media WHERE id = ? AND deleted_at IS NULL", [mediaId]);
      if (!media) {
        return new Response(JSON.stringify({ error: "Media not found" }), { status: 404, headers: corsHeaders });
      }
      const isUsedProject = await db.get("SELECT id FROM project_images WHERE media_id = ? LIMIT 1", [mediaId]);
      const isUsedService = await db.get("SELECT id FROM services WHERE image_media_id = ? OR brochure_media_id = ? LIMIT 1", [mediaId, mediaId]);
      const isUsedCert = await db.get("SELECT id FROM global_certifications WHERE org_logo_media_id = ? OR certificate_image_media_id = ? LIMIT 1", [mediaId, mediaId]);
      const isUsedOtherCert = await db.get("SELECT id FROM other_certificates WHERE certificate_image_media_id = ? LIMIT 1", [mediaId]);
      const isUsedBlog = await db.get("SELECT id FROM blogs WHERE featured_image_media_id = ? LIMIT 1", [mediaId]);
      if (isUsedProject || isUsedService || isUsedCert || isUsedOtherCert || isUsedBlog) {
        return new Response(
          JSON.stringify({
            error: "Cannot delete media: File is currently in use in projects, services, certifications, or blog posts."
          }),
          { status: 400, headers: corsHeaders }
        );
      }
      if (env.MEDIA_BUCKET) {
        try {
          await env.MEDIA_BUCKET.delete(media.path);
          if (media.thumbnail_path) {
            await env.MEDIA_BUCKET.delete(media.thumbnail_path);
          }
        } catch (r2Err) {
          console.error("R2 delete failed", r2Err);
        }
      }
      await db.run("DELETE FROM media WHERE id = ?", [mediaId]);
      await db.run(
        "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)",
        [db.generateUUID(), request.user.id, "DELETE_MEDIA", "media", mediaId, `Deleted media: ${media.name}`]
      );
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
  return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: corsHeaders });
}
__name(handleMediaRoutes, "handleMediaRoutes");

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    if (method === "GET" && path.startsWith("/media/")) {
      try {
        if (!env.MEDIA_BUCKET) {
          return new Response("R2 bucket binding MEDIA_BUCKET not found", { status: 500 });
        }
        const key = decodeURIComponent(path.substring(7));
        const file = await env.MEDIA_BUCKET.get(key);
        if (!file) {
          return new Response("File Not Found", { status: 404 });
        }
        const headers = new Headers();
        file.writeHttpMetadata(headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "public, max-age=31536000");
        return new Response(file.body, { headers });
      } catch (e) {
        return new Response("Error retrieving file: " + e.message, { status: 500 });
      }
    }
    try {
      if (path.startsWith("/api/auth")) {
        if (path === "/api/auth/me") {
          const authError = await authMiddleware(request, env);
          if (authError)
            return authError;
        }
        return await handleAuthRoutes(request, env, url);
      }
      if (path.startsWith("/api/public")) {
        return await handlePublicRoutes(request, env, url);
      }
      if (path.startsWith("/api/admin")) {
        const authError = await authMiddleware(request, env);
        if (authError)
          return authError;
        if (path.startsWith("/api/admin/media")) {
          return await handleMediaRoutes(request, env, url);
        }
        return await handleAdminRoutes(request, env, url);
      }
      return new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-e61MTd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-e61MTd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
