
const getmonth = (month,year)=>{
    const start = new Date(year,month -1,1);
    const end = new Date(year,month,0,23,59,59);
    return {start,end};
}


const currentmonth = () =>{
    const now = new Date();
    return getmonth(now.getmonth() +1,now.getFullYear());
}


const format = (amount,currency = "INR")=>{
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}



const saving = (income,expense)=>{
    if(income === 0)return 0;
    return Math.round(((income-expense)/income)*100);
}
const getLastmonth = (n = 6) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return months;
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

module.exports = {getmonth, currentmonth, format, saving, getLastmonth, MONTH_NAMES };