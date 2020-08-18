import Widget from 'enketo-core/src/js/widget';
import support from 'enketo-core/src/js/support';

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
     * @return {boolean} Whether additional condition to instantiate the widget is met.
     */
    static condition() {
        return !support.touch;
    }

    _init(){
        this.daysPerMonth = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5];
        this.monthNames = ['Meskerem', 'Tikemet', 'Hidar', 'Tahesas', 'Tir', 'Yekatit',
            'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'];

        this.dateArr = ['0','0','0']

        this.element.classList.add('hide');

        //Create widget's DOM function
        const fragment = document.createRange().createContextualFragment(
            `<div class="ethiopian-calendar widget" style="display: flex;" >
                            <input class="hide ignore" type="text"/>
                            ${this._createDayInput()}
                            ${this._createMonthInput()}
                            ${this._createYearInput()}
                        </div>`
        )

        this.element.after(fragment);

        const widget = this.element.parentElement.querySelector('.widget')
        this.$dayInput = widget.querySelector('#day')
        this.$monthInput = widget.querySelector('#month')
        this.$yearInput = widget.querySelector('#year')
        // this.$dayInput = this.question.querySelector( 'input' );
        // ["day","month","year"].forEach((value) => {
        //     widget.querySelector('#'+value).addEventListener('change', this._change.bind(this))
        // })

        this.value = this.originalInputValue;

        this.$dayInput.addEventListener('change', this._change.bind(this))
        this.$monthInput.addEventListener('change', this._change.bind(this))
        this.$yearInput.addEventListener('change', this._change.bind(this))
    }

    _createDayInput(){
        let arr = new Array(30);
        arr = Array.apply(1, arr).map((element, index) => (index+1));
        const list= this._getListHtml(arr, -1);
        const template = this._getTemplate(list, "day");
        return template;
    }

    _createMonthInput(){
        const list= this._getListHtml(this.monthNames, -1);
        const template = this._getTemplate(list, "month");
        return template;
    }

    _createYearInput(){
        const currentYear = toEthiopian(2020, 6, 23)[0];
        let arr = new Array(100);
        for(var i=99; i>=0; i--){
            arr[i]=currentYear-i;
        }
        const list= this._getListHtml(arr, -1);
        const template = this._getTemplate(list, "year");
        return template;
    }

    _getTemplate(list, id){
        const template = `
        <select class="selectpicker" id="${id}">
            ${list.reduce((a,b) => a+b)}
        </select>
        `
        // this._showSelected( template.querySelector( '.selected' ) );
        // template.addEventListener('change', this._change.bind(this))
        // this._addOnChangeListener(template)
        return template;
    }

    _change( ev ) {
        // propagate value changes to original input and make sure a change event is fired
        let index = {"day": 0, "month": 1, "year": 2}[ev.target.id]
        this.dateArr[index] = ev.target.value
        // this.dateInput.value = this.dateArr.reduce((prev, curr) => p+"/"+c)
        // this.originalInputValue = this.dateArr.reduce((prev, curr) => prev+"/"+curr)
        this.originalInputValue = 'testindex'
        console.log("onChange: " + this.originalInputValue)
    }

    _getListHtml(list){
        return list.map(element => `<option>${element}</option>`);
    }

    /**
     * @type {string}
     */
    get displayedValue() {
        return this.originalInputValue;
    }

    update() {
        // super.update();
        this.value = this.originalInputValue;
    }

    get value() {
        console.log("get: "+this.originalInputValue)
        return this.originalInputValue
    }

    set value(value) {
        let arr = value.split("/")
        if(arr.length === 3){
            this.dateArr = arr
            this.$dayInput.value = this.dateArr[0]
            this.$monthInput.value = this.dateArr[1]
            this.$yearInput.value = this.dateArr[2]
            this.originalInputValue = value
        }
    }

    // _getListHtml(options, selectedIndex ) {
    //     const inputAttr = `type="radio" name="${Math.random() * 100000}"`;
    //     return options
    //         .map( (option, i) => {
    //             const label = option;
    //             const selected = i === selectedIndex;
    //             const value = option;
    //             if ( value ) {
    //                 const checkedInputAttr = selected ? ' checked="checked"' : '';
    //                 const checkedLiAttr = selected ? 'class="active"' : '';
    //                 /**
    //                  * e.g.:
    //                  * <li checked="checked">
    //                  *   <a class="option-wrapper" tabindex="-1" href="#">
    //                  *         <label>
    //                  *           <input class="ignore" type="checkbox" checked="checked" value="a"/>
    //                  *         </label>
    //                  *       </a>
    //                  *    </li>
    //                  */
    //                 return `
    //                     <li ${checkedLiAttr}>
    //                         <a class="option-wrapper" tabindex="-1" href="#">
    //                             <label>
    //                                 <input class="ignore" ${inputAttr}${checkedInputAttr} value="${value}" />
    //                                 <span class="option-label">${label}</span>
    //                             </label>
    //                         </a>
    //                     </li>`;
    //             } else {
    //                 return '';
    //             }
    //         } ).join( '' );
    // }
    //
    // /**
    //
    //  * Handles click listener
    //
    //  */
    //
    // _clickListener(element) {
    //     const _this = this;
    //     $( element )
    //         .on( 'click', 'li:not(.disabled)', function( e ) {
    //             const li = this;
    //             const input = li.querySelector( 'input' );
    //             const select = _this.element;
    //             const option = select.querySelector( `option[value="${input.value}"]` );
    //             const selectedBefore = option.matches( ':checked' );
    //             // We need to prevent default unless click was on an input
    //             // Without this 'fix', clicks on radiobuttons/checkboxes themselves will update the value
    //             // but will not show checked status.
    //             if ( e.target.nodeName.toLowerCase() !== 'input' ) {
    //                 e.preventDefault();
    //             }
    //             element.querySelectorAll( 'li' ).forEach( li=> li.classList.remove( 'active' ) );
    //             getSiblingElementsAndSelf( option, 'option' ).forEach( option => { option.selected = false; } );
    //             element.querySelectorAll( 'input' ).forEach( input  => input.checked = false );
    //
    //             // For issue https://github.com/kobotoolbox/enketo-express/issues/1122 in FF,
    //             // we had to use event.preventDefault() on <a> tag click events.
    //             // This broke view updates when clicking on the radiobuttons and checkboxes directly
    //             // although the underlying values did change correctly.
    //             //
    //             // It has to do with event propagation. I could not figure out how to fix it.
    //             // Therefore I used a workaround by slightly delaying the status changes.
    //             setTimeout( () => {
    //                 if ( selectedBefore ) {
    //                     li.classList.remove( 'active' );
    //                     input.checked = false;
    //                     option.selected = false;
    //                 } else {
    //                     li.classList.add( 'active' );
    //                     option.selected = true;
    //                     input.checked = true;
    //                 }
    //                 const showSelectedEl = element.querySelector( '.selected' );
    //                 _this._showSelected( showSelectedEl );
    //                 select.dispatchEvent( new event.Change() );
    //             }, 10 );
    //         } )
    //         .on( 'keydown', 'li:not(.disabled)', e => {
    //             const keyCode = e.keyCode.toString( 10 );
    //             // Enter/Space keys
    //             if ( /(13|32)/.test( keyCode ) ) {
    //                 if ( !/(32)/.test( keyCode ) ) {
    //                     e.preventDefault();
    //                 }
    //                 const elem = $( ':focus' );
    //                 elem.click();
    //                 // Prevent screen from scrolling if the user hit the spacebar
    //                 e.preventDefault();
    //             }
    //         } )
    //         .on( 'click', 'li.disabled', e => {
    //             e.stopPropagation();
    //             return false;
    //         } )
    //         .on( 'click', 'a', e => {
    //             // Prevent FF from adding empty anchor to URL if checkbox or radiobutton is clicked.
    //             // https://github.com/kobotoolbox/enketo-express/issues/1122
    //             e.preventDefault();
    //         } );
    // }

    /**
     * Handles focus listener
     */

    // _focusListener() {
    //     const _this = this;
    //     // Focus on original element (form.goTo functionality)
    //     this.element.addEventListener( events.ApplyFocus().type, () => {
    //         _this.picker.querySelector( '.dropdown-toggle' ).focus();
    //     } );
    // }

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
