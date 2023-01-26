/**
 * DatePicker (with alpine.Js)
 * Based on Mithicher codepen https://codepen.io/mithicher/pen/VwvZaxm
 *
 * @author Kevin Leroy <kleroy@simplonprod.co>
 */
function datepicker() {
    // noinspection JSUnusedGlobalSymbols
    return {
        /** If true, the datepicker modal is shown */
        showDatepicker: false,
        /** The date formatted in input */
        datepickerValue: "",
        /** The selected month */
        month: 0,
        /** The selected year */
        year: 0,
        /** TODO */
        no_of_days: [],
        /** TODO */
        blankdays: [],
        /** Starting in sunday */
        starting_in_sunday: true,
        /** The list of days in week */
        days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        /** The list of month */
        months: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        /** The language for the date */
        language: "en-us",
        /**
         *  Initialize a datepicker
         *  @param language { string } The language format BCP 47
         *  @param starting_in_sunday {boolean}
         * */
        init(language = "en-us", starting_in_sunday=true) {
            this.language = language;
            this.starting_in_sunday = starting_in_sunday;
            this.months = [...Array(12).keys()].map((i) => {
                let obj = new Date();
                obj.setMonth(i);
                obj = obj.toLocaleString(language, { month: "long" });
                return obj.charAt(0).toUpperCase() + obj.slice(1);
            });
            this.days = [...Array(7).keys()].map((i) => {
                let obj = new Date(Date.UTC(this.starting_in_sunday ? 1978 : 1979, 0, 1));
                obj.setDate(obj.getDate() + i);
                obj = obj.toLocaleString(language, { weekday: "short" });
                return (obj.charAt(0).toUpperCase() + obj.slice(1)).replace('.', '');
            });
            let today = new Date();
            this.month = today.getMonth();
            this.year = today.getFullYear();
            this.datepickerValue = this.formatDate(new Date(this.year, this.month, today.getDate()));
        },
        /**
         * Check if the following date is today
         * @param day {int} The following day
         * @returns {boolean} Returns true if the following date is today, false otherwise
         */
        isToday(day) {
            const today = new Date();
            const d = new Date(this.year, this.month, day);
            return today.toDateString() === d.toDateString();
        },
        /**
         * Function triggered when selecting the date in the datepicker
         * @param day {int} The following date selected
         */
        setDateValue(day) {
            let selectedDate = new Date(this.year, this.month, day);
            this.datepickerValue = this.formatDate(selectedDate);
            this.$refs.date.value =
                selectedDate.getFullYear() +
                "-" +
                ("0" + (selectedDate.getMonth()+1)).slice(-2) +
                "-" +
                ("0" + selectedDate.getDate()).slice(-2);
            console.log(this.$refs.date.value);
            this.showDatepicker = false;
        },
        /**
         * Function triggered when the calendar must be built
         */
        calendar_built() {
            let daysInMonth = new Date(this.year, this.month + 1, 0).getDate();
            let dayOfWeek = new Date(this.year, this.month).getDay();
            if(!this.starting_in_sunday) {
                dayOfWeek--;
            }
            let blank_days_arr = [];
            for (let i = 1; i <= dayOfWeek; i++) {
                blank_days_arr.push(i);
            }
            let daysArray = [];
            for (let i = 1; i <= daysInMonth; i++) {
                daysArray.push(i);
            }
            this.blankdays = blank_days_arr;
            this.no_of_days = daysArray;
        },
        /**
         * Formatting the date to locale format
         * @param date {Date}
         * @returns {string}
         */
        formatDate(date) {
            return date.toLocaleString(this.language, { month: "long", day: "numeric", year: "numeric" });
        },
        /**
         * Adds the day to date and formatting the date to locale format
         * @param day {int}
         * @returns {string}
         */
        formatDay(day) {
            return this.formatDate(new Date(this.year, this.month, day));
        }
    };
}
