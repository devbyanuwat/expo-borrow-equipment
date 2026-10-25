// ESLint ของแอปตัวอย่าง แยกจากเว็บคอร์สที่อยู่ชั้นนอก
// เว็บคอร์สเป็น Next ใช้ eslint-config-next ซึ่งมีกฎที่ใช้กับ React Native ไม่ได้
// (react-hooks/immutability จะห้าม sharedValue.value ที่ Reanimated ต้องใช้)
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
