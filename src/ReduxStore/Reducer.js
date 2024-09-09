import { createStore} from "redux"
import { SUM } from "./actionper"
const initialstate={
    count:100
}

 function Reducer(state=initialstate,action){
        switch(action.type){
            case SUM : return{
                ...state,count:state.count+1
            } 
        }
}
const Store=createStore(Reducer)
export default Store