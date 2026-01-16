/**
 * localStorage Migration & CRUD テスト
 *
 * 実行方法: node tests/storage-test.js
 *
 * 共通ライブラリ common/storage.js をテストします。
 * ブラウザのlocalStorage/CookieをグローバルにモックしてMigrationとCRUDをテストします。
 */

// ===== Mock localStorage & Cookie =====
class MockStorage {
    constructor() {
        this.store = {};
    }
    getItem(key) {
        return this.store[key] || null;
    }
    setItem(key, value) {
        this.store[key] = value;
    }
    removeItem(key) {
        delete this.store[key];
    }
    clear() {
        this.store = {};
    }
}

class MockCookie {
    constructor() {
        this.cookies = {};
    }
    get cookie() {
        return Object.entries(this.cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join('; ');
    }
    set cookie(str) {
        if (str.includes('expires=Thu, 01 Jan 1970')) {
            // 削除
            const key = str.split('=')[0];
            delete this.cookies[key];
        } else {
            const [pair] = str.split(';');
            const [key, value] = pair.split('=');
            this.cookies[key] = value;
        }
    }
    setCookie(key, value) {
        this.cookies[key] = encodeURIComponent(JSON.stringify(value));
    }
    getCookie(key) {
        const value = this.cookies[key];
        return value ? JSON.parse(decodeURIComponent(value)) : null;
    }
    clear() {
        this.cookies = {};
    }
}

// グローバルモックを設定
const mockLocalStorage = new MockStorage();
const mockDocument = new MockCookie();

global.localStorage = mockLocalStorage;
global.document = mockDocument;

// 共通ライブラリを読み込み
const { createStorage } = require('../common/storage.js');

// ===== テストユーティリティ =====
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passCount++;
    } else {
        console.log(`  ✗ ${message}`);
        failCount++;
    }
}

function describe(name, fn) {
    console.log(`\n${name}`);
    fn();
}

// テスト前にストレージをクリア
function resetStorage() {
    mockLocalStorage.clear();
    mockDocument.clear();
}

// ===== インターバルタイマー テスト =====
function testIntervalTimer() {
    console.log('\n========================================');
    console.log('インターバルタイマー テスト');
    console.log('========================================');

    const STORAGE_KEY = 'intervalTimerSettings';
    const defaultSettings = {
        active: 0,
        groups: [{ name: 'デフォルト', presets: [] }]
    };

    // createStorage を使用
    const storage = createStorage(STORAGE_KEY, defaultSettings);

    describe('Migration テスト', () => {
        // クリア
        resetStorage();

        // Test 1: Cookieからの移行
        const testData = {
            active: 0,
            groups: [{
                name: 'テストグループ',
                presets: [{
                    id: 'test1',
                    name: 'タバタ式',
                    workDuration: 20,
                    restDuration: 10,
                    iterations: 8,
                    warmupDuration: 10
                }]
            }]
        };
        mockDocument.setCookie(STORAGE_KEY, testData);

        const migrated = storage.load();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.groups[0].name === 'テストグループ', 'グループ名が正しい');
        assert(migrated.groups[0].presets[0].name === 'タバタ式', 'プリセット名が正しい');
        assert(migrated.groups[0].presets[0].workDuration === 20, 'workDurationが正しい');

        // localStorageに移行されたか
        assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');

        // Cookieが削除されたか
        assert(mockDocument.getCookie(STORAGE_KEY) === null, 'Cookieが削除された');

        // Test 2: localStorageから直接読み込み
        resetStorage();
        const testData2 = { active: 1, groups: [{ name: 'LS直接', presets: [] }] };
        mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(testData2));

        const fromLS = storage.load();
        assert(fromLS.groups[0].name === 'LS直接', 'localStorageから直接読み込める');

        // Test 3: どちらにもない場合
        resetStorage();

        const defaultData = storage.load();
        assert(defaultData.groups[0].name === 'デフォルト', 'デフォルト設定が返される');
    });

    describe('CRUD テスト', () => {
        resetStorage();

        // Create: グループ作成
        let settings = { active: 0, groups: [] };
        settings.groups.push({ name: '新規グループ', presets: [] });
        storage.save(settings);

        let loaded = storage.load();
        assert(loaded.groups.length === 1, 'CREATE: グループを作成できる');
        assert(loaded.groups[0].name === '新規グループ', 'CREATE: グループ名が正しい');

        // Create: プリセット作成
        settings = storage.load();
        settings.groups[0].presets.push({
            id: 'preset_1',
            name: 'HIIT',
            workDuration: 30,
            restDuration: 15,
            iterations: 10,
            warmupDuration: 5
        });
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].presets.length === 1, 'CREATE: プリセットを作成できる');
        assert(loaded.groups[0].presets[0].name === 'HIIT', 'CREATE: プリセット名が正しい');

        // Read
        loaded = storage.load();
        assert(loaded !== null, 'READ: 設定を読み込める');
        assert(loaded.active === 0, 'READ: activeが正しい');

        // Update: グループ名
        settings = storage.load();
        settings.groups[0].name = '更新後グループ';
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].name === '更新後グループ', 'UPDATE: グループ名を更新できる');

        // Update: プリセット
        settings = storage.load();
        settings.groups[0].presets[0].workDuration = 40;
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].presets[0].workDuration === 40, 'UPDATE: プリセットを更新できる');

        // Delete: プリセット
        settings = storage.load();
        settings.groups[0].presets = [];
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].presets.length === 0, 'DELETE: プリセットを削除できる');

        // Delete: グループ
        settings = storage.load();
        settings.groups.push({ name: 'グループ2', presets: [] });
        storage.save(settings);
        settings = storage.load();
        settings.groups.splice(0, 1);
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups.length === 1, 'DELETE: グループを削除できる');
        assert(loaded.groups[0].name === 'グループ2', 'DELETE: 正しいグループが残る');
    });

    describe('remove() テスト', () => {
        resetStorage();

        // データを保存
        const testData = { active: 0, groups: [{ name: 'テスト', presets: [] }] };
        storage.save(testData);
        assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'データが保存されている');

        // 削除
        storage.remove();
        assert(mockLocalStorage.getItem(STORAGE_KEY) === null, 'remove()でデータを削除できる');
    });
}

// ===== コストタイマー テスト =====
function testCostTimer() {
    console.log('\n========================================');
    console.log('コストタイマー テスト');
    console.log('========================================');

    const STORAGE_KEY = 'costTimerSettings';
    const defaultSettings = {
        presets: [{ name: 'デフォルト', participants: [] }]
    };

    const storage = createStorage(STORAGE_KEY, defaultSettings);

    describe('Migration テスト', () => {
        resetStorage();

        // Cookieからの移行
        const testData = {
            presets: [{
                name: 'テストMTG',
                participants: [
                    { name: '参加者1', hourlyRate: 5000 },
                    { name: '参加者2', hourlyRate: 6000 }
                ]
            }]
        };
        mockDocument.setCookie(STORAGE_KEY, testData);

        const migrated = storage.load();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.presets[0].name === 'テストMTG', 'プリセット名が正しい');
        assert(migrated.presets[0].participants.length === 2, '参加者数が正しい');
        assert(migrated.presets[0].participants[0].hourlyRate === 5000, '時給が正しい');
        assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');
        assert(mockDocument.getCookie(STORAGE_KEY) === null, 'Cookieが削除された');

        // localStorageから直接読み込み
        resetStorage();
        const testData2 = { presets: [{ name: 'LS直接', participants: [] }] };
        mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(testData2));

        const fromLS = storage.load();
        assert(fromLS.presets[0].name === 'LS直接', 'localStorageから直接読み込める');

        // デフォルト値
        resetStorage();
        const defaultData = storage.load();
        assert(defaultData.presets[0].name === 'デフォルト', 'デフォルト設定が返される');
    });

    describe('CRUD テスト', () => {
        resetStorage();

        // Create
        let settings = { presets: [] };
        settings.presets.push({
            name: '新規MTG',
            participants: [{ name: '参加者A', hourlyRate: 4000 }]
        });
        storage.save(settings);

        let loaded = storage.load();
        assert(loaded.presets.length === 1, 'CREATE: プリセットを作成できる');
        assert(loaded.presets[0].participants.length === 1, 'CREATE: 参加者が含まれる');

        // Update
        settings = storage.load();
        settings.presets[0].name = '更新MTG';
        settings.presets[0].participants[0].hourlyRate = 7000;
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.presets[0].name === '更新MTG', 'UPDATE: プリセット名を更新できる');
        assert(loaded.presets[0].participants[0].hourlyRate === 7000, 'UPDATE: 時給を更新できる');

        // Delete
        settings = storage.load();
        settings.presets[0].participants = [];
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.presets[0].participants.length === 0, 'DELETE: 参加者を削除できる');
    });
}

// ===== カウントダウンタイマー テスト =====
function testCountdownTimer() {
    console.log('\n========================================');
    console.log('カウントダウンタイマー テスト');
    console.log('========================================');

    const STORAGE_KEY = 'timerList';
    const defaultSettings = {
        active: 0,
        groups: [{ name: 'デフォルト', timers: [] }]
    };

    const storage = createStorage(STORAGE_KEY, defaultSettings);

    describe('Migration テスト', () => {
        resetStorage();

        // Cookieからの移行
        const testData = {
            active: 0,
            groups: [{
                name: 'テストグループ',
                timers: [{
                    name: '起床',
                    targetTime: '07:00:00',
                    enabled: true
                }]
            }]
        };
        mockDocument.setCookie(STORAGE_KEY, testData);

        const migrated = storage.load();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.groups[0].name === 'テストグループ', 'グループ名が正しい');
        assert(migrated.groups[0].timers[0].name === '起床', 'タイマー名が正しい');
        assert(migrated.groups[0].timers[0].targetTime === '07:00:00', '目標時刻が正しい');
        assert(mockLocalStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');
        assert(mockDocument.getCookie(STORAGE_KEY) === null, 'Cookieが削除された');

        // localStorageから直接読み込み
        resetStorage();
        const testData2 = { active: 1, groups: [{ name: 'LS直接', timers: [] }] };
        mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(testData2));

        const fromLS = storage.load();
        assert(fromLS.groups[0].name === 'LS直接', 'localStorageから直接読み込める');

        // デフォルト値
        resetStorage();
        const defaultData = storage.load();
        assert(defaultData.groups[0].name === 'デフォルト', 'デフォルト設定が返される');
    });

    describe('CRUD テスト', () => {
        resetStorage();

        // Create
        let settings = { active: 0, groups: [] };
        settings.groups.push({
            name: '新規グループ',
            timers: [{
                name: '勤務開始',
                targetTime: '09:00:00',
                enabled: true
            }]
        });
        storage.save(settings);

        let loaded = storage.load();
        assert(loaded.groups.length === 1, 'CREATE: グループを作成できる');
        assert(loaded.groups[0].timers.length === 1, 'CREATE: タイマーが含まれる');
        assert(loaded.groups[0].timers[0].name === '勤務開始', 'CREATE: タイマー名が正しい');

        // Update
        settings = storage.load();
        settings.groups[0].timers[0].targetTime = '08:30:00';
        settings.groups[0].timers[0].enabled = false;
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].timers[0].targetTime === '08:30:00', 'UPDATE: 目標時刻を更新できる');
        assert(loaded.groups[0].timers[0].enabled === false, 'UPDATE: enabled状態を更新できる');

        // Delete
        settings = storage.load();
        settings.groups[0].timers = [];
        storage.save(settings);

        loaded = storage.load();
        assert(loaded.groups[0].timers.length === 0, 'DELETE: タイマーを削除できる');
    });
}

// ===== 実行 =====
console.log('Storage Migration & CRUD テスト');
console.log('================================');
console.log('common/storage.js を使用してテスト');

testIntervalTimer();
testCostTimer();
testCountdownTimer();

console.log('\n========================================');
console.log('テスト結果');
console.log('========================================');
console.log(`  合計: ${passCount + failCount}`);
console.log(`  成功: ${passCount}`);
console.log(`  失敗: ${failCount}`);

if (failCount === 0) {
    console.log('\n✓ 全テスト成功！');
    process.exit(0);
} else {
    console.log('\n✗ 失敗したテストがあります');
    process.exit(1);
}
