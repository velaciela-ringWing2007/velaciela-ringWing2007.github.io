/**
 * localStorage Migration & CRUD テスト
 *
 * 実行方法: node tests/storage-test.js
 *
 * ブラウザのlocalStorage/CookieをシミュレートしてMigrationとCRUDをテストします
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

// ===== Storage関数（実際の実装と同じロジック） =====
function createStorageFunctions(localStorage, document, storageKey, cookieKey, defaultSettings) {
    function loadSettings() {
        // まずlocalStorageから
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load from localStorage:', e);
            }
        }

        // Cookieから移行
        const cookieRegex = new RegExp(`(?:(?:^|.*;\\s*)${cookieKey}\\s*\\=\\s*([^;]*).*$)|^.*$`);
        const cookieValue = document.cookie.replace(cookieRegex, '$1');
        if (cookieValue) {
            try {
                const data = JSON.parse(decodeURIComponent(cookieValue));
                // localStorageに保存
                localStorage.setItem(storageKey, JSON.stringify(data));
                // Cookieを削除
                document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                return data;
            } catch (e) {
                console.error('Failed to migrate from Cookie:', e);
            }
        }

        return JSON.parse(JSON.stringify(defaultSettings));
    }

    function saveSettings(data) {
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    return { loadSettings, saveSettings };
}

// ===== インターバルタイマー テスト =====
function testIntervalTimer() {
    console.log('\n========================================');
    console.log('インターバルタイマー テスト');
    console.log('========================================');

    const localStorage = new MockStorage();
    const document = new MockCookie();
    const STORAGE_KEY = 'intervalTimerSettings';
    const COOKIE_KEY = 'intervalTimerSettings';
    const defaultSettings = {
        active: 0,
        groups: [{ name: 'デフォルト', presets: [] }]
    };

    const { loadSettings, saveSettings } = createStorageFunctions(
        localStorage, document, STORAGE_KEY, COOKIE_KEY, defaultSettings
    );

    describe('Migration テスト', () => {
        // クリア
        localStorage.clear();
        document.clear();

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
        document.setCookie(COOKIE_KEY, testData);

        const migrated = loadSettings();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.groups[0].name === 'テストグループ', 'グループ名が正しい');
        assert(migrated.groups[0].presets[0].name === 'タバタ式', 'プリセット名が正しい');
        assert(migrated.groups[0].presets[0].workDuration === 20, 'workDurationが正しい');

        // localStorageに移行されたか
        assert(localStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');

        // Cookieが削除されたか
        assert(document.getCookie(COOKIE_KEY) === null, 'Cookieが削除された');

        // Test 2: localStorageから直接読み込み
        localStorage.clear();
        document.clear();
        const testData2 = { active: 1, groups: [{ name: 'LS直接', presets: [] }] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testData2));

        const fromLS = loadSettings();
        assert(fromLS.groups[0].name === 'LS直接', 'localStorageから直接読み込める');

        // Test 3: どちらにもない場合
        localStorage.clear();
        document.clear();

        const defaultData = loadSettings();
        assert(defaultData.groups[0].name === 'デフォルト', 'デフォルト設定が返される');
    });

    describe('CRUD テスト', () => {
        localStorage.clear();
        document.clear();

        // Create: グループ作成
        let settings = { active: 0, groups: [] };
        settings.groups.push({ name: '新規グループ', presets: [] });
        saveSettings(settings);

        let loaded = loadSettings();
        assert(loaded.groups.length === 1, 'CREATE: グループを作成できる');
        assert(loaded.groups[0].name === '新規グループ', 'CREATE: グループ名が正しい');

        // Create: プリセット作成
        settings = loadSettings();
        settings.groups[0].presets.push({
            id: 'preset_1',
            name: 'HIIT',
            workDuration: 30,
            restDuration: 15,
            iterations: 10,
            warmupDuration: 5
        });
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].presets.length === 1, 'CREATE: プリセットを作成できる');
        assert(loaded.groups[0].presets[0].name === 'HIIT', 'CREATE: プリセット名が正しい');

        // Read
        loaded = loadSettings();
        assert(loaded !== null, 'READ: 設定を読み込める');
        assert(loaded.active === 0, 'READ: activeが正しい');

        // Update: グループ名
        settings = loadSettings();
        settings.groups[0].name = '更新後グループ';
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].name === '更新後グループ', 'UPDATE: グループ名を更新できる');

        // Update: プリセット
        settings = loadSettings();
        settings.groups[0].presets[0].workDuration = 40;
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].presets[0].workDuration === 40, 'UPDATE: プリセットを更新できる');

        // Delete: プリセット
        settings = loadSettings();
        settings.groups[0].presets = [];
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].presets.length === 0, 'DELETE: プリセットを削除できる');

        // Delete: グループ
        settings = loadSettings();
        settings.groups.push({ name: 'グループ2', presets: [] });
        saveSettings(settings);
        settings = loadSettings();
        settings.groups.splice(0, 1);
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups.length === 1, 'DELETE: グループを削除できる');
        assert(loaded.groups[0].name === 'グループ2', 'DELETE: 正しいグループが残る');
    });
}

// ===== コストタイマー テスト =====
function testCostTimer() {
    console.log('\n========================================');
    console.log('コストタイマー テスト');
    console.log('========================================');

    const localStorage = new MockStorage();
    const document = new MockCookie();
    const STORAGE_KEY = 'costTimerSettings';
    const COOKIE_KEY = 'costTimerSettings';
    const defaultSettings = {
        presets: [{ name: 'デフォルト', participants: [] }]
    };

    const { loadSettings, saveSettings } = createStorageFunctions(
        localStorage, document, STORAGE_KEY, COOKIE_KEY, defaultSettings
    );

    describe('Migration テスト', () => {
        localStorage.clear();
        document.clear();

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
        document.setCookie(COOKIE_KEY, testData);

        const migrated = loadSettings();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.presets[0].name === 'テストMTG', 'プリセット名が正しい');
        assert(migrated.presets[0].participants.length === 2, '参加者数が正しい');
        assert(migrated.presets[0].participants[0].hourlyRate === 5000, '時給が正しい');
        assert(localStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');
        assert(document.getCookie(COOKIE_KEY) === null, 'Cookieが削除された');
    });

    describe('CRUD テスト', () => {
        localStorage.clear();
        document.clear();

        // Create
        let settings = { presets: [] };
        settings.presets.push({
            name: '新規MTG',
            participants: [{ name: '参加者A', hourlyRate: 4000 }]
        });
        saveSettings(settings);

        let loaded = loadSettings();
        assert(loaded.presets.length === 1, 'CREATE: プリセットを作成できる');
        assert(loaded.presets[0].participants.length === 1, 'CREATE: 参加者が含まれる');

        // Update
        settings = loadSettings();
        settings.presets[0].name = '更新MTG';
        settings.presets[0].participants[0].hourlyRate = 7000;
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.presets[0].name === '更新MTG', 'UPDATE: プリセット名を更新できる');
        assert(loaded.presets[0].participants[0].hourlyRate === 7000, 'UPDATE: 時給を更新できる');

        // Delete
        settings = loadSettings();
        settings.presets[0].participants = [];
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.presets[0].participants.length === 0, 'DELETE: 参加者を削除できる');
    });
}

// ===== カウントダウンタイマー テスト =====
function testCountdownTimer() {
    console.log('\n========================================');
    console.log('カウントダウンタイマー テスト');
    console.log('========================================');

    const localStorage = new MockStorage();
    const document = new MockCookie();
    const STORAGE_KEY = 'timerList';
    const COOKIE_KEY = 'timerList';
    const defaultSettings = {
        active: 0,
        groups: [{ name: 'デフォルト', timers: [] }]
    };

    const { loadSettings, saveSettings } = createStorageFunctions(
        localStorage, document, STORAGE_KEY, COOKIE_KEY, defaultSettings
    );

    describe('Migration テスト', () => {
        localStorage.clear();
        document.clear();

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
        document.setCookie(COOKIE_KEY, testData);

        const migrated = loadSettings();
        assert(migrated !== null, 'Cookieからデータを読み込める');
        assert(migrated.groups[0].name === 'テストグループ', 'グループ名が正しい');
        assert(migrated.groups[0].timers[0].name === '起床', 'タイマー名が正しい');
        assert(migrated.groups[0].timers[0].targetTime === '07:00:00', '目標時刻が正しい');
        assert(localStorage.getItem(STORAGE_KEY) !== null, 'localStorageに移行された');
        assert(document.getCookie(COOKIE_KEY) === null, 'Cookieが削除された');
    });

    describe('CRUD テスト', () => {
        localStorage.clear();
        document.clear();

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
        saveSettings(settings);

        let loaded = loadSettings();
        assert(loaded.groups.length === 1, 'CREATE: グループを作成できる');
        assert(loaded.groups[0].timers.length === 1, 'CREATE: タイマーが含まれる');
        assert(loaded.groups[0].timers[0].name === '勤務開始', 'CREATE: タイマー名が正しい');

        // Update
        settings = loadSettings();
        settings.groups[0].timers[0].targetTime = '08:30:00';
        settings.groups[0].timers[0].enabled = false;
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].timers[0].targetTime === '08:30:00', 'UPDATE: 目標時刻を更新できる');
        assert(loaded.groups[0].timers[0].enabled === false, 'UPDATE: enabled状態を更新できる');

        // Delete
        settings = loadSettings();
        settings.groups[0].timers = [];
        saveSettings(settings);

        loaded = loadSettings();
        assert(loaded.groups[0].timers.length === 0, 'DELETE: タイマーを削除できる');
    });
}

// ===== 実行 =====
console.log('Storage Migration & CRUD テスト');
console.log('================================');

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
