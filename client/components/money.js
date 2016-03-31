
export default function Money({ amount, abs }) {
  const negative = !abs && amount < 0;

  amount = Math.abs(amount);
  amount = parseInt(amount) / 100;
  amount = amount.toFixed(2);
  amount = amount.toString();
  amount = amount.replace(/\B(?=(\d{3})+(?!\d))/g, ','); // add ,s

  return <span className={`
    money
    ${negative ? 'money--negative' : 'money--positive'}
  `}>
    ${amount}
  </span>;
}
