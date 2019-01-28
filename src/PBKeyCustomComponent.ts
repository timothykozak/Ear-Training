// A custom component used to input a value.
// It is made up of several standard components
// stacked on top of each other.

class PBKeyCustomComponent extends HTMLElement {
    static SLIDER_MIN = 0;
    static SLIDER_MAX = 25;
    static DIV_WIDTH = 40;
    static SLIDER_HEIGHT = 100;

    shadow: ShadowRoot;
    
    constructor() {

        // Always call super() first
        super();

        // Create a shadow root
        this.shadow = this.attachShadow({mode: 'open'});

        // This element wraps all of the other elements and is absolute positioned
        // using attributes defined in the html.
        const wrapperElement = document.createElement('div');
        wrapperElement.setAttribute('class', 'wrapperDiv');
        let wrapperX = (this.hasAttribute('x')) ? this.getAttribute('x') : 100;
        let wrapperY = (this.hasAttribute('y')) ? this.getAttribute('y') : 100;

        // This element will hold the actual slider.
        // Need to do this for proper positioning.
        const sliderDiv = document.createElement('div');
        sliderDiv.setAttribute('class', 'sliderDiv');

        // The slider element itself.
        // It will be rotated in CSS.
        // The slider and the value element interact with each other.
        const sliderElement = document.createElement('input');
        sliderElement.setAttribute('type', 'range');
        sliderElement.setAttribute('class', 'stackedSlider');
        sliderElement.setAttribute('min', PBKeyCustomComponent.SLIDER_MIN.toString());
        sliderElement.setAttribute('max', PBKeyCustomComponent.SLIDER_MAX.toString());
        sliderElement.setAttribute('value', '5');
        sliderElement.oninput = (event) => {valueElement.value = (<HTMLInputElement>event.target).value;};

        // Used to disable the custom component.
        const checkboxElement = document.createElement('input');
        checkboxElement.setAttribute('type', 'checkbox');
        checkboxElement.setAttribute('class', 'stackedElement');
        checkboxElement.oninput = (event) => {
            if ((<HTMLInputElement>event.target).checked) {
                sliderElement.removeAttribute('disabled');
                valueElement.removeAttribute('disabled');
            } else {
                sliderElement.setAttribute('disabled', 'disabled');
                valueElement.setAttribute('disabled', 'disabled');
            }
        };

        // The element with the numeric value.
        // Interacts with the slider.
        const valueElement = document.createElement('input');
        valueElement.setAttribute('type', 'number');
        valueElement.setAttribute('class', 'valueElement');
        valueElement.setAttribute('min', PBKeyCustomComponent.SLIDER_MIN.toString());
        valueElement.setAttribute('max', PBKeyCustomComponent.SLIDER_MAX.toString());
        valueElement.value = '5';
        valueElement.oninput = (event) => {sliderElement.value = (<HTMLInputElement>event.target).value;};

        // Just a static label that is set in the html.
        const labelElement = document.createElement('div');
        labelElement.setAttribute('class', 'labelElement');
        labelElement.innerText = (this.hasAttribute('label')) ? this.getAttribute('label') : 'None';

        // Create some CSS to apply to the shadow dom.
        const style = document.createElement('style');
        style.textContent = `
            .wrapperDiv {
                width: ${PBKeyCustomComponent.DIV_WIDTH}px;
                position: absolute;
                top: ${wrapperY}px;
                left: ${wrapperX}px;
                text-align: center;
                background: green;
                opacity: 0.75;
            }
            
            .sliderDiv {
                width: ${PBKeyCustomComponent.DIV_WIDTH}px;
                height: ${PBKeyCustomComponent.SLIDER_HEIGHT}px;
                padding-bottom: 5px;
            }
            
            .stackedSlider {
                width: ${PBKeyCustomComponent.SLIDER_HEIGHT}px;
                height: ${PBKeyCustomComponent.DIV_WIDTH}px;
                transform-origin: ${PBKeyCustomComponent.SLIDER_HEIGHT / 2}px ${PBKeyCustomComponent.SLIDER_HEIGHT / 2}px;
                transform: rotate(-90deg);
            }
            
            .valueElement {
                width: ${PBKeyCustomComponent.DIV_WIDTH - 10}px;
            }
            
            .labelElement {
                display-inline: block;
            }
              
            .stackedElement {
                width: ${PBKeyCustomComponent.DIV_WIDTH}px;
            }
          }
        `;

        // Attach the created elements to the shadow dom
        this.shadow.appendChild(style);
        this.shadow.appendChild(wrapperElement);
        sliderDiv.appendChild(sliderElement);
        wrapperElement.appendChild(sliderDiv);
        wrapperElement.appendChild(valueElement);
        wrapperElement.appendChild(checkboxElement);
        wrapperElement.appendChild(labelElement);
    }
}

export {PBKeyCustomComponent};