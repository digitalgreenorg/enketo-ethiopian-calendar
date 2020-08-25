import $ from 'jquery';
import Widget from 'enketo-core/src/js/widget';
import support from 'enketo-core/src/js/support';
import event from "enketo-core/src/js/event";
import {getSiblingElementsAndSelf} from "enketo-core/src/js/dom-utils";
import events from "enketo-core/src/js/event";
import { t } from 'enketo/translator';
import input from "enketo-core/src/js/input";


const range = document.createRange();

/**
 * Calendar widget to take ethiopian dates
 */
class EthiopianCalendar extends Widget {
    /**
     * @type {string}
     */
    static get selector() {
        return '.or-appearance-ethiopian-date input[type="text"]';
    }

    /**
     * @type {boolean}
     */
    static get list() {
        return false;
    }

    /**
     * @return {boolean} Whether additional condition to instantiate the widget is met.
     */
    static condition() {
        return !support.touch;
    }

    _init() {
        const input =  this.element;
        this.monthNames = ['Meskerem', 'Tikemet', 'Hidar', 'Tahesas', 'Tir', 'Yekatit',
            'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'];
        this.$dayOptions = this.getDayOptions()
        this.$monthOptions = this.getMonthOptions()
        this.$yearOptions = this.getYearOptions()
        input.style.display = 'none';
        const dayTemplate = this._getTemplate(this.$dayOptions, "day_input");
        const monthTemplate = this._getTemplate(this.$monthOptions, "month_input");
        const yearTemplate = this._getTemplate(this.$yearOptions, "year_input");
        input.after(yearTemplate);
        input.after( monthTemplate );
        input.after( dayTemplate );
        this.values = ['0','0','0']
        this.dayPicker = this.question.querySelector( '#day_input' );
        this.monthPicker = this.question.querySelector( '#month_input' );
        this.yearPicker = this.question.querySelector( '#year_input' );
        if ( this.props.readonly ) {
            this.disable();
        }
        this._clickListener(this.dayPicker);
        this._clickListener(this.monthPicker);
        this._clickListener(this.yearPicker);
        this._focusListener();
    }

    /**
     * @return {Element} HTML fragment
     */
    _getTemplate(options, input_id) {
        const template = range.createContextualFragment( `
        <div id="${input_id}" class="btn-group ethiopian-date bootstrap-select widget clearfix">
            <button type="button" class="btn btn-default dropdown-toggle clearfix" data-toggle="dropdown">
                <span class="selected"></span><span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">${this._getLisHtml(options)}</ul>
        </div>` );
        this._showSelected( template.querySelector( '.selected' ), input_id );

        return template;
    }

    getDayOptions(){
        let arr = new Array(30);
        arr = Array.apply(1, arr).map((element, index) => (index+1));
        let options = range.createContextualFragment(arr.map(op => `<option value="${op}">${op}</option>`).join(''))
        return options
    }

    getMonthOptions(){
        let options = range.createContextualFragment(this.monthNames.map((op, index) => `<option value="${index+1}">${op}</option>`).join(''))
        return options
    }

    getYearOptions(){
        const now = new Date()
        const currentYear = toEthiopian(now.getFullYear(), now.getMonth(), now.getDate())[0];
        let arr = new Array(100);
        for(let i=99; i>=0; i--){
            arr[i]=currentYear-i;
        }
        let options = range.createContextualFragment(arr.map(op => `<option value="${op}">${op}</option>`).join(''))
        return options
    }

    /**
     * Generates HTML text for <li> elements
     */
    _getLisHtml(options) {
        const inputAttr = `type="radio" name="${Math.random() * 100000}"`

        return [ ...options.querySelectorAll('option') ]
            .map( option => {
                const label = option.textContent;
                const selected = option.matches( ':checked' );
                const value = option.value;
                if ( value ) {
                    const checkedInputAttr = selected ? ' checked="checked"' : '';
                    const checkedLiAttr = selected ? 'class="active"' : '';

                    /**
                     * e.g.:
                     * <li checked="checked">
                     *   <a class="option-wrapper" tabindex="-1" href="#">
                     *         <label>
                     *           <input class="ignore" type="checkbox" checked="checked" value="a"/>
                     *         </label>
                     *       </a>
                     *    </li>
                     */
                    return `
                        <li ${checkedLiAttr}>
                            <a class="option-wrapper" tabindex="-1" href="#">
                                <label>
                                    <input class="ignore" ${inputAttr}${checkedInputAttr} value="${value}" />
                                    <span class="option-label">${label}</span>
                                </label>
                            </a>
                        </li>`;
                } else {
                    return '';
                }
            } ).join( '' );
    }

    /**
     * Update text to show in closed picker
     *
     * @param {Element} el - HTML element to show text in
     * @param {String} input_id - ID of the input calling this selector
     */
    _showSelected( el, input_id) {
        const selectedLabels = [ ...this._getOptionFromPicker(input_id).querySelectorAll( 'option:checked' ) ]
            .filter( option =>  option.getAttribute( 'value' ).length )
            .map( option => option.textContent );

        // keys for i18next parser to pick up:
        // t( 'selectpicker.numberselected' );

        if ( selectedLabels.length === 0 ) {
            // do not use variable for translation key to not confuse i18next-parser
            el.textContent = t( 'selectpicker.noneselected' );
            el.dataset.i18n =  'selectpicker.noneselected';
            delete el.dataset.i18nNumber;

        } else if ( selectedLabels.length === 1 ) {
            el.textContent = selectedLabels[ 0 ];
            delete el.dataset.i18n;
            delete el.dataset.i18nNumber;
        } else {
            const number = selectedLabels.length;
            // do not use variable for translation key to not confuse i18next-parser
            el.textContent = t( 'selectpicker.numberselected', { number } );
            el.dataset.i18n = 'selectpicker.numberselected';
            el.dataset.i18nNumber = number ;
        }
    }

    _getOptionFromPicker(input_id){
        if(input_id === "day_input"){
            return this.$dayOptions
        } else if(input_id === "month_input")
            return this.$monthOptions
        else
            return this.$yearOptions
    }

    _getValueFrom(picker, value){
        const index = {
            "day_input": 0,
            "month_input": 1,
            "year_input": 2
        }[picker.id]
        this.values[index] = value
        console.log(this.values)
        console.log(this.values[2], this.values[1], this.values[0])
        console.log(toGregorian(this.values[2], this.values[1], this.values[0]).join('-'))
        console.log(toGregorian(parseInt(this.values[2]), parseInt(this.values[1]), parseInt(this.values[0])).join('-'))
        return toGregorian(parseInt(this.values[2]), parseInt(this.values[1]), parseInt(this.values[0])).join('-')
    }

    /**
     * Handles click listener
     */
    _clickListener(picker) {
        const _this = this;

        $(picker)
            .on( 'click', 'li:not(.disabled)', function( e ) {
                const li = this;
                const input = li.querySelector( 'input' );
                const oInput = _this.element;
                const option = _this._getOptionFromPicker(picker.id).querySelector( `option[value="${input.value}"]` );
                // const selectedBefore = option.matches( ':checked' );

                // We need to prevent default unless click was on an input
                // Without this 'fix', clicks on radiobuttons/checkboxes themselves will update the value
                // but will not show checked status.
                if ( e.target.nodeName.toLowerCase() !== 'input' ) {
                    e.preventDefault();
                }

                picker.querySelectorAll( 'li' ).forEach( li=> li.classList.remove( 'active' ) );
                getSiblingElementsAndSelf( option, 'option' ).forEach( option => { option.selected = false; } );
                picker.querySelectorAll( 'input' ).forEach( input  => input.checked = false );

                // For issue https://github.com/kobotoolbox/enketo-express/issues/1122 in FF,
                // we had to use event.preventDefault() on <a> tag click events.
                // This broke view updates when clicking on the radiobuttons and checkboxes directly
                // although the underlying values did change correctly.
                //
                // It has to do with event propagation. I could not figure out how to fix it.
                // Therefore I used a workaround by slightly delaying the status changes.
                setTimeout( () => {
                    // if ( selectedBefore ) {
                    //     li.classList.remove( 'active' );
                    //     input.checked = false;
                    //     option.selected = false;
                    //     oInput.value = ''
                    // } else {
                        li.classList.add( 'active' );
                        option.selected = true;
                        input.checked = true;
                        oInput.value = _this._getValueFrom(picker, option.value)
                    // }

                    const showSelectedEl = picker.querySelector( '.selected' );
                    _this._showSelected( showSelectedEl, picker.id );

                    oInput.dispatchEvent( new event.Change() );
                }, 10 );

            } )
            .on( 'keydown', 'li:not(.disabled)', e => {
                const keyCode = e.keyCode.toString( 10 );
                // Enter/Space keys
                if ( /(13|32)/.test( keyCode ) ) {
                    if ( !/(32)/.test( keyCode ) ) {
                        e.preventDefault();
                    }
                    const elem = $( ':focus' );
                    elem.click();
                    // Bring back focus for multiselects
                    elem.focus();
                    // Prevent screen from scrolling if the user hit the spacebar
                    e.preventDefault();
                }
            } )
            .on( 'click', 'li.disabled', e => {
                e.stopPropagation();

                return false;
            } )
            .on( 'click', 'a', e => {
                // Prevent FF from adding empty anchor to URL if checkbox or radiobutton is clicked.
                // https://github.com/kobotoolbox/enketo-express/issues/1122
                e.preventDefault();
            } );
    }

    /**
     * Handles focus listener
     */
    _focusListener() {
        const _this = this;

        // Focus on original element (form.goTo functionality)
        this.element.addEventListener( events.ApplyFocus().type, () => {
            _this.dayPicker.querySelector( '.dropdown-toggle' ).focus();
        } );
    }

    /**
     * Disables widget
     */
    disable() {
        this.dayPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.add( 'disabled' );
            const input = el.querySelector( 'input' );
            // are both below necessary?
            input.disabled = true;
            input.readOnly = true;
        } );
        this.monthPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.add( 'disabled' );
            const input = el.querySelector( 'input' );
            // are both below necessary?
            input.disabled = true;
            input.readOnly = true;
        } );
        this.yearPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.add( 'disabled' );
            const input = el.querySelector( 'input' );
            // are both below necessary?
            input.disabled = true;
            input.readOnly = true;
        } );
    }

    /**
     * Enables widget
     */
    enable() {
        this.dayPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.remove( 'disabled' );
            const input = el.querySelector( 'input' );
            input.disabled = false;
            input.readOnly = false;
        } );
        this.monthPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.remove( 'disabled' );
            const input = el.querySelector( 'input' );
            input.disabled = false;
            input.readOnly = false;
        } );
        this.yearPicker.querySelectorAll( 'li' ).forEach( el => {
            el.classList.remove( 'disabled' );
            const input = el.querySelector( 'input' );
            input.disabled = false;
            input.readOnly = false;
        } );
    }

    /**
     * Updates widget
     */
    update() {
        this.dayPicker.remove();
        this.monthPicker.remove();
        this.yearPicker.remove();
        this._init();
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
