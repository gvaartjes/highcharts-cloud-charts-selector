'use strict';
/*global Highcharts*/
document.addEventListener('DOMContentLoaded', () => {

  // Here go your chart hashes
  let hashArr = ['GBanZitX-', '7wUBl0Fdj', 'zh90QUuF5'];
  // Element holding all divs where the charts get loaded to
  let chartHolder = document.querySelector('.chart-holder');
  // The dropdown element
  let dd = document.querySelector('select[name="dd"]');
  // prefix of the Highcharts chart containers
  let prefixId = 'highcharts-';

  /**
   * Create a div element as container for the chart. Add the injection script
   * from HighchartsCloud to this div element
   * @param {Element} parentElem
   * @param {string} chartHash
   * @param {boolean} hidden
   */
  let createChartDiv = (parentElem, chartHash, hidden) => {
    let script = document.createElement('script');
    script.src = `https://cloud.highcharts.com/inject/${chartHash}/`;
    script.defer = 'defer';
    let div = document.createElement('div');
    div.id = `highcharts-${chartHash}`;
    if (hidden) {
      div.classList.add('hidden');
    }
    div.appendChild(script);
    parentElem.appendChild(div);
  };

  /**
    * Pass a function and makes sure it runs a max number of times, or until
    * condition is approved
    * @param {number} counter - Give in the number the function has to check for
    * a condition
    * @param {Function} testFunc - The function that checks the condition,
    * should return a boolean
    * @param {Function} performFunc - If the condition is met, Run this function
    * @param {number} wait - Wait the number in milliseconds
    */
  let recursiveFunctionWithTimeout = (counter, testFunc, performFunc, wait) => {
    counter--;
    setTimeout(() => {
      if (testFunc()) {
        performFunc();
      } else if (counter > 0) {
        recursiveFunctionWithTimeout(counter, testFunc, performFunc, wait);
      }
    }, wait);
  };

  /**
    * The onchange handler that wil show/hide chart containers, by changing
    * the CSS class of the element. It also updates the overlay span that
    * mimics a dropdown.
    * @param {Event} event - The onchange event fired by the dropdown menu
    */
  let changeEventHandler = (event) => {
  // Iterate over the chart containers
  for (let div of chartHolder.children) {
    // If the selection event macthes the chart container hide/unhide it
    if (div.id === prefixId + event.target.value) {
      // Unhide
      div.classList.remove('hidden');
      // Reflow
      Highcharts.charts.map((chart) => {
        // Todo: improve reflow, only for the visible div?
        chart.reflow();
      });
    } else {
      div.classList.add('hidden');
    }
  }
  // set chart title to overlay dropdown
   labelElem.innerHTML = dropdownElem.selectedOptions[0].innerText;
  };

  /**
   * Create an option element set the chart-hash as value, so we have a link
   * between option select and the div we have to unhide later on.
   * @param {string} chartHash
   * @param {string} chartTitle
   * @returns {HTMLOptionElement}
   */
  let createOptionForDropdown = function(chartHash, chartTitle) {
    let option = document.createElement('option');
    option.value = chartHash;
    option.innerHTML = chartTitle;
    return option;
  };

  /**
   * Function for adding options to the dropdown, select element reflecting the
   * charts, based upon chart titles of the charts. Also binding a
   * change event handler to the dropdown element for hide/unhide of the
   * div holding the chart
   * @param {Element} dropdownElem
   */
  let fillOptionsForDropdownElement = (dropdownElem) => {

    let labelElem = document.getElementsByClassName('label')[0];
    
    //Now the charts have been loaded, loop over the div's to retrieve chart
    //titles and create succesively option elements for the dropdown
    for (let chartDiv of chartHolder.children) {
      let hash = chartDiv.id.substr(prefixId.length);
      // search for the chart title, get the first element found.
      let title = chartDiv.querySelector('text.highcharts-title')
        .lastElementChild.innerHTML;
      let option = createOptionForDropdown(hash, title);
      // add the option element to the dropwdown
      dropdownElem.appendChild(option);
    }

    // set selected option
    dropdownElem.options[0].selected = true;
    // bind the change event to it
    dropdownElem.onchange = changeEventHandler;

    // Initially Update the text of the overlay dropdown to the current
    // chart title
    labelElem.innerHTML = dropdownElem.selectedOptions[0].innerText;
  };

  /**
   *
   * @param {number} threshold - The number of node to find in order to
   * return true or false
   * @param {Element} parentElem - search for elements hold by the parentElem
   * @param {string} selector - for searching the element
   */
  let checkNumberOfNodes = (threshold, parentElem, selector) => {
    return threshold === parentElem.querySelectorAll(selector).length;
  };

  /** This is the first that executes. Loop over the chart hashes and insert
   *  DOM elements for the charts served from Highcharts Cloud
   */
  hashArr.map((hash, idx) => {
    createChartDiv(chartHolder, hash, !(idx < 1));
  });

  // start checking if all charts are loaded and update the dropdown menu
  // accordingly
  recursiveFunctionWithTimeout(
    50,
    () => checkNumberOfNodes(hashArr.length, chartHolder,'text.highcharts-title'),
    () => fillOptionsForDropdownElement(dd),
    100
  );

}, false);
