/**
 * テーマ切り替え共通モジュール
 * 使い方:
 * 1. HTML に <link rel="stylesheet" href="common/themes.css"> を追加
 * 2. HTML に <script src="common/theme-switcher.js"></script> を追加
 * 3. body に class="themed" を追加
 * 4. テーマ選択用の <select id="themeSelect"> を配置
 * 5. ThemeSwitcher.init() を呼び出す
 */

const ThemeSwitcher = {
    STORAGE_KEY: 'nebukinToolsTheme',

    themes: [
        { value: 'white', label: 'White' },
        { value: 'default', label: 'Default' },
        { value: 'terminal', label: 'Terminal Green' },
        { value: 'nerv', label: 'NERV Orange' },
        { value: 'neon', label: 'Neon Cyber' },
        { value: 'midnight', label: 'Midnight Purple' },
        { value: 'ocean', label: 'Ocean Deep' },
        { value: 'sunset', label: 'Sunset' },
        { value: 'amber', label: 'Retro Amber' },
        { value: 'pink', label: 'Pop Pink' },
        { value: 'aqua', label: 'Pop Aqua' }
    ],

    /**
     * 初期化
     * @param {string} selectId - テーマ選択セレクトボックスのID（デフォルト: 'themeSelect'）
     */
    init: function(selectId = 'themeSelect') {
        this.selectElement = document.getElementById(selectId);

        // セレクトボックスにオプションを追加（まだなければ）
        if (this.selectElement && this.selectElement.options.length === 0) {
            this.populateSelect();
        }

        // 保存されたテーマを読み込み
        this.load();

        // イベントリスナーを設定
        if (this.selectElement) {
            this.selectElement.addEventListener('change', (e) => {
                this.save(e.target.value);
            });
        }
    },

    /**
     * セレクトボックスにテーマオプションを追加
     */
    populateSelect: function() {
        if (!this.selectElement) return;

        this.themes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme.value;
            option.textContent = theme.label;
            this.selectElement.appendChild(option);
        });
    },

    /**
     * テーマを読み込んで適用
     */
    load: function() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'default';
        this.apply(savedTheme);

        if (this.selectElement) {
            this.selectElement.value = savedTheme;
        }
    },

    /**
     * テーマを保存して適用
     * @param {string} theme - テーマ名
     */
    save: function(theme) {
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.apply(theme);
    },

    /**
     * テーマを適用
     * @param {string} theme - テーマ名
     */
    apply: function(theme) {
        document.body.setAttribute('data-theme', theme);
    },

    /**
     * 現在のテーマを取得
     * @returns {string} テーマ名
     */
    current: function() {
        return localStorage.getItem(this.STORAGE_KEY) || 'default';
    },

    /**
     * テーマセレクタのHTMLを生成
     * @param {string} id - セレクトボックスのID
     * @param {string} className - 追加のCSSクラス
     * @returns {string} HTML文字列
     */
    createSelectHTML: function(id = 'themeSelect', className = '') {
        let html = `<select class="form-select form-select-sm theme-selector ${className}" id="${id}" style="width: auto;">`;
        this.themes.forEach(theme => {
            html += `<option value="${theme.value}">${theme.label}</option>`;
        });
        html += '</select>';
        return html;
    }
};

// jQuery用ヘルパー（jQueryが存在する場合）
if (typeof jQuery !== 'undefined') {
    jQuery.fn.themeSwitcher = function() {
        const selectId = this.attr('id') || 'themeSelect';
        ThemeSwitcher.init(selectId);
        return this;
    };
}
