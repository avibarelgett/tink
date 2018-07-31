// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////

goog.module('tink.aead.AeadCatalogueTest');
goog.setTestOnly('tink.aead.AeadCatalogueTest');

const AeadCatalogue = goog.require('tink.aead.AeadCatalogue');
const AesCtrHmacAeadKeyManager = goog.require('tink.aead.AesCtrHmacAeadKeyManager');

const testSuite = goog.require('goog.testing.testSuite');

const SUPPORTED_PRIMITIVE_NAME = 'Aead';

testSuite({
  async testGetKeyManagerWrongPrimitive() {
    const anotherPrimitiveName = 'Mac';

    const catalogue = new AeadCatalogue();
    try {
      catalogue.getKeyManager(
          AesCtrHmacAeadKeyManager.KEY_TYPE, anotherPrimitiveName,
          /* minVersion = */ 0);
    } catch (e) {
      assertEquals(
          ExceptionText.wrongPrimitive(
              anotherPrimitiveName, SUPPORTED_PRIMITIVE_NAME),
          e.toString());
      return;
    }
    fail('An exception should be thrown.');
  },

  async testGetKeyManagerBadVersion() {
    const manager = new AesCtrHmacAeadKeyManager();
    const version = manager.getVersion() + 1;

    const catalogue = new AeadCatalogue();
    try {
      catalogue.getKeyManager(
          manager.getKeyType(), SUPPORTED_PRIMITIVE_NAME, version);
    } catch (e) {
      assertEquals(ExceptionText.badVersion(), e.toString());
      return;
    }
    fail('An exception should be thrown.');
  },

  async testGetKeyManagerUnknownKeyType() {
    const keyType = 'unknown key type';
    const version = 0;

    const catalogue = new AeadCatalogue();
    try {
      catalogue.getKeyManager(keyType, SUPPORTED_PRIMITIVE_NAME, version);
    } catch (e) {
      assertEquals(ExceptionText.unknownKeyType(keyType), e.toString());
      return;
    }
    fail('An exception should be thrown.');
  },

  async testGetKeyManagerAesCtrHmacAeadKeyManager() {
    const catalogue = new AeadCatalogue();
    const version = 0;

    const manager = catalogue.getKeyManager(
        AesCtrHmacAeadKeyManager.KEY_TYPE, SUPPORTED_PRIMITIVE_NAME, version);

    assertTrue(manager instanceof AesCtrHmacAeadKeyManager);
    assertObjectEquals(new AesCtrHmacAeadKeyManager(), manager);
  },

  async testGetKeyManagerCaseInsensitivePrimitiveName() {
    const catalogue = new AeadCatalogue();
    const version = 0;
    const keyType = AesCtrHmacAeadKeyManager.KEY_TYPE;

    catalogue.getKeyManager(keyType, 'Aead', version);
    catalogue.getKeyManager(keyType, 'aead', version);
    catalogue.getKeyManager(keyType, 'AEAD', version);
  },
});

// Helper classes and functions
class ExceptionText {
  /**
   * @param {string} requested
   * @param {string} supported
   *
   * @return {string}
   */
  static wrongPrimitive(requested, supported) {
    return 'CustomError: Requested ' + requested + ' primitive, but this ' +
        'catalogue provides key managers for ' + supported + ' primitives.';
  }

  /** @return {string} */
  static badVersion() {
    return 'CustomError: Requested manager with higher version ' +
        'than is available.';
  }

  /**
   * @param {string} keyType
   *
   * @return {string}
   */
  static unknownKeyType(keyType) {
    return 'CustomError: There is no key manager for key type: ' + keyType +
        '.';
  }
}
