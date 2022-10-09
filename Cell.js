
class Cell{
    constructor(x, y, color, head, next, state, idx) {
        this.x = x;
        this.y = y;
        this.color = color || 0;
        this.head = head || this;
        this.next = next;
        this.state = state;
        this.qi = {};
        this.idx = idx;

        this.initQi();
    }

    initQi(){
        let x = this.x;
        let y = this.y;
        if(y-1>=0){
            let idx = this.state.xy2idx(x,y-1);
            if(!this.state.cellMap[idx]){
                this.qi[idx] = true;
            }
        }
        if(y+1<this.state.boardWidth){
            let idx = this.state.xy2idx(x,y+1);
            if(!this.state.cellMap[idx]){
                this.qi[idx] = true;
            }
        }
        if(x-1>=0){
            let idx = this.state.xy2idx(x-1,y);
            if(!this.state.cellMap[idx]){
                this.qi[idx] = true;
            }
        }
        if(x+1<this.state.boardWidth){
            let idx = this.state.xy2idx(x+1,y);
            if(!this.state.cellMap[idx]){
                this.qi[idx] = true;
            }
        }
        
    }

    clone(){
        return new Cell(this.x, this.y, this.color, this.head, this.next, this.state, this.idx);
    }

    mergeBlock(cell2){
        
        for(let idx2 in cell2.qi){
            if(idx2 == this.idx){
                delete cell2.qi[idx2];
                for(let idx in this.qi){
                    cell2.qi[idx] = true;
                }
                this.qi = cell2.qi;

                let cell = this;
                while(cell.next){
                    cell = cell.next;
                }
                cell.next = cell2;

                return true;
            }
        }

        return false;

    }

    deleteQi(cell2){
        for(let idx in this.qi){
            if(idx == cell2.idx){
                delete this.qi[idx];
                return true;
            }
        }
        return false;
    }

    addQi(cell3){

        let cell2 = cell3;
        do{
            let cell = this;
            do{
                if(cell.idx-this.state.boardWidth == cell2.idx || cell.idx+this.state.boardWidth == cell2.idx || cell.x>0&&cell.idx-1 == cell2.idx || cell.x<this.state.boardWidth-1&&cell.idx+1 == cell2.idx){
                    this.qi[cell2.idx] = true;
                    break;
                }
                cell = cell.next;
            }while(cell);
            cell2 = cell2.next;
        }while(cell2);

    }

    getQiCount(){

        let count = 0;
        for(let idx in this.qi){
            count ++;
        }

        return count;
    }

    getCount(){

        let count = 1;
        let cell = this;
        while(cell.next){
            count ++;
            cell = cell.next;
        }

        return count;
    }

}

export default Cell;