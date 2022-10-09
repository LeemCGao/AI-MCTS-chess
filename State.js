import Cell from "./Cell";

class State{
    constructor(param) {
        this.cellMap = {};
        this.blocks = [];
        this.boardWidth = param.boardWidth;
        this.lastMove = param.lastMove;
    }

    xy2idx(x,y){
        return y*this.boardWidth+x;
    }

    idx2xy(idx){
        let x = idx%this.boardWidth;
        let y = (idx-x)/this.boardWidth;
        return [x,y];
    }

    clone(){
        let state = new State({
            boardWidth: this.boardWidth,
            lastMove: this.lastMove
        });
        state.jie = this.jie;

        let cellMap = {};
        for(let idx in this.cellMap){
            cellMap[idx] = this.cellMap[idx];
        }
        state.cellMap = cellMap;

        let blocks = [];
        for(let i=0; i<this.blocks.length; i++){
            let head = this.blocks[i];
            let head2 = new Cell(head.x, head.y, head.color, null, null, state, head.idx);

            let qi = {};
            for(let idxQi in head.qi){
                qi[idxQi] = head.qi[idxQi];
            }
            head2.qi = qi;

            let head3 = head2;

            while(head.next){
                head = head.next;
                let child2 = new Cell(head.x, head.y, head.color, null, null, state, head.idx);
                head3.next = child2;
                head3 = child2;
            }

            blocks.push(head2);
        }
        state.blocks = blocks;

        return state;

    }

    checkPiece(x,y,color){
        let state = this.clone();
        let result = state.placePiece(x,y,color);
        if(result){
            state.result = result;
            return state;
        }else{
            return false;
        }
    }

    placePiece(x,y,color){

        let idx = this.xy2idx(x,y);
        let cell = new Cell(x,y,color,null,null,this,idx);

        this.cellMap[idx] = color;

        //合并
        let hasMerge = false;
        for(let i = 0; i < this.blocks.length; i++) {

            if(this.blocks[i].color !== color) {
                continue;
            }

           let merge = cell.mergeBlock(this.blocks[i]);
           if(merge){
                hasMerge = true;
                this.blocks.splice(i,1);
                i--;
           }
        }

        this.blocks.push(cell);

        let jie;
        //判断提
        let hasKill = false;
        for(let i = 0; i < this.blocks.length; i++) {
            if(this.blocks[i].color === color) {
                continue;
            }

            let del = this.blocks[i].deleteQi(cell);
            if(del){
                let qiCount = this.blocks[i].getQiCount();
                if(qiCount === 0) {

                    let ziCount = this.blocks[i].getCount();

                    //jie
                    if(this.jie){
                        if(cell.idx == this.jie.idx){
                            
                            if(ziCount===1){
                                return false;
                            }
                        }
                    }

                    hasKill = true;

                    if(ziCount===1){
                        jie = this.blocks[i];
                    }

                    //加气
                    for(let j = 0; j < this.blocks.length; j++) {

                        if(this.blocks[j].color !== color) {
                            continue;
                        }
            
                        this.blocks[j].addQi(this.blocks[i]);
                    }

                    let cellKilled = this.blocks[i];
                    do{
                        delete this.cellMap[cellKilled.idx];
                        cellKilled = cellKilled.next;
                    }while(cellKilled);
                   
                    this.blocks.splice(i, 1);
                    i--;
                }
            }
            
        }

        let cellQi = cell.getQiCount();
        let hasQi = cellQi>0;

        if(!hasKill && !hasQi){
            return false;
        }else{
            this.lastMove = cell;
            this.jie = jie;

            let result = 1;
            if(!hasKill){
                let fillEye = this.checkEye(cell);
                if(fillEye){
                    result = 2;
                }else{
                    if(cellQi === 1){
                        result = 3;
                    }
                }

            }

            return result;
        }

    }

    checkEye(cell){
        let x = cell.x;
        let y = cell.y;
        let color = cell.color;
        let isEye = true;

        if(y-1>=0){
            let idx = this.xy2idx(x,y-1);
            if(this.cellMap[idx]!=color){
                return false;
            }
        }
        if(y+1<this.boardWidth){
            let idx = this.xy2idx(x,y+1);
            if(this.cellMap[idx]!=color){
                return false;
            }
        }
        if(x-1>=0){
            let idx = this.xy2idx(x-1,y);
            if(this.cellMap[idx]!=color){
                return false;
            }
        }
        if(x+1<this.boardWidth){
            let idx = this.xy2idx(x+1,y);
            if(this.cellMap[idx]!=color){
                return false;
            }
        }

        let corner = 0;
        let enemy = 0;
        if(x-1>=0){
            if(y-1>=0){
                corner++;
                let idx = this.xy2idx(x-1,y-1);
                if(this.cellMap[idx]==-color){
                    enemy++;
                }
            }
            if(y+1<this.boardWidth){
                corner++;
                let idx = this.xy2idx(x-1,y+1);
                if(this.cellMap[idx]==-color){
                    enemy++;
                }
            }
        }
        if(x+1<this.boardWidth){
            if(y-1>=0){
                corner++;
                let idx = this.xy2idx(x+1,y-1);
                if(this.cellMap[idx]==-color){
                    enemy++;
                }
            }
            if(y+1<this.boardWidth){
                corner++;
                let idx = this.xy2idx(x+1,y+1);
                if(this.cellMap[idx]==-color){
                    enemy++;
                }
            }
        }

        if(enemy/corner>=0.5){
            return false;
        }else{
            return true;
        }

    }

}

export default State;