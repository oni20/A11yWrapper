function A11yProgressStepper(element, options) {

  // Assign container
  this.progressStepperContainer = element;

  // Initiate objects


  // Apply settings from Configuration object
  this.steps = options ? options.data || [] : [];
  this.SRText = options ? options.SRText || {} : {};

  // Library default content
  this.libraryContent = {
    step: 'Step',
    of: 'of'
  }

  // Register Utility class


  // Create Stepper
  if (this.steps.length > 0) {
    this.createStepper();
  } else {
    alert('Stepper information is missing');
  }
}

// Create Clear button
A11yProgressStepper.prototype.createStepper = function () {
  let context = this,
    currentStep = context.steps.findIndex(item => item.status === 'active') + 1,
    currentStepInfo = context.SRText.currentStepInfo
      ? `${context.libraryContent.step} ${currentStep} ${context.libraryContent.of} ${context.steps.length}: ${context.SRText.currentStepInfo}`
      : "",
    template = `<span class="sr-only">${currentStepInfo}</span><div aria-label="progress"><ul class="step-indicator">`;

  // Update document title    
  context.steps.map((step, index) => {
    let stepName = step.link && step.link !== "" && step.status !== "" && step.status !== "active"
      ? `<a href="${step.link}">${step.name}</a>`
      : step.name;

    let indicatorLine = index < context.steps.length - 1
      ? `<div class="indicator-line ${step.status}"></div>`
      : "";

    let statusSRText = context.SRText[step.status]
      ? `${context.libraryContent.step} ${index + 1} ${context.SRText[step.status]}`
      : "";

    let ariaCurrent = step.status === 'active' ? "aria-current='step'" : "";

    template +=
      `<li class="step ${step.status}" ${ariaCurrent}>
      <div class="step-icon" aria-hidden=true></div>
      <p>
          <span class="sr-only">${statusSRText}</span>
          ${stepName}
      </p>
    </li>${indicatorLine}`;
  });

  template += '</ul></div>';
  context.progressStepperContainer.innerHTML = template;
};

export default A11yProgressStepper;
