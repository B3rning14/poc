/**
 * Debounce function that, as long as it continues to be invoked, will not be triggered.
 * @param {Function} func - Function to be debounced
 * @param {number} wait - Time in milliseconds to wait before the function gets called.
 * @param {boolean} [immediate] - Optional immediate flag, if passed, trigger the function on the leading edge, instead of the trailing.
 * @returns {Function}
 * @example window.addEventListener('resize', debounce((evt) => console.log(evt), 250));
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function () {
        let context = this,
            args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Autocomplete (with alpine.Js)
 *
 * @author Kevin Leroy <kleroy@simplonprod.co>
 * @param key {string} the key of the component (ex: default ➜ autocomplete-default)
 * @param url {string} the url to fetch (leave the mention `%query%` for the search term)
 * @param translations {Object.<string, string>} an object with translation key and translation value pair
 */
function autoComplete(key, url, translations = {}) {
    return {
        query: "",
        expanded: false,
        listHTML: "",
        selected_item: "",
        selected_index: -1,
        navigate_index: -1,
        navigate_item: "",
        total_items: 0,
        items: {},
        indexes: [],
        is_navigate: false,
        notifications: {},
        translations,
        dispatcher: null,
        init: function ($dispatch) {
            this.dispatcher = $dispatch;
        },
        search: debounce(
            function () {
                if (
                    !this.query ||
                    this.query === this.selected_item ||
                    this.query.length < 3 ||
                    this.is_navigate
                ) {
                    return;
                }

                this.expanded = false;

                const itemCSS =
                    "block pl-2 pr-8 py-3 bg-white border-b border-gray-300 hover:no-underline focus:no-underline";

                const errorHTML = `<li class="${itemCSS} text-gray-300">${this.translate(
                    "search.no_result"
                )}</li>`;

                fetch(url.replace("%query%", this.query))
                    .then((res) => res.json())
                    .then((data) => {
                        this.listHTML = "";
                        if (data.length) {
                            this.total_items = data.length;
                            this.items = data
                                .map((d) => ({ [d["nom"]]: d }))
                                .reduce((a, b) => ({ ...a, ...b }));
                            this.indexes = data.map((d) => d["nom"]);
                            const selectable_itemCSS =
                                itemCSS + "cursor-pointer hover:bg-gray-200 focus:bg-gray-200";
                            // noinspection HtmlUnknownAttribute
                            this.listHTML = data
                                .map(
                                    (d, i) =>
                                        `<li
                                        :aria-selected="navigate_index === ${i} ? 'true' : 'false'"
                                        :class="{ 'bg-gray-200': navigate_index === ${i} }"
                                        class="${selectable_itemCSS}"
                                        id="autocomplete-${key}__option--${i}"
                                        @click="select(${i})"
                                        role="option"
                                        tabIndex="-1"
                                        aria-posinset="${i + 1}"
                                        aria-setsize="${data.length}">${d["nom"]}</li>`
                                )
                                .join("\n");
                            this.notify(this.translate("search.total_items"));
                        } else {
                            this.listHTML = errorHTML;
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        this.listHTML = errorHTML;
                    });

                this.expanded = true;
            },
            500,
            false
        ),
        select: function (index) {
            this.is_navigate = false;
            this.selected_index = index;
            this.selected_item = this.query = this.indexes[this.selected_index];
            this.navigate_index = -1;
            this.navigate_item = "";
            this.expanded = false;
            this.notify(this.translate("select.selected_item"));
        },
        changeIndex: function (reverse = false) {
            this.navigate_index = reverse
                ? this.navigate_index === 0
                    ? this.total_items - 1
                    : this.navigate_index - 1
                : this.navigate_index === this.total_items - 1
                ? 0
                : this.navigate_index + 1;
            this.navigate_item = this.indexes[this.navigate_index];
            this.notify(this.translate("select.change_index"));
        },
        reset: function () {
            this.expanded = false;
            this.selected_item = this.navigate_index = this.query = "";
            this.selected_index = this.navigate_index = -1;
            this.total_items = 0;
            this.items = {};
            this.indexes = [];
            this.listHTML = "";
            this.notifications = {};
            this.un_notify();
        },
        navigate: function (event) {
            if (Object.values(this.items).length && [13, 27, 38, 40].includes(event.keyCode)) {
                event.preventDefault();

                this.is_navigate = true;

                switch (event.keyCode) {
                    case 13:
                        this.select(this.navigate_index);
                        break;
                    case 27:
                        this.reset();
                        break;
                    case 38:
                        this.changeIndex(true);
                        break;
                    case 40:
                        this.changeIndex();
                        break;
                }
            }
        },
        notify: function (text) {
            const now = Date.now();
            if (Object.values(this.notifications).length === 2) {
                delete this.notifications[Object.keys(this.notifications).shift()];
            }
            this.notifications[now] = text;
            Object.values(this.notifications).map((v, notifier) =>
                setTimeout(() => this.dispatcher("notify", { notifier, text }), 500)
            );
        },
        un_notify: function () {
            [0, 1].map((notifier) => this.dispatcher("un_notify", { notifier }));
        },
        translate: function (key) {
            try {
                let translation = this.translations[key];
                translation
                    .match(/%(.*?)%/gm)
                    .map((arg) => (translation = translation.replace(arg, this._parse_translation(arg))));
                return translation;
            } catch (Exception) {
                return key;
            }
        },
        _parse_translation: function (arg) {
            arg = arg.substr(1, arg.length - 2);

            let increment = arg.match(/.*\+(\d+)/);
            let sub_arg = arg.match(/(.*)\.(.*)/);

            if (increment) {
                arg = increment[0].replace("+" + increment[1], "");
                arg = arg.replace(arg, this[arg] + parseInt(increment[1]));
            } else if (sub_arg) {
                arg = arg.replace(arg, this[sub_arg[1]][sub_arg[2]]);
            } else {
                arg = this[arg];
            }

            return arg;
        },
        debug: function () {
            const ownKeys = [
                "query",
                "expanded",
                "selected_item",
                "selected_index",
                "navigate_item",
                "navigate_index",
                "total_items",
                //"items",
                "indexes",
                "is_navigate",
                "notifications"
            ];

            return JSON.stringify(
                ownKeys.map((k) => ({ [k]: this[k] })).reduce((a, b) => ({ ...a, ...b })),
                undefined,
                4
            );
        }
    };
}
