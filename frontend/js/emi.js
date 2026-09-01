/**
 * emi.js — EMI calculator for finance.html
 * Indicative estimate only; see disclaimer rendered alongside results.
 */

function calculateEMI(principal, annualRatePercent, tenureMonths) {
  const monthlyRate = annualRatePercent / 12 / 100;
  if (monthlyRate === 0) {
    const emi = principal / tenureMonths;
    return { emi, totalPayable: principal, totalInterest: 0 };
  }
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - principal;
  return { emi, totalPayable, totalInterest };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("emi-form");
  if (!form) return;

  const priceInput = document.getElementById("emi-price");
  const downInput = document.getElementById("emi-down");
  const rateInput = document.getElementById("emi-rate");
  const tenureInput = document.getElementById("emi-tenure");

  const rateOut = document.getElementById("emi-rate-out");
  const tenureOut = document.getElementById("emi-tenure-out");
  const downOut = document.getElementById("emi-down-out");

  const loanAmountOut = document.getElementById("emi-loan-amount");
  const monthlyOut = document.getElementById("emi-monthly");
  const interestOut = document.getElementById("emi-interest");
  const totalOut = document.getElementById("emi-total");

  function render() {
    const price = parseFloat(priceInput.value) || 0;
    const down = parseFloat(downInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const tenure = parseInt(tenureInput.value, 10) || 1;

    const loanAmount = Math.max(price - down, 0);
    const { emi, totalPayable, totalInterest } = calculateEMI(loanAmount, rate, tenure);

    rateOut.textContent = rate.toFixed(1) + "%";
    tenureOut.textContent = tenure + " months";
    downOut.textContent = formatINR(down);

    loanAmountOut.textContent = formatINR(loanAmount);
    monthlyOut.textContent = formatINR(emi);
    interestOut.textContent = formatINR(totalInterest);
    totalOut.textContent = formatINR(totalPayable);
  }

  [priceInput, downInput, rateInput, tenureInput].forEach((input) => {
    input.addEventListener("input", render);
  });

  render();
});
