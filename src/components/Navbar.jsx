import { NavLink } from "react-router";



export default function navbar({bootstrap}){
    return (
        <div>
           <header>
            <nav className="border 100px solid black">
                <NavLink to="/"className={navclassName}>home</NavLink>
                 <NavLink to="/"className={navclassName}>LOGO</NavLink>
                  <NavLink to="/"className={navclassName}>About</NavLink>
                   <NavLink to="/"className={navclassName}>setting</NavLink>
                    <NavLink to="/"className={navclassName}>History</NavLink>
            </nav>
           </header>
        </div>
    )
}