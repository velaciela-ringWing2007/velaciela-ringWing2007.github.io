/**
 * 共通ストレージライブラリ
 *
 * localStorage を使用した設定の保存・読み込み機能を提供します。
 * Cookie からの移行確認機能、Export/Import機能付き。
 *
 * 使用例:
 *   const storage = createStorage('mySettings', { defaultValue: true });
 *
 *   // Migration確認付きで読み込み
 *   if (storage.hasCookieData()) {
 *       const cookieData = storage.getCookieData();
 *       if (confirm('Cookieからデータを移行しますか？')) {
 *           storage.migrateCookie();
 *       } else {
 *           storage.discardCookie();
 *       }
 *   }
 *   const data = storage.load();
 *
 *   // Export/Import
 *   const json = storage.export();
 *   storage.import(json);
 */

/**
 * ストレージインスタンスを作成
 * @param {string} key - localStorage/Cookie のキー
 * @param {object} defaultValue - デフォルト値
 * @returns {object} ストレージインスタンス
 */
function createStorage(key, defaultValue) {
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

    /**
     * Cookieに移行対象のデータがあるか確認
     * @returns {boolean}
     */
    function hasCookieData() {
        // localStorageにデータがあれば移行不要
        if (localStorage.getItem(key)) {
            return false;
        }
        // Cookieにデータがあるか確認
        const cookieValue = getCookieValue(key);
        return !!cookieValue;
    }

    /**
     * Cookieのデータを取得（プレビュー用）
     * @returns {object|null}
     */
    function getCookieData() {
        const cookieValue = getCookieValue(key);
        if (cookieValue) {
            try {
                return JSON.parse(decodeURIComponent(cookieValue));
            } catch (e) {
                console.error(`[Storage] Failed to parse Cookie (${key}):`, e);
            }
        }
        return null;
    }

    /**
     * Cookieからデータを移行する
     * @returns {object|null} 移行したデータ
     */
    function migrateCookie() {
        const data = getCookieData();
        if (data) {
            localStorage.setItem(key, JSON.stringify(data));
            deleteCookie(key);
            console.log(`[Storage] Migrated from Cookie to localStorage: ${key}`);
            return data;
        }
        return null;
    }

    /**
     * Cookieのデータを破棄する（移行しない）
     */
    function discardCookie() {
        deleteCookie(key);
        console.log(`[Storage] Discarded Cookie data: ${key}`);
    }

    /**
     * 設定を読み込む
     * 1. localStorage から読み込み
     * 2. なければ Cookie から自動移行（後方互換性のため）
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

        // localStorage になければ Cookie から自動移行（後方互換性）
        const cookieValue = getCookieValue(key);
        if (cookieValue) {
            try {
                const data = JSON.parse(decodeURIComponent(cookieValue));
                // localStorage に保存して移行完了
                localStorage.setItem(key, JSON.stringify(data));
                // 古い Cookie を削除
                deleteCookie(key);
                console.log(`[Storage] Auto-migrated from Cookie to localStorage: ${key}`);
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
     * 設定をJSON文字列としてエクスポート
     * @returns {string} JSON文字列
     */
    function exportData() {
        const data = load();
        return JSON.stringify(data, null, 2);
    }

    /**
     * JSON文字列から設定をインポート
     * @param {string} jsonString - JSON文字列
     * @returns {object} インポートしたデータ
     * @throws {Error} JSONパースエラー
     */
    function importData(jsonString) {
        const data = JSON.parse(jsonString);
        save(data);
        return data;
    }

    return {
        load,
        save,
        remove,
        hasCookieData,
        getCookieData,
        migrateCookie,
        discardCookie,
        export: exportData,
        import: importData
    };
}

// Node.js 環境でのエクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createStorage };
}
