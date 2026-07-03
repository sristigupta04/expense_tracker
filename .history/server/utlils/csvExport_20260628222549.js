
const getmonth = (month,year)=>{
    const start = new Date(year,month -1,1);
    const end = new Date(year,month,0,23,59,59);
    return {start,end};
}


const currentmonth = () =>{
    const now = new Date();
    return getmonth(now.getmonth() +1,now.getFullYear());
}