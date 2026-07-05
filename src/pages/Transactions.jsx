









export default  function Transaction(){
    const [title, setTitle] = useState("");
const [amount, setAmount] = useState("");
const [category, setCategory] = useState("");
const [date, setDate] = useState("");
const [type, setType] = useState("");
const [transactions, setTransactions] = useState([]);



return (
    
    {transaction.map((item) => (
  <div key={item.id}>
    <h3>{item.title}</h3>
    <p>₹ {item.amount}</p>
    <p>{item.category}</p>
    <p>{item.date}</p>
    <p>{item.type}</p>

    <button>Edit</button>
    <button>Delete</button>
  </div>
))}
)
}