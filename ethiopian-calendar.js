import Widget from 'enketo-core/src/js/widget';
import support from 'enketo-core/src/js/support';

/**
 * Calendar widget to take ethiopian dates
 */
class EthiopianCalendar extends Widget {

    /**
     * The selector that determines on which form control the widget is instantiated.
     * Make sure that any other widgets that target the same from control are not interfering with this widget by disabling
     * the other widget or making them complementary.
     * This function is always required.
     */
    static get selector() {
        return '.or-appearance-my-widget input[type="number"]';
    }

    /**
     * Initialize the widget that has been instantiated using the Widget (super) constructor.
     * The _init function is called by that super constructor unless that constructor is overridden.
     * This function is always required.
     */
    _init() {
        // Hide the original input
        this.element.classList.add( 'hide' );

        // Create the widget's DOM fragment.
        const fragment = document.createRange().createContextualFragment(
            `<div class="widget">
                <input class="ignore" type="range" min="0" max="100" step="1"/>
            </div>`
        );
        fragment.querySelector( '.widget' ).appendChild( this.resetButtonHtml );

        // Only when the new DOM has been fully created as a HTML fragment, we append it.
        this.element.after( fragment );

        const widget = this.element.parentElement.querySelector( '.widget' );
        this.range = widget.querySelector( 'input' );

        // Set the current loaded value into the widget
        this.value = this.originalInputValue;

        // Set event handlers for the widget
        this.range.addEventListener( 'change', this._change.bind( this ) );
        widget.querySelector( '.btn-reset' ).addEventListener( 'click', this._reset.bind( this ) );

        // This widget initializes synchronously so we don't return anything.
        // If the widget initializes asynchronously return a promise that resolves to `this`.
    }

    _reset() {
        this.value = '';
        this.originalInputValue = '';
        this.element.classList.add( 'empty' );
    }

    _change( ev ) {
        // propagate value changes to original input and make sure a change event is fired
        this.originalInputValue = ev.target.value;
        this.element.classList.remove( 'empty' );
    }

    /**
     * Disallow user input into widget by making it readonly.
     */
    disable() {
        this.range.disabled = true;
    }

    /**
     * Performs opposite action of disable() function.
     */
    enable() {
        this.range.disabled = false;
    }

    /**
     * Update the language, list of options and value of the widget.
     */
    update() {
        this.value = this.originalInputValue;
    }

    /**
     * Obtain the current value from the widget. Usually required.
     *
     * @type {*}
     */
    get value() {
        return this.element.classList.contains( 'empty' ) ? '' : this.range.value;
    }

    /**
     * Set a value in the widget. Usually required.
     *
     * @param {*} value - value to set
     */
    set value( value ) {
        this.range.value = value;
    }

}

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var Exception = function Exception(message) {
    this.message = message;
    this.name = 'Exception';
};

var startDayOfEthiopian = function startDayOfEthiopian(year) {
    var newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
    // if the prev ethiopian year is a leap year, new-year occrus on 12th
    return (year - 1) % 4 === 3 ? newYearDay + 1 : newYearDay;
};

var toGregorian = function toGregorian(dateArray) {
    // Allow argument to be array year, month, day, or 3 separate params
    var inputs = dateArray.constructor === Array ? dateArray : [].slice.call(arguments);

    // prevent incorect input
    if (inputs.indexOf(0) !== -1 || inputs.indexOf(null) !== -1 || inputs.indexOf(undefined) !== -1 || inputs.length !== 3) {
        throw new Exception("Malformed input can't be converted.");
    }

    var _inputs = _slicedToArray(inputs, 3),
        year = _inputs[0],
        month = _inputs[1],
        date = _inputs[2];

    // Ethiopian new year in Gregorian calendar


    var newYearDay = startDayOfEthiopian(year);

    // September (Ethiopian) sees 7y difference
    var gregorianYear = year + 7;

    // Number of days in gregorian months
    // starting with September (index 1)
    // Index 0 is reserved for leap years switches.
    // Index 4 is December, the final month of the year.
    var gregorianMonths = [0.0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30];

    // if next gregorian year is leap year, February has 29 days.
    var nextYear = gregorianYear + 1;
    if (nextYear % 4 === 0 && nextYear % 100 !== 0 || nextYear % 400 === 0) {
        gregorianMonths[6] = 29;
    }

    // calculate number of days up to that date
    var until = (month - 1) * 30.0 + date;
    if (until <= 37 && year <= 1575) {
        // mysterious rule
        until += 28;
        gregorianMonths[0] = 31;
    } else {
        until += newYearDay - 1;
    }

    // if ethiopian year is leap year, paguemain has six days
    if (year - 1 % 4 === 3) {
        until += 1;
    }

    // calculate month and date incremently
    var m = 0;
    var gregorianDate = void 0;
    for (var i = 0; i < gregorianMonths.length; i++) {
        if (until <= gregorianMonths[i]) {
            m = i;
            gregorianDate = until;
            break;
        } else {
            m = i;
            until -= gregorianMonths[i];
        }
    }

    // if m > 4, we're already on next Gregorian year
    if (m > 4) {
        gregorianYear += 1;
    }

    // Gregorian months ordered according to Ethiopian
    var order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    gregorianMonths = order[m];
    return [gregorianYear, gregorianMonths, gregorianDate];
};

var toEthiopian = function toEthiopian(dateArray) {
    // Allow argument to be array year, month, day, or 3 separate params
    var inputs = dateArray.constructor === Array ? dateArray : [].slice.call(arguments);

    // prevent incorect input
    if (inputs.indexOf(0) !== -1 || inputs.indexOf(null) !== -1 || inputs.indexOf(undefined) !== -1 || inputs.length !== 3) {
        throw new Exception("Malformed input can't be converted.");
    }

    var _inputs2 = _slicedToArray(inputs, 3),
        year = _inputs2[0],
        month = _inputs2[1],
        date = _inputs2[2];

    // date between 5 and 14 of May 1582 are invalid


    if (month === 10 && date >= 5 && date <= 14 && year === 1582) {
        throw new Exception('Invalid Date between 5-14 May 1582.');
    }

    // Number of days in gregorian months
    // starting with January (index 1)
    // Index 0 is reserved for leap years switches.
    var gregorianMonths = [0.0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Number of days in ethiopian months
    // starting with January (index 1)
    // Index 0 is reserved for leap years switches.
    // Index 10 is month 13, the final month of the year
    var ethiopianMonths = [0.0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30];

    // if gregorian leap year, February has 29 days.
    if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
        gregorianMonths[2] = 29;
    }

    // September sees 8y difference
    var ethiopianYear = year - 8;

    // if ethiopian leap year pagumain has 6 days
    if (ethiopianYear % 4 === 3) {
        ethiopianMonths[10] = 6;
    }

    // Ethiopian new year in Gregorian calendar
    var newYearDay = startDayOfEthiopian(year - 8);

    // calculate number of days up to that date
    var until = 0;
    for (var i = 1; i < month; i++) {
        until += gregorianMonths[i];
    }
    until += date;

    // update tahissas (december) to match january 1st
    var tahissas = ethiopianYear % 4 === 0 ? 26 : 25;

    // take into account the 1582 change
    if (year < 1582) {
        ethiopianMonths[1] = 0;
        ethiopianMonths[2] = tahissas;
    } else if (until <= 277 && year === 1582) {
        ethiopianMonths[1] = 0;
        ethiopianMonths[2] = tahissas;
    } else {
        tahissas = newYearDay - 3;
        ethiopianMonths[1] = tahissas;
    }

    // calculate month and date incremently
    var m = void 0;
    var ethiopianDate = void 0;
    for (m = 1; m < ethiopianMonths.length; m++) {
        if (until <= ethiopianMonths[m]) {
            ethiopianDate = m === 1 || ethiopianMonths[m] === 0 ? until + (30 - tahissas) : until;
            break;
        } else {
            until -= ethiopianMonths[m];
        }
    }

    // if m > 10, we're already on next Ethiopian year
    if (m > 10) {
        ethiopianYear += 1;
    }

    // Ethiopian months ordered according to Gregorian
    var order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
    var ethiopianMonth = order[m];
    return [ethiopianYear, ethiopianMonth, ethiopianDate];
};

export default EthiopianCalendar;
