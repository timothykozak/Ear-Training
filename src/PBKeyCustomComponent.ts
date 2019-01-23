// A custom component used to input a value.
// It is made up of several standard components
// stacked on top of each other.

class PBKeyCustomComponent extends HTMLElement {
    constructor() {
        const SLIDER_MIN = 0;
        const SLIDER_MAX = 25;
        const DIV_WIDTH = 40;
        const SLIDER_HEIGHT = 100;

        // Always call super() first
        super();

        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

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
        sliderElement.setAttribute('min', SLIDER_MIN.toString());
        sliderElement.setAttribute('max', SLIDER_MAX.toString());
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
        valueElement.setAttribute('min', SLIDER_MIN.toString());
        valueElement.setAttribute('max', SLIDER_MAX.toString());
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
                width: ${DIV_WIDTH}px;
                position: absolute;
                top: ${wrapperY}px;
                left: ${wrapperX}px;
                text-align: center;
                background: green;
                opacity: 0.75;
            }
            
            .sliderDiv {
                width: ${DIV_WIDTH}px;
                height: ${SLIDER_HEIGHT}px;
                padding-bottom: 5px;
            }
            
            .stackedSlider {
                width: ${SLIDER_HEIGHT}px;
                height: ${DIV_WIDTH}px;
                transform-origin: ${SLIDER_HEIGHT / 2}px ${SLIDER_HEIGHT / 2}px;
                transform: rotate(-90deg);
            }
            
            .valueElement {
                width: ${DIV_WIDTH - 10}px;
            }
            
            .labelElement {
                display-inline: block;
            }
              
            .stackedElement {
                width: ${DIV_WIDTH}px;
            }
          }
        `;

        // Attach the created elements to the shadow dom
        shadow.appendChild(style);
        shadow.appendChild(wrapperElement);
        sliderDiv.appendChild(sliderElement);
        wrapperElement.appendChild(sliderDiv);
        wrapperElement.appendChild(valueElement);
        wrapperElement.appendChild(checkboxElement);
        wrapperElement.appendChild(labelElement);
    }
}

// Define the new element
customElements.define('key-component', PBKeyCustomComponent);
