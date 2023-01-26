/**
 * Menu Navigation (with alpine.Js)
 *
 * @author Kevin Leroy <kleroy@simplonprod.co>
 * @param key {string} the key of the component (ex: default ➜ nav--default)
 * @param translations {object} a key-value pair object of translation
 */
function menu_navigation(key, translations) {
    return {
        /** The list of breakpoint */
        breakpoints: {
            xs: 400,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1170
        },
        /** Parameters of the root element */
        root: {
            /** The id of the root element */
            id: document.getElementById("nav--" + key)
        },
        /** Parameters of the burger button element */
        burger: {
            /** The id of the burger button element */
            id: document.getElementById("nav--" + key + "__burger"),
            /** If the value is `true`, the burger button is shown to the screen */
            show: false,
            /** The position of the burger button on the screen */
            position: "left",
            /**
             * Gets the text under the icon of the burger button
             * @param opened {boolean} button open state
             * @returns {string} The translation of the text
             */
            text: function (opened) {
                return translations["burger." + (opened ? "opened" : "closed")];
            }
        },
        /** Parameters of the menu */
        menu: {
            /** The id of the menu */
            id: document.getElementById("nav--" + key + "__menu"),
            /** If the value is `true`, the menu is display as fullscreen when burger button is expanded */
            fullscreen: false,
            /** If the value is `true`, the menu is expanded */
            opened: false,
            /** The selected index for focus */
            itemSelected: -1,
            /** The list of items */
            items: null
        },
        /** non-overridable variables */
        readOnly: {
            debug: {
                changeBreakpoint: false
            }
        },
        /**
         *  Initialize a menu
         *  @param override_options { object } A key-value object of options to override
         * */
        init: function (override_options) {
            Object.entries(override_options).map(
                /** @param lvl1 {[string, *]} */
                (lvl1) => {
                    if (this.hasOwnProperty(lvl1[0])) {
                        Object.entries(lvl1[1]).map(
                            /** @param lvl2 {Array.<String, *>} */
                            (lvl2) => {
                                if (lvl1[0] !== "readOnly") {
                                    if (this[lvl1[0]].hasOwnProperty(lvl2[0])) {
                                        if (typeof this[lvl1[0]][lvl2[0]] == "function") {
                                            console.error(
                                                `Wrong Parameter: "${lvl2[0]}" cannot be override a function`
                                            );
                                        } else {
                                            this[lvl1[0]][lvl2[0]] = lvl2[1];
                                        }
                                    } else {
                                        this[lvl1[0]][lvl2[0]] = lvl2[1];
                                    }
                                }
                            }
                        );
                    }
                }
            );

            this.menu.items = this.menu.id.querySelectorAll("li");

            this.onResize(window.innerWidth);
        },
        /**
         * Navigate with arrows
         * @param event {KeyboardEvent}
         */
        navigate: function (event) {
            const lr = ["ArrowLeft", "ArrowRight"];
            const tb = ["ArrowUp", "ArrowDown"];
            const pn = ["PageUp", "PageDown"];
            const ep = ["Escape"];

            if ([...lr, ...tb, ...pn , ...ep].includes(event.key)) {
                event.preventDefault();

                switch (event.key) {
                    case "ArrowUp":
                        if (event.target.tagName === "BUTTON") {
                            this.menu.opened = false;
                            this.menu.itemSelected = -1;
                        } else {
                            this.menu.itemSelected = this.menu.itemSelected === 0
                                ? this.menu.items.length - 1
                                : this.menu.itemSelected - 1;
                            this.selectItem();
                        }
                        break;
                    case "ArrowDown":
                        let changeItem = true;

                        if (event.target.tagName === "BUTTON" && !this.menu.opened) {
                            this.menu.opened = true;
                            changeItem = false;
                        }

                        if (changeItem) {
                            this.menu.itemSelected =
                                this.menu.itemSelected === this.menu.items.length - 1
                                    ? 0
                                    : this.menu.itemSelected + 1;

                            this.selectItem();
                        }
                        break;
                    case "PageUp":
                        this.menu.itemSelected = 0;
                        break;
                    case "PageDown":
                        this.menu.itemSelected = this.menu.items.length - 1;
                        break;
                    case "Escape":
                        this.menu.opened = false;
                        this.menu.itemSelected = -1;
                        this.burger.id.focus();
                        break;
                }
            }
        },
        /**
         * OnResize Event
         * @param size {int} The screen width in pixel
         */
        onResize: function (size) {
            this.define_show("burger", size);
        },
        /**
         * Define the show or hide of an element based on the screen width
         * @param elmName {string} the element name [burger, menu]
         * @param size {int} The screen width in pixel
         */
        define_show: function (elmName, size) {
            const elm = this[elmName];
            let versions = [...new Array(2)].fill(elm["show"]);

            if (elm.hasOwnProperty("before") && elm.hasOwnProperty("after")) {
                versions[1] =
                    size <= this.breakpoints[elm["before"]] && size >= this.breakpoints[elm["after"]];
            } else if (elm.hasOwnProperty("before")) {
                versions[1] = size <= this.breakpoints[elm["before"]];
            } else if (elm.hasOwnProperty("after")) {
                versions[1] = size >= this.breakpoints[elm["after"]];
            } else {
                versions[1] = true;
            }

            if (versions[0] !== versions[1]) {
                if (this.readOnly.debug.changeBreakpoint) {
                    console.info(`Change ${elmName}: ${versions[0]} => ${versions[1]}`);
                }
                elm["show"] = versions[1];
            }
        },
        /**
         * Focus the current selected item
         */
        selectItem: function () {
            this.menu.items[this.menu.itemSelected].firstElementChild.focus();
        }
    };
}
