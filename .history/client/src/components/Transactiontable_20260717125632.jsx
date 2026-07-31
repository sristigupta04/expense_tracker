


function App(){
    const[transactions,setTransactions] = useState([]);
         
    <table>
        <thead>
            <tr>
          <th>Title</th>
            <th>category</th>
            <th>amount</th>
            <th>type</th>
            <th>Date</th>
            <th></th>
          </tr>
            
        </thead>
    
<tbody>
    transactions.map((transaction)=>{
        <tr key={transaction.id}>
            <td>{transaction.title}</td>
            <td>{transaction.category}</td>
            <td>{transaction.amount}</td>
            <td>{transaction.type}</td>
            <td>{transaction.date}</td>
            <td></td>
        </tr>

    });
    </tbody>
    </table>
}