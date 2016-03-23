
export default function Money({ amount, abs, dollars }) {
  const negative = !abs && amount < 0;

  amount = Math.abs(amount);
  amount = parseInt(amount) / 100;
  Math.round(2);
  amount = dollars ? Math.round(amount, 0) : amount.toFixed(2);
  amount = amount.toString();
  amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // add ,s

  return <span className={`
    money
    ${negative ? 'money--negative' : 'money--positive'}
  `}>
    ${amount}
  </span>;
}
