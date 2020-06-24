import Widget from 'enketo-core/src/js/widget';
import $ from 'jquery';
import support from 'enketo-core/src/js/support';

/**
 * Calendar widget to take ethiopian dates
 */
class EthiopianCalendar extends Widget {

    daysPerMonth = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5]
    monthNames = ['Meskerem', 'Tikemet', 'Hidar', 'Tahesas', 'Tir', 'Yekatit',
        'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagume']
    /**
     * @type {string}
     */

    static get selector() {
        return '.question input[type="ethiopian-date"]';
    }

    /**
     * @return {boolean} Whether additional condition to instantiate the widget is met.
     */
    static condition() {
        return !support.touch;
    }

    _init(){
        this.$dayInput = this._createDayInput();
        this.$monthInput = this._createMonthInput();
        this.$yearInput = this._createYearInput();
        this.ethiopianDate = require('ethiopian-date')
        this.element.classList.add('hide')
        const widget = this.question.querySelector( '.widget' );
        widget.append(this.$dayInput);
        widget.append(this.$monthInput);
        widget.append(this.$yearInput);
    }

    _createDayInput(){
        let arr = new Array(30);
        arr = [arr.map((element, index) => index+1)]
        const list= this._getListHtml(arr, -1)
        const template = this._getTemplate(list)
        return template
    }

    _createMonthInput(){
        const list= this._getListHtml(this.monthNames, -1)
        const template = this._getTemplate(list)
        return template
    }

    _createYearInput(){
        const currentYear = this.ethiopianDate.toEthiopian(2020, 6, 23)[0]
        let arr = new Array(100)
        for(var i=99; i>=0; i--){
            arr[i]=currentYear-i;
        }
        const list= this._getListHtml(arr, -1)
        const template = this._getTemplate(list)
        return template
    }

    _getTemplate(list){
        const template = range.createContextualFragment( `
        <select class="selectpicker">
            ${this._getListHtml(list)}
        </select>
        `);
        // this._showSelected( template.querySelector( '.selected' ) );
        return template;
    }

    _getListHtml(list){
        return list.map(element => `<option>${element}</option>`);
    }

    get value() {
        return this.$dayInput.val() + "/" + this.$monthInput.val() + "/" + this.$yearInput.val();
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

export default EthiopianCalendar;
