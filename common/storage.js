/**
 * 共通ストレージライブラリ
 *
 * localStorage を使用した設定の保存・読み込み機能を提供します。
 * Cookie からの自動移行機能付き。
 *
 * 使用例:
 *   const storage = createStorage('mySettings', { defaultValue: true });
 *   const data = storage.load();
 *   storage.save(data);
 */

/**
 * ストレージインスタンスを作成
 * @param {string} key - localStorage/Cookie のキー
 * @param {object} defaultValue - デフォルト値
 * @returns {{ load: function, save: function }}
 */
function createStorage(key, defaultValue) {
    /**
     * 設定を読み込む
     * 1. localStorage から読み込み
     * 2. なければ Cookie から移行
     * 3. どちらもなければデフォルト値を返す
     * @returns {object} 設定データ
     */
    function load() {
        // まず localStorage から読み込み
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error(`[Storage] Failed to parse localStorage (${key}):`, e);
            }
        }

        // localStorage になければ Cookie から移行
        const cookieValue = getCookieValue(key);
        if (cookieValue) {
            try {
                const data = JSON.parse(decodeURIComponent(cookieValue));
                // localStorage に保存して移行完了
                localStorage.setItem(key, JSON.stringify(data));
                // 古い Cookie を削除
                deleteCookie(key);
                console.log(`[Storage] Migrated from Cookie to localStorage: ${key}`);
                return data;
            } catch (e) {
                console.error(`[Storage] Failed to migrate from Cookie (${key}):`, e);
            }
        }

        // どちらにもなければデフォルト値
        return JSON.parse(JSON.stringify(defaultValue));
    }

    /**
     * 設定を保存する
     * @param {object} data - 保存するデータ
     */
    function save(data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * 設定を削除する
     */
    function remove() {
        localStorage.removeItem(key);
    }

    /**
     * Cookie から値を取得（内部用）
     * @param {string} cookieKey
     * @returns {string|null}
     */
    function getCookieValue(cookieKey) {
        const regex = new RegExp(`(?:(?:^|.*;\\s*)${cookieKey}\\s*\\=\\s*([^;]*).*$)|^.*$`);
        const value = document.cookie.replace(regex, '$1');
        return value || null;
    }

    /**
     * Cookie を削除（内部用）
     * @param {string} cookieKey
     */
    function deleteCookie(cookieKey) {
        document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    return { load, save, remove };
}

// Node.js 環境でのエクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createStorage };
}
